export function orderByCollectionLinks<T extends { id: string }>(
  products: T[],
  links: { product_id: string; sort_order?: number | null }[]
): T[] {
  const sortedLinks = [...links].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const byId = new Map(products.map((p) => [p.id, p]));

  return sortedLinks
    .map((link) => byId.get(link.product_id))
    .filter((p): p is T => !!p);
}
