"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export type InstagramStatus =
  | "loading"
  | "not_connected"
  | "connected"
  | "expiring_soon"
  | "expired";

export type InstagramConnection = {
  status: InstagramStatus;
  instagramUsername: string | undefined;
  instagramAccountId: string | undefined;
  tokenExpiresAt: number | undefined;
  isConnected: boolean;
  isUsable: boolean;
};

function computeStatus(
  config: { tokenExpiresAt: number } | null | undefined,
): InstagramStatus {
  if (config === undefined) return "loading";
  if (!config) return "not_connected";

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (config.tokenExpiresAt < now) return "expired";
  if (config.tokenExpiresAt < now + sevenDays) return "expiring_soon";
  return "connected";
}

export function useInstagramConnection(): InstagramConnection {
  const config = useQuery(api.instagram.getConfigPublic);

  const [status, setStatus] = useState<InstagramStatus>(() =>
    computeStatus(config),
  );

  useEffect(() => {
    setStatus(computeStatus(config));
  }, [config]);

  return {
    status,
    instagramUsername: config?.instagramUsername ?? undefined,
    instagramAccountId: config?.instagramAccountId ?? undefined,
    tokenExpiresAt: config?.tokenExpiresAt,
    isConnected:
      status === "connected" ||
      status === "expiring_soon" ||
      status === "expired",
    isUsable: status === "connected" || status === "expiring_soon",
  };
}
