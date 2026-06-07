const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGES_BUCKET = "product-images";

export function resolveImageMime(
  file: Pick<File, "name" | "type">
): { mime: string; ext: string } | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type || EXT_TO_MIME[ext] || "";
  if (!mime || !Object.values(EXT_TO_MIME).includes(mime)) {
    return null;
  }
  const normalizedExt =
    ext && EXT_TO_MIME[ext]
      ? ext
      : mime.replace("image/", "").replace("jpeg", "jpg");
  return { mime, ext: normalizedExt === "jpeg" ? "jpg" : normalizedExt };
}

export function friendlyStorageError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("bucket") && lower.includes("not found")) {
    return 'Storage bucket "product-images" is missing. In Supabase: Storage → New bucket → name it product-images → Public.';
  }
  if (lower.includes("row-level security") || lower.includes("policy")) {
    return "Storage access denied. Run the storage SQL at the bottom of supabase/schema.sql in Supabase SQL Editor.";
  }
  if (lower.includes("payload too large") || lower.includes("file size")) {
    return "Image must be 5 MB or smaller.";
  }
  return message;
}
