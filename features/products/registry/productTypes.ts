export type ProductTypeKey =
  | "affiliate"
  | "digital"
  | "coaching"
  | "collect_emails"
  | "applications"
  | "course";

export type ProductStepKey =
  | "thumbnail"
  | "checkout"
  | "content"
  | "availability"
  | "form"
  | "options";

export type ProductCapabilityKey =
  | "thumbnail"
  | "checkout"
  | "payment"
  | "contentDelivery"
  | "availability"
  | "formCollection"
  | "emailAutomation";

export type ProductTypeDefinition = {
  key: ProductTypeKey;
  label: string;
  description: string;
  capabilities: ProductCapabilityKey[];
  steps: ProductStepKey[];
  requiresPrice: boolean;
  defaultThumbnailStyle: "button" | "callout" | "preview";
  defaultButtonText: string;
};

export const PRODUCT_TYPES: Record<ProductTypeKey, ProductTypeDefinition> = {
  affiliate: {
    key: "affiliate",
    label: "Affiliate",
    description: "Refer products and earn commissions",
    capabilities: ["thumbnail", "checkout"],
    steps: ["thumbnail", "checkout", "options"],
    requiresPrice: false,
    defaultThumbnailStyle: "button",
    defaultButtonText: "View Deal",
  },
  digital: {
    key: "digital",
    label: "Digital Product",
    description: "Sell PDFs, templates, downloads, and external resources.",
    capabilities: ["thumbnail", "checkout", "payment", "contentDelivery", "emailAutomation"],
    steps: ["thumbnail", "checkout", "content"],
    requiresPrice: true,
    defaultThumbnailStyle: "preview",
    defaultButtonText: "Download Now",
  },
  coaching: {
    key: "coaching",
    label: "Coaching Call",
    description: "Sell bookable calls with availability and meeting settings.",
    capabilities: ["thumbnail", "checkout", "payment", "availability", "emailAutomation"],
    steps: ["thumbnail", "checkout", "availability", "options"],
    requiresPrice: true,
    defaultThumbnailStyle: "callout",
    defaultButtonText: "Book a Call",
  },
  collect_emails: {
    key: "collect_emails",
    label: "Collect Emails",
    description: "Collect names and emails without checkout.",
    capabilities: ["thumbnail", "formCollection", "contentDelivery"],
    steps: ["thumbnail", "form", "content"],
    requiresPrice: false,
    defaultThumbnailStyle: "button",
    defaultButtonText: "Get Access",
  },
  applications: {
    key: "applications",
    label: "Applications",
    description: "Collect applications with custom form fields.",
    capabilities: ["thumbnail", "formCollection"],
    steps: ["thumbnail", "form", "options"],
    requiresPrice: false,
    defaultThumbnailStyle: "button",
    defaultButtonText: "Apply Now",
  },
  course: {
    key: "course",
    label: "Course",
    description: "Teach with video lessons and materials.",
    capabilities: ["thumbnail", "checkout", "payment", "contentDelivery", "emailAutomation"],
    steps: ["thumbnail", "checkout", "content", "options"],
    requiresPrice: true,
    defaultThumbnailStyle: "preview",
    defaultButtonText: "Enroll Now",
  },
};

export function getProductTypeDefinition(type: ProductTypeKey): ProductTypeDefinition {
  const def = PRODUCT_TYPES[type];
  if (!def) {
    throw new Error(`Unknown product type: "${type}".`);
  }
  return def;
}

export function hasCapability(
  definition: ProductTypeDefinition,
  capability: ProductCapabilityKey,
): boolean {
  return definition.capabilities.includes(capability);
}
