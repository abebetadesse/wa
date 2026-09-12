import { NextRequest, NextResponse } from "next/server";
import { getSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const session = getSpiritualCase(caseId);

    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        caseId: session.id,
        status: session.status,
        nameGeez: session.nameGeez,
        motherNameGeez: session.motherNameGeez,
        category: session.category,
        assignedExpert: session.assignedExpert,
        estimatedMinutesRemaining: session.estimatedMinutesRemaining,
        paymentConfirmed: session.paymentConfirmed,
        transactionRef: session.transactionRef,
        createdAt: session.createdAt,
        lastUpdated: session.lastUpdated,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch status" },
      { status: 500 }
    );
  }
}
