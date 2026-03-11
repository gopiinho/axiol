import {
  AUTH_EXPIRY_COOKIE,
  AUTH_TOKEN_COOKIE,
  AUTH_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/auth-cookies";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = encodeURIComponent(name);
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${encodedName}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") {
    return;
  }

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax` +
    secureFlag;
}

export const setAuthToken = (token: string, expiresAt: number) => {
  writeCookie(AUTH_TOKEN_COOKIE, token, AUTH_COOKIE_MAX_AGE_SECONDS);
  writeCookie(AUTH_EXPIRY_COOKIE, String(expiresAt), AUTH_COOKIE_MAX_AGE_SECONDS);
};

export const getAuthToken = (): string | null => {
  return readCookie(AUTH_TOKEN_COOKIE);
};

export const clearAuth = () => {
  writeCookie(AUTH_TOKEN_COOKIE, "", 0);
  writeCookie(AUTH_EXPIRY_COOKIE, "", 0);
};

export const isTokenExpired = (): boolean => {
  const expiry = readCookie(AUTH_EXPIRY_COOKIE);
  if (!expiry) {
    return true;
  }

  const parsedExpiry = Number.parseInt(expiry, 10);
  if (Number.isNaN(parsedExpiry)) {
    return true;
  }

  return Date.now() > parsedExpiry;
};
