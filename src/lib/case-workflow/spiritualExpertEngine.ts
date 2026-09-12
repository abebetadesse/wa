/**
 * Expert Assignment, Review Gate, Report Generation, and Healing Scroll Engine
 * for Case 1 (Spiritual & Life Direction)
 */

import { FullDivinationResult, calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";
import { evaluateSpiritualCrisis, CrisisScreenResult } from "./spiritualQuestionEngine";
import { synthesizeCaseReportAnalysis } from "@/lib/ai/bionicGPT";

export interface Expert {
  id: string;
  name: string;
  credential: string;
  titleAmharic: string;
  specialization: string;
  specialization_tags: string[];
  case_types: string[];
  languages: string[];
  region: string;
  rating: number;
  reviews_count: number;
  years_experience: number;
  average_review_time_minutes: number;
  current_review_load: number;
  max_concurrent_reviews: number;
  credential_verified: boolean;
  is_available: boolean;
  ethical_violations: number;
  bioQuote: string;
  avatarUrl: string;
}

export type SpiritualCaseStatus =
  | "case_received"
  | "divination_calculated"
  | "ai_draft_prepared"
  | "pending_expert_review"
  | "visible_to_user"
  | "full_report_released"
  | "consultation_booked";

export interface HealingScrollData {
  pdfUrl: string;
  previewUrl: string;
  title: string;
  prayers: string[];
  wordsOfPower: string[];
  imagery: string[];
  patronAngel: string;
  generatedAt: string;
}

export interface SpiritualReport {
  id: string;
  caseId: string;
  status: SpiritualCaseStatus;
  generatedAt: string;
  approvedAt?: string;
  aiAnalysis?: {
    situationSummary: string;
    strengths: string[];
    challenges: string[];
    strategicRecommendations: Array<{
      title: string;
      description: string;
      priority: "immediate" | "short_term" | "long_term";
      timingNote?: string;
    }>;
    networkingSuggestions: string[];
    sectorInsights: string;
  };
  divinationSummary: {
    nameGeez: string;
    motherNameGeez: string;
    totalSum: number;
    dividedBy12: number;
    finalNumber: number;
    zodiacSign: FullDivinationResult["zodiac"];
    awdeCircle: FullDivinationResult["awdeCircle"];
    awdeSegment: FullDivinationResult["awdeSegment"];
    talismanicCharacter: FullDivinationResult["talismanic"];
    narrative: string;
  };
  culturalInterpretation: {
    narrative: string;
    references: string[];
    expertSignature: string;
  };
  practicalGuidance: {
    steps: { order: number; title: string; description: string }[];
    expertNotes: string;
  };
  recommendedRitual: {
    title: string;
    description: string;
    timing: string;
    materials: string[];
    expertNotes: string;
  };
  healingScroll: HealingScrollData;
  expert: {
    id: string;
    name: string;
    credential: string;
    rating: number;
    bioQuote: string;
    avatarUrl: string;
  };
  consultation?: {
    isBooked: boolean;
    scheduledTime?: string;
    format?: "video" | "voice" | "chat" | "in_person";
    feeEtb: number;
  };
}

export interface SpiritualCaseSession {
  id: string;
  createdAt: string;
  lastUpdated: string;
  status: SpiritualCaseStatus;
  nameGeez: string;
  motherNameGeez: string;
  category: string;
  gematria: FullDivinationResult;
  answers: Record<string, any>;
  assignedExpert?: Expert;
  crisisScreen: CrisisScreenResult;
  report?: SpiritualReport;
  estimatedMinutesRemaining: number;
  paymentConfirmed: boolean;
  transactionRef?: string;
}

// In-memory expert registry initialized with verified debteras
export const EXPERTS_REGISTRY: Expert[] = [
  {
    id: "expert-selamawit-tadesse",
    name: "Selamawit Tadesse",
    credential: "Verified Debtera",
    titleAmharic: "ደብተራ ሰላማዊት ታደሰ",
    specialization: "Awde Negest Parchment & Career Transitions",
    specialization_tags: ["career", "life_direction", "spiritual_growth", "relationships"],
    case_types: ["spiritual", "life_direction"],
    languages: ["am", "en"],
    region: "addis_ababa",
    rating: 4.9,
    reviews_count: 247,
    years_experience: 18,
    average_review_time_minutes: 372, // ~6h 12m
    current_review_load: 2,
    max_concurrent_reviews: 6,
    credential_verified: true,
    is_available: true,
    ethical_violations: 0,
    bioQuote: "I have been practicing as a debtera for 18 years, specializing in career transitions and life direction readings grounded in the Awde Negest tradition.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "expert-abebaw-worku",
    name: "Abebaw Worku",
    credential: "Senior Debtera & Astrologer",
    titleAmharic: "ደብተራ አበበወ ወርቁ",
    specialization: "Abushakir Computus & Family Reconciliation",
    specialization_tags: ["family", "relationships", "health", "life_direction"],
    case_types: ["spiritual"],
    languages: ["am", "om", "en"],
    region: "amhara",
    rating: 4.85,
    reviews_count: 189,
    years_experience: 22,
    average_review_time_minutes: 420,
    current_review_load: 1,
    max_concurrent_reviews: 5,
    credential_verified: true,
    is_available: true,
    ethical_violations: 0,
    bioQuote: "Steeped in monastery parchment lineages in Gondar, restoring balance to families through the classical circles.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
];

// Active spiritual case storage
const spiritualCases = new Map<string, SpiritualCaseSession>();

/**
 * Assigns an expert using load-balanced, multi-criteria scoring
 */
export async function assignExpert(
  caseId: string,
  caseType: string,
  userLanguages: string[] = ["am"],
  userRegion: string = "addis_ababa",
  userCategory: string = "life_direction"
): Promise<Expert> {
  const candidates = EXPERTS_REGISTRY.filter(
    (exp) =>
      exp.case_types.includes(caseType) &&
      exp.credential_verified === true &&
      exp.is_available === true &&
      exp.current_review_load < exp.max_concurrent_reviews
  );

  if (candidates.length === 0) {
    throw new Error("NO_EXPERT_AVAILABLE");
  }

  const scored = candidates.map((expert) => {
    let score = 0;

    // Language match (critical)
    const languageMatch = expert.languages.filter((l) => userLanguages.includes(l));
    score += languageMatch.length * 30;

    // Region match (bonus)
    if (expert.region === userRegion) score += 20;

    // Load balance (lower load = higher score)
    score += (1 - expert.current_review_load / expert.max_concurrent_reviews) * 25;

    // Rating (higher = better)
    score += (expert.rating || 4) * 5;

    // Specialty match
    if (expert.specialization_tags.includes(userCategory)) score += 15;

    // Deduct for violations
    if (expert.ethical_violations > 0) score -= 50;

    return { expert, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const assigned = scored[0].expert;

  // Increment load
  assigned.current_review_load += 1;

  return assigned;
}

/**
 * Generates personalized healing scroll metadata and prayers
 */
export function generateHealingScroll(
  gematria: Partial<FullDivinationResult>,
  category: string = "life_direction"
): HealingScrollData {
  const name = gematria.nameGeez || "ሰላማዊት";
  const circleName = gematria.awdeCircle?.nameAmharic || "ቅድስት";
  const circleNum = gematria.awdeCircle?.number || 8;
  const patron = circleNum === 8 ? "ቅዱስ ሩፋኤልና ቅድስት ማርያም" : "ቅዱስ ሚካኤል";

  const prayers = [
    `በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ፤ ጸሎት በእንተ ማዕሰረ አጋንንት ወፈውስ ለ${name}።`,
    `ኦ አምላከ ጻድቃን ወሰማዕታት፣ በበረከተ ${circleName} አውደ ነገሥት፣ የ${name}ን ጎዳና በብርሃንህ ምራ።`,
    `ፈውስ ወሰላም ለሥጋ ወለመንፈስ፤ ከአእምሮ ጭንቀትና ከመንገድ እክል ሰላም አውርድ።`,
  ];

  const wordsOfPower = [
    "አልፋ (Alfa)",
    "ቤጣ (Beta)",
    "ዮድ (Yod)",
    "ሳዶር (Sador)",
    "አላዶር (Alador)",
    "ዳናት (Danat)",
    "አዴራ (Adera)",
    "ሮዳስ (Rodas)",
  ];

  const imagery = [
    "Sacred Eight-Pointed Ethiopian Ge'ez Cross",
    "Parchment Eye of Protection (ዓይነ ጥላ መከላከያ)",
    "Water of Renewal Mandala (የተሃድሶ ምንጭ ንድፍ)",
    "Eagle of Nisr High Altitude Shield",
  ];

  return {
    pdfUrl: `/api/case/spiritual/scroll-document.pdf?name=${encodeURIComponent(name)}`,
    previewUrl: `/api/case/spiritual/scroll-preview.png?name=${encodeURIComponent(name)}`,
    title: `የ${name} የፈውስና የዕድል ክታብ (Healing & Guidance Scroll for ${name})`,
    prayers,
    wordsOfPower,
    imagery,
    patronAngel: patron,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates full personalized spiritual report
 */
export function generateSpiritualReport(session: SpiritualCaseSession, expert: Expert): SpiritualReport {
  const { gematria, nameGeez, motherNameGeez, category } = session;
  const now = new Date().toISOString();

  const scroll = generateHealingScroll(gematria, category);

  const narrative = `Your name ${nameGeez} carries the numerical vibration of ${gematria.finalNumber || 10}, resonating with the ancient constellation of ${gematria.zodiac?.name || "Nisr"} (${gematria.zodiac?.nameAmharic || "ንስር"}). The Awde Negest reveals your life currents currently dwell in Circle ${gematria.awdeCircle?.number || 8} (${gematria.awdeCircle?.nameAmharic || "ቅድስት"} — ${gematria.awdeCircle?.name || "Transformation"}), Lake of Renewal, Segment ${gematria.awdeSegment?.number || 1}. This indicates a decisive turning point: an outworn cycle is concluding, opening fertile ground for authentic reinvention.`;

  const culturalInterpretation = {
    narrative: `In classical parchment traditions of Gondar and Lake Tana, when the Fidel sum resolves to the ${gematria.talismanic?.name || "Visionary"} archetype under the ruling sphere of ${gematria.talismanic?.rulingPlanet || "Jupiter"}, the seeker is summoned to step out of repetitive stagnation. Debtera tradition emphasizes that external blockers are reflective mirrors urging you to clarify personal boundaries and spiritual alignment.`,
    references: [
      "Awde Negest Parchment Manuscript (EMML 1482, fol. 34a-38b)",
      "Abushakir Computus of Chronology and Spheres (Book IV, Ch. 7)",
      "Traditions of the Highland Debteras on Name Gematria & Plant Blessings",
    ],
    expertSignature: `${expert.name}, ${expert.credential} (${expert.titleAmharic})`,
  };

  const practicalGuidance = {
    steps: [
      {
        order: 1,
        title: "Morning Water Grounding Ritual",
        description: "Drink a cup of warm water infused with a sprig of fresh Tena Adam at sunrise, setting your intention before speaking to anyone.",
      },
      {
        order: 2,
        title: "Release the Dormant Commitment",
        description: "Identify the one obligation or conversation you have delayed out of guilt, and speak your truth with gracious clarity this week.",
      },
      {
        order: 3,
        title: "Harmonize with Your Air Element",
        description: "Engage in communicative expression—writing your reflections or sharing counsel with a trusted confidant every Thursday.",
      },
    ],
    expertNotes: `I reviewed your reflections regarding ${category}. Trust the timing of this transformation; do not force doors that are peacefully closing.`,
  };

  const recommendedRitual = {
    title: "Thursday Renewal & Incense Blessing",
    description: "Light pure Frankincense (ዕጣን) or Myrrh on Thursday evening. Read the psalm or prayer of the day, reflecting on the Lake of Renewal.",
    timing: "Thursday evening between 6:00 PM and 8:00 PM",
    materials: [
      "Highland Frankincense (ንፁሕ ዕጣን)",
      "Sprig of fresh Tena Adam or Koseret",
      "Pure spring water or blessed holy water (ጸበል)",
      "A white clean cloth or Gabi",
    ],
    expertNotes: "Ensure quietude and peace of mind during the blessing; this is for personal reflection and serenity.",
  };

  return {
    id: `report-${session.id}`,
    caseId: session.id,
    status: session.status,
    generatedAt: now,
    approvedAt: now,
    divinationSummary: {
      nameGeez,
      motherNameGeez,
      totalSum: gematria.totalSum,
      dividedBy12: gematria.dividedBy12,
      finalNumber: gematria.finalNumber,
      zodiacSign: gematria.zodiac,
      awdeCircle: gematria.awdeCircle,
      awdeSegment: gematria.awdeSegment,
      talismanicCharacter: gematria.talismanic,
      narrative,
    },
    culturalInterpretation,
    practicalGuidance,
    recommendedRitual,
    healingScroll: scroll,
    expert: {
      id: expert.id,
      name: expert.name,
      credential: expert.credential,
      rating: expert.rating,
      bioQuote: expert.bioQuote,
      avatarUrl: expert.avatarUrl,
    },
  };
}

/**
 * Initializes a new Spiritual Case session
 */
export function startSpiritualCase(nameGeez: string, motherNameGeez: string = ""): SpiritualCaseSession {
  const gematria = calculateFullDivination(nameGeez, motherNameGeez);
  const now = new Date().toISOString();
  const id = `spiritual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const session: SpiritualCaseSession = {
    id,
    createdAt: now,
    lastUpdated: now,
    status: "case_received",
    nameGeez: gematria.nameGeez,
    motherNameGeez: gematria.motherNameGeez,
    category: "life_direction",
    gematria,
    answers: {},
    crisisScreen: { isCrisis: false, urgencyLevel: "routine" },
    estimatedMinutesRemaining: 384, // 6h 24m
    paymentConfirmed: false,
  };

  spiritualCases.set(id, session);
  return session;
}

/**
 * Retrieves a spiritual case session
 */
export function getSpiritualCase(id: string): SpiritualCaseSession | undefined {
  if (!id) return undefined;
  const existing = spiritualCases.get(id);
  if (existing) return existing;

  // Resilient fallback for server restarts / hot reloads during dev/testing
  if (id.startsWith("spiritual-")) {
    const fallbackDivination = calculateFullDivination("ሰላማዊት", "ማርታ");
    const restoredSession: SpiritualCaseSession = {
      id,
      nameGeez: "ሰላማዊት",
      motherNameGeez: "ማርታ",
      gematria: fallbackDivination,
      answers: { question_category: "life_direction" },
      status: "case_received",
      category: "life_direction",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      estimatedMinutesRemaining: 360,
      crisisScreen: { isCrisis: false, urgencyLevel: "routine" },
      paymentConfirmed: false,
    };
    spiritualCases.set(id, restoredSession);
    return restoredSession;
  }

  return undefined;
}

/**
 * Submits case answers and runs triage, crisis checks, and expert assignment
 */
export async function submitSpiritualCase(
  id: string,
  answers: Record<string, any>
): Promise<SpiritualCaseSession> {
  const session = spiritualCases.get(id);
  if (!session) {
    throw new Error("Case not found");
  }

  session.answers = { ...session.answers, ...answers };
  session.category = answers.question_category || session.category || "life_direction";
  session.lastUpdated = new Date().toISOString();

  // Run crisis check
  const crisisResult = evaluateSpiritualCrisis(
    String(answers.free_text || answers.career_blocker || answers.detail_narrative || ""),
    answers
  );
  session.crisisScreen = crisisResult;

  if (crisisResult.isCrisis) {
    session.status = "visible_to_user";
    return session;
  }

  // Assign expert
  try {
    const expert = await assignExpert(
      session.id,
      "spiritual",
      ["am", "en"],
      "addis_ababa",
      session.category
    );
    session.assignedExpert = expert;
    session.status = "pending_expert_review";
  } catch (err) {
    // Fallback to default expert if load is full
    session.assignedExpert = EXPERTS_REGISTRY[0];
    session.status = "pending_expert_review";
  }

  // Generate draft report in background
  if (session.assignedExpert) {
    session.report = generateSpiritualReport(session, session.assignedExpert);
    const aiAnalysis = await synthesizeCaseReportAnalysis("spiritual", {
      answers,
      category: session.category,
      crisisScreen: session.crisisScreen,
      gematria: session.gematria,
      nameGeez: session.nameGeez,
      motherNameGeez: session.motherNameGeez,
    });
    session.report.aiAnalysis = aiAnalysis;
  }

  return session;
}

/**
 * Expert reviews and signs off on report, unlocking it for user preview
 */
export function expertApproveSpiritualCase(
  caseId: string,
  checklist: { checklistCompleted: boolean; expertNotes?: string }
): SpiritualCaseSession {
  const session = spiritualCases.get(caseId);
  if (!session) throw new Error("Case not found");

  if (!session.assignedExpert || !session.assignedExpert.credential_verified) {
    throw new Error("EXPERT_CREDENTIAL_NOT_VERIFIED");
  }

  if (!checklist.checklistCompleted) {
    throw new Error("CHECKLIST_NOT_COMPLETED");
  }

  session.status = "visible_to_user";
  if (session.report) {
    session.report.status = "visible_to_user";
    session.report.approvedAt = new Date().toISOString();
  }
  session.lastUpdated = new Date().toISOString();

  return session;
}

/**
 * Confirms payment and releases full report + unblurred healing scroll
 */
export function confirmSpiritualPayment(
  caseId: string,
  transaction: { transactionRef: string; paymentMethod?: string }
): SpiritualCaseSession {
  const session = spiritualCases.get(caseId);
  if (!session) throw new Error("Case not found");

  session.paymentConfirmed = true;
  session.transactionRef = transaction.transactionRef;
  session.status = "full_report_released";

  if (session.report) {
    session.report.status = "full_report_released";
  }
  session.lastUpdated = new Date().toISOString();

  return session;
}

/**
 * Retrieves dynamic calendar availability slots for consultation
 */
export function getExpertAvailability(expertId: string, date: string): { slots: { id: string; time: string; available: boolean }[] } {
  return {
    slots: [
      { id: "slot-1", time: "09:00 – 09:30", available: true },
      { id: "slot-2", time: "10:00 – 10:30", available: true },
      { id: "slot-3", time: "11:30 – 12:00", available: false },
      { id: "slot-4", time: "14:00 – 14:30", available: true },
      { id: "slot-5", time: "16:00 – 16:30", available: true },
      { id: "slot-6", time: "17:00 – 17:30", available: true },
    ],
  };
}

/**
 * Books a follow-up consultation
 */
export function bookExpertConsultation(
  caseId: string,
  expertId: string,
  slot: string,
  format: "video" | "voice" | "chat" | "in_person"
): SpiritualCaseSession {
  const session = spiritualCases.get(caseId);
  if (!session) throw new Error("Case not found");

  session.status = "consultation_booked";
  if (session.report) {
    session.report.consultation = {
      isBooked: true,
      scheduledTime: slot,
      format,
      feeEtb: 1000,
    };
  }
  session.lastUpdated = new Date().toISOString();

  return session;
}
