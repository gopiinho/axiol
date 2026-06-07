"use client";

import type { ThumbnailCardProps } from "./types";
import { ThumbnailImage, CardLink } from "./BaseCard";

export function CalloutCard({
  product,
  username,
  index = 0,
  interactive = true,
}: ThumbnailCardProps) {
  const thumbnail = product.config?.thumbnail as
    | { title?: string; subtitle?: string; buttonText?: string }
    | undefined;
  const previewUrl = product.thumbnailImageUrl || product.coverImageUrl;
  const title = thumbnail?.title || product.name;
  const subtitle = thumbnail?.subtitle;
  const buttonText = thumbnail?.buttonText || "Get Access";
  const href = username ? `/${username}/p/${product.productUrl}` : undefined;

  const card = (
    <div className="group border-border/60 hover:border-border flex w-full cursor-pointer flex-col overflow-hidden rounded-md border bg-white transition-all duration-300">
      <div className="flex items-start gap-4 p-4">
        <ThumbnailImage
          url={previewUrl}
          alt={title}
          className="h-20 w-20 shrink-0 rounded-md"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <h3 className="text-foreground line-clamp-1 text-sm font-semibold">
            {title}
          </h3>

          {subtitle && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {subtitle}
            </p>
          )}

          {product.price && (
            <p className="text-primary text-xs font-medium">
              {product.price}
            </p>
          )}
        </div>
      </div>

      <div className="border-border/60 bg-secondary/10 border-t px-4 py-2.5 text-center">
        <span className="text-primary text-sm font-semibold">
          {buttonText}
        </span>
      </div>
    </div>
  );

  return <CardLink href={href} interactive={interactive}>{card}</CardLink>;
}
