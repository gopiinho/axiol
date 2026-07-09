"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUpdateContentConfig, useDeleteContentFile } from "../../hooks/useProduct";
import type { ProductStepComponentProps } from "../../registry/steps";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2, Upload, X, Plus, Link, Pencil } from "lucide-react";
import { useUploadWithProgress } from "../../hooks/useUploadWithProgress";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  isAllowedContentType,
  isBlockedMimeType,
  isBlockedExtension,
  MAX_CONTENT_SIZE,
} from "@/convex/contentLimits";
import { Button } from "@/components/ui/button";

function StepNumber({ num }: { num: number }) {
  return (
    <span className="bg-primary/30 text-foreground mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
      {num}
    </span>
  );
}

interface FileEntry {
  r2Key: string;
  fileName: string;
  fileSize: number;
}

interface SavedContent {
  mode?: string;
  r2Key?: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  productName?: string;
}

type Mode = "upload" | "url";

function readSaved(product: ProductStepComponentProps["product"]): {
  savedFile: FileEntry | null;
  url: string;
  mode: Mode;
  productName: string;
} {
  const content = product.config?.content as SavedContent | undefined;
  if (!content) return { savedFile: null, url: "", mode: "upload", productName: "" };

  if (content.mode === "external_link") {
    return {
      savedFile: null,
      url: content.url ?? "",
      mode: "url",
      productName: content.productName ?? "",
    };
  }

  if (content.mode === "upload" && content.r2Key) {
    return {
      savedFile: {
        r2Key: content.r2Key,
        fileName: content.fileName ?? "",
        fileSize: content.fileSize ?? 0,
      },
      url: "",
      mode: "upload",
      productName: "",
    };
  }

  return { savedFile: null, url: "", mode: "upload", productName: "" };
}

export function ContentStep({ productId, product, onRegisterSave }: ProductStepComponentProps) {
  const saved = readSaved(product);

  const [mode, setMode] = useState<Mode>(saved.mode);
  const [externalUrl, setExternalUrl] = useState(saved.url);
  const [productName, setProductName] = useState(saved.productName);
  const [savedFile, setSavedFile] = useState<FileEntry | null>(saved.savedFile);
  const [uploadedFile, setUploadedFile] = useState<FileEntry | null>(null);
  const [errors, setErrors] = useState<{
    file?: string;
    url?: string;
    productName?: string;
  }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateContentConfig = useUpdateContentConfig();
  const deleteContentFile = useDeleteContentFile();
  const { upload, uploading, progress, error: uploadError } = useUploadWithProgress();

  const displayFile = uploadedFile ?? savedFile;

  const validateFile = useCallback((file: File): string | null => {
    if (isBlockedExtension(file.name)) {
      return "This file type is not allowed.";
    }
    if (isBlockedMimeType(file.type)) {
      return "Video files are not supported.";
    }
    if (!isAllowedContentType(file.type)) {
      return "Unsupported file type. Accepted formats: PDF, ZIP, EPUB, DOCX, TXT, CSV, JSON, MD, HTML, PNG, JPG, WebP, GIF, SVG, MP3, WAV, OGG, FLAC, XLSX, PPTX";
    }
    if (file.size > MAX_CONTENT_SIZE) {
      const mb = (file.size / (1024 * 1024)).toFixed(0);
      return `${file.name} is ${mb} MB. Maximum upload size is 50 MB.`;
    }
    return null;
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setErrors((prev) => ({ ...prev, file: validationError }));
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      setErrors((prev) => ({ ...prev, file: undefined }));

      try {
        const r2Key = await upload(file);
        const prevUploaded = uploadedFile;
        setUploadedFile({
          r2Key,
          fileName: file.name,
          fileSize: file.size,
        });
        setSavedFile(null);

        if (prevUploaded) {
          try {
            await deleteContentFile({ r2Key: prevUploaded.r2Key });
          } catch {
            // best effort cleanup
          }
        }
      } catch {
        // error is surfaced via uploadError state
      }
    },
    [validateFile, upload, uploadedFile, deleteContentFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFileSelected(file);
  };

  const handleRemoveClick = () => {
    setDeleteTarget(displayFile);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    const isSaved = deleteTarget.r2Key === savedFile?.r2Key;

    if (isSaved) {
      try {
        await deleteContentFile({ r2Key: deleteTarget.r2Key });
        await updateContentConfig({
          productId: productId as unknown as Id<"products">,
          config: { mode: "upload" },
        });
        setSavedFile(null);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          file: err instanceof Error ? err.message : "Failed to delete file. Please try again.",
        }));
        setDeleteTarget(null);
        setDeleting(false);
        return;
      }
    } else {
      if (deleteTarget.r2Key === uploadedFile?.r2Key) {
        setUploadedFile(null);
      }
      try {
        await deleteContentFile({ r2Key: deleteTarget.r2Key });
      } catch {
        // best effort for unsaved files
      }
    }

    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleSave = useCallback(async () => {
    if (uploadedFile) {
      await updateContentConfig({
        productId: productId as unknown as Id<"products">,
        config: {
          mode: "upload",
          r2Key: uploadedFile.r2Key,
          fileName: uploadedFile.fileName || undefined,
          fileSize: uploadedFile.fileSize,
        },
      });
      setSavedFile(uploadedFile);
      setUploadedFile(null);
    } else if (externalUrl.trim()) {
      await updateContentConfig({
        productId: productId as unknown as Id<"products">,
        config: {
          mode: "external_link",
          url: externalUrl.trim(),
          productName: productName.trim() || undefined,
        },
      });
      setSavedFile(null);
    }
  }, [uploadedFile, externalUrl, productName, productId, updateContentConfig]);

  const saveAndValidate = useCallback(async () => {
    const newErrors: {
      file?: string;
      url?: string;
      productName?: string;
    } = {};

    if (mode === "upload") {
      if (!uploadedFile && !savedFile) {
        newErrors.file = "Upload a file to continue";
      }
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
  }, [handleSave, mode, uploadedFile, savedFile, externalUrl, productName]);

  useEffect(() => {
    onRegisterSave?.(saveAndValidate);
  }, [saveAndValidate, onRegisterSave]);

  const hasUrlValue = !!externalUrl.trim() && mode === "url";
  const hasFileValue = !!displayFile && mode === "upload";
  const displayName = displayFile?.fileName ?? "";
  const displaySize = displayFile ? `${(displayFile.fileSize / (1024 * 1024)).toFixed(1)} MB` : "";

  return (
    <>
      <div className="space-y-10">
        <div className="space-y-6">
          <Label className="flex items-center text-base font-bold">
            <StepNumber num={1} />
            Upload your Digital Product
          </Label>

          <div className="space-y-4 pl-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-bold">Digital Product *</p>
                <p className="text-muted-foreground max-w-sm text-xs">
                  {mode === "upload"
                    ? "Axiol will send these files automatically to your customer upon purchase!"
                    : "Customers will be redirected to this URL after purchase."}
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Delivery method"
                className="border-border/60 bg-card/50 inline-flex shrink-0 items-center gap-1 rounded-full border p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "upload"}
                  disabled={hasUrlValue}
                  onClick={() => {
                    setMode("upload");
                    setErrors({});
                  }}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200",
                    mode === "upload"
                      ? "bg-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    hasUrlValue && "cursor-not-allowed opacity-40"
                  )}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "url"}
                  disabled={hasFileValue}
                  onClick={() => {
                    setMode("url");
                    setErrors({});
                  }}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200",
                    mode === "url"
                      ? "bg-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    hasFileValue && "cursor-not-allowed opacity-40"
                  )}
                >
                  Redirect to URL
                </button>
              </div>
            </div>

            {mode === "upload" ? (
              displayFile ? (
                <div className="border-border/60 bg-card/50 flex items-center justify-between rounded-xs border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xs">
                      {uploading ? (
                        <Loader2 className="text-primary h-5 w-5 animate-spin" />
                      ) : (
                        <Upload className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-muted-foreground text-xs">
                        {uploadedFile ? `${displaySize}` : displaySize}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveClick}
                    disabled={uploading}
                    className="text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded-xs px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
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
                    "border-border/70 bg-card/50 border border-dashed p-5",
                    "transition-colors duration-200",
                    isDragging && "border-primary bg-primary/5",
                    errors.file && "border-destructive",
                    uploading && "min-h-[136px]"
                  )}
                >
                  {uploading ? (
                    <div className="w-full max-w-xs space-y-2">
                      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-muted-foreground text-center text-xs">
                        {progress >= 100 ? "Saving..." : `${progress}% uploaded`}
                      </p>
                    </div>
                  ) : uploadError ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-destructive text-center text-xs">{uploadError}</p>
                      <span
                        onClick={() => inputRef.current?.click()}
                        className={cn(
                          "bg-card inline-flex items-center gap-2 rounded-xs px-4 py-2",
                          "text-foreground border-border/60 border text-sm font-semibold shadow-sm",
                          "hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-200"
                        )}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                        Try Again
                      </span>
                    </div>
                  ) : (
                    <>
                      <Button onClick={() => inputRef.current?.click()} variant="outline" size="sm">
                        <Plus className="h-4 w-4" strokeWidth={2} />
                        Upload
                      </Button>
                      <span className="text-muted-foreground text-xs">Drag Your File(s) Here</span>
                    </>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Link className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
                  <Pencil className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        productName: undefined,
                      }));
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
              accept=".pdf,.docx,.epub,.rtf,.txt,.csv,.md,.json,.html,.jpg,.jpeg,.png,.webp,.gif,.svg,.mp3,.wav,.ogg,.flac,.zip,.xlsx,.pptx"
            />

            {errors.file && !uploadError && (
              <p className="text-destructive text-sm">{errors.file}</p>
            )}
            {errors.url && <p className="text-destructive text-sm">{errors.url}</p>}
            {errors.productName && <p className="text-destructive text-sm">{errors.productName}</p>}
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="text-foreground font-medium">{deleteTarget?.fileName}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDeleteConfirm}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
