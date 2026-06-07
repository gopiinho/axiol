"use client";

import { THUMBNAIL_CARDS } from "@/features/products/components/cards";
import type { ThumbnailLiveState } from "@/features/products/components/cards/types";

interface ThumbnailStepPreviewProps extends ThumbnailLiveState {}

export function ThumbnailStepPreview({
  style,
  title,
  subtitle,
  buttonText,
  imageUrl,
  price,
}: ThumbnailStepPreviewProps) {
  const Card = THUMBNAIL_CARDS[style];

  const product = {
    _id: "preview",
    name: title,
    productUrl: "#",
    price: price ?? null,
    thumbnailImageUrl: imageUrl ?? null,
    coverImageUrl: null,
    config: {
      thumbnail: {
        style,
        title,
        subtitle,
        buttonText,
      },
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Preview
        </span>
      </div>
      <div className="border-border/40 bg-card/50 rounded-lg border p-5">
        <Card product={product} interactive={false} />
      </div>
    </div>
  );
}
