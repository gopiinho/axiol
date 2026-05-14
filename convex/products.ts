import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireSession } from "./security";
import { validateProductInput } from "../lib/validators/products";

type ProductCtx = MutationCtx | QueryCtx;

async function ensureUniqueProductUrl(
  ctx: ProductCtx,
  userId: Id<"users">,
  productUrl: string,
  excludeProductId?: Id<"products">,
): Promise<string> {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_productUrl", (q) => q.eq("productUrl", productUrl).eq("createdBy", userId))
    .first();

  if (!existing || existing._id === excludeProductId) {
    return productUrl;
  }

  let counter = 2;
  while (true) {
    const candidate = `${productUrl}-${counter}`;
    const dup = await ctx.db
      .query("products")
      .withIndex("by_productUrl", (q) => q.eq("productUrl", candidate).eq("createdBy", userId))
      .first();
    if (!dup || dup._id === excludeProductId) {
      return candidate;
    }
    counter++;
  }
}

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .order("desc")
      .take(100);

    const withItemCounts = await Promise.all(
      products.map(async (product) => {
        const items = await ctx.db
          .query("productItems")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect();
        return { ...product, itemCount: items.length };
      }),
    );

    return withItemCounts;
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

    const coverImageUrl = product.coverImageId
      ? await ctx.storage.getUrl(product.coverImageId)
      : null;

    return {
      ...product,
      coverImageUrl,
    };
  },
});

export const getByProductUrl = query({
  args: { productUrl: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    return await ctx.db
      .query("products")
      .withIndex("by_productUrl", (q) =>
        q.eq("productUrl", args.productUrl).eq("createdBy", userId),
      )
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    productUrl: v.optional(v.string()),
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

    const productUrl = await ensureUniqueProductUrl(ctx, userId, validated.productUrl);

    const now = Date.now();

    return await ctx.db.insert("products", {
      createdBy: userId,
      name: validated.name,
      productUrl,
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
    productUrl: v.optional(v.string()),
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

    const productUrl = await ensureUniqueProductUrl(ctx, userId, validated.productUrl, args.id);

    await ctx.db.patch(args.id, {
      name: validated.name,
      productUrl,
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

    if (product.type === "affiliate") {
      const items = await ctx.db
        .query("productItems")
        .withIndex("by_product", (q) => q.eq("productId", args.id))
        .take(1);
      if (items.length === 0) {
        throw new Error("Add at least one item before publishing.");
      }
    }

    const validated = validateProductInput({
      name: product.name,
      productUrl: product.productUrl,
      description: product.description,
      type: product.type,
      status: "published",
      automationEnabled: product.automationEnabled,
    });

    await ensureUniqueProductUrl(ctx, userId, validated.productUrl, args.id);

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
  args: { username: v.string(), productUrl: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return null;

    const product = await ctx.db
      .query("products")
      .withIndex("by_productUrl", (q) =>
        q.eq("productUrl", args.productUrl).eq("createdBy", user._id),
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
      productUrl: p.productUrl,
    }));
  },
});
