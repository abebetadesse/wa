/**
 * Expert Assignment, Review Gate, Report Generation, and Healing Scroll Engine
 * for Case 1 (Spiritual & Life Direction)
 */

import fs from "fs";
import path from "path";
import { FullDivinationResult, calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";
import { evaluateSpiritualCrisis, generateDynamicQuestions, CrisisScreenResult } from "./spiritualQuestionEngine";
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
    birthContext?: {
      birthDate?: string;
      birthLocationName?: string;
      birthLatitude?: number;
      birthLongitude?: number;
    };
  };
  culturalInterpretation: {
    narrative: string;
    references: string[];
    expertSignature?: string;
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
  expert?: {
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
  userId?: string;
  createdAt: string;
  lastUpdated: string;
  status: SpiritualCaseStatus;
  nameGeez: string;
  motherNameGeez: string;
  birthDate?: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthLocationName?: string;
  birthLatitude?: number;
  birthLongitude?: number;
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
    specialization_tags: ["family", "relationships", "wellbeing", "life_direction"],
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

// Active spiritual case storage (Singleton on globalThis to survive Next.js HMR & bundle isolation)
const globalForSpiritual = globalThis as unknown as {
  _spiritualCases?: Map<string, SpiritualCaseSession>;
};
export const spiritualCases: Map<string, SpiritualCaseSession> =
  globalForSpiritual._spiritualCases ?? new Map<string, SpiritualCaseSession>();
globalForSpiritual._spiritualCases = spiritualCases;

const CACHE_DIR = path.resolve(process.cwd(), ".cases_cache", "spiritual");

function persistCaseToDisk(session: SpiritualCaseSession) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(
      path.join(CACHE_DIR, `${session.id}.json`),
      JSON.stringify(session, null, 2),
      "utf8"
    );
  } catch {
    // Non-fatal if filesystem is restricted
  }
}

function loadCaseFromDisk(id: string): SpiritualCaseSession | undefined {
  try {
    const file = path.join(CACHE_DIR, `${id}.json`);
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf8")) as SpiritualCaseSession;
      spiritualCases.set(id, data);
      return data;
    }
  } catch {
    // Non-fatal
  }
  return undefined;
}

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
  const name = gematria.nameGeez || "Name not supplied";
  const circleNum = gematria.awdeCircle?.number;

  const prayers = [
    `A personal reflection for ${name}: May I approach ${category.replaceAll("_", " ")} with clarity, patience, and care.`,
    "A quiet moment can help clarify what matters and what next step is within reach.",
  ];

  const wordsOfPower = [
    `Chosen focus: ${category.replaceAll("_", " ")}`,
    circleNum ? `Circle ${circleNum}: ${gematria.awdeCircle?.name || gematria.awdeCircle?.nameAmharic}` : "Name-based cultural symbolism",
  ];

  const imagery = [
    "A private space for reflection",
    "A written intention for the selected focus",
    `A symbolic reference to ${gematria.awdeCircle?.name || "the name calculation"}`,
  ];

  return {
    pdfUrl: "",
    previewUrl: "",
    title: `Reflective reading for ${name}`,
    prayers,
    wordsOfPower,
    imagery,
    patronAngel: circleNum === 8 ? "ቅዱስ ሩፋኤልና ቅድስት ማርያም" : "Not specified",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates full personalized spiritual report
 */
export function generateSpiritualReport(session: SpiritualCaseSession, expert?: Expert): SpiritualReport {
  const { gematria, nameGeez, motherNameGeez, category } = session;
  const now = new Date().toISOString();

  const scroll = generateHealingScroll(gematria, category);
  const categoryLabel = category.replaceAll("_", " ");
  const responseContext = Object.entries(session.answers)
    .filter(([key, value]) => key !== "question_category" && typeof value === "string" && value.trim())
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${String(value).trim()}`)
    .slice(0, 5);
  const circleDescription = gematria.awdeCircle
    ? ` Circle ${gematria.awdeCircle.number} (${gematria.awdeCircle.name}, ${gematria.awdeCircle.nameAmharic}).`
    : "";
  const answerSummary = responseContext.length
    ? ` Your submitted reflections: ${responseContext.join("; ")}.`
    : " You did not add a written reflection.";
  const narrative = `This optional cultural reading was calculated from the Ge'ez name ${nameGeez}${motherNameGeez ? ` and the supplied mother's name ${motherNameGeez}` : ""}. The name calculation returned total ${gematria.totalSum} and final value ${gematria.finalNumber}.${circleDescription} You selected ${categoryLabel}.${answerSummary} These symbolic traditions are for reflection only; they do not predict outcomes or establish personal traits.`;

  const culturalInterpretation = {
    narrative: `Reflection prompt for ${categoryLabel}: Which part of the situation you described feels most important to you, and what small, practical next step would you choose?${answerSummary} This prompt is generated from your submitted answers and is not a claim about your character or future.`,
    references: ["No manuscript-specific source was verified for this generated reflection."],
    expertSignature: expert ? `${expert.name}, ${expert.credential} (${expert.titleAmharic})` : undefined,
  };

  const practicalGuidance = {
    steps: [
      {
        order: 1,
        title: "Clarify the focus",
        description: `Write one sentence about what you want to understand regarding ${categoryLabel}.`,
      },
      {
        order: 2,
        title: "Choose a manageable next step",
        description: "Identify one action you can take safely and voluntarily, and decide when you will review how it went.",
      },
      {
        order: 3,
        title: "Use support if helpful",
        description: "Consider discussing your reflection with someone you trust; seek qualified professional support for health, safety, legal, or financial needs.",
      },
    ],
    expertNotes: expert
      ? `Prepared for review by ${expert.name}; expert approval has not yet been recorded.`
      : "This is an automatically generated draft. No human expert review is recorded.",
  };

  const recommendedRitual = {
    title: "Optional quiet reflection",
    description: "If it fits your own beliefs, take a few quiet minutes to reflect or pray in your own way. No ritual or material is required.",
    timing: "Choose a time that feels comfortable to you.",
    materials: ["None required"],
    expertNotes: "Optional cultural or spiritual reflection only; it is not treatment or a promised outcome.",
  };

  return {
    id: `report-${session.id}`,
    caseId: session.id,
    status: session.status,
    generatedAt: now,
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
      birthContext: session.birthDate || session.birthLocationName
        ? {
            birthDate: session.birthDate,
            birthLocationName: session.birthLocationName,
            birthLatitude: session.birthLatitude,
            birthLongitude: session.birthLongitude,
          }
        : undefined,
    },
    culturalInterpretation,
    practicalGuidance,
    recommendedRitual,
    healingScroll: scroll,
    expert: expert ? {
      id: expert.id,
      name: expert.name,
      credential: expert.credential,
      rating: expert.rating,
      bioQuote: expert.bioQuote,
      avatarUrl: expert.avatarUrl,
    } : undefined,
  };
}

/**
 * Initializes a new Spiritual Case session
 */
export function startSpiritualCase(
  nameGeez: string,
  motherNameGeez: string = "",
  userId?: string,
  birthContext?: {
    birthDate?: string;
    birthLocationName?: string;
    birthLatitude?: number;
    birthLongitude?: number;
  },
): SpiritualCaseSession {
  const normalizedName = nameGeez.trim();
  if (!normalizedName) {
    throw new Error("Your name is required to start Case 1.");
  }
  const gematria = calculateFullDivination(nameGeez, motherNameGeez);
  if (!gematria.isValid) {
    throw new Error("Enter a valid Ge'ez or Amharic name before starting the reading.");
  }
  if (birthContext?.birthDate) {
    const parsedDate = new Date(`${birthContext.birthDate}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== birthContext.birthDate) {
      throw new Error("Enter a valid birth date or leave it blank.");
    }
  }
  const now = new Date().toISOString();
  const id = `spiritual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const session: SpiritualCaseSession = {
    id,
    userId,
    createdAt: now,
    lastUpdated: now,
    status: "case_received",
    nameGeez: gematria.nameGeez,
    motherNameGeez: gematria.motherNameGeez,
    birthDate: birthContext?.birthDate,
    birthYear: birthContext?.birthDate ? Number(birthContext.birthDate.slice(0, 4)) : undefined,
    birthMonth: birthContext?.birthDate ? Number(birthContext.birthDate.slice(5, 7)) : undefined,
    birthDay: birthContext?.birthDate ? Number(birthContext.birthDate.slice(8, 10)) : undefined,
    birthLocationName: birthContext?.birthLocationName,
    birthLatitude: birthContext?.birthLatitude,
    birthLongitude: birthContext?.birthLongitude,
    category: "life_direction",
    gematria,
    answers: {},
    crisisScreen: { isCrisis: false, urgencyLevel: "routine" },
    estimatedMinutesRemaining: 384, // 6h 24m
    paymentConfirmed: false,
  };

  spiritualCases.set(id, session);
  persistCaseToDisk(session);
  return session;
}

/**
 * Retrieves a spiritual case session
 */
export function getSpiritualCase(id: string): SpiritualCaseSession | undefined {
  if (!id) return undefined;
  let existing = spiritualCases.get(id);
  if (!existing) {
    existing = loadCaseFromDisk(id);
  }
  if (existing) return existing;
  return undefined;
}

export function getOwnedSpiritualCase(id: string, userId?: string | null): SpiritualCaseSession | undefined {
  if (!userId) return undefined;
  const session = getSpiritualCase(id);
  if (!session) return undefined;
  return session.userId === userId ? session : undefined;
}

/**
 * Submits case answers and runs triage, crisis checks, and expert assignment
 */
export async function submitSpiritualCase(
  id: string,
  answers: Record<string, any>
): Promise<SpiritualCaseSession> {
  const session = getSpiritualCase(id);
  if (!session) {
    throw new Error("Case not found");
  }

  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new Error("Please provide valid answers before continuing.");
  }
  if (Object.keys(answers).length > 60 || Object.values(answers).some((value) =>
    typeof value === "string" && value.length > 4000
  )) {
    throw new Error("The submitted answers exceed the allowed size.");
  }
  session.answers = { ...session.answers, ...answers };
  const allowedCategories = ["life_direction", "career", "relationships", "wellbeing", "family", "spiritual_growth", "other"];
  const submittedCategory = answers.question_category || session.category || "life_direction";
  if (!allowedCategories.includes(submittedCategory)) {
    throw new Error("Choose a valid spiritual reading focus.");
  }
  session.category = submittedCategory;
  session.lastUpdated = new Date().toISOString();

  // Run crisis check
  const crisisText = Object.values(answers)
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  const crisisResult = evaluateSpiritualCrisis(crisisText, answers);
  session.crisisScreen = crisisResult;

  if (crisisResult.isCrisis) {
    session.status = "visible_to_user";
    session.lastUpdated = new Date().toISOString();
    persistCaseToDisk(session);
    return session;
  }

  const missingQuestion = generateDynamicQuestions(session.gematria, session.category, session.answers)
    .find((question) => question.required && (
      session.answers[question.id] === undefined ||
      (typeof session.answers[question.id] === "string" && !session.answers[question.id].trim()) ||
      (Array.isArray(session.answers[question.id]) && session.answers[question.id].length === 0)
    ));
  if (missingQuestion) {
    throw new Error(`Please answer the required question: ${missingQuestion.id}`);
  }

  session.status = "divination_calculated";

  persistCaseToDisk(session);
  return session;
}

export async function processSpiritualCase(id: string): Promise<SpiritualCaseSession> {
  const session = getSpiritualCase(id);
  if (!session) throw new Error("Case not found");
  if (session.crisisScreen.isCrisis) {
    throw new Error("CRISIS_SUPPORT_REQUIRED");
  }
  if (session.status === "ai_draft_prepared" && session.report) return session;
  if (session.status !== "divination_calculated" && session.status !== "ai_draft_prepared") {
    throw new Error("INTAKE_NOT_SUBMITTED");
  }

  const report = generateSpiritualReport(session);
  report.aiAnalysis = await synthesizeCaseReportAnalysis("spiritual", {
    answers: session.answers,
    category: session.category,
    gematria: session.gematria,
    nameGeez: session.nameGeez,
    motherNameGeez: session.motherNameGeez,
  });
  session.status = "ai_draft_prepared";
  report.status = session.status;
  session.report = report;
  session.lastUpdated = new Date().toISOString();
  persistCaseToDisk(session);
  return session;
}

/**
 * Expert reviews and signs off on report, unlocking it for user preview
 */
export function expertApproveSpiritualCase(
  caseId: string,
  checklist: { checklistCompleted: boolean; expertNotes?: string }
): SpiritualCaseSession {
  const session = getSpiritualCase(caseId);
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
  persistCaseToDisk(session);

  return session;
}

/**
 * Confirms payment and releases full report + unblurred healing scroll
 */
export function confirmSpiritualPayment(
  caseId: string,
  transaction: { transactionRef: string; paymentMethod?: string }
): SpiritualCaseSession {
  const session = getSpiritualCase(caseId);
  if (!session) throw new Error("Case not found");

  session.paymentConfirmed = true;
  session.transactionRef = transaction.transactionRef;
  session.status = "full_report_released";

  if (session.report) {
    session.report.status = "full_report_released";
  }
  session.lastUpdated = new Date().toISOString();
  persistCaseToDisk(session);

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
  const session = getSpiritualCase(caseId);
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
  persistCaseToDisk(session);

  return session;
}
