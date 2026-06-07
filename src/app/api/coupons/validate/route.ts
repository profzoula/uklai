import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateCouponForCart } from "@/lib/coupons";
import type { Coupon } from "@/lib/admin-data-types";
import { getStoreSettings } from "@/lib/store-settings";
import { calculateCheckoutTotals } from "@/lib/checkout-totals";

export async function POST(request: Request) {
  const { code, items } = (await request.json()) as {
    code?: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  };

  if (!items?.length) {
    return NextResponse.json(
      { valid: false, error: "Cart items required." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const settings = await getStoreSettings();
  let discount = 0;
  let freeShipping = false;
  let appliedCode: string | null = null;

  if (code?.trim()) {
    const { data: couponRow } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code.trim())
      .maybeSingle();

    if (!couponRow) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code." });
    }

    const result = validateCouponForCart(
      couponRow as Coupon,
      items,
      user?.email
    );

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    discount = result.discount;
    freeShipping = result.freeShipping;
    appliedCode = result.code;
  }

  const totals = calculateCheckoutTotals(items, settings, discount, freeShipping);

  return NextResponse.json({
    valid: true,
    code: appliedCode,
    discount: totals.discount,
    freeShipping: totals.freeShipping,
    shipping: totals.shipping,
    tax: totals.tax,
    subtotal: totals.subtotal,
    total: totals.total,
  });
}
