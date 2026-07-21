import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { addClick } from "./analytics";

export const incrementClick = mutation({
  args: {
    productId: v.id("products"),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().slice(0, 10);

    const existing = await ctx.db
      .query("dailyClickCounts")
      .withIndex("by_product_day", (q) =>
        q.eq("productId", args.productId).eq("day", today)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { clicks: existing.clicks + 1 });
    } else {
      await ctx.db.insert("dailyClickCounts", {
        sellerId: args.sellerId,
        productId: args.productId,
        day: today,
        clicks: 1,
      });
    }

    await addClick(ctx, args.sellerId, args.productId);
  },
});
