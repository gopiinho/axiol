"use client";

import { Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

export default function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <FadeIn>
        <div className="text-center space-y-3">
          <Sparkles className="mx-auto h-10 w-10 text-primary/60" />
          <h1 className="font-accent text-2xl font-semibold">
            Welcome to Linkkit
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your creator dashboard. Use the sidebar to manage your store,
            collections, and analytics.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
