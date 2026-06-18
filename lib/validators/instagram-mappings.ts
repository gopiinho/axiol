export interface ReelMappingInput {
  reelId: string;
  reelUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  keyword: string;
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

export function normalizeKeywordString(rawKeyword: string) {
  const values = Array.from(
    new Set(
      rawKeyword
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (values.length === 0) {
    throw new Error("At least one keyword is required.");
  }

  if (values.length > 12) {
    throw new Error("Use at most 12 keywords per mapping.");
  }

  return values.join(",");
}

export function validateReelMappingInput(input: ReelMappingInput) {
  const reelId = input.reelId.trim();
  if (!reelId) {
    throw new Error("Reel ID is required.");
  }

  const reelUrl = input.reelUrl.trim();
  assertHttpUrl(reelUrl, "Reel URL");

  const thumbnailUrl = input.thumbnailUrl?.trim() || undefined;
  if (thumbnailUrl) {
    assertHttpUrl(thumbnailUrl, "Thumbnail URL");
  }

  const caption = input.caption?.trim() || undefined;
  const keyword = normalizeKeywordString(input.keyword);

  return {
    reelId,
    reelUrl,
    thumbnailUrl,
    caption,
    keyword,
  };
}
