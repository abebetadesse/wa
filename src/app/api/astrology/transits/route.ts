import { NextResponse } from "next/server";
import { calculateCelestialPositions } from "@/lib/profiling/astrology/chartCalculator";
import { localDateString } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

/**
 * Today's sky. With `birthDate` (and optionally `birthTime`, `city`) the response also lists the
 * transits to that person's natal chart; without it there is no chart to measure against.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const birthDate = searchParams.get("birthDate");
    const city = searchParams.get("city") || "Addis Ababa";
    const today = localDateString();
    const sky = calculateCelestialPositions(today, "12:00", city);

    const natal = birthDate ? calculateCelestialPositions(birthDate, searchParams.get("birthTime") || "12:00", city) : null;

    return NextResponse.json({
      success: true,
      currentDate: today,
      transits: natal ? natal.transits : [],
      planets: sky.planets,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch current transits" }, { status: 500 });
  }
}
