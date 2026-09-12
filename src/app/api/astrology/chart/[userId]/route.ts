import { NextResponse } from "next/server";
import { calculateCelestialPositions } from "@/lib/profiling/astrology/chartCalculator";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    // Preset fallback if user id is requested
    const defaultDate = "1985-06-15";
    const chart = calculateCelestialPositions(defaultDate, "14:30", "Addis Ababa");

    return NextResponse.json({
      success: true,
      userId,
      data: chart,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve user chart" }, { status: 500 });
  }
}
