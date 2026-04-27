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

async function ensureCollectionOwnership(
  ctx: ProductCtx,
  userId: Id<"users">,
  collectionId?: Id<"collections">,
) {
  if (!collectionId) return;

  const collection = await ctx.db.get(collectionId);
  if (!collection || collection.createdBy !== userId) {
    throw new Error("Collection not found.");
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
      .collect();
  },
});

export const allProducts = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      products.map(async (product) => {
        const linkedCollection = product.collectionId
          ? await ctx.db.get(product.collectionId)
          : null;

        const linkedItems =
          product.collectionId && linkedCollection
            ? await ctx.db
                .query("items")
                .withIndex("by_collection", (q) =>
                  q.eq("collectionId", product.collectionId!),
                )
                .collect()
            : [];

        const fallbackCoverImage =
          linkedItems.find((item) => item.imageUrl)?.imageUrl ?? null;

        return {
          ...product,
          linkedCollectionTitle: linkedCollection?.title ?? null,
          linkedCollectionItemCount: linkedItems.length,
          coverImageUrl: product.coverImageUrl ?? fallbackCoverImage ?? null,
        };
      }),
    );
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
    coverImageUrl: v.optional(v.string()),
    price: v.optional(v.string()),
    type: v.union(v.literal("affiliate")),
    collectionId: v.optional(v.id("collections")),
    affiliateLink: v.optional(v.string()),
    automationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const validated = validateProductInput(args);

    await ensureCollectionOwnership(ctx, userId, args.collectionId);
    await ensureSlugAvailable(ctx, userId, validated.slug);

    const now = Date.now();

    return await ctx.db.insert("products", {
      createdBy: userId,
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      coverImageUrl: validated.coverImageUrl,
      price: validated.price,
      type: validated.type,
      collectionId: args.collectionId,
      affiliateLink: validated.affiliateLink,
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
    coverImageUrl: v.optional(v.string()),
    price: v.optional(v.string()),
    type: v.union(v.literal("affiliate")),
    collectionId: v.optional(v.id("collections")),
    affiliateLink: v.optional(v.string()),
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

    await ensureCollectionOwnership(ctx, userId, args.collectionId);
    await ensureSlugAvailable(ctx, userId, validated.slug, args.id);

    await ctx.db.patch(args.id, {
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      coverImageUrl: validated.coverImageUrl,
      price: validated.price,
      type: validated.type,
      collectionId: args.collectionId,
      affiliateLink: validated.affiliateLink,
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
      coverImageUrl: product.coverImageUrl,
      price: product.price,
      type: product.type,
      collectionId: product.collectionId,
      affiliateLink: product.affiliateLink,
      status: "published",
      automationEnabled: product.automationEnabled,
    });

    await ensureCollectionOwnership(ctx, userId, product.collectionId);
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

    await ctx.db.delete(args.id);
  },
});
