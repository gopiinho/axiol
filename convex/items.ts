import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminSession } from "./security";
import { validateItemInput } from "../lib/validators/items";

export const listBySection = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    sectionId: v.id("sections"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.string(),
    itemTitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);
    const validated = validateItemInput({
      affiliateLink: args.affiliateLink,
      price: args.price,
      platform: args.platform,
      itemTitle: args.itemTitle,
      imageUrl: args.imageUrl,
    });

    return await ctx.db.insert("items", {
      sectionId: args.sectionId,
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
    token: v.string(),
    id: v.id("items"),
    affiliateLink: v.string(),
    price: v.optional(v.string()),
    platform: v.string(),
    itemTitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);
    const validated = validateItemInput({
      affiliateLink: args.affiliateLink,
      price: args.price,
      platform: args.platform,
      itemTitle: args.itemTitle,
      imageUrl: args.imageUrl,
    });

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
    token: v.string(),
    id: v.id("items"),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
