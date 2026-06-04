"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useIntegration } from "@/features/integrations/hooks/useIntegrations";

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

function mapIntegrationStatus(
  integration:
    | {
        computedStatus: string;
        displayName?: string;
        externalId?: string;
        tokenExpiresAt?: number;
      }
    | undefined,
  config: { tokenExpiresAt: number } | null | undefined,
): InstagramConnection {
  if (config === undefined) {
    return emptyConnection("loading");
  }

  if (integration) {
    const status = integrationStatusToLegacy(integration.computedStatus);
    return {
      status,
      instagramUsername: integration.displayName,
      instagramAccountId: integration.externalId,
      tokenExpiresAt: integration.tokenExpiresAt,
      isConnected: status !== "not_connected" && status !== "loading",
      isUsable: status === "connected" || status === "expiring_soon",
    };
  }

  if (!config) return emptyConnection("not_connected");

  if (config.tokenExpiresAt < Date.now()) return emptyConnection("expired");
  if (config.tokenExpiresAt < Date.now() + 7 * 24 * 60 * 60 * 1000) {
    return emptyConnection("expiring_soon");
  }

  return emptyConnection("not_connected");
}

function integrationStatusToLegacy(
  status: string,
): InstagramStatus {
  switch (status) {
    case "connected":
      return "connected";
    case "expiring_soon":
      return "expiring_soon";
    case "expired":
      return "expired";
    case "error":
      return "not_connected";
    case "disconnected":
      return "not_connected";
    default:
      return "not_connected";
  }
}

function emptyConnection(status: InstagramStatus): InstagramConnection {
  return {
    status,
    instagramUsername: undefined,
    instagramAccountId: undefined,
    tokenExpiresAt: undefined,
    isConnected: status !== "not_connected" && status !== "loading",
    isUsable: status === "connected" || status === "expiring_soon",
  };
}

export function useInstagramConnection(): InstagramConnection {
  const integration = useIntegration("instagram");
  const config = useQuery(api.instagram.getConfigPublic);

  const [connection, setConnection] = useState<InstagramConnection>(() =>
    mapIntegrationStatus(integration, config),
  );

  useEffect(() => {
    setConnection(mapIntegrationStatus(integration, config));
  }, [integration, config]);

  return connection;
}
