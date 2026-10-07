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

    if (!session.report || session.status !== "ai_draft_prepared") {
      return NextResponse.json({ success: false, error: "The reading draft is not ready for preview." }, { status: 409 });
    }

    const toc = [
      { id: 1, title: "Divination Summary", locked: false },
      { id: 2, title: "Optional cultural reflection", locked: false },
      { id: 3, title: "Practical next-step prompts", locked: false },
      { id: 4, title: "Optional quiet reflection", locked: false },
    ];

    return NextResponse.json({
      success: true,
      data: {
        caseId: session.id,
        status: session.status,
        expert: session.assignedExpert,
        toc,
        freeSummary: session.report.divinationSummary.narrative,
        aiAnalysis: session.report.aiAnalysis,
        culturalInterpretation: session.report.culturalInterpretation,
        practicalGuidance: session.report.practicalGuidance,
        recommendedRitual: session.report.recommendedRitual,
        draftNotice: "AI-assisted cultural reflection draft. No human practitioner review or approval has been recorded.",
        serviceChoice: session.serviceChoice ?? session.report?.serviceChoice,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch preview";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}
