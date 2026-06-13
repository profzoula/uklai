import { NextResponse } from "next/server";
import { getDataSupabase } from "@/lib/supabase/server-data";
import { resolveCartLines } from "@/lib/checkout-validate";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    items?: Array<{
      productId: string;
      variantId?: string | null;
      variantLabel?: string | null;
      quantity: number;
    }>;
  };

  if (!body.items?.length) {
    return NextResponse.json({ items: [] });
  }

  const supabase = await getDataSupabase();
  if (!supabase) {
    return NextResponse.json({ items: [] });
  }

  const result = await resolveCartLines(supabase, body.items);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ items: result.items });
}
