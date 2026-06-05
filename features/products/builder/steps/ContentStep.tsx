"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUpdateContentConfig, useGenerateContentUploadUrl, useSaveContentFile, useRemoveContentFile } from "../../hooks/useProduct";
import type { ProductStepComponentProps } from "../../registry/steps";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2, Upload, Link as LinkIcon, X, AlertCircle } from "lucide-react";

type ContentMode = "upload" | "external_link";

function StepNumber({ num }: { num: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/30 text-foreground text-xs font-bold mr-2 shrink-0">
      {num}
    </span>
  );
}

interface SavedFile {
  storageId: string;
  fileName: string;
}

interface SavedContent {
  mode?: string;
  storageId?: string;
  fileName?: string;
  url?: string;
}

function readSaved(product: ProductStepComponentProps["product"]): {
  mode: ContentMode;
  file: SavedFile | null;
  url: string;
} {
  const content = product.config?.content as SavedContent | undefined;
  if (!content) return { mode: "upload", file: null, url: "" };

  if (content.mode === "external_link") {
    return { mode: "external_link", file: null, url: content.url ?? "" };
  }

  if (content.mode === "upload" && content.storageId) {
    return {
      mode: "upload",
      file: { storageId: content.storageId, fileName: content.fileName ?? "" },
      url: "",
    };
  }

  return { mode: "upload", file: null, url: "" };
}

export function ContentStep({ productId, product, onRegisterSave }: ProductStepComponentProps) {
  const saved = readSaved(product);

  const [mode, setMode] = useState<ContentMode>(saved.mode);
  const [externalUrl, setExternalUrl] = useState(saved.url);
  const [uploading, setUploading] = useState(false);
  const [storedFile, setStoredFile] = useState<SavedFile | null>(saved.file);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateContentConfig = useUpdateContentConfig();
  const generateUploadUrl = useGenerateContentUploadUrl();
  const saveContentFile = useSaveContentFile();
  const removeContentFile = useRemoveContentFile();

  const hasContent = mode === "external_link" ? !!externalUrl.trim() : !!storedFile;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setShowError(false);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      await saveContentFile({
        productId: productId as unknown as Id<"products">,
        storageId: storageId as unknown as Id<"_storage">,
        fileName: file.name,
      });
      setStoredFile({ storageId, fileName: file.name });
      setMode("upload");
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemoveFile = async () => {
    try {
      await removeContentFile({ productId: productId as unknown as Id<"products"> });
      setStoredFile(null);
    } catch {}
  };

  const handleSave = useCallback(async () => {
    if (mode === "upload" && storedFile) {
      await updateContentConfig({
        productId: productId as unknown as Id<"products">,
        config: { mode: "upload", storageId: storedFile.storageId as unknown as Id<"_storage">, fileName: storedFile.fileName || undefined },
      });
    } else if (mode === "external_link" && externalUrl.trim()) {
      await updateContentConfig({
        productId: productId as unknown as Id<"products">,
        config: { mode: "external_link", url: externalUrl.trim() },
      });
    }
  }, [mode, externalUrl, storedFile, productId, updateContentConfig]);

  const saveAndValidate = useCallback(async () => {
    await handleSave();
    if (!hasContent) {
      setShowError(true);
      throw new Error("Content is required before continuing.");
    }
  }, [handleSave, hasContent]);

  useEffect(() => {
    onRegisterSave?.(saveAndValidate);
  }, [saveAndValidate, onRegisterSave]);

  return (
    <div className="space-y-10">

      <div className="space-y-3">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={1} />
          Delivery type
        </Label>
        <div className="flex gap-2 pl-8">
          {[
            { value: "upload" as ContentMode, label: "Upload file" },
            { value: "external_link" as ContentMode, label: "External link" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { setMode(option.value); setShowError(false); }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xs border transition-colors",
                mode === option.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-foreground hover:border-primary/50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "upload" && (
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-medium">
            <StepNumber num={2} />
            Upload file
          </Label>
          <div className="pl-8">
            {storedFile ? (
              <div className="flex items-center justify-between p-4 border border-border/60 rounded-xs bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xs bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{storedFile.fileName}</p>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xs transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "border-2 border-dashed rounded-xs transition-colors cursor-pointer",
                  showError
                    ? "border-destructive/60 bg-destructive/5"
                    : "border-border/70 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50",
                )}
                onClick={() => !uploading && inputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-3 py-10 px-6">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : showError ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  )}
                  <p className={cn("text-sm", showError ? "text-destructive font-medium" : "text-muted-foreground")}>
                    {uploading ? "Uploading..." : showError ? "A file is required" : "Click to upload a file"}
                  </p>
                  {!uploading && !showError && (
                    <p className="text-xs text-muted-foreground">Any file type supported</p>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "external_link" && (
        <div className="space-y-3">
          <Label className="flex items-center text-sm font-medium">
            <StepNumber num={2} />
            External URL
          </Label>
          <div className="pl-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={externalUrl}
                  onChange={(e) => { setExternalUrl(e.target.value); setShowError(false); }}
                  placeholder="https://example.com/download"
                  className={showError && !externalUrl.trim() ? "border-destructive" : ""}
                />
              </div>
              {showError && !externalUrl.trim() && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  A URL is required
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
