import { NextResponse } from "next/server";
import { calculatePersonalCycles } from "@/lib/profiling/numerology/multiSystemNumerology";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const birthDate = searchParams.get("birthDate") || "1985-06-15";
    const targetDate = searchParams.get("targetDate") || new Date().toISOString().slice(0, 10);

    const cycles = calculatePersonalCycles(birthDate, targetDate);

    return NextResponse.json({
      success: true,
      data: {
        personalDay: cycles.personalDay,
        houseColor: cycles.houseColor,
        astrologicalHouseResonance: cycles.astrologicalHouseResonance,
        dailyAffirmation: cycles.dailyAffirmation,
        journalPrompt: cycles.journalPrompt,
        suggestedPacing: cycles.suggestedPacing,
      },
      disclaimer: PLATFORM_DISCLAIMERS.numerology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate personal day" }, { status: 500 });
  }
}
