"use client";

import { ProductCard } from "@/features/products/components/ProductCard";
import type { ProductItem } from "@/features/store/types";
import { BrushCleaning } from "lucide-react";

type ProductSectionProps = {
  products: ProductItem[];
  username?: string;
  interactive?: boolean;
  compact?: boolean;
};

export function ProductSection({
  products,
  username,
  interactive = true,
  compact,
}: ProductSectionProps) {
  if (products.length === 0) {
    return (
      <div className="h-full py-16 text-center">
        <p className="mx-auto mb-3 text-4xl" style={{ color: "var(--store-accent)" }}>
          <BrushCleaning className="mx-auto h-12 w-12" />
        </p>
        <p style={{ color: "var(--store-text-muted)" }} className="text-base">
          Nothing to show here yet!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`mt-4 grid grid-cols-1 gap-4 px-4 pb-16 ${compact ? "" : "md:grid-cols-2 lg:mx-auto lg:max-w-[70%]"}`}
    >
      {products.map((product, index) => (
        <div key={product._id}>
          <ProductCard
            product={product}
            username={username}
            index={index}
            interactive={interactive}
          />
        </div>
      ))}
    </div>
  );
}
