"use client";

import { ArrowLeft, User, Mail, Phone, Globe, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import { RichTextRenderer } from "@/features/products/components/rich-text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  buildThemeStyle,
  migrateOldTheme,
  type PaletteConfig,
  type LayoutConfig,
} from "@/lib/themes";
import { resolvePalette } from "@/lib/colorUtils";
import { useUser } from "@/features/auth/client/UserContext";
import heartPixel from "@/public/icons/heart.png";
import type { CheckoutLiveState } from "@/features/products/components/cards/types";

const DEFAULT_PALETTE: PaletteConfig = resolvePalette({
  bg: "oklch(0.97 0.015 340)",
  accent: "oklch(0.65 0.2 340)",
});

const DEFAULT_LAYOUT: LayoutConfig = {
  preset: "playful",
  borderRadius: "pill",
  cardStyle: "layered",
  spacing: "loose",
  headerLayout: "centered",
  typeScale: "large",
  backgroundPattern: "dots",
};

const iconMap = { instagram: Instagram, youtube: Youtube, globe: Globe } as const;

const paidTypes = ["digital", "coaching", "course"];
const simplifiedTypes = ["collect_emails", "applications"];

type CheckoutStepPreviewProps = CheckoutLiveState;

export function CheckoutStepPreview({
  name,
  description,
  price,
  coverImageUrl,
  phoneEnabled,
  type,
  checkoutButtonText,
}: CheckoutStepPreviewProps) {
  const { user } = useUser();

  const palette: PaletteConfig = (() => {
    const stored = user?.palette as PaletteConfig | undefined;
    if (stored?.bg && stored?.accent) return resolvePalette(stored);
    if (user?.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated) return migrated.palette;
    }
    return DEFAULT_PALETTE;
  })();

  const layout: LayoutConfig = (() => {
    const stored = user?.layout as LayoutConfig | undefined;
    if (stored) return stored;
    if (user?.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated) return migrated.layout;
    }
    return DEFAULT_LAYOUT;
  })();

  const theme = buildThemeStyle(palette, layout);
  delete (theme as Record<string, unknown>).backgroundImage;
  delete (theme as Record<string, unknown>).backgroundSize;

  const displayPrice =
    price && /^[₹$€£]/.test(price)
      ? price
      : price
        ? `₹ ${price}`
        : "Free";

  const isPaid = paidTypes.includes(type);
  const isSimplified = simplifiedTypes.includes(type);

  const displayName = user?.storeName || user?.name || user?.username || "";
  const profileSrc = user?.profileImageUrl ?? user?.avatarUrl ?? null;

  const socialLinks = [
    user?.instagramUrl
      ? { url: user.instagramUrl, icon: "instagram" as const, label: "Instagram" }
      : null,
    user?.youtubeUrl
      ? { url: user.youtubeUrl, icon: "youtube" as const, label: "YouTube" }
      : null,
    user?.websiteUrl
      ? { url: user.websiteUrl, icon: "globe" as const, label: "Website" }
      : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <div className="flex h-[min(85vh,700px)] w-full flex-col items-center">
      <div className="relative flex h-full w-[min(45vh,340px)] flex-col">
        <div className="relative flex h-full flex-col rounded-[3rem] border-[6px] border-gray-900 bg-gray-900 shadow-lg">
          <div className="absolute top-2 left-1/2 z-20 h-5.5 w-22.5 -translate-x-1/2 rounded-full bg-black" />

          <div
            className="flex h-full flex-col overflow-hidden rounded-[2.5rem]"
            style={{ backgroundColor: "var(--store-bg, white)", ...theme }}
          >
            <div
              className="flex shrink-0 items-center justify-between px-5 pt-3 pb-1.5 text-[8px] font-semibold"
              style={{ color: "var(--store-text, #111)" }}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 9l2 2c5.52-5.52 14.45-5.52 19.97 0l2-2C18.27 2.27 5.74 2.27 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.34C7 21.4 7.6 22 8.33 22h7.34c.74 0 1.33-.6 1.33-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </svg>
              </div>
            </div>

            <div
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                paddingBottom: isPaid ? "3rem" : "0",
              }}
            >
              <div
                className="relative flex items-center gap-2 px-4 py-1.5"
                style={{ borderBottom: "1px solid var(--store-border)" }}
              >
                <div
                  className="h-6 w-6 shrink-0 overflow-hidden"
                  style={{ borderRadius: "var(--store-radius, 0.5rem)" }}
                >
                  {profileSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={profileSrc} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: "var(--store-accent)" }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p
                  className="min-w-0 flex-1 truncate text-xs font-semibold"
                  style={{ color: "var(--store-text)" }}
                >
                  {displayName}
                </p>
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    {socialLinks.map((link) => {
                      const Icon = iconMap[link.icon];
                      return (
                        <span key={link.label} style={{ color: "var(--store-text-muted)" }}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className="inline-flex items-center gap-1.5 px-4 pt-2 pb-0.5"
                style={{ color: "var(--store-text-muted)", fontSize: "var(--store-body-size, 0.8125rem)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </div>

              {coverImageUrl && (
                <div
                  className="mx-4 overflow-hidden"
                  style={{
                    borderRadius: "var(--store-radius, 0.5rem)",
                    marginBottom: "var(--store-section-gap, 1.5rem)",
                  }}
                >
                  <div className="aspect-[2/1]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImageUrl} alt={name || "Cover"} className="h-full w-full object-cover" />
                  </div>
                </div>
              )}

              <div className="px-4">
                <h1
                  className="mb-1 leading-tight font-bold tracking-tight"
                  style={{ color: "var(--store-text)", fontSize: "var(--store-heading-size, 1.375rem)" }}
                >
                  {name || "Product Name"}
                </h1>

                <p
                  className="mb-4 font-semibold"
                  style={{ color: "var(--store-accent)", fontSize: "var(--store-price-size, 0.9375rem)" }}
                >
                  {displayPrice}
                </p>

                {description && (
                  <div style={{ marginBottom: "var(--store-section-gap, 1.5rem)", fontSize: "var(--store-body-size, 0.875rem)" }}>
                    <RichTextRenderer html={description} style={{ color: "var(--store-text)" }} />
                  </div>
                )}

                <div className="border-t" style={{ borderColor: "var(--store-border)" }}>
                  <h2
                    className="font-semibold tracking-wide uppercase"
                    style={{
                      color: "var(--store-text)",
                      fontSize: "var(--store-body-size, 0.8125rem)",
                      marginTop: "var(--store-section-gap, 1.5rem)",
                      marginBottom: "var(--store-card-gap, 1rem)",
                    }}
                  >
                    Contact Information
                  </h2>

                  <div className="space-y-3">
                    <div className="relative">
                      <User className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--store-text-muted)" }} />
                      <Input
                        placeholder="Your name"
                        disabled
                        className="h-9 pl-9 text-sm opacity-60"
                        style={{
                          borderColor: "var(--store-border)",
                          backgroundColor: "var(--store-surface)",
                          color: "var(--store-text)",
                          borderRadius: "var(--store-radius, 0.5rem)",
                          fontSize: "var(--store-body-size, 0.875rem)",
                        }}
                      />
                    </div>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--store-text-muted)" }} />
                      <Input
                        placeholder="you@example.com"
                        disabled
                        className="h-9 pl-9 text-sm opacity-60"
                        style={{
                          borderColor: "var(--store-border)",
                          backgroundColor: "var(--store-surface)",
                          color: "var(--store-text)",
                          borderRadius: "var(--store-radius, 0.5rem)",
                          fontSize: "var(--store-body-size, 0.875rem)",
                        }}
                      />
                    </div>
                    {phoneEnabled && (
                      <div className="relative">
                        <Phone className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--store-text-muted)" }} />
                        <Input
                          placeholder="Phone number"
                          disabled
                          className="h-9 pl-9 text-sm opacity-60"
                          style={{
                            borderColor: "var(--store-border)",
                            backgroundColor: "var(--store-surface)",
                            color: "var(--store-text)",
                            borderRadius: "var(--store-radius, 0.5rem)",
                            fontSize: "var(--store-body-size, 0.875rem)",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {isSimplified && (
                    <Button
                      disabled
                      className="mt-5 w-full font-semibold"
                      size="lg"
                      style={{
                        backgroundColor: "var(--store-accent)",
                        borderColor: "var(--store-accent)",
                        color: "white",
                        borderRadius: "var(--store-radius, 0.5rem)",
                        fontSize: "var(--store-body-size, 0.875rem)",
                      }}
                    >
                      {checkoutButtonText}
                    </Button>
                  )}

                  {isSimplified && (
                    <div className="border-border/60 mt-8 border-t pt-4">
                      <p
                        className="text-center leading-relaxed"
                        style={{ color: "var(--store-text-muted)", fontSize: "var(--store-body-size, 0.8125rem)" }}
                      >
                        Powered by Axiol{" "}
                        <Image src={heartPixel.src} alt="heart" width={5} height={5} className="inline-block h-2 w-2" />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isPaid && (
              <div
                className="shrink-0 border-t"
                style={{ backgroundColor: "var(--store-surface, white)", borderColor: "var(--store-border)" }}
              >
                <div className="flex items-center gap-3 px-3 py-2" style={{ padding: "var(--store-card-padding, 1rem)" }}>
                  <div className="flex flex-col">
                    <span style={{ color: "var(--store-text-muted)", fontSize: "var(--store-body-size, 0.8125rem)" }}>
                      Total
                    </span>
                    <span className="font-bold" style={{ color: "var(--store-accent)", fontSize: "var(--store-price-size, 0.9375rem)" }}>
                      {displayPrice}
                    </span>
                  </div>
                  <Button
                    disabled
                    className="flex-1 font-semibold"
                    size="lg"
                    style={{
                      backgroundColor: "var(--store-accent)",
                      borderColor: "var(--store-accent)",
                      color: "white",
                      borderRadius: "var(--store-radius, 0.5rem)",
                      fontSize: "var(--store-body-size, 0.875rem)",
                    }}
                    >
                      {checkoutButtonText}
                    </Button>
                  </div>
                </div>
              )}
            </div>

          <div className="relative flex justify-center py-1.5">
            <div className="absolute bottom-4 h-1 w-24 rounded-full bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
