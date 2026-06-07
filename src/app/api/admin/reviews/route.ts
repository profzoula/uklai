import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";
import { createServiceClient } from "@/lib/supabase/service";

async function syncProductRating(productId: string) {
  const supabase = createServiceClient();
  if (!supabase) return;

  const { data: reviews } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved");

  const count = reviews?.length ?? 0;
  const avg =
    count > 0
      ? reviews!.reduce((s, r) => s + r.rating, 0) / count
      : 0;

  await supabase
    .from("products")
    .update({
      rating: Math.round(avg * 10) / 10,
      review_count: count,
    })
    .eq("id", productId);
}

export async function PATCH(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { id, status } = await request.json();
  const valid = ["pending", "approved", "rejected"];

  if (!id || !status || !valid.includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: review } = await supabase
    .from("product_reviews")
    .select("product_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("product_reviews")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (review?.product_id) {
    await syncProductRating(review.product_id);
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const body = await request.json();

  const { error } = await supabase.from("product_reviews").insert({
    product_id: body.product_id,
    customer_name: body.customer_name,
    customer_email: body.customer_email || null,
    rating: Number(body.rating),
    title: body.title || null,
    body: body.body || null,
    status: body.status ?? "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data: review } = await supabase
    .from("product_reviews")
    .select("product_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("product_reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (review?.product_id) {
    await syncProductRating(review.product_id);
  }

  return NextResponse.json({ success: true });
}
