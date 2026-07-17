"use client";

import type { ThumbnailCardProps } from "./types";
import { ThumbnailImage, CardLink } from "./BaseCard";
import { cardStyleProps, cardPriceStyle } from "./themeStyles";

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
  const price = product.price;
  const buttonText = thumbnail?.buttonText || "Get Access";
  const href = username ? `/${username}/p/${product.productUrl}` : undefined;

  const card = (
    <div
      className="group flex w-full cursor-pointer items-center gap-3 overflow-hidden transition-all duration-300 hover:opacity-90"
      style={cardStyleProps()}
    >
      <ThumbnailImage
        url={previewUrl}
        alt={title}
        className="h-10 w-10 shrink-0"
        style={{ borderRadius: "var(--store-radius)" }}
      />

      <h3
        className="min-w-0 truncate text-base font-semibold"
        style={{ color: "var(--store-text)" }}
      >
        {buttonText}
      </h3>

      <span className="font-semibold" style={cardPriceStyle()}>
        ₹{price}
      </span>
    </div>
  );

  return (
    <CardLink href={href} interactive={interactive}>
      {card}
    </CardLink>
  );
}
