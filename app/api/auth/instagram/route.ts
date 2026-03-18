import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const IG_OAUTH_STATE_COOKIE = "linkkit_ig_oauth_state";

export async function GET(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.DMHELPER_APP_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!clientId || !siteUrl) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?ig_error=config", request.url),
    );
  }

  const stateBytes = new Uint8Array(32);
  crypto.getRandomValues(stateBytes);
  const state = Array.from(stateBytes, (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

  const redirectUri = `${siteUrl.replace(/\/+$/, "")}/api/auth/instagram/callback`;
  const scope =
    "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments";

  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(IG_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
