import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { api } from "@/convex/_generated/api";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth-cookies";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const result = await convex.mutation(api.auth.verifySession, { token });
    return Boolean(result.valid);
  } catch {
    return false;
  }
}
