import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AUTH_EXPIRY_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth-cookies";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function invalidateSession(token: string | null) {
  if (!token) {
    return;
  }

  try {
    await convex.mutation(api.auth.logout, { token });
  } catch {
    // Ignore backend logout errors and still clear browser cookies.
  }
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(AUTH_EXPIRY_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value ?? null;
  await invalidateSession(token);
  return clearAuthCookies(NextResponse.json({ success: true }));
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value ?? null;
  await invalidateSession(token);

  const next = request.nextUrl.searchParams.get("next");
  const redirectTarget = next && next.startsWith("/") ? next : "/login";
  const response = NextResponse.redirect(new URL(redirectTarget, request.url));
  return clearAuthCookies(response);
}
