import { NextResponse } from "next/server";
import { AWUDE_NEGEST_60_CATEGORIES } from "@/lib/cultural/awudeNegestEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET() {
  return NextResponse.json({
    success: true,
    totalCategories: AWUDE_NEGEST_60_CATEGORIES.length,
    categories: AWUDE_NEGEST_60_CATEGORIES,
    disclaimer: PLATFORM_DISCLAIMERS.awudeNegest,
  });
}
