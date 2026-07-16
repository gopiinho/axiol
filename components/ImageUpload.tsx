"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
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
  const [preview, setPreview] = useState<string | null>(null);
  const defaultGenerateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const generateUploadUrl = customGenerateUploadUrl ?? defaultGenerateUploadUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    if (file.size > maxSizeBytes) {
      toast.error("File too large", { description: `Maximum size is ${maxSizeLabel}.` });
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
      toast.error("Upload failed", { description: "Please try again." });
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const displayUrl = preview ?? currentImageUrl;

  return (
    <div className={cn("group relative", className)}>
      <div
        className={cn(
          "border-border/70 bg-secondary/30 hover:border-primary/50 relative cursor-pointer overflow-hidden border-2 border-dashed transition-all duration-300 hover:shadow-lg active:scale-[0.98]",
          displayUrl && "hover:border-primary/30 border-solid border-transparent"
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
            <div className="text-muted-foreground bg-secondary/20 flex h-full w-full flex-col items-center justify-center gap-1.5">
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
            <div className="flex translate-y-4 flex-col items-center gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center text-white transition-transform duration-200 active:scale-95">
                <Upload className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}

        {uploading && (
          <div className="bg-background/60 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md transition-all duration-300">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary h-1.5 w-1.5 animate-ping rounded-full" />
                </div>
              </div>
              <span className="text-foreground animate-pulse text-xs font-semibold tracking-wide">
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
          className="bg-background border-border text-muted-foreground hover:bg-destructive hover:border-destructive absolute -top-2 -right-2 z-30 flex h-7 w-7 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all hover:text-white active:scale-90"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
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
