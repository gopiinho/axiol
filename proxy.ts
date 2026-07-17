import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];
const UNVERIFIED_PAGES = [
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/onboarding/username",
];
const ALLOWED_UNAUTHED = [...AUTH_PAGES, ...UNVERIFIED_PAGES];
const SESSION_COOKIE = "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hostname = request.headers.get("host") || "";
  if (!hostname.startsWith("www.") && !hostname.includes("localhost")) {
    const url = request.nextUrl.clone();
    url.host = `www.${hostname}`;
    return NextResponse.redirect(url, 301);
  }

  const storeMatch = pathname.match(/^\/([A-Z][^/]*)$/);
  if (storeMatch) {
    return NextResponse.redirect(
      new URL(`/${storeMatch[1].toLowerCase()}`, request.url),
      301
    );
  }

  const productMatch = pathname.match(/^\/([A-Z][^/]*)\/p\/(.+)$/);
  if (productMatch) {
    return NextResponse.redirect(
      new URL(
        `/${productMatch[1].toLowerCase()}/p/${productMatch[2]}`,
        request.url
      ),
      301
    );
  }

  const hasSession =
    request.cookies.get(SESSION_COOKIE)?.value ||
    request.cookies.get(`__Secure-${SESSION_COOKIE}`)?.value;

  if (AUTH_PAGES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/onboarding/username",
    "/:username",
    "/:username/p/:productUrl",
    "/",
  ],
};
