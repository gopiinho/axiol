"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUpdateProduct,
  useUpdateCheckoutConfig,
  useGenerateProductCoverUploadUrl,
  useSaveProductCoverImage,
  useRemoveProductCoverImage,
} from "../../hooks/useProduct";
import type { ProductStepComponentProps } from "../../registry/steps";
import type { Id } from "@/convex/_generated/dataModel";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

function StepNumber({ num }: { num: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/30 text-foreground text-xs font-bold mr-2 shrink-0">
      {num}
    </span>
  );
}

export function CheckoutStep({ productId, product, onRegisterSave }: ProductStepComponentProps) {
  const [name, setName] = useState(product.name);
  const [productUrl, setProductUrl] = useState(product.productUrl);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price ?? "");
  const [phoneEnabled, setPhoneEnabled] = useState(false);
  const [phoneRequired, setPhoneRequired] = useState(false);

  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateProduct = useUpdateProduct();
  const updateCheckoutConfig = useUpdateCheckoutConfig();
  const generateCoverUploadUrl = useGenerateProductCoverUploadUrl();
  const saveProductCoverImage = useSaveProductCoverImage();
  const removeProductCoverImage = useRemoveProductCoverImage();

  const persistedCoverUrl = product.coverImageUrl ?? null;
  const displayCoverUrl = coverPreview ?? persistedCoverUrl;

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return;
    if (file.size > MAX_SIZE) return;

    setCoverUploading(true);
    setCoverPreview(URL.createObjectURL(file));

    try {
      const uploadUrl = await generateCoverUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      await saveProductCoverImage({
        productId: productId as unknown as Id<"products">,
        storageId: storageId as unknown as Id<"_storage">,
      });
    } catch {
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemoveCover = async () => {
    setCoverPreview(null);
    try {
      await removeProductCoverImage({ productId: productId as unknown as Id<"products"> });
    } catch {}
  };

  const handleSave = useCallback(async () => {
    await updateProduct({
      id: productId as unknown as Id<"products">,
      name: name.trim(),
      productUrl: productUrl.trim(),
      description: description.trim() || undefined,
      price: price.trim() || undefined,
      type: product.type as "affiliate" | "digital",
    });

    const collectFields = [
      { key: "name", label: "Name", type: "text" as const, required: true, enabled: true },
      { key: "email", label: "Email", type: "email" as const, required: true, enabled: true },
      { key: "phone", label: "Phone number", type: "phone" as const, required: phoneRequired, enabled: phoneEnabled },
    ];

    await updateCheckoutConfig({
      productId: productId as unknown as Id<"products">,
      config: {
        descriptionJson: description.trim() || undefined,
        collectFields,
      },
    });
  }, [productId, product.type, name, productUrl, description, price, phoneEnabled, phoneRequired, updateProduct, updateCheckoutConfig]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
  }, [handleSave, onRegisterSave]);

  return (
    <div className="space-y-10">

      <div className="space-y-3">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={1} />
          Select cover
        </Label>
        <div className="pl-8">
          <div className={cn(
            "flex gap-4",
            displayCoverUrl ? "items-start" : "items-stretch"
          )}>
            {displayCoverUrl && (
              <div className="w-40 shrink-0 rounded-xs border border-border/60 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayCoverUrl} alt="Cover" className="w-full h-24 object-cover" />
              </div>
            )}
            <div className="flex-1">
              {!displayCoverUrl ? (
                <div
                  className={cn(
                    "border-2 border-dashed border-border/70 bg-secondary/30",
                    "flex flex-col items-center justify-center gap-3 py-12 px-6",
                    "transition-all duration-200 hover:border-primary/50 hover:bg-secondary/50",
                    "cursor-pointer",
                  )}
                  onClick={() => !coverUploading && inputRef.current?.click()}
                >
                  {coverUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload cover image</p>
                      <p className="text-xs text-muted-foreground">Horizontal image, JPEG/PNG/WebP, max 2MB</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={coverUploading}
                    className="text-xs text-primary hover:underline"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    disabled={coverUploading}
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
            onChange={handleCoverSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={2} />
          Product details
        </Label>
        <div className="pl-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-name" className="text-xs">Name</Label>
            <Input
              id="checkout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your product name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-description" className="text-xs">Description</Label>
            <Textarea
              id="checkout-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-url" className="text-xs">URL</Label>
            <div className={cn(
              "flex h-10 w-full items-center gap-0 rounded-xs border bg-card/90 px-2 py-2 text-base transition-[color,box-shadow,transform]",
              "focus-within:border-ring focus-within:ring-ring/40 focus-within:ring-[3px] focus-within:bg-card",
            )}>
              <span className="border border-primary px-3 bg-primary/20 py-1.5 rounded-full mr-1 shrink-0 select-none whitespace-nowrap text-sm">
                axiol.store/{product.username ?? "..."}/p/
              </span>
              <input
                id="checkout-url"
                value={productUrl}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                  setProductUrl(filtered);
                }}
                placeholder="my-product-url"
                className="min-w-0 flex-1 border-none bg-transparent p-0 text-base outline-none placeholder:text-muted-foreground md:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={3} />
          Product Price
        </Label>
        <div className="pl-8">
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., $29, ₹999"
          />
          <p className="text-xs text-muted-foreground mt-1">Optional. Shown on the product card.</p>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="flex items-center text-sm font-medium">
          <StepNumber num={4} />
          Buyer Information
        </Label>
        <div className="pl-8 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value="Name field" disabled className="opacity-60" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value="Email field" disabled className="opacity-60" />
          </div>

          <div className="border border-border/60 rounded-xs p-3 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={phoneEnabled}
                onChange={(e) => setPhoneEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary"
              />
              <div>
                <p className="text-sm font-medium">Phone number</p>
                <p className="text-xs text-muted-foreground">Optional field</p>
              </div>
            </div>
            {phoneEnabled && (
              <div className="flex items-center gap-2 pl-7">
                <input
                  type="checkbox"
                  checked={phoneRequired}
                  onChange={(e) => setPhoneRequired(e.target.checked)}
                  className="h-3 w-3 rounded"
                />
                <span className="text-xs text-muted-foreground">Required</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
