import type { SupabaseClient } from "@supabase/supabase-js";
import type { CheckoutLine } from "@/lib/checkout-totals";

type LineInput = {
  productId: string;
  price: number;
  quantity: number;
};

export async function enrichCheckoutLinesWithShippingFlags<T extends LineInput>(
  supabase: SupabaseClient,
  items: T[]
): Promise<
  Array<
    T &
      Pick<CheckoutLine, "freeShipping" | "noShippingRequired" | "weight">
  >
> {
  const ids = [...new Set(items.map((item) => item.productId).filter(Boolean))];
  if (!ids.length) {
    return items.map((item) => ({
      ...item,
      freeShipping: false,
      noShippingRequired: false,
      weight: null,
    }));
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, free_shipping, no_shipping_required, weight")
    .in("id", ids);

  if (error) {
    return items.map((item) => ({
      ...item,
      freeShipping: false,
      noShippingRequired: false,
      weight: null,
    }));
  }

  const byId = new Map(
    (data ?? []).map((row) => [
      row.id as string,
      {
        freeShipping: Boolean(row.free_shipping),
        noShippingRequired: Boolean(row.no_shipping_required),
        weight:
          row.weight == null ? null : Number(row.weight),
      },
    ])
  );

  return items.map((item) => ({
    ...item,
    freeShipping: byId.get(item.productId)?.freeShipping ?? false,
    noShippingRequired: byId.get(item.productId)?.noShippingRequired ?? false,
    weight: byId.get(item.productId)?.weight ?? null,
  }));
}
