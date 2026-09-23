import { NextRequest, NextResponse } from "next/server";
import {
  getCareerQuestions,
  getFollowUpQuestion,
  hasSafetyTrigger,
  FINANCIAL_DISCLAIMER,
  requiresFinancialDisclaimer,
} from "@/lib/case-workflow/careerQuestionEngine";
import type { CareerStage } from "@/lib/cultural/careerTimingEngine";

// ════════════════════════════════════════════════════════════
// POST /api/case/career/questions
// Body: { sessionId, careerStage, answers }
// Returns next questions based on stage + answer context
// ════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sessionId: string;
      careerStage: CareerStage;
      answers: Record<string, string>;
      lastAnsweredQuestionId?: string;
      lastAnswerValue?: string;
    };

    const { careerStage, answers, lastAnsweredQuestionId, lastAnswerValue } = body;

    if (!careerStage) {
      return NextResponse.json(
        { success: false, error: "careerStage is required" },
        { status: 400 }
      );
    }

    // Check for safety trigger in current answers
    if (hasSafetyTrigger(answers)) {
      return NextResponse.json({
        success: true,
        safetyTriggered: true,
        action: "route_to_safety",
        message:
          "We want to make sure you have the support you need. " +
          "Please call 952 (free, confidential mental wellbeing support) or speak with a trusted person. " +
          "We can continue your career session once you are ready.",
        hotline: { name: "Mental wellbeing Support", number: "952" },
      });
    }

    // Get full question set for the stage
    const allQuestions = getCareerQuestions(careerStage);

    // Inject follow-up question if needed
    let followUpQuestion = null;
    if (lastAnsweredQuestionId && lastAnswerValue) {
      followUpQuestion = getFollowUpQuestion(lastAnsweredQuestionId, lastAnswerValue);
    }

    // Collect disclaimer notices for financial questions
    const disclaimerNeeded = allQuestions.some((q) => requiresFinancialDisclaimer(q.id));

    return NextResponse.json({
      success: true,
      questions: allQuestions,
      followUpQuestion,
      disclaimerNeeded,
      financialDisclaimer: disclaimerNeeded ? FINANCIAL_DISCLAIMER : null,
      totalQuestions: allQuestions.length + (followUpQuestion ? 1 : 0),
    });
  } catch (err) {
    console.error("[career/questions]", err);
    return NextResponse.json(
      { success: false, error: "Failed to load career questions" },
      { status: 500 }
    );
  }
}
