export const DEFAULT_KEYWORD_PRESETS = [
  "link",
  "dm",
  "details",
  "shop",
  "price",
];

export const KEYWORD_PRESET_STORAGE_KEY = "axiol.create.keyword-presets";

export function parseKeywords(rawValue: string) {
  return Array.from(
    new Set(
      rawValue
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}
