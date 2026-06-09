"use client";

import { StoreHeader, ProductSection } from "@/features/store/components";
import type { SocialLink, ProductItem } from "@/features/store/types";

export type StoreContentProps = {
  displayName: string;
  bio?: string;
  profileImageUrl?: string | null;
  socialLinks?: SocialLink[];
  products: ProductItem[];
  themeStyle: React.CSSProperties;
  interactive?: boolean;
  className?: string;
  username?: string;
  compact?: boolean;
};

export function StoreContent({
  displayName,
  bio,
  profileImageUrl,
  socialLinks,
  products,
  themeStyle,
  className,
  interactive = true,
  username,
  compact,
}: StoreContentProps) {
  return (
    <div
      className={`home-font-primary flex h-full flex-col overflow-hidden ${className ?? ""}`}
      style={{
        ...themeStyle,
        backgroundColor: "var(--store-bg)",
        color: "var(--store-text)",
      }}
    >
      <StoreHeader
        displayName={displayName}
        profileImageUrl={profileImageUrl}
        bio={bio}
        socialLinks={socialLinks}
      />

      <div className="h-full">
        <ProductSection products={products} username={username} interactive={interactive} compact={compact} />
      </div>
    </div>
  );
}
