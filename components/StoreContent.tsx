"use client";

import { Globe, Package, Instagram, Youtube } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";

type SocialLink = {
  url: string;
  icon: "instagram" | "youtube" | "globe";
  label: string;
  display: string;
};

type ProductItem = {
  _id: string;
  name: string;
  productUrl: string;
  price?: string | null;
  coverImageUrl?: string | null;
  itemCount: number;
};

export type StoreContentProps = {
  displayName: string;
  bio?: string;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  socialLinks?: SocialLink[];
  products: ProductItem[];
  themeStyle: React.CSSProperties;
  showDots?: boolean;
  interactive?: boolean;
  className?: string;
  username?: string;
};

const iconMap = {
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
} as const;

export function StoreContent({
  displayName,
  bio,
  profileImageUrl,
  coverImageUrl,
  socialLinks,
  products,
  themeStyle,
  className,
  showDots,
  interactive = true,
  username,
}: StoreContentProps) {
  return (
    <div
      className={`home-font-primary relative flex flex-col overflow-hidden ${className ?? ""}`}
      style={{
        ...themeStyle,
        backgroundColor: "var(--store-bg)",
        color: "var(--store-text)",
      }}
    >
      {showDots && <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />}
      <div
        className="pointer-events-none absolute -top-32 right-0 h-100 w-100"
        style={{
          background:
            "radial-gradient(circle, var(--store-accent, oklch(0.92 0.08 340)) 0%, transparent 60%)",
          opacity: 0.15,
        }}
      />

      <div
        className="relative w-full flex-1"
        style={{
          backgroundColor: "color-mix(in oklch, var(--store-accent) 6%, var(--store-bg))",
        }}
      >
        {coverImageUrl ? (
          <div className="w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="" className="h-32 w-full object-cover" />
          </div>
        ) : (
          <div
            className="h-32 w-full"
            style={{
              backgroundColor: "var(--store-accent, oklch(0.52 0.2 254))",
              opacity: 0.35,
            }}
          />
        )}

        <div className="relative z-10 -mt-14 px-5">
          <div
            className="h-24 w-24 overflow-hidden rounded-full border-4"
            style={{
              borderColor: "var(--store-bg, white)",
              boxShadow: "0 4px 20px -4px oklch(0 0 0 / 0.15)",
            }}
          >
            {profileImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profileImageUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div
                className="z-10 flex h-full w-full items-center justify-center"
                style={{
                  backgroundColor: "var(--store-accent, oklch(0.52 0.2 254))",
                }}
              >
                <span className="text-3xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-1">
            <h1
              className="font-accent text-xl leading-tight font-bold"
              style={{ color: "var(--store-accent)" }}
            >
              {displayName}
            </h1>

            {socialLinks && socialLinks.length > 0 && (
              <div className="grid gap-1.5 pt-1">
                {socialLinks.map((link) => {
                  const Icon = iconMap[link.icon];
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-2 text-xs transition hover:opacity-70"
                      style={{ color: "var(--store-text-muted)" }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{link.display}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {bio && (
              <p
                className="max-w-md text-sm leading-relaxed"
                style={{ color: "var(--store-text-muted)" }}
              >
                {bio}
              </p>
            )}
          </div>
        </div>

        <div className="relative p-5 backdrop-blur-sm">
          <h2 className="font-accent mb-6 text-lg font-bold" style={{ color: "var(--store-text)" }}>
            My store
          </h2>

          {products.length === 0 ? (
            <div className="py-16 text-center">
              <Package
                className="mx-auto mb-3 h-12 w-12"
                style={{ color: "var(--store-accent)" }}
              />
              <p style={{ color: "var(--store-text-muted)" }} className="text-base">
                building my store... check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  username={username}
                  index={index}
                  interactive={interactive}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
