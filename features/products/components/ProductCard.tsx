"use client";

import { THUMBNAIL_CARDS, resolveThumbnailStyle } from "./cards";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    productUrl: string;
    type?: string;
    price?: string | null;
    coverImageUrl?: string | null;
    thumbnailImageUrl?: string | null;
    config?: Record<string, unknown>;
    itemCount?: number;
  };
  username?: string;
  index?: number;
  interactive?: boolean;
}

export function ProductCard(props: ProductCardProps) {
  const style = resolveThumbnailStyle({
    type: props.product.type,
    config: props.product.config,
  });
  const Card = THUMBNAIL_CARDS[style];
  return <Card {...props} />;
}
