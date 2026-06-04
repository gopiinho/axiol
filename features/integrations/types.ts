import type { LucideIcon } from "lucide-react";

export type IntegrationProvider = "instagram" | "google_calendar";

export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "expiring_soon"
  | "expired"
  | "error"
  | "loading";

export type Integration = {
  _id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  computedStatus: IntegrationStatus;
  displayName?: string;
  externalId?: string;
  connectedAt?: number;
  lastSyncAt?: number;
  errorMessage?: string;
  tokenExpiresAt?: number;
};

export type IntegrationDefinition = {
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: LucideIcon | string;
  connectUrl: string;
  brandColor: string;
};
