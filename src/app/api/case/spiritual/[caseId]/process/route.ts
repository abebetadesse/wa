import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getOwnedSpiritualCase, processSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { caseId } = await params;
    if (!getOwnedSpiritualCase(caseId, user.id)) {
      return NextResponse.json({ success: false, error: "Case not found." }, { status: 404 });
    }
    const session = await processSpiritualCase(caseId);
    return NextResponse.json({
      success: true,
      data: {
        caseId: session.id,
        status: session.status,
        lastUpdated: session.lastUpdated,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to prepare the reading draft.";
    const status = message === "AUTH_REQUIRED" ? 401 : message === "CRISIS_SUPPORT_REQUIRED" ? 409 : message === "INTAKE_NOT_SUBMITTED" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
