import type Stripe from "stripe";

type CheckoutItem = {
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

function stripeProductImageUrls(image: string | null): string[] {
  if (!image) return [];

  try {
    const url = new URL(image);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return [image];
    }
  } catch {
    if (image.startsWith("/") && process.env.NEXT_PUBLIC_APP_URL) {
      const base = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
      return [`${base}${image}`];
    }
  }

  return [];
}

function discountedUnitAmountCents(
  item: CheckoutItem,
  index: number,
  items: CheckoutItem[],
  discountCents: number,
  subtotalCents: number,
  targetProductCents: number,
  allocatedCents: { value: number }
): number {
  const itemCents = Math.round(item.price * 100) * item.quantity;

  if (discountCents <= 0 || subtotalCents <= 0) {
    return Math.round(item.price * 100);
  }

  let discountedItemCents: number;
  if (index === items.length - 1) {
    discountedItemCents = targetProductCents - allocatedCents.value;
  } else {
    discountedItemCents = Math.round(
      itemCents - (discountCents * itemCents) / subtotalCents
    );
    allocatedCents.value += discountedItemCents;
  }

  return Math.max(0, Math.round(discountedItemCents / item.quantity));
}

export function buildStripeCheckoutLineItems(
  items: CheckoutItem[],
  currency: string,
  discount: number,
  shipping: number,
  tax: number,
  taxLabel: string,
  includeTaxLineItem: boolean
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0
  );
  const discountCents = Math.round(discount * 100);
  const targetProductCents = Math.max(0, subtotalCents - discountCents);
  const allocatedCents = { value: 0 };

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item, index) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          images: stripeProductImageUrls(item.image),
        },
        unit_amount: discountedUnitAmountCents(
          item,
          index,
          items,
          discountCents,
          subtotalCents,
          targetProductCents,
          allocatedCents
        ),
      },
      quantity: item.quantity,
    })
  );

  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency,
        product_data: { name: "Shipping", images: [] },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  if (tax > 0 && includeTaxLineItem) {
    lineItems.push({
      price_data: {
        currency,
        product_data: { name: taxLabel, images: [] },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    });
  }

  return lineItems;
}
