import { NextResponse } from "next/server";
import { calculatePersonalizedHoroscope } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const birthDate = searchParams.get("birthDate") || "1985-06-15";
    const birthTime = searchParams.get("birthTime") || "14:30";
    const city = searchParams.get("city") || "Addis Ababa";

    const horoscope = calculatePersonalizedHoroscope(birthDate, birthTime, city, "daily");

    return NextResponse.json({
      success: true,
      data: horoscope,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate daily horoscope" }, { status: 500 });
  }
}
