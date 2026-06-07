import { getAttributes } from "@/lib/admin-data";
import { NextResponse } from "next/server";

export async function GET() {
  const attributes = await getAttributes();
  return NextResponse.json(attributes);
}
