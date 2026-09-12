import { NextResponse } from "next/server";
import { calculateCelestialPositions } from "@/lib/profiling/astrology/chartCalculator";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { birthDate, birthTime = "12:00", city = "Addis Ababa" } = body;

    if (!birthDate) {
      return NextResponse.json({ error: "birthDate is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const chart = calculateCelestialPositions(birthDate, birthTime, city);

    return NextResponse.json({
      success: true,
      data: chart,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate natal chart" }, { status: 500 });
  }
}
