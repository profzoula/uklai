import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";

type OrderItemInput = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

export async function fulfillOrderItems(
  supabase: SupabaseClient,
  orderId: string,
  items: OrderItemInput[]
) {
  const productIds = items.map((i) => i.productId);
  const { data: products } = await supabase
    .from("products")
    .select("id, stock, product_type, digital_file_url")
    .in("id", productIds);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  await supabase.from("order_items").insert(
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
