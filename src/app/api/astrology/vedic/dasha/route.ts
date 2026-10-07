import { NextResponse } from "next/server";
import { calculateLahiriAyanamsha, calculateVimshottariDasha, tropicalToSidereal } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { calculateCelestialPositions } from "@/lib/profiling/astrology/chartCalculator";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const birthDate = searchParams.get("birthDate") || "1985-06-15";
    const birthTime = searchParams.get("birthTime") || "14:30";
    const city = searchParams.get("city") || "Addis Ababa";

    const positions = calculateCelestialPositions(birthDate, birthTime, city);
    const ayanamsha = calculateLahiriAyanamsha(birthDate);
    const moonTropical = positions.planets.find((p) => p.planet === "Moon")?.totalLongitude || 0;
    const moonSidereal = tropicalToSidereal(moonTropical, ayanamsha);

    const dashas = calculateVimshottariDasha(birthDate, moonSidereal, birthTime, positions.place.utcOffsetHours);

    return NextResponse.json({
      success: true,
      birthDate,
      dashas,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate Dasha periods" }, { status: 500 });
  }
}
