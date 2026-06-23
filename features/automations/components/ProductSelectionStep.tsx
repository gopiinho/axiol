"use client";

import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { IndianRupee, Package } from "lucide-react";

interface ProductOption {
  _id: Id<"products">;
  name: string;
  price: string | null;
  thumbnailImageUrl: string | null;
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
  const isLoading = products === undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Choose a Product</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Which product should followers receive in the DM?
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-border bg-card overflow-hidden rounded-xs border">
              <div className="bg-muted aspect-4/5 animate-pulse" />
              <div className="space-y-2 p-2.5">
                <div className="bg-muted h-3 w-4/5 animate-pulse rounded" />
                <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="app-panel flex flex-col items-center py-14 text-center">
          <Package className="text-muted-foreground/30 h-10 w-10" />
          <p className="mt-4 text-sm font-medium">No products yet</p>
          <p className="text-muted-foreground mt-1 max-w-xs text-xs">
            Create a product first, then come back to set up auto-DMs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => {
            const isSelected = selectedProductId === product._id;
            return (
              <button
                type="button"
                key={product._id}
                onClick={() => onSelectProduct(product._id)}
                className={`group cursor-pointer overflow-hidden rounded-xs border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-card hover:border-border border-transparent"
                }`}
              >
                <div className="bg-muted relative aspect-4/5 overflow-hidden">
                  {product.thumbnailImageUrl ? (
                    <Image
                      src={product.thumbnailImageUrl}
                      alt={product.name}
                      width={320}
                      height={420}
                      className="h-full w-full object-cover transition duration-300"
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      <Package className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="bg-primary/10 absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-2.5">
                  <p className="truncate text-xs font-semibold">{product.name}</p>
                  {product.price && (
                    <p className="text-primary inline-flex items-center gap-0.5 text-xs font-medium">
                      <IndianRupee className="h-3 w-3" />
                      {product.price}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
