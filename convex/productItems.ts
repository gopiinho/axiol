import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireVerifiedSession } from "./security";
import { validateProductItemInput } from "../lib/validators/productItems";

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productItems")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.optional(v.string()),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);
    const validated = validateProductItemInput({
      affiliateLink: args.affiliateLink,
      price: args.price,
      platform: args.platform,
      title: args.title,
      imageUrl: args.imageUrl,
    });

    const product = await ctx.db.get(args.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found");
    }

    const existing = await ctx.db
      .query("productItems")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .first();

    const nextOrder = (existing?.order ?? 0) + 1;

    return await ctx.db.insert("productItems", {
      productId: args.productId,
      affiliateLink: validated.affiliateLink,
      price: validated.price,
      platform: validated.platform,
      title: validated.title,
      imageUrl: validated.imageUrl,
      order: nextOrder,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("productItems"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.optional(v.string()),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);
    const validated = validateProductItemInput({
      affiliateLink: args.affiliateLink,
      price: args.price,
      platform: args.platform,
      title: args.title,
      imageUrl: args.imageUrl,
    });

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const product = await ctx.db.get(item.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      affiliateLink: validated.affiliateLink,
      price: validated.price,
      platform: validated.platform,
      title: validated.title,
      imageUrl: validated.imageUrl,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("productItems") },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const product = await ctx.db.get(item.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("productItems"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    for (const { id, order } of args.items) {
      const item = await ctx.db.get(id);
      if (!item) continue;

      const product = await ctx.db.get(item.productId);
      if (!product || product.createdBy !== userId) {
        throw new Error("Unauthorized");
      }

      await ctx.db.patch(id, { order });
    }
  },
});
