"use client";

import { getAuthToken } from "@/lib/auth";

export function getAdminSessionToken() {
  return getAuthToken();
}

export function requireAdminSessionToken() {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Unauthorized");
  }
  return token;
}
