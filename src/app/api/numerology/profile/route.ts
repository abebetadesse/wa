import { NextResponse } from "next/server";
import { buildMultiSystemNumerologyProfile } from "@/lib/profiling/numerology/multiSystemNumerology";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, birthDate, geEzName } = body;

    if (!fullName || !birthDate) {
      return NextResponse.json({ error: "fullName and birthDate are required" }, { status: 400 });
    }

    const profile = buildMultiSystemNumerologyProfile(fullName, birthDate, geEzName);

    return NextResponse.json({
      success: true,
      data: profile,
      disclaimer: PLATFORM_DISCLAIMERS.numerology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate numerology profile" }, { status: 500 });
  }
}
