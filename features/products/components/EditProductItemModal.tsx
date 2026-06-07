"use client";

import { useState, useEffect } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProductItem } from "../hooks/useProduct";

interface EditProductItemModalProps {
  item: Doc<"productItems">;
  open: boolean;
  onClose: () => void;
}

export function EditProductItemModal({ item, open, onClose }: EditProductItemModalProps) {
  const [affiliateLink, setAffiliateLink] = useState(item.affiliateLink);
  const [price, setPrice] = useState(item.price ?? "");
  const [platform, setPlatform] = useState(item.platform ?? "amazon");
  const [title, setTitle] = useState(item.title ?? "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateItem = useUpdateProductItem();

  useEffect(() => {
    setAffiliateLink(item.affiliateLink);
    setPrice(item.price ?? "");
    setPlatform(item.platform ?? "amazon");
    setTitle(item.title ?? "");
    setImageUrl(item.imageUrl ?? "");
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await updateItem({
        id: item._id,
        affiliateLink,
        price: price || undefined,
        platform,
        title: title || undefined,
        imageUrl: imageUrl || undefined,
      });

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Couldn't update this item. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-border/70 flex-row items-center justify-between border-b px-5 py-3.5">
          <DialogTitle className="text-lg font-semibold">Edit item</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="text-background"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              form="edit-item-form"
              disabled={loading || !affiliateLink.trim()}
              className="px-5"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogHeader>

        <form id="edit-item-form" onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t update item</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-item-title">Product name</Label>
            <Input
              id="edit-item-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Levi's Women's Skinny Jeans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-affiliate-link">
              Affiliate link{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="edit-affiliate-link"
              type="url"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              placeholder="https://..."
              required
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-platform">
                Platform{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="edit-platform" aria-required="true">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="flipkart">Flipkart</SelectItem>
                  <SelectItem value="nykaa">Nykaa</SelectItem>
                  <SelectItem value="myntra">Myntra</SelectItem>
                  <SelectItem value="meesho">Meesho</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹1,999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image-url">Image URL</Label>
            <Input
              id="edit-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-muted-foreground text-xs">Optional: add a product image URL.</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
