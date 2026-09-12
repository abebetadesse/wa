import { NextRequest, NextResponse } from "next/server";
import { ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { foods } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
    const pattern = query ? `%${query.replace(/[%_]/g, "\\$&")}%` : undefined;
    const rows = await db
      .select()
      .from(foods)
      .where(pattern ? or(
        ilike(foods.name, pattern),
        ilike(foods.nameAmharic, pattern),
        ilike(foods.category, pattern),
        ilike(foods.traditionalPreparation, pattern)
      ) : undefined)
      .limit(100);

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows,
      source: "EFCT 2025 database projection",
    }, { headers: { "Cache-Control": query ? "private, max-age=30, stale-while-revalidate=60" : "public, max-age=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Foods API error:", error);
    return NextResponse.json({ success: false, error: "Food knowledge is temporarily unavailable." }, { status: 503 });
  }
}
