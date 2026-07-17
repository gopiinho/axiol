"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface DocumentUploadProps {
  label: string;
  accept?: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
}

export function DocumentUpload({
  label,
  accept = ".jpg,.jpeg,.png,.pdf",
  file,
  onFileSelect,
  uploading,
  uploaded,
  error,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFileSelect(dropped);
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-1.5">
      <label className="text-muted-foreground block text-xs font-medium">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xs border px-3 py-6 text-sm transition-colors ${
          dragOver
            ? "border-foreground bg-foreground/5"
            : uploaded
              ? "border-emerald-500/40 bg-emerald-500/5"
              : error
                ? "border-destructive/40 bg-destructive/5"
                : "border-border hover:border-muted-foreground"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 2 * 1024 * 1024) return;
              onFileSelect(f);
            }
            e.target.value = "";
          }}
        />

        {uploading ? (
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        ) : uploaded ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        ) : error ? (
          <AlertCircle className="text-destructive h-6 w-6" />
        ) : (
          <Upload className="text-muted-foreground h-6 w-6" />
        )}

        <span className="text-muted-foreground truncate text-center text-xs leading-relaxed">
          {file ? file.name : "Tap to upload"}
        </span>

        {file && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
