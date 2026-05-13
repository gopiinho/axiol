import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireSession } from "./security";
import { validateProductInput } from "../lib/validators/products";

type ProductCtx = MutationCtx | QueryCtx;

async function ensureSlugAvailable(
  ctx: ProductCtx,
  userId: Id<"users">,
  slug: string,
  excludeProductId?: Id<"products">,
) {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug).eq("createdBy", userId))
    .first();

  if (existing && existing._id !== excludeProductId) {
    throw new Error("You already have a product with this slug.");
  }
}

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);

    return await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .order("desc")
      .take(100);
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const product = await ctx.db.get(args.id);
    if (!product || product.createdBy !== userId) {
      return null;
    }

    return product;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) =>
        q.eq("slug", args.slug).eq("createdBy", userId),
      )
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    price: v.optional(v.string()),
    type: v.union(v.literal("affiliate")),
    automationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const validated = validateProductInput({
      ...args,
      status: "draft",
    });

    await ensureSlugAvailable(ctx, userId, validated.slug);

    const now = Date.now();

    return await ctx.db.insert("products", {
      createdBy: userId,
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      coverImageId: args.coverImageId,
      price: validated.price,
      type: validated.type,
      status: "draft",
      publishedAt: undefined,
      updatedAt: now,
      automationEnabled: validated.automationEnabled,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    price: v.optional(v.string()),
    type: v.union(v.literal("affiliate")),
    automationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const product = await ctx.db.get(args.id);

    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found.");
    }

    const validated = validateProductInput({
      ...args,
      status: product.status,
    });

    await ensureSlugAvailable(ctx, userId, validated.slug, args.id);

    await ctx.db.patch(args.id, {
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      coverImageId: args.coverImageId,
      price: validated.price,
      type: validated.type,
      automationEnabled: validated.automationEnabled,
      updatedAt: Date.now(),
    });
  },
});

export const archive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const product = await ctx.db.get(args.id);

    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found.");
    }

    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });
  },
});

export const publish = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const product = await ctx.db.get(args.id);

    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found.");
    }

    const validated = validateProductInput({
      name: product.name,
      slug: product.slug,
      description: product.description,
      type: product.type,
      status: "published",
      automationEnabled: product.automationEnabled,
    });

    await ensureSlugAvailable(ctx, userId, validated.slug, args.id);

    await ctx.db.patch(args.id, {
      status: "published",
      publishedAt: product.publishedAt ?? Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const product = await ctx.db.get(args.id);

    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found.");
    }

    const items = await ctx.db
      .query("productItems")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    const mappings = await ctx.db
      .query("reelMappings")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();

    for (const mapping of mappings) {
      await ctx.db.delete(mapping._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const getPublicProduct = query({
  args: { username: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return null;

    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) =>
        q.eq("slug", args.slug).eq("createdBy", user._id),
      )
      .first();

    if (!product || product.status !== "published") return null;

    const items = await ctx.db
      .query("productItems")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .order("asc")
      .collect();

    const coverUrl = product.coverImageId
      ? await ctx.storage.getUrl(product.coverImageId)
      : null;

    return {
      product: {
        ...product,
        coverImageUrl: coverUrl,
      },
      items,
    };
  },
});

export const listForSelect = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();

    return products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
    }));
  },
});
