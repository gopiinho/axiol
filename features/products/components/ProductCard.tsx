"use client";

import Link from "next/link";
import { motion } from "motion/react";
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
  const card = (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-white transition-all duration-300 hover:shadow-lg hover:border-border">
      <div className="aspect-[4/3] overflow-hidden bg-secondary/20">
        {product.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.coverImageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-pink/10">
            <Package className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
            {product.name}
          </h3>
          {product.type && (
            <ProductTypeIcon type={product.type} className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {product.price ? (
            <span className="text-xs font-semibold text-primary">
              {product.price}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">No price set</span>
          )}

          <span className="text-[10px] text-muted-foreground">
            {product.itemCount} {product.itemCount === 1 ? "link" : "links"}
          </span>
        </div>
      </div>
    </div>
  );

  const href = username ? `/${username}/p/${product.productUrl}` : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.25, 1, 0.5, 1],
      }}
    >
      {interactive && href ? (
        <Link href={href} className="block">
          {card}
        </Link>
      ) : (
        card
      )}
    </motion.div>
  );
}
