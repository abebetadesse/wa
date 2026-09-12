import { NextRequest, NextResponse } from "next/server";
import { getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch report" },
      { status: 500 }
    );
  }
}
