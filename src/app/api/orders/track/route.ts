import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type TrackPayload = {
  orderId?: string;
  email?: string;
};

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Order tracking requires database configuration." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as TrackPayload;
  const orderQuery = body.orderId?.trim().replace(/#/g, "");
  const email = body.email?.trim().toLowerCase();

  if (!orderQuery || !email) {
    return NextResponse.json(
      { error: "Order number and email are required." },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Tracking is temporarily unavailable." },
      { status: 503 }
    );
  }

  const normalized = orderQuery.toLowerCase();
  let query = service
    .from("orders")
    .select(
      "id, status, total, created_at, tracking_number, tracking_carrier, shipping_name, shipping_city, shipping_state, customer_email, order_items(product_name, quantity)"
    );

  if (normalized.length >= 32) {
    query = query.eq("id", normalized);
  } else {
    query = query.ilike("id", `${normalized}%`);
  }

  const { data: orders, error } = await query.limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const order = (orders ?? []).find(
    (row) => row.customer_email?.toLowerCase() === email
  );

  if (!order) {
    return NextResponse.json(
      { error: "No order found for that number and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    order: {
      id: order.id,
      shortId: order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      trackingNumber: order.tracking_number,
      trackingCarrier: order.tracking_carrier,
      shippingName: order.shipping_name,
      shippingCity: order.shipping_city,
      shippingState: order.shipping_state,
      items: order.order_items ?? [],
      statusSteps: buildStatusSteps(order.status),
    },
  });
}

function buildStatusSteps(current: string) {
  const flow = ["pending", "paid", "processing", "shipped", "delivered"];
  const terminal = ["cancelled", "refunded"];

  if (terminal.includes(current)) {
    return [{ key: current, label: current, done: true, active: true }];
  }

  const index = flow.indexOf(current);
  return flow.map((step, i) => ({
    key: step,
    label: step,
    done: index >= i,
    active: index === i,
  }));
}
