import { MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

type SessionCtx = MutationCtx | QueryCtx;

export async function requireSession(
  ctx: SessionCtx,
): Promise<{ userId: Id<"users">; user: Doc<"users"> }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", identity.subject))
    .first();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { userId: user._id, user };
}

export async function getSession(
  ctx: SessionCtx,
): Promise<{ userId: Id<"users">; user: Doc<"users"> } | null> {
  try {
    return await requireSession(ctx);
  } catch {
    return null;
  }
}

export async function requireCreatorSession(
  ctx: SessionCtx,
): Promise<{ userId: Id<"users">; user: Doc<"users"> }> {
  const { userId, user } = await requireSession(ctx);

  if (user.accountType !== "creator" && user.accountType !== "admin") {
    throw new Error("Unauthorized: creator access required");
  }

  return { userId, user };
}

export async function requireAdminSession(
  ctx: SessionCtx,
): Promise<{ userId: Id<"users">; user: Doc<"users"> }> {
  const { userId, user } = await requireSession(ctx);

  if (user.accountType !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }

  return { userId, user };
}
