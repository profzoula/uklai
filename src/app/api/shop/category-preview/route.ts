import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ products: [] });
  }

  const products = await getProducts({ categorySlug: slug, limit: 8 });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: product.image_url,
      price: product.price,
      compare_at_price: product.compare_at_price,
    })),
  });
}
