import { NextResponse } from "next/server";
import { getDataSupabase } from "@/lib/supabase/server-data";
import { getStoreSettings } from "@/lib/store-settings";
import { calculateCheckoutTotals } from "@/lib/checkout-totals";
import { enrichCheckoutLinesWithShippingFlags } from "@/lib/checkout-shipping-flags";

export async function POST(request: Request) {
  const { items, discount, freeShipping } = (await request.json()) as {
    items: Array<{ productId: string; price: number; quantity: number }>;
    discount?: number;
    freeShipping?: boolean;
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Items required" }, { status: 400 });
  }

  const settings = await getStoreSettings();
  const supabase = await getDataSupabase();
  const lines = supabase
    ? await enrichCheckoutLinesWithShippingFlags(supabase, items)
    : items.map((item) => ({
        ...item,
        freeShipping: false,
        noShippingRequired: false,
      }));

  const totals = calculateCheckoutTotals(
    lines,
    settings,
    discount ?? 0,
    freeShipping ?? false
  );

  return NextResponse.json(totals);
}
