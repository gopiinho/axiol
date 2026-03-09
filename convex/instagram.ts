import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

export const saveConfig = mutation({
  args: {
    accessToken: v.string(),
    instagramAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("instagramConfig").first();

    const tokenExpiresAt = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days
    const oneHourFromNow = Date.now() + 60 * 60 * 1000;

    const data = {
      accessToken: args.accessToken,
      instagramAccountId: args.instagramAccountId,
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
  },
});

export const getConfig = query({
  handler: async (ctx) => {
    return await ctx.db.query("instagramConfig").first();
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

    const rateLimitCheck = await ctx.runQuery(api.instagram.checkRateLimit);

    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.reason || "Rate limit exceeded");
    }

    const config = await ctx.runQuery(api.instagram.getConfig);

    if (!config) {
      throw new Error(
        "Instagram not configured. Please add access token first."
      );
    }

    if (config.tokenExpiresAt < Date.now()) {
      throw new Error("Instagram access token expired. Please refresh it.");
    }

    const url =
      `https://graph.instagram.com/v24.0/${config.instagramAccountId}/media` +
      `?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp` +
      `&limit=20` +
      `&access_token=${config.accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = (await response.json()) as GraphMediaResponse;
      throw new Error(
        `Instagram API error: ${
          errorData.error?.message || response.statusText
        }`
      );
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

export const checkRateLimit = query({
  handler: async (ctx) => {
    const config = await ctx.db.query("instagramConfig").first();
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

export const incrementRateLimit = mutation({
  handler: async (ctx) => {
    const config = await ctx.db.query("instagramConfig").first();
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
    sectionId: v.id("sections"),
    keyword: v.string(),
    maxItemsInDM: v.optional(v.number()),
    includeWebsiteLink: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reelMappings")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .first();

    const data = {
      sectionId: args.sectionId,
      keyword: args.keyword.toLowerCase(),
      active: false, // Starts as draft
      reelUrl: args.reelUrl,
      thumbnailUrl: args.thumbnailUrl,
      caption: args.caption,
      maxItemsInDM: args.maxItemsInDM ?? 10,
      includeWebsiteLink: args.includeWebsiteLink ?? true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("reelMappings", {
        ...data,
        reelId: args.reelId,
      });
    }
  },
});

export const publishReelMapping = mutation({
  args: { id: v.id("reelMappings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      active: true,
      publishedAt: Date.now(),
    });
  },
});

export const getDraftMappings = query({
  handler: async (ctx) => {
    const drafts = await ctx.db
      .query("reelMappings")
      .filter((q) => q.eq(q.field("active"), false))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      drafts.map(async (draft) => {
        const section = await ctx.db.get(draft.sectionId);
        const items = await ctx.db
          .query("items")
          .withIndex("by_section", (q) => q.eq("sectionId", draft.sectionId))
          .collect();

        return {
          ...draft,
          sectionTitle: section?.title || "Unknown Collection",
          itemCount: items.length,
        };
      })
    );

    return enriched;
  },
});

export const getPublishedMappings = query({
  handler: async (ctx) => {
    const published = await ctx.db
      .query("reelMappings")
      .withIndex("by_active", (q) => q.eq("active", true))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      published.map(async (mapping) => {
        const section = await ctx.db.get(mapping.sectionId);
        return {
          ...mapping,
          sectionTitle: section?.title || "Unknown Collection",
        };
      })
    );

    return enriched;
  },
});

export const listReelMappings = query({
  handler: async (ctx) => {
    const mappings = await ctx.db.query("reelMappings").order("desc").collect();

    const enriched = await Promise.all(
      mappings.map(async (mapping) => {
        const section = await ctx.db.get(mapping.sectionId);
        return {
          ...mapping,
          sectionTitle: section?.title || "Unknown Collection",
        };
      })
    );

    return enriched;
  },
});

export const generateDMMessage = query({
  args: {
    sectionId: v.id("sections"),
    maxItems: v.number(),
    includeWebsiteLink: v.boolean(),
  },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    if (!section) throw new Error("Collection not found");

    const items = await ctx.db
      .query("items")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .order("desc")
      .take(args.maxItems);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const collectionUrl = `${siteUrl}/list/${args.sectionId}`;

    let message = `Hi! Here are my top picks from "${section.title}":\n\n`;

    if (args.includeWebsiteLink) {
      message += `🔗 View full collection: ${collectionUrl}\n\n`;
    }

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.itemTitle || "Product"}`;
      if (item.price) {
        message += ` - ₹${item.price}`;
      }
      message += `\n👉 ${item.affiliateLink}\n\n`;
    });

    if (items.length < args.maxItems) {
      message += `(Showing all ${items.length} items)\n\n`;
    } else {
      message += `(Showing top ${args.maxItems} items - visit link for more)\n\n`;
    }

    message += `💕 Thank you for your support! xoxo`;

    return {
      message,
      itemCount: items.length,
      characterCount: message.length,
    };
  },
});

export const deleteReelMapping = mutation({
  args: { id: v.id("reelMappings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const toggleReelMapping = mutation({
  args: { id: v.id("reelMappings") },
  handler: async (ctx, args) => {
    const mapping = await ctx.db.get(args.id);
    if (!mapping) throw new Error("Mapping not found");

    await ctx.db.patch(args.id, {
      active: !mapping.active,
    });
  },
});

export const findMappingForComment = query({
  args: {
    reelId: v.string(),
    commentText: v.string(),
  },
  handler: async (ctx, args) => {
    const keyword = args.commentText.toLowerCase().trim();

    const mapping = await ctx.db
      .query("reelMappings")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .filter((q) =>
        q.and(q.eq(q.field("active"), true), q.eq(q.field("keyword"), keyword))
      )
      .first();

    if (!mapping) return null;

    const section = await ctx.db.get(mapping.sectionId);

    return {
      mappingId: mapping._id,
      sectionId: mapping.sectionId,
      sectionTitle: section?.title || "Collection",
      keyword: mapping.keyword,
    };
  },
});

export const findMappingForReel = query({
  args: {
    reelId: v.string(),
  },
  handler: async (ctx, args) => {
    const mapping = await ctx.db
      .query("reelMappings")
      .withIndex("by_reel", (q) => q.eq("reelId", args.reelId))
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!mapping) return null;

    const section = await ctx.db.get(mapping.sectionId);

    return {
      mappingId: mapping._id,
      sectionId: mapping.sectionId,
      sectionTitle: section?.title || "Collection",
      keyword: mapping.keyword,
    };
  },
});

export const logComment = mutation({
  args: {
    commentId: v.string(),
    reelId: v.string(),
    instagramUserId: v.string(),
    username: v.string(),
    commentText: v.string(),
    keyword: v.string(),
    sectionId: v.optional(v.id("sections")),
    dmSent: v.boolean(),
    dmError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("commentLogs")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("commentLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const logDM = mutation({
  args: {
    instagramUserId: v.string(),
    username: v.string(),
    sectionId: v.id("sections"),
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
  handler: async (ctx) => {
    const comments = await ctx.db.query("commentLogs").collect();
    const dms = await ctx.db.query("dmLogs").collect();
    const mappings = await ctx.db.query("reelMappings").collect();

    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentComments = comments.filter((c) => c.timestamp > last24h);
    const recentDMs = dms.filter((d) => d.timestamp > last24h);

    return {
      totalComments: comments.length,
      commentsLast24h: recentComments.length,
      totalDMs: dms.length,
      dmsLast24h: recentDMs.length,
      dmSuccessRate:
        dms.length > 0
          ? Math.round((dms.filter((d) => d.success).length / dms.length) * 100)
          : 0,
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
    const limit = args.limit ?? 50;

    const comments = await ctx.db
      .query("commentLogs")
      .order("desc")
      .take(limit);

    const enriched = await Promise.all(
      comments.map(async (comment) => {
        if (!comment.sectionId) return comment;
        const section = await ctx.db.get(comment.sectionId);
        return {
          ...comment,
          sectionTitle: section?.title,
        };
      })
    );

    return enriched;
  },
});

export const getReelMappingById = query({
  args: { id: v.id("reelMappings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
