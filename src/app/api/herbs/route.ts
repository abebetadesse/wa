import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { herbs } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
    const rows = await db.select().from(herbs);
    const filtered = query
      ? rows.filter((herb) => [herb.nameVernacular, herb.nameScientific, herb.nameAmharic, herb.traditionalUses, herb.primaryPartsUsed].filter(Boolean).some((value) => value!.toLowerCase().includes(query)))
      : rows;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered.slice(0, 100),
      source: "ETM-DB knowledge projection",
    });
  } catch (error) {
    console.error("Herbs API error:", error);
    return NextResponse.json({ success: false, error: "Herbal knowledge is temporarily unavailable." }, { status: 503 });
  }
}
