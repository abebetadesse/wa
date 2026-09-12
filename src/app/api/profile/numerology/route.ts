import { NextRequest, NextResponse } from "next/server";
import { buildNumerologyProfile } from "@/lib/profiling/numerology/numberCalculator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fullName = searchParams.get("fullName") || "Tigist Mulugeta";
  const birthDate = searchParams.get("birthDate") || "1990-01-15";

  try {
    const numerology = buildNumerologyProfile(fullName, birthDate);
    return NextResponse.json({ success: true, numerology });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, birthDate } = body;

    if (!birthDate) {
      return NextResponse.json({ success: false, error: "birthDate is required" }, { status: 400 });
    }

    const numerology = buildNumerologyProfile(fullName || "Tigist Mulugeta", birthDate);
    return NextResponse.json({ success: true, numerology });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
