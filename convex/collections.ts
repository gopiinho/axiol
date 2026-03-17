import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./security";
import { validateSectionInput } from "../lib/validators/sections";

export const listByUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx, args.token);
    return await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();
  },
});

export const listPublic = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return null;

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("createdBy", user._id))
      .order("desc")
      .collect();

    return { user: { name: user.name, bio: user.bio, avatarUrl: user.avatarUrl }, collections };
  },
});

export const listByUserWithCover = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx, args.token);
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();

    return Promise.all(
      collections.map(async (col) => {
        const items = await ctx.db
          .query("items")
          .withIndex("by_collection", (q) => q.eq("collectionId", col._id))
          .collect();
        const firstItemWithImage = items.find((item) => item.imageUrl);
        return {
          ...col,
          coverImageUrl: firstItemWithImage?.imageUrl ?? null,
          itemCount: items.length,
        };
      }),
    );
  },
});

export const getById = query({
  args: { id: v.id("collections") },
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
    const { userId } = await requireSession(ctx, args.token);
    const validated = validateSectionInput({
      title: args.title,
      description: args.description,
    });

    return await ctx.db.insert("collections", {
      title: validated.title,
      description: validated.description,
      order: Date.now(),
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("collections"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx, args.token);
    const validated = validateSectionInput({
      title: args.title,
      description: args.description,
    });

    const collection = await ctx.db.get(args.id);
    if (!collection || collection.createdBy !== userId) {
      throw new Error("Collection not found");
    }

    await ctx.db.patch(args.id, {
      title: validated.title,
      description: validated.description,
    });
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    id: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx, args.token);

    const collection = await ctx.db.get(args.id);
    if (!collection || collection.createdBy !== userId) {
      throw new Error("Collection not found");
    }

    const items = await ctx.db
      .query("items")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
  },
});
