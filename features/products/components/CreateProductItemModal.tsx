"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCreateProductItem } from "../hooks/useProduct";

interface CreateProductItemModalProps {
  productId: Id<"products">;
  open: boolean;
  onClose: () => void;
}

export function CreateProductItemModal({
  productId,
  open,
  onClose,
}: CreateProductItemModalProps) {
  const [affiliateLink, setAffiliateLink] = useState("");
  const [price, setPrice] = useState("");
  const [platform, setPlatform] = useState("amazon");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createItem = useCreateProductItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await createItem({
        productId,
        affiliateLink,
        price: price || undefined,
        platform,
        title: title || undefined,
        imageUrl: imageUrl || undefined,
      });

      setAffiliateLink("");
      setPrice("");
      setPlatform("amazon");
      setTitle("");
      setImageUrl("");
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Couldn't add this item. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-155 max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
          <DialogDescription>
            Add an affiliate link to this product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t add item</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="item-title">Product name</Label>
            <Input
              id="item-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Levi's Women's Skinny Jeans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliate-link">
              Affiliate link{" "}
              <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="affiliate-link"
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
              <Label htmlFor="platform">
                Platform{" "}
                <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform" aria-required="true">
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
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹1,999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Optional: add a product image URL.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !affiliateLink.trim()}>
              {loading ? "Adding..." : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
