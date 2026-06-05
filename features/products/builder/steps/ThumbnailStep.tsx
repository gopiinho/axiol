"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useUpdateThumbnailConfig,
  useSaveThumbnailImage,
  useRemoveThumbnailImage,
  useGenerateProductCoverUploadUrl,
} from "../../hooks/useProduct";
import type { ProductStepComponentProps } from "../../registry/steps";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2, Upload } from "lucide-react";

const STYLE_OPTIONS = [
  { value: "button", label: "Button" },
  { value: "callout", label: "Callout" },
  { value: "preview", label: "Preview" },
] as const;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

function StepNumber({ num }: { num: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/30 text-foreground text-xs font-bold mr-2 shrink-0">
      {num}
    </span>
  );
}

export function ThumbnailStep({ productId, product, onRegisterSave }: ProductStepComponentProps) {
  const savedThumbnail = product.config?.thumbnail as { style?: string; title?: string; subtitle?: string; buttonText?: string } | undefined;

  const [style, setStyle] = useState<"button" | "callout" | "preview">(
    (savedThumbnail?.style === "button" || savedThumbnail?.style === "callout" || savedThumbnail?.style === "preview")
      ? savedThumbnail.style
      : "preview"
  );
  const [title, setTitle] = useState(savedThumbnail?.title || product.name);
  const [subtitle, setSubtitle] = useState(savedThumbnail?.subtitle ?? "");
  const [buttonText, setButtonText] = useState(savedThumbnail?.buttonText ?? "");
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateThumbnailConfig = useUpdateThumbnailConfig();
  const saveThumbnailImage = useSaveThumbnailImage();
  const removeThumbnailImage = useRemoveThumbnailImage();
  const generateUploadUrl = useGenerateProductCoverUploadUrl();

  const persistedThumbUrl = product.thumbnailImageUrl ?? null;
  const showImage = thumbnailPreview || persistedThumbUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return;
    if (file.size > MAX_SIZE) return;

    setUploading(true);
    setThumbnailPreview(URL.createObjectURL(file));

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      await saveThumbnailImage({
        productId: productId as unknown as Id<"products">,
        storageId: storageId as unknown as Id<"_storage">,
      });
    } catch {
      setThumbnailPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    setThumbnailPreview(null);
    try {
      await removeThumbnailImage({ productId: productId as unknown as Id<"products"> });
    } catch {}
  };

  const handleSave = useCallback(async () => {
    await updateThumbnailConfig({
      productId: productId as unknown as Id<"products">,
      config: {
        style,
        title: title.trim() || product.name,
        subtitle: subtitle.trim() || undefined,
        buttonText: buttonText.trim() || "Download Now",
      },
    });
  }, [productId, product.name, style, title, subtitle, buttonText, updateThumbnailConfig]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
  }, [handleSave, onRegisterSave]);

  return (
    <div className="space-y-10">

      <div className="space-y-3">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={1} />
          Pick a style
        </Label>
        <div className="flex gap-2 pl-8">
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStyle(option.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xs border transition-colors",
                style === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-foreground hover:border-primary/50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={2} />
          Select Image
        </Label>
        <div className="pl-8">
          <div className="flex gap-4 items-start">
            <div className="w-40 h-40 shrink-0 rounded-xs border border-border/60 overflow-hidden bg-secondary/20 flex items-center justify-center">
              {showImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnailPreview || product.thumbnailImageUrl || ""}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1">
              {!showImage ? (
                <div
                  className={cn(
                    "border-2 border-dashed border-border/70 bg-secondary/30",
                    "flex flex-col items-center justify-center gap-2 py-10 px-6 cursor-pointer",
                    "hover:border-primary/50 hover:bg-secondary/50 transition-colors",
                  )}
                  onClick={() => !uploading && inputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload thumbnail image</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP, max 2MB</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs text-primary hover:underline"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={3} />
          Add text
        </Label>
        <div className="pl-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thumbnail-title">Title</Label>
            <Input
              id="thumbnail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={product.name}
            />
          </div>

          {style !== "button" && (
            <div className="space-y-2">
              <Label htmlFor="thumbnail-subtitle">Subtitle (optional)</Label>
              <Input
                id="thumbnail-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A short tagline"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="thumbnail-button-text">Button text</Label>
            <Input
              id="thumbnail-button-text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Download Now"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
