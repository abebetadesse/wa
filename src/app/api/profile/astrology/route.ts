import { NextRequest, NextResponse } from "next/server";
import { buildAstrologicalProfile } from "@/lib/profiling/astrology/chartCalculator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const birthDate = searchParams.get("birthDate") || "1990-01-15";
  const birthTime = searchParams.get("birthTime") || "12:00";
  const birthPlace = searchParams.get("birthPlace") || "Addis Ababa";

  try {
    const astrology = buildAstrologicalProfile(birthDate, birthTime, birthPlace);
    return NextResponse.json({ success: true, astrology });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { birthDate, birthTime, birthPlace } = body;

    if (!birthDate) {
      return NextResponse.json({ success: false, error: "birthDate is required" }, { status: 400 });
    }

    const astrology = buildAstrologicalProfile(birthDate, birthTime || "12:00", birthPlace || "Addis Ababa");
    return NextResponse.json({ success: true, astrology });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
