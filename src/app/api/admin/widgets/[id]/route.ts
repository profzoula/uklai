import { NextResponse } from "next/server";
import { adminUnavailable, getAdminSupabase } from "@/lib/admin-api";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params;
  const supabase = await getAdminSupabase();
  if (!supabase) return adminUnavailable();

  const { error } = await supabase.from("widgets").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
