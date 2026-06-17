"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductOption {
  _id: Id<"products">;
  name: string;
}

interface ProductSelectionStepProps {
  products?: ProductOption[];
  selectedProductId: Id<"products"> | "";
  onSelectProduct: (productId: Id<"products">) => void;
}

export default function ProductSelectionStep({
  products,
  selectedProductId,
  onSelectProduct,
}: ProductSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Choose a Product</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Which product should followers receive in the DM?
        </p>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="product">Product</Label>
        <Select
          value={selectedProductId}
          onValueChange={(value) => onSelectProduct(value as Id<"products">)}
        >
          <SelectTrigger id="product">
            <SelectValue placeholder="Choose product..." />
          </SelectTrigger>
          <SelectContent>
            {!products || products.length === 0 ? (
              <SelectItem value="__noop__" disabled>
                No products yet
              </SelectItem>
            ) : (
              products?.map((product) => (
                <SelectItem key={product._id} value={product._id}>
                  {product.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
