import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireVerifiedSession } from "./security";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_PRODUCT_COVER_SIZE = 2 * 1024 * 1024;

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireVerifiedSession(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const generateProductCoverUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireVerifiedSession(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfileImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const { userId, user } = await requireVerifiedSession(ctx);

    let metadata;
    try {
      metadata = await ctx.storage.getMetadata(args.storageId);
    } catch {
      throw new Error("Upload expired or invalid. Please try uploading again.");
    }
    if (!metadata) throw new Error("Upload expired or invalid. Please try uploading again.");
    if (!ALLOWED_IMAGE_TYPES.includes(metadata.contentType ?? "")) {
      await ctx.storage.delete(args.storageId);
      throw new Error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
    }
    if (metadata.size > MAX_PROFILE_IMAGE_SIZE) {
      await ctx.storage.delete(args.storageId);
      throw new Error("File too large. Profile image must be under 2 MB.");
    }

    if (user.profileImageId) {
      await ctx.storage.delete(user.profileImageId);
    }

    await ctx.db.patch(userId, { profileImageId: args.storageId });
  },
});

export const saveProductCoverImage = mutation({
  args: { productId: v.id("products"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found");
    }

    let metadata;
    try {
      metadata = await ctx.storage.getMetadata(args.storageId);
    } catch {
      throw new Error("Upload expired or invalid. Please try uploading again.");
    }
    if (!metadata) throw new Error("Upload expired or invalid. Please try uploading again.");
    if (!ALLOWED_IMAGE_TYPES.includes(metadata.contentType ?? "")) {
      await ctx.storage.delete(args.storageId);
      throw new Error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
    }
    if (metadata.size > MAX_PRODUCT_COVER_SIZE) {
      await ctx.storage.delete(args.storageId);
      throw new Error("File too large. Product cover must be under 3 MB.");
    }

    if (product.coverImageId) {
      await ctx.storage.delete(product.coverImageId);
    }

    await ctx.db.patch(args.productId, { coverImageId: args.storageId });
  },
});

export const removeProductCoverImage = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found");
    }

    if (product.coverImageId) {
      await ctx.storage.delete(product.coverImageId);
      await ctx.db.patch(args.productId, { coverImageId: undefined });
    }
  },
});

export const saveThumbnailImage = mutation({
  args: { productId: v.id("products"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found");
    }
    let metadata;
    try {
      metadata = await ctx.storage.getMetadata(args.storageId);
    } catch {
      throw new Error("Upload expired or invalid. Please try uploading again.");
    }
    if (!metadata) throw new Error("Upload expired or invalid. Please try uploading again.");
    if (!ALLOWED_IMAGE_TYPES.includes(metadata.contentType ?? "")) {
      await ctx.storage.delete(args.storageId);
      throw new Error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
    }
    if (metadata.size > MAX_PRODUCT_COVER_SIZE) {
      await ctx.storage.delete(args.storageId);
      throw new Error("File too large. Thumbnail image must be under 2 MB.");
    }

    const { thumbnail: prev } = product.config;
    if (prev?.imageId) {
      await ctx.storage.delete(prev.imageId);
    }

    await ctx.db.patch(args.productId, {
      config: {
        ...product.config,
        thumbnail: {
          style: prev?.style ?? "preview",
          title: prev?.title ?? "",
          subtitle: prev?.subtitle,
          buttonText: prev?.buttonText ?? "Download Now",
          imageId: args.storageId,
        },
      },
      updatedAt: Date.now(),
    });
  },
});

export const removeThumbnailImage = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product || product.createdBy !== userId) {
      throw new Error("Product not found");
    }

    const { thumbnail: prev } = product.config;
    if (prev?.imageId) {
      await ctx.storage.delete(prev.imageId);
      await ctx.db.patch(args.productId, {
        config: {
          ...product.config,
          thumbnail: { ...prev, imageId: undefined },
        },
        updatedAt: Date.now(),
      });
    }
  },
});

export const removeProfileImage = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireVerifiedSession(ctx);

    if (user.profileImageId) {
      await ctx.storage.delete(user.profileImageId);
      await ctx.db.patch(userId, { profileImageId: undefined });
    }
  },
});
