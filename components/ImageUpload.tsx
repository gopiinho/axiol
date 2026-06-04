"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { Upload, Loader2, X } from "lucide-react";
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
  generateUploadUrl?: () => Promise<string>;
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
  generateUploadUrl: customGenerateUploadUrl,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const defaultGenerateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const generateUploadUrl = customGenerateUploadUrl ?? defaultGenerateUploadUrl;

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
        className={cn(
          "relative overflow-hidden border-2 border-dashed border-border/70 bg-secondary/30 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg active:scale-[0.98]",
          displayUrl &&
            "border-solid border-transparent hover:border-primary/30",
        )}
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
        <div className="relative h-full w-full overflow-hidden transition-all duration-700 group-hover:scale-110 group-hover:blur-xs">
          {displayUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={displayUrl}
              alt="Preview"
              className="h-full w-full object-cover transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground bg-secondary/20">
              {placeholder ?? (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Upload image</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
            <div className="flex flex-col items-center gap-2 opacity-0 transition-all duration-500 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
              <div className="flex h-12 w-12 items-center justify-center text-white transition-transform duration-200 active:scale-95">
                <Upload className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-md transition-all duration-300">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                </div>
              </div>
              <span className="text-xs font-semibold text-foreground animate-pulse tracking-wide">
                Uploading...
              </span>
            </div>
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
          className="absolute -right-2 -top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border text-muted-foreground shadow-md backdrop-blur-md transition-all hover:bg-destructive hover:text-white hover:border-destructive active:scale-90"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-destructive text-center">
          {error}
        </p>
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
