const DRIVE_URL_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/preview/,
];

export function extractGoogleDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function generateDriveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function validateGoogleDriveUrl(url: string): {
  valid: boolean;
  error?: string;
  fileId?: string;
} {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  const trimmed = url.trim();

  if (
    !trimmed.includes("drive.google.com") &&
    !trimmed.includes("docs.google.com")
  ) {
    return {
      valid: false,
      error: "URL must be a Google Drive or Google Docs link",
    };
  }

  const fileId = extractGoogleDriveFileId(trimmed);
  if (!fileId) {
    return {
      valid: false,
      error:
        "Could not extract a file ID from the URL. Ensure it is a valid Google Drive share link.",
    };
  }

  return { valid: true, fileId };
}
