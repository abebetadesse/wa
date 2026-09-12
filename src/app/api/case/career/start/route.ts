import { NextRequest, NextResponse } from "next/server";
import { evaluateCareerSafetyScreen } from "@/lib/case-workflow/careerSafetyScreen";
import type { CareerSafetyAnswers } from "@/lib/case-workflow/careerSafetyScreen";
import { getCareerQuestions } from "@/lib/case-workflow/careerQuestionEngine";
import type { CareerStage } from "@/lib/cultural/careerTimingEngine";

// ════════════════════════════════════════════════════════════
// In-memory session store (mirrors spiritual case pattern)
// ════════════════════════════════════════════════════════════
interface CareerSession {
  id: string;
  stage: "safety_screen" | "foundation" | "stage_specific" | "timing" | "review" | "complete";
  safetyAnswers?: CareerSafetyAnswers;
  safetyResult?: ReturnType<typeof evaluateCareerSafetyScreen>;
  careerStage?: CareerStage;
  answers: Record<string, string>;
  reportId?: string;
  createdAt: string;
  updatedAt: string;
}

const careerSessions = new Map<string, CareerSession>();

// ════════════════════════════════════════════════════════════
// POST /api/case/career/start
// Body: { safetyAnswers: CareerSafetyAnswers }
// ════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { safetyAnswers: CareerSafetyAnswers };
    const { safetyAnswers } = body;

    if (!safetyAnswers) {
      return NextResponse.json(
        { success: false, error: "safetyAnswers is required" },
        { status: 400 }
      );
    }

    const safetyResult = evaluateCareerSafetyScreen(safetyAnswers);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const session: CareerSession = {
      id,
      stage: safetyResult.action === "crisis_route" ? "safety_screen" : "foundation",
      safetyAnswers,
      safetyResult,
      answers: {},
      createdAt: now,
      updatedAt: now,
    };

    careerSessions.set(id, session);

    // If crisis → return crisis content immediately, no further workflow
    if (safetyResult.action === "crisis_route") {
      return NextResponse.json({
        success: true,
        action: "crisis_route",
        sessionId: id,
        crisisContent: safetyResult.crisisContent,
      });
    }

    // Get foundation questions (stage = exploring as default until user selects)
    const foundationQuestions = getCareerQuestions("exploring");

    return NextResponse.json({
      success: true,
      action: safetyResult.action,
      sessionId: id,
      expertFlag: safetyResult.expertFlag ?? null,
      nextStage: "foundation",
      questions: foundationQuestions,
      message:
        safetyResult.action === "proceed_with_concern"
          ? "We have noted your responses and flagged your case for additional care. Please continue with the questions below."
          : null,
      supportContent: safetyResult.crisisContent ?? null,
    });
  } catch (err) {
    console.error("[career/start]", err);
    return NextResponse.json(
      { success: false, error: "Failed to start career case" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ success: false, error: "sessionId required" }, { status: 400 });
  }
  const session = careerSessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, session });
}
