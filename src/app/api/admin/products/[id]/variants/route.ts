import { NextResponse } from "next/server";
import {
  adminUnavailable,
  getAuthorizedAdminSupabase,
} from "@/lib/admin-api";
import { syncParentProductFromVariants } from "@/lib/product-variant-sync";
import { createServiceClient } from "@/lib/supabase/service";

type Props = { params: Promise<{ id: string }> };

type VariantInput = {
  id?: string;
  sku?: string | null;
  color?: string | null;
  image_url?: string | null;
  price: number;
  compare_at_price?: number | null;
  stock?: number;
  sort_order?: number;
  active?: boolean;
};

function parseVariantInput(raw: unknown, index: number): VariantInput | string {
  if (!raw || typeof raw !== "object") {
    return `Variant ${index + 1}: invalid row.`;
  }
  const row = raw as Record<string, unknown>;
  const price = parseFloat(String(row.price ?? ""));
  if (Number.isNaN(price) || price < 0) {
    return `Variant ${index + 1}: price is required.`;
  }
  const stock = row.stock != null ? parseInt(String(row.stock), 10) : 0;
  if (Number.isNaN(stock) || stock < 0) {
    return `Variant ${index + 1}: invalid stock.`;
  }
  const compare =
    row.compare_at_price != null && String(row.compare_at_price).trim() !== ""
      ? parseFloat(String(row.compare_at_price))
      : null;
  if (compare != null && Number.isNaN(compare)) {
    return `Variant ${index + 1}: invalid compare price.`;
  }
  return {
    id: row.id ? String(row.id).trim() || undefined : undefined,
    sku: row.sku ? String(row.sku).trim() || null : null,
    color: row.color ? String(row.color).trim() || null : null,
    image_url: row.image_url ? String(row.image_url).trim() || null : null,
    price,
    compare_at_price: compare,
    stock,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : index,
    active: row.active !== false,
  };
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const { supabase: sessionClient, error: authError } =
    await getAuthorizedAdminSupabase();
  if (authError) return authError;

  const supabase = createServiceClient() ?? sessionClient;
  if (!supabase) return adminUnavailable();

  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    if (/relation.*product_variants/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "product_variants table missing. Run supabase/migrations/product-variants.sql in Supabase.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ variants: data ?? [] });
}

export async function PUT(request: Request, { params }: Props) {
  const { id } = await params;
  const { supabase: sessionClient, error: authError } =
    await getAuthorizedAdminSupabase();
  if (authError) return authError;

  const supabase = createServiceClient() ?? sessionClient;
  if (!supabase) return adminUnavailable();

  let body: { variants?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawVariants = Array.isArray(body.variants) ? body.variants : [];
  const parsed: VariantInput[] = [];
  for (let i = 0; i < rawVariants.length; i++) {
    const result = parseVariantInput(rawVariants[i], i);
    if (typeof result === "string") {
      return NextResponse.json({ error: result }, { status: 400 });
    }
    parsed.push(result);
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", id);

  if (existingError) {
    if (/relation.*product_variants/i.test(existingError.message)) {
      return NextResponse.json(
        {
          error:
            "product_variants table missing. Run supabase/migrations/product-variants.sql in Supabase.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!parsed.length) {
    if (existingRows?.length) {
      const { error: clearError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", id);
      if (clearError) {
        return NextResponse.json({ error: clearError.message }, { status: 500 });
      }
    }
    await syncParentProductFromVariants(supabase, id);
    return NextResponse.json({ variants: [] });
  }

  const now = new Date().toISOString();
  const existingIds = new Set((existingRows ?? []).map((row) => row.id));
  const keptIds = new Set<string>();
  const savedVariants: unknown[] = [];

  for (const [index, variant] of parsed.entries()) {
    const row = {
      product_id: id,
      sku: variant.sku,
      color: variant.color,
      image_url: variant.image_url,
      price: variant.price,
      compare_at_price: variant.compare_at_price,
      stock: variant.stock ?? 0,
      sort_order: variant.sort_order ?? index,
      active: variant.active !== false,
      updated_at: now,
    };

    if (variant.id && existingIds.has(variant.id)) {
      const { data, error: updateError } = await supabase
        .from("product_variants")
        .update(row)
        .eq("id", variant.id)
        .eq("product_id", id)
        .select("*")
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      keptIds.add(variant.id);
      if (data) savedVariants.push(data);
      continue;
    }

    const { data, error: insertError } = await supabase
      .from("product_variants")
      .insert(row)
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (data) {
      keptIds.add(data.id);
      savedVariants.push(data);
    }
  }

  const removeIds = [...existingIds].filter((variantId) => !keptIds.has(variantId));
  if (removeIds.length) {
    const { error: removeError } = await supabase
      .from("product_variants")
      .delete()
      .in("id", removeIds);

    if (removeError) {
      return NextResponse.json({ error: removeError.message }, { status: 500 });
    }
  }

  await syncParentProductFromVariants(supabase, id);

  return NextResponse.json({ variants: savedVariants });
}
