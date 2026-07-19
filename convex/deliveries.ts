import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { r2 } from "./contentStorage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DOWNLOADS = 5;

export const generateToken = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    if (order.status !== "paid") {
      throw new Error("Order is not paid");
    }

    const existing = await ctx.db
      .query("deliveryTokens")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existing) {
      return {
        token: existing.token,
        downloadUrl: `/api/download/${existing.token}`,
      };
    }

    const product = await ctx.db.get(order.productId);
    if (!product) throw new Error("Product not found");

    const content = product.config.content;
    if (!content || content.mode === "none") {
      throw new Error("Product has no deliverable content");
    }

    const token = crypto.randomUUID();
    const now = Date.now();

    await ctx.db.insert("deliveryTokens", {
      token,
      orderId: args.orderId,
      productId: order.productId,
      status: "active",
      downloadCount: 0,
      maxDownloads: MAX_DOWNLOADS,
      expiresAt: now + TOKEN_EXPIRY_MS,
      createdAt: now,
    });

    await ctx.db.insert("deliveries", {
      productId: order.productId,
      orderId: args.orderId,
      recipientEmail: order.buyerEmail,
      deliveryType: "download_link",
      status: "pending",
      createdAt: now,
    });

    return {
      token,
      downloadUrl: `/api/download/${token}`,
    };
  },
});

export const validateToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("deliveryTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!record) {
      return { valid: false, reason: "not_found" } as const;
    }

    if (record.status === "exhausted") {
      return { valid: false, reason: "exhausted" } as const;
    }

    if (record.status === "expired" || Date.now() > record.expiresAt) {
      return { valid: false, reason: "expired" } as const;
    }

    const product = await ctx.db.get(record.productId);
    if (!product) {
      return { valid: false, reason: "not_found" } as const;
    }

    const content = product.config.content;
    const productName = product.name;
    const displayName = content?.mode === "upload" ? content.displayName : undefined;
    const fileName = displayName || (content?.mode === "upload" ? content.fileName : undefined);

    if (content?.mode === "upload" && content.r2Key) {
      const safeName = (displayName || content.fileName || productName).replace(/"/g, "'");
      const command = new GetObjectCommand({
        Bucket: r2.config.bucket,
        Key: content.r2Key,
        ResponseContentDisposition: `attachment; filename="${safeName}"`,
      });
      const signedUrl = await getSignedUrl(r2.client, command, {
        expiresIn: 900,
      });
      return {
        valid: true as const,
        contentMode: "upload" as const,
        productName,
        fileName,
        signedUrl,
      };
    }

    if (content?.mode === "external_link" && content.url) {
      return {
        valid: true as const,
        contentMode: "external_link" as const,
        productName,
        fileName,
        externalUrl: content.url,
      };
    }

    return { valid: false, reason: "not_found" } as const;
  },
});

export const useDownload = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("deliveryTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!record) {
      throw new Error("Invalid download link");
    }

    if (record.status === "exhausted") {
      throw new Error("This download link is no longer available");
    }

    if (record.status === "expired" || Date.now() > record.expiresAt) {
      if (record.status !== "expired") {
        await ctx.db.patch(record._id, { status: "expired" });
      }
      throw new Error("This download link has expired");
    }

    const newCount = record.downloadCount + 1;
    const isExhausted = newCount >= record.maxDownloads;

    await ctx.db.patch(record._id, {
      downloadCount: newCount,
      status: isExhausted ? "exhausted" : "active",
    });

    await ctx.db.insert("deliveries", {
      productId: record.productId,
      orderId: record.orderId,
      recipientEmail: "",
      deliveryType: "redirect",
      status: "sent",
      createdAt: Date.now(),
      sentAt: Date.now(),
    });
  },
});

export const markDeliverySentByOrderId = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .take(1);

    const delivery = deliveries[0];
    if (delivery && delivery.status !== "sent") {
      await ctx.db.patch(delivery._id, {
        status: "sent",
        sentAt: Date.now(),
      });
    }
  },
});

export const getProductForDelivery = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    const seller = await ctx.db.get(product.createdBy);
    if (!seller) return null;

    return {
      name: product.name,
      storeName: seller.storeName || seller.name || "Axiol",
    };
  },
});
