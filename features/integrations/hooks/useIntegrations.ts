"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { IntegrationProvider, Integration } from "@/features/integrations/types";

export function useIntegrations() {
  const raw = useQuery(api.integrations.list);
  const integrations: Integration[] = (raw ?? []).map((row) => ({
    _id: row._id,
    provider: row.provider as IntegrationProvider,
    status: row.computedStatus as Integration["status"],
    computedStatus: row.computedStatus as Integration["status"],
    displayName: row.displayName,
    externalId: row.externalId,
    connectedAt: row.connectedAt,
    lastSyncAt: row.lastSyncAt,
    errorMessage: row.errorMessage,
    tokenExpiresAt: (row as { tokenExpiresAt?: number }).tokenExpiresAt,
  }));

  return {
    integrations,
    isLoading: raw === undefined,
  };
}

export function useIntegration(provider: IntegrationProvider) {
  const { integrations } = useIntegrations();
  return integrations.find((i) => i.provider === provider);
}
