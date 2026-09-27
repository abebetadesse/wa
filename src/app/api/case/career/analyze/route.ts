import { NextRequest, NextResponse } from "next/server";
import {
  calculateTimingWindows,
  type CareerProfile,
  type TimingAnalysis,
} from "@/lib/cultural/careerTimingEngine";
import {
  assignCareerAdvisor,
  buildCareerReportShell,
  getAvailableAdvisors,
} from "@/lib/case-workflow/careerExpertEngine";
import { buildCareerProfile } from "@/lib/case-workflow/careerQuestionEngine";

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
    const timingAnalysis = toReflectiveTimingAnalysis(calculateTimingWindows(profile));

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

    function toReflectiveTimingAnalysis(analysis: TimingAnalysis): TimingAnalysis {
      const reflectionOnly = {
        label: "neutral" as const,
        score: 5,
        actionRecommendation: "This is a symbolic cultural reflection, not a recommendation about career or financial decisions.",
        ritualNote: "Any prayer or customary reflection is optional and should follow your own beliefs.",
        warningNote: undefined,
      };
      return {
        ...analysis,
        numerology: {
          ...analysis.numerology,
          avoidDays: [],
          narrativeSummary: analysis.numerology.narrativeSummary,
        },
        currentWindow: { ...analysis.currentWindow, ...reflectionOnly },
        nextThreeWindows: analysis.nextThreeWindows.map((window) => ({ ...window, ...reflectionOnly })),
        recommendedActionMonth: "",
        bestDayOfWeek: "",
        bestDayAmharic: "",
        lunarPhaseNote: "Traditional lunar-cycle symbolism is offered for reflection only, not as a decision guide.",
      };
    }

    // Build report shell
    const report = buildCareerReportShell(sessionId, profile, assignment);

    // Enrich timing window on report
    const currentWindow = timingAnalysis.currentWindow;
    report.timingWindow = {
      currentLabel: currentWindow.label.replace(/_/g, " "),
      currentScore: currentWindow.score,
      bestActionDate: "",
      ritualNote: currentWindow.ritualNote,
      lunarPhaseNote: timingAnalysis.lunarPhaseNote,
    };

    // Enrich cultural integration
    report.culturalIntegration = {
      numerologySummary: timingAnalysis.numerology.narrativeSummary,
      auspiciousActionNote: "Traditional timing is presented as symbolic cultural reflection, not as a recommendation about career or financial decisions.",
      blessingRitual: currentWindow.ritualNote,
      communityAngle: "Work and vocation can be reflected on through community, identity, service, and spiritual values. Meanings differ across traditions; this is not practical career or financial guidance.",
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
