import { NextRequest, NextResponse } from "next/server";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { projectUserReport } from "@/lib/reports/projectUserReport";
import { ProfessionalReport } from "@/lib/reports/types";

// ─── GET /api/cases/:id/report/pro (Professional Report - Strictly Hidden from Users) ─
export async function GET(
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

    // NON-NEGOTIABLE PRINCIPLE (§2, §14, §18, §20):
    // "Do not let the user see the professional report under any code path."
    // "A User session calling /api/cases/:id/report/pro receives 403."
    if (session.role === "USER") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: The Professional Clinical Report contains restricted pharmacological and diagnostic mechanisms and is inaccessible to User accounts.",
        },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const proReport = await pipelineRepository.getLatestProfessionalReport(caseId);
    if (!proReport) {
      return NextResponse.json(
        { success: false, error: "Professional Report not found for this case." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: proReport.payload,
        metadata: {
          caseId,
          version: proReport.version,
          confidence: proReport.confidence,
          provenance: proReport.provenance,
          authoredBy: proReport.authoredBy,
          createdAt: proReport.createdAt,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve professional report" },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/cases/:id/report/pro (Professional edits + live re-projection) ───
export async function PATCH(
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
        { success: false, error: "Forbidden: Users cannot edit professional reports." },
        { status: 403 }
      );
    }

    const latestPro = await pipelineRepository.getLatestProfessionalReport(caseId);
    if (!latestPro) {
      return NextResponse.json(
        { success: false, error: "Professional Report not found for editing." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const existingPayload = latestPro.payload as ProfessionalReport;

    // Merge edits into new Professional Report payload
    const updatedPayload: ProfessionalReport = {
      ...existingPayload,
      ...body,
      // Retain foundational identifiers
      caseId: existingPayload.caseId,
      userSummary: existingPayload.userSummary,
    };

    const newVersion = latestPro.version + 1;
    const nowIso = new Date().toISOString();

    // Mark previous report superseded
    latestPro.supersededBy = `rep_pro_${caseId}_v${newVersion}`;
    await pipelineRepository.saveReport(latestPro);

    // Save updated Professional Report
    const updatedProRecord = await pipelineRepository.saveReport({
      id: `rep_pro_${caseId}_v${newVersion}`,
      caseId,
      kind: "PROFESSIONAL",
      version: newVersion,
      payload: updatedPayload,
      safetyGate: updatedPayload.safetyGate,
      confidence: updatedPayload.confidence,
      provenance: updatedPayload.provenance,
      authoredBy: session.userId,
      createdAt: nowIso,
    });

    // Pure function re-projection: Re-run projectUserReport
    const projectedUserReport = projectUserReport(updatedPayload);

    // Supersede old user report and save new projected user report version
    const latestUser = await pipelineRepository.getLatestUserReport(caseId);
    if (latestUser) {
      latestUser.supersededBy = `rep_usr_${caseId}_v${newVersion}`;
      await pipelineRepository.saveReport(latestUser);
    }

    const updatedUserRecord = await pipelineRepository.saveReport({
      id: `rep_usr_${caseId}_v${newVersion}`,
      caseId,
      kind: "USER",
      version: newVersion,
      payload: projectedUserReport,
      confidence: latestPro.confidence,
      provenance: [],
      authoredBy: session.userId,
      createdAt: nowIso,
    });

    // Emit immutable audit event
    await pipelineRepository.appendEvent({
      caseId,
      actorId: session.userId,
      actorRole: session.role,
      type: "edited",
      before: { version: latestPro.version },
      after: { version: newVersion },
      note: body.editNote || `Professional report updated to v${newVersion} and user report re-projected.`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          professionalReport: updatedPayload,
          projectedUserReport,
          version: newVersion,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to edit professional report" },
      { status: 500 }
    );
  }
}
