"use client";

import { use, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import posthog from "posthog-js";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { icons } from "@/lib/icons";
import heartPixel from "@/public/icons/heart.png";

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

function ItemCardSkeleton() {
  return (
    <div className="group relative animate-pulse">
      <div className="relative overflow-hidden border-2 border-pink-200">
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-16 h-8"></div>
        </div>

        <div className="w-full h-72 bg-pink-200/50"></div>

        <div className="p-4 grid gap-5 bg-pink-50">
          <div className="mb-3 space-y-2">
            <div className="h-5 bg-pink-200/50 rounded w-3/4"></div>
            <div className="h-5 bg-pink-200/50 rounded w-1/2"></div>
            <div className="h-4 bg-pink-200/30 rounded w-20 mt-1"></div>
          </div>

          <div className="flex items-center justify-center py-2 bg-pink-100 rounded-full">
            <div className="h-3 bg-pink-200/50 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListPage({
  params,
}: {
  params: Promise<{ listId: Id<"sections"> }>;
}) {
  const { listId } = use(params);

  const section = useQuery(api.sections.getById, { id: listId });
  const items = useQuery(api.items.listBySection, { sectionId: listId });

  const hasTrackedView = useRef(false);
  const isLoading = section === undefined || items === undefined;

  useEffect(() => {
    if (section && !hasTrackedView.current) {
      posthog.capture("collection_viewed", {
        collection_id: listId,
        collection_title: section.title,
      });
      hasTrackedView.current = true;
    }
  }, [section, listId]);

  const handleAffiliateLinkClick = (item: {
    _id: string;
    itemTitle?: string;
    platform: string;
    price?: string;
    affiliateLink: string;
  }) => {
    posthog.capture("affiliate_link_clicked", {
      item_id: item._id,
      item_title: item.itemTitle || undefined,
      platform: item.platform,
      price: item.price || undefined,
      collection_id: listId,
      collection_title: section?.title,
    });
  };

  if (section === null) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">List not found</h2>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center p-4">
      <div className="w-full max-w-4xl">
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to collections
          </Button>
        </Link>

        <div className="text-center mb-12">
          {isLoading ? (
            <div className="space-y-3 flex flex-col items-center animate-pulse">
              <div className="h-12 bg-pink-200/50 rounded w-64 mx-auto"></div>
              <div className="h-5 bg-pink-200/30 rounded w-96 mx-auto"></div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl font-secondary text-primary mb-2">
                {section.title}
              </h1>
              {section.description && (
                <p className="mt-2 text-base">{section.description}</p>
              )}
            </>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 bg-pink-50">
            <div className="grid max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
            <div className="text-primary w-full">
              <div className="text-center flex flex-col items-center justify-center mt-8 text-[0.6rem]">
                <p>
                  If you purchase from any of these links, I may receive a small
                  commission.
                </p>
                <div className="flex gap-1 items-center justify-center">
                  Thank youuu for the support
                  <Image
                    src={heartPixel.src}
                    alt="heart pixel"
                    width={5}
                    height={5}
                    className="w-2 h-2 sm:w-2 sm:h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-pink-50 backdrop-blur-sm border-2 border-pink-100 shadow-xl">
            <p className="text-gray-600 text-sm">
              No items in this collection yet :(
            </p>
          </div>
        ) : (
          <div className="p-6 bg-pink-50">
            <div className="grid max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <a
                  key={item._id}
                  href={item.affiliateLink}
                  target="_blank"
                  rel="nofollow noopener"
                  className="group relative"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  onClick={() => handleAffiliateLinkClick(item)}
                >
                  <div className="relative overflow-hidden border-2 border-pink-200 transition-all duration-300 hover:shadow-2xl hover:border-pink-300">
                    <div className="absolute top-3 right-3 z-10">
                      {platformLogos[item.platform] ? (
                        <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                          <Image
                            src={platformLogos[item.platform]}
                            alt={platformNames[item.platform]}
                            width={40}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <Badge className="bg-white text-gray-700 border border-gray-200 shadow-lg">
                          {platformNames[item.platform] || "Shop"}
                        </Badge>
                      )}
                    </div>

                    {item.imageUrl && (
                      <div className="w-full h-72">
                        <img
                          src={item.imageUrl}
                          alt={item.itemTitle || "Product"}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                      </div>
                    )}

                    <div className="p-4 grid gap-5 bg-pink-50">
                      <div className="mb-3">
                        <h2 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors h-10 overflow-hidden">
                          {item.itemTitle || "View Product"}
                        </h2>
                        {item.price && (
                          <p className="text-sm text-pink-600">₹{item.price}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-center py-2 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                        <span className="text-sm font-semibold text-pink-600">
                          shop now
                        </span>
                        <svg
                          className="w-4 h-4 ml-1 text-pink-600 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-primary w-full">
              <div className="text-center flex flex-col items-center justify-center mt-8 text-[0.6rem]">
                <p>
                  If you purchase from any of these links, I may receive a small
                  commission.
                </p>
                <div className="flex gap-1 items-center justify-center">
                  Thank youuu for the support
                  <Image
                    src={heartPixel.src}
                    alt="heart pixel"
                    width={5}
                    height={5}
                    className="w-2 h-2 sm:w-2 sm:h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
