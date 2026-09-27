import { NextRequest, NextResponse } from "next/server";
import { getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const user = await requireAuthenticatedUser();
    const session = getOwnedSpiritualCase(caseId, user.id);

    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        gematria: session.gematria,
        category: session.category,
        status: session.status,
        birthContext: {
          birthDate: session.birthDate ?? null,
          birthYear: session.birthYear ?? null,
          birthMonth: session.birthMonth ?? null,
          birthDay: session.birthDay ?? null,
          birthLocationName: session.birthLocationName ?? null,
          birthLatitude: session.birthLatitude ?? null,
          birthLongitude: session.birthLongitude ?? null,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch divination";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}
