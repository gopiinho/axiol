"use client";

import { StoreHeader, ProductSection } from "@/features/store/components";
import type { SocialLink, ProductItem } from "@/features/store/types";
import type { HeaderLayoutValue } from "@/lib/themes";

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
  headerLayout?: HeaderLayoutValue;
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
  headerLayout,
}: StoreContentProps) {
  return (
    <div
      className={`home-font-primary flex ${compact ? "" : "h-full"} flex-col ${compact ? "" : "overflow-hidden"} ${className ?? ""}`}
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
        headerLayout={headerLayout}
      />

      <div className={compact ? "" : "h-full"}>
        <ProductSection products={products} username={username} interactive={interactive} compact={compact} />
      </div>
    </div>
  );
}
