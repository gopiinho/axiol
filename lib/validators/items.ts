const PLATFORM_VALUES = ["amazon", "flipkart", "nykaa", "meesho", "other"] as const;

export type ItemPlatform = (typeof PLATFORM_VALUES)[number];

export interface ItemInput {
  affiliateLink: string;
  price?: string;
  platform: string;
  itemTitle?: string;
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

export function validateItemInput(input: ItemInput): {
  affiliateLink: string;
  price?: string;
  platform: ItemPlatform;
  itemTitle?: string;
  imageUrl?: string;
} {
  const affiliateLink = input.affiliateLink.trim();
  if (!affiliateLink) {
    throw new Error("Affiliate link is required.");
  }
  assertHttpUrl(affiliateLink, "Affiliate link");

  if (!PLATFORM_VALUES.includes(input.platform as ItemPlatform)) {
    throw new Error("Please select a valid platform.");
  }

  const itemTitle = input.itemTitle?.trim() || undefined;
  if (itemTitle && itemTitle.length > 140) {
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
    platform: input.platform as ItemPlatform,
    itemTitle,
    imageUrl,
  };
}
