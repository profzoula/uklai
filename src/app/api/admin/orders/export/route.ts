import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/data";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";

function escapeCsv(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const orders = await getAllOrders();

  const headers = [
    "order_id",
    "date",
    "customer_email",
    "status",
    "subtotal",
    "discount",
    "tax",
    "total",
    "refunded",
    "coupon",
    "tracking",
    "items",
  ];

  const rows = orders.map((o) => {
    const items = (o.order_items ?? [])
      .map((i) => `${i.product_name} x${i.quantity}`)
      .join("; ");

    return [
      o.id,
      o.created_at,
      o.customer_email,
      o.status,
      o.subtotal,
      o.discount_amount,
      o.tax_amount,
      o.total,
      o.refunded_amount,
      o.coupon_code,
      o.tracking_number
        ? `${o.tracking_carrier ?? ""} ${o.tracking_number}`.trim()
        : "",
      items,
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
