"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { Loader2, CheckCircle2, Clock, AlertCircle, Landmark, Smartphone, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/features/auth/client/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function maskText(value: string, showStart = 2, showEnd = 4) {
  if (!value) return "";
  if (value.length <= showStart + showEnd) return value;
  const masked = "*".repeat(Math.min(value.length - showStart - showEnd, 6));
  return value.slice(0, showStart) + masked + value.slice(-showEnd);
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-foreground text-sm font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
    </div>
  );
}

type PayoutFormData = {
  panNumber: string;
  aadhaarNumber: string;
  businessType: string;
  payoutMethod: "bank" | "upi";
  bankAccount: string;
  bankIfsc: string;
  bankHolder: string;
  upiVpa: string;
  upiHolder: string;
};

const BUSINESS_TYPES = [
  "Digital Goods",
  "E-commerce",
  "SaaS",
  "Professional Services (Doctors, Lawyers, Architects, CAs, and other Professionals)",
  "Social Media and Entertainment",
  "Miscellaneous",
] as const;

const emptyForm: PayoutFormData = {
  panNumber: "",
  aadhaarNumber: "",
  businessType: "",
  payoutMethod: "bank",
  bankAccount: "",
  bankIfsc: "",
  bankHolder: "",
  upiVpa: "",
  upiHolder: "",
};

export function PaymentsTab() {
  const { user: profile } = useUser();
  const payoutProfile = useQuery(api.vendors.getPayoutProfile);

  const [form, setForm] = useState<PayoutFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [touched, setTouched] = useState<Set<keyof PayoutFormData>>(new Set());
  const [step, setStep] = useState<"personal" | "business">("personal");
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const vendorStatus = submittedStatus ?? payoutProfile?.vendorStatus ?? null;

  const markTouched = useCallback((...fields: (keyof PayoutFormData)[]) => {
    setTouched((prev) => {
      const next = new Set(prev);
      fields.forEach((f) => next.add(f));
      return next;
    });
  }, []);

  const updateField = useCallback(
    (field: keyof PayoutFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setError("");
      setTouched((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    },
    []
  );

  function isFieldInvalid(field: keyof PayoutFormData): boolean {
    if (!touched.has(field)) return false;
    switch (field) {
      case "panNumber":
        return !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase());
      case "aadhaarNumber":
        return form.aadhaarNumber.length > 0 && !/^\d{12}$/.test(form.aadhaarNumber);
      case "businessType":
        return !form.businessType;
      case "bankAccount":
        return !form.bankAccount.trim();
      case "bankIfsc":
        return !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bankIfsc.toUpperCase());
      case "bankHolder":
        return !form.bankHolder.trim();
      case "upiVpa":
        return !form.upiVpa.trim() || !form.upiVpa.includes("@");
      case "upiHolder":
        return !form.upiHolder.trim();
      default:
        return false;
    }
  }

  const validateForm = useCallback((): string | null => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(form.panNumber.toUpperCase())) {
      return "Enter a valid PAN (e.g. ABCDE1234F)";
    }

    if (form.aadhaarNumber && !/^\d{12}$/.test(form.aadhaarNumber)) {
      return "Enter a valid 12-digit Aadhaar number";
    }

    if (!form.businessType) {
      return "Select your business type";
    }

    if (form.payoutMethod === "bank") {
      if (!form.bankAccount.trim()) return "Bank account number is required";
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bankIfsc.toUpperCase())) {
        return "Enter a valid IFSC (11 characters, e.g. HDFC0001234)";
      }
      if (!form.bankHolder.trim()) return "Account holder name is required";
    } else {
      if (!form.upiVpa.trim()) return "UPI VPA is required";
      if (!form.upiVpa.includes("@")) return "Enter a valid UPI VPA (e.g. name@upi)";
      if (!form.upiHolder.trim()) return "Account holder name is required";
    }

    return null;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    const bankFields: (keyof PayoutFormData)[] = ["bankAccount", "bankIfsc", "bankHolder"];
    const upiFields: (keyof PayoutFormData)[] = ["upiVpa", "upiHolder"];
    markTouched("panNumber", "aadhaarNumber", "businessType", ...(form.payoutMethod === "bank" ? bankFields : upiFields));

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/vendors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panNumber: form.panNumber.toUpperCase(),
          aadhaarNumber: form.aadhaarNumber,
          businessType: form.businessType,
          payoutMethod: form.payoutMethod,
          bankAccount: form.payoutMethod === "bank" ? form.bankAccount : undefined,
          bankIfsc: form.payoutMethod === "bank" ? form.bankIfsc.toUpperCase() : undefined,
          bankHolder: form.payoutMethod === "bank" ? form.bankHolder : undefined,
          upiVpa: form.payoutMethod === "upi" ? form.upiVpa : undefined,
          upiHolder: form.payoutMethod === "upi" ? form.upiHolder : undefined,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to submit verification");
        return;
      }

      setSubmittedStatus(data.status);
      setSuccess("Submitted! Your details are being verified.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [form, validateForm, markTouched]);

  const handleCheckStatus = useCallback(async () => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/vendors/status");
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Failed to check status");
      }
    } catch {
      setError("Failed to check status");
    } finally {
      setChecking(false);
    }
  }, []);

  const handleNext = useCallback(() => {
    markTouched("panNumber", "aadhaarNumber");
    const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase());
    const aadhaarValid = !form.aadhaarNumber || /^\d{12}$/.test(form.aadhaarNumber);
    if (panValid && aadhaarValid) {
      setStep("business");
      setError("");
    } else if (!panValid) {
      setError("Enter a valid PAN (e.g. ABCDE1234F)");
    }
  }, [form, markTouched]);

  useEffect(() => {
    if (submittedStatus && payoutProfile?.vendorStatus === submittedStatus) {
      setSubmittedStatus(null);
    }
  }, [submittedStatus, payoutProfile?.vendorStatus]);

  if (payoutProfile === undefined) {
    return (
      <div>
        <SectionHeader
          title="Payments"
          description="Set up how you receive your earnings."
        />
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

      {vendorStatus === null && renderSetupForm(form, updateField, handleSubmit, submitting, error, success, profile?.name, isFieldInvalid, step, setStep, handleNext)}
      {vendorStatus && ["IN_BANK_VALIDATION", "IN_BENE_CREATION", "IN_KYC_REVIEW"].includes(vendorStatus) && payoutProfile && renderVerifying(payoutProfile, handleCheckStatus, checking)}
      {vendorStatus === "BANK_VALIDATION_FAILED" && payoutProfile && renderFailed(payoutProfile, "Bank validation failed. Update your bank details and try again.", handleCheckStatus, checking)}
      {vendorStatus === "BENE_CREATION_FAILED" && payoutProfile && renderFailed(payoutProfile, "Beneficiary creation failed. Update your details and try again.", handleCheckStatus, checking)}
      {vendorStatus === "ACTION_REQUIRED" && payoutProfile && renderActionRequired(payoutProfile, handleCheckStatus, checking)}
      {vendorStatus === "ACTIVE" && payoutProfile && renderActive(payoutProfile, handleCheckStatus, checking)}
      {(vendorStatus === "BLOCKED" || vendorStatus === "ON_HOLD" || vendorStatus === "DELETED") && payoutProfile && renderBlocked(payoutProfile)}
      {vendorStatus && !["IN_BANK_VALIDATION", "IN_BENE_CREATION", "IN_KYC_REVIEW", "BANK_VALIDATION_FAILED", "BENE_CREATION_FAILED", "ACTION_REQUIRED", "ACTIVE", "BLOCKED", "ON_HOLD", "DELETED"].includes(vendorStatus) && payoutProfile && renderVerifying(payoutProfile, handleCheckStatus, checking)}
    </div>
  );
}

function renderSetupForm(
  form: PayoutFormData,
  updateField: (field: keyof PayoutFormData, value: string) => void,
  onSubmit: () => void,
  submitting: boolean,
  error: string,
  success: string,
  userName?: string,
  isFieldInvalid?: (field: keyof PayoutFormData) => boolean,
  step?: "personal" | "business",
  setStep?: (step: "personal" | "business") => void,
  onNext?: () => void,
) {
  return (
    <>
      <div className="app-panel">
        {step === "personal" ? (
          <div className="space-y-5 px-4 py-5">
            <div>
              <p className="text-foreground text-sm font-semibold">Personal Details</p>
              <p className="text-muted-foreground mt-0.5 text-xs">Your identity details used for compliance and payout verification.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">PAN Card Number *</label>
                <Input
                  value={form.panNumber}
                  onChange={(e) => updateField("panNumber", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="font-mono uppercase"
                  aria-invalid={isFieldInvalid?.("panNumber")}
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Aadhaar Number
                </label>
                <Input
                  value={form.aadhaarNumber}
                  onChange={(e) => updateField("aadhaarNumber", e.target.value.replace(/\D/g, ""))}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                  className="font-mono"
                  aria-invalid={isFieldInvalid?.("aadhaarNumber")}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-border/70 divide-y">
            <div className="space-y-4 px-4 py-5">
              <div>
                <p className="text-foreground text-sm font-semibold">Business Type</p>
                <p className="text-muted-foreground mt-0.5 text-xs">Select the category that best describes your business.</p>
              </div>
              <Select
                value={form.businessType}
                onValueChange={(v) => updateField("businessType", v)}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={isFieldInvalid?.("businessType")}
                >
                  <SelectValue placeholder="Select your business type..." />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-5 px-4 py-5">
              <div>
                <p className="text-foreground text-sm font-semibold">Settlement Method</p>
                <p className="text-muted-foreground mt-0.5 text-xs">Where your earnings will be deposited.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField("payoutMethod", "bank")}
                  className={`flex flex-1 items-center gap-2 cursor-pointer rounded-md border px-3 py-3 text-sm transition-colors ${
                    form.payoutMethod === "bank"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <Landmark className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Bank Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField("payoutMethod", "upi")}
                  className={`flex flex-1 items-center gap-2 cursor-pointer rounded-md border px-3 py-3 text-sm transition-colors ${
                    form.payoutMethod === "upi"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <Smartphone className="h-4 w-4 shrink-0" />
                  <span className="font-medium">UPI</span>
                </button>
              </div>

              {form.payoutMethod === "bank" ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">Account Number</label>
                    <Input
                      value={form.bankAccount}
                      onChange={(e) => updateField("bankAccount", e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter account number"
                      maxLength={20}
                      className="font-mono"
                      aria-invalid={isFieldInvalid?.("bankAccount")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">IFSC Code</label>
                    <Input
                      value={form.bankIfsc}
                      onChange={(e) => updateField("bankIfsc", e.target.value.toUpperCase())}
                      placeholder="HDFC0001234"
                      maxLength={11}
                      className="font-mono uppercase"
                      aria-invalid={isFieldInvalid?.("bankIfsc")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">Account Holder Name</label>
                    <Input
                      value={form.bankHolder}
                      onChange={(e) => updateField("bankHolder", e.target.value)}
                      placeholder={userName || "Account holder name"}
                      aria-invalid={isFieldInvalid?.("bankHolder")}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">UPI VPA</label>
                    <Input
                      value={form.upiVpa}
                      onChange={(e) => updateField("upiVpa", e.target.value.toLowerCase())}
                      placeholder="yourname@upi"
                      className="font-mono"
                      aria-invalid={isFieldInvalid?.("upiVpa")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">Account Holder Name</label>
                    <Input
                      value={form.upiHolder}
                      onChange={(e) => updateField("upiHolder", e.target.value)}
                      placeholder={userName || "Account holder name"}
                      aria-invalid={isFieldInvalid?.("upiHolder")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="border-destructive/25 bg-destructive/8 text-destructive rounded-md border px-3 py-2 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="border-emerald-500/25 bg-emerald-500/8 text-emerald-500 rounded-md border px-3 py-2 text-xs">
          {success}
        </div>
      )}

      {step === "personal" ? (
        <Button onClick={onNext} className="w-full">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Save & Verify"
            )}
          </Button>
          <button
            type="button"
            onClick={() => setStep?.("personal")}
            className="text-muted-foreground hover:text-foreground mx-auto flex cursor-pointer items-center gap-1 text-xs transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
        </div>
      )}

      <p className="text-muted-foreground text-xs text-center leading-relaxed">
        Your information is used solely for compliance and payout verification.
      </p>

    </>
  );
}

type PayoutProfile = {
  vendorId?: string;
  vendorStatus?: string;
  panNumber?: string;
  payoutMethod?: "bank" | "upi";
  bankAccount?: string;
  bankIfsc?: string;
  bankHolder?: string;
  upiVpa?: string;
  upiHolder?: string;
  vendorCreatedAt?: number;
};

function renderVerifying(
  profile: PayoutProfile,
  onCheckStatus: () => void,
  checking: boolean,
) {
  const isBank = profile?.payoutMethod === "bank";

  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="bg-amber-500/10 rounded-full p-1.5">
          <Clock className="text-amber-500 h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold">Verification in progress</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Cashfree is verifying your KYC details. This typically takes 24-48 hours.
          </p>
        </div>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-xs px-3 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">PAN</span>
          <span className="text-foreground font-mono">{profile?.panNumber ? maskText(profile.panNumber, 2, 4) : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Method</span>
          <span className="text-foreground font-medium">{isBank ? "Bank Account" : "UPI"}</span>
        </div>
        {isBank ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="text-foreground font-mono">{profile?.bankAccount ? maskText(profile.bankAccount, 2, 4) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IFSC</span>
              <span className="text-foreground font-mono">{profile?.bankIfsc || "—"}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <span className="text-muted-foreground">VPA</span>
            <span className="text-foreground font-mono">{profile?.upiVpa || "—"}</span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onCheckStatus}
        disabled={checking}
        className="w-full"
      >
        {checking ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          </>
        ) : (
          "Check Status"
        )}
      </Button>
    </div>
  );
}

function renderActive(
  profile: PayoutProfile,
  onCheckStatus: () => void,
  checking: boolean,
) {
  const isBank = profile?.payoutMethod === "bank";

  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="bg-emerald-500/10 rounded-full p-1.5">
          <CheckCircle2 className="text-emerald-500 h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold">Payments active</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Your earnings are settled directly by Cashfree {isBank ? "to your bank account" : "to your UPI VPA"} on a T+1 schedule.
          </p>
        </div>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-xs px-3 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">PAN</span>
          <span className="text-foreground font-mono">{profile?.panNumber ? maskText(profile.panNumber, 2, 4) : "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Method</span>
          <span className="text-foreground font-medium">{isBank ? "Bank Account" : "UPI"}</span>
        </div>
        {isBank ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="text-foreground font-mono">{profile?.bankAccount ? maskText(profile.bankAccount, 2, 4) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IFSC</span>
              <span className="text-foreground font-mono">{profile?.bankIfsc || "—"}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <span className="text-muted-foreground">VPA</span>
            <span className="text-foreground font-mono">{profile?.upiVpa || "—"}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCheckStatus}
          disabled={checking}
          className="flex-1"
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            </>
          ) : (
            "Refresh Status"
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex-1"
        >
          Update Details
        </Button>
      </div>
    </div>
  );
}

function renderFailed(
  profile: PayoutProfile,
  message: string,
  onCheckStatus: () => void,
  checking: boolean,
) {
  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="bg-destructive/10 rounded-full p-1.5">
          <AlertCircle className="text-destructive h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold">Verification failed</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-xs px-3 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">PAN</span>
          <span className="text-foreground font-mono">{profile?.panNumber ? maskText(profile.panNumber, 2, 4) : "—"}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onCheckStatus}
        disabled={checking}
        className="w-full"
      >
        {checking ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          </>
        ) : (
          "Check Status"
        )}
      </Button>
    </div>
  );
}

function renderActionRequired(
  profile: PayoutProfile,
  onCheckStatus: () => void,
  checking: boolean,
) {
  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="bg-amber-500/10 rounded-full p-1.5">
          <AlertCircle className="text-amber-500 h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold">Action required</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Some of your KYC documents could not be verified. Please update your payment details or
            contact support to resolve this.
          </p>
        </div>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-xs px-3 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">PAN</span>
          <span className="text-foreground font-mono">{profile?.panNumber ? maskText(profile.panNumber, 2, 4) : "—"}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onCheckStatus}
        disabled={checking}
        className="w-full"
      >
        {checking ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          </>
        ) : (
          "Check Status"
        )}
      </Button>
    </div>
  );
}

function renderBlocked(
  profile: PayoutProfile,
) {
  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="bg-destructive/10 rounded-full p-1.5">
          <AlertCircle className="text-destructive h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold">Verification failed</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Your KYC verification was rejected. Please contact support to resolve this.
          </p>
        </div>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-xs px-3 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">PAN</span>
          <span className="text-foreground font-mono">{profile?.panNumber ? maskText(profile.panNumber, 2, 4) : "—"}</span>
        </div>
      </div>
    </div>
  );
}
