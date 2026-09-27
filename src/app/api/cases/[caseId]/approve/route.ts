import { NextRequest, NextResponse } from "next/server";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { assertTransition, PipelineTransitionError } from "@/lib/pipeline/transitions";
import { CaseStatus } from "@/lib/pipeline/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const session = await getPipelineSession(req);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (session.role === "USER") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Users cannot approve cases." },
        { status: 403 }
      );
    }

    const caseRecord = await pipelineRepository.getCaseById(caseId);
    if (!caseRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found." },
        { status: 404 }
      );
    }

    const hasOverride = await pipelineRepository.hasSafetyGateOverride(caseId);

    let nextStatus: CaseStatus;
    if (session.role === "PROFESSIONAL") {
      nextStatus = CaseStatus.PENDING_ADMIN;
    } else {
      // ADMIN approval
      nextStatus = CaseStatus.APPROVED;
    }

    // Verify valid state transition and safety gate override constraint
    try {
      assertTransition(caseRecord.status, nextStatus, hasOverride);
    } catch (transErr: any) {
      if (transErr instanceof PipelineTransitionError) {
        return NextResponse.json(
          {
            success: false,
            error: transErr.message,
            code: "TRANSITION_REJECTED",
          },
          { status: 409 }
        );
      }
      throw transErr;
    }

    const prevStatus = caseRecord.status;
    caseRecord.status = nextStatus;
    caseRecord.updatedAt = new Date().toISOString();
    await pipelineRepository.saveCase(caseRecord);

    // Update report approvedBy metadata
    const proReport = await pipelineRepository.getLatestProfessionalReport(caseId);
    if (proReport) {
      proReport.approvedBy = session.userId;
      proReport.approvedAt = new Date().toISOString();
      await pipelineRepository.saveReport(proReport);
    }

    // Append immutable audit log
    await pipelineRepository.appendEvent({
      caseId,
      actorId: session.userId,
      actorRole: session.role,
      type: "approved",
      before: { status: prevStatus },
      after: { status: nextStatus },
      note: `${session.role} approved case. Transitioned from ${prevStatus} to ${nextStatus}.`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          caseId,
          status: caseRecord.status,
          approvedBy: session.userId,
          approvedAt: caseRecord.updatedAt,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to approve case" },
      { status: 500 }
    );
  }
}
