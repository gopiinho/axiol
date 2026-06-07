"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { ProductTypeIcon } from "./ProductTypeIcon";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    productUrl: string;
    type?: string;
    price?: string | null;
    coverImageUrl?: string | null;
    thumbnailImageUrl?: string | null;
    itemCount: number;
  };
  username?: string;
  index?: number;
  interactive?: boolean;
}

export function ProductCard({
  product,
  username,
  index = 0,
  interactive = true,
}: ProductCardProps) {
  const previewUrl = product.thumbnailImageUrl || product.coverImageUrl;

  const card = (
    <div className="group border-border/60 hover:border-border relative w-full cursor-pointer overflow-hidden rounded-sm border bg-white transition-all duration-300">
      <div className="bg-secondary/20 aspect-4/3 overflow-hidden">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="from-primary/10 to-pink/10 flex h-full w-full items-center justify-center bg-linear-to-br">
            <Package className="text-muted-foreground/40 h-8 w-8" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground line-clamp-2 text-sm leading-tight font-semibold">
            {product.name}
          </h3>
          {product.type && (
            <ProductTypeIcon
              type={product.type}
              className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0"
            />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {product.price ? (
            <span className="text-primary text-xs font-semibold">{product.price}</span>
          ) : (
            <span className="text-muted-foreground text-xs">No price set</span>
          )}

          {product.type === "affiliate" && (
            <span className="text-muted-foreground text-[10px]">
              {product.itemCount} {product.itemCount === 1 ? "link" : "links"}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const href = username ? `/${username}/p/${product.productUrl}` : undefined;

  return (
    <div>
      {interactive && href ? (
        <Link href={href} className="block">
          {card}
        </Link>
      ) : (
        card
      )}
    </div>
  );
}
