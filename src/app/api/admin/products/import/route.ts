import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";
import { createServiceClient } from "@/lib/supabase/service";
import { parseProductsCsv } from "@/lib/product-csv";
import { getAllCategoriesAdmin } from "@/lib/data";

export async function POST(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file required." }, { status: 400 });
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseProductsCsv(text);

  if (!rows.length) {
    return NextResponse.json(
      { error: parseErrors[0] ?? "No valid rows in CSV." },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Service client unavailable." }, { status: 503 });
  }

  const categories = await getAllCategoriesAdmin();
  const categoryBySlug = new Map(categories.map((c) => [c.slug.toLowerCase(), c.id]));

  let imported = 0;
  const errors = [...parseErrors];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const category_id = row.category_slug
      ? categoryBySlug.get(row.category_slug.toLowerCase()) ?? null
      : null;

    if (row.category_slug && !category_id) {
      errors.push(`Row ${i + 2}: unknown category_slug "${row.category_slug}"`);
    }

    const { error } = await service.from("products").upsert(
      {
        name: row.name,
        slug: row.slug,
        price: row.price,
        compare_at_price: row.compare_at_price,
        description: row.description,
        stock: row.stock,
        category_id,
        sku: row.sku,
        product_type: row.product_type,
        digital_file_url: row.digital_file_url,
        image_url: row.image_url,
        active: row.active,
        featured: row.featured,
        badge: row.badge,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (error) {
      errors.push(`Row ${i + 2} (${row.name}): ${error.message}`);
    } else {
      imported++;
    }
  }

  return NextResponse.json({
    success: imported > 0,
    imported,
    failed: rows.length - imported,
    errors: errors.slice(0, 20),
  });
}
