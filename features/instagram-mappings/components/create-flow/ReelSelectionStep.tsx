"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Reel } from "@/features/instagram-mappings/types";
import type { InstagramStatus } from "@/features/instagram-mappings/hooks/useInstagramConnection";
import ConnectInstagramCTA from "@/features/instagram-mappings/components/ConnectInstagramCTA";

interface ReelSelectionStepProps {
  reels: Reel[];
  selectedReelId?: string;
  reelsLoading: boolean;
  reelsError: string | null;
  instagramStatus: InstagramStatus;
  onRetry: () => void;
  onSelectReel: (reel: Reel) => void;
}

export default function ReelSelectionStep({
  reels,
  selectedReelId,
  reelsLoading,
  reelsError,
  instagramStatus,
  onRetry,
  onSelectReel,
}: ReelSelectionStepProps) {
  if (
    instagramStatus === "not_connected" ||
    instagramStatus === "expired" ||
    instagramStatus === "loading"
  ) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Select a Reel</h2>
          <p className="text-sm text-muted-foreground">
            Connect your Instagram to get started.
          </p>
        </div>
        <ConnectInstagramCTA status={instagramStatus} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select a Reel</h2>
        <p className="text-sm text-muted-foreground">
          Showing the latest {reels.length} reels.
        </p>
      </div>

      {reelsLoading ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : reelsError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load reels</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{reelsError}</p>
            <Button type="button" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : reels.length === 0 ? (
        <Alert>
          <AlertTitle>No reels found</AlertTitle>
          <AlertDescription>
            No recent reels are available for this account yet.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {reels.map((reel) => (
            <button
              type="button"
              key={reel.id}
              onClick={() => onSelectReel(reel)}
              className={`group overflow-hidden rounded-2xl border text-left transition ${
                selectedReelId === reel.id
                  ? "border-pink-500 bg-pink-50"
                  : "border-border bg-card"
              }`}
            >
              <div className="aspect-4/5 overflow-hidden bg-muted">
                {reel.thumbnailUrl ? (
                  <Image
                    src={reel.thumbnailUrl}
                    alt="Reel"
                    width={420}
                    height={520}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No thumbnail
                  </div>
                )}
              </div>
              <div className="space-y-2 p-2.5">
                <p className="line-clamp-2 text-xs font-medium">
                  {reel.caption}
                </p>
                <a
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Open reel
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
