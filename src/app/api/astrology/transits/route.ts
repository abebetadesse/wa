import { NextResponse } from "next/server";
import { calculateCelestialPositions } from "@/lib/profiling/astrology/chartCalculator";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET(req: Request) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const chart = calculateCelestialPositions(today, "12:00", "Addis Ababa");

    return NextResponse.json({
      success: true,
      currentDate: today,
      transits: chart.transits,
      planets: chart.planets,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch current transits" }, { status: 500 });
  }
}
