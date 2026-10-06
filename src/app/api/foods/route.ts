import { NextRequest, NextResponse } from "next/server";
import { like, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { foods } from "@/lib/db/schema";
import { searchRawCerealMaterials } from "@/lib/nutrition/rawCerealMaterials";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
    const rawCereals = searchRawCerealMaterials(query ?? "");
    const pattern = query ? `%${query.replace(/[%_]/g, "\\$&")}%` : undefined;
    const rows = await db
      .select()
      .from(foods)
      .where(pattern ? or(
        like(foods.name, pattern),
        like(foods.nameAmharic, pattern),
        like(foods.category, pattern),
        like(foods.traditionalPreparation, pattern)
      ) : undefined)
      .limit(100);

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows,
      rawCereals,
      rawCerealCount: rawCereals.length,
      source: "Food database projection with indicative raw-cereal composition estimates; FoodData Central URLs are verification links, not direct citations",
    }, { headers: { "Cache-Control": query ? "private, max-age=30, stale-while-revalidate=60" : "public, max-age=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Foods API error:", error);
    return NextResponse.json({ success: false, error: "Food knowledge is temporarily unavailable." }, { status: 503 });
  }
}
