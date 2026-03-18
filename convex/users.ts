import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./security";

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
