import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { assertTransition, PipelineTransitionError } from "@/lib/pipeline/transitions";
import { CaseStatus } from "@/lib/pipeline/types";

const returnSchema = z.object({
  note: z.string().min(5, "A detailed explanation must be provided when returning a case"),
  emergencyAck: z.object({
    userNotifiedAt: z.string().datetime(),
    notificationMethod: z.enum(["in-app", "email", "sms", "phone"]),
    resourcesShared: z.array(z.string().min(1)).min(1),
  }).optional(),
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

    if (session.role === "USER") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Users cannot return cases." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = returnSchema.parse(body);

    const caseRecord = await pipelineRepository.getCaseById(caseId);
    if (!caseRecord) {
      return NextResponse.json(
        { success: false, error: "Case not found." },
        { status: 404 }
      );
    }

    if (caseRecord.emergencyDetected && (session.role !== "ADMIN" || !parsed.emergencyAck)) {
      return NextResponse.json(
        { success: false, error: "An emergency-flagged case requires an administrator emergency acknowledgement before it can be returned." },
        { status: 409 }
      );
    }

    const hasOverride = await pipelineRepository.hasSafetyGateOverride(caseId);

    let nextStatus: CaseStatus;
    if (session.role === "PROFESSIONAL") {
      nextStatus = CaseStatus.PROFESSIONAL_RETURNED;
    } else {
      // ADMIN returns to Professional
      nextStatus = CaseStatus.PENDING_PROFESSIONAL;
    }

    try {
      assertTransition(caseRecord.status, nextStatus, hasOverride);
    } catch (transErr: any) {
      if (transErr instanceof PipelineTransitionError) {
        return NextResponse.json(
          { success: false, error: transErr.message, code: "TRANSITION_REJECTED" },
          { status: 409 }
        );
      }
      throw transErr;
    }

    const prevStatus = caseRecord.status;
    caseRecord.status = nextStatus;
    caseRecord.updatedAt = new Date().toISOString();
    await pipelineRepository.saveCase(caseRecord);

    // Emit immutable audit event
    await pipelineRepository.appendEvent({
      caseId,
      actorId: session.userId,
      actorRole: session.role,
      type: caseRecord.emergencyDetected ? "held" : "returned",
      before: { status: prevStatus },
      after: caseRecord.emergencyDetected
        ? { status: nextStatus, emergencyAcknowledged: true, ...parsed.emergencyAck }
        : { status: nextStatus },
      note: caseRecord.emergencyDetected
        ? `Emergency-acknowledged return by ${session.role}: ${parsed.note}`
        : `Case returned by ${session.role}: ${parsed.note}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          caseId,
          status: caseRecord.status,
          note: parsed.note,
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
      { success: false, error: err?.message || "Failed to return case" },
      { status: 500 }
    );
  }
}
