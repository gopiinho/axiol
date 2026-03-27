"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { Camera, Loader2, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ImageUploadProps = {
  currentImageUrl?: string | null;
  onUploaded: (storageId: string) => void;
  onRemove?: () => void;
  maxSizeBytes: number;
  maxSizeLabel: string;
  aspectRatio?: string;
  className?: string;
  placeholder?: React.ReactNode;
};

export function ImageUpload({
  currentImageUrl,
  onUploaded,
  onRemove,
  maxSizeBytes,
  maxSizeLabel,
  aspectRatio = "1/1",
  className,
  placeholder,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size is ${maxSizeLabel}.`);
      return;
    }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();
      onUploaded(storageId);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const displayUrl = preview ?? currentImageUrl;

  return (
    <div className={cn("relative group", className)}>
      <div
        className="relative overflow-hidden rounded-xl border-2 border-dashed border-border/70 bg-secondary/30 cursor-pointer transition hover:border-primary/40"
        style={{ aspectRatio }}
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {displayUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
              <Camera className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            {placeholder ?? (
              <>
                <Camera className="h-5 w-5" />
                <span className="text-xs">Upload image</span>
              </>
            )}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      {displayUrl && onRemove && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            onRemove();
          }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition hover:bg-destructive/90"
          aria-label="Remove image"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
