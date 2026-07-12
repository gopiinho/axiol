import type { ProductStepKey } from "./productTypes";

export type { ProductStepKey };

export type ProductData = {
  _id: string;
  name: string;
  description?: string | null;
  productUrl: string;
  price?: string | null;
  priceCents?: number | null;
  coverImageUrl?: string | null;
  coverImageId?: string | null;
  thumbnailImageUrl?: string | null;
  username?: string;
  type: string;
  status: string;
  publishedAt?: number | null;
  config?: Record<string, unknown>;
};

export type ProductStepComponentProps = {
  productId: string;
  product: ProductData;
  onRegisterSave?: (saveFn: () => Promise<void>) => void;
  visible: boolean;
};

export type ProductStepComponent = React.ComponentType<ProductStepComponentProps>;

export const STEP_LABELS: Record<ProductStepKey, string> = {
  thumbnail: "Thumbnail",
  checkout: "Checkout",
  content: "Content",
  availability: "Availability",
  form: "Form",
  options: "Options",
};

export const STEP_DESCRIPTIONS: Record<ProductStepKey, string> = {
  thumbnail: "Customize how your product looks on the store page.",
  checkout: "Configure pricing, cover image, and buyer info fields.",
  content: "Upload or link the content you're delivering.",
  availability: "Set your availability and meeting preferences.",
  form: "Configure the fields visitors fill out.",
  options: "Review and adjust final settings before publishing.",
};
