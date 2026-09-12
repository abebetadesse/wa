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
      data: report,
      disclaimer: PLATFORM_DISCLAIMERS.compatibility,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate compatibility" }, { status: 500 });
  }
}
