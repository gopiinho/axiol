export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Axiol",
    url: "https://www.axiol.store",
    logo: "https://www.axiol.store/axiol-logo.svg",
    description:
      "Creator storefront platform — sell digital products, courses, coaching, and bookings from your link-in-bio.",
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Axiol",
    url: "https://www.axiol.store",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.axiol.store/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateProductSchema(args: {
  name: string;
  description?: string;
  image?: string;
  url: string;
  price?: string | null;
  currency?: string | null;
  brand?: string;
}) {
  const cleanPrice =
    args.price?.replace(/[^0-9.]/g, "") || undefined;
  const currency = args.currency || "INR";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: args.name,
    description: args.description?.replace(/<[^>]*>/g, "") || args.name,
    image: args.image || undefined,
    url: args.url,
    ...(args.brand
      ? { brand: { "@type": "Brand", name: args.brand } }
      : {}),
    ...(cleanPrice
      ? {
          offers: {
            "@type": "Offer",
            price: cleanPrice,
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            url: args.url,
          },
        }
      : {}),
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateProfilePageSchema(args: {
  name: string;
  bio?: string;
  image?: string;
  url: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: args.name,
      description: args.bio || undefined,
      image: args.image || undefined,
      url: args.url,
      sameAs: args.sameAs?.length ? args.sameAs : undefined,
    },
  };
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.axiol.store";

export function truncateDescription(text: string, maxLen = 157): string {
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 3).trimEnd() + "...";
}
