import { buildProductSlug } from "@/features/products/lib/slugify";

const PRODUCT_TYPES = ["affiliate"] as const;
const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;

type ProductType = (typeof PRODUCT_TYPES)[number];
type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface ProductInput {
  name: string;
  slug?: string;
  description?: string;
  price?: string;
  type: string;
  status?: string;
  automationEnabled?: boolean;
}

export function validateProductInput(input: ProductInput): {
  name: string;
  slug: string;
  description?: string;
  price?: string;
  type: ProductType;
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

  if (!PRODUCT_TYPES.includes(input.type as ProductType)) {
    throw new Error("Please select a valid product type.");
  }

  const slugSource = input.slug?.trim() || name;
  const slug = buildProductSlug(slugSource);
  if (!slug) {
    throw new Error("Product slug is required.");
  }
  if (slug.length > 80) {
    throw new Error("Product slug must be at most 80 characters.");
  }

  const description = input.description?.trim() || undefined;
  if (description && description.length > 2000) {
    throw new Error("Description must be at most 2000 characters.");
  }

  const price = input.price?.trim() || undefined;
  if (price && price.length > 32) {
    throw new Error("Price must be at most 32 characters.");
  }

  const status = (input.status ?? "draft").trim();
  if (!PRODUCT_STATUSES.includes(status as ProductStatus)) {
    throw new Error("Please select a valid product status.");
  }

  return {
    name,
    slug,
    description,
    price,
    type: input.type as ProductType,
    status: status as ProductStatus,
    automationEnabled: input.automationEnabled ?? false,
  };
}
