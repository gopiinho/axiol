import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const accountTypes = v.union(
  v.literal("creator"),
  v.literal("admin"),
);

export default defineSchema({
  users: defineTable({
    betterAuthId: v.string(),
    email: v.string(),
    username: v.string(),
    name: v.string(),
    bio: v.string(),
    avatarUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    profileImageId: v.optional(v.id("_storage")),
    coverImageId: v.optional(v.id("_storage")),
    theme: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    storeName: v.optional(v.string()),
    accountType: accountTypes,
    trialStartedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("trial"),
        v.literal("active"),
        v.literal("expired"),
        v.literal("cancelled"),
      ),
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_betterAuthId", ["betterAuthId"]),

  collections: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["createdBy"]),

  items: defineTable({
    collectionId: v.id("collections"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.string(),
    itemTitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_collection", ["collectionId"]),

  instagramConfig: defineTable({
    userId: v.id("users"),
    accessToken: v.string(),
    instagramAccountId: v.string(),
    instagramUsername: v.optional(v.string()),
    lastTokenRefresh: v.number(),
    tokenExpiresAt: v.number(),
    rateLimitCallCount: v.number(),
    rateLimitResetTime: v.number(),
    lastApiCallTime: v.number(),
    webhookSubscribed: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_instagram_account", ["instagramAccountId"]),

  reelMappings: defineTable({
    userId: v.id("users"),
    reelId: v.string(),
    reelUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    collectionId: v.id("collections"),
    keyword: v.string(),
    active: v.boolean(),
    maxItemsInDM: v.number(),
    includeWebsiteLink: v.boolean(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_reel", ["reelId"])
    .index("by_active", ["active"])
    .index("by_user", ["userId"]),

  dmJobs: defineTable({
    userId: v.id("users"),
    instagramUserId: v.string(),
    username: v.string(),
    collectionId: v.id("collections"),
    reelId: v.string(),
    maxItemsInDM: v.number(),
    includeWebsiteLink: v.boolean(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("duplicate"),
    ),
    createdAt: v.number(),
    scheduledFor: v.optional(v.number()),
    attemptCount: v.number(),
    lastAttemptAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    triggerType: v.union(v.literal("comment"), v.literal("dm")),
    triggerId: v.string(),
    messageText: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_user_reel", ["instagramUserId", "reelId"])
    .index("by_scheduled", ["scheduledFor"])
    .index("by_owner", ["userId"]),

  dmRateLimitState: defineTable({
    userId: v.id("users"),
    dmsSentInLastHour: v.array(v.number()),
    lastDmSentAt: v.optional(v.number()),
    workerLastRun: v.optional(v.number()),
    workerActive: v.boolean(),
  }).index("by_user", ["userId"]),

  commentLogs: defineTable({
    commentId: v.string(),
    reelId: v.string(),
    instagramUserId: v.string(),
    username: v.string(),
    commentText: v.string(),
    keyword: v.string(),
    collectionId: v.optional(v.id("collections")),
    userId: v.optional(v.id("users")),
    dmSent: v.boolean(),
    dmError: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_comment", ["commentId"])
    .index("by_user", ["userId"]),

  dmLogs: defineTable({
    instagramUserId: v.string(),
    username: v.string(),
    collectionId: v.id("collections"),
    userId: v.optional(v.id("users")),
    messageText: v.string(),
    success: v.boolean(),
    error: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["instagramUserId"])
    .index("by_owner", ["userId"]),

  catCounter: defineTable({
    count: v.number(),
  }),

  waitlist: defineTable({
    email: v.string(),
  }).index("by_email", ["email"]),
});
