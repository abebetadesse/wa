import { NextRequest, NextResponse } from "next/server";
import {
  calculateTimingWindows,
  type CareerProfile,
} from "@/lib/cultural/careerTimingEngine";
import {
  assignCareerAdvisor,
  buildCareerReportShell,
  getAvailableAdvisors,
} from "@/lib/case-workflow/careerExpertEngine";
import { buildCareerProfile } from "@/lib/case-workflow/careerQuestionEngine";
import { synthesizeCaseReportAnalysis } from "@/lib/ai/bionicGPT";

// ════════════════════════════════════════════════════════════
// POST /api/case/career/analyze
// Body: { sessionId, answers }
// Full analysis: gematria + timing windows + expert assignment + report shell
// ════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sessionId: string;
      answers: Record<string, string>;
      needsFinancialAdvisor?: boolean;
    };

    const { sessionId, answers, needsFinancialAdvisor } = body;

    if (!answers || !sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId and answers are required" },
        { status: 400 }
      );
    }

    // Build career profile from answers
    const profile: CareerProfile = buildCareerProfile(answers);

    // Guard: names required for gematria
    if (!profile.geezName || !profile.motherGeezName) {
      return NextResponse.json(
        { success: false, error: "Ge'ez name and mother's name are required for timing analysis" },
        { status: 422 }
      );
    }

    // Calculate timing windows + numerology
    const timingAnalysis = calculateTimingWindows(profile);

    // Assign expert advisor
    const assignment = assignCareerAdvisor(profile, {
      needsFinancialAdvisor: needsFinancialAdvisor ?? false,
    });

    if (!assignment) {
      // All advisors at capacity — return availability window
      const advisors = getAvailableAdvisors();
      return NextResponse.json({
        success: false,
        code: "NO_ADVISOR_AVAILABLE",
        message:
          "All advisors are currently at capacity. You have been added to the queue. " +
          "You will be notified when an advisor becomes available — usually within 2 hours.",
        queuePosition: Math.floor(Math.random() * 5) + 1,
        availableAdvisors: advisors.length,
        timingAnalysis,
      });
    }

    // Build report shell
    const report = buildCareerReportShell(sessionId, profile, assignment);

    // Enrich report shell with BionicGPT-backed synthesis when configured.
    const aiAnalysis = await synthesizeCaseReportAnalysis("career", {
      profile,
      timingAnalysis,
      assignment,
      answers,
      needsFinancialAdvisor: needsFinancialAdvisor ?? false,
    });
    report.aiAnalysis = aiAnalysis;

    // Enrich timing window on report
    const currentWindow = timingAnalysis.currentWindow;
    report.timingWindow = {
      currentLabel: currentWindow.label.replace(/_/g, " "),
      currentScore: currentWindow.score,
      bestActionDate: `${currentWindow.dateRange.start} — ${currentWindow.dateRange.end}`,
      ritualNote: currentWindow.ritualNote,
      lunarPhaseNote: timingAnalysis.lunarPhaseNote,
    };

    // Enrich cultural integration
    report.culturalIntegration = {
      numerologySummary: timingAnalysis.numerology.narrativeSummary,
      auspiciousActionNote: currentWindow.actionRecommendation,
      blessingRitual: currentWindow.ritualNote,
      communityAngle:
        profile.businessType === "cooperative"
          ? "Your cooperative structure aligns well with Equb and Edir traditions. Consider formalizing your blessing ritual with the cooperative founding members."
          : "If you participate in an Equb or Edir, this could be a strong community anchor for your professional network and initial funding conversations.",
    };

    return NextResponse.json({
      success: true,
      reportId: report.id,
      caseId: sessionId,
      status: report.status,
      timingAnalysis,
      expertAssignment: {
        advisorName: assignment.advisor.name,
        advisorNameAmharic: assignment.advisor.nameAmharic,
        advisorTitle: assignment.advisor.titleAmharic,
        advisorRole: assignment.advisor.role,
        estimatedReviewMinutes: assignment.estimatedReviewMinutes,
        reviewWindowEnd: assignment.reviewWindowEnd,
        consultationFeeETB: assignment.advisor.consultationFeeETB,
        consultationFormats: assignment.advisor.consultationFormats,
        rating: assignment.advisor.rating,
        bioQuote: assignment.advisor.bioQuote,
        avatarInitials: assignment.advisor.avatarInitials,
      },
      culturalIntegration: report.culturalIntegration,
      financialDisclaimer: report.financialDisclaimer,
      lockedSections: report.lockedSections,
      unlockedWith: "Full report released after expert review and optional payment",
    });
  } catch (err) {
    console.error("[career/analyze]", err);
    return NextResponse.json(
      { success: false, error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
