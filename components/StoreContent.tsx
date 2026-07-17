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
      className={`home-font-primary flex flex-col ${className ?? ""}`}
      style={{
        ...themeStyle,
        backgroundImage: "none",
        backgroundSize: "auto",
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

      <div>
        <ProductSection
          products={products}
          username={username}
          interactive={interactive}
          compact={compact}
        />
      </div>
    </div>
  );
}
