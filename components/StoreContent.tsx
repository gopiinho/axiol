"use client";

import { Globe, Heart, Instagram, Youtube } from "lucide-react";
import { StoreCollectionCard } from "@/components/StoreCollectionCard";

type SocialLink = {
  url: string;
  icon: "instagram" | "youtube" | "globe";
  label: string;
  display: string;
};

type Collection = {
  _id: string;
  title: string;
  description?: string | null;
};

export type StoreContentProps = {
  displayName: string;
  bio?: string;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  socialLinks?: SocialLink[];
  collections: Collection[];
  themeStyle: React.CSSProperties;
  showDots?: boolean;
  interactive?: boolean;
  className?: string;
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
  collections,
  themeStyle,
  className,
  showDots,
  interactive = true,
}: StoreContentProps) {
  return (
    <div
      className={`home-font-primary relative overflow-hidden ${className ?? ""}`}
      style={{
        ...themeStyle,
        backgroundColor: "var(--store-bg)",
        color: "var(--store-text)",
      }}
    >
      {showDots && (
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
      )}
      <div
        className="pointer-events-none absolute -top-32 right-0 h-100 w-100"
        style={{
          background:
            "radial-gradient(circle, var(--store-accent, oklch(0.92 0.08 340)) 0%, transparent 60%)",
          opacity: 0.15,
        }}
      />

      <div className="relative w-full">
        {coverImageUrl ? (
          <div className="w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt=""
              className="h-32 w-full object-cover"
            />
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

        <div className="px-5 -mt-14">
          <div
            className="h-24 w-24 overflow-hidden rounded-full border-4"
            style={{
              borderColor: "var(--store-bg, white)",
              boxShadow: "0 4px 20px -4px oklch(0 0 0 / 0.15)",
            }}
          >
            {profileImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profileImageUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  backgroundColor:
                    "var(--store-accent, oklch(0.52 0.2 254))",
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
              className="font-accent text-2xl font-bold leading-tight"
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
                      className="inline-flex items-center gap-2 text-xs transition hover:opacity-70 w-fit"
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
                className="text-sm max-w-md leading-relaxed"
                style={{ color: "var(--store-text-muted)" }}
              >
                {bio}
              </p>
            )}
          </div>
        </div>

        <div className="relative p-5 backdrop-blur-sm">
          <h2
            className="font-accent text-lg font-bold mb-6"
            style={{ color: "var(--store-text)" }}
          >
            My store
          </h2>

          {collections.length === 0 ? (
            <div className="text-center py-16">
              <Heart
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: "var(--store-accent)" }}
              />
              <p
                style={{ color: "var(--store-text-muted)" }}
                className="text-base"
              >
                building my collection... check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {collections.map((collection, index) => (
                <StoreCollectionCard
                  key={collection._id}
                  collection={collection}
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
