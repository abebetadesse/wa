import { NextResponse } from "next/server";
import { checkRemedySafety, type RemedySafetyCheckInput } from "@/lib/cultural/traditionalMedicine";

export async function POST(request: Request) {
  const input = await request.json() as Partial<RemedySafetyCheckInput>;
  if (!input.plantUid) return NextResponse.json({ success: false, error: "plantUid is required." }, { status: 400 });
  const rules = checkRemedySafety(input as RemedySafetyCheckInput);
  return NextResponse.json({
    success: true,
    safeToSelfAdminister: false,
    requiresExpertReview: true,
    rules,
    message: "This checker identifies review triggers only. It does not establish safety or efficacy.",
  });
}
