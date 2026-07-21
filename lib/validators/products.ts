import { buildProductUrl } from "@/features/products/lib/slugify";
import type { ProductTypeKey } from "@/features/products/registry/productTypes";
import { PRODUCT_TYPES } from "@/features/products/registry/productTypes";

const PRODUCT_TYPE_KEYS = Object.keys(PRODUCT_TYPES) as ProductTypeKey[];
const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;

type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface ProductInput {
  name: string;
  productUrl?: string;
  description?: string;
  price?: string;
  type: string;
  status?: string;
  automationEnabled?: boolean;
}

export function validateProductInput(input: ProductInput): {
  name: string;
  productUrl: string;
  description?: string;
  price?: string;
  type: ProductTypeKey;
  status: ProductStatus;
  automationEnabled: boolean;
} {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Product name is required.");
  }
  if (name.length > 140) {
    throw new Error("Product name must be at most 140 characters.");
  }

  if (!PRODUCT_TYPE_KEYS.includes(input.type as ProductTypeKey)) {
    throw new Error("Please select a valid product type.");
  }

  const urlSource = input.productUrl?.trim() || name;
  const productUrl = buildProductUrl(urlSource);
  if (!productUrl) {
    throw new Error("Product URL is required.");
  }
  if (productUrl.length > 80) {
    throw new Error("Product URL must be at most 80 characters.");
  }

  const description = input.description?.trim() || undefined;
  if (description && description.length > 2000) {
    throw new Error("Description must be at most 2000 characters.");
  }

  const price = input.price?.trim() || undefined;
  if (price && price.length > 32) {
    throw new Error("Price must be at most 32 characters.");
  }
  if (price && !/\d/.test(price)) {
    throw new Error("Price must contain a valid number.");
  }
  if (price) {
    const numeric = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (numeric < 10) {
      throw new Error("Minimum price is ₹10.");
    }
  }

  const status = (input.status ?? "draft").trim();
  if (!PRODUCT_STATUSES.includes(status as ProductStatus)) {
    throw new Error("Please select a valid product status.");
  }

  return {
    name,
    productUrl,
    description,
    price,
    type: input.type as ProductTypeKey,
    status: status as ProductStatus,
    automationEnabled: input.automationEnabled ?? false,
  };
}
