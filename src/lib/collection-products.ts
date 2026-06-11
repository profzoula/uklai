import type { SupabaseClient } from "@supabase/supabase-js";

export type CollectionProductLink = {
  product_id: string;
  sort_order?: number | null;
};

export function orderByCollectionLinks<T extends { id: string }>(
  products: T[],
  links: CollectionProductLink[]
): T[] {
  const sortedLinks = [...links].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const byId = new Map(products.map((p) => [p.id, p]));

  return sortedLinks
    .map((link) => byId.get(link.product_id))
    .filter((p): p is T => !!p);
}

/** Reads collection_products links; works even if sort_order column is missing. */
export async function fetchCollectionProductLinks(
  supabase: SupabaseClient,
  collectionId: string
): Promise<CollectionProductLink[]> {
  const withSort = await supabase
    .from("collection_products")
    .select("product_id, sort_order")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: true });

  if (!withSort.error && withSort.data) {
    return withSort.data;
  }

  if (withSort.error?.message?.includes("sort_order")) {
    const fallback = await supabase
      .from("collection_products")
      .select("product_id")
      .eq("collection_id", collectionId);

    if (fallback.error || !fallback.data) return [];
    return fallback.data.map((row) => ({
      product_id: row.product_id,
      sort_order: 0,
    }));
  }

  return withSort.data ?? [];
}
