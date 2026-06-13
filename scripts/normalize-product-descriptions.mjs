/**
 * Normalize all product descriptions in Supabase to clean plain text.
 * Usage: npm run normalize:descriptions [-- --dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { normalizeProductDescription } from "../src/lib/format-product-description.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, slug, description")
  .order("name");

if (error) {
  console.error("Failed to fetch products:", error.message);
  process.exit(1);
}

let updated = 0;
let unchanged = 0;
let cleared = 0;
let failed = 0;

console.log(
  dryRun
    ? "DRY RUN — no database writes\n"
    : "Normalizing product descriptions...\n"
);

for (const product of products ?? []) {
  const before = product.description ?? "";
  const after = normalizeProductDescription(before);

  if (before === after) {
    unchanged++;
    continue;
  }

  console.log(`✓ ${product.name.slice(0, 60)}… (${product.slug})`);

  if (dryRun) {
    updated++;
    continue;
  }

  const { error: saveError } = await supabase
    .from("products")
    .update({
      description: after || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", product.id);

  if (saveError) {
    failed++;
    console.error(`  ✗ ${saveError.message}`);
  } else {
    updated++;
    if (!after && before.trim()) cleared++;
  }
}

console.log(
  `\nDone. ${updated} updated, ${unchanged} already clean, ${cleared} cleared, ${failed} failed (${products?.length ?? 0} total).`
);

if (failed) process.exit(1);
