import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Globe, Instagram, Package, Youtube } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { icons } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AffiliateItemLink from "@/features/analytics/components/AffiliateItemLink";
import { TrackProductClick } from "@/features/analytics/components/TrackProductClick";
import { getServerConvexClient } from "@/server/convex/client";
import { getProductTypeLabel } from "@/features/products/components/ProductTypeIcon";
import { CheckoutContent } from "@/features/products/components/CheckoutContent";
import {
  buildThemeStyle,
  migrateOldTheme,
  type PaletteConfig,
  type LayoutConfig,
} from "@/lib/themes";
import { resolvePalette } from "@/lib/colorUtils";

const platformLogos: Record<string, StaticImageData> = {
  amazon: icons.amazonLogo,
  flipkart: icons.flipkartLogo,
  nykaa: icons.nykaaLogo,
  meesho: icons.meeshoLogo,
};

const platformNames: Record<string, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  nykaa: "Nykaa",
  meesho: "Meesho",
  other: "Shop",
};

const iconMap = { instagram: Instagram, youtube: Youtube, globe: Globe } as const;

const paidTypes = ["digital", "coaching", "course"];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ username: string; productUrl: string }>;
}) {
  const { username, productUrl } = await params;

  const convex = getServerConvexClient();

  const data = await convex.query(api.products.getPublicProduct, {
    username,
    productUrl,
  });

  if (!data) {
    notFound();
  }

  const { product, items, creator, definition } = data;

  const safeCreator = (creator ?? { name: username }) as typeof creator;
  let palette = safeCreator?.palette as PaletteConfig | undefined;
  let layout = safeCreator?.layout as LayoutConfig | undefined;
  if (!palette && safeCreator?.theme) {
    const migrated = migrateOldTheme(safeCreator.theme);
    if (migrated) {
      palette = migrated.palette;
      layout = migrated.layout;
    }
  }
  if (palette) {
    palette = resolvePalette(palette);
  }
  const themeStyle = palette
    ? buildThemeStyle(palette, layout ?? {})
    : ({
        "--store-bg": "#ffffff",
        "--store-surface": "#f9fafb",
        "--store-border": "oklch(0.82 0.01 0 / 0.35)",
        "--store-accent": "oklch(0.52 0.2 254)",
        "--store-text": "oklch(0.15 0 0)",
        "--store-text-muted": "oklch(0.4 0 0)",
        "--store-radius": "0.5rem",
        "--store-card-shadow": "0 2px 12px oklch(0 0 0 / 0.08)",
        "--store-card-border": "1px solid var(--store-border)",
        "--store-section-gap": "1.5rem",
        "--store-card-gap": "1rem",
        "--store-card-padding": "1rem",
        "--store-heading-size": "1.625rem",
        "--store-body-size": "0.875rem",
        "--store-price-size": "0.9375rem",
      } as React.CSSProperties);

  const displayName = safeCreator?.storeName || safeCreator?.name || username;
  const profileSrc = safeCreator?.profileImageUrl ?? safeCreator?.avatarUrl ?? null;

  const socialLinks = [
    safeCreator?.instagramUrl
      ? {
          url: safeCreator.instagramUrl.startsWith("http")
            ? safeCreator.instagramUrl
            : `https://instagram.com/${safeCreator.instagramUrl}`,
          icon: "instagram" as const,
          label: "Instagram",
        }
      : null,
    safeCreator?.youtubeUrl
      ? {
          url: safeCreator.youtubeUrl.startsWith("http")
            ? safeCreator.youtubeUrl
            : `https://youtube.com/@${safeCreator.youtubeUrl}`,
          icon: "youtube" as const,
          label: "YouTube",
        }
      : null,
    safeCreator?.websiteUrl
      ? {
          url: safeCreator.websiteUrl.startsWith("http")
            ? safeCreator.websiteUrl
            : `https://${safeCreator.websiteUrl}`,
          icon: "globe" as const,
          label: "Website",
        }
      : null,
  ].filter((link): link is NonNullable<typeof link> => link !== null);

  const isPaid = paidTypes.includes(product.type);

  return (
    <main
      className="home-font-primary min-h-screen"
      style={{
        backgroundColor: "var(--store-bg, white)",
        color: "var(--store-text, oklch(0.15 0 0))",
        ...themeStyle,
      }}
    >
      <TrackProductClick productId={product._id} sellerId={product.createdBy} />
      <div className="mx-auto h-full w-full">
        <div className="mx-auto h-full w-full lg:max-w-[80%]">
          <div
            className="relative flex items-center gap-3 px-3 py-4"
            style={{
              borderBottom: `1px solid var(--store-border)`,
            }}
          >
            <Link href={`/${username}`} className="shrink-0">
              <div
                className="h-8 w-8 overflow-hidden"
                style={{ borderRadius: "var(--store-radius, 0.5rem)" }}
              >
                {profileSrc ? (
                  <img src={profileSrc} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-bold text-white"
                    style={{
                      backgroundColor: "var(--store-accent)",
                      fontSize: "var(--store-body-size, 0.875rem)",
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>

            <Link
              href={`/${username}`}
              className="min-w-0 transition-colors hover:opacity-70"
              style={{
                color: "var(--store-text)",
                fontSize: "var(--store-heading-size, 1.5rem)",
              }}
            >
              <p className="truncate font-semibold">{displayName}</p>
            </Link>

            {socialLinks.length > 0 && (
              <div className="ml-auto flex items-center gap-3">
                {socialLinks.map((link) => {
                  const Icon = iconMap[link.icon];
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 transition-colors hover:opacity-70"
                      style={{ color: "var(--store-text-muted)" }}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {product.type === "affiliate" ? (
            <div className="py-6 pb-16">
              <Link href={`/${username}`} className="mb-6 inline-block">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to {username}
                </Button>
              </Link>

              {product.coverImageUrl && (
                <div className="mb-8 overflow-hidden rounded-2xl">
                  <div className="aspect-2/1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.coverImageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="mb-10">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {getProductTypeLabel(product.type)}
                  </Badge>
                </div>

                <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {product.name}
                </h1>

                {product.price && (
                  <p className="text-primary mb-3 text-xl font-semibold">{product.price}</p>
                )}

                {product.description && (
                  <div className="max-w-2xl">
                    <div
                      className="prose prose-sm product-description max-w-none"
                      style={{ color: "var(--store-text)" }}
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="border-border bg-secondary/10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
                  <Package className="text-muted-foreground/40 mb-3 h-10 w-10" />
                  <p className="text-muted-foreground text-sm">No items in this product yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(
                    (item: {
                      _id: string;
                      affiliateLink: string;
                      title?: string | null;
                      platform?: string | null;
                      price?: string | null;
                      imageUrl?: string | null;
                    }) => (
                      <AffiliateItemLink
                        key={item._id}
                        href={item.affiliateLink}
                        itemId={item._id}
                        itemTitle={item.title ?? undefined}
                        platform={item.platform ?? ""}
                        price={item.price ?? undefined}
                        productId={product._id}
                        productName={product.name}
                        className="group relative"
                      >
                        <div className="border-border/60 hover:border-border/80 overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:shadow-lg">
                          <div className="absolute top-3 right-3 z-10">
                            {item.platform && platformLogos[item.platform] ? (
                              <div className="border-border/40 rounded-lg border bg-white p-2 shadow-sm">
                                <Image
                                  src={platformLogos[item.platform]}
                                  alt={platformNames[item.platform]}
                                  width={36}
                                  height={22}
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="border-border/40 border bg-white/90 text-xs font-medium shadow-sm backdrop-blur-sm"
                              >
                                {item.platform ? platformNames[item.platform] : "Shop"}
                              </Badge>
                            )}
                          </div>

                          {item.imageUrl && (
                            <div className="bg-secondary/10 aspect-4/3 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl}
                                alt={item.title || "Product image"}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                              />
                            </div>
                          )}

                          <div className="p-4">
                            <h2 className="text-foreground group-hover:text-primary mb-2 line-clamp-2 text-sm leading-snug font-semibold transition-colors">
                              {item.title || "View Deal"}
                            </h2>

                            {item.price && (
                              <p className="text-muted-foreground mb-3 text-xs font-medium">
                                {item.price}
                              </p>
                            )}

                            <div className="border-border/60 bg-secondary/20 text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition">
                              View Deal
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </AffiliateItemLink>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            <CheckoutContent
              username={username}
              product={product}
              definition={
                definition
                  ? {
                      key: definition.key,
                      defaultButtonText: definition.defaultButtonText,
                      requiresPrice: definition.requiresPrice,
                    }
                  : null
              }
              hasStickyBar={isPaid}
            />
          )}
        </div>
      </div>
    </main>
  );
}
