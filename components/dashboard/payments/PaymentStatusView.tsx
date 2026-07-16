"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayoutDetailsCard } from "./PayoutDetailsCard";
import { DocumentStatusList } from "./DocumentStatusList";
import { DocumentUpload } from "./DocumentUpload";
import { BankEditForm } from "./BankEditForm";
import type { PayoutProfile } from "./types";
import { DOC_TYPE_LABELS } from "./constants";

interface PaymentStatusViewProps {
  profile: PayoutProfile;
}

export function PaymentStatusView({ profile }: PaymentStatusViewProps) {
  const status = profile.vendorStatus;

  if (!status) return null;

  if (["IN_BANK_VALIDATION", "IN_BENE_CREATION", "IN_KYC_REVIEW"].includes(status)) {
    return <VerifyingView profile={profile} />;
  }

  if (status === "ACTION_REQUIRED") {
    return <ActionRequiredView profile={profile} />;
  }

  if (status === "ACTIVE") {
    return <ActiveView profile={profile} />;
  }

  if (status === "BANK_VALIDATION_FAILED") {
    return <FailedView profile={profile} message="Bank validation failed. Please update your bank or UPI details and try again." allowEdit />;
  }

  if (status === "BENE_CREATION_FAILED") {
    return <FailedView profile={profile} message="Beneficiary creation failed. Please update your payment details and try again." allowEdit />;
  }

  if (["BLOCKED", "ON_HOLD", "DELETED"].includes(status)) {
    return <BlockedView profile={profile} />;
  }

  return <VerifyingView profile={profile} />;
}

function VerifyingView({ profile }: { profile: PayoutProfile }) {
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = useCallback(async () => {
    setChecking(true);
    try {
      await fetch("/api/vendors/status");
    } catch {
      toast.error("Failed to check status", { description: "Please try again." });
    } finally {
      setChecking(false);
    }
  }, []);

  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold flex items-center gap-1">
            Verification in progress
            <Clock className="text-amber-500 h-4 w-4" />
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Cashfree is verifying your documents. This typically takes 24–48 hours.
            You will be notified once the verification is complete.
          </p>
        </div>
      </div>

      <PayoutDetailsCard profile={profile} />

      {profile.vendorDocumentStatus && Object.keys(profile.vendorDocumentStatus).length > 0 && (
        <DocumentStatusList documentStatus={profile.vendorDocumentStatus} />
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleCheckStatus}
        disabled={checking}
        className="w-full"
      >
        {checking ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          </>
        ) : (
          "Check Status"
        )}
      </Button>
    </div>
  );
}

function ActiveView({ profile }: { profile: PayoutProfile }) {
  const isBank = profile.payoutMethod === "bank";

  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold flex items-center gap-1">
            Payments active
            <CheckCircle2 className="text-emerald-500 h-4 w-4" />
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Your earnings are settled directly by Cashfree{" "}
            {isBank ? "to your bank account" : "to your UPI VPA"} on a T+1 schedule.
          </p>
        </div>
      </div>

      <PayoutDetailsCard profile={profile} />

      {profile.vendorDocumentStatus && Object.keys(profile.vendorDocumentStatus).length > 0 && (
        <DocumentStatusList documentStatus={profile.vendorDocumentStatus} />
      )}
    </div>
  );
}

function ActionRequiredView({ profile }: { profile: PayoutProfile }) {
  const [reUploading, setReUploading] = useState<string | null>(null);
  const [reUploadFile, setReUploadFile] = useState<File | null>(null);
  const [reUploadingDoc, setReUploadingDoc] = useState(false);

  const handleReUpload = useCallback((docType: string) => {
    setReUploading(docType);
    setReUploadFile(null);
  }, []);

  const handleReUploadSubmit = useCallback(async () => {
    if (!reUploading || !reUploadFile) return;

    setReUploadingDoc(true);

    try {
      const formData = new FormData();
      formData.append("doc_type", reUploading);
      formData.append("file", reUploadFile);

      const res = await fetch("/api/vendors/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.ok) {
        toast.error("Upload failed", { description: data.error || "Please try again." });
        return;
      }

      setReUploading(null);
      setReUploadFile(null);
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setReUploadingDoc(false);
    }
  }, [reUploading, reUploadFile]);

  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold flex items-center gap-1">
            Action required
            <AlertCircle className="text-amber-500 h-4 w-4" />
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Some of your documents could not be verified. Please upload corrected copies.
          </p>
        </div>
      </div>

      {profile.vendorDocumentStatus && Object.keys(profile.vendorDocumentStatus).length > 0 && (
        <DocumentStatusList
          documentStatus={profile.vendorDocumentStatus}
          onReUpload={handleReUpload}
        />
      )}

      {reUploading && (
        <div className="space-y-3 rounded-md border p-3">
          <p className="text-foreground text-xs font-medium">
            Re-upload: {DOC_TYPE_LABELS[reUploading] || reUploading}
          </p>
          <DocumentUpload
            label=""
            file={reUploadFile}
            onFileSelect={setReUploadFile}
            uploading={reUploadingDoc}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReUploadSubmit}
              disabled={!reUploadFile || reUploadingDoc}
            >
              {reUploadingDoc ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setReUploading(null); setReUploadFile(null); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FailedView({ profile, message, allowEdit }: { profile: PayoutProfile; message: string; allowEdit?: boolean }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <BankEditForm
        profile={profile}
        onComplete={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold flex items-center gap-1">
            Verification failed
            <AlertCircle className="text-destructive h-4 w-4" />
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{message}</p>
        </div>
      </div>

      <PayoutDetailsCard profile={profile} />

      {allowEdit && (
        <Button onClick={() => setEditing(true)} className="w-full">
          Update Payment Method
        </Button>
      )}
    </div>
  );
}

function BlockedView({ profile }: { profile: PayoutProfile }) {
  return (
    <div className="app-panel space-y-4 px-4 py-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-sm font-semibold flex items-center gap-1">
            Verification failed
            <AlertCircle className="text-destructive h-4 w-4" />
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Your KYC verification was rejected. Please contact support to resolve this.
          </p>
        </div>
      </div>

      <PayoutDetailsCard profile={profile} />
    </div>
  );
}
