import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { requireSession } from "./security";
import { Id } from "./_generated/dataModel";

const TRIAL_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 days

const RESERVED_USERNAMES = [
  "login",
  "signup",
  "dashboard",
  "api",
  "privacy",
  "terms",
  "data-deletion",
  "list",
  "admin",
  "settings",
  "about",
  "help",
  "support",
  "contact",
];

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return null;

    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      instagramUrl: user.instagramUrl,
      youtubeUrl: user.youtubeUrl,
      websiteUrl: user.websiteUrl,
    };
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireSession(ctx);
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      instagramUrl: user.instagramUrl,
      youtubeUrl: user.youtubeUrl,
      websiteUrl: user.websiteUrl,
      accountType: user.accountType,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
      createdAt: user.createdAt,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const updates: Record<string, string> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 1) throw new Error("Name is required");
      updates.name = name;
    }
    if (args.bio !== undefined) {
      updates.bio = args.bio.trim();
    }
    if (args.avatarUrl !== undefined) {
      updates.avatarUrl = args.avatarUrl;
    }
    if (args.instagramUrl !== undefined) {
      updates.instagramUrl = args.instagramUrl.trim();
    }
    if (args.youtubeUrl !== undefined) {
      updates.youtubeUrl = args.youtubeUrl.trim();
    }
    if (args.websiteUrl !== undefined) {
      updates.websiteUrl = args.websiteUrl.trim();
    }

    await ctx.db.patch(userId, updates);
  },
});

export const createProfile = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const betterAuthId = identity.subject;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
      .first();

    if (existing) {
      return existing._id;
    }

    const username = args.username.toLowerCase().trim();
    const usernameRegex = /^[a-z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      throw new Error(
        "Username must be 3-30 characters, lowercase letters, numbers, and underscores only",
      );
    }

    if (RESERVED_USERNAMES.includes(username)) {
      throw new Error("This username is not available");
    }

    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existingUsername) {
      throw new Error("This username is already taken");
    }

    const now = Date.now();

    return await ctx.db.insert("users", {
      betterAuthId,
      email: identity.email ?? "",
      username,
      name: identity.name ?? "",
      bio: "",
      accountType: "creator",
      trialStartedAt: now,
      trialEndsAt: now + TRIAL_DURATION,
      subscriptionStatus: "trial",
      createdAt: now,
    });
  },
});

export const checkUsernameAvailable = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const username = args.username.toLowerCase().trim();

    const usernameRegex = /^[a-z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return { available: false, reason: "Invalid username format" };
    }

    if (RESERVED_USERNAMES.includes(username)) {
      return { available: false, reason: "This username is not available" };
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existing) {
      return { available: false, reason: "This username is already taken" };
    }

    return { available: true };
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);

    await deleteAllUserData(ctx, userId);

    await ctx.db.delete(userId);
  },
});

async function deleteAllUserData(ctx: MutationCtx, userId: Id<"users">) {
  const igConfigs = await ctx.db
    .query("instagramConfig")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const config of igConfigs) {
    await ctx.db.delete(config._id);
  }

  const collections = await ctx.db
    .query("collections")
    .withIndex("by_user", (q) => q.eq("createdBy", userId))
    .collect();
  for (const collection of collections) {
    const items = await ctx.db
      .query("items")
      .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(collection._id);
  }

  const mappings = await ctx.db
    .query("reelMappings")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const mapping of mappings) {
    await ctx.db.delete(mapping._id);
  }

  const jobs = await ctx.db
    .query("dmJobs")
    .withIndex("by_owner", (q) => q.eq("userId", userId))
    .collect();
  for (const job of jobs) {
    await ctx.db.delete(job._id);
  }

  const rateStates = await ctx.db
    .query("dmRateLimitState")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const state of rateStates) {
    await ctx.db.delete(state._id);
  }

  const commentLogs = await ctx.db
    .query("commentLogs")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const log of commentLogs) {
    await ctx.db.delete(log._id);
  }

  const dmLogs = await ctx.db
    .query("dmLogs")
    .withIndex("by_owner", (q) => q.eq("userId", userId))
    .collect();
  for (const log of dmLogs) {
    await ctx.db.delete(log._id);
  }
}
