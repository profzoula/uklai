import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/store-settings";
import { calculateCheckoutTotals } from "@/lib/checkout-totals";

export async function POST(request: Request) {
  const { items, discount, freeShipping } = (await request.json()) as {
    items: Array<{ productId: string; price: number; quantity: number }>;
    discount?: number;
    freeShipping?: boolean;
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Items required" }, { status: 400 });
  }

  await createClient();
  const settings = await getStoreSettings();
  const totals = calculateCheckoutTotals(
    items,
    settings,
    discount ?? 0,
    freeShipping ?? false
  );

  return NextResponse.json(totals);
}
