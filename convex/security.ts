import { MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const SESSION_IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

type SessionCtx = MutationCtx | QueryCtx;

export async function requireSession(
  ctx: SessionCtx,
  token: string
): Promise<{ userId: Id<"users">; user: Doc<"users"> }> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const now = Date.now();
  const isExpired = session.expiresAt < now;
  const isIdle =
    session.lastUsedAt !== undefined &&
    now - session.lastUsedAt > SESSION_IDLE_TIMEOUT;

  if (isExpired || isIdle) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("Unauthorized");
  }

  return { userId: session.userId, user };
}

export async function requireCreatorSession(
  ctx: SessionCtx,
  token: string
): Promise<{ userId: Id<"users">; user: Doc<"users"> }> {
  const { userId, user } = await requireSession(ctx, token);

  if (user.accountType !== "creator" && user.accountType !== "admin") {
    throw new Error("Unauthorized: creator access required");
  }

  return { userId, user };
}

export async function requireAdminSession(
  ctx: SessionCtx,
  token: string
): Promise<{ userId: Id<"users">; user: Doc<"users"> }> {
  const { userId, user } = await requireSession(ctx, token);

  if (user.accountType !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }

  return { userId, user };
}
