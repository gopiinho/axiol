import { v } from "convex/values";
import { R2 } from "@convex-dev/r2";
import { mutation } from "./_generated/server";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { requireSession } from "./security";
import { validateContentFile } from "./contentLimits";

export const r2 = new R2(components.contentStorage);

const MAX_PENDING_UPLOADS = 10;

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx) => {
    const { userId } = await requireSession(ctx);

    const pending = await ctx.db
      .query("contentUploads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (pending.length >= MAX_PENDING_UPLOADS) {
      throw new Error(
        "Too many pending uploads. Please remove unused files or save your product."
      );
    }
  },

  onUpload: async (ctx, _bucket, key) => {
    await requireSession(ctx);

    const metadata = await r2.getMetadata(ctx, key);
    if (!metadata) return;

    const fileName = key.split("/").pop() ?? key;
    const mimeType = metadata.contentType ?? "application/octet-stream";
    const size = metadata.size ?? 0;

    const validation = validateContentFile(mimeType, fileName, size);
    if (!validation.valid) {
      await r2.deleteObject(ctx, key);
      throw new Error(validation.error);
    }
  },
});

export const generateContentUploadUrl = generateUploadUrl;

export const recordContentFile = mutation({
  args: {
    r2Key: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const validation = validateContentFile(
      args.fileType,
      args.fileName,
      args.fileSize
    );
    if (!validation.valid) {
      await r2.deleteObject(ctx, args.r2Key);
      throw new Error(validation.error);
    }

    const existing = await ctx.db
      .query("contentUploads")
      .withIndex("by_key", (q) => q.eq("r2Key", args.r2Key))
      .first();

    if (!existing) {
      await ctx.db.insert("contentUploads", {
        userId,
        r2Key: args.r2Key,
        fileName: args.fileName,
        fileSize: args.fileSize,
        fileType: args.fileType,
        createdAt: Date.now(),
      });
    }
  },
});

export const deleteContentFile = mutation({
  args: { r2Key: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    const record = await ctx.db
      .query("contentUploads")
      .withIndex("by_key", (q) => q.eq("r2Key", args.r2Key))
      .first();

    if (record) {
      if (record.productId) {
        const product = await ctx.db.get(record.productId);
        if (product && product.createdBy === userId) {
          await r2.deleteObject(ctx, args.r2Key);
          await ctx.db.delete(record._id);
          return;
        }
      } else if (record.userId === userId) {
        await r2.deleteObject(ctx, args.r2Key);
        await ctx.db.delete(record._id);
        return;
      }
    }

    const userProducts = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("createdBy", userId))
      .collect();

    const referencedByProduct = userProducts.find(
      (p) =>
        p.config.content?.mode === "upload" &&
        p.config.content.r2Key === args.r2Key
    );

    if (referencedByProduct) {
      await r2.deleteObject(ctx, args.r2Key);
      if (record) {
        await ctx.db.delete(record._id);
      }
      return;
    }

    throw new Error("File not found or access denied.");
  },
});
