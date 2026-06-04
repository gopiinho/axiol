"use client";

import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InstagramStatus } from "@/features/automations/hooks/useInstagramConnection";

interface ConnectInstagramCTAProps {
  status: InstagramStatus;
  className?: string;
}

export default function ConnectInstagramCTA({
  status,
  className,
}: ConnectInstagramCTAProps) {
  if (status === "loading") {
    return (
      <div
        className={`flex items-center justify-center py-12 ${className ?? ""}`}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-pink-500" />
      </div>
    );
  }

  const isExpired = status === "expired";
  const isNotConnected = status === "not_connected";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 ${className ?? ""}`}
    >
      <div className="space-y-1 text-center">
        <h3 className="text-lg font-semibold">
          {isExpired
            ? "Instagram Disconnected"
            : isNotConnected
              ? "Connect Instagram"
              : "Instagram Connection Issue"}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isExpired
            ? "Your Instagram session expired. Reconnect to keep auto-DMs running."
            : isNotConnected
              ? "Link your Instagram to pull in your reels and start sending auto-DMs."
              : "Your Instagram connection needs attention."}
        </p>
      </div>

      <Button
        asChild
        className="gap-2 bg-linear-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white hover:opacity-90"
      >
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
        <a href="/api/auth/instagram">
          <Instagram className="h-4 w-4" />
          {isExpired ? "Reconnect Instagram" : "Connect Instagram"}
        </a>
      </Button>
    </div>
  );
}
