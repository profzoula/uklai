import type { Coupon, CouponRules } from "@/lib/admin-data-types";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type CouponValidationResult =
  | {
      valid: true;
      couponId: string;
      code: string;
      discount: number;
      freeShipping: boolean;
      type: Coupon["type"];
      value: number;
    }
  | { valid: false; error: string };

function parseRules(rules?: CouponRules | null) {
  return {
    free_shipping: rules?.free_shipping ?? false,
    discount_subtype: rules?.discount_subtype ?? "order_percentage",
    min_purchase_amount: Number(rules?.min_purchase_amount ?? 0),
    min_purchase_qty: Number(rules?.min_purchase_qty ?? 0),
    product_conditions: rules?.product_conditions ?? [],
  };
}

function eligibleSubtotal(
  items: CartLine[],
  subtype: string,
  productConditions: CouponRules["product_conditions"]
): number {
  if (
    subtype === "product_fixed" ||
    subtype === "product_percentage"
  ) {
    const ids = new Set(
      (productConditions ?? []).map((c) => c.productId)
    );
    if (!ids.size) return 0;
    return items
      .filter((i) => ids.has(i.productId))
      .reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function validateCouponForCart(
  coupon: Coupon,
  items: CartLine[],
  userEmail?: string | null
): CouponValidationResult {
  const now = new Date();

  if (!coupon.active) {
    return { valid: false, error: "This coupon is not active." };
  }

  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: "This coupon is not valid yet." };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: "This coupon has expired." };
  }

  if (
    coupon.usage_limit != null &&
    coupon.usage_count >= coupon.usage_limit
  ) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  const rules = parseRules(coupon.rules);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  if (rules.min_purchase_amount > 0 && subtotal < rules.min_purchase_amount) {
    return {
      valid: false,
      error: `Minimum purchase of $${rules.min_purchase_amount.toFixed(2)} required.`,
    };
  }

  if (rules.min_purchase_qty > 0 && totalQty < rules.min_purchase_qty) {
    return {
      valid: false,
      error: `Minimum ${rules.min_purchase_qty} items required.`,
    };
  }

  const allowedEmails = coupon.rules?.customer_emails ?? [];
  if (allowedEmails.length > 0) {
    if (!userEmail || !allowedEmails.includes(userEmail)) {
      return { valid: false, error: "This coupon is not valid for your account." };
    }
  }

  const eligible = eligibleSubtotal(
    items,
    rules.discount_subtype,
    rules.product_conditions
  );

  if (
    (rules.discount_subtype === "product_fixed" ||
      rules.discount_subtype === "product_percentage") &&
    eligible <= 0
  ) {
    return { valid: false, error: "No eligible products in cart for this coupon." };
  }

  let discount = 0;
  const base = eligible > 0 ? eligible : subtotal;

  if (coupon.type === "percentage") {
    discount = (base * Number(coupon.value)) / 100;
  } else {
    discount = Number(coupon.value);
  }

  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;

  if (discount <= 0 && !rules.free_shipping) {
    return { valid: false, error: "This coupon does not apply to your cart." };
  }

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discount,
    freeShipping: rules.free_shipping,
    type: coupon.type,
    value: Number(coupon.value),
  };
}
