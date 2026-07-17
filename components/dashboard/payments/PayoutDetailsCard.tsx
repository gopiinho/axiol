"use client";

import { maskText, type PayoutProfile } from "./types";

interface PayoutDetailsCardProps {
  profile: PayoutProfile;
}

export function PayoutDetailsCard({ profile }: PayoutDetailsCardProps) {
  const isBank = profile.payoutMethod === "bank";

  return (
    <div className="bg-muted/50 space-y-2 rounded-xs px-3 py-3 text-xs">
      <div className="flex justify-between">
        <span className="text-muted-foreground">PAN</span>
        <span className="text-foreground font-mono">
          {profile.panNumber ? maskText(profile.panNumber, 2, 4) : "—"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Method</span>
        <span className="text-foreground font-medium">{isBank ? "Bank Account" : "UPI"}</span>
      </div>
      {isBank ? (
        <>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account</span>
            <span className="text-foreground font-mono">
              {profile.bankAccount ? maskText(profile.bankAccount, 2, 4) : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">IFSC</span>
            <span className="text-foreground font-mono">{profile.bankIfsc || "—"}</span>
          </div>
        </>
      ) : (
        <div className="flex justify-between">
          <span className="text-muted-foreground">VPA</span>
          <span className="text-foreground font-mono">{profile.upiVpa || "—"}</span>
        </div>
      )}
    </div>
  );
}
