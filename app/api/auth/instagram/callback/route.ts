import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { encryptToken } from "@/lib/instagram-crypto";
import { fetchAuthMutation, isAuthenticated } from "@/lib/auth-server";

const IG_OAUTH_STATE_COOKIE = "axiol_ig_oauth_state";

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function automationsRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/dashboard/automations", request.url);
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
    return automationsRedirect(request, { ig_error: reason });
  }

  // CSRF validation
  const stateParam = searchParams.get("state");
  const stateCookie = request.cookies.get(IG_OAUTH_STATE_COOKIE)?.value;

  if (!stateParam || !stateCookie || !timingSafeCompare(stateParam, stateCookie)) {
    return automationsRedirect(request, { ig_error: "csrf" });
  }

  // Session validation via Better Auth
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let code = searchParams.get("code");
  if (!code) {
    return automationsRedirect(request, { ig_error: "no_code" });
  }

  code = code.replace(/#_$/, "");

  const clientId = process.env.DMHELPER_APP_ID!;
  const clientSecret = process.env.DMHELPER_APP_SECRET!;
  const siteUrl = process.env.SITE_URL!.replace(/\/+$/, "");
  const redirectUri = `${siteUrl}/api/auth/instagram/callback`;
  console.log("Instagram OAuth redirect_uri used for token exchange:", redirectUri);

  try {
    // 1. Exchange code for short-lived token
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const shortLivedRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: tokenBody,
    });

    if (!shortLivedRes.ok) {
      const error = await shortLivedRes.text();
      console.error("Short-lived token exchange failed:", error);
      return automationsRedirect(request, { ig_error: "token_exchange" });
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
      return automationsRedirect(request, { ig_error: "token_exchange" });
    }

    const longLivedData = (await longLivedRes.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
    };

    // 3. Fetch IG user profile
    const profileUrl = new URL("https://graph.instagram.com/v25.0/me");
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

    // 4. Encrypt token and save to Convex (auth is automatic via fetchAuthMutation)
    const encryptedToken = await encryptToken(longLivedData.access_token);
    await fetchAuthMutation(api.instagram.saveConfig, {
      accessToken: encryptedToken,
      instagramAccountId,
      instagramUsername,
    });

    // 5. Register webhook subscription for this account
    let webhookSubscribed = false;
    try {
      const subscribeUrl = new URL(
        `https://graph.instagram.com/v25.0/${instagramAccountId}/subscribed_apps`
      );
      subscribeUrl.searchParams.set("subscribed_fields", "comments,messages");
      subscribeUrl.searchParams.set("access_token", longLivedData.access_token);

      const subscribeRes = await fetch(subscribeUrl.toString(), {
        method: "POST",
      });

      if (subscribeRes.ok) {
        const subscribeData = (await subscribeRes.json()) as {
          success?: boolean;
        };
        webhookSubscribed = subscribeData.success === true;
        console.log("Instagram webhook subscription result:", subscribeData);
      } else {
        const error = await subscribeRes.text();
        console.error("Instagram webhook subscription failed:", error);
      }
    } catch (err) {
      console.error("Instagram webhook subscription error:", err);
    }

    await fetchAuthMutation(api.instagram.setWebhookSubscribed, {
      instagramAccountId,
      subscribed: webhookSubscribed,
    });

    if (!webhookSubscribed) {
      try {
        await fetchAuthMutation(api.integrations.markError, {
          provider: "instagram",
          errorMessage: "Webhook subscription failed",
        });
      } catch (markErr) {
        console.error("Failed to mark integration error:", markErr);
      }
    }

    return automationsRedirect(request, { ig_connected: "true" });
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    return automationsRedirect(request, { ig_error: "server" });
  }
}
