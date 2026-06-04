"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useIntegration } from "@/features/integrations/hooks/useIntegrations";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";

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
    return {
      status: "expiring_soon",
      instagramUsername: undefined,
      instagramAccountId: undefined,
      tokenExpiresAt: config.tokenExpiresAt,
      isConnected: true,
      isUsable: true,
    };
  }

  return {
    status: "connected",
    instagramUsername: undefined,
    instagramAccountId: undefined,
    tokenExpiresAt: config.tokenExpiresAt,
    isConnected: true,
    isUsable: true,
  };
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

  const connection = useMemo(
    () => mapIntegrationStatus(integration, config),
    [integration, config],
  );

  return (
    useCachedQueryResult(
      "instagramConnection",
      connection.status !== "loading" ? connection : undefined,
    ) ?? connection
  );
}
