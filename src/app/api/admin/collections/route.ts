import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";
import { createServiceClient } from "@/lib/supabase/service";

async function syncProducts(collectionId: string, productIds: string[]) {
  const service = createServiceClient();
  const supabase = service ?? (await getAdminSupabase());
  if (!supabase) return { error: "Database unavailable" };

  await supabase
    .from("collection_products")
    .delete()
    .eq("collection_id", collectionId);

  if (productIds.length) {
    const rows = productIds.map((product_id, sort_order) => ({
      collection_id: collectionId,
      product_id,
      sort_order,
    }));

    let { error } = await supabase.from("collection_products").insert(rows);

    if (error?.message?.includes("sort_order")) {
      ({ error } = await supabase.from("collection_products").insert(
        productIds.map((product_id) => ({
          collection_id: collectionId,
          product_id,
        }))
      ));
    }

    if (error) return { error: error.message };
  }

  return { error: null };
}

export async function POST(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const body = await request.json();
  const { name, slug, description, active, product_ids } = body;

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json(
      { error: "Name and collection code are required." },
      { status: 400 }
    );
  }

  const { data: created, error } = await supabase
    .from("collections")
    .insert({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description?.trim() || null,
      active: active ?? true,
    })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create collection" },
      { status: 500 }
    );
  }

  const sync = await syncProducts(
    created.id,
    Array.isArray(product_ids) ? product_ids : []
  );
  if (sync.error) {
    return NextResponse.json({ error: sync.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: created.id });
}
