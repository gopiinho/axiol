import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  internalAction,
  MutationCtx,
  QueryCtx,
  ActionCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { requireAdminSession } from "./security";

const MAX_DMS_PER_HOUR = 195;
const DM_SPACING_MS = 2000;
const MAX_RETRY_ATTEMPTS = 3;

export const createDmJob = mutation({
  args: {
    sourceSecret: v.string(),
    instagramUserId: v.string(),
    username: v.string(),
    sectionId: v.id("sections"),
    reelId: v.string(),
    triggerType: v.union(v.literal("comment"), v.literal("dm")),
    triggerId: v.string(),
    maxItemsInDM: v.number(),
    includeWebsiteLink: v.boolean(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.INSTAGRAM_WEBHOOK_INTERNAL_SECRET;
    if (!expectedSecret || args.sourceSecret !== expectedSecret) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("dmJobs")
      .withIndex("by_user_reel", (q) =>
        q.eq("instagramUserId", args.instagramUserId).eq("reelId", args.reelId)
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "processing"),
          q.eq(q.field("status"), "sent")
        )
      )
      .first();

    if (existing) {
      console.log("Duplicate job detected - skipping");
      return null;
    }

    const jobId = await ctx.db.insert("dmJobs", {
      instagramUserId: args.instagramUserId,
      username: args.username,
      sectionId: args.sectionId,
      reelId: args.reelId,
      maxItemsInDM: args.maxItemsInDM,
      includeWebsiteLink: args.includeWebsiteLink,
      status: "pending",
      createdAt: Date.now(),
      attemptCount: 0,
      triggerType: args.triggerType,
      triggerId: args.triggerId,
    });

    await ensureWorkerRunning(ctx);

    return jobId;
  },
});

export const processDmQueue = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Worker running...");

    const rateLimitOk = await ctx.runMutation(
      internal.dmQueue.checkAndReserveSlot
    );

    if (!rateLimitOk) {
      console.log("Rate limited - will retry in 10 seconds");
      await ctx.scheduler.runAfter(10000, internal.dmQueue.processDmQueue);
      return;
    }

    const job = await ctx.runQuery(internal.dmQueue.getNextPendingJob);

    if (!job) {
      console.log("Queue empty - worker stopping");
      await ctx.runMutation(internal.dmQueue.markWorkerInactive);
      return;
    }

    console.log(`Processing job ${job._id} for @${job.username}`);

    await ctx.runMutation(internal.dmQueue.markJobProcessing, {
      jobId: job._id,
    });

    const result = await sendDM(ctx, job);

    if (result.success) {
      await ctx.runMutation(internal.dmQueue.markJobSent, {
        jobId: job._id,
        messageText: result.messageText!,
      });
      console.log(`Job ${job._id} sent successfully`);
    } else {
      await ctx.runMutation(internal.dmQueue.markJobFailed, {
        jobId: job._id,
        error: result.error!,
      });
      console.log(`Job ${job._id} failed: ${result.error}`);
    }

    await ctx.scheduler.runAfter(
      DM_SPACING_MS,
      internal.dmQueue.processDmQueue
    );
  },
});

export const checkAndReserveSlot = internalMutation({
  args: {},
  handler: async (ctx) => {
    const state = await getRateLimitState(ctx);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentDMs = state.dmsSentInLastHour.filter(
      (ts: number) => ts > oneHourAgo
    );

    if (state.lastDmSentAt && now - state.lastDmSentAt < 1000) {
      return false;
    }

    if (recentDMs.length >= MAX_DMS_PER_HOUR) {
      return false;
    }

    return true;
  },
});

export const getNextPendingJob = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("dmJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("asc")
      .first();
  },
});

export const markJobProcessing = internalMutation({
  args: { jobId: v.id("dmJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "processing",
      lastAttemptAt: Date.now(),
    });
  },
});

export const markJobSent = internalMutation({
  args: {
    jobId: v.id("dmJobs"),
    messageText: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const job = await ctx.db.get(args.jobId);
    if (!job) return;

    await ctx.db.patch(args.jobId, {
      status: "sent",
      sentAt: now,
      messageText: args.messageText,
    });

    await ctx.db.insert("dmLogs", {
      instagramUserId: job.instagramUserId,
      username: job.username,
      sectionId: job.sectionId,
      messageText: args.messageText,
      success: true,
      timestamp: now,
    });

    const state = await getRateLimitState(ctx);
    await ctx.db.patch(state._id, {
      dmsSentInLastHour: [...state.dmsSentInLastHour, now],
      lastDmSentAt: now,
    });
  },
});

export const markJobFailed = internalMutation({
  args: {
    jobId: v.id("dmJobs"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return;

    const newAttemptCount = job.attemptCount + 1;

    await ctx.db.insert("dmLogs", {
      instagramUserId: job.instagramUserId,
      username: job.username,
      sectionId: job.sectionId,
      messageText: job.messageText ?? "",
      success: false,
      error: args.error,
      timestamp: Date.now(),
    });

    if (newAttemptCount >= MAX_RETRY_ATTEMPTS) {
      await ctx.db.patch(args.jobId, {
        status: "failed",
        error: args.error,
        attemptCount: newAttemptCount,
      });
    } else {
      await ctx.db.patch(args.jobId, {
        status: "pending",
        error: args.error,
        attemptCount: newAttemptCount,
      });
    }
  },
});

export const markWorkerInactive = internalMutation({
  args: {},
  handler: async (ctx) => {
    const state = await getRateLimitState(ctx);
    await ctx.db.patch(state._id, {
      workerActive: false,
    });
  },
});

async function sendDM(
  ctx: ActionCtx,
  job: Doc<"dmJobs">
): Promise<{ success: boolean; error?: string; messageText?: string }> {
  try {
    const config = await ctx.runQuery(internal.instagram.getConfigInternal);
    if (!config) {
      return { success: false, error: "Not configured" };
    }

    const messageData = await ctx.runQuery(
      internal.instagram.generateDMMessageForJob,
      {
      sectionId: job.sectionId,
      maxItems: job.maxItemsInDM,
      includeWebsiteLink: job.includeWebsiteLink,
      }
    );

    let messageText = messageData.message;

    if (messageText.length > 1000) {
      messageText =
        messageText.substring(0, 950) + "\n\n... (visit link for full list)";
    }

    const url = `https://graph.instagram.com/v24.0/me/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: job.instagramUserId },
        message: { text: messageText },
        access_token: config.accessToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || "Unknown error",
      };
    }

    return { success: true, messageText };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function getRateLimitState(
  ctx: MutationCtx | QueryCtx
): Promise<Doc<"dmRateLimitState">> {
  const state = await ctx.db.query("dmRateLimitState").first();

  if (state) return state;

  if (!("scheduler" in ctx)) {
    return {
      _id: "virtual" as Id<"dmRateLimitState">,
      _creationTime: Date.now(),
      dmsSentInLastHour: [],
      lastDmSentAt: undefined,
      workerLastRun: undefined,
      workerActive: false,
    };
  }

  const id = await ctx.db.insert("dmRateLimitState", {
    dmsSentInLastHour: [],
    workerActive: false,
  });

  const created = await ctx.db.get(id);
  if (!created) throw new Error("Failed to create rate limit state");

  return created;
}

async function ensureWorkerRunning(ctx: MutationCtx): Promise<void> {
  const state = await getRateLimitState(ctx);

  if (!state.workerActive) {
    await ctx.db.patch(state._id, { workerActive: true });
    await ctx.scheduler.runAfter(0, internal.dmQueue.processDmQueue);
    console.log("Worker started");
  }
}

export const kickoffWorker = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);
    await ensureWorkerRunning(ctx);
    return { message: "Worker started" };
  },
});

export const getQueueStats = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);

    const pending = await ctx.db
      .query("dmJobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const processing = await ctx.db
      .query("dmJobs")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();

    const sent = await ctx.db
      .query("dmJobs")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .collect();

    const failed = await ctx.db
      .query("dmJobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();

    const state = await getRateLimitState(ctx);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentDMs = state.dmsSentInLastHour.filter(
      (ts: number) => ts > oneHourAgo
    );

    const estimatedMinutesToClear =
      pending.length > 0
        ? Math.ceil((pending.length * DM_SPACING_MS) / 60000)
        : 0;

    return {
      pending: pending.length,
      processing: processing.length,
      sent: sent.length,
      failed: failed.length,
      dmsSentInLastHour: recentDMs.length,
      workerActive: state.workerActive,
      estimatedMinutesToClear,
    };
  },
});
