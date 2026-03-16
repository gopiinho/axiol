import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth-cookies";

const IG_OAUTH_STATE_COOKIE = "linkkit_ig_oauth_state";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function settingsRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/dashboard/settings", request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = NextResponse.redirect(url.toString());
  response.cookies.set(IG_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Check for errors from Meta
  if (searchParams.get("error")) {
    const reason = searchParams.get("error_reason") ?? "unknown";
    return settingsRedirect(request, { ig_error: reason });
  }

  // CSRF validation
  const stateParam = searchParams.get("state");
  const stateCookie = request.cookies.get(IG_OAUTH_STATE_COOKIE)?.value;

  if (!stateParam || !stateCookie || !timingSafeCompare(stateParam, stateCookie)) {
    return settingsRedirect(request, { ig_error: "csrf" });
  }

  // Session validation
  const sessionToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = searchParams.get("code");
  if (!code) {
    return settingsRedirect(request, { ig_error: "no_code" });
  }

  const clientId = process.env.DMHELPER_APP_ID!;
  const clientSecret = process.env.DMHELPER_APP_SECRET!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const redirectUri = `${siteUrl}/api/auth/instagram/callback`;

  try {
    // 1. Exchange code for short-lived token
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const shortLivedRes = await fetch(
      "https://api.instagram.com/oauth/access_token",
      { method: "POST", body: tokenBody },
    );

    if (!shortLivedRes.ok) {
      const error = await shortLivedRes.text();
      console.error("Short-lived token exchange failed:", error);
      return settingsRedirect(request, { ig_error: "token_exchange" });
    }

    const shortLivedData = (await shortLivedRes.json()) as {
      access_token: string;
      user_id: number;
    };

    // 2. Exchange for long-lived token
    const longLivedUrl = new URL("https://graph.instagram.com/access_token");
    longLivedUrl.searchParams.set("grant_type", "ig_exchange_token");
    longLivedUrl.searchParams.set("client_secret", clientSecret);
    longLivedUrl.searchParams.set("access_token", shortLivedData.access_token);

    const longLivedRes = await fetch(longLivedUrl.toString());

    if (!longLivedRes.ok) {
      const error = await longLivedRes.text();
      console.error("Long-lived token exchange failed:", error);
      return settingsRedirect(request, { ig_error: "token_exchange" });
    }

    const longLivedData = (await longLivedRes.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
    };

    // 3. Fetch IG user profile
    const profileUrl = new URL("https://graph.instagram.com/v24.0/me");
    profileUrl.searchParams.set("fields", "user_id,username");
    profileUrl.searchParams.set("access_token", longLivedData.access_token);

    const profileRes = await fetch(profileUrl.toString());

    let instagramUsername: string | undefined;
    let instagramAccountId = String(shortLivedData.user_id);

    if (profileRes.ok) {
      const profileData = (await profileRes.json()) as {
        user_id?: string;
        username?: string;
        id?: string;
      };
      instagramUsername = profileData.username;
      if (profileData.user_id) {
        instagramAccountId = profileData.user_id;
      } else if (profileData.id) {
        instagramAccountId = profileData.id;
      }
    }

    // 4. Save to Convex
    const convex = getConvexClient();
    await convex.mutation(api.instagram.saveConfig, {
      token: sessionToken,
      accessToken: longLivedData.access_token,
      instagramAccountId,
      instagramUsername,
    });

    return settingsRedirect(request, { ig_connected: "true" });
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    return settingsRedirect(request, { ig_error: "server" });
  }
}
