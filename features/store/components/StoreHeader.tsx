"use client";

import { Globe, Instagram, Youtube } from "lucide-react";
import type { SocialLink } from "@/features/store/types";
import type { HeaderLayoutValue } from "@/lib/themes";

type StoreHeaderProps = {
  displayName: string;
  profileImageUrl?: string | null;
  bio?: string;
  socialLinks?: SocialLink[];
  headerLayout?: HeaderLayoutValue;
};

const iconMap = {
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
} as const;

export function StoreHeader({
  displayName,
  profileImageUrl,
  bio,
  socialLinks,
  headerLayout = "centered",
}: StoreHeaderProps) {
  const avatar = (
    <div
      className="h-24 w-24 shrink-0 overflow-hidden border-4"
      style={{
        borderColor: "var(--store-bg, white)",
        boxShadow: "0 4px 20px -4px oklch(0 0 0 / 0.15)",
        borderRadius: "var(--store-radius)",
      }}
    >
      {profileImageUrl ? (
        <img src={profileImageUrl} alt={displayName} className="h-full w-full object-cover" />
      ) : (
        <div
          className="z-10 flex h-full w-full items-center justify-center"
          style={{ backgroundColor: "var(--store-accent, oklch(0.52 0.2 254))" }}
        >
          <span className="text-3xl font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );

  const nameBlock = (
    <>
      <h1
        className="font-accent leading-tight font-bold"
        style={{ color: "var(--store-accent)", fontSize: "var(--store-heading-size, 1.25rem)" }}
      >
        {displayName}
      </h1>
      {bio && (
        <p
          className="max-w-md leading-relaxed"
          style={{ color: "var(--store-text-muted)", fontSize: "var(--store-body-size, 0.875rem)" }}
        >
          {bio}
        </p>
      )}
    </>
  );

  const socialsBlock = socialLinks && socialLinks.length > 0 && (
    <div className="flex gap-4 pt-1">
      {socialLinks.map((link) => {
        const Icon = iconMap[link.icon];
        return (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 [color:var(--store-text-muted)] transition-colors hover:[color:var(--store-accent)]"
            style={{ fontSize: "var(--store-body-size, 0.75rem)" }}
          >
            <Icon className="h-6 w-6 shrink-0" />
          </a>
        );
      })}
    </div>
  );

  return (
    <div
      className="relative flex w-full items-center justify-center"
      style={{ padding: "var(--store-header-padding, 2rem) 1rem" }}
    >
      {headerLayout === "left" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "1rem",
            maxWidth: "28rem",
            width: "100%",
          }}
        >
          {avatar}
          <div className="flex flex-col items-start">
            {nameBlock}
            {socialsBlock}
          </div>
        </div>
      ) : headerLayout === "card" ? (
        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--store-border)",
            backgroundColor: "var(--store-surface)",
            boxShadow: "var(--store-card-shadow)",
            maxWidth: "28rem",
            width: "100%",
          }}
        >
          <div className="-mt-12 flex justify-center">{avatar}</div>
          <div className="mt-3 flex flex-col items-center text-center">
            {nameBlock}
            {socialsBlock}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center" style={{ maxWidth: "28rem", width: "100%" }}>
          {avatar}
          <div className="mt-4 flex max-w-md flex-col items-center text-center">
            {nameBlock}
            {socialsBlock}
          </div>
        </div>
      )}
    </div>
  );
}
