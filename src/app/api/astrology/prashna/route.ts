import { NextResponse } from "next/server";
import { generatePrashnaKundli } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, city = "Addis Ababa", latitude = 9.03, longitude = 38.74 } = body;

    if (!question) {
      return NextResponse.json({ error: "question is required for Prashna Kundli" }, { status: 400 });
    }

    const prashna = generatePrashnaKundli(question, city, latitude, longitude);

    return NextResponse.json({
      success: true,
      data: prashna,
      disclaimer: PLATFORM_DISCLAIMERS.astrology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate Prashna Kundli" }, { status: 500 });
  }
}
