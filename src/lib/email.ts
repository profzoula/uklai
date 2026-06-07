import { getStoreSettings } from "@/lib/store-settings";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Briclix <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[email skipped]", subject, "→", to);
    return { ok: false, skipped: true as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

export async function sendOrderConfirmationEmail(order: {
  id: string;
  customer_email: string;
  total: number;
  order_items?: Array<{ product_name: string; quantity: number; price: number }>;
}) {
  const settings = await getStoreSettings();
  if (!settings.notifications.order_confirmation) return;

  const storeName = settings.store.name || "Briclix";
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

  const storeName = settings.store.name || "Briclix";
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
      <p>View in admin: ${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}</p>
    `,
  });
}
