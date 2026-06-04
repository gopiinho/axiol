"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import AutomationsList from "@/features/automations/components/AutomationsList";
import InstagramConnectOverlay from "@/features/automations/components/InstagramConnectOverlay";
import { useInstagramConnection } from "@/features/automations/hooks/useInstagramConnection";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

function SuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mx-5 mt-4 sm:mx-8 sm:mt-6 flex items-center gap-3 rounded-xl bg-linear-to-r from-[#833AB4]/10 via-[#E1306C]/8 to-[#F77737]/10 border border-pink-subtle/30 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-pink" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Instagram connected
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          You can now create automations.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function AutomationsPage() {
  const ig = useInstagramConnection();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(
    () => searchParams.get("ig_connected") === "true",
  );

  if (ig.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-pink-500" />
      </div>
    );
  }

  if (!ig.isUsable) {
    return <InstagramConnectOverlay />;
  }

  return (
    <div>
      {showSuccess && (
        <FadeIn>
          <SuccessBanner onDismiss={() => setShowSuccess(false)} />
        </FadeIn>
      )}

      <FadeIn>
        <section className="p-5 sm:p-8 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="app-title">Automations</h1>
              <p className="app-subtitle mt-1">
                Auto-DM product links to your followers and boost your sales.
              </p>
            </div>
            <Link href="/dashboard/automations/new">
              <Button size="lg" className="gap-2 sm:self-start">
                New Automation
              </Button>
            </Link>
          </div>
        </section>
      </FadeIn>

      <AutomationsList />
    </div>
  );
}
