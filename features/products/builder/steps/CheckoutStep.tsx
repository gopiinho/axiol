"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, X, User, Mail, Phone } from "lucide-react";
import { RichTextEditor } from "../../components/rich-text";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  useUpdateProduct,
  useUpdateCheckoutConfig,
  useGenerateProductCoverUploadUrl,
  useSaveProductCoverImage,
  useRemoveProductCoverImage,
} from "../../hooks/useProduct";
import type { ProductStepComponentProps } from "../../registry/steps";
import type { CheckoutLiveState } from "@/features/products/components/cards/types";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

function StepNumber({ num }: { num: number }) {
  return (
    <span className="bg-primary/30 text-foreground mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
      {num}
    </span>
  );
}

interface CheckoutStepProps extends ProductStepComponentProps {
  onLiveChange?: (state: CheckoutLiveState) => void;
}

export function CheckoutStep({
  productId,
  product,
  onRegisterSave,
  onLiveChange,
}: CheckoutStepProps) {
  const [name, setName] = useState(product.name);
  const [productUrl, setProductUrl] = useState(product.productUrl);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price ?? "");
  const savedCheckoutConfig = product.config?.checkout as
    | { collectFields?: Array<{ key: string; enabled: boolean }>; buttonText?: string }
    | undefined;
  const savedPhoneEnabled =
    savedCheckoutConfig?.collectFields?.find((f) => f.key === "phone")?.enabled ?? false;
  const [phoneEnabled, setPhoneEnabled] = useState(savedPhoneEnabled);
  const [ctaButtonText, setCtaButtonText] = useState(savedCheckoutConfig?.buttonText || "Buy Now");

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
      toast.error("Failed to upload cover image", { description: "Please try again." });
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemoveCover = async () => {
    setCoverPreview(null);
    try {
      await removeProductCoverImage({
        productId: productId as unknown as Id<"products">,
      });
    } catch {
      toast.error("Failed to remove cover image", { description: "Please try again." });
    }
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
      {
        key: "name",
        label: "Name",
        type: "text" as const,
        required: true,
        enabled: true,
      },
      {
        key: "email",
        label: "Email",
        type: "email" as const,
        required: true,
        enabled: true,
      },
      {
        key: "phone",
        label: "Phone number",
        type: "phone" as const,
        required: phoneEnabled,
        enabled: phoneEnabled,
      },
    ];

    await updateCheckoutConfig({
      productId: productId as unknown as Id<"products">,
      config: {
        descriptionJson: description.trim() || undefined,
        buttonText: ctaButtonText.trim(),
        collectFields,
      },
    });
  }, [
    productId,
    product.type,
    name,
    productUrl,
    description,
    price,
    ctaButtonText,
    phoneEnabled,
    updateProduct,
    updateCheckoutConfig,
  ]);

  useEffect(() => {
    onRegisterSave?.(handleSave);
  }, [handleSave, onRegisterSave]);

  useEffect(() => {
    onLiveChange?.({
      name: name.trim() || product.name,
      description: description.trim(),
      price: price.trim(),
      coverImageUrl: displayCoverUrl,
      phoneEnabled,
      username: product.username ?? "",
      type: product.type,
      checkoutButtonText: ctaButtonText.trim() || "Buy Now",
    });
  }, [
    name,
    description,
    price,
    displayCoverUrl,
    phoneEnabled,
    ctaButtonText,
    product.name,
    product.username,
    product.type,
    onLiveChange,
  ]);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={1} />
          Cover
        </Label>
        <div className="space-y-3 pl-8">
          {displayCoverUrl ? (
            <>
              <div className="flex items-start">
                <div className="group relative">
                  <div className="border-foreground/90 h-20 w-28 overflow-hidden rounded-xs border-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayCoverUrl}
                      alt="Cover thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    disabled={coverUploading}
                    className={cn(
                      "absolute -top-2 -right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full",
                      "bg-[oklch(0.62_0.22_25)] shadow-md",
                      "transition-transform duration-200 hover:scale-110",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    aria-label="Remove cover image"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="border-border/60 bg-secondary/20 relative overflow-hidden rounded-xs border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayCoverUrl}
                  alt="Cover preview"
                  className="block aspect-3/1 h-auto w-full object-cover"
                />
              </div>
            </>
          ) : (
            <div
              className={cn(
                "flex w-full flex-col items-center justify-center gap-3 rounded-xs",
                "border-border/70 bg-card/50 h-34 border border-dashed p-5",
                coverUploading && "opacity-60"
              )}
            >
              {coverUploading ? (
                <>
                  <Loader2 className="text-primary h-5 w-5 animate-spin" />
                  <span className="text-muted-foreground text-xs">Uploading...</span>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => !coverUploading && inputRef.current?.click()}
                    disabled={coverUploading}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Upload photo
                  </Button>
                  <span className="text-muted-foreground text-xs">
                    Images should be horizontal, at least 1280x720px, and 72 DPI (dots per inch).
                  </span>
                </>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={2} />
          Product details
        </Label>
        <div className="space-y-4 pl-8">
          <div className="space-y-2">
            <Label htmlFor="checkout-name" className="text-sm font-bold">
              Name *
            </Label>
            <Input
              id="checkout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your product name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-description" className="text-sm font-bold">
              Description
            </Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe your product..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-cta" className="text-sm font-bold">
              Call to Action Button *
            </Label>
            <Input
              id="checkout-cta"
              value={ctaButtonText}
              onChange={(e) => setCtaButtonText(e.target.value)}
              placeholder="Buy Now"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-url" className="text-sm font-bold">
              URL *
            </Label>
            <div
              className={cn(
                "bg-card/90 flex h-10 w-full items-center gap-0 rounded-xs border px-2 py-5 text-base transition-[color,box-shadow,transform]",
                "focus-within:border-ring focus-within:ring-ring/40 focus-within:bg-card focus-within:ring-[3px]"
              )}
            >
              <span className="border-primary bg-primary/20 mr-1 shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap select-none">
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
                className="placeholder:text-muted-foreground min-w-0 flex-1 border-none bg-transparent p-0 text-base font-medium outline-none md:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={3} />
          Set Price
        </Label>
        <div className="space-y-2 pl-8">
          <Label htmlFor="checkout-name" className="text-sm font-bold">
            Price(₹) *
          </Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., $29, ₹999"
          />
        </div>
      </div>

      <div className="space-y-6">
        <Label className="flex items-center text-base font-bold">
          <StepNumber num={4} />
          Collect Info
        </Label>
        <div className="space-y-4 pl-8">
          <div>
            <p className="text-sm font-bold">Fields</p>
            <p className="text-muted-foreground text-xs">Basic fields cannot be edited</p>
          </div>

          <div className="relative">
            <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input value="Name field" disabled className="pl-9 opacity-60" />
          </div>

          <div className="relative">
            <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input value="Email field" disabled className="pl-9 opacity-60" />
          </div>

          <hr className="border-border/60" />

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Phone className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Phone number"
                className={cn("pl-9", !phoneEnabled && "opacity-60")}
                disabled
              />
            </div>
            <Switch
              checked={phoneEnabled}
              onCheckedChange={setPhoneEnabled}
            />
          </div>
        </div>
      </div>

      <div className="pb-8" />
    </div>
  );
}
