import { NextRequest, NextResponse } from "next/server";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { assertTransition, PipelineTransitionError } from "@/lib/pipeline/transitions";
import { CaseStatus } from "@/lib/pipeline/types";
import { UserReport } from "@/lib/reports/types";

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

    // NON-NEGOTIABLE (§2, §12, §14):
    // "POST /api/cases/:id/publish → admin only"
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only Platform Administrators have the authority to publish clinical reports.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const qualityChecklist = body?.qualityChecklist;
    const requiredChecks = ["safetyReviewed", "consentReviewed", "languageReviewed", "evidenceReviewed"] as const;
    if (!qualityChecklist || requiredChecks.some((check) => qualityChecklist[check] !== true)) {
      return NextResponse.json(
        {
          success: false,
          error: "Complete all report quality checks before publishing.",
          code: "QUALITY_CHECKLIST_INCOMPLETE",
        },
        { status: 400 }
      );
    }

    const caseRecord = await pipelineRepository.getCaseById(caseId);
    if (!caseRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found." },
        { status: 404 }
      );
    }

    const latestUserReport = await pipelineRepository.getLatestUserReport(caseId);
    if (!latestUserReport) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: User Report not found." },
        { status: 404 }
      );
    }

    const hasOverride = await pipelineRepository.hasSafetyGateOverride(caseId);

    // If case is still in BLOCKED_BY_SAFETY_GATE, publication is forbidden
    if (caseRecord.status === CaseStatus.BLOCKED_BY_SAFETY_GATE && !hasOverride) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Publication blocked: Case triggered high-severity herb-drug safety flags and lacks an authoritative clinical override.",
        },
        { status: 409 }
      );
    }

    // Verify valid transition to PUBLISHED
    try {
      assertTransition(caseRecord.status, CaseStatus.PUBLISHED, hasOverride);
    } catch (transErr: any) {
      if (transErr instanceof PipelineTransitionError) {
        return NextResponse.json(
          { success: false, error: transErr.message, code: "TRANSITION_REJECTED" },
          { status: 409 }
        );
      }
      throw transErr;
    }

    const nowIso = new Date().toISOString();
    const prevStatus = caseRecord.status;

    // Update User Report publication timestamp & ensure override notice is present (§12)
    latestUserReport.publishedAt = nowIso;
    latestUserReport.approvedBy = session.userId;
    latestUserReport.approvedAt = nowIso;

    const payload = latestUserReport.payload as UserReport;
    if (hasOverride) {
      const overrideNotice =
        "Safety Override Notice: This evaluation was conducted with a clinical professional safety override following detected botanical-pharmaceutical interaction risk.";
      if (!payload.disclaimers.includes(overrideNotice)) {
        payload.disclaimers.unshift(overrideNotice);
      }
    }
    await pipelineRepository.saveReport(latestUserReport);

    // Update Case status to PUBLISHED
    caseRecord.status = CaseStatus.PUBLISHED;
    caseRecord.updatedAt = nowIso;
    await pipelineRepository.saveCase(caseRecord);

    // Emit immutable audit event
    await pipelineRepository.appendEvent({
      caseId,
      actorId: session.userId,
      actorRole: "ADMIN",
      type: "published",
      before: { status: prevStatus },
      after: { status: CaseStatus.PUBLISHED, publishedAt: nowIso, qualityChecklist },
      note: "Administrator completed the report quality checklist and published the User Report.",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          caseId,
          status: CaseStatus.PUBLISHED,
          publishedAt: nowIso,
          publishedBy: session.userId,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to publish case report" },
      { status: 500 }
    );
  }
}
