"use client";

import { Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface DmPreviewStepProps {
  canPreview: boolean;
  previewLoading: boolean;
  previewError: string | null;
  previewMessage?: string;
  characterCount?: number;
}

export default function DmPreviewStep({
  canPreview,
  previewLoading,
  previewError,
  previewMessage,
  characterCount,
}: DmPreviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Message Preview</h2>
        <p className="text-muted-foreground text-sm">
          Preview the DM your followers will receive.
        </p>
      </div>

      <div>
        {previewLoading ? (
          <div className="border-border/70 bg-card space-y-2 rounded-xs border p-4">
            <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-4/5 animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-3/5 animate-pulse rounded" />
          </div>
        ) : !canPreview ? (
          <Alert>
            <AlertTitle>Preview not ready</AlertTitle>
            <AlertDescription>
              Select a product above to see what your followers will receive.
            </AlertDescription>
          </Alert>
        ) : previewError ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t generate preview</AlertTitle>
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
        ) : previewMessage ? (
          <div className="space-y-3">
            <Textarea
              value={previewMessage}
              readOnly
              rows={12}
              className="border-border/70 bg-card space-y-2 rounded-xs border p-4"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={`text-xs ${characterCount && characterCount > 1000 ? "tone-danger" : ""}`}
              >
                {characterCount ?? 0}/1000 chars
              </Badge>
              {characterCount && characterCount > 1000 && (
                <span className="text-destructive text-xs font-medium">
                  Instagram may cut off this message
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
