import { NextResponse } from "next/server";
import { analyzeCompatibility } from "@/lib/profiling/compatibility/compatibilityEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { person1, person2 } = body;

    if (!person1?.birthDate || !person2?.birthDate) {
      return NextResponse.json({ error: "birthDate is required for both profiles" }, { status: 400 });
    }

    const report = analyzeCompatibility(person1, person2);

    return NextResponse.json({
      success: true,
      data: {
        score: report.scores.numerological,
        lifePath1: report.profile1.lifePath,
        lifePath2: report.profile2.lifePath,
        lifePathSynergy: report.lifePathSynergy,
        bondCategory: report.bondCategory,
      },
      disclaimer: PLATFORM_DISCLAIMERS.numerology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate numerology compatibility" }, { status: 500 });
  }
}
