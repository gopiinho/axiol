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
    let last7Days = 0;
    let last28Days = 0;

    for (const order of paidOrders) {
      totalEarnings += order.amountCents;
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
    };
  },
});
