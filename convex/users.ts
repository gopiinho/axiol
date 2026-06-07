import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { requireSession, getSession } from "./security";
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

    const profileImageUrl = user.profileImageId
      ? await ctx.storage.getUrl(user.profileImageId)
      : null;
    const coverImageUrl = user.coverImageId ? await ctx.storage.getUrl(user.coverImageId) : null;

    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      profileImageUrl,
      coverImageUrl,
      theme: user.theme,
      accentColor: user.accentColor,
      storeName: user.storeName,
      instagramUrl: user.instagramUrl,
      youtubeUrl: user.youtubeUrl,
      websiteUrl: user.websiteUrl,
    };
  },
});

export const getPublicStore = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return null;

    const profileImageUrl = user.profileImageId
      ? await ctx.storage.getUrl(user.profileImageId)
      : null;
    const coverImageUrl = user.coverImageId ? await ctx.storage.getUrl(user.coverImageId) : null;

    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("createdBy", user._id).eq("status", "published"))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      products.map(async (product) => {
        const items = await ctx.db
          .query("productItems")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .order("asc")
          .collect();

        const coverUrl = product.coverImageId
          ? await ctx.storage.getUrl(product.coverImageId)
          : null;

        return {
          ...product,
          coverImageUrl: coverUrl,
          items,
        };
      })
    );

    return {
      user: {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        profileImageUrl,
        coverImageUrl,
        theme: user.theme,
        accentColor: user.accentColor,
        storeName: user.storeName,
        instagramUrl: user.instagramUrl,
        youtubeUrl: user.youtubeUrl,
        websiteUrl: user.websiteUrl,
      },
      products: enriched,
    };
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const session = await getSession(ctx);
    if (!session) return null;

    const { user } = session;

    const profileImageUrl = user.profileImageId
      ? await ctx.storage.getUrl(user.profileImageId)
      : null;
    const coverImageUrl = user.coverImageId ? await ctx.storage.getUrl(user.coverImageId) : null;

    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      profileImageUrl,
      coverImageUrl,
      theme: user.theme,
      accentColor: user.accentColor,
      storeName: user.storeName,
      instagramUrl: user.instagramUrl,
      youtubeUrl: user.youtubeUrl,
      websiteUrl: user.websiteUrl,
      accountType: user.accountType,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
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
    theme: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    storeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const updates: Record<string, string | undefined> = {};
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
    if (args.theme !== undefined) {
      updates.theme = args.theme;
    }
    if (args.accentColor !== undefined) {
      updates.accentColor = args.accentColor;
    }
    if (args.storeName !== undefined) {
      updates.storeName = args.storeName.trim();
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
        "Username must be 3-30 characters, lowercase letters, numbers, and underscores only"
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
  const user = await ctx.db.get(userId);
  if (user?.profileImageId) {
    await ctx.storage.delete(user.profileImageId);
  }
  if (user?.coverImageId) {
    await ctx.storage.delete(user.coverImageId);
  }

  const igConfigs = await ctx.db
    .query("instagramConfig")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const config of igConfigs) {
    await ctx.db.delete(config._id);
  }

  const products = await ctx.db
    .query("products")
    .withIndex("by_user", (q) => q.eq("createdBy", userId))
    .collect();
  for (const product of products) {
    const items = await ctx.db
      .query("productItems")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(product._id);
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
