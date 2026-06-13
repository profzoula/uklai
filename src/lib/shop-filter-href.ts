export type ShopFilters = {
  category?: string;
  collection?: string;
  deals?: boolean;
  featured?: boolean;
  q?: string;
};

export function buildShopFilterHref(
  current: ShopFilters,
  overrides: {
    category?: string | null;
    collection?: string | null;
    deals?: boolean;
    featured?: boolean;
    q?: string | null;
  } = {}
): string {
  const next = new URLSearchParams();

  const category =
    overrides.category !== undefined ? overrides.category : current.category;
  const collection =
    overrides.collection !== undefined
      ? overrides.collection
      : current.collection;
  const deals =
    overrides.deals !== undefined ? overrides.deals : current.deals;
  const featured =
    overrides.featured !== undefined ? overrides.featured : current.featured;
  const q = overrides.q !== undefined ? overrides.q : current.q;

  if (category) next.set("category", category);
  if (collection) next.set("collection", collection);
  if (deals) next.set("deals", "true");
  if (featured) next.set("featured", "true");
  if (q?.trim()) next.set("q", q.trim());

  const qs = next.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
