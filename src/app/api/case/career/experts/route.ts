import { NextRequest, NextResponse } from "next/server";
import { getAvailableAdvisors, assignCareerAdvisor } from "@/lib/case-workflow/careerExpertEngine";
import type { CareerProfile } from "@/lib/cultural/careerTimingEngine";
import { buildCareerProfile } from "@/lib/case-workflow/careerQuestionEngine";

// GET /api/case/career/experts — list available advisors
export async function GET() {
  try {
    const advisors = getAvailableAdvisors();
    return NextResponse.json({
      success: true,
      count: advisors.length,
      advisors: advisors.map((a) => ({
        id: a.id,
        name: a.name,
        nameAmharic: a.nameAmharic,
        titleAmharic: a.titleAmharic,
        role: a.role,
        rating: a.rating,
        reviews_count: a.reviews_count,
        years_experience: a.years_experience,
        specialization_sectors: a.specialization_sectors,
        career_stages: a.career_stages,
        languages: a.languages,
        is_licensed_financial_advisor: a.is_licensed_financial_advisor,
        average_review_time_minutes: a.average_review_time_minutes,
        consultationFeeETB: a.consultationFeeETB,
        consultationFormats: a.consultationFormats,
        bioQuote: a.bioQuote,
        avatarInitials: a.avatarInitials,
        load: {
          current: a.current_review_load,
          max: a.max_concurrent_reviews,
          availableSlots: a.max_concurrent_reviews - a.current_review_load,
        },
      })),
    });
  } catch (err) {
    console.error("[career/experts GET]", err);
    return NextResponse.json({ success: false, error: "Failed to load advisors" }, { status: 500 });
  }
}

// POST /api/case/career/experts — match specific advisor for a profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      answers: Record<string, string>;
      needsFinancialAdvisor?: boolean;
    };
    const profile: CareerProfile = buildCareerProfile(body.answers);
    const assignment = assignCareerAdvisor(profile, {
      needsFinancialAdvisor: body.needsFinancialAdvisor ?? false,
    });
    if (!assignment) {
      return NextResponse.json({ success: false, code: "NO_ADVISOR_AVAILABLE" }, { status: 503 });
    }
    return NextResponse.json({ success: true, assignment });
  } catch (err) {
    console.error("[career/experts POST]", err);
    return NextResponse.json({ success: false, error: "Advisor matching failed" }, { status: 500 });
  }
}
