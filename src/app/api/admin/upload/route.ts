import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  friendlyStorageError,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGES_BUCKET,
  resolveImageMime,
} from "@/lib/product-image-utils";

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "Supabase is not configured in .env.local." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const entry = formData.get("file");
  if (!entry || typeof entry === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const file = entry as File;
  const meta = resolveImageMime(file);
  if (!meta) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and GIF images are allowed." },
      { status: 400 }
    );
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient() ?? (await createClient());
  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${meta.ext}`;

  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, bytes, {
      contentType: meta.mime,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return NextResponse.json(
      { error: friendlyStorageError(error.message) },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl, path: data.path });
}
