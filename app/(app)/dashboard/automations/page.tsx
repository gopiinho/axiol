"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import AutomationsList from "@/features/automations/components/AutomationsList";
import InstagramConnectOverlay from "@/features/automations/components/InstagramConnectOverlay";
import { useInstagramConnection } from "@/features/automations/hooks/useInstagramConnection";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

function SuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="border-pink-subtle/30 mx-5 mt-4 flex items-center gap-3 rounded-xl border bg-linear-to-r from-[#833AB4]/10 via-[#E1306C]/8 to-[#F77737]/10 px-4 py-3 sm:mx-8 sm:mt-6">
      <CheckCircle2 className="text-pink h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-semibold">Instagram connected</p>
        <p className="text-muted-foreground mt-0.5 text-xs">You can now create automations.</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:bg-muted shrink-0 rounded-lg p-1 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function AutomationsPage() {
  const ig = useInstagramConnection();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(() => searchParams.get("ig_connected") === "true");

  if (ig.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-muted h-8 w-8 animate-spin rounded-full border-4 border-t-pink-500" />
      </div>
    );
  }

  if (!ig.isUsable) {
    return <InstagramConnectOverlay />;
  }

  return (
    <div>
      {showSuccess && <SuccessBanner onDismiss={() => setShowSuccess(false)} />}

      <section className="border-b p-5 sm:p-8">
        <div className="flex items-center justify-between">
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

      <AutomationsList />
    </div>
  );
}
