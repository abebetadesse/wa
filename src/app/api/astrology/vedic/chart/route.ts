import { NextResponse } from "next/server";
import { calculateVedicChart } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { birthDate, birthTime = "12:00", city = "Addis Ababa" } = body;

    if (!birthDate) {
      return NextResponse.json({ error: "birthDate is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const vedicChart = calculateVedicChart(birthDate, birthTime, city);

    return NextResponse.json({
      success: true,
      data: vedicChart,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate Vedic chart" }, { status: 500 });
  }
}
