import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { icons } from "@/lib/icons";
import heartPixel from "@/public/icons/heart.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AffiliateItemLink from "@/features/analytics/components/AffiliateItemLink";
import { getServerConvexClient } from "@/server/convex/client";
import { getProductTypeLabel } from "@/features/products/components/ProductTypeIcon";
import { CheckoutForm } from "@/features/products/components/CheckoutForm";
import { RichTextRenderer } from "@/features/products/components/rich-text";

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

  const { product, items } = data;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link href={`/${username}`} className="mb-6 inline-block">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {username}
          </Button>
        </Link>

        {product.coverImageUrl && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.coverImageUrl}
              alt={product.name}
              className="max-h-80 w-full object-cover"
            />
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
              <RichTextRenderer
                html={product.description}
                className="text-muted-foreground text-base leading-relaxed"
              />
            </div>
          )}
        </div>

        {product.type === "affiliate" ? (
          <>
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
                          <div className="bg-secondary/10 aspect-[4/3] overflow-hidden">
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

            <div className="border-border/60 mt-12 border-t pt-6">
              <p className="text-muted-foreground text-center text-[0.65rem] leading-relaxed">
                If you purchase from any of these links, I may receive a small commission. Thank you
                for the support{" "}
                <Image
                  src={heartPixel.src}
                  alt="heart"
                  width={5}
                  height={5}
                  className="inline-block h-2 w-2"
                />
              </p>
            </div>
          </>
        ) : product.type === "digital" ? (
          <div className="max-w-lg">
            <CheckoutForm product={product} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
