import type { ProductTypeKey, ProductCapabilityKey } from "./productTypes";
import { PRODUCT_TYPES } from "./productTypes";

export type ThumbnailConfig = {
  style: "button" | "callout" | "preview";
  imageId?: string;
  title: string;
  subtitle?: string;
  buttonText: string;
};

export type CheckoutConfig = {
  coverImageId?: string;
  descriptionJson?: string;
  buttonText?: string;
  collectFields: Array<{
    key: string;
    label: string;
    type: "text" | "email" | "phone";
    required: boolean;
    enabled: boolean;
  }>;
};

export type ContentConfig =
  | { mode: "upload"; r2Key?: string; fileName?: string; fileSize?: number; displayName?: string }
  | { mode: "external_link"; url?: string; productName?: string }
  | { mode: "none" };

export type FormConfig = {
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "email" | "phone" | "textarea" | "file" | "url";
    required: boolean;
    order: number;
  }>;
};

export type ProductConfig = {
  thumbnail?: ThumbnailConfig;
  checkout?: CheckoutConfig;
  content?: ContentConfig;
  form?: FormConfig;
};

export const DEFAULT_THUMBNAIL_FIELDS = {
  title: "",
  subtitle: "",
  imageId: undefined,
};

export const DEFAULT_CHECKOUT_FIELDS: CheckoutConfig["collectFields"] = [
  { key: "name", label: "Name", type: "text", required: true, enabled: true },
  { key: "email", label: "Email", type: "email", required: true, enabled: true },
  { key: "phone", label: "Phone number", type: "phone", required: false, enabled: false },
];

export const DEFAULT_FORM_FIELDS: FormConfig["fields"] = [
  { id: "name", label: "Name", type: "text", required: true, order: 1 },
  { id: "email", label: "Email", type: "email", required: true, order: 2 },
];

export function getDefaultConfig(type: ProductTypeKey): ProductConfig {
  const definition = PRODUCT_TYPES[type];
  const config: ProductConfig = {};

  for (const capability of definition.capabilities) {
    switch (capability) {
      case "thumbnail":
        config.thumbnail = {
          style: definition.defaultThumbnailStyle,
          ...DEFAULT_THUMBNAIL_FIELDS,
          buttonText: definition.defaultButtonText,
        };
        break;
      case "checkout":
        config.checkout = {
          buttonText: "Buy Now",
          collectFields: [...DEFAULT_CHECKOUT_FIELDS],
        };
        break;
      case "contentDelivery":
        config.content = { mode: "none" };
        break;
      case "formCollection":
        config.form = {
          fields: [...DEFAULT_FORM_FIELDS],
        };
        break;
    }
  }

  return config;
}

export function getCapabilityDefault(capability: ProductCapabilityKey) {
  switch (capability) {
    case "thumbnail":
      return { style: "button" as const, ...DEFAULT_THUMBNAIL_FIELDS, buttonText: "Get Access" };
    case "checkout":
      return { buttonText: "Buy Now", collectFields: [...DEFAULT_CHECKOUT_FIELDS] };
    case "contentDelivery":
      return { mode: "none" as const };
    case "formCollection":
      return { fields: [...DEFAULT_FORM_FIELDS] };
    default:
      return {};
  }
}
