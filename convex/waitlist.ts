import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const joinWaitlist = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return { status: "already_registered" as const };
    }

    await ctx.db.insert("waitlist", { email });
    return { status: "success" as const };
  },
});
