"use client";

import { useRef, useState } from "react";
import {
  useGenerateProductCoverUploadUrl,
  useSaveProductCoverImage,
  useRemoveProductCoverImage,
} from "@/features/products/hooks/useProduct";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

interface CoverUploadProps {
  currentImageUrl?: string | null;
  productId: Id<"products">;
}

export function CoverUpload({ currentImageUrl, productId }: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const generateUploadUrl = useGenerateProductCoverUploadUrl();
  const saveCoverImage = useSaveProductCoverImage();
  const removeCoverImage = useRemoveProductCoverImage();

  const displayUrl = preview ?? currentImageUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File too large. Maximum size is 2 MB.");
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
      await saveCoverImage({
        productId,
        storageId: storageId as unknown as Id<"_storage">,
      });
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setError(null);
    setPreview(null);
    try {
      await removeCoverImage({ productId });
    } catch {
      setError("Failed to remove cover image.");
    }
  };

  return (
    <div className="space-y-4">
      {!displayUrl ? (
        <div
          className={cn(
            "border-border/70 bg-secondary/30 relative rounded-xs border-2 border-dashed",
            "flex flex-col items-center justify-center gap-3 px-6 py-12",
            "hover:border-primary/50 hover:bg-secondary/50 transition-all duration-200",
            "cursor-pointer"
          )}
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload cover image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
            {uploading ? (
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
            ) : (
              <Plus className="text-primary h-5 w-5" />
            )}
          </div>
          <p className="text-foreground text-sm font-medium">
            {uploading ? "Uploading..." : "Upload cover image"}
          </p>
          <p className="text-muted-foreground max-w-xs text-center text-xs">
            Images should be horizontal, at least 1280x720px, and 72 DPI.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="border-border/60 relative h-14 w-24 shrink-0 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="Cover thumbnail" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="border-border/60 bg-card text-foreground hover:bg-accent inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {uploading ? "Uploading..." : "Replace"}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="border-destructive/30 bg-card text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>

          <div className="border-border/60 relative overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayUrl} alt="Cover preview" className="h-auto w-full object-cover" />
            {uploading && (
              <div className="bg-background/60 absolute inset-0 flex items-center justify-center backdrop-blur-md">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                  <span className="text-xs font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-destructive text-xs font-medium">{error}</p>}

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
