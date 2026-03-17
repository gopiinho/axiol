import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./security";

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
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const { user } = await requireSession(ctx, args.token);
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
    token: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx, args.token);

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
