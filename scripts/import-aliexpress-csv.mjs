/**
 * Import AliExpress wishlist CSV export into UKLAI products table.
 * Usage: node scripts/import-aliexpress-csv.mjs "path/to/file.csv"
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

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parsePrice(raw) {
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) ? null : n;
}

function parseSaveAmount(raw) {
  if (!raw) return null;
  const m = String(raw).match(/Save\s*\$?([\d.]+)/i);
  if (m) return parseFloat(m[1]);
  const off = String(raw).match(/\$([\d.]+)\s*off/i);
  if (off) return parseFloat(off[1]);
  return null;
}

function pickImage(row) {
  const candidates = [row.image, row.title3].filter(Boolean);
  for (const url of candidates) {
    if (!url.startsWith("http")) continue;
    if (/\/\d+x\d+\./.test(url) && !url.includes("ae-pic")) continue;
    return url.replace(/\/\d+x\d+\./, "/800x800.");
  }
  for (const url of candidates) {
    if (url.startsWith("http")) return url;
  }
  return null;
}

function guessCategory(title) {
  const t = title.toLowerCase();
  if (/laptop|notebook|pc gamer|computer|intel core|windows 11/.test(t)) {
    return "electronics";
  }
  if (/chair|ergonomic|gaming chair|office chair|lumbar/.test(t)) {
    return "home-living";
  }
  if (/ram|memory|ddr|card reader|usb|hub|docking|sd tf|cardreader/.test(t)) {
    return "electronics";
  }
  return "accessories";
}

function parseSoldCount(raw) {
  if (!raw) return 0;
  const m = String(raw).match(/([\d.]+)\s*k?\s*sold/i);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  if (/k/i.test(raw)) n *= 1000;
  return Math.round(n);
}

function parseRating(raw) {
  if (!raw) return null;
  const n = parseFloat(String(raw));
  return Number.isNaN(n) || n < 1 || n > 5 ? null : n;
}

function parseAliExpressCsv(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const headers = parseCsvLine(lines[0]);
  const idx = (name) => headers.indexOf(name);

  const products = [];
  const usedSlugs = new Set();

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const get = (name) => {
      const j = idx(name);
      return j >= 0 ? cells[j]?.trim() ?? "" : "";
    };

    const title = get("title");
    const price = parsePrice(get("price"));
    if (!title || price == null) continue;

    const save =
      parseSaveAmount(get("data")) ??
      parseSaveAmount(get("data4")) ??
      parseSaveAmount(get("data3"));

    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `product-${i}`;
    let slug = baseSlug;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${n++}`;
    }
    usedSlugs.add(slug);

    const sold = parseSoldCount(get("data2"));
    const rating = parseRating(get("data3"));
    const image_url = pickImage({ image: get("image"), title3: get("title3") });
    const category_slug = guessCategory(title);

    const descriptionParts = [title];
    if (sold > 0) descriptionParts.push(`${sold}+ sold on AliExpress.`);
    if (rating) descriptionParts.push(`Rating: ${rating}/5.`);

    products.push({
      name: title.slice(0, 200),
      slug,
      price,
      compare_at_price: save ? Math.round((price + save) * 100) / 100 : null,
      description: descriptionParts.join(" "),
      stock: 50,
      image_url,
      category_slug,
      active: true,
      featured: i <= 4,
      badge: save ? "Deal" : null,
      rating: rating ?? 4.5,
      review_count: sold || Math.floor(Math.random() * 50) + 10,
      product_type: "physical",
    });
  }

  return products;
}

const csvPath =
  process.argv[2] ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "aliexpress-com-2026-06-10.csv");

if (!fs.existsSync(csvPath)) {
  console.error("CSV not found:", csvPath);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const csvText = fs.readFileSync(csvPath, "utf8");
const products = parseAliExpressCsv(csvText);
console.log(`Parsed ${products.length} products from ${path.basename(csvPath)}`);

const { data: categories } = await supabase.from("categories").select("id, slug");
const categoryBySlug = new Map((categories ?? []).map((c) => [c.slug, c.id]));

let imported = 0;
const errors = [];

for (const p of products) {
  const category_id = categoryBySlug.get(p.category_slug) ?? null;
  const { category_slug: _cs, ...row } = p;

  const { error } = await supabase.from("products").upsert(
    {
      ...row,
      category_id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );

  if (error) {
    errors.push(`${p.name}: ${error.message}`);
  } else {
    imported++;
    console.log(`✓ ${p.name.slice(0, 60)}… — $${p.price}`);
  }
}

console.log(`\nImported ${imported}/${products.length} products.`);
if (errors.length) {
  console.error("Errors:");
  errors.forEach((e) => console.error(" -", e));
  process.exit(1);
}

// Add to new-arrivals collection
const { data: collection } = await supabase
  .from("collections")
  .select("id")
  .eq("slug", "new-arrivals")
  .maybeSingle();

if (collection) {
  const { data: inserted } = await supabase
    .from("products")
    .select("id")
    .in(
      "slug",
      products.map((p) => p.slug)
    );

  if (inserted?.length) {
    await supabase.from("collection_products").upsert(
      inserted.map((p) => ({
        collection_id: collection.id,
        product_id: p.id,
      })),
      { onConflict: "collection_id,product_id", ignoreDuplicates: true }
    );
    console.log(`Linked ${inserted.length} products to new-arrivals collection.`);
  }
}

console.log("Done.");
