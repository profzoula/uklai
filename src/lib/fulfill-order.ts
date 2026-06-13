import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";

export type OrderItemInput = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

type ProductSnapshot = {
  id: string;
  stock: number | null;
  product_type: string | null;
  digital_file_url: string | null;
};

async function loadProductsForItems(
  supabase: SupabaseClient,
  items: OrderItemInput[]
): Promise<Map<string, ProductSnapshot>> {
  const productIds = items.map((item) => item.productId);
  const { data: products } = await supabase
    .from("products")
    .select("id, stock, product_type, digital_file_url")
    .in("id", productIds);

  return new Map((products ?? []).map((product) => [product.id, product]));
}

export async function persistOrderItemRows(
  supabase: SupabaseClient,
  orderId: string,
  items: OrderItemInput[]
): Promise<{ error: string | null }> {
  if (!items.length) return { error: null };

  const productMap = await loadProductsForItems(supabase, items);
  const { error } = await supabase.from("order_items").insert(
    items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        order_id: orderId,
        product_id: item.productId,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price,
        product_type: product?.product_type ?? "physical",
        digital_file_url: product?.digital_file_url ?? null,
      };
    })
  );

  return { error: error?.message ?? null };
}

export async function decrementStockForOrderItems(
  supabase: SupabaseClient,
  items: Array<{ product_id: string; quantity: number; product_type?: string | null }>
) {
  const physicalItems = items.filter(
    (item) => item.product_type !== "digital"
  );
  if (!physicalItems.length) return;

  const productIds = physicalItems.map((item) => item.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("id, stock, product_type")
    .in("id", productIds);

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));

  for (const item of physicalItems) {
    const product = productMap.get(item.product_id);
    if (product && product.product_type !== "digital") {
      await supabase
        .from("products")
        .update({
          stock: Math.max(0, (product.stock ?? 0) - item.quantity),
        })
        .eq("id", item.product_id);
    }
  }
}

export async function notifyOrderPlaced(
  supabase: SupabaseClient,
  orderId: string
) {
  const { data: fullOrder } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (fullOrder?.customer_email) {
    await sendOrderConfirmationEmail({
      id: fullOrder.id,
      customer_email: fullOrder.customer_email,
      total: Number(fullOrder.total),
      order_items: fullOrder.order_items,
    });
  }

  await sendAdminNewOrderEmail({
    id: orderId,
    total: Number(fullOrder?.total ?? 0),
    customer_email: fullOrder?.customer_email ?? null,
  });
}

export async function fulfillOrderItems(
  supabase: SupabaseClient,
  orderId: string,
  items: OrderItemInput[]
) {
  const { error } = await persistOrderItemRows(supabase, orderId, items);
  if (error) {
    throw new Error(error);
  }

  const productMap = await loadProductsForItems(supabase, items);
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (product && product.product_type !== "digital") {
      await supabase
        .from("products")
        .update({
          stock: Math.max(0, (product.stock ?? 0) - item.quantity),
        })
        .eq("id", item.productId);
    }
  }

  await notifyOrderPlaced(supabase, orderId);
}

export async function completePaidStripeOrder(
  supabase: SupabaseClient,
  orderId: string
) {
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, quantity, product_type")
    .eq("order_id", orderId);

  if (!orderItems?.length) return;

  await decrementStockForOrderItems(supabase, orderItems);
  await notifyOrderPlaced(supabase, orderId);
}

export function parseLegacyStripeItemsMetadata(itemsJson: string) {
  return JSON.parse(itemsJson) as Array<{
    productId?: string;
    id?: string;
    name?: string;
    price?: number;
    p?: number;
    quantity?: number;
    q?: number;
    image?: string | null;
  }>;
}

export function normalizeLegacyStripeItems(
  raw: ReturnType<typeof parseLegacyStripeItemsMetadata>
): OrderItemInput[] {
  return raw.map((item) => ({
    productId: item.productId ?? item.id ?? "",
    name: item.name ?? "Product",
    price: Number(item.price ?? item.p ?? 0),
    quantity: Number(item.quantity ?? item.q ?? 1),
    image: item.image ?? null,
  }));
}
