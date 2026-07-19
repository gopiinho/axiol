import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireVerifiedSession } from "./security";
import { addSale } from "./analytics";

export const create = mutation({
  args: {
    productId: v.id("products"),
    sellerId: v.id("users"),
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    paymentProvider: v.string(),
    paymentReference: v.string(),
    vendorId: v.optional(v.string()),
    vendorShare: v.optional(v.number()),
    platformFee: v.optional(v.number()),
    platformFeePct: v.optional(v.number()),
    tds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    return await ctx.db.insert("orders", {
      productId: args.productId,
      productName: product?.name,
      sellerId: args.sellerId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      paymentProvider: args.paymentProvider,
      paymentReference: args.paymentReference,
      createdAt: Date.now(),
      vendorId: args.vendorId,
      vendorShare: args.vendorShare,
      platformFee: args.platformFee,
      platformFeePct: args.platformFeePct,
      tds: args.tds,
    });
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "paid") {
      patch.paidAt = Date.now();
    }
    if (args.paymentReference) {
      patch.paymentReference = args.paymentReference;
    }
    await ctx.db.patch(args.orderId, patch);

    if (args.status === "paid" && order.status !== "paid") {
      const earnings = order.vendorShare ?? order.amount;
      await addSale(ctx, order.sellerId, order.productId, earnings);
    }
  },
});

export const updatePaymentMethod = mutation({
  args: {
    orderId: v.id("orders"),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { paymentMethod: args.paymentMethod });
  },
});

export const listBySeller = query({
  args: {
    status: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("refunded"))
    ),
    productId: v.optional(v.id("products")),
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);
    const limit = args.limit ?? 20;
    const paginationOpts = { cursor: args.cursor ?? null, numItems: limit };

    async function enrich(orders: Doc<"orders">[]) {
      return await Promise.all(
        orders.map(async (order) => {
          const productName = order.productName ?? (await ctx.db.get(order.productId))?.name ?? "Unknown Product";

          const deliveryToken = await ctx.db
            .query("deliveryTokens")
            .withIndex("by_order", (q) => q.eq("orderId", order._id))
            .first();

          const deliveries = await ctx.db
            .query("deliveries")
            .withIndex("by_order", (q) => q.eq("orderId", order._id))
            .order("desc")
            .take(1);

          return {
            ...order,
            productName,
            deliveryTokenStatus: deliveryToken?.status ?? null,
            deliveryDownloadCount: deliveryToken?.downloadCount ?? 0,
            deliveryMaxDownloads: deliveryToken?.maxDownloads ?? 0,
            deliveryStatus: deliveries[0]?.status ?? null,
          };
        })
      );
    }

    if (args.search) {
      const builder = ctx.db
        .query("orders")
        .withSearchIndex("search_buyer_email", (q) => {
          let query = q.search("buyerEmail", args.search!).eq("sellerId", userId);
          if (args.status) query = query.eq("status", args.status);
          if (args.productId) query = query.eq("productId", args.productId);
          return query;
        });

      const result = await builder.paginate(paginationOpts);
      const enriched = await enrich(result.page);
      return { orders: enriched, continueCursor: result.continueCursor, isDone: result.isDone };
    }

    if (args.status && !args.productId) {
      const result = await ctx.db
        .query("orders")
        .withIndex("by_seller_status", (q) => q.eq("sellerId", userId).eq("status", args.status!))
        .order("desc")
        .paginate(paginationOpts);

      const enriched = await enrich(result.page);
      return { orders: enriched, continueCursor: result.continueCursor, isDone: result.isDone };
    }

    if (args.productId && !args.status) {
      const result = await ctx.db
        .query("orders")
        .withIndex("by_seller_product", (q) => q.eq("sellerId", userId).eq("productId", args.productId!))
        .order("desc")
        .paginate(paginationOpts);

      const enriched = await enrich(result.page);
      return { orders: enriched, continueCursor: result.continueCursor, isDone: result.isDone };
    }

    if (args.status && args.productId) {
      const result = await ctx.db
        .query("orders")
        .withIndex("by_seller_status", (q) => q.eq("sellerId", userId).eq("status", args.status!))
        .filter((q) => q.eq(q.field("productId"), args.productId!))
        .order("desc")
        .paginate(paginationOpts);

      const enriched = await enrich(result.page);
      return { orders: enriched, continueCursor: result.continueCursor, isDone: result.isDone };
    }

    const result = await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .order("desc")
      .paginate(paginationOpts);

    const enriched = await enrich(result.page);
    return { orders: enriched, continueCursor: result.continueCursor, isDone: result.isDone };
  },
});

export const listBySellerForExport = query({
  args: {
    status: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("refunded"))
    ),
    productId: v.optional(v.id("products")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    let orders: Doc<"orders">[];
    if (args.search) {
      const result = await ctx.db
        .query("orders")
        .withSearchIndex("search_buyer_email", (q) => {
          let query = q.search("buyerEmail", args.search!).eq("sellerId", userId);
          if (args.status) query = query.eq("status", args.status);
          if (args.productId) query = query.eq("productId", args.productId);
          return query;
        })
        .take(10000);
      orders = result;
    } else if (args.status && !args.productId) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_seller_status", (q) => q.eq("sellerId", userId).eq("status", args.status!))
        .order("desc")
        .take(10000);
    } else if (args.productId && !args.status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_seller_product", (q) => q.eq("sellerId", userId).eq("productId", args.productId!))
        .order("desc")
        .take(10000);
    } else if (args.status && args.productId) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_seller_status", (q) => q.eq("sellerId", userId).eq("status", args.status!))
        .filter((q) => q.eq(q.field("productId"), args.productId!))
        .order("desc")
        .take(10000);
    } else {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_seller", (q) => q.eq("sellerId", userId))
        .order("desc")
        .take(10000);
    }

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const productName = order.productName ?? (await ctx.db.get(order.productId))?.name ?? "Unknown Product";

        const deliveryToken = await ctx.db
          .query("deliveryTokens")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .first();

        return {
          ...order,
          productName,
          deliveryTokenStatus: deliveryToken?.status ?? null,
        };
      })
    );

    return { orders: enriched };
  },
});

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getByPaymentReference = query({
  args: { paymentReference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("paymentReference"), args.paymentReference))
      .first();
  },
});

function generateBucketKeys(start: Date, end: Date, granularity: string): string[] {
  const keys: string[] = [];
  const cursor = new Date(start);

  if (granularity === "daily") {
    cursor.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    while (cursor <= endDate) {
      keys.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (granularity === "weekly") {
    cursor.setDate(cursor.getDate() - cursor.getDay());
    cursor.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    while (cursor <= endDate) {
      const y = cursor.getFullYear();
      const startOfYear = new Date(y, 0, 1);
      const week = Math.ceil(
        ((cursor.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
      );
      keys.push(`${y}-W${String(week).padStart(2, "0")}`);
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    while (cursor <= endDate) {
      keys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return keys;
}

function bucketKey(ts: number, granularity: string): string {
  const date = new Date(ts);
  if (granularity === "daily") {
    return date.toISOString().slice(0, 10);
  } else if (granularity === "weekly") {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatLabel(key: string, granularity: string): string {
  if (granularity === "daily") {
    const d = new Date(key + "T00:00:00");
    return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}, ${d.getFullYear()}`;
  } else if (granularity === "weekly") {
    return `W${parseInt(key.split("-W")[1], 10)}`;
  }
  const d = new Date(key + "-01T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short" });
}

function getTimeRangeMs(period: string): { startMs: number; endMs: number } {
  const now = new Date();
  switch (period) {
    case "7d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { startMs: start.getTime(), endMs: now.getTime() };
    }
    case "30d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { startMs: start.getTime(), endMs: now.getTime() };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startMs: start.getTime(), endMs: now.getTime() };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }
    case "3m": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return { startMs: start.getTime(), endMs: now.getTime() };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { startMs: start.getTime(), endMs: now.getTime() };
    }
    case "last_year": {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }
    default:
      return { startMs: 0, endMs: now.getTime() };
  }
}

export const getRevenueTimeline = query({
  args: {
    timePeriod: v.string(),
    granularity: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    const { startMs, endMs } = getTimeRangeMs(args.timePeriod);
    const allKeys = generateBucketKeys(new Date(startMs), new Date(endMs), args.granularity);

    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_seller_status_paidAt", (q) =>
        q.eq("sellerId", userId).eq("status", "paid").gte("paidAt", startMs).lte("paidAt", endMs)
      )
      .take(5000);

    const startDay = new Date(startMs).toISOString().slice(0, 10);
    const endDay = new Date(endMs).toISOString().slice(0, 10);

    const allClicks = await ctx.db
      .query("dailyClickCounts")
      .withIndex("by_seller_day", (q) =>
        q.eq("sellerId", userId).gte("day", startDay).lte("day", endDay)
      )
      .collect();

    const revenueByBucket = new Map<string, number>();
    const salesByBucket = new Map<string, number>();
    const clicksByBucket = new Map<string, number>();

    for (const order of paidOrders) {
      if (!order.paidAt) continue;
      const key = bucketKey(order.paidAt, args.granularity);
      revenueByBucket.set(
        key,
        (revenueByBucket.get(key) ?? 0) + (order.vendorShare ?? order.amount)
      );
      salesByBucket.set(key, (salesByBucket.get(key) ?? 0) + 1);
    }

    for (const entry of allClicks) {
      const ts = new Date(entry.day + "T00:00:00").getTime();
      const key = bucketKey(ts, args.granularity);
      clicksByBucket.set(key, (clicksByBucket.get(key) ?? 0) + entry.clicks);
    }

    return allKeys.map((key) => ({
      label: formatLabel(key, args.granularity),
      revenue: revenueByBucket.get(key) ?? 0,
      sales: salesByBucket.get(key) ?? 0,
      clicks: clicksByBucket.get(key) ?? 0,
    }));
  },
});

export const getEarningsSummary = query({
  args: {
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);
    const now = args.now ?? Date.now();
    const DAY = 86400000;
    const sevenDaysAgo = now - 7 * DAY;
    const twentyEightDaysAgo = now - 28 * DAY;

    const stats = await ctx.db
      .query("sellerStats")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .first();

    if (!stats) {
      return { balance: 0, last7Days: 0, last28Days: 0, totalEarnings: 0, totalSales: 0 };
    }

    const recentOrders = await ctx.db
      .query("orders")
      .withIndex("by_seller_status_paidAt", (q) =>
        q.eq("sellerId", userId).eq("status", "paid").gte("paidAt", twentyEightDaysAgo)
      )
      .take(5000);

    let last7Days = 0;
    let last28Days = 0;
    for (const order of recentOrders) {
      const earnings = order.vendorShare ?? order.amount;
      if (order.paidAt && order.paidAt >= sevenDaysAgo) {
        last7Days += earnings;
      }
      last28Days += earnings;
    }

    return {
      balance: stats.totalEarnings,
      last7Days,
      last28Days,
      totalEarnings: stats.totalEarnings,
      totalSales: stats.totalSales,
      totalClicks: stats.totalClicks,
    };
  },
});
