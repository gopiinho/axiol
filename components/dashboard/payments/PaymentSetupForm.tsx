"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Landmark,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Fingerprint,
  Car,
  BookOpen,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentUpload } from "./DocumentUpload";
import type { PayoutFormData } from "./types";
import {
  BUSINESS_TYPES,
  ADDRESS_PROOF_OPTIONS,
  ADDRESS_PROOF_FILE_TYPES,
  EMPTY_FORM,
} from "./constants";

interface PaymentSetupFormProps {
  userName?: string;
  onComplete: (status: string) => void;
}

const PROOF_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Fingerprint,
  Car,
  BookOpen,
  IdCard,
};

export function PaymentSetupForm({ userName, onComplete }: PaymentSetupFormProps) {
  const [form, setForm] = useState<PayoutFormData>(EMPTY_FORM);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  const [touched, setTouched] = useState<Set<keyof PayoutFormData>>(new Set());

  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [addressProofFiles, setAddressProofFiles] = useState<Record<string, File | null>>({});

  const markTouched = useCallback((...fields: (keyof PayoutFormData)[]) => {
    setTouched((prev) => {
      const next = new Set(prev);
      fields.forEach((f) => next.add(f));
      return next;
    });
  }, []);

  const updateField = useCallback((field: keyof PayoutFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "addressProofType") {
      setAddressProofFiles({});
    }
    setTouched((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  function isFieldInvalid(field: keyof PayoutFormData): boolean {
    if (!touched.has(field)) return false;
    switch (field) {
      case "panNumber":
        return !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase());
      case "addressProofType":
        return !form.addressProofType;
      case "addressProofNumber":
        return !form.addressProofNumber.trim();
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

  const validateStep = useCallback(
    (s: 1 | 2 | 3): string | null => {
      switch (s) {
        case 1: {
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase()))
            return "Enter a valid PAN (e.g. ABCDE1234F)";
          if (!panCardFile) return "Upload your PAN card image";
          return null;
        }
        case 2: {
          if (!form.addressProofType) return "Select an address proof type";
          if (!form.addressProofNumber.trim()) return "Enter your address proof number";
          const types = form.addressProofType
            ? ADDRESS_PROOF_FILE_TYPES[form.addressProofType]
            : [];
          const missing = types.filter((t) => !addressProofFiles[t.docType]);
          if (missing.length > 0) return `Upload ${missing.map((t) => t.label).join(" and ")}`;
          return null;
        }
        case 3: {
          if (!form.businessType) return "Select your business type";
          if (form.payoutMethod === "bank") {
            if (!form.bankAccount.trim()) return "Bank account number is required";
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bankIfsc.toUpperCase()))
              return "Enter a valid IFSC (e.g. HDFC0001234)";
            if (!form.bankHolder.trim()) return "Account holder name is required";
          } else {
            if (!form.upiVpa.trim()) return "UPI VPA is required";
            if (!form.upiVpa.includes("@")) return "Enter a valid UPI VPA (e.g. name@upi)";
            if (!form.upiHolder.trim()) return "Account holder name is required";
          }
          return null;
        }
      }
    },
    [form, panCardFile, addressProofFiles]
  );

  const handleNext = useCallback(() => {
    markTouched("panNumber");
    const err = validateStep(1);
    if (err) {
      toast.error(err);
      return;
    }
    setStep(2);
  }, [validateStep, markTouched]);

  const handleNextStep2 = useCallback(() => {
    markTouched("addressProofType", "addressProofNumber");
    const err = validateStep(2);
    if (err) {
      toast.error(err);
      return;
    }
    setStep(3);
  }, [validateStep, markTouched]);

  const uploadFile = useCallback(
    async (docType: string, file: File, docValue?: string): Promise<boolean> => {
      setUploadingDocType(docType);
      const formData = new FormData();
      formData.append("doc_type", docType);
      formData.append("file", file);
      if (docValue) {
        formData.append("doc_value", docValue);
      }

      try {
        const res = await fetch("/api/vendors/documents/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.ok;
      } catch {
        return false;
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const err = validateStep(3);
    if (err) {
      toast.error(err);
      return;
    }

    setSubmitting(true);

    try {
      const vendorRes = await fetch("/api/vendors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panNumber: form.panNumber.toUpperCase(),
          addressProofType: form.addressProofType,
          addressProofNumber: form.addressProofNumber,
          businessType: form.businessType,
          payoutMethod: form.payoutMethod,
          bankAccount: form.payoutMethod === "bank" ? form.bankAccount : undefined,
          bankIfsc: form.payoutMethod === "bank" ? form.bankIfsc.toUpperCase() : undefined,
          bankHolder: form.payoutMethod === "bank" ? form.bankHolder : undefined,
          upiVpa: form.payoutMethod === "upi" ? form.upiVpa : undefined,
          upiHolder: form.payoutMethod === "upi" ? form.upiHolder : undefined,
        }),
      });

      const vendorData = await vendorRes.json();
      if (!vendorData.ok) {
        toast.error(vendorData.error || "Failed to save payment details", {
          description: "Please try again.",
        });
        setSubmitting(false);
        return;
      }

      const panOk = await uploadFile("PAN", panCardFile!, form.panNumber.toUpperCase());
      if (!panOk) {
        toast.error("PAN card upload failed", { description: "Please try again." });
        setSubmitting(false);
        return;
      }

      const proofTypes = form.addressProofType
        ? ADDRESS_PROOF_FILE_TYPES[form.addressProofType]
        : [];

      for (const pt of proofTypes) {
        const f = addressProofFiles[pt.docType];
        if (!f) continue;
        const ok = await uploadFile(pt.docType, f, form.addressProofNumber);
        if (!ok) {
          toast.error(`${pt.label} upload failed`, { description: "Please try again." });
          setSubmitting(false);
          return;
        }
      }

      toast.success("Payment details saved!");
      onComplete(vendorData.status || "IN_BENE_CREATION");
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setSubmitting(false);
      setUploadingDocType(null);
    }
  }, [form, panCardFile, addressProofFiles, validateStep, uploadFile, onComplete]);

  const proofFileTypes = form.addressProofType
    ? ADDRESS_PROOF_FILE_TYPES[form.addressProofType]
    : [];

  const uploadLabel = uploadingDocType
    ? `Uploading ${uploadingDocType}...`
    : submitting
      ? "Creating vendor..."
      : null;

  return (
    <>
      <div className="app-panel">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 text-xs">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${
                    step === s
                      ? "bg-foreground text-background"
                      : step > s
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && <div className="bg-border h-px w-4" />}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5 px-4 py-5">
            <div>
              <p className="text-foreground text-sm font-semibold">Personal Details</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Your identity details used for compliance and payout verification.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  PAN Card Number
                </label>
                <Input
                  value={form.panNumber}
                  onChange={(e) => updateField("panNumber", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="font-mono uppercase"
                  aria-invalid={isFieldInvalid("panNumber")}
                />
              </div>
              <DocumentUpload
                label="Upload PAN Card Image"
                file={panCardFile}
                onFileSelect={setPanCardFile}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 px-4 py-5">
            <div>
              <p className="text-foreground text-sm font-semibold">Address Proof</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Provide a government-issued address proof document.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {ADDRESS_PROOF_OPTIONS.map((opt) => {
                  const Icon = PROOF_ICONS[opt.icon];
                  const selected = form.addressProofType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField("addressProofType", opt.value)}
                      className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xs border px-3 py-3 text-sm transition-colors ${
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span className="text-center text-[11px] leading-tight font-medium">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {form.addressProofType && (
                <>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      Document Number
                    </label>
                    <Input
                      value={form.addressProofNumber}
                      onChange={(e) => updateField("addressProofNumber", e.target.value)}
                      placeholder="Enter document number"
                      className="font-mono"
                      aria-invalid={isFieldInvalid("addressProofNumber")}
                    />
                  </div>

                  <div
                    className={`grid grid-cols-1 gap-3 ${proofFileTypes.length > 1 ? "sm:grid-cols-2" : ""}`}
                  >
                    {proofFileTypes.map((pt) => (
                      <DocumentUpload
                        key={pt.docType}
                        label={pt.label}
                        file={addressProofFiles[pt.docType] ?? null}
                        onFileSelect={(f) =>
                          setAddressProofFiles((prev) => ({ ...prev, [pt.docType]: f }))
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="divide-border/70 divide-y">
            <div className="space-y-4 px-4 py-5">
              <div>
                <p className="text-foreground text-sm font-semibold">Business Type</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Select the category that best describes your business.
                </p>
              </div>
              <Select
                value={form.businessType}
                onValueChange={(v) => updateField("businessType", v)}
              >
                <SelectTrigger className="w-full" aria-invalid={isFieldInvalid("businessType")}>
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
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Where your earnings will be deposited.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField("payoutMethod", "bank")}
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors ${
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
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors ${
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
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      Account Number
                    </label>
                    <Input
                      value={form.bankAccount}
                      onChange={(e) =>
                        updateField("bankAccount", e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter account number"
                      maxLength={20}
                      className="font-mono"
                      aria-invalid={isFieldInvalid("bankAccount")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      IFSC Code
                    </label>
                    <Input
                      value={form.bankIfsc}
                      onChange={(e) => updateField("bankIfsc", e.target.value.toUpperCase())}
                      placeholder="HDFC0001234"
                      maxLength={11}
                      className="font-mono uppercase"
                      aria-invalid={isFieldInvalid("bankIfsc")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      Account Holder Name
                    </label>
                    <Input
                      value={form.bankHolder}
                      onChange={(e) => updateField("bankHolder", e.target.value)}
                      placeholder={userName || "Account holder name"}
                      aria-invalid={isFieldInvalid("bankHolder")}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      UPI VPA
                    </label>
                    <Input
                      value={form.upiVpa}
                      onChange={(e) => updateField("upiVpa", e.target.value.toLowerCase())}
                      placeholder="yourname@upi"
                      className="font-mono"
                      aria-invalid={isFieldInvalid("upiVpa")}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block text-xs font-medium">
                      Account Holder Name
                    </label>
                    <Input
                      value={form.upiHolder}
                      onChange={(e) => updateField("upiHolder", e.target.value)}
                      placeholder={userName || "Account holder name"}
                      aria-invalid={isFieldInvalid("upiHolder")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {step === 1 && (
          <Button onClick={handleNext} className="w-full">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {step === 2 && (
          <Button onClick={handleNextStep2} className="w-full">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {step === 3 && (
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadLabel || "Submitting..."}
              </>
            ) : (
              "Save & Verify"
            )}
          </Button>
        )}

        {step > 1 && (
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setStep((prev) => (prev - 1) as 1 | 2 | 3);
            }}
            disabled={submitting}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-center text-xs leading-relaxed">
        Your information is used solely for compliance and payout verification.
      </p>
    </>
  );
}
