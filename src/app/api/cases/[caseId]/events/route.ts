import { NextRequest, NextResponse } from "next/server";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";

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

    // Role check (§2, §14): Users cannot view audit trail logs
    if (session.role === "USER") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Case event audit logs are restricted to professional reviewers and administrators.",
        },
        { status: 403 }
      );
    }

    const events = await pipelineRepository.getEvents(caseId);

    return NextResponse.json(
      {
        success: true,
        data: events,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve case events" },
      { status: 500 }
    );
  }
}
