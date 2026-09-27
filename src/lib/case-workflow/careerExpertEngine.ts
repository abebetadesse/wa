/**
 * Career & Business Expert Matching Engine — Case 3
 * Matches cases to verified business advisors and career coaches
 * with real-time load balancing, language matching, and
 * sector specialization weighting.
 */

import type { CareerProfile, CareerStage } from "@/lib/cultural/careerTimingEngine";

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════

export type AdvisorRole =
  | "career_coach"
  | "business_mentor"
  | "legal_advisor"
  | "financial_advisor"  // licensed only — financial_advisor flag required
  | "sector_specialist"
  | "cultural_advisor"
  | "mental_wellbeing_referral";  // for cases flagged with safety concern

export interface CareerAdvisor {
  id: string;
  name: string;
  nameAmharic?: string;
  titleAmharic: string;
  role: AdvisorRole;
  specialization_sectors: string[];
  career_stages: CareerStage[];
  languages: string[];
  region: string;
  rating: number;
  reviews_count: number;
  years_experience: number;
  average_review_time_minutes: number;
  current_review_load: number;
  max_concurrent_reviews: number;
  credential_verified: boolean;
  is_licensed_financial_advisor: boolean;
  is_available: boolean;
  ethical_violations: number;
  bioQuote: string;
  avatarInitials: string;
  consultationFeeETB: number;
  consultationFormats: ("video" | "voice" | "chat" | "in_person")[];
}

export type CareerCaseStatus =
  | "safety_screen"
  | "name_gematria"
  | "questions_active"
  | "timing_analysis"
  | "ai_analysis_pending"
  | "expert_review_pending"
  | "visible_to_user"
  | "full_report_released"
  | "consultation_booked"
  | "crisis_routed";

export interface CareerReport {
  id: string;
  caseId: string;
  status: CareerCaseStatus;
  generatedAt: string;
  approvedAt?: string;
  profile: CareerProfile;
  timingWindow: {
    currentLabel: string;
    currentScore: number;
    bestActionDate: string;
    ritualNote?: string;
    lunarPhaseNote: string;
  };
  aiAnalysis: {
    situationSummary: string;
    strengths: string[];
    challenges: string[];
    strategicRecommendations: {
      title: string;
      description: string;
      priority: "immediate" | "short_term" | "long_term";
      timingNote?: string;
    }[];
    networkingSuggestions: string[];
    sectorInsights: string;
  };
  culturalIntegration: {
    numerologySummary: string;
    auspiciousActionNote: string;
    blessingRitual?: string;
    communityAngle: string; // Equb, Edir, etc.
  };
  expertNarrative: {
    summary: string;
    advisorName: string;
    advisorRole: AdvisorRole;
    reviewedAt: string;
    signature: string;
  };
  financialDisclaimer: string;
  lockedSections: string[];
  unlockedAt?: string;
}

export interface ExpertAssignmentResult {
  advisor: CareerAdvisor;
  estimatedReviewMinutes: number;
  assignedAt: string;
  reviewWindowEnd: string;
}

// ════════════════════════════════════════════════════════════
// Mock advisor pool (replace with DB query in production)
// ════════════════════════════════════════════════════════════

const ADVISOR_POOL: CareerAdvisor[] = [
  {
    id: "ca-001",
    name: "Tigist Bekele",
    nameAmharic: "ትግስት በቀለ",
    titleAmharic: "የሙያ አሰልጣኝ",
    role: "career_coach",
    specialization_sectors: ["Education", "healthcare", "NGO", "Government"],
    career_stages: ["exploring", "job_seeking", "transitioning", "recovering"],
    languages: ["Amharic", "English"],
    region: "Addis Ababa",
    rating: 4.8,
    reviews_count: 134,
    years_experience: 9,
    average_review_time_minutes: 55,
    current_review_load: 2,
    max_concurrent_reviews: 5,
    credential_verified: true,
    is_licensed_financial_advisor: false,
    is_available: true,
    ethical_violations: 0,
    bioQuote: "Career clarity starts with understanding who you are — then we build the map together.",
    avatarInitials: "TB",
    consultationFeeETB: 800,
    consultationFormats: ["video", "chat", "voice"],
  },
  {
    id: "ca-002",
    name: "Solomon Haile",
    nameAmharic: "ሰሎሞን ኃይሌ",
    titleAmharic: "የንግድ አማካሪ",
    role: "business_mentor",
    specialization_sectors: ["Retail", "Agriculture", "Manufacturing", "Food & Beverage"],
    career_stages: ["starting_business", "growing_business", "scaling", "recovering"],
    languages: ["Amharic", "Tigrinya", "English"],
    region: "Addis Ababa",
    rating: 4.9,
    reviews_count: 217,
    years_experience: 14,
    average_review_time_minutes: 70,
    current_review_load: 3,
    max_concurrent_reviews: 6,
    credential_verified: true,
    is_licensed_financial_advisor: false,
    is_available: true,
    ethical_violations: 0,
    bioQuote: "Ethiopian entrepreneurs have wisdom in their bones. I help you turn that into strategy.",
    avatarInitials: "SH",
    consultationFeeETB: 1200,
    consultationFormats: ["video", "in_person", "voice"],
  },
  {
    id: "ca-003",
    name: "Mekdes Alemu",
    nameAmharic: "መቅደስ አለሙ",
    titleAmharic: "ሴቶች ስራ ፈጣሪ አማካሪ",
    role: "business_mentor",
    specialization_sectors: ["Fashion", "Craft", "Cooperative", "Social Enterprise", "Women-led Business"],
    career_stages: ["starting_business", "growing_business", "exploring", "negotiating"],
    languages: ["Amharic", "Oromifa", "English"],
    region: "Oromia",
    rating: 4.7,
    reviews_count: 89,
    years_experience: 7,
    average_review_time_minutes: 60,
    current_review_load: 1,
    max_concurrent_reviews: 4,
    credential_verified: true,
    is_licensed_financial_advisor: false,
    is_available: true,
    ethical_violations: 0,
    bioQuote: "Women-led businesses are the backbone of our communities — let us build yours with confidence.",
    avatarInitials: "MA",
    consultationFeeETB: 900,
    consultationFormats: ["video", "chat", "in_person"],
  },
  {
    id: "ca-004",
    name: "Yonas Tadesse",
    nameAmharic: "ዮናስ ታደሰ",
    titleAmharic: "ስልታዊ ሥራ ፈጠራ አሰልጣኝ",
    role: "sector_specialist",
    specialization_sectors: ["Technology", "Fintech", "Digital Media", "E-commerce"],
    career_stages: ["starting_business", "scaling", "growing_business", "negotiating"],
    languages: ["Amharic", "English"],
    region: "Addis Ababa",
    rating: 4.6,
    reviews_count: 58,
    years_experience: 6,
    average_review_time_minutes: 50,
    current_review_load: 4,
    max_concurrent_reviews: 6,
    credential_verified: true,
    is_licensed_financial_advisor: false,
    is_available: true,
    ethical_violations: 0,
    bioQuote: "Tech entrepreneurship in Ethiopia is a once-in-a-generation opportunity. Let's not waste it.",
    avatarInitials: "YT",
    consultationFeeETB: 1000,
    consultationFormats: ["video", "chat"],
  },
  {
    id: "ca-005",
    name: "Alem Worku",
    nameAmharic: "አለም ወርቁ",
    titleAmharic: "ፍቃደኛ ፋይናንሻል አማካሪ (ፈቃድ ያለው)",
    role: "financial_advisor",
    specialization_sectors: ["All"],
    career_stages: ["negotiating", "starting_business", "scaling", "transitioning"],
    languages: ["Amharic", "English"],
    region: "Addis Ababa",
    rating: 4.9,
    reviews_count: 302,
    years_experience: 18,
    average_review_time_minutes: 90,
    current_review_load: 2,
    max_concurrent_reviews: 4,
    credential_verified: true,
    is_licensed_financial_advisor: true,
    is_available: true,
    ethical_violations: 0,
    bioQuote: "Sound financial decisions are built on clarity — not pressure or guesswork.",
    avatarInitials: "AW",
    consultationFeeETB: 2000,
    consultationFormats: ["video", "in_person"],
  },
];

// ════════════════════════════════════════════════════════════
// Matching algorithm
// ════════════════════════════════════════════════════════════

function scoreAdvisor(advisor: CareerAdvisor, profile: CareerProfile, needsFinancialAdvisor: boolean): number {
  if (!advisor.is_available) return -1;
  if (advisor.ethical_violations > 0) return -1;
  if (advisor.current_review_load >= advisor.max_concurrent_reviews) return -1;
  // If financial advisor specifically needed, restrict to licensed ones
  if (needsFinancialAdvisor && !advisor.is_licensed_financial_advisor) return -1;

  let score = 0;

  // Stage match (highest weight)
  if (advisor.career_stages.includes(profile.careerStage)) score += 40;

  // Sector match
  const sector = profile.sector.toLowerCase();
  const sectorMatch = advisor.specialization_sectors.some(
    (s) => s === "All" || s.toLowerCase().includes(sector) || sector.includes(s.toLowerCase())
  );
  if (sectorMatch) score += 30;

  // Rating bonus
  score += advisor.rating * 4;

  // Load balancing (prefer less loaded)
  const loadRatio = advisor.current_review_load / advisor.max_concurrent_reviews;
  score += (1 - loadRatio) * 10;

  // Experience
  score += Math.min(advisor.years_experience, 15) * 0.5;

  return score;
}

export function assignCareerAdvisor(
  profile: CareerProfile,
  options?: { needsFinancialAdvisor?: boolean; needsMentalwellbeingReferral?: boolean }
): ExpertAssignmentResult | null {
  const needsFinancialAdvisor = options?.needsFinancialAdvisor ?? false;
  const needsMentalwellbeingReferral = options?.needsMentalwellbeingReferral ?? false;

  if (needsMentalwellbeingReferral) {
    // Return a referral notice instead of a career advisor
    return null;
  }

  const scored = ADVISOR_POOL
    .map((advisor) => ({
      advisor,
      score: scoreAdvisor(advisor, profile, needsFinancialAdvisor),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const selected = scored[0].advisor;
  // Increment load (in production: atomic DB update)
  selected.current_review_load += 1;

  const assignedAt = new Date().toISOString();
  const reviewWindowEnd = new Date(
    Date.now() + selected.average_review_time_minutes * 60 * 1000
  ).toISOString();

  return {
    advisor: selected,
    estimatedReviewMinutes: selected.average_review_time_minutes,
    assignedAt,
    reviewWindowEnd,
  };
}

// ════════════════════════════════════════════════════════════
// Report generation
// ════════════════════════════════════════════════════════════

export function buildCareerReportShell(
  caseId: string,
  profile: CareerProfile,
  assignment: ExpertAssignmentResult
): CareerReport {
  return {
    id: crypto.randomUUID(),
    caseId,
    status: "expert_review_pending",
    generatedAt: new Date().toISOString(),
    profile,
    timingWindow: {
      currentLabel: "Pending timing calculation",
      currentScore: 0,
      bestActionDate: "Pending",
      lunarPhaseNote: "Pending",
    },
    aiAnalysis: {
      situationSummary: "Pending AI analysis",
      strengths: [],
      challenges: [],
      strategicRecommendations: [],
      networkingSuggestions: [],
      sectorInsights: "Pending",
    },
    culturalIntegration: {
      numerologySummary: "Pending gematria calculation",
      auspiciousActionNote: "Pending timing window",
      communityAngle: "Pending",
    },
    expertNarrative: {
      summary: "Pending expert review",
      advisorName: assignment.advisor.name,
      advisorRole: assignment.advisor.role,
      reviewedAt: assignment.reviewWindowEnd,
      signature: `${assignment.advisor.name} · ${assignment.advisor.role.replace(/_/g, " ")}`,
    },
    financialDisclaimer:
      "This report provides optional cultural and spiritual reflection only. It does not provide career, financial, investment, scientific, or predictive advice.",
    lockedSections: ["culturalReflection", "spiritualInterpretation", "communityTraditions"],
  };
}

export function getAvailableAdvisors(): CareerAdvisor[] {
  return ADVISOR_POOL.filter(
    (a) =>
      a.is_available &&
      a.ethical_violations === 0 &&
      a.current_review_load < a.max_concurrent_reviews
  );
}
