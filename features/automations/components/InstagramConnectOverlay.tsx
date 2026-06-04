"use client";

import { motion } from "motion/react";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";

export default function InstagramConnectOverlay() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-start px-5 py-16 lg:flex-row lg:py-28 lg:px-28">
      <FadeIn className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-md">
        <h1 className="font-(family-name:--font-space-grotesk) text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          Create an IG Auto-Reply
        </h1>
        <p className="my-6 text-muted-foreground leading-relaxed max-w-md">
          Set your engagement on autopilot! Just pick a keyword, craft your
          message, and watch as everyone who comments your magic word gets a
          personalized response instantly!
        </p>

        <Button asChild size="lg" className="mt-8 gap-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
          <a href="/api/auth/instagram">
            <Instagram className="h-4 w-4" />
            Connect Instagram
          </a>
        </Button>
      </FadeIn>
    </div>
  );
}
