import { getStoreSettings } from "@/lib/store-settings";
import { getPublicAppOrigin } from "@/lib/app-url";
import type { SupabaseClient } from "@supabase/supabase-js";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const from =
    process.env.EMAIL_FROM ?? "UKLAI <onboarding@resend.dev>";

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email failed]", err);
      return { ok: false, skipped: false as const, error: err };
    }

    return { ok: true, skipped: false as const };
  }

  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from.match(/<([^>]+)>/)?.[1] ?? from, name: "UKLAI" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email failed]", err);
      return { ok: false, skipped: false as const, error: err };
    }

    return { ok: true, skipped: false as const };
  }

  console.info("[email skipped]", subject, "→", to);
  return { ok: false, skipped: true as const };
}

export async function sendOrderConfirmationEmail(order: {
  id: string;
  customer_email: string;
  total: number;
  order_items?: Array<{ product_name: string; quantity: number; price: number }>;
}) {
  const settings = await getStoreSettings();
  if (!settings.notifications.order_confirmation) return;

  const storeName = settings.store.name || "UKLAI";
  const items = order.order_items ?? [];
  const itemsHtml = items
    .map(
      (i) =>
        `<li>${i.product_name} × ${i.quantity} — $${Number(i.price).toFixed(2)}</li>`
    )
    .join("");

  await sendEmail({
    to: order.customer_email,
    subject: `Order confirmed — ${storeName}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order #${order.id.slice(0, 8).toUpperCase()}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total: $${Number(order.total).toFixed(2)}</strong></p>
      <p>We'll notify you when your order ships.</p>
    `,
  });
}

export async function sendShippedEmail(order: {
  id: string;
  customer_email: string;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
}) {
  const settings = await getStoreSettings();
  if (!settings.notifications.shipping_updates) return;

  const storeName = settings.store.name || "UKLAI";
  const tracking = order.tracking_number
    ? `<p>Tracking (${order.tracking_carrier ?? "Carrier"}): <strong>${order.tracking_number}</strong></p>`
    : "";

  await sendEmail({
    to: order.customer_email,
    subject: `Your order has shipped — ${storeName}`,
    html: `
      <h2>Your order is on the way!</h2>
      <p>Order #${order.id.slice(0, 8).toUpperCase()} has been shipped.</p>
      ${tracking}
    `,
  });
}

export async function sendAdminNewOrderEmail(order: {
  id: string;
  total: number;
  customer_email?: string | null;
}) {
  const settings = await getStoreSettings();
  const adminEmail =
    settings.notifications.admin_email || settings.store.email;
  if (!settings.notifications.admin_new_order || !adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject: `New order #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <p>New order received.</p>
      <p>Customer: ${order.customer_email ?? "Guest"}</p>
      <p>Total: $${Number(order.total).toFixed(2)}</p>
      <p>View in admin: ${getPublicAppOrigin()}/admin/orders/${order.id}</p>
    `,
  });
}

type ReviewRequestItem = {
  product_name: string;
  slug: string;
};

export async function sendReviewRequestEmail(
  supabase: SupabaseClient,
  orderId: string
) {
  const settings = await getStoreSettings();
  if (!settings.notifications.review_requests) return;

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, customer_email, review_request_sent_at, order_items(product_id, product_name, product_type, products(slug))"
    )
    .eq("id", orderId)
    .single();

  if (!order?.customer_email || order.review_request_sent_at) return;

  const seen = new Set<string>();
  const reviewItems: ReviewRequestItem[] = [];

  for (const item of order.order_items ?? []) {
    if (item.product_type === "digital") continue;

    const slug = (item.products as { slug?: string } | null)?.slug;
    if (!slug || seen.has(slug)) continue;

    seen.add(slug);
    reviewItems.push({
      product_name: item.product_name,
      slug,
    });
  }

  if (!reviewItems.length) return;

  const storeName = settings.store.name || "UKLAI";
  const appOrigin = getPublicAppOrigin();
  const orderRef = order.id.slice(0, 8).toUpperCase();

  const itemsHtml = reviewItems
    .map(
      (item) =>
        `<li style="margin-bottom:12px;">
          <strong>${item.product_name}</strong><br />
          <a href="${appOrigin}/products/${item.slug}?tab=reviews" style="color:#2563eb;font-weight:600;">
            Leave a review
          </a>
        </li>`
    )
    .join("");

  const result = await sendEmail({
    to: order.customer_email,
    subject: `How was your order? — ${storeName}`,
    html: `
      <h2>We hope you're enjoying your purchase!</h2>
      <p>Your order <strong>#${orderRef}</strong> has been delivered. We'd love to hear what you think.</p>
      <p>Your feedback helps other shoppers and helps us improve ${storeName}.</p>
      <ul style="padding-left:20px;line-height:1.6;">${itemsHtml}</ul>
      <p style="margin-top:24px;color:#64748b;font-size:14px;">
        Thank you for shopping with ${storeName}.
      </p>
    `,
  });

  if (result.ok) {
    await supabase
      .from("orders")
      .update({ review_request_sent_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}
