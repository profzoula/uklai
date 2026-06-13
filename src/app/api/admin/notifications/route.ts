import { NextResponse } from "next/server";
import { getAuthorizedAdminSupabase } from "@/lib/admin-api";
import { fetchAdminNotifications } from "@/lib/admin-notifications";

export async function GET() {
  const { supabase, error } = await getAuthorizedAdminSupabase();
  if (error) return error;
  if (!supabase) {
    return NextResponse.json({ items: [], count: 0, counts: { orders: 0, reviews: 0, returns: 0 } });
  }

  const payload = await fetchAdminNotifications(supabase);
  return NextResponse.json(payload);
}
