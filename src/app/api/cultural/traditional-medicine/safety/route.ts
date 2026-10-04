import { NextResponse } from "next/server";
import { checkRemedySafety, type RemedySafetyCheckInput } from "@/lib/cultural/traditionalMedicine";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ success: false, error: "Request body must be a JSON object." }, { status: 400 });
  }

  const input = body as Partial<RemedySafetyCheckInput>;
  const hasPlantUid = typeof input.plantUid === "string" && input.plantUid.trim().length > 0;
  const hasMedicineId = typeof input.medicineId === "string" && input.medicineId.trim().length > 0;
  if (!hasPlantUid && !hasMedicineId) {
    return NextResponse.json({ success: false, error: "plantUid or medicineId is required." }, { status: 400 });
  }
  if (
    (input.pregnancy !== undefined && typeof input.pregnancy !== "boolean") ||
    (input.lactation !== undefined && typeof input.lactation !== "boolean") ||
    (input.ageYears !== undefined && (typeof input.ageYears !== "number" || !Number.isFinite(input.ageYears) || input.ageYears < 0 || input.ageYears > 130)) ||
    (input.conditions !== undefined && (!Array.isArray(input.conditions) || !input.conditions.every((value) => typeof value === "string"))) ||
    (input.medicationClasses !== undefined && (!Array.isArray(input.medicationClasses) || !input.medicationClasses.every((value) => typeof value === "string")))
  ) {
    return NextResponse.json({ success: false, error: "Patient context fields have invalid types or values." }, { status: 400 });
  }

  const rules = checkRemedySafety(input);
  return NextResponse.json({
    success: true,
    safeToSelfAdminister: false,
    requiresExpertReview: true,
    rules,
    message: "This checker identifies review triggers only. No matched warning is not evidence of safety or efficacy.",
  });
}
