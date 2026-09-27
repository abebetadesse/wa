import { NextRequest, NextResponse } from "next/server";
import { startSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();
    const nameGeez = typeof body.nameGeez === "string" ? body.nameGeez : "";
    const motherNameGeez = typeof body.motherNameGeez === "string" ? body.motherNameGeez : "";
    const birthDate = typeof body.birthDate === "string" && body.birthDate.trim() ? body.birthDate : undefined;
    const birthLocationName = typeof body.birthLocationName === "string" ? body.birthLocationName.trim().slice(0, 120) : undefined;
    const birthLatitude = typeof body.birthLatitude === "number" && Number.isFinite(body.birthLatitude) && body.birthLatitude >= -90 && body.birthLatitude <= 90 ? body.birthLatitude : undefined;
    const birthLongitude = typeof body.birthLongitude === "number" && Number.isFinite(body.birthLongitude) && body.birthLongitude >= -180 && body.birthLongitude <= 180 ? body.birthLongitude : undefined;

    const session = startSpiritualCase(nameGeez, motherNameGeez, user.id, {
      birthDate,
      birthLocationName,
      birthLatitude,
      birthLongitude,
    });

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start spiritual case";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "AUTH_REQUIRED" ? 401 : 400 }
    );
  }
}
