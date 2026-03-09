import { MutationCtx, QueryCtx } from "./_generated/server";

const SESSION_IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

type SessionCtx = MutationCtx | QueryCtx;

export async function requireAdminSession(
  ctx: SessionCtx,
  token: string
): Promise<void> {
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
}
