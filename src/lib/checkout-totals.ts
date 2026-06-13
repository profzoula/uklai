import type { AllStoreSettings } from "@/lib/store-settings-types";

export type CheckoutLine = {
  productId: string;
  price: number;
  quantity: number;
  freeShipping?: boolean;
  noShippingRequired?: boolean;
  weight?: number | null;
};

export type CheckoutTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  freeShipping: boolean;
};

function cartQualifiesForProductFreeShipping(items: CheckoutLine[]): boolean {
  const shippable = items.filter((item) => !item.noShippingRequired);
  if (!shippable.length) return true;
  return shippable.every((item) => item.freeShipping);
}

/** Weighted physical items without free shipping always incur the flat rate. */
function cartQualifiesForThresholdFreeShipping(
  items: CheckoutLine[],
  afterDiscount: number,
  threshold: number
): boolean {
  if (afterDiscount < threshold) return false;

  const hasWeightedPaidShippingItem = items.some(
    (item) =>
      !item.noShippingRequired &&
      !item.freeShipping &&
      item.weight != null &&
      item.weight > 0
  );

  return !hasWeightedPaidShippingItem;
}

export function calculateCheckoutTotals(
  items: CheckoutLine[],
  settings: AllStoreSettings,
  discount = 0,
  freeShipping = false
): CheckoutTotals {
  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const afterDiscount = Math.max(0, subtotal - discount);

  const threshold = parseFloat(settings.shipping.free_shipping_threshold || "50");
  const flatRate = parseFloat(settings.shipping.flat_rate || "5.99");
  const productFreeShipping = cartQualifiesForProductFreeShipping(items);
  const thresholdFreeShipping = cartQualifiesForThresholdFreeShipping(
    items,
    afterDiscount,
    threshold
  );
  const shipping =
    freeShipping || productFreeShipping || thresholdFreeShipping ? 0 : flatRate;

  let tax = 0;
  if (settings.tax.enabled) {
    const rate = parseFloat(settings.tax.default_rate || "0") / 100;
    const taxableBase = settings.tax.prices_include_tax
      ? 0
      : afterDiscount;
    tax = Math.round(taxableBase * rate * 100) / 100;
  }

  const total = Math.max(0, afterDiscount + shipping + tax);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    freeShipping:
      freeShipping || productFreeShipping || thresholdFreeShipping,
  };
}
