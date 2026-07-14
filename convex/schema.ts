import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { productTypeValidator, productConfigValidator } from "./productConfig";

const accountTypes = v.union(v.literal("creator"), v.literal("admin"));

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
    theme: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    palette: v.optional(v.object({
      bg: v.string(),
      accent: v.string(),
      surface: v.optional(v.string()),
      border: v.optional(v.string()),
      text: v.optional(v.string()),
      textMuted: v.optional(v.string()),
      cardBg: v.optional(v.string()),
    })),
    layout: v.optional(v.object({
      preset: v.optional(v.string()),
      borderRadius: v.optional(v.string()),
      cardStyle: v.optional(v.string()),
      spacing: v.optional(v.string()),
      headerLayout: v.optional(v.string()),
      typeScale: v.optional(v.string()),
      backgroundPattern: v.optional(v.string()),
    })),
    storeName: v.optional(v.string()),
    accountType: accountTypes,
    trialStartedAt: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    subscriptionStatus: v.optional(
      v.union(v.literal("trial"), v.literal("active"), v.literal("expired"), v.literal("cancelled"))
    ),
  })
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_betterAuthId", ["betterAuthId"]),

  products: defineTable({
    createdBy: v.id("users"),
    name: v.string(),
    productUrl: v.string(),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    price: v.optional(v.string()),
    type: productTypeValidator,
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    priceCents: v.optional(v.number()),
    currency: v.optional(v.string()),
    config: productConfigValidator,
    createdAt: v.number(),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
    automationEnabled: v.boolean(),
    order: v.number(),
  })
    .index("by_user", ["createdBy"])
    .index("by_user_order", ["createdBy", "order"])
    .index("by_productUrl", ["productUrl", "createdBy"])
    .index("by_status", ["createdBy", "status", "order"]),

  productItems: defineTable({
    productId: v.id("products"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.optional(v.string()),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    order: v.number(),
  }).index("by_product", ["productId"]),

  availabilitySchedules: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    timezone: v.string(),
    weeklyRules: v.array(
      v.object({
        weekday: v.union(
          v.literal("monday"),
          v.literal("tuesday"),
          v.literal("wednesday"),
          v.literal("thursday"),
          v.literal("friday"),
          v.literal("saturday"),
          v.literal("sunday")
        ),
        enabled: v.boolean(),
        windows: v.array(
          v.object({
            from: v.string(),
            to: v.string(),
          })
        ),
      })
    ),
    blockedDates: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  orders: defineTable({
    productId: v.id("products"),
    sellerId: v.id("users"),
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    amountCents: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentProvider: v.optional(v.string()),
    paymentReference: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_product", ["productId"])
    .index("by_seller", ["sellerId"])
    .index("by_seller_status", ["sellerId", "status"]),

  productClicks: defineTable({
    productId: v.id("products"),
    sellerId: v.id("users"),
    timestamp: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_seller", ["sellerId"]),

  bookings: defineTable({
    productId: v.id("products"),
    orderId: v.optional(v.id("orders")),
    sellerId: v.id("users"),
    buyerName: v.string(),
    buyerEmail: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    timezone: v.string(),
    status: v.union(
      v.literal("reserved"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    meetingLocation: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_seller", ["sellerId"]),

  formSubmissions: defineTable({
    productId: v.id("products"),
    sellerId: v.id("users"),
    values: v.array(
      v.object({
        fieldId: v.string(),
        value: v.string(),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_seller", ["sellerId"]),

  deliveryTokens: defineTable({
    token: v.string(),
    orderId: v.id("orders"),
    productId: v.id("products"),
    status: v.union(v.literal("active"), v.literal("exhausted"), v.literal("expired")),
    downloadCount: v.number(),
    maxDownloads: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_order", ["orderId"]),

  deliveries: defineTable({
    productId: v.id("products"),
    orderId: v.optional(v.id("orders")),
    submissionId: v.optional(v.id("formSubmissions")),
    recipientEmail: v.string(),
    deliveryType: v.union(v.literal("email"), v.literal("redirect"), v.literal("download_link")),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    error: v.optional(v.string()),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
  }).index("by_product", ["productId"]),

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

  integrations: defineTable({
    userId: v.id("users"),
    provider: v.union(v.literal("instagram"), v.literal("google_calendar")),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("expiring_soon"),
      v.literal("expired"),
      v.literal("error")
    ),
    connectedAt: v.optional(v.number()),
    lastSyncAt: v.optional(v.number()),
    displayName: v.optional(v.string()),
    externalId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_user", ["userId"])
    .index("by_user_provider", ["userId", "provider"]),

  reelMappings: defineTable({
    userId: v.id("users"),
    reelId: v.string(),
    reelUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    productId: v.id("products"),
    keyword: v.string(),
    active: v.boolean(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_reel", ["reelId"])
    .index("by_active", ["active"])
    .index("by_user", ["userId"])
    .index("by_product", ["productId"]),

  dmJobs: defineTable({
    userId: v.id("users"),
    instagramUserId: v.string(),
    username: v.string(),
    productId: v.id("products"),
    reelId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("duplicate")
    ),
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
    .index("by_owner", ["userId"])
    .index("by_owner_status", ["userId", "status"])
    .index("by_product", ["productId"]),

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
    productId: v.optional(v.id("products")),
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
    productId: v.id("products"),
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

  contentUploads: defineTable({
    userId: v.id("users"),
    r2Key: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    productId: v.optional(v.id("products")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_key", ["r2Key"])
    .index("by_product", ["productId"]),
});
