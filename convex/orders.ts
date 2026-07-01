import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
