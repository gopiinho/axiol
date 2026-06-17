"use client";

import type { ThumbnailCardProps } from "./types";
import { ThumbnailImage, CardLink } from "./BaseCard";
import { cardStyleProps, cardPriceStyle, cardSubtitleStyle, cardCtaStyle } from "./themeStyles";

export function CalloutCard({
  product,
  username,
  index: _index = 0,
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
    <div
      className="group flex w-full cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:opacity-90"
      style={cardStyleProps()}
    >
      <div className="flex items-start gap-4" style={{ padding: "var(--store-card-padding, 1rem)" }}>
        <ThumbnailImage url={previewUrl} alt={title} className="h-20 w-20 shrink-0" style={{ borderRadius: "var(--store-radius)" }} />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <h3 className="line-clamp-1 font-semibold" style={{ color: "var(--store-text)", fontSize: "var(--store-heading-size, 1.125rem)" }}>{title}</h3>

          {subtitle && <p className="line-clamp-2" style={cardSubtitleStyle()}>{subtitle}</p>}

          {product.price && <p className="font-medium" style={cardPriceStyle()}>₹{product.price}</p>}
        </div>
      </div>

      <div className="flex px-[var(--store-card-padding,1rem)] pb-[var(--store-card-padding,1rem)]">
        <span className="font-semibold transition hover:opacity-90" style={cardCtaStyle()}>
          {buttonText}
        </span>
      </div>
    </div>
  );
  return (
    <CardLink href={href} interactive={interactive}>
      {card}
    </CardLink>
  );
}
