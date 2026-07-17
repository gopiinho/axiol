import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireVerifiedSession } from "./security";

export const saveVendorDetails = mutation({
  args: {
    vendorId: v.string(),
    vendorStatus: v.string(),
    panNumber: v.string(),
    addressProofType: v.optional(v.string()),
    addressProofNumber: v.optional(v.string()),
    payoutMethod: v.union(v.literal("bank"), v.literal("upi")),
    bankAccount: v.optional(v.string()),
    bankIfsc: v.optional(v.string()),
    bankHolder: v.optional(v.string()),
    upiVpa: v.optional(v.string()),
    upiHolder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    const patch: Record<string, unknown> = {
      vendorId: args.vendorId,
      vendorStatus: args.vendorStatus,
      panNumber: args.panNumber,
      addressProofType: args.addressProofType,
      addressProofNumber: args.addressProofNumber,
      payoutMethod: args.payoutMethod,
      bankAccount: args.bankAccount,
      bankIfsc: args.bankIfsc,
      bankHolder: args.bankHolder,
      upiVpa: args.upiVpa,
      upiHolder: args.upiHolder,
      vendorCreatedAt: Date.now(),
    };

    await ctx.db.patch(userId, patch);
  },
});

export const updateVendorStatus = mutation({
  args: {
    vendorStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireVerifiedSession(ctx);

    await ctx.db.patch(userId, {
      vendorStatus: args.vendorStatus,
    });
  },
});

export const updateVendorStatusByVendorId = mutation({
  args: {
    vendorId: v.string(),
    vendorStatus: v.string(),
    documentStatus: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const prefix = "axiol_";
    if (!args.vendorId.startsWith(prefix)) return;
    const idString = args.vendorId.slice(prefix.length);
    const userId = ctx.db.normalizeId("users", idString);
    if (!userId) return;

    const patch: Record<string, unknown> = {
      vendorStatus: args.vendorStatus,
    };
    if (args.documentStatus) {
      patch.vendorDocumentStatus = args.documentStatus;
    }

    await ctx.db.patch(userId, patch);
  },
});

export const getPayoutProfile = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireVerifiedSession(ctx);
    const user = await ctx.db.get(userId);

    if (!user) return null;

    return {
      vendorId: user.vendorId,
      vendorStatus: user.vendorStatus,
      panNumber: user.panNumber,
      addressProofType: user.addressProofType,
      addressProofNumber: user.addressProofNumber,
      vendorDocumentStatus: user.vendorDocumentStatus,
      payoutMethod: user.payoutMethod,
      bankAccount: user.bankAccount,
      bankIfsc: user.bankIfsc,
      bankHolder: user.bankHolder,
      upiVpa: user.upiVpa,
      upiHolder: user.upiHolder,
      vendorCreatedAt: user.vendorCreatedAt,
    };
  },
});

export const getPayoutProfileForOrder = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) return null;

    return {
      userId: user._id,
      vendorId: user.vendorId,
      vendorStatus: user.vendorStatus,
      subscriptionStatus: user.subscriptionStatus,
    };
  },
});
