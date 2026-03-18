import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./security";
import { validateItemInput } from "../lib/validators/items";

export const listByCollection = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.collectionId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    collectionId: v.id("collections"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.string(),
    itemTitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const validated = validateItemInput({
      affiliateLink: args.affiliateLink,
      price: args.price,
      platform: args.platform,
      itemTitle: args.itemTitle,
      imageUrl: args.imageUrl,
    });

    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.createdBy !== userId) {
      throw new Error("Collection not found");
    }

    return await ctx.db.insert("items", {
      collectionId: args.collectionId,
      affiliateLink: validated.affiliateLink,
      price: validated.price,
      platform: validated.platform,
      itemTitle: validated.itemTitle,
      imageUrl: validated.imageUrl,
      order: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.string(),
    itemTitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const validated = validateItemInput({
      affiliateLink: args.affiliateLink,
      price: args.price,
      platform: args.platform,
      itemTitle: args.itemTitle,
      imageUrl: args.imageUrl,
    });

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const collection = await ctx.db.get(item.collectionId);
    if (!collection || collection.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      affiliateLink: validated.affiliateLink,
      price: validated.price,
      platform: validated.platform,
      itemTitle: validated.itemTitle,
      imageUrl: validated.imageUrl,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("items"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item not found");

    const collection = await ctx.db.get(item.collectionId);
    if (!collection || collection.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
