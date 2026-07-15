"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/features/auth/client/UserContext";
import { PaymentSetupForm } from "./payments/PaymentSetupForm";
import { PaymentStatusView } from "./payments/PaymentStatusView";

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-foreground text-sm font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
    </div>
  );
}

export function PaymentsTab() {
  const { user: profile } = useUser();
  const payoutProfile = useQuery(api.vendors.getPayoutProfile);

  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const vendorStatus = payoutProfile?.vendorStatus ?? localStatus;

  if (payoutProfile === undefined) {
    return (
      <div>
        <SectionHeader title="Payments" description="Set up how you receive your earnings." />
        <div className="mt-8 flex items-center justify-center">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Payments"
        description="Set up how you receive your earnings. Your money is settled directly by Cashfree."
      />

      {vendorStatus === null ? (
        <PaymentSetupForm
          userName={profile?.name}
          onComplete={setLocalStatus}
        />
      ) : payoutProfile ? (
        <PaymentStatusView profile={payoutProfile} />
      ) : null}
    </div>
  );
}
