import { NextResponse } from "next/server";
import { getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const user = await requireAuthenticatedUser();
    const session = getOwnedSpiritualCase(caseId, user.id);

    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    // Review gate enforcement
    const isUnlocked = session.paymentConfirmed || session.status === "full_report_released" || session.status === "consultation_booked";

    if (!isUnlocked) {
      return NextResponse.json({ success: false, error: "The full report has not been released." }, { status: 402 });
    }
    if (!session.report) {
      return NextResponse.json({ success: false, error: "The report draft has not been prepared." }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      data: {
        isUnlocked,
        status: session.status,
        report: session.report,
        gematria: session.gematria,
        assignedExpert: session.assignedExpert,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}
