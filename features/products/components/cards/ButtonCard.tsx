"use client";

import type { ThumbnailCardProps } from "./types";
import { ThumbnailImage, CardLink } from "./BaseCard";

export function ButtonCard({
  product,
  username,
  index: _index = 0,
  interactive = true,
}: ThumbnailCardProps) {
  const thumbnail = product.config?.thumbnail as
    | { title?: string; buttonText?: string }
    | undefined;
  const previewUrl = product.thumbnailImageUrl || product.coverImageUrl;
  const title = thumbnail?.title || product.name;
  const buttonText = thumbnail?.buttonText || "Get Access";
  const href = username ? `/${username}/p/${product.productUrl}` : undefined;

  const card = (
    <div className="group border-border/60 hover:border-border flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-md border bg-white px-4 py-3 transition-all duration-300">
      <ThumbnailImage
        url={previewUrl}
        alt={title}
        className="h-10 w-10 shrink-0 rounded"
      />

      <h3 className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold">
        {title}
      </h3>

      <span className="bg-primary/10 text-primary shrink-0 rounded-md px-3 py-1.5 text-xs font-medium">
        {buttonText}
      </span>
    </div>
  );

  return <CardLink href={href} interactive={interactive}>{card}</CardLink>;
}
