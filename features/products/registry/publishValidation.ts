import type { Doc } from "@/convex/_generated/dataModel";
import type { ProductTypeDefinition, ProductCapabilityKey, ProductStepKey } from "./productTypes";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PublishValidationResult =
  | { valid: true }
  | {
      valid: false;
      errors: Array<{
        step: ProductStepKey;
        message: string;
      }>;
    };

type PublishValidator = (
  product: Doc<"products">,
  definition: ProductTypeDefinition
) => Array<{ step: ProductStepKey; message: string }>;

const thumbnailValidator: PublishValidator = (product) => {
  const errors: Array<{ step: ProductStepKey; message: string }> = [];
  const config = product.config?.thumbnail as any;
  if (!config) {
    errors.push({ step: "thumbnail", message: "Thumbnail configuration is required." });
    return errors;
  }
  if (!config.title) {
    errors.push({ step: "thumbnail", message: "Thumbnail title is required." });
  }
  if (!config.buttonText) {
    errors.push({ step: "thumbnail", message: "Thumbnail button text is required." });
  }
  if (!config.style) {
    errors.push({ step: "thumbnail", message: "Thumbnail style is required." });
  }
  return errors;
};

const checkoutValidator: PublishValidator = (product, definition) => {
  const errors: Array<{ step: ProductStepKey; message: string }> = [];
  const config = product.config?.checkout as any;

  if (definition.requiresPrice) {
    if (!product.price || !product.price.trim()) {
      errors.push({
        step: "checkout",
        message: "A valid price is required before publishing.",
      });
    }
  }

  if (!config) {
    errors.push({ step: "checkout", message: "Checkout configuration is required." });
    return errors;
  }

  const nameField = config.collectFields?.find((f: any) => f.key === "name");
  const emailField = config.collectFields?.find((f: any) => f.key === "email");

  if (!nameField?.enabled) {
    errors.push({ step: "checkout", message: "Name field must be enabled in checkout." });
  }
  if (!emailField?.enabled) {
    errors.push({ step: "checkout", message: "Email field must be enabled in checkout." });
  }

  return errors;
};

const paymentValidator: PublishValidator = (product, definition) => {
  const errors: Array<{ step: ProductStepKey; message: string }> = [];
  if (definition.requiresPrice) {
    if (!product.price || !product.price.trim()) {
      errors.push({
        step: "checkout",
        message: "A valid price is required before publishing.",
      });
    }
  }
  return errors;
};

const contentDeliveryValidator: PublishValidator = (product) => {
  const errors: Array<{ step: ProductStepKey; message: string }> = [];
  const config = product.config?.content as any;
  if (!config) {
    errors.push({ step: "content", message: "Content configuration is required." });
    return errors;
  }
  if (config.mode === "upload" && !config.r2Key) {
    errors.push({ step: "content", message: "Upload a file before publishing." });
  }
  if (config.mode === "external_link" && !config.url) {
    errors.push({ step: "content", message: "Provide a valid URL before publishing." });
  }
  return errors;
};

const availabilityValidator: PublishValidator = (product) => {
  const errors: Array<{ step: ProductStepKey; message: string }> = [];
  const config = product.config?.availability as any;
  if (!config) {
    errors.push({ step: "availability", message: "Availability configuration is required." });
    return errors;
  }
  if (!config.scheduleId) {
    errors.push({ step: "availability", message: "Select an availability schedule." });
  }
  if (!config.durationMinutes || config.durationMinutes <= 0) {
    errors.push({ step: "availability", message: "Set a valid call duration." });
  }
  if (!config.maxAttendees || config.maxAttendees < 1) {
    errors.push({ step: "availability", message: "Set maximum attendees to at least 1." });
  }
  return errors;
};

const formCollectionValidator: PublishValidator = (product) => {
  const errors: Array<{ step: ProductStepKey; message: string }> = [];
  const config = product.config?.form as any;
  if (!config) {
    errors.push({ step: "form", message: "Form configuration is required." });
    return errors;
  }
  const hasEmail = config.fields?.some((f: any) => f.type === "email" && f.required);
  if (!hasEmail) {
    errors.push({ step: "form", message: "At least one required email field is needed." });
  }
  return errors;
};

const PUBLISH_VALIDATORS: Partial<Record<ProductCapabilityKey, PublishValidator>> = {
  thumbnail: thumbnailValidator,
  checkout: checkoutValidator,
  payment: paymentValidator,
  contentDelivery: contentDeliveryValidator,
  availability: availabilityValidator,
  formCollection: formCollectionValidator,
};

export function validateProductForPublish(
  product: Doc<"products">,
  definition: ProductTypeDefinition
): PublishValidationResult {
  const errors: Array<{ step: ProductStepKey; message: string }> = [];

  for (const capability of definition.capabilities) {
    const validator = PUBLISH_VALIDATORS[capability];
    if (validator) {
      errors.push(...validator(product, definition));
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
