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
        caseId: session.id,
        status: session.status,
        nameGeez: session.nameGeez,
        motherNameGeez: session.motherNameGeez,
        birthContext: {
          birthDate: session.birthDate ?? null,
          birthYear: session.birthYear ?? null,
          birthMonth: session.birthMonth ?? null,
          birthDay: session.birthDay ?? null,
          birthLocationName: session.birthLocationName ?? null,
          birthLatitude: session.birthLatitude ?? null,
          birthLongitude: session.birthLongitude ?? null,
        },
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
