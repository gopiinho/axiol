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

  // (may have __Secure- prefix in production)
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
  matcher: ["/dashboard/:path*", "/login", "/signup", "/verify-email", "/forgot-password", "/reset-password", "/onboarding/username"],
};
