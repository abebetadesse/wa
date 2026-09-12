import { NextResponse } from "next/server";
import { calculatePanchang } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const city = searchParams.get("city") || "Addis Ababa";

    const panchang = calculatePanchang(date, city);

    return NextResponse.json({
      success: true,
      date,
      city,
      data: panchang,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate Panchang" }, { status: 500 });
  }
}
