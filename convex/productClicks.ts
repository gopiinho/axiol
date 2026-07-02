import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const incrementClick = mutation({
  args: {
    productId: v.id("products"),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("productClicks", {
      productId: args.productId,
      sellerId: args.sellerId,
      timestamp: Date.now(),
    });
  },
});

export const getClicksByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const clicks = await ctx.db
      .query("productClicks")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    return clicks.length;
  },
});
