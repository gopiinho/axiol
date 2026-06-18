import { v } from "convex/values";
import {
  mutation,
  query,
  action,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { getSession } from "./security";
import { requireSession } from "./security";
import { validateReelMappingInput } from "../lib/validators/instagram-mappings";
import { decryptToken, encryptToken } from "./lib/instagramCrypto";

const WEBHOOK_SECRET = process.env.INSTAGRAM_INTERNAL_SECRET;

function assertWebhookSourceSecret(sourceSecret: string) {
  if (!WEBHOOK_SECRET || sourceSecret !== WEBHOOK_SECRET) {
    throw new Error("Unauthorized");
  }
}

function buildDmMessage({
  productType,
  productName,
  productUrl,
  items,
  maxItems,
  includeWebsiteLink,
  triggerType,
}: {
  productType: string;
  productName: string;
  productUrl: string;
  items?: Array<{ title?: string; price?: string; affiliateLink: string }>;
  maxItems?: number;
  includeWebsiteLink?: boolean;
  triggerType?: "comment" | "dm";
}) {
  if (productType !== "affiliate") {
    const message = `Hi,\n\nThanks for showing interest in "${productName}"\n\nHere is the link: ${productUrl}\n\nThank you`;
    return { message, itemCount: 0, characterCount: message.length };
  }

  const safeItems = items ?? [];
  const clamped = Math.min(Math.max(maxItems ?? 10, 1), 20);

  let message = `Hi! Check out "${productName}":\n\n`;

  if (includeWebsiteLink !== false) {
    message += `🔗 View full details: ${productUrl}\n\n`;
  }

  safeItems.slice(0, clamped).forEach((item, index) => {
    message += `${index + 1}. ${item.title || "Product"}`;
    if (item.price) {
      message += ` - ₹${item.price}`;
    }
    message += `\n👉 ${item.affiliateLink}\n\n`;
  });

  if (safeItems.length <= clamped) {
    message += `(Showing all ${safeItems.length} items)\n\n`;
  } else {
    message += `(Showing top ${clamped} items — visit link for more)\n\n`;
  }

  message += `💕 Thank you for your support! xoxo`;

  if (triggerType === "comment") {
    message += `\n\nDM me if you have any questions! ✨`;
  }

  return {
    message,
    itemCount: Math.min(safeItems.length, clamped),
    characterCount: message.length,
  };
}

export const saveConfig = mutation({
  args: {
    accessToken: v.string(),
    instagramAccountId: v.string(),
    instagramUsername: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const existing = await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const tokenExpiresAt = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;

    const data = {
      userId,
      accessToken: args.accessToken,
      instagramAccountId: args.instagramAccountId,
      instagramUsername: args.instagramUsername,
      lastTokenRefresh: Date.now(),
      tokenExpiresAt,
      rateLimitCallCount: 0,
      rateLimitResetTime: oneHourFromNow,
      lastApiCallTime: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("instagramConfig", data);
    }

    const integrationExisting = await ctx.db
      .query("integrations")
      .withIndex("by_user_provider", (q) => q.eq("userId", userId).eq("provider", "instagram"))
      .first();

    const integrationData = {
      userId,
      provider: "instagram" as const,
      status: "connected" as const,
      connectedAt: Date.now(),
      lastSyncAt: Date.now(),
      displayName: args.instagramUsername,
      externalId: args.instagramAccountId,
      errorMessage: undefined,
    };

    if (integrationExisting) {
      await ctx.db.patch(integrationExisting._id, {
        ...integrationData,
        ...(integrationExisting.connectedAt ? {} : { connectedAt: Date.now() }),
      });
    } else {
      await ctx.db.insert("integrations", integrationData);
    }
  },
});

export const setWebhookSubscribed = mutation({
  args: {
    instagramAccountId: v.string(),
    subscribed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const existing = await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!existing) return;
    await ctx.db.patch(existing._id, { webhookSubscribed: args.subscribed });
  },
});

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);
    return await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getConfigPublic = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);
    const config = await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!config) return null;

    return {
      instagramAccountId: config.instagramAccountId,
      instagramUsername: config.instagramUsername,
      tokenExpiresAt: config.tokenExpiresAt,
    };
  },
});

export const getConfigInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getUserByInstagramAccount = internalQuery({
  args: { instagramAccountId: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("instagramConfig")
      .withIndex("by_instagram_account", (q) => q.eq("instagramAccountId", args.instagramAccountId))
      .first();

    if (!config) return null;
    return { userId: config.userId, configId: config._id };
  },
});

export const getConfigByBetterAuthId = internalQuery({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) return null;

    const config = await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return config;
  },
});

export const fetchRecentReels = action({
  args: {},
  handler: async (
    ctx
  ): Promise<
    Array<{
      id: string;
      url: string;
      caption: string;
      thumbnailUrl: string;
      timestamp: string;
    }>
  > => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    type GraphMedia = {
      id: string;
      caption?: string;
      media_type: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink: string;
      timestamp: string;
    };

    type GraphMediaResponse = {
      data?: GraphMedia[];
      error?: { message?: string };
    };

    const config = await ctx.runQuery(internal.instagram.getConfigByBetterAuthId, {
      betterAuthId: identity.subject,
    });

    if (!config) {
      throw new Error("Instagram not configured. Please add access token first.");
    }

    if (config.tokenExpiresAt < Date.now()) {
      throw new Error("INSTAGRAM_TOKEN_EXPIRED");
    }

    const accessToken = await decryptToken(config.accessToken);
    const url =
      `https://graph.instagram.com/v25.0/${config.instagramAccountId}/media` +
      `?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp` +
      `&limit=20` +
      `&access_token=${accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = (await response.json()) as GraphMediaResponse;
      throw new Error(`Instagram API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = (await response.json()) as GraphMediaResponse;

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    const reels = data.data.filter(
      (media) => media.media_type === "VIDEO" || media.media_type === "REELS"
    );

    return reels.map((reel) => ({
      id: reel.id,
      url: reel.permalink,
      caption: reel.caption ? reel.caption.substring(0, 100) : "No caption",
      thumbnailUrl: reel.thumbnail_url || reel.media_url || "",
      timestamp: reel.timestamp,
    }));
  },
});

export const checkRateLimitInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (!config) return { allowed: false, reason: "Not configured" };

    const now = Date.now();

    if (now > config.rateLimitResetTime) {
      return { allowed: true, callsRemaining: 200 };
    }

    const callsRemaining = 200 - config.rateLimitCallCount;

    if (callsRemaining <= 0) {
      const resetIn = Math.ceil((config.rateLimitResetTime - now) / 60000);
      return {
        allowed: false,
        reason: `Rate limit exceeded. Resets in ${resetIn} minutes`,
        callsRemaining: 0,
      };
    }

    return { allowed: true, callsRemaining };
  },
});

export const incrementRateLimitInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("instagramConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (!config) return;

    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000;

    if (now > config.rateLimitResetTime) {
      await ctx.db.patch(config._id, {
        rateLimitCallCount: 1,
        rateLimitResetTime: oneHourFromNow,
        lastApiCallTime: now,
      });
    } else {
      await ctx.db.patch(config._id, {
        rateLimitCallCount: config.rateLimitCallCount + 1,
        lastApiCallTime: now,
      });
    }
  },
});

export const createReelMapping = mutation({
  args: {
    reelId: v.string(),
    reelUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    productId: v.id("products"),
    keyword: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const validated = validateReelMappingInput({
      reelId: args.reelId,
      reelUrl: args.reelUrl,
      thumbnailUrl: args.thumbnailUrl,
      caption: args.caption,
      keyword: args.keyword,
    });

    const product = await ctx.db.get(args.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found");
    }

    const existing = await ctx.db
      .query("reelMappings")
      .withIndex("by_reel", (q) => q.eq("reelId", validated.reelId))
      .first();

    const data = {
      userId,
      productId: args.productId,
      keyword: validated.keyword,
      active: false,
      reelUrl: validated.reelUrl,
      thumbnailUrl: validated.thumbnailUrl,
      caption: validated.caption,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("reelMappings", {
        ...data,
        reelId: validated.reelId,
      });
    }
  },
});

export const publishReelMapping = mutation({
  args: {
    id: v.id("reelMappings"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const mapping = await ctx.db.get(args.id);
    if (!mapping || mapping.userId !== userId) {
      throw new Error("Mapping not found");
    }
    await ctx.db.patch(args.id, {
      active: true,
      publishedAt: Date.now(),
    });
  },
});

export const getDraftMappings = query({
  args: {},
  handler: async (ctx) => {
    const session = await getSession(ctx);
    if (!session) return [];

    const { userId } = session;

    const drafts = await ctx.db
      .query("reelMappings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("active"), false))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      drafts.map(async (draft) => {
        const product = await ctx.db.get(draft.productId);
        return {
          ...draft,
          productName: product?.name || "Unknown Product",
        };
      })
    );

    return enriched;
  },
});

export const getPublishedMappings = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await getSession(ctx);
    if (!session) return [];

    const { userId } = session;

    const limit = args.limit && args.limit > 0 ? Math.min(args.limit, 24) : undefined;

    const published = await ctx.db
      .query("reelMappings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .take(limit ?? 1000);

    const enriched = await Promise.all(
      published.map(async (mapping) => {
        const product = await ctx.db.get(mapping.productId);
        return {
          ...mapping,
          productName: product?.name || "Unknown Product",
        };
      })
    );

    return enriched;
  },
});

export const listReelMappings = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);

    const mappings = await ctx.db
      .query("reelMappings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      mappings.map(async (mapping) => {
        const product = await ctx.db.get(mapping.productId);
        return {
          ...mapping,
          productName: product?.name || "Unknown Product",
        };
      })
    );

    return enriched;
  },
});

export const generateDMMessage = query({
  args: {
    productId: v.id("products"),
    triggerType: v.union(v.literal("comment"), v.literal("dm")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireSession(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const siteUrl = process.env.SITE_URL!;
    const productUrl = `${siteUrl}/${user.username}/p/${product.productUrl}`;

    let items: Array<{ title?: string; price?: string; affiliateLink: string }> = [];

    if (product.type === "affiliate") {
      items = await ctx.db
        .query("productItems")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .order("asc")
        .take(10);
    }

    return buildDmMessage({
      productType: product.type,
      productName: product.name,
      productUrl,
      items,
      triggerType: args.triggerType,
    });
  },
});

export const generateDMMessageForJob = internalQuery({
  args: {
    productId: v.id("products"),
    triggerType: v.union(v.literal("comment"), v.literal("dm")),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const user = await ctx.db.get(product.createdBy);
    if (!user) throw new Error("User not found");

    const siteUrl = process.env.SITE_URL!;
    const productUrl = `${siteUrl}/${user.username}/p/${product.productUrl}`;

    let items: Array<{ title?: string; price?: string; affiliateLink: string }> = [];

    if (product.type === "affiliate") {
      items = await ctx.db
        .query("productItems")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .order("asc")
        .take(10);
    }

    return buildDmMessage({
      productType: product.type,
      productName: product.name,
      productUrl,
      items,
      triggerType: args.triggerType,
    });
  },
});

export const deleteReelMapping = mutation({
  args: {
    id: v.id("reelMappings"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const mapping = await ctx.db.get(args.id);
    if (!mapping || mapping.userId !== userId) {
      throw new Error("Mapping not found");
    }
    await ctx.db.delete(args.id);
  },
});

export const toggleReelMapping = mutation({
  args: {
    id: v.id("reelMappings"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const mapping = await ctx.db.get(args.id);
    if (!mapping || mapping.userId !== userId) {
      throw new Error("Mapping not found");
    }

    await ctx.db.patch(args.id, {
      active: !mapping.active,
    });
  },
});

export const findMappingForComment = query({
  args: {
    sourceSecret: v.string(),
    reelId: v.string(),
    commentText: v.string(),
  },
  handler: async (ctx, args) => {
    assertWebhookSourceSecret(args.sourceSecret);
    const commentKeyword = args.commentText.toLowerCase().trim();

    const mappings = await ctx.db
      .query("reelMappings")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const mapping = mappings.find((candidate) => {
      const keywords = candidate.keyword
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

      return keywords.includes(commentKeyword);
    });

    if (!mapping) return null;

    const product = await ctx.db.get(mapping.productId);

    return {
      mappingId: mapping._id,
      productId: mapping.productId,
      productName: product?.name || "Product",
      keyword: mapping.keyword,
      userId: mapping.userId,
    };
  },
});

export const findMappingForReel = query({
  args: {
    sourceSecret: v.string(),
    reelId: v.string(),
  },
  handler: async (ctx, args) => {
    assertWebhookSourceSecret(args.sourceSecret);
    const mapping = await ctx.db
      .query("reelMappings")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!mapping) return null;

    const product = await ctx.db.get(mapping.productId);

    return {
      mappingId: mapping._id,
      productId: mapping.productId,
      productName: product?.name || "Product",
      keyword: mapping.keyword,
      userId: mapping.userId,
    };
  },
});

export const logComment = mutation({
  args: {
    sourceSecret: v.string(),
    commentId: v.string(),
    reelId: v.string(),
    instagramUserId: v.string(),
    username: v.string(),
    commentText: v.string(),
    keyword: v.string(),
    productId: v.optional(v.id("products")),
    userId: v.optional(v.id("users")),
    dmSent: v.boolean(),
    dmError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertWebhookSourceSecret(args.sourceSecret);

    const existing = await ctx.db
      .query("commentLogs")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("commentLogs", {
      commentId: args.commentId,
      reelId: args.reelId,
      instagramUserId: args.instagramUserId,
      username: args.username,
      commentText: args.commentText,
      keyword: args.keyword,
      productId: args.productId,
      userId: args.userId,
      dmSent: args.dmSent,
      dmError: args.dmError,
      timestamp: Date.now(),
    });
  },
});

export const logDM = mutation({
  args: {
    instagramUserId: v.string(),
    username: v.string(),
    productId: v.id("products"),
    userId: v.optional(v.id("users")),
    messageText: v.string(),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dmLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const session = await getSession(ctx);
    if (!session)
      return {
        totalComments: 0,
        commentsLast24h: 0,
        totalDMs: 0,
        dmsLast24h: 0,
        totalMappings: 0,
        activeMappings: 0,
        failedDMs: 0,
      };

    const { userId } = session;

    const comments = await ctx.db
      .query("commentLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(500);
    const dms = await ctx.db
      .query("dmLogs")
      .withIndex("by_owner", (q) => q.eq("userId", userId))
      .order("desc")
      .take(500);
    const mappings = await ctx.db
      .query("reelMappings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentComments = comments.filter((c) => c.timestamp > last24h);
    const recentDMs = dms.filter((d) => d.timestamp > last24h);

    return {
      totalComments: comments.length,
      commentsLast24h: recentComments.length,
      totalDMs: dms.length,
      dmsLast24h: recentDMs.length,
      dmSuccessRate:
        dms.length > 0 ? Math.round((dms.filter((d) => d.success).length / dms.length) * 100) : 0,
      activeMappings: mappings.filter((m) => m.active).length,
      totalMappings: mappings.length,
    };
  },
});

export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const limit = args.limit ?? 50;

    const comments = await ctx.db
      .query("commentLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      comments.map(async (comment) => {
        if (!comment.productId) return comment;
        const product = await ctx.db.get(comment.productId);
        return {
          ...comment,
          productName: product?.name,
        };
      })
    );

    return enriched;
  },
});

export const getReelMappingById = query({
  args: {
    sourceSecret: v.string(),
    id: v.id("reelMappings"),
  },
  handler: async (ctx, args) => {
    assertWebhookSourceSecret(args.sourceSecret);
    return await ctx.db.get(args.id);
  },
});

export const refreshToken = internalAction({
  args: { configId: v.id("instagramConfig") },
  handler: async (ctx, args) => {
    const config = await ctx.runQuery(internal.instagram.getConfigById, {
      configId: args.configId,
    });
    if (!config) return;

    const clientSecret = process.env.DMHELPER_APP_SECRET;
    if (!clientSecret) {
      throw new Error("DMHELPER_APP_SECRET not configured");
    }

    const accessToken = await decryptToken(config.accessToken);
    const url =
      `https://graph.instagram.com/refresh_access_token` +
      `?grant_type=ig_refresh_token` +
      `&access_token=${accessToken}`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
    };

    const encryptedNewToken = await encryptToken(data.access_token);
    await ctx.runMutation(internal.instagram.updateTokenInternal, {
      configId: args.configId,
      accessToken: encryptedNewToken,
      tokenExpiresAt: Date.now() + data.expires_in * 1000,
    });
  },
});

export const getConfigById = internalQuery({
  args: { configId: v.id("instagramConfig") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.configId);
  },
});

export const updateTokenInternal = internalMutation({
  args: {
    configId: v.id("instagramConfig"),
    accessToken: v.string(),
    tokenExpiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.configId, {
      accessToken: args.accessToken,
      tokenExpiresAt: args.tokenExpiresAt,
      lastTokenRefresh: Date.now(),
    });
  },
});

export const refreshExpiring = internalMutation({
  handler: async (ctx) => {
    const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const allConfigs = await ctx.db.query("instagramConfig").collect();
    const expiring = allConfigs.filter(
      (c) => c.tokenExpiresAt < sevenDaysFromNow && c.tokenExpiresAt > Date.now()
    );

    for (const config of expiring) {
      await ctx.scheduler.runAfter(0, internal.instagram.refreshToken, {
        configId: config._id,
      });
    }
  },
});
