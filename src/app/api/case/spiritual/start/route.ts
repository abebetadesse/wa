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
    const serviceChoice = body.serviceChoice && typeof body.serviceChoice === "object" ? {
      id: typeof body.serviceChoice.id === "string" ? body.serviceChoice.id : "general",
      title: typeof body.serviceChoice.title === "string" ? body.serviceChoice.title : "Spiritual focus",
      label: typeof body.serviceChoice.label === "string" ? body.serviceChoice.label : "Guidance",
      prayer: typeof body.serviceChoice.prayer === "string" ? body.serviceChoice.prayer : "May clarity and patience guide this path.",
      prayerGe: typeof body.serviceChoice.prayerGe === "string" ? body.serviceChoice.prayerGe : undefined,
      telsemId: typeof body.serviceChoice.telsemId === "string" ? body.serviceChoice.telsemId : null,
      telsemName: typeof body.serviceChoice.telsemName === "string" ? body.serviceChoice.telsemName : null,
      fullDescription: typeof body.serviceChoice.fullDescription === "string" ? body.serviceChoice.fullDescription : undefined,
    } : undefined;

    const session = startSpiritualCase(nameGeez, motherNameGeez, user.id, {
      birthDate,
      birthLocationName,
      birthLatitude,
      birthLongitude,
    }, serviceChoice);

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
