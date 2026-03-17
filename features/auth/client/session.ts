"use client";

import { getAuthToken } from "@/lib/auth";

export function getSessionToken() {
  return getAuthToken();
}

export function requireSessionToken() {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Unauthorized");
  }
  return token;
}
