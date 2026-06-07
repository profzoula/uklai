import { NextResponse } from "next/server";
import { getAllProductsAdmin } from "@/lib/data";

export async function GET() {
  const products = await getAllProductsAdmin();
  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku ?? null,
      price: p.price,
      image_url: p.image_url,
    }))
  );
}
