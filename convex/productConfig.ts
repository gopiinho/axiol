import { v } from "convex/values";

export const thumbnailConfigValidator = v.object({
  style: v.union(v.literal("button"), v.literal("callout"), v.literal("preview")),
  imageId: v.optional(v.id("_storage")),
  title: v.string(),
  subtitle: v.optional(v.string()),
  buttonText: v.string(),
});

export const checkoutConfigValidator = v.object({
  coverImageId: v.optional(v.id("_storage")),
  descriptionJson: v.optional(v.string()),
  collectFields: v.array(
    v.object({
      key: v.string(),
      label: v.string(),
      type: v.union(v.literal("text"), v.literal("email"), v.literal("phone")),
      required: v.boolean(),
      enabled: v.boolean(),
    }),
  ),
});

export const contentConfigValidator = v.union(
  v.object({
    mode: v.literal("upload"),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
  }),
  v.object({
    mode: v.literal("external_link"),
    url: v.optional(v.string()),
  }),
  v.object({
    mode: v.literal("none"),
  }),
);

export const availabilityConfigValidator = v.object({
  scheduleId: v.optional(v.id("availabilitySchedules")),
  durationMinutes: v.number(),
  meetingLocationType: v.union(
    v.literal("google_meet"),
    v.literal("zoom"),
    v.literal("custom"),
  ),
  customLocation: v.optional(v.string()),
  maxAttendees: v.number(),
  bookWithinDays: v.number(),
  bufferBeforeMinutes: v.optional(v.number()),
  bufferAfterMinutes: v.optional(v.number()),
});

export const formConfigValidator = v.object({
  fields: v.array(
    v.object({
      id: v.string(),
      label: v.string(),
      type: v.union(
        v.literal("text"),
        v.literal("email"),
        v.literal("phone"),
        v.literal("textarea"),
        v.literal("file"),
        v.literal("url"),
      ),
      required: v.boolean(),
      order: v.number(),
    }),
  ),
});

export const productConfigValidator = v.object({
  thumbnail: v.optional(thumbnailConfigValidator),
  checkout: v.optional(checkoutConfigValidator),
  content: v.optional(contentConfigValidator),
  availability: v.optional(availabilityConfigValidator),
  form: v.optional(formConfigValidator),
});

export const productTypeValidator = v.union(
  v.literal("affiliate"),
  v.literal("digital"),
);
