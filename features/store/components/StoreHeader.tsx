"use client";

import { Globe, Instagram, Youtube } from "lucide-react";
import type { SocialLink } from "@/features/store/types";

type StoreHeaderProps = {
  displayName: string;
  profileImageUrl?: string | null;
  bio?: string;
  socialLinks?: SocialLink[];
};

const iconMap = {
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
} as const;

export function StoreHeader({ displayName, profileImageUrl, bio, socialLinks }: StoreHeaderProps) {
  return (
    <div className="relative flex w-full items-center justify-center py-6">
      <div className="flex flex-col items-center">
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
        <div className="mt-4 flex max-w-md flex-col items-center text-center">
          <h1
            className="font-accent text-xl leading-tight font-bold"
            style={{ color: "var(--store-accent)" }}
          >
            {displayName}
          </h1>
          {bio && (
            <p
              className="max-w-md text-sm leading-relaxed"
              style={{ color: "var(--store-text-muted)" }}
            >
              {bio}
            </p>
          )}
        </div>
        <div className="mt-4 space-y-1">
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex gap-4 pt-1">
              {socialLinks.map((link) => {
                const Icon = iconMap[link.icon];
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 text-xs transition-colors [color:var(--store-text-muted)] hover:[color:var(--store-accent)]"
                  >
                    <Icon className="h-6 w-6 shrink-0" />
                    {/* <span>{link.display}</span> */}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
