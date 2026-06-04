"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  IntegrationDefinition,
  Integration,
} from "@/features/integrations/types";

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

export default function IntegrationCard({
  definition,
  integration,
}: IntegrationCardProps) {
  const isPlaceholder = definition.provider === "google_calendar";
  const isEmpty = !integration || integration.computedStatus === "disconnected";

  return (
    <div className="app-panel overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${definition.brandColor}`}
        >
          {typeof definition.icon === "string" ? (
            <img
              src={definition.icon}
              alt=""
              className="h-5 w-5"
            />
          ) : (
            <definition.icon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {definition.name}
            </p>
            {integration && <StatusBadge integration={integration} />}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            {definition.description}
          </p>
        </div>
      </div>

      <div className="border-t border-border/50 px-4 py-3 items-end justify-end flex">
        {isPlaceholder ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Coming soon</p>
            <Badge variant="secondary" className="text-xs">
              Not available
            </Badge>
          </div>
        ) : isEmpty ? (
          <Button asChild size="sm" className="gap-1.5 w-full sm:w-auto">
            <a href={definition.connectUrl}>Connect {definition.name}</a>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              {integration.displayName ? (
                <p className="text-sm font-medium text-foreground truncate">
                  @{integration.displayName}
                </p>
              ) : integration.externalId ? (
                <p className="text-sm text-muted-foreground truncate">
                  ID: {integration.externalId}
                </p>
              ) : null}
              {integration.tokenExpiresAt &&
                integration.computedStatus !== "error" && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Expires{" "}
                    {new Date(integration.tokenExpiresAt).toLocaleDateString()}
                  </p>
                )}
              {integration.errorMessage && (
                <p className="text-xs text-destructive mt-0.5 truncate">
                  {integration.errorMessage}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 shrink-0"
            >
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
