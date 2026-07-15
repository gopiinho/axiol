import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./security";

export const saveVendorDetails = mutation({
  args: {
    vendorId: v.string(),
    vendorStatus: v.string(),
    panNumber: v.string(),
    aadhaarNumber: v.string(),
    payoutMethod: v.union(v.literal("bank"), v.literal("upi")),
    bankAccount: v.optional(v.string()),
    bankIfsc: v.optional(v.string()),
    bankHolder: v.optional(v.string()),
    upiVpa: v.optional(v.string()),
    upiHolder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    await ctx.db.patch(userId, {
      vendorId: args.vendorId,
      vendorStatus: args.vendorStatus,
      panNumber: args.panNumber,
      aadhaarNumber: args.aadhaarNumber,
      payoutMethod: args.payoutMethod,
      bankAccount: args.bankAccount,
      bankIfsc: args.bankIfsc,
      bankHolder: args.bankHolder,
      upiVpa: args.upiVpa,
      upiHolder: args.upiHolder,
      vendorCreatedAt: Date.now(),
    });
  },
});

export const updateVendorStatus = mutation({
  args: {
    vendorStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireSession(ctx);

    await ctx.db.patch(userId, {
      vendorStatus: args.vendorStatus,
    });
  },
});

export const updateVendorStatusByVendorId = mutation({
  args: {
    vendorId: v.string(),
    vendorStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const prefix = "axiol_";
    if (!args.vendorId.startsWith(prefix)) return;
    const userId = args.vendorId.slice(prefix.length) as any;
    await ctx.db.patch(userId, {
      vendorStatus: args.vendorStatus,
    });
  },
});

export const getPayoutProfile = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireSession(ctx);
    const user = await ctx.db.get(userId);

    if (!user) return null;

    return {
      vendorId: user.vendorId,
      vendorStatus: user.vendorStatus,
      panNumber: user.panNumber,
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
