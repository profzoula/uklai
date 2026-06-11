/**
 * ONE-TIME migration: copy essential catalog data from legacy Supabase tables
 * (product, product_description, product_image, category_description, …)
 * into UKLAI tables (categories, products, collection_products).
 *
 * UKLAI storefront NEVER reads legacy tables at runtime — only this script does.
 *
 * Usage: npm run migrate:legacy
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

/** Legacy collection codes → UKLAI collection slugs */
const COLLECTION_MAP = {
  Recommended: "best-sellers",
  "best-deals": "deal-of-the-day",
  saveup: "deal-of-the-day",
  homepage: "featured",
  featured: "featured",
  "new-arrivals": "new-arrivals",
  "deal-of-the-day": "deal-of-the-day",
};

/** Legacy category slugs that are marketing pages, not product categories */
const SKIP_CATEGORY_SLUGS = new Set(["best-deals", "featured"]);

function editorJsToText(raw) {
  if (!raw) return "";
  if (!raw.trim().startsWith("[")) {
    return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  try {
    const blocks = JSON.parse(raw);
    const parts = [];
    for (const row of blocks) {
      for (const col of row.columns ?? []) {
        for (const block of col.data?.blocks ?? []) {
          if (block.type === "paragraph" && block.data?.text) {
            parts.push(block.data.text.replace(/<[^>]+>/g, " "));
          }
          if (block.type === "list" && block.data?.items) {
            parts.push(...block.data.items.map((i) => i.replace(/<[^>]+>/g, " ")));
          }
        }
      }
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return raw.slice(0, 500);
  }
}

function resolveImageUrl(imageUrl, supabaseUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/assets/")) {
    const rel = imageUrl.replace(/^\/assets\//, "");
    return `${supabaseUrl}/storage/v1/object/public/media/${rel}`;
  }
  return imageUrl;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function loadLegacyCatalog() {
  const [
    { data: legacyProducts, error: legacyErr },
    { data: descriptions },
    { data: images },
    { data: inventories },
    { data: catDescriptions },
    { data: legacyCategories },
    { data: productCollections },
  ] = await Promise.all([
    supabase.from("product").select("*"),
    supabase.from("product_description").select("*"),
    supabase.from("product_image").select("*").order("is_main", { ascending: false }),
    supabase.from("product_inventory").select("*"),
    supabase.from("category_description").select("*"),
    supabase.from("category").select("category_id, position, status, include_in_nav"),
    supabase.from("product_collection").select("product_id, collection(code)"),
  ]);

  if (legacyErr) {
    console.log("No legacy catalog tables found — skipping migration.");
    return null;
  }

  if (!legacyProducts?.length) {
    console.log("Legacy catalog is empty — nothing to migrate.");
    return null;
  }

  const legacyCategoryMeta = new Map(
    (legacyCategories ?? []).map((c) => [c.category_id, c])
  );

  return {
    legacyProducts,
    descriptions: descriptions ?? [],
    images: images ?? [],
    inventories: inventories ?? [],
    catDescriptions: catDescriptions ?? [],
    legacyCategoryMeta,
    productCollections: productCollections ?? [],
  };
}

async function migrateCategories(legacy) {
  const { catDescriptions, legacyCategoryMeta } = legacy;

  const sorted = [...catDescriptions]
    .filter((c) => c.url_key && !SKIP_CATEGORY_SLUGS.has(c.url_key))
    .sort((a, b) => {
      const pa = legacyCategoryMeta.get(a.category_description_category_id)?.position;
      const pb = legacyCategoryMeta.get(b.category_description_category_id)?.position;
      return (pa ?? 999) - (pb ?? 999);
    });

  let migrated = 0;
  for (let i = 0; i < sorted.length; i++) {
    const cat = sorted[i];
    const meta = legacyCategoryMeta.get(cat.category_description_category_id);
    if (meta && meta.status === false) continue;

    const description =
      editorJsToText(cat.description) ||
      cat.meta_description ||
      cat.short_description ||
      null;

    const { error } = await supabase.from("categories").upsert(
      {
        slug: cat.url_key,
        name: cat.name,
        description,
        image_url: resolveImageUrl(cat.image, supabaseUrl),
        sort_order: meta?.position ?? i + 10,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`Category ${cat.url_key}:`, error.message);
    } else {
      migrated++;
      console.log(`✓ category: ${cat.name} (${cat.url_key})`);
    }
  }

  console.log(`Migrated ${migrated} categories.\n`);
}

async function migrateProducts(legacy) {
  const {
    legacyProducts,
    descriptions,
    images,
    inventories,
    catDescriptions,
    productCollections,
  } = legacy;

  const descByProductId = new Map(
    descriptions.map((d) => [d.product_description_product_id, d])
  );
  const invByProductId = new Map(
    inventories.map((i) => [i.product_inventory_product_id, i])
  );
  const catByLegacyId = new Map(
    catDescriptions.map((c) => [c.category_description_category_id, c])
  );

  const imagesByProductId = new Map();
  for (const img of images) {
    const pid = img.product_image_product_id;
    if (!imagesByProductId.has(pid)) imagesByProductId.set(pid, []);
    imagesByProductId.get(pid).push(img);
  }

  const collectionLinksByLegacyId = new Map();
  for (const link of productCollections) {
    const ukSlug = COLLECTION_MAP[link.collection?.code];
    if (!ukSlug) continue;
    if (!collectionLinksByLegacyId.has(link.product_id)) {
      collectionLinksByLegacyId.set(link.product_id, new Set());
    }
    collectionLinksByLegacyId.get(link.product_id).add(ukSlug);
  }

  const [{ data: ukCategories }, { data: ukCollections }, { data: existingProducts }] =
    await Promise.all([
      supabase.from("categories").select("id, slug"),
      supabase.from("collections").select("id, slug"),
      supabase.from("products").select("id, slug"),
    ]);

  const categoryBySlug = new Map((ukCategories ?? []).map((c) => [c.slug, c.id]));
  const collectionBySlug = new Map((ukCollections ?? []).map((c) => [c.slug, c.id]));
  const existingSlugs = new Set((existingProducts ?? []).map((p) => p.slug));

  let imported = 0;
  let reassigned = 0;
  let skipped = 0;
  const collectionLinks = [];
  const errors = [];

  for (const legacy of legacyProducts) {
    if (!legacy.status || !legacy.visibility) continue;

    const desc = descByProductId.get(legacy.product_id);
    if (!desc?.name) continue;

    const slug = desc.url_key || `product-${legacy.product_id}`;
    const catDesc = catByLegacyId.get(legacy.category_id);
    const categorySlug =
      catDesc && !SKIP_CATEGORY_SLUGS.has(catDesc.url_key)
        ? catDesc.url_key
        : null;
    const category_id = categorySlug ? categoryBySlug.get(categorySlug) ?? null : null;

    if (existingSlugs.has(slug)) {
      if (category_id) {
        const { error } = await supabase
          .from("products")
          .update({ category_id, updated_at: new Date().toISOString() })
          .eq("slug", slug);
        if (!error) reassigned++;
      }
      skipped++;
      continue;
    }

    const productImages = imagesByProductId.get(legacy.product_id) ?? [];
    const mainImage =
      productImages.find((i) => i.is_main) ?? productImages[0] ?? null;
    const image_url = resolveImageUrl(mainImage?.origin_image, supabaseUrl);
    const gallery_urls = productImages
      .map((i) => resolveImageUrl(i.origin_image, supabaseUrl))
      .filter(Boolean);

    const inv = invByProductId.get(legacy.product_id);
    const stock = inv?.qty ?? 50;

    const textDescription =
      editorJsToText(desc.description) ||
      desc.meta_description ||
      desc.short_description ||
      desc.name;

    const price = Number(legacy.special_price ?? legacy.price);
    const compare_at_price =
      legacy.special_price != null && Number(legacy.price) > Number(legacy.special_price)
        ? Number(legacy.price)
        : null;

    const inFeatured = collectionLinksByLegacyId
      .get(legacy.product_id)
      ?.has("featured");

    const { data: inserted, error } = await supabase
      .from("products")
      .insert({
        name: desc.name.slice(0, 200),
        slug,
        description: textDescription.slice(0, 4000),
        price,
        compare_at_price,
        image_url,
        gallery_urls,
        category_id,
        stock,
        sku: legacy.sku,
        active: true,
        featured: !!inFeatured,
        badge: compare_at_price ? "Deal" : null,
        rating: 4.5,
        review_count: Math.floor(Math.random() * 80) + 20,
        product_type: legacy.digital_file_url ? "digital" : "physical",
        digital_file_url: legacy.digital_file_url,
        meta_title: desc.meta_title,
        meta_description: desc.meta_description,
        updated_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single();

    if (error) {
      errors.push(`${desc.name}: ${error.message}`);
      continue;
    }

    imported++;
    existingSlugs.add(slug);
    console.log(`✓ product: ${desc.name.slice(0, 55)}… — $${price}`);

    const ukCollectionSlugs =
      collectionLinksByLegacyId.get(legacy.product_id) ?? new Set(["new-arrivals"]);
    for (const colSlug of ukCollectionSlugs) {
      const collection_id = collectionBySlug.get(colSlug);
      if (collection_id) {
        collectionLinks.push({ collection_id, product_id: inserted.id });
      }
    }
  }

  if (collectionLinks.length) {
    const { error: linkErr } = await supabase.from("collection_products").upsert(
      collectionLinks,
      { onConflict: "collection_id,product_id", ignoreDuplicates: true }
    );
    if (linkErr) errors.push(`collection links: ${linkErr.message}`);
    else console.log(`Linked ${collectionLinks.length} collection assignments.`);
  }

  console.log(
    `\nProducts: ${imported} imported, ${reassigned} categories updated, ${skipped} already existed.`
  );

  if (errors.length) {
    console.error("Errors:");
    errors.forEach((e) => console.error(" -", e));
    process.exit(1);
  }
}

console.log("UKLAI legacy catalog migration (one-time extract, no EverShop runtime)\n");

const legacy = await loadLegacyCatalog();
if (!legacy) {
  process.exit(0);
}

await migrateCategories(legacy);
await migrateProducts(legacy);

const { count: catCount } = await supabase
  .from("categories")
  .select("*", { count: "exact", head: true });
const { count: prodCount } = await supabase
  .from("products")
  .select("*", { count: "exact", head: true })
  .eq("active", true);

console.log(`\nStore ready: ${catCount} categories, ${prodCount} active products.`);
console.log("Done — UKLAI uses only categories + products tables going forward.");
