import { NextRequest, NextResponse } from "next/server";
import { evaluateCaseWithProfile } from "@/lib/case-workflow/caseEvaluationEngine";
import {
  MultiStrandEvaluationInput,
  MultiStrandUserProfile,
  MultiStrandCaseSubmission,
} from "@/lib/case-workflow/caseEvaluationPrompt";

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/case/evaluate
// Evaluates user profile against submitted case across all 11 knowledge strands.
// Generates dual summaries for assigned experts and system administrators with
// strict Domain A / Domain B firewalling.
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userProfile?: MultiStrandUserProfile;
      submittedCase?: MultiStrandCaseSubmission;
    };

    const { userProfile, submittedCase } = body;

    if (!submittedCase || !submittedCase.primaryChallenge) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid submittedCase object with primaryChallenge is required.",
        },
        { status: 400 }
      );
    }

    const input: MultiStrandEvaluationInput = {
      userProfile: userProfile || {},
      submittedCase,
    };

    const evaluation = await evaluateCaseWithProfile(input);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal evaluation error";
    console.error("[api/case/evaluate] Evaluation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
