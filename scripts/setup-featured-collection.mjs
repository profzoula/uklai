/**
 * Create "featured" collection and link products marked featured=true.
 * Usage: npm run setup:featured
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: collection, error: colError } = await supabase
  .from("collections")
  .upsert(
    {
      name: "Featured Products",
      slug: "featured",
      description:
        "Curated products shown on the homepage Featured Products section.",
      active: true,
    },
    { onConflict: "slug" }
  )
  .select("id")
  .single();

if (colError) {
  console.error("Collection error:", colError.message);
  process.exit(1);
}

console.log("✓ Featured Products collection ready");

const { data: featuredProducts } = await supabase
  .from("products")
  .select("id, name")
  .eq("featured", true)
  .eq("active", true)
  .order("created_at", { ascending: false });

if (!featuredProducts?.length) {
  console.log("No featured products to link.");
  process.exit(0);
}

const links = featuredProducts.map((p, index) => ({
  collection_id: collection.id,
  product_id: p.id,
  sort_order: index,
}));

const { error: linkError } = await supabase
  .from("collection_products")
  .upsert(links, { onConflict: "collection_id,product_id" });

if (linkError) {
  console.error("Link error:", linkError.message);
  process.exit(1);
}

featuredProducts.forEach((p, i) =>
  console.log(`  ${i + 1}. ${p.name.slice(0, 50)}`)
);
console.log(`\nLinked ${featuredProducts.length} products to featured collection.`);
