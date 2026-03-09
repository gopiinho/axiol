import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminSession } from "./security";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("sections").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("sections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);

    return await ctx.db.insert("sections", {
      title: args.title,
      description: args.description,
      order: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("sections"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
    });
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    id: v.id("sections"),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.token);

    const items = await ctx.db
      .query("items")
      .withIndex("by_section", (q) => q.eq("sectionId", args.id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
  },
});
