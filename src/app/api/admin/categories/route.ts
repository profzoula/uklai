import { getAllCategoriesAdmin } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = await getAllCategoriesAdmin();
  return NextResponse.json(categories);
}
