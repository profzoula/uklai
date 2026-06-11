/**
 * Add sort_order to collection_products (run once).
 * Usage: node scripts/add-collection-sort-order.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
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
loadEnvFile(".env.production");

const sql = `
ALTER TABLE collection_products
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
`;

const password = process.env.DB_PASSWORD;
if (password) {
  const client = new pg.Client({
    host: process.env.DB_HOST ?? "db.jhxkeceefalhdehmgitz.supabase.co",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    database: process.env.DB_NAME ?? "postgres",
    password,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("✓ sort_order column added via Postgres.");
} else {
  console.warn("DB_PASSWORD not set — trying Supabase REST only for verification.");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (url && key) {
  const supabase = createClient(url, key);
  const { error } = await supabase
    .from("collection_products")
    .select("sort_order")
    .limit(1);
  if (error?.message?.includes("sort_order")) {
    console.error(
      "Column missing. Run in Supabase SQL Editor:\n",
      sql.trim()
    );
    process.exit(1);
  }
  console.log("✓ collection_products.sort_order is available.");
}
