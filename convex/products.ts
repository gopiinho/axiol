import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireSession } from "./security";
import { validateProductInput } from "../lib/validators/products";
import { parsePriceRupees } from "../lib/validators/price";
import {
  thumbnailConfigValidator,
  checkoutConfigValidator,
  contentConfigValidator,
  productTypeValidator,
} from "./productConfig";
import {
  PRODUCT_TYPES,
  getProductTypeDefinition,
  hasCapability,
} from "../features/products/registry/productTypes";
import type { ProductTypeKey } from "../features/products/registry/productTypes";
import { getDefaultConfig } from "../features/products/registry/defaults";
import { validateProductForPublish } from "../features/products/registry/publishValidation";

type ProductCtx = MutationCtx | QueryCtx;

async function ensureUniqueProductUrl(
  ctx: ProductCtx,
  userId: Id<"users">,
  productUrl: string,
  excludeProductId?: Id<"products">
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

async function requireProductOwner(ctx: MutationCtx | QueryCtx, productId: Id<"products">) {
  const { userId } = await requireSession(ctx);
  const product = await ctx.db.get(productId);
  if (!product || product.createdBy !== userId) {
    throw new Error("Product not found.");
  }
  return { userId, product };
}

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireSession(ctx);

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
          .take(100);
        const coverImageUrl = product.coverImageId
          ? await ctx.storage.getUrl(product.coverImageId)
          : null;
        const config = product.config;
        const thumb = config.thumbnail;
        const thumbnailImageUrl = thumb?.imageId ? await ctx.storage.getUrl(thumb.imageId) : null;
        return { ...product, itemCount: items.length, coverImageUrl, thumbnailImageUrl, username: user.username };
      })
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

    const config = product.config;
    const thumb = config.thumbnail;
    const thumbnailImageUrl = thumb?.imageId ? await ctx.storage.getUrl(thumb.imageId) : null;

    return {
      ...product,
      coverImageUrl,
      thumbnailImageUrl,
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
        q.eq("productUrl", args.productUrl).eq("createdBy", userId)
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
    type: productTypeValidator,
    automationEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);
    const validated = validateProductInput({
      ...args,
      status: "draft",
    });

    const productUrl = await ensureUniqueProductUrl(ctx, userId, validated.productUrl);
    const defaultConfig = getDefaultConfig(validated.type as ProductTypeKey);
    const now = Date.now();

    return await ctx.db.insert("products", {
      createdBy: userId,
      name: validated.name,
      productUrl,
      description: validated.description,
      coverImageId: args.coverImageId,
      price: validated.price,
      priceCents: parsePriceRupees(validated.price),
      type: validated.type as "affiliate" | "digital",
      status: "draft",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: defaultConfig as any,
      createdAt: now,
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
    price: v.optional(v.string()),
    type: productTypeValidator,
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
      price: validated.price,
      priceCents: parsePriceRupees(validated.price),
      type: validated.type as "affiliate" | "digital",
      automationEnabled: validated.automationEnabled,
      updatedAt: Date.now(),
    });
  },
});

export const updateThumbnailConfig = mutation({
  args: {
    productId: v.id("products"),
    config: thumbnailConfigValidator,
  },
  handler: async (ctx, args) => {
    const { product } = await requireProductOwner(ctx, args.productId);
    const definition = getProductTypeDefinition(product.type);
    if (!hasCapability(definition, "thumbnail")) {
      throw new Error("This product type does not support thumbnail configuration.");
    }
    await ctx.db.patch(args.productId, {
      config: {
        ...product.config,
        thumbnail: { ...(product.config.thumbnail ?? {}), ...args.config },
      },
      updatedAt: Date.now(),
    });
  },
});

export const updateCheckoutConfig = mutation({
  args: {
    productId: v.id("products"),
    config: checkoutConfigValidator,
  },
  handler: async (ctx, args) => {
    const { product } = await requireProductOwner(ctx, args.productId);
    const definition = getProductTypeDefinition(product.type);
    if (!hasCapability(definition, "checkout")) {
      throw new Error("This product type does not support checkout configuration.");
    }
    await ctx.db.patch(args.productId, {
      config: {
        ...product.config,
        checkout: { ...(product.config.checkout ?? {}), ...args.config },
      },
      updatedAt: Date.now(),
    });
  },
});

export const updateContentConfig = mutation({
  args: {
    productId: v.id("products"),
    config: contentConfigValidator,
  },
  handler: async (ctx, args) => {
    const { product } = await requireProductOwner(ctx, args.productId);
    const definition = getProductTypeDefinition(product.type);
    if (!hasCapability(definition, "contentDelivery")) {
      throw new Error("This product type does not support content delivery.");
    }
    await ctx.db.patch(args.productId, {
      config: { ...product.config, content: args.config },
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
    const { userId, product } = await requireProductOwner(ctx, args.id);

    if (product.type === "affiliate") {
      const items = await ctx.db
        .query("productItems")
        .withIndex("by_product", (q) => q.eq("productId", args.id))
        .take(1);
      if (items.length === 0) {
        throw new Error("Add at least one item before publishing.");
      }
    }

    const definition = getProductTypeDefinition(product.type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validation = validateProductForPublish(product as any, definition);
    if (!validation.valid) {
      throw new Error(validation.errors.map((e) => e.message).join("\n"));
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
        q.eq("productUrl", args.productUrl).eq("createdBy", user._id)
      )
      .first();

    if (!product || product.status !== "published") return null;

    const items = await ctx.db
      .query("productItems")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .order("asc")
      .collect();

    const coverUrl = product.coverImageId ? await ctx.storage.getUrl(product.coverImageId) : null;

    const checkoutCoverId = product.config.checkout?.coverImageId;
    const checkoutCoverUrl = checkoutCoverId ? await ctx.storage.getUrl(checkoutCoverId) : null;

    const { thumbnail: thumb } = product.config;
    const thumbnailUrl = thumb?.imageId ? await ctx.storage.getUrl(thumb.imageId) : null;

    const profileImageUrl = user.profileImageId
      ? await ctx.storage.getUrl(user.profileImageId)
      : null;

    const definition = PRODUCT_TYPES[product.type] ?? null;

    return {
      product: {
        ...product,
        coverImageUrl: checkoutCoverUrl || coverUrl,
        thumbnailImageUrl: thumbnailUrl,
      },
      creator: {
        name: user.name,
        storeName: user.storeName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        profileImageUrl,
        palette: user.palette,
        layout: user.layout,
        theme: user.theme,
        instagramUrl: user.instagramUrl,
        youtubeUrl: user.youtubeUrl,
        websiteUrl: user.websiteUrl,
      },
      items,
      definition: definition
        ? {
            key: definition.key,
            label: definition.label,
            description: definition.description,
            capabilities: definition.capabilities,
            requiresPrice: definition.requiresPrice,
            defaultThumbnailStyle: definition.defaultThumbnailStyle,
            defaultButtonText: definition.defaultButtonText,
          }
        : null,
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

    const withImages = await Promise.all(
      products.map(async (p) => {
        const config = p.config;
        const thumb = config.thumbnail;
        const thumbnailImageUrl = thumb?.imageId ? await ctx.storage.getUrl(thumb.imageId) : null;
        return {
          _id: p._id,
          name: p.name,
          price: p.price ?? null,
          thumbnailImageUrl,
          productUrl: p.productUrl,
        };
      })
    );

    return withImages;
  },
});
