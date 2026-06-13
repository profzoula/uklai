import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SavedShippingAddress } from "@/types/database";

function normalizeAddress(body: Partial<SavedShippingAddress>) {
  return {
    shipping_name: body.shipping_name?.trim() ?? "",
    shipping_address: body.shipping_address?.trim() ?? "",
    shipping_city: body.shipping_city?.trim() ?? "",
    shipping_state: body.shipping_state?.trim() ?? "",
    shipping_zip: body.shipping_zip?.trim() ?? "",
    shipping_country: body.shipping_country?.trim() || "US",
  };
}

function validateAddress(address: ReturnType<typeof normalizeAddress>) {
  const required: (keyof typeof address)[] = [
    "shipping_name",
    "shipping_address",
    "shipping_city",
    "shipping_state",
    "shipping_zip",
  ];

  for (const field of required) {
    if (!address[field]) {
      return "Please fill in all required address fields.";
    }
  }

  return null;
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SavedShippingAddress>;
  const address = normalizeAddress(body);
  const validationError = validateAddress(address);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select(
      "shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country"
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Could not save address." },
      { status: 500 }
    );
  }

  return NextResponse.json({ address: data });
}
