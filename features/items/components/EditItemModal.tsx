"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { requireAdminSessionToken } from "@/features/auth/client/session";
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
import { validateItemInput } from "@/lib/validators/items";

interface EditItemModalProps {
  item: {
    id: Id<"items">;
    affiliateLink: string;
    price?: string;
    platform: string;
    itemTitle?: string;
    imageUrl?: string;
  };
  open: boolean;
  onClose: () => void;
}

export default function EditItemModal({
  item,
  open,
  onClose,
}: EditItemModalProps) {
  const [affiliateLink, setAffiliateLink] = useState(item.affiliateLink);
  const [price, setPrice] = useState(item.price || "");
  const [platform, setPlatform] = useState(item.platform);
  const [itemTitle, setItemTitle] = useState(item.itemTitle || "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateItem = useMutation(api.items.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const token = requireAdminSessionToken();
      const validated = validateItemInput({
        affiliateLink,
        price,
        platform,
        itemTitle,
        imageUrl,
      });

      await updateItem({
        token,
        id: item.id,
        affiliateLink: validated.affiliateLink,
        price: validated.price,
        platform: validated.platform,
        itemTitle: validated.itemTitle,
        imageUrl: validated.imageUrl,
      });
      onClose();
    } catch (error) {
      console.error("Error updating item:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
          <DialogDescription>Update item details for this list.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="e.g., Levi's Women's Skinny Jeans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-affiliate-link">
              Affiliate link <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-affiliate-link"
              type="url"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-platform">
                Platform <span className="text-red-500">*</span>
              </Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="edit-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="flipkart">Flipkart</SelectItem>
                  <SelectItem value="nykaa">Nykaa</SelectItem>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !affiliateLink.trim()}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
