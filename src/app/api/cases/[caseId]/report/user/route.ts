import { NextRequest, NextResponse } from "next/server";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { CaseStatus } from "@/lib/pipeline/types";

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

    const caseRecord = await pipelineRepository.getCaseById(caseId);
    if (!caseRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found." },
        { status: 404 }
      );
    }

    // Role check and publication gate (§2, §12, §14):
    // "GET /api/cases/:id/report/user → 403 unless published OR actor is pro/admin"
    if (session.role === "USER") {
      if (caseRecord.userId !== session.userId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You may only view reports for your own cases." },
          { status: 403 }
        );
      }

      if (caseRecord.status !== CaseStatus.PUBLISHED) {
        return NextResponse.json(
          {
            success: false,
            error:
              "User Report has not been approved and published yet. It is currently undergoing professional and administrative review.",
            status: caseRecord.status,
          },
          { status: 403 }
        );
      }
    }

    const userReport = await pipelineRepository.getLatestUserReport(caseId);
    if (!userReport) {
      return NextResponse.json(
        { success: false, error: "User Report not found for this case." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: userReport.payload,
        metadata: {
          caseId,
          version: userReport.version,
          confidence: userReport.confidence,
          publishedAt: userReport.publishedAt,
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
      { success: false, error: err?.message || "Failed to retrieve user report" },
      { status: 500 }
    );
  }
}
