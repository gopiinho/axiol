const PLATFORM_VALUES = ["amazon", "flipkart", "nykaa", "myntra", "meesho", "other"] as const;

export type ProductItemPlatform = (typeof PLATFORM_VALUES)[number];

export interface ProductItemInput {
  affiliateLink: string;
  price?: string;
  platform?: string;
  title?: string;
  imageUrl?: string;
}

function assertHttpUrl(value: string, fieldLabel: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error(`${fieldLabel} must be a valid http(s) URL.`);
  }
}

export function validateProductItemInput(input: ProductItemInput): {
  affiliateLink: string;
  price?: string;
  platform?: string;
  title?: string;
  imageUrl?: string;
} {
  const affiliateLink = input.affiliateLink.trim();
  if (!affiliateLink) {
    throw new Error("Affiliate link is required.");
  }
  assertHttpUrl(affiliateLink, "Affiliate link");

  if (input.platform && !PLATFORM_VALUES.includes(input.platform as ProductItemPlatform)) {
    throw new Error("Please select a valid platform.");
  }

  const title = input.title?.trim() || undefined;
  if (title && title.length > 140) {
    throw new Error("Product name must be at most 140 characters.");
  }

  const price = input.price?.trim() || undefined;
  if (price && price.length > 32) {
    throw new Error("Price must be at most 32 characters.");
  }

  const imageUrl = input.imageUrl?.trim() || undefined;
  if (imageUrl) {
    assertHttpUrl(imageUrl, "Image URL");
  }

  return {
    affiliateLink,
    price,
    platform: input.platform || undefined,
    title,
    imageUrl,
  };
}
