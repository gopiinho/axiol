import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./security";

export const create = mutation({
  args: {
    productId: v.id("products"),
    sellerId: v.id("users"),
    buyerEmail: v.string(),
    buyerName: v.string(),
    buyerPhone: v.optional(v.string()),
    amountCents: v.number(),
    currency: v.string(),
    paymentProvider: v.string(),
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      productId: args.productId,
      sellerId: args.sellerId,
      buyerEmail: args.buyerEmail,
      buyerName: args.buyerName,
      buyerPhone: args.buyerPhone,
      amountCents: args.amountCents,
      currency: args.currency,
      status: "pending",
      paymentProvider: args.paymentProvider,
      paymentReference: args.paymentReference,
      createdAt: Date.now(),
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
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "paid") {
      patch.paidAt = Date.now();
    }
    if (args.paymentReference) {
      patch.paymentReference = args.paymentReference;
    }
    await ctx.db.patch(args.orderId, patch);
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

function getTimeRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  switch (period) {
    case "7d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start, end: now };
    }
    case "30d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { start, end: now };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "3m": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return { start, end: now };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end: now };
    }
    case "last_year": {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    default:
      return { start: new Date(0), end: now };
  }
}

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

export const getRevenueTimeline = query({
  args: {
    timePeriod: v.string(),
    granularity: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const { start, end } = getTimeRange(args.timePeriod);
    const allKeys = generateBucketKeys(start, end, args.granularity);

    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_seller_status", (q) =>
        q.eq("sellerId", userId).eq("status", "paid")
      )
      .collect();

    const allClicks = await ctx.db
      .query("productClicks")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .collect();

    const revenueByBucket = new Map<string, number>();
    const salesByBucket = new Map<string, number>();
    const clicksByBucket = new Map<string, number>();

    for (const order of paidOrders) {
      if (!order.paidAt) continue;
      const key = bucketKey(order.paidAt, args.granularity);
      revenueByBucket.set(key, (revenueByBucket.get(key) ?? 0) + order.amountCents);
      salesByBucket.set(key, (salesByBucket.get(key) ?? 0) + 1);
    }

    for (const click of allClicks) {
      const key = bucketKey(click.timestamp, args.granularity);
      clicksByBucket.set(key, (clicksByBucket.get(key) ?? 0) + 1);
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
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);
    const now = Date.now();
    const DAY = 86400000;
    const sevenDaysAgo = now - 7 * DAY;
    const twentyEightDaysAgo = now - 28 * DAY;

    const paidOrders = await ctx.db
      .query("orders")
      .withIndex("by_seller_status", (q) =>
        q.eq("sellerId", userId).eq("status", "paid")
      )
      .collect();

    let totalEarnings = 0;
    let totalSales = 0;
    let last7Days = 0;
    let last28Days = 0;

    for (const order of paidOrders) {
      totalEarnings += order.amountCents;
      totalSales += 1;
      if (order.paidAt && order.paidAt >= sevenDaysAgo) {
        last7Days += order.amountCents;
      }
      if (order.paidAt && order.paidAt >= twentyEightDaysAgo) {
        last28Days += order.amountCents;
      }
    }

    return {
      balance: totalEarnings,
      last7Days,
      last28Days,
      totalEarnings,
      totalSales,
    };
  },
});
