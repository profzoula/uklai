import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { direction } = await request.json();
  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  }

  const { data: categories, error: listError } = await supabase
    .from("categories")
    .select("id, sort_order")
    .order("sort_order");

  if (listError || !categories) {
    return NextResponse.json({ error: listError?.message ?? "Failed" }, { status: 500 });
  }

  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= categories.length) {
    return NextResponse.json({ success: true });
  }

  const current = categories[index];
  const neighbor = categories[swapIndex];

  const { error: e1 } = await supabase
    .from("categories")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", current.id);

  const { error: e2 } = await supabase
    .from("categories")
    .update({ sort_order: current.sort_order })
    .eq("id", neighbor.id);

  if (e1 || e2) {
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
