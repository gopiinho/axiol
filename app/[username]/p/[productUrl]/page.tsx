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
        <Link href={`/${username}`} className="inline-block mb-6">
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
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {product.name}
          </h1>

          {product.price && (
            <p className="text-xl font-semibold text-primary mb-3">
              {product.price}
            </p>
          )}

          {product.description && (
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/10 py-20 text-center">
            <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No items in this product yet.
            </p>
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
                  <div className="overflow-hidden rounded-xl border border-border/60 bg-white transition-all duration-300 hover:shadow-lg hover:border-border/80">
                    <div className="absolute top-3 right-3 z-10">
                      {item.platform && platformLogos[item.platform] ? (
                        <div className="rounded-lg border border-border/40 bg-white p-2 shadow-sm">
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
                          className="border border-border/40 bg-white/90 text-xs font-medium shadow-sm backdrop-blur-sm"
                        >
                          {item.platform
                            ? platformNames[item.platform]
                            : "Shop"}
                        </Badge>
                      )}
                    </div>

                    {item.imageUrl && (
                      <div className="aspect-[4/3] overflow-hidden bg-secondary/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title || "Product image"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}

                    <div className="p-4">
                      <h2 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2 transition-colors group-hover:text-primary">
                        {item.title || "View Deal"}
                      </h2>

                      {item.price && (
                        <p className="text-xs font-medium text-muted-foreground mb-3">
                          {item.price}
                        </p>
                      )}

                      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 text-xs font-medium text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                        View Deal
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </AffiliateItemLink>
              ),
            )}
          </div>
        )}

        <div className="mt-12 border-t border-border/60 pt-6">
          <p className="text-center text-[0.65rem] text-muted-foreground leading-relaxed">
            If you purchase from any of these links, I may receive a small
            commission. Thank you for the support{" "}
            <Image
              src={heartPixel.src}
              alt="heart"
              width={5}
              height={5}
              className="inline-block w-2 h-2"
            />
          </p>
        </div>
      </div>
    </main>
  );
}
