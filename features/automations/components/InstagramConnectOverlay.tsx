"use client";

import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstagramConnectOverlay() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-start px-5 py-16 lg:flex-row lg:px-28 lg:py-28">
      <div className="flex flex-col items-center text-center lg:max-w-md lg:items-start lg:text-left">
        <h1 className="text-foreground font-(family-name:--font-space-grotesk) text-5xl font-bold tracking-tight sm:text-7xl">
          Create an IG Auto-Reply
        </h1>
        <p className="text-muted-foreground my-6 max-w-md leading-relaxed">
          Set your engagement on autopilot! Just pick a keyword, craft your message, and watch as
          everyone who comments your magic word gets a personalized response instantly!
        </p>

        <Button asChild size="lg" className="mt-8 gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
          <a href="/api/auth/instagram">
            <Instagram className="h-4 w-4" />
            Connect Instagram
          </a>
        </Button>
      </div>
    </div>
  );
}
