"use client";

import { Package } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { ProductItem } from "@/features/store/types";

type ProductSectionProps = {
  products: ProductItem[];
  username?: string;
  interactive?: boolean;
};

export function ProductSection({ products, username, interactive = true }: ProductSectionProps) {
  if (products.length === 0) {
    return (
      <div className="h-full py-16 text-center">
        <p className="mx-auto mb-3 text-4xl" style={{ color: "var(--store-accent)" }}>
          :(
        </p>
        <p style={{ color: "var(--store-text-muted)" }} className="text-base">
          Nothing to show here yet!
        </p>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-3 gap-5">
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          username={username}
          index={index}
          interactive={interactive}
        />
      ))}
    </div>
  );
}
