export const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/epub+zip": ".epub",
  "application/rtf": ".rtf",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "text/markdown": ".md",
  "application/json": ".json",
  "text/html": ".html",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/flac": ".flac",
  "application/zip": ".zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
};

export const BLOCKED_MIME_PREFIXES = ["video/"];

export const BLOCKED_EXTENSIONS = [
  ".exe",
  ".msi",
  ".apk",
  ".dmg",
  ".app",
  ".bat",
  ".sh",
  ".cmd",
  ".com",
  ".scr",
  ".js",
  ".ts",
  ".py",
  ".rb",
  ".php",
  ".pl",
  ".ps1",
  ".dll",
  ".so",
  ".dylib",
  ".sys",
  ".drv",
  ".7z",
  ".rar",
  ".iso",
  ".img",
  ".vhd",
  ".vmdk",
].map((e) => e.toLowerCase());

export const MAX_CONTENT_SIZE = 50 * 1024 * 1024;

export const MAX_FREE_PRODUCTS = 5;

export function isAllowedContentType(mimeType: string): boolean {
  return mimeType.toLowerCase() in ALLOWED_CONTENT_TYPES;
}

export function isBlockedExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  return BLOCKED_EXTENSIONS.includes(ext);
}

export function isBlockedMimeType(mimeType: string): boolean {
  return BLOCKED_MIME_PREFIXES.some((prefix) =>
    mimeType.toLowerCase().startsWith(prefix)
  );
}

export function validateContentFile(
  mimeType: string,
  fileName: string,
  size: number
): { valid: true } | { valid: false; error: string } {
  if (!isAllowedContentType(mimeType)) {
    if (isBlockedMimeType(mimeType)) {
      return { valid: false, error: "Video files are not supported." };
    }
    return {
      valid: false,
      error:
        "Unsupported file type. Accepted formats: PDF, ZIP, EPUB, DOCX, TXT, CSV, JSON, MD, HTML, PNG, JPG, WebP, GIF, SVG, MP3, WAV, OGG, FLAC, XLSX, PPTX",
    };
  }

  if (isBlockedExtension(fileName)) {
    return { valid: false, error: "This file type is not allowed." };
  }

  if (size > MAX_CONTENT_SIZE) {
    const mb = (size / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `${fileName} is ${mb} MB. Maximum upload size is 50 MB.`,
    };
  }

  return { valid: true };
}
