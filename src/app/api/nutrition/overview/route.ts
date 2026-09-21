import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { foods, foodNutrients, nutrients } from "@/lib/db/schema";

const RADAR_NUTRIENTS = ["Protein", "Iron", "Zinc", "Calcium", "Vitamin A", "Vitamin C"] as const;

/**
 * Computes a real, database-derived nutrient coverage summary from the seeded
 * Ethiopian Food Composition Table data, instead of hardcoded marketing numbers.
 */
export async function GET() {
  try {
    const rows = await db
      .select({
        foodName: foods.name,
        nutrientName: nutrients.name,
        amountPer100g: foodNutrients.amountPer100g,
        rdaBase: nutrients.rdaBase,
      })
      .from(foodNutrients)
      .innerJoin(foods, eq(foodNutrients.foodId, foods.id))
      .innerJoin(nutrients, eq(foodNutrients.nutrientId, nutrients.id));

    if (!rows.length) {
      return NextResponse.json({ success: false, error: "No nutrient data seeded yet." }, { status: 503 });
    }

    const byNutrient = new Map<string, { foodName: string; pctRda: number }[]>();
    for (const row of rows) {
      const rdaBase = Number(row.rdaBase);
      if (!rdaBase) continue;
      const pctRda = (Number(row.amountPer100g) / rdaBase) * 100;
      const list = byNutrient.get(row.nutrientName) || [];
      list.push({ foodName: row.foodName, pctRda });
      byNutrient.set(row.nutrientName, list);
    }

    const radar = RADAR_NUTRIENTS.map((name) => {
      const entries = byNutrient.get(name) || [];
      if (!entries.length) return 0;
      const avg = entries.reduce((sum, e) => sum + e.pctRda, 0) / entries.length;
      return Math.round(Math.min(100, avg));
    });

    const ticker = RADAR_NUTRIENTS.map((name) => {
      const entries = byNutrient.get(name) || [];
      if (!entries.length) return null;
      const top = entries.reduce((best, e) => (e.pctRda > best.pctRda ? e : best));
      return `${name} • ${top.foodName} covers ${Math.round(Math.min(100, top.pctRda))}% RDA per 100g`;
    }).filter((line): line is string => Boolean(line));

    return NextResponse.json(
      {
        success: true,
        radar: { indicators: RADAR_NUTRIENTS, values: radar },
        ticker,
        foodCount: new Set(rows.map((r) => r.foodName)).size,
        nutrientCount: byNutrient.size,
        source: "EFCT 2025 Ethiopian Food Composition Table (seeded database)",
      },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
    );
  } catch (error) {
    console.error("Nutrition overview API error:", error);
    return NextResponse.json({ success: false, error: "Nutrition database overview is temporarily unavailable." }, { status: 503 });
  }
}
