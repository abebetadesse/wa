import { NextRequest, NextResponse } from "next/server";
import { checkHerbDrugSafetyFromDatabase } from "@/lib/evaluation/stage5SafetyGateServer";

export async function POST(req: NextRequest) {
  try {
    const { herbName, medications } = await req.json();

    if (!herbName) {
      return NextResponse.json({ error: "herbName is required" }, { status: 400 });
    }

    const medList = Array.isArray(medications) ? medications : [];
    const safetyResult = await checkHerbDrugSafetyFromDatabase(herbName, medList);

    return NextResponse.json({
      success: true,
      result: safetyResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to check safety" }, { status: 500 });
  }
}
