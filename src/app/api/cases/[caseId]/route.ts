import { NextRequest, NextResponse } from "next/server";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { getCase as getLegacyCase, getQuestions } from "@/lib/case-workflow/engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const session = await getPipelineSession(req);

    // 1. Try pipeline cases first
    const pipelineCase = await pipelineRepository.getCaseById(caseId);

    if (pipelineCase) {
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Authentication required to view case details." },
          { status: 401 }
        );
      }

      // Ownership check for USER role (§2)
      if (session.role === "USER" && pipelineCase.userId !== session.userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You may only view your own cases." },
          { status: 403 }
        );
      }

      // User sees filtered case status; Professional/Admin see full details
      if (session.role === "USER") {
        return NextResponse.json(
          {
            success: true,
            data: {
              id: pipelineCase.id,
              status: pipelineCase.status,
              narrative: pipelineCase.narrative,
              symptoms: pipelineCase.symptoms,
              duration: pipelineCase.duration,
              selfTreatments: pipelineCase.selfTreatments,
              submittedAt: pipelineCase.submittedAt,
              updatedAt: pipelineCase.updatedAt,
              hasSafetyGateOverride: Boolean(pipelineCase.overrideJustification),
            },
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }

      // Professional / Admin view
      return NextResponse.json(
        {
          success: true,
          data: pipelineCase,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // 2. Fallback to legacy case engine if exists
    const selectedCase = getLegacyCase(caseId);
    if (selectedCase) {
      return NextResponse.json({
        success: true,
        data: { case: selectedCase, questions: getQuestions(selectedCase.commonQuestionSetId) },
      });
    }

    return NextResponse.json(
      { success: false, error: "Case not found." },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve case" },
      { status: 500 }
    );
  }
}
