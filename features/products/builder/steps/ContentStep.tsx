"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useUpdateContentConfig,
  useGenerateContentUploadUrl,
  useSaveContentFile,
  useRemoveContentFile,
} from "../../hooks/useProduct";
import type { ProductStepComponentProps } from "../../registry/steps";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Loader2,
  Upload,
  X,
  Plus,
  Link,
  Pencil,
} from "lucide-react";

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
  productName?: string;
}

type Mode = "upload" | "url";

function readSaved(product: ProductStepComponentProps["product"]): {
  file: SavedFile | null;
  url: string;
  mode: Mode;
  productName: string;
} {
  const content = product.config?.content as SavedContent | undefined;
  if (!content) return { file: null, url: "", mode: "upload", productName: "" };

  if (content.mode === "external_link") {
    return {
      file: null,
      url: content.url ?? "",
      mode: "url",
      productName: content.productName ?? "",
    };
  }

  if (content.mode === "upload" && content.storageId) {
    return {
      file: { storageId: content.storageId, fileName: content.fileName ?? "" },
      url: "",
      mode: "upload",
      productName: "",
    };
  }

  return { file: null, url: "", mode: "upload", productName: "" };
}

export function ContentStep({
  productId,
  product,
  onRegisterSave,
}: ProductStepComponentProps) {
  const saved = readSaved(product);

  const [mode, setMode] = useState<Mode>(saved.mode);
  const [externalUrl, setExternalUrl] = useState(saved.url);
  const [productName, setProductName] = useState(saved.productName);
  const [uploading, setUploading] = useState(false);
  const [storedFile, setStoredFile] = useState<SavedFile | null>(saved.file);
  const [errors, setErrors] = useState<{ file?: string; url?: string; productName?: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateContentConfig = useUpdateContentConfig();
  const generateUploadUrl = useGenerateContentUploadUrl();
  const saveContentFile = useSaveContentFile();
  const removeContentFile = useRemoveContentFile();

  const uploadFile = async (file: File) => {
    setUploading(true);
    setErrors((prev) => ({ ...prev, file: undefined }));
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
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleRemoveFile = async () => {
    try {
      await removeContentFile({
        productId: productId as unknown as Id<"products">,
      });
      setStoredFile(null);
    } catch {}
  };

  const handleSave = useCallback(async () => {
    if (storedFile) {
      await updateContentConfig({
        productId: productId as unknown as Id<"products">,
        config: {
          mode: "upload",
          storageId: storedFile.storageId as unknown as Id<"_storage">,
          fileName: storedFile.fileName || undefined,
        },
      });
    } else if (externalUrl.trim()) {
      await updateContentConfig({
        productId: productId as unknown as Id<"products">,
        config: {
          mode: "external_link",
          url: externalUrl.trim(),
          productName: productName.trim() || undefined,
        },
      });
    }
  }, [storedFile, externalUrl, productName, productId, updateContentConfig]);

  const saveAndValidate = useCallback(async () => {
    const newErrors: { file?: string; url?: string; productName?: string } = {};

    if (mode === "upload" && !storedFile) {
      newErrors.file = "Upload a file to continue";
    }
    if (mode === "url") {
      if (!externalUrl.trim()) newErrors.url = "URL is required";
      if (!productName.trim()) newErrors.productName = "Product name is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      throw new Error("Content is required before continuing.");
    }

    await handleSave();
  }, [handleSave, mode, storedFile, externalUrl, productName]);

  useEffect(() => {
    onRegisterSave?.(saveAndValidate);
  }, [saveAndValidate, onRegisterSave]);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={1} />
          Upload your Digital Product
        </Label>

        <div className="pl-8 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold">Digital Product *</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {mode === "upload"
                  ? "Axiol will send these files automatically to your customer upon purchase!"
                  : "Customers will be redirected to this URL after purchase."}
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Delivery method"
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/50 p-1 shrink-0"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "upload"}
                disabled={!!externalUrl.trim() && mode === "url"}
                onClick={() => {
                  setMode("upload");
                  setErrors({});
                }}
                className={cn(
                  "inline-flex items-center cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200",
                  mode === "upload"
                    ? "bg-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  !!externalUrl.trim() &&
                    mode === "url" &&
                    "opacity-40 cursor-not-allowed",
                )}
              >
                Upload File
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "url"}
                disabled={!!storedFile && mode === "upload"}
                onClick={() => {
                  setMode("url");
                  setErrors({});
                }}
                className={cn(
                  "inline-flex items-center cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200",
                  mode === "url"
                    ? "bg-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  !!storedFile &&
                    mode === "upload" &&
                    "opacity-40 cursor-not-allowed",
                )}
              >
                Redirect to URL
              </button>
            </div>
          </div>

          {mode === "upload" ? (
            storedFile ? (
              <div className="flex items-center justify-between p-4 border border-border/60 rounded-xs bg-card/50">
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
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!uploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-3 rounded-xs",
                  "border border-dashed border-border/70 bg-card/50 p-5 h-[136px]",
                  "transition-colors duration-200",
                  isDragging && "border-primary bg-primary/5",
                  uploading && "opacity-60",
                  errors.file && "border-destructive",
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Uploading...
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      onClick={() => !uploading && inputRef.current?.click()}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xs bg-card px-4 py-2",
                        "text-sm font-semibold text-foreground shadow-sm border border-border/60",
                        "transition-all duration-200",
                        "hover:bg-accent hover:text-accent-foreground",
                        "cursor-pointer",
                      )}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                      Upload
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Drag Your File(s) Here
                    </span>
                  </>
                )}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="content-url"
                  value={externalUrl}
                  onChange={(e) => {
                    setExternalUrl(e.target.value);
                    setErrors((prev) => ({ ...prev, url: undefined }));
                  }}
                  placeholder="https://..."
                  className="pl-9"
                  aria-invalid={!!errors.url}
                />
              </div>
              <div className="relative">
                <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    setErrors((prev) => ({ ...prev, productName: undefined }));
                  }}
                  placeholder={'Your Product\'s Name (ex. "Course 101")'}
                  className="pl-9"
                  aria-invalid={!!errors.productName}
                />
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          {errors.file && (
            <p className="text-sm text-destructive">{errors.file}</p>
          )}
          {errors.url && (
            <p className="text-sm text-destructive">{errors.url}</p>
          )}
          {errors.productName && (
            <p className="text-sm text-destructive">{errors.productName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
