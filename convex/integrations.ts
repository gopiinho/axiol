import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireSession, getSession } from "./security";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type IntegrationProvider = "instagram" | "google_calendar";
type IntegrationStatus = "connected" | "disconnected" | "expiring_soon" | "expired" | "error";

function computeInstagramStatus(
  currentStatus: IntegrationStatus,
  tokenExpiresAt?: number
): IntegrationStatus {
  if (currentStatus === "error") return "error";
  if (!tokenExpiresAt) return currentStatus;

  const now = Date.now();

  if (tokenExpiresAt <= now) return "expired";
  if (tokenExpiresAt - now < SEVEN_DAYS_MS) return "expiring_soon";

  return currentStatus;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const session = await getSession(ctx);
    if (!session) return [];

    const { userId } = session;

    const rows = await ctx.db
      .query("integrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const config = await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return rows.map((row) => {
      let computedStatus: IntegrationStatus = row.status;
      let tokenExpiresAt: number | undefined;

      if (row.provider === "instagram") {
        computedStatus = computeInstagramStatus(computedStatus, config?.tokenExpiresAt);
        tokenExpiresAt = config?.tokenExpiresAt;
      }

      return { ...row, computedStatus, tokenExpiresAt };
    });
  },
});

export const getByProvider = query({
  args: {
    provider: v.union(v.literal("instagram"), v.literal("google_calendar")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const row = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) => q.eq("userId", userId).eq("provider", args.provider))
      .first();

    if (!row) return null;

    let computedStatus: IntegrationStatus = row.status;
    let tokenExpiresAt: number | undefined;

    if (row.provider === "instagram") {
      const config = await ctx.db
        .query("instagramConfig")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      computedStatus = computeInstagramStatus(computedStatus, config?.tokenExpiresAt);
      tokenExpiresAt = config?.tokenExpiresAt;
    }

    return { ...row, computedStatus, tokenExpiresAt };
  },
});

export const upsert = internalMutation({
  args: {
    userId: v.id("users"),
    provider: v.union(v.literal("instagram"), v.literal("google_calendar")),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("expiring_soon"),
      v.literal("expired"),
      v.literal("error")
    ),
    displayName: v.optional(v.string()),
    externalId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        displayName: args.displayName,
        externalId: args.externalId,
        errorMessage: args.errorMessage,
        lastSyncAt: now,
        ...(args.status === "connected" && !existing.connectedAt ? { connectedAt: now } : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("integrations", {
      userId: args.userId,
      provider: args.provider,
      status: args.status,
      displayName: args.displayName,
      externalId: args.externalId,
      errorMessage: args.errorMessage,
      lastSyncAt: now,
      connectedAt: args.status === "connected" ? now : undefined,
    });
  },
});

export const disconnect = mutation({
  args: {
    provider: v.union(v.literal("instagram"), v.literal("google_calendar")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) => q.eq("userId", userId).eq("provider", args.provider))
      .first();

    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      status: "disconnected" as const,
      lastSyncAt: Date.now(),
      errorMessage: undefined,
    });

    return existing._id;
  },
});

export const markError = mutation({
  args: {
    provider: v.union(v.literal("instagram"), v.literal("google_calendar")),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) => q.eq("userId", userId).eq("provider", args.provider))
      .first();

    const now = Date.now();

    if (!existing) {
      return await ctx.db.insert("integrations", {
        userId,
        provider: args.provider,
        status: "error" as const,
        errorMessage: args.errorMessage,
        lastSyncAt: now,
      });
    }

    await ctx.db.patch(existing._id, {
      status: "error" as const,
      errorMessage: args.errorMessage,
      lastSyncAt: now,
    });

    return existing._id;
  },
});

export const syncStatus = mutation({
  args: {
    provider: v.optional(v.union(v.literal("instagram"), v.literal("google_calendar"))),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const provider = args.provider as IntegrationProvider | undefined;

    if (provider) {
      const row = await ctx.db
        .query("integrations")
        .withIndex("by_user_provider", (q) => q.eq("userId", userId).eq("provider", provider))
        .first();

      if (!row) return null;

      if (row.provider === "instagram") {
        const config = await ctx.db
          .query("instagramConfig")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();

        const computedStatus = computeInstagramStatus(row.status, config?.tokenExpiresAt);

        if (computedStatus !== row.status) {
          await ctx.db.patch(row._id, {
            status: computedStatus,
            lastSyncAt: Date.now(),
          });
        }
      }

      return row._id;
    }

    const rows = await ctx.db
      .query("integrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const row of rows) {
      if (row.provider === "instagram") {
        const config = await ctx.db
          .query("instagramConfig")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();

        const computedStatus = computeInstagramStatus(row.status, config?.tokenExpiresAt);

        if (computedStatus !== row.status) {
          await ctx.db.patch(row._id, {
            status: computedStatus,
            lastSyncAt: Date.now(),
          });
        }
      }
    }

    return rows.map((r) => r._id);
  },
});

export const backfillInstagramIntegrations = internalMutation({
  handler: async (ctx) => {
    const configs = await ctx.db.query("instagramConfig").collect();

    let count = 0;
    const now = Date.now();

    for (const config of configs) {
      const existing = await ctx.db
        .query("integrations")
        .withIndex("by_user_provider", (q) =>
          q.eq("userId", config.userId).eq("provider", "instagram")
        )
        .first();

      if (existing) continue;

      const isExpired = config.tokenExpiresAt <= now;

      await ctx.db.insert("integrations", {
        userId: config.userId,
        provider: "instagram" as const,
        status: isExpired ? ("expired" as const) : ("connected" as const),
        connectedAt: config.lastTokenRefresh,
        displayName: config.instagramUsername,
        externalId: config.instagramAccountId,
        lastSyncAt: now,
      });

      count++;
    }

    return { created: count };
  },
});
