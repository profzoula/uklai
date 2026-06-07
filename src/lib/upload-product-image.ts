import { createClient } from "@/lib/supabase/client";
import {
  friendlyStorageError,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGES_BUCKET,
  resolveImageMime,
} from "@/lib/product-image-utils";

export { resolveImageMime } from "@/lib/product-image-utils";

export async function uploadProductImage(file: File): Promise<string> {
  const meta = resolveImageMime(file);
  if (!meta) {
    throw new Error("Only JPEG, PNG, WebP and GIF images are allowed.");
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
    );
  }

  const supabase = createClient();
  const path = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${meta.ext}`;

  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: meta.mime,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(friendlyStorageError(error.message));
  }

  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(data.path)
    .data.publicUrl;
}
