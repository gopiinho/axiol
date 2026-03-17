"use client";

import Image from "next/image";
import { ExternalLink, Film } from "lucide-react";
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
          <h2 className="text-base font-semibold">Select a Reel</h2>
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
        <h2 className="text-base font-semibold">Select a Reel</h2>
        <p className="text-sm text-muted-foreground">
          {reelsLoading
            ? "Loading your recent reels..."
            : `Showing your latest ${reels.length} reels.`}
        </p>
      </div>

      {reelsLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-4/5 animate-pulse bg-muted" />
              <div className="space-y-2 p-2.5">
                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
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
        <div className="app-panel flex flex-col items-center py-14 text-center">
          <Film className="h-10 w-10 text-muted-foreground/30 animate-float" />
          <p className="mt-4 text-sm font-medium">No reels found</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            No recent reels are available for this account yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {reels.map((reel) => {
            const isSelected = selectedReelId === reel.id;
            return (
              <button
                type="button"
                key={reel.id}
                onClick={() => onSelectReel(reel)}
                className={`group overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/[0.04] shadow-sm"
                    : "border-transparent bg-card hover:border-border hover:shadow-sm"
                }`}
              >
                <div className="relative aspect-4/5 overflow-hidden bg-muted">
                  {reel.thumbnailUrl ? (
                    <Image
                      src={reel.thumbnailUrl}
                      alt="Reel"
                      width={420}
                      height={520}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No thumbnail
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 p-2.5">
                  <p className="line-clamp-2 text-xs font-medium leading-snug">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
