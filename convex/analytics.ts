import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export async function ensureSellerStats(ctx: MutationCtx, sellerId: Id<"users">) {
  const existing = await ctx.db
    .query("sellerStats")
    .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
    .first();
  if (!existing) {
    await ctx.db.insert("sellerStats", {
      sellerId,
      totalSales: 0,
      totalEarnings: 0,
      totalClicks: 0,
    });
  }
}

export async function ensureProductStats(ctx: MutationCtx, productId: Id<"products">) {
  const existing = await ctx.db
    .query("productStats")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .first();
  if (!existing) {
    await ctx.db.insert("productStats", {
      productId,
      sales: 0,
      revenue: 0,
      clicks: 0,
    });
  }
}

export async function addSale(
  ctx: MutationCtx,
  sellerId: Id<"users">,
  productId: Id<"products">,
  amount: number
) {
  await ensureSellerStats(ctx, sellerId);
  await ensureProductStats(ctx, productId);

  const seller = await ctx.db
    .query("sellerStats")
    .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
    .first();
  if (seller) {
    await ctx.db.patch(seller._id, {
      totalSales: seller.totalSales + 1,
      totalEarnings: seller.totalEarnings + amount,
    });
  }

  const product = await ctx.db
    .query("productStats")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .first();
  if (product) {
    await ctx.db.patch(product._id, {
      sales: product.sales + 1,
      revenue: product.revenue + amount,
    });
  }
}

export async function addClick(
  ctx: MutationCtx,
  sellerId: Id<"users">,
  productId: Id<"products">
) {
  await ensureSellerStats(ctx, sellerId);
  await ensureProductStats(ctx, productId);

  const seller = await ctx.db
    .query("sellerStats")
    .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
    .first();
  if (seller) {
    await ctx.db.patch(seller._id, { totalClicks: seller.totalClicks + 1 });
  }

  const product = await ctx.db
    .query("productStats")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .first();
  if (product) {
    await ctx.db.patch(product._id, { clicks: product.clicks + 1 });
  }
}

const BATCH_SIZE = 200;

export const backfillStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db.query("orders").paginate({ numItems: BATCH_SIZE, cursor: null });
    await processOrdersBatch(ctx, result.page);
    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, internal.analytics.backfillStatsBatch, {
        cursor: result.continueCursor,
      });
    }
  },
});

export const backfillStatsBatch = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("orders").paginate({
      numItems: BATCH_SIZE,
      cursor: args.cursor ?? null,
    });
    await processOrdersBatch(ctx, result.page);
    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, internal.analytics.backfillStatsBatch, {
        cursor: result.continueCursor,
      });
    }
  },
});

async function processOrdersBatch(
  ctx: MutationCtx,
  orders: Array<{
    sellerId: Id<"users">;
    productId: Id<"products">;
    status: string;
    vendorShare?: number;
    amount: number;
  }>
) {
  for (const order of orders) {
    if (order.status !== "paid") continue;
    const earnings = order.vendorShare ?? order.amount;
    await ensureSellerStats(ctx, order.sellerId);
    await ensureProductStats(ctx, order.productId);

    const seller = await ctx.db
      .query("sellerStats")
      .withIndex("by_seller", (q) => q.eq("sellerId", order.sellerId))
      .first();
    if (seller) {
      await ctx.db.patch(seller._id, {
        totalSales: seller.totalSales + 1,
        totalEarnings: seller.totalEarnings + earnings,
      });
    }

    const product = await ctx.db
      .query("productStats")
      .withIndex("by_product", (q) => q.eq("productId", order.productId))
      .first();
    if (product) {
      await ctx.db.patch(product._id, {
        sales: product.sales + 1,
        revenue: product.revenue + earnings,
      });
    }
  }
}
