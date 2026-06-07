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
import {
  Loader2,
  Folder,
  Plus,
  X,
  Pencil,
  Square,
  PanelTop,
  MonitorPlay,
} from "lucide-react";

const STYLE_OPTIONS = [
  { value: "button", label: "Button", icon: Square },
  { value: "callout", label: "Callout", icon: PanelTop },
  { value: "preview", label: "Preview", icon: MonitorPlay },
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

export function ThumbnailStep({
  productId,
  product,
  onRegisterSave,
}: ProductStepComponentProps) {
  const savedThumbnail = product.config?.thumbnail as
    | { style?: string; title?: string; subtitle?: string; buttonText?: string }
    | undefined;

  const [style, setStyle] = useState<"button" | "callout" | "preview">(
    savedThumbnail?.style === "button" ||
      savedThumbnail?.style === "callout" ||
      savedThumbnail?.style === "preview"
      ? savedThumbnail.style
      : "preview",
  );
  const [title, setTitle] = useState(savedThumbnail?.title || product.name);
  const [subtitle, setSubtitle] = useState(savedThumbnail?.subtitle ?? "");
  const [buttonText, setButtonText] = useState(
    savedThumbnail?.buttonText ?? "",
  );
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
      await removeThumbnailImage({
        productId: productId as unknown as Id<"products">,
      });
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
  }, [
    productId,
    product.name,
    style,
    title,
    subtitle,
    buttonText,
    updateThumbnailConfig,
  ]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
  }, [handleSave, onRegisterSave]);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={1} />
          Pick a style
        </Label>
        <div className="flex gap-2 pl-8">
          {STYLE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStyle(option.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-6 py-4 text-sm cursor-pointer font-medium rounded-xs border transition-colors",
                  style === option.value
                    ? "bg-foreground text-background"
                    : "border-border text-foreground hover:border-primary/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={2} />
          Select image
        </Label>
        <div className="pl-8">
          <div className="flex items-center gap-6 rounded-xs border border-dashed border-border/70 bg-card/50 p-5 h-34">
            <button
              type="button"
              onClick={() => !uploading && inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "group relative h-24 w-24 shrink-0 rounded-xs",
                "flex items-center justify-center",
                "transition-all duration-200",
                showImage
                  ? "border border-border/60"
                  : "border border-border/40 bg-linear-to-br from-[oklch(0.94_0.06_220)] via-[oklch(0.93_0.07_235)] to-[oklch(0.94_0.05_210)]",
                !uploading && "hover:border-primary/60 cursor-pointer",
                uploading && "opacity-70 cursor-wait",
              )}
              aria-label={
                showImage ? "Replace thumbnail image" : "Choose thumbnail image"
              }
            >
              {showImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnailPreview || product.thumbnailImageUrl || ""}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Folder
                  className="h-10 w-10 text-[oklch(0.55_0.12_220)] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]"
                  strokeWidth={1.5}
                />
              )}
              <span
                className={cn(
                  "absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full",
                  "bg-primary text-foreground shadow-md",
                  "transition-transform duration-200 group-hover:scale-110",
                )}
                aria-hidden
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Pencil className="h-3.5 w-3.5" />
                )}
              </span>
            </button>

            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 min-w-0">
              <span
                onClick={() => !uploading && inputRef.current?.click()}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xs bg-card px-4 py-2 mt-1",
                  "text-sm font-semibold text-foreground shadow-sm border border-border/60 w-fit",
                  "transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  "cursor-pointer",
                  uploading && "opacity-50 cursor-not-allowed",
                )}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2} />
                )}
                {uploading ? "Uploading..." : "Upload photo"}
              </span>
              <span className="text-xs text-muted-foreground">
                Images should be square, at least 400x400px, and 72 DPI (dots
                per inch).
              </span>
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

      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={3} />
          Add text
        </Label>
        <div className="pl-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thumbnail-title" className="text-sm font-bold">
              Title *
            </Label>
            <Input
              id="thumbnail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={product.name}
            />
          </div>

          {style !== "button" && (
            <div className="space-y-2">
              <Label htmlFor="thumbnail-subtitle" className="text-sm font-bold">
                Subtitle
              </Label>
              <Input
                id="thumbnail-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A short tagline"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="thumbnail-button-text"
              className="text-sm font-bold"
            >
              Button text
            </Label>
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
