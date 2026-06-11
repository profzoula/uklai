/**
 * Import legacy EverShop orders (order, order_item, order_address)
 * into UKLAI orders + order_items tables.
 *
 * Usage: npm run migrate:orders
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");

function mapOrderStatus(order) {
  if (order.status === "canceled" || order.payment_status === "canceled") {
    return "cancelled";
  }
  if (order.payment_status === "stripe_failed" || order.status === "new") {
    return "cancelled";
  }
  if (order.shipment_status === "delivered") return "delivered";
  if (order.shipment_status === "shipped") return "shipped";
  if (order.status === "processing") return "processing";
  if (
    order.payment_status === "paid" ||
    order.payment_status === "stripe_succeeded"
  ) {
    return "paid";
  }
  return "pending";
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const [
  { data: legacyOrders, error: legacyErr },
  { data: legacyItems },
  { data: legacyAddresses },
  { data: legacyProducts },
  { data: legacyDescriptions },
  { data: shipments },
  { data: ukProducts },
  { data: existingOrders },
] = await Promise.all([
  supabase.from("order").select("*").order("created_at", { ascending: false }),
  supabase.from("order_item").select("*"),
  supabase.from("order_address").select("*"),
  supabase.from("product").select("product_id, uuid, sku"),
  supabase.from("product_description").select(
    "product_description_product_id, url_key, name"
  ),
  supabase.from("shipment").select("shipment_order_id, carrier, tracking_number"),
  supabase.from("products").select("id, slug, sku"),
  supabase.from("orders").select("stripe_session_id"),
]);

if (legacyErr) {
  console.log("No legacy order table — nothing to migrate.");
  process.exit(0);
}

if (!legacyOrders?.length) {
  console.log("Legacy orders table is empty.");
  process.exit(0);
}

const existingLegacyIds = new Set(
  (existingOrders ?? [])
    .map((o) => o.stripe_session_id)
    .filter((id) => id?.startsWith("legacy:order-"))
);

const descByProductId = new Map(
  (legacyDescriptions ?? []).map((d) => [d.product_description_product_id, d])
);
const slugToUkId = new Map((ukProducts ?? []).map((p) => [p.slug, p.id]));
const skuToUkId = new Map(
  (ukProducts ?? []).filter((p) => p.sku).map((p) => [p.sku, p.id])
);

function resolveUkProductId(legacyProductId) {
  const legacy = (legacyProducts ?? []).find(
    (p) => p.product_id === legacyProductId
  );
  const desc = descByProductId.get(legacyProductId);
  if (desc?.url_key && slugToUkId.has(desc.url_key)) {
    return slugToUkId.get(desc.url_key);
  }
  if (legacy?.sku && skuToUkId.has(legacy.sku)) {
    return skuToUkId.get(legacy.sku);
  }
  return null;
}

const addressById = new Map(
  (legacyAddresses ?? []).map((a) => [a.order_address_id, a])
);
const shipmentByOrderId = new Map(
  (shipments ?? []).map((s) => [s.shipment_order_id, s])
);
const itemsByOrderId = new Map();
for (const item of legacyItems ?? []) {
  const orderId = item.order_item_order_id;
  if (!itemsByOrderId.has(orderId)) itemsByOrderId.set(orderId, []);
  itemsByOrderId.get(orderId).push(item);
}

let imported = 0;
let skipped = 0;
const errors = [];

for (const legacy of legacyOrders) {
  const legacyKey = `legacy:order-${legacy.order_number}`;
  if (existingLegacyIds.has(legacyKey)) {
    skipped++;
    continue;
  }

  const shipping = addressById.get(legacy.shipping_address_id);
  const shipment = shipmentByOrderId.get(legacy.order_id);
  const status = mapOrderStatus(legacy);

  const { data: inserted, error: orderError } = await supabase
    .from("orders")
    .insert({
      stripe_session_id: legacyKey,
      status,
      total: Number(legacy.grand_total),
      subtotal: legacy.sub_total_incl_tax ?? legacy.sub_total,
      tax_amount: legacy.total_tax_amount ?? legacy.tax_amount,
      discount_amount: legacy.discount_amount ?? 0,
      coupon_code: legacy.coupon,
      customer_email: legacy.customer_email,
      shipping_name: shipping?.full_name ?? legacy.customer_full_name,
      shipping_address: [shipping?.address_1, shipping?.address_2]
        .filter(Boolean)
        .join(", "),
      shipping_city: shipping?.city ?? null,
      shipping_state: shipping?.province?.replace(/^US-/, "") ?? null,
      shipping_zip: shipping?.postcode ?? null,
      shipping_country: shipping?.country ?? "US",
      tracking_number: shipment?.tracking_number ?? null,
      tracking_carrier: shipment?.carrier ?? null,
      admin_notes: `Imported from legacy order #${legacy.order_number}`,
      created_at: legacy.created_at,
      updated_at: legacy.updated_at,
    })
    .select("id")
    .single();

  if (orderError) {
    errors.push(`Order #${legacy.order_number}: ${orderError.message}`);
    continue;
  }

  const lineItems = itemsByOrderId.get(legacy.order_id) ?? [];
  if (lineItems.length) {
    const rows = lineItems.map((item) => ({
      order_id: inserted.id,
      product_id: resolveUkProductId(item.product_id),
      product_name: item.product_name,
      product_image: item.thumbnail,
      quantity: item.qty,
      price: Number(item.final_price_incl_tax ?? item.final_price),
      created_at: legacy.created_at,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(rows);

    if (itemsError) {
      errors.push(`Order #${legacy.order_number} items: ${itemsError.message}`);
    }
  }

  imported++;
  console.log(
    `✓ #${legacy.order_number} — ${legacy.customer_email} — $${legacy.grand_total} (${status})`
  );
}

console.log(`\nImported ${imported} orders (${skipped} already existed).`);
if (errors.length) {
  console.error("Errors:");
  errors.forEach((e) => console.error(" -", e));
  process.exit(1);
}

const { count } = await supabase
  .from("orders")
  .select("*", { count: "exact", head: true });
console.log(`Total orders in UKLAI admin: ${count}`);
console.log("Done.");
