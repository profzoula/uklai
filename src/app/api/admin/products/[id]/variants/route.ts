import { NextResponse } from "next/server";
import {
  adminUnavailable,
  getAuthorizedAdminSupabase,
} from "@/lib/admin-api";
import { syncParentProductFromVariants } from "@/lib/product-variant-sync";
import { createServiceClient } from "@/lib/supabase/service";

type Props = { params: Promise<{ id: string }> };

type VariantInput = {
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

  const { error: deleteError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", id);

  if (deleteError) {
    if (/relation.*product_variants/i.test(deleteError.message)) {
      return NextResponse.json(
        {
          error:
            "product_variants table missing. Run supabase/migrations/product-variants.sql in Supabase.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (!parsed.length) {
    await syncParentProductFromVariants(supabase, id);
    return NextResponse.json({ variants: [] });
  }

  const now = new Date().toISOString();
  const rows = parsed.map((v, index) => ({
    product_id: id,
    sku: v.sku,
    color: v.color,
    image_url: v.image_url,
    price: v.price,
    compare_at_price: v.compare_at_price,
    stock: v.stock ?? 0,
    sort_order: v.sort_order ?? index,
    active: v.active !== false,
    updated_at: now,
  }));

  const { data, error: insertError } = await supabase
    .from("product_variants")
    .insert(rows)
    .select("*");

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await syncParentProductFromVariants(supabase, id);

  return NextResponse.json({ variants: data ?? [] });
}
