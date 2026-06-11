import { NextResponse } from "next/server";
import { getAuthorizedAdminSupabase } from "@/lib/admin-api";

type BulkAction = "deactivate" | "activate" | "delete";

export async function POST(request: Request) {
  const { supabase, error } = await getAuthorizedAdminSupabase();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ error: "Supabase unavailable" }, { status: 503 });
  }

  let body: { ids?: string[]; action?: BulkAction };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = body.ids?.filter(Boolean) ?? [];
  const action = body.action;

  if (!ids.length) {
    return NextResponse.json({ error: "No products selected" }, { status: 400 });
  }

  if (!action || !["deactivate", "activate", "delete"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "delete") {
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .in("id", ids);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: ids.length });
  }

  const active = action === "activate";
  const { error: updateError } = await supabase
    .from("products")
    .update({ active, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: ids.length });
}
