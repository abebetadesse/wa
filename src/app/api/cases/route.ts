import { NextResponse } from "next/server";
import { z } from "zod";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { evaluateCase } from "@/lib/evaluation/caseEvaluator";
import { CaseStatus } from "@/lib/pipeline/types";
import { listCases as legacyListCases } from "@/lib/case-workflow/engine";
import { detectEmergency } from "@/lib/case-workflow/caseSummaryEngine";

const caseIntakeSchema = z.object({
  narrative: z.string().min(10, "Case narrative must be at least 10 characters"),
  symptoms: z.array(z.string()).min(1, "At least one symptom must be provided"),
  duration: z.string().min(1, "Duration is required"),
  selfTreatments: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  profileId: z.string().optional(),
  consentToProfessionalApproval: z.boolean().refine((val) => val === true, {
    message: "Consent acknowledging that this is not a diagnosis and requires professional approval is required",
  }),
});

// ─── GET /api/cases ──────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await getPipelineSession(req);
    const { searchParams } = new URL(req.url);
    const isLegacy = searchParams.get("legacy") === "true";

    if (isLegacy || !session) {
      return NextResponse.json({ success: true, data: legacyListCases() });
    }

    // Role-based case listing (§2)
    let cases = [];
    if (session.role === "USER") {
      cases = await pipelineRepository.listCases({ userId: session.userId });
    } else if (session.role === "PROFESSIONAL") {
      cases = await pipelineRepository.listCases({ professionalId: session.userId });
    } else {
      // ADMIN sees everything
      cases = await pipelineRepository.listCases();
    }

    return NextResponse.json(
      { success: true, data: cases },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to list cases" },
      { status: 500 }
    );
  }
}

// ─── POST /api/cases (Stage B Case Intake & Stage C Dual-Track Evaluation) ───
export async function POST(req: Request) {
  try {
    const session = await getPipelineSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required to submit a case." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = caseIntakeSchema.parse(body);

    // Resolve user's profile
    let profile = null;
    if (parsed.profileId) {
      profile = await pipelineRepository.getProfileById(parsed.profileId);
    }
    if (!profile) {
      profile = await pipelineRepository.getProfileByUserId(session.userId);
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "A completed profile with resolved location is required before submitting a case.",
        },
        { status: 400 }
      );
    }

    const caseId = `case_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    const caseInput = {
      id: caseId,
      userId: session.userId,
      profileId: profile.id,
      narrative: parsed.narrative,
      symptoms: parsed.symptoms,
      duration: parsed.duration,
      selfTreatments: parsed.selfTreatments,
      attachments: parsed.attachments,
    };

    const emergencyCheck = detectEmergency([
      parsed.narrative,
      ...parsed.symptoms,
      ...parsed.selfTreatments,
    ].join(" "));
    if (emergencyCheck.detected) {
      await pipelineRepository.saveCase({
        ...caseInput,
        status: CaseStatus.BLOCKED_BY_SAFETY_GATE,
        emergencyDetected: true,
        emergencySignals: emergencyCheck.signals,
        emergencyRoutedAt: nowIso,
        submittedAt: nowIso,
        updatedAt: nowIso,
      });
      await pipelineRepository.appendEvent({
        caseId,
        actorId: "SYSTEM_EMERGENCY_GATE",
        actorRole: "ADMIN",
        type: "held",
        after: {
          status: CaseStatus.BLOCKED_BY_SAFETY_GATE,
          emergencyDetected: true,
          emergencySignals: emergencyCheck.signals,
          route: "/emergency",
        },
        note: "Emergency signal detected before case evaluation; automated evaluation was not run.",
      });
      return NextResponse.json({
        success: true,
        data: {
          caseId,
          status: CaseStatus.BLOCKED_BY_SAFETY_GATE,
          emergencyDetected: true,
          emergencySignals: emergencyCheck.signals,
          emergencyRoute: "/emergency",
          evaluationStarted: false,
        },
      }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }

    // Stage C: Run parallel dual-track evaluation
    const evaluation = await evaluateCase({
      caseInput,
      profile,
      location: profile.location,
    });

    const isBlocked = evaluation.safetyGateResult.blocked;
    const initialStatus: CaseStatus = isBlocked
      ? CaseStatus.BLOCKED_BY_SAFETY_GATE
      : CaseStatus.PENDING_PROFESSIONAL;

    const caseRecord = {
      id: caseId,
      userId: session.userId,
      profileId: profile.id,
      narrative: parsed.narrative,
      symptoms: parsed.symptoms,
      duration: parsed.duration,
      selfTreatments: parsed.selfTreatments,
      attachments: parsed.attachments,
      status: initialStatus,
      submittedAt: nowIso,
      updatedAt: nowIso,
    };

    // Save case
    await pipelineRepository.saveCase(caseRecord);

    // Save initial versions of dual reports
    const proReportId = `rep_pro_${caseId}_v1`;
    await pipelineRepository.saveReport({
      id: proReportId,
      caseId,
      kind: "PROFESSIONAL",
      version: 1,
      payload: evaluation.professionalReport,
      safetyGate: evaluation.safetyGateResult,
      confidence: evaluation.professionalReport.confidence,
      provenance: evaluation.professionalReport.provenance,
      createdAt: nowIso,
    });

    const userReportId = `rep_usr_${caseId}_v1`;
    await pipelineRepository.saveReport({
      id: userReportId,
      caseId,
      kind: "USER",
      version: 1,
      payload: evaluation.userReport,
      confidence: evaluation.userReport.whenToSeekHelpNow.length > 0 ? "high" : "moderate",
      provenance: [],
      createdAt: nowIso,
    });

    // Emit immutable audit events
    await pipelineRepository.appendEvent({
      caseId,
      actorId: session.userId,
      actorRole: session.role,
      type: "submitted",
      after: { status: initialStatus, symptoms: parsed.symptoms },
      note: `Case submitted with ${parsed.symptoms.length} symptoms and ${parsed.selfTreatments.length} prior treatments.`,
    });

    if (isBlocked) {
      await pipelineRepository.appendEvent({
        caseId,
        actorId: "SYSTEM_SAFETY_GATE",
        actorRole: "ADMIN",
        type: "gate_blocked",
        before: { status: CaseStatus.SUBMITTED },
        after: { status: CaseStatus.BLOCKED_BY_SAFETY_GATE },
        note: `Authoritative safety gate blocked case: ${evaluation.safetyGateResult.summary}`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          caseId,
          status: initialStatus,
          safetyGateBlocked: isBlocked,
          safetyGateSummary: isBlocked ? evaluation.safetyGateResult.summary : undefined,
        },
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to submit case" },
      { status: 500 }
    );
  }
}
