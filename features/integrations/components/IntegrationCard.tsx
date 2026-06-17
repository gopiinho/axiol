"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IntegrationDefinition, Integration } from "@/features/integrations/types";

interface IntegrationCardProps {
  definition: IntegrationDefinition;
  integration?: Integration;
}

function StatusBadge({ integration }: { integration: Integration }) {
  const status = integration.computedStatus;

  if (status === "connected") {
    return <Badge className="tone-ok border-0">Connected</Badge>;
  }

  if (status === "expiring_soon") {
    return <Badge className="tone-warn border-0">Expiring Soon</Badge>;
  }

  if (status === "error") {
    return (
      <Badge variant="destructive" className="border-0">
        Error
      </Badge>
    );
  }

  if (status === "expired") {
    return <Badge className="tone-warn border-0">Expired</Badge>;
  }

  return null;
}

export default function IntegrationCard({ definition, integration }: IntegrationCardProps) {
  const isPlaceholder = definition.provider === "google_calendar";
  const isEmpty = !integration || integration.computedStatus === "disconnected";

  return (
    <div className="app-panel overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center ${definition.brandColor}`}
        >
          {typeof definition.icon === "string" ? (
            <img src={definition.icon} alt="" className="h-7 w-7" />
          ) : (
            <definition.icon className="h-7 w-7" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-foreground text-sm font-semibold">{definition.name}</p>
            {integration && <StatusBadge integration={integration} />}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {definition.description}
          </p>
        </div>
      </div>

      <div className="border-border/50 flex items-end justify-end border-t px-4 py-3">
        {isPlaceholder ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">Coming soon</p>
            <Badge variant="secondary" className="text-xs">
              Not available
            </Badge>
          </div>
        ) : isEmpty ? (
          <Button asChild size="sm" className="w-full gap-1.5 sm:w-auto">
            <a href={definition.connectUrl}>Connect {definition.name}</a>
          </Button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {integration.displayName ? (
                <p className="text-foreground truncate text-sm font-medium">
                  @{integration.displayName}
                </p>
              ) : integration.externalId ? (
                <p className="text-muted-foreground truncate text-sm">
                  ID: {integration.externalId}
                </p>
              ) : null}
              {integration.tokenExpiresAt && integration.computedStatus !== "error" && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Expires {new Date(integration.tokenExpiresAt).toLocaleDateString()}
                </p>
              )}
              {integration.errorMessage && (
                <p className="text-destructive mt-0.5 truncate text-xs">
                  {integration.errorMessage}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 gap-1.5">
              <a href={definition.connectUrl}>
                <RefreshCw className="h-3.5 w-3.5" />
                Reconnect
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
