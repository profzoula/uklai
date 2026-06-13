import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminNotificationType = "order" | "review" | "return";

export type AdminNotificationItem = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

export type AdminNotificationsPayload = {
  items: AdminNotificationItem[];
  count: number;
  counts: {
    orders: number;
    reviews: number;
    returns: number;
  };
};

function orderRef(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export async function fetchAdminNotifications(
  supabase: SupabaseClient
): Promise<AdminNotificationsPayload> {
  const [ordersRes, reviewsRes, returnsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, customer_email, total, status, created_at")
      .in("status", ["paid", "pending"])
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("product_reviews")
      .select("id, customer_name, rating, title, created_at, products(name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("return_requests")
      .select("id, customer_email, order_number, reason, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const orderItems: AdminNotificationItem[] = (ordersRes.data ?? []).map(
    (order) => ({
      id: `order-${order.id}`,
      type: "order",
      title: `New order ${orderRef(order.id)}`,
      message:
        order.status === "pending"
          ? `Cash on delivery — $${Number(order.total).toFixed(2)}`
          : `${order.customer_email ?? "Customer"} — $${Number(order.total).toFixed(2)}`,
      href: `/admin/orders/${order.id}`,
      createdAt: order.created_at,
    })
  );

  const reviewItems: AdminNotificationItem[] = (reviewsRes.data ?? []).map(
    (review) => {
      const productName =
        (review.products as { name?: string } | null)?.name ?? "Product";
      return {
        id: `review-${review.id}`,
        type: "review",
        title: `Review pending — ${productName}`,
        message: `${review.customer_name} left ${review.rating}★${
          review.title ? ` — ${review.title}` : ""
        }`,
        href: "/admin/reviews",
        createdAt: review.created_at,
      };
    }
  );

  const returnItems: AdminNotificationItem[] = (returnsRes.data ?? []).map(
    (request) => ({
      id: `return-${request.id}`,
      type: "return",
      title: `Return request${
        request.order_number ? ` — ${request.order_number}` : ""
      }`,
      message: `${request.customer_email} — ${request.reason}`,
      href: "/admin/returns",
      createdAt: request.created_at,
    })
  );

  const items = [...orderItems, ...reviewItems, ...returnItems].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    items,
    count: items.length,
    counts: {
      orders: orderItems.length,
      reviews: reviewItems.length,
      returns: returnItems.length,
    },
  };
}
