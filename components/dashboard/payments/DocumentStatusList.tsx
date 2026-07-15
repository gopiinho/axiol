"use client";

import { FileText, CheckCircle2, Clock, AlertCircle, HelpCircle } from "lucide-react";
import { DOC_TYPE_LABELS } from "./constants";

interface DocumentStatusListProps {
  documentStatus: Record<string, string>;
  onReUpload?: (docType: string) => void;
}

function DocIcon({ status }: { status: string }) {
  switch (status) {
    case "VERIFIED":
      return <CheckCircle2 className="text-emerald-500 h-4 w-4 shrink-0" />;
    case "IN_REVIEW":
      return <Clock className="text-amber-500 h-4 w-4 shrink-0" />;
    case "ACTION_REQUIRED":
      return <AlertCircle className="text-destructive h-4 w-4 shrink-0" />;
    case "DUE_CURRENTLY":
    case "DUE_EVENTUALLY":
      return <HelpCircle className="text-muted-foreground h-4 w-4 shrink-0" />;
    default:
      return <FileText className="text-muted-foreground h-4 w-4 shrink-0" />;
  }
}

function DocLabel({ status }: { status: string }) {
  switch (status) {
    case "VERIFIED":
      return <span className="text-emerald-500 text-xs font-medium">Verified</span>;
    case "IN_REVIEW":
      return <span className="text-amber-500 text-xs font-medium">In Review</span>;
    case "ACTION_REQUIRED":
      return <span className="text-destructive text-xs font-medium">Action Required</span>;
    case "DUE_CURRENTLY":
      return <span className="text-muted-foreground text-xs">Pending</span>;
    case "DUE_EVENTUALLY":
      return <span className="text-muted-foreground text-xs">Optional</span>;
    default:
      return <span className="text-muted-foreground text-xs">{status}</span>;
  }
}

export function DocumentStatusList({
  documentStatus,
  onReUpload,
}: DocumentStatusListProps) {
  const entries = Object.entries(documentStatus);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-medium">Document Verification</p>
      <div className="bg-muted/50 space-y-1 rounded-xs px-3 py-2.5">
        {entries.map(([docType, status]) => (
          <div key={docType} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <DocIcon status={status} />
              <span className="text-foreground truncate text-xs">
                {DOC_TYPE_LABELS[docType] || docType}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DocLabel status={status} />
              {status === "ACTION_REQUIRED" && onReUpload && (
                <button
                  type="button"
                  onClick={() => onReUpload(docType)}
                  className="text-primary hover:text-primary/80 cursor-pointer text-xs font-medium"
                >
                  Re-upload
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
