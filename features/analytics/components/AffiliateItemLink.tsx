"use client";

import type { CSSProperties, ReactNode } from "react";
import posthog from "posthog-js";

interface AffiliateItemLinkProps {
  href: string;
  itemId: string;
  itemTitle?: string;
  platform: string;
  price?: string;
  productId?: string;
  productName?: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function AffiliateItemLink({
  href,
  itemId,
  itemTitle,
  platform,
  price,
  productId,
  productName,
  className,
  style,
  children,
}: AffiliateItemLinkProps) {
  const handleClick = () => {
    posthog.capture("affiliate_link_clicked", {
      item_id: itemId,
      item_title: itemTitle || undefined,
      platform,
      price: price || undefined,
      product_id: productId,
      product_name: productName,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
