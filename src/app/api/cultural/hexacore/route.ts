import { NextResponse } from "next/server";
import { buildHexacoreProfile, HEXACORE_CORES, HEXACORE_ASPECTS, HEXACORE_FREQUENCIES, HEXACORE_PAIRS, CREATION_DAY_MAPPINGS } from "@/lib/cultural/hexacoreArcana";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const birthDate = url.searchParams.get("birthDate");
  const consent = url.searchParams.get("consent") === "true";
  const ageVerified = url.searchParams.get("ageVerified") === "true";
  if (!birthDate) {
    return NextResponse.json({ success: true, system: "Hexacore Arcana", cores: HEXACORE_CORES, aspects: HEXACORE_ASPECTS, frequencies: HEXACORE_FREQUENCIES, pairs: HEXACORE_PAIRS, creationDays: CREATION_DAY_MAPPINGS, disclaimer: "Reflective cultural content only; not medical, psychological, spiritual-authority, or predictive fact." });
  }
  try {
    return NextResponse.json({ success: true, profile: buildHexacoreProfile(birthDate, consent, ageVerified), disclaimer: "Reflective cultural content only. Body signs are not diagnoses. Do not use herbs or frequencies as treatment. Age and consent controls are required." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to build Hexacore profile." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const body = await request.json() as { birthDate?: string; consent?: boolean; ageVerified?: boolean };
  if (!body.birthDate) return NextResponse.json({ success: false, error: "birthDate is required." }, { status: 400 });
  try {
    return NextResponse.json({
      success: true,
      profile: buildHexacoreProfile(body.birthDate, body.consent === true, body.ageVerified === true),
      disclaimer: "Reflective cultural content only. Body signs are not diagnoses. Do not use herbs or frequencies as treatment.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to build Hexacore profile." }, { status: 400 });
  }
}
