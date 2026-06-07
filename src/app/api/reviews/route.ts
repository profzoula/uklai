import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { product_id, rating, title, body: reviewBody } = body;

  if (!product_id || !rating) {
    return NextResponse.json(
      { error: "Product and rating are required." },
      { status: 400 }
    );
  }

  const r = Number(rating);
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to leave a review." },
      { status: 401 }
    );
  }

  const profile = await getProfile();

  const { error } = await supabase.from("product_reviews").insert({
    product_id,
    user_id: user.id,
    customer_name: profile?.full_name ?? user.email?.split("@")[0] ?? "Customer",
    customer_email: user.email,
    rating: r,
    title: title?.trim() || null,
    body: reviewBody?.trim() || null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Thank you! Your review will appear after moderation.",
  });
}
