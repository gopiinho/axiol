import type { ProductCapabilityKey } from "./productTypes";

export const CAPABILITY_LABELS: Record<ProductCapabilityKey, string> = {
  thumbnail: "Thumbnail",
  checkout: "Checkout",
  payment: "Payment",
  contentDelivery: "Content Delivery",
  availability: "Availability",
  formCollection: "Form Collection",
  emailAutomation: "Email Automation",
};

export const CAPABILITY_DESCRIPTIONS: Record<ProductCapabilityKey, string> = {
  thumbnail: "Product card appearance on the store page.",
  checkout: "Buyer info collection and pricing display.",
  payment: "Payment processing.",
  contentDelivery: "Delivering files or links after purchase.",
  availability: "Scheduling and meeting configuration.",
  formCollection: "Custom form fields for visitor input.",
  emailAutomation: "Automated email notifications.",
};
