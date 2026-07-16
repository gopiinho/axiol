"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Landmark, Smartphone, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PayoutMethod, PayoutProfile } from "./types";

interface BankEditFormProps {
  profile: PayoutProfile;
  onComplete: (status: string) => void;
  onCancel: () => void;
}

export function BankEditForm({ profile, onComplete, onCancel }: BankEditFormProps) {
  const [method, setMethod] = useState<PayoutMethod>(profile.payoutMethod || "bank");
  const [bankAccount, setBankAccount] = useState(profile.bankAccount || "");
  const [bankIfsc, setBankIfsc] = useState(profile.bankIfsc || "");
  const [bankHolder, setBankHolder] = useState(profile.bankHolder || "");
  const [upiVpa, setUpiVpa] = useState(profile.upiVpa || "");
  const [upiHolder, setUpiHolder] = useState(profile.upiHolder || "");
  const [submitting, setSubmitting] = useState(false);


  const validate = useCallback((): string | null => {
    if (method === "bank") {
      if (!bankAccount.trim()) return "Bank account number is required";
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfsc.toUpperCase()))
        return "Enter a valid IFSC (e.g. HDFC0001234)";
      if (!bankHolder.trim()) return "Account holder name is required";
    } else {
      if (!upiVpa.trim()) return "UPI VPA is required";
      if (!upiVpa.includes("@")) return "Enter a valid UPI VPA (e.g. name@upi)";
      if (!upiHolder.trim()) return "Account holder name is required";
    }
    return null;
  }, [method, bankAccount, bankIfsc, bankHolder, upiVpa, upiHolder]);

  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setSubmitting(true);

    try {
      const res = await fetch("/api/vendors/bank-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutMethod: method,
          bankAccount: method === "bank" ? bankAccount : undefined,
          bankIfsc: method === "bank" ? bankIfsc.toUpperCase() : undefined,
          bankHolder: method === "bank" ? bankHolder : undefined,
          upiVpa: method === "upi" ? upiVpa : undefined,
          upiHolder: method === "upi" ? upiHolder : undefined,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error || "Failed to update payment details", { description: "Please try again." });
        return;
      }

      toast.success("Payment details updated!");
      onComplete(data.status);
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  }, [method, bankAccount, bankIfsc, bankHolder, upiVpa, upiHolder, validate, onComplete]);

  return (
    <div className="app-panel space-y-5 px-4 py-5">
      <div>
        <p className="text-foreground text-sm font-semibold">Update Payment Details</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Update your settlement method. Your documents are unchanged.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("bank")}
          className={`flex flex-1 items-center gap-2 cursor-pointer rounded-md border px-3 py-3 text-sm transition-colors ${
            method === "bank"
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          <Landmark className="h-4 w-4 shrink-0" />
          <span className="font-medium">Bank Account</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod("upi")}
          className={`flex flex-1 items-center gap-2 cursor-pointer rounded-md border px-3 py-3 text-sm transition-colors ${
            method === "upi"
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span className="font-medium">UPI</span>
        </button>
      </div>

      {method === "bank" ? (
        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Account Number</label>
            <Input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter account number"
              maxLength={20}
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">IFSC Code</label>
            <Input
              value={bankIfsc}
              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
              placeholder="HDFC0001234"
              maxLength={11}
              className="font-mono uppercase"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Account Holder Name</label>
            <Input
              value={bankHolder}
              onChange={(e) => setBankHolder(e.target.value)}
              placeholder="Account holder name"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">UPI VPA</label>
            <Input
              value={upiVpa}
              onChange={(e) => setUpiVpa(e.target.value.toLowerCase())}
              placeholder="yourname@upi"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">Account Holder Name</label>
            <Input
              value={upiHolder}
              onChange={(e) => setUpiHolder(e.target.value)}
              placeholder="Account holder name"
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={submitting} className="w-full">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
