import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireSession } from "./security";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_COVER_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireSession(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfileImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const { userId, user } = await requireSession(ctx);

    const metadata = await ctx.storage.getMetadata(args.storageId);
    if (!metadata) throw new Error("File not found");
    if (!ALLOWED_IMAGE_TYPES.includes(metadata.contentType ?? "")) {
      await ctx.storage.delete(args.storageId);
      throw new Error(
        "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
      );
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

export const saveCoverImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const { userId, user } = await requireSession(ctx);

    const metadata = await ctx.storage.getMetadata(args.storageId);
    if (!metadata) throw new Error("File not found");
    if (!ALLOWED_IMAGE_TYPES.includes(metadata.contentType ?? "")) {
      await ctx.storage.delete(args.storageId);
      throw new Error(
        "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
      );
    }
    if (metadata.size > MAX_COVER_IMAGE_SIZE) {
      await ctx.storage.delete(args.storageId);
      throw new Error("File too large. Cover image must be under 4 MB.");
    }

    if (user.coverImageId) {
      await ctx.storage.delete(user.coverImageId);
    }

    await ctx.db.patch(userId, { coverImageId: args.storageId });
  },
});

export const removeProfileImage = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireSession(ctx);

    if (user.profileImageId) {
      await ctx.storage.delete(user.profileImageId);
      await ctx.db.patch(userId, { profileImageId: undefined });
    }
  },
});

export const removeCoverImage = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireSession(ctx);

    if (user.coverImageId) {
      await ctx.storage.delete(user.coverImageId);
      await ctx.db.patch(userId, { coverImageId: undefined });
    }
  },
});
