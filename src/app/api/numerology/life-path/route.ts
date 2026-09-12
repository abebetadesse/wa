import { NextResponse } from "next/server";
import { calculateDanMillmanLifePath } from "@/lib/profiling/numerology/danMillmanNumerology";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { birthDate } = body;

    if (!birthDate) {
      return NextResponse.json({ error: "birthDate is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const lifePath = calculateDanMillmanLifePath(birthDate);

    return NextResponse.json({
      success: true,
      data: lifePath,
      disclaimer: PLATFORM_DISCLAIMERS.numerology,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate unreduced life path" }, { status: 500 });
  }
}
