import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { CaseStatus } from "@/lib/pipeline/types";

const overrideSchema = z.object({
  justification: z
    .string()
    .min(15, "A substantive clinical justification (minimum 15 characters) is required to override the safety gate"),
  confirmationCheckbox: z.boolean().refine((v) => v === true, {
    message: "You must check the confirmation acknowledging clinical responsibility for this override",
  }),
});

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

    // Only Professional or Admin can override safety gate (§2, §13, §14)
    if (session.role === "USER") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Users cannot override safety gate flags." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = overrideSchema.parse(body);

    const caseRecord = await pipelineRepository.getCaseById(caseId);
    if (!caseRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found." },
        { status: 404 }
      );
    }

    const prevStatus = caseRecord.status;

    // Apply override justification
    await pipelineRepository.overrideSafetyGate(caseId, session.userId, parsed.justification);

    // If blocked, unblock to PENDING_PROFESSIONAL
    if (caseRecord.status === CaseStatus.BLOCKED_BY_SAFETY_GATE) {
      caseRecord.status = CaseStatus.PENDING_PROFESSIONAL;
      caseRecord.updatedAt = new Date().toISOString();
      await pipelineRepository.saveCase(caseRecord);
    }

    // Append immutable audit log
    await pipelineRepository.appendEvent({
      caseId,
      actorId: session.userId,
      actorRole: session.role,
      type: "gate_overridden",
      before: { status: prevStatus },
      after: {
        status: caseRecord.status,
        overrideJustification: parsed.justification,
      },
      note: `Professional Safety Gate Override by ${session.userId}: ${parsed.justification}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          caseId,
          status: caseRecord.status,
          overrideRecorded: true,
          message:
            "Safety gate overridden with written clinical justification recorded in the immutable audit log.",
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to override safety gate" },
      { status: 500 }
    );
  }
}
