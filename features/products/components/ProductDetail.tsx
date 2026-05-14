"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ImageUpload";
import { cn } from "@/lib/utils";
import {
  useUpdateProduct,
  useSaveProductCoverImage,
  useRemoveProductCoverImage,
} from "../hooks/useProduct";

interface ProductDetailProps {
  username: string;
  product: Doc<"products"> & { coverImageUrl?: string | null };
}

export type ProductDetailHandle = {
  save: () => Promise<void>;
};

export const ProductDetail = forwardRef<
  ProductDetailHandle,
  ProductDetailProps
>(function ProductDetail({ username, product }, ref) {
  const [name, setName] = useState(product.name);
  const [productUrl, setProductUrl] = useState(product.productUrl);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price ?? "");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateProduct = useUpdateProduct();
  const saveCoverImage = useSaveProductCoverImage();
  const removeCoverImage = useRemoveProductCoverImage();

  useEffect(() => {
    setName(product.name);
    setProductUrl(product.productUrl);
    setDescription(product.description ?? "");
    setPrice(product.price ?? "");
  }, [product]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await updateProduct({
        id: product._id,
        name: name.trim(),
        productUrl: productUrl.trim(),
        description: description.trim() || undefined,
        price: price.trim() || undefined,
        type: "affiliate",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save product.",
      );
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSave,
  }));

  return (
    <div className="space-y-8">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="product-name">Name</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-url">URL</Label>
          <div
            className={cn(
              "flex h-10 w-full items-center gap-0 rounded-xs border bg-card/90 px-2 py-2 text-base shadow-sm transition-[color,box-shadow,transform]",
              "focus-within:border-ring focus-within:ring-ring/40 focus-within:ring-[3px] focus-within:bg-card",
            )}
          >
            <span className="border border-primary px-3 bg-primary/20 py-1.5 rounded-full mr-1 shrink-0 select-none whitespace-nowrap text-sm">
              axiol.store/{username}/p/
            </span>
            <input
              id="product-url"
              value={productUrl}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                setProductUrl(filtered);
              }}
              placeholder="my-product-url"
              className="min-w-0 flex-1 border-none bg-transparent p-0 text-base outline-none placeholder:text-muted-foreground md:text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {product.status === "published"
              ? "Changing the URL will break existing links."
              : "URL-friendly name for your product page."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description">Description</Label>
          <Textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price">Display price</Label>
          <Input
            id="product-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., Free, $29, Starting at ₹999"
          />
          <p className="text-xs text-muted-foreground">
            Optional. Shown on the product card.
          </p>
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <Label>Cover image</Label>
        <ImageUpload
          currentImageUrl={product.coverImageUrl}
          onUploaded={async (storageId) => {
            try {
              await saveCoverImage({
                productId: product._id,
                storageId: storageId as unknown as Id<"_storage">,
              });
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Failed to upload cover image.",
              );
            }
          }}
          onRemove={async () => {
            try {
              await removeCoverImage({ productId: product._id });
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Failed to remove cover image.",
              );
            }
          }}
          maxSizeBytes={2 * 1024 * 1024}
          maxSizeLabel="2 MB"
          aspectRatio="4/1"
        />
      </div>
    </div>
  );
});
