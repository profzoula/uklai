import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";
import { createServiceClient } from "@/lib/supabase/service";

type Props = { params: Promise<{ id: string }> };

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

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: Props) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { id } = await params;
  const body = await request.json();
  const { name, slug, description, active, product_ids } = body;

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json(
      { error: "Name and collection code are required." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("collections")
    .update({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description?.trim() || null,
      active: active ?? true,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(product_ids)) {
    const sync = await syncProducts(id, product_ids);
    if (sync.error) {
      return NextResponse.json({ error: sync.error }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const { getCollectionWithProducts } = await import("@/lib/admin-data");
  const data = await getCollectionWithProducts(id);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
