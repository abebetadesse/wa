/**
 * Career & Business Timing Engine — Case 3
 * Calculates auspicious windows using Awde Negest timing,
 * Ge'ez Fidel name gematria for career/business context,
 * and Ethiopian lunar calendar business timing cycles.
 */

import { calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";
import { getAwudeNegestWindow } from "@/lib/cultural/awudeNegestEngine";

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════

export type CareerStage =
  | "exploring"
  | "job_seeking"
  | "negotiating"
  | "starting_business"
  | "growing_business"
  | "transitioning"
  | "scaling"
  | "recovering";

export type BusinessType =
  | "sole_trader"
  | "partnership"
  | "cooperative"
  | "informal"
  | "formal_registered"
  | "franchise"
  | "social_enterprise"
  | "not_yet_started";

export interface CareerProfile {
  geezName: string;
  motherGeezName: string;
  birthEthiopianYear?: number;
  careerStage: CareerStage;
  businessType: BusinessType;
  sector: string;
  yearsInCurrentField: number;
  hasExistingBusiness: boolean;
  topGoal: string;
}

export interface AuspiciousWindow {
  dateRange: { start: string; end: string };
  awdeCircle: string;
  score: number; // 1-10
  label: "highly_auspicious" | "favorable" | "neutral" | "avoid";
  actionRecommendation: string;
  ritualNote?: string;
  warningNote?: string;
}

export interface CareerNumerology {
  nameSum: number;
  motherSum: number;
  totalSum: number;
  lifePathNumber: number;
  businessNumber: number;
  careerElement: string;
  careerElementAmharic: string;
  luckyDays: string[];
  luckyColors: string[];
  avoidDays: string[];
  narrativeSummary: string;
}

export interface TimingAnalysis {
  numerology: CareerNumerology;
  currentWindow: AuspiciousWindow;
  nextThreeWindows: AuspiciousWindow[];
  recommendedActionMonth: string;
  bestDayOfWeek: string;
  bestDayAmharic: string;
  lunarPhaseNote: string;
}

// ════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════

const CAREER_ELEMENTS: Record<number, { english: string; amharic: string; luckyDays: string[]; avoidDays: string[]; luckyColors: string[] }> = {
  1: { english: "Fire — Leadership & Initiative", amharic: "እሳት — አመራርና ተነሳሽነት", luckyDays: ["Monday", "Wednesday"], avoidDays: ["Saturday"], luckyColors: ["Red", "Orange", "Gold"] },
  2: { english: "Water — Collaboration & Flow", amharic: "ውሃ — ትብብርና ፍሰት", luckyDays: ["Tuesday", "Friday"], avoidDays: ["Sunday"], luckyColors: ["Blue", "Silver", "White"] },
  3: { english: "Earth — Stability & Foundation", amharic: "መሬት — ጸጋና መሠረት", luckyDays: ["Thursday", "Saturday"], avoidDays: ["Monday"], luckyColors: ["Green", "Brown", "Yellow"] },
  4: { english: "Wind — Communication & Networks", amharic: "ነፋስ — ግንኙነትና አውታሮች", luckyDays: ["Wednesday", "Sunday"], avoidDays: ["Friday"], luckyColors: ["Purple", "Teal", "Grey"] },
  5: { english: "Metal — Reflection & Discernment", amharic: "ብረት — ነጸብራቅና ማስተዋል", luckyDays: ["Tuesday", "Thursday"], avoidDays: ["Wednesday"], luckyColors: ["Silver", "Black", "Navy"] },
  6: { english: "Light — Vision & Innovation", amharic: "ብርሃን — ራዕይና ፈጠራ", luckyDays: ["Monday", "Friday"], avoidDays: ["Tuesday"], luckyColors: ["Gold", "White", "Cream"] },
  7: { english: "Spirit — Wisdom & Discernment", amharic: "መንፈስ — ጥበብና ማስተዋል", luckyDays: ["Sunday", "Thursday"], avoidDays: ["Saturday"], luckyColors: ["Indigo", "Violet", "White"] },
  8: { english: "Thunder — Voice & Transformation", amharic: "ነጎድጓድ — ድምፅና ለውጥ", luckyDays: ["Saturday", "Monday"], avoidDays: ["Thursday"], luckyColors: ["Black", "Gold", "Red"] },
  9: { english: "Rainbow — Completion & Legacy", amharic: "ቀስተ ደመና — ፍጻሜና ቅርስ", luckyDays: ["Friday", "Sunday"], avoidDays: ["Tuesday"], luckyColors: ["Multicolor", "White", "Gold"] },
  10: { english: "Moon — Intuition & Cycles", amharic: "ጨረቃ — ስሜትና ዑደቶች", luckyDays: ["Monday", "Tuesday"], avoidDays: ["Friday"], luckyColors: ["Silver", "White", "Pearl"] },
  11: { english: "Sun — Purpose & Vitality", amharic: "ፀሐይ — ዓላማና ህይወት", luckyDays: ["Wednesday", "Thursday"], avoidDays: ["Monday"], luckyColors: ["Yellow", "Orange", "Gold"] },
  12: { english: "Star — Aspiration & Journey", amharic: "ኮከብ — ምኞትና ጉዞ", luckyDays: ["Friday", "Saturday"], avoidDays: ["Wednesday"], luckyColors: ["Blue", "Teal", "Silver"] },
};

const DAY_AMHARIC: Record<string, string> = {
  Monday: "ሰኞ",
  Tuesday: "ማክሰኞ",
  Wednesday: "ረቡዕ",
  Thursday: "ሐሙስ",
  Friday: "አርብ",
  Saturday: "ቅዳሜ",
  Sunday: "እሁድ",
};

const STAGE_ACTION_RECOMMENDATIONS: Record<CareerStage, string> = {
  exploring: "Use this window to gather information, speak to mentors, and clarify your direction. Do not sign anything or make permanent decisions yet.",
  job_seeking: "Focus on applications, networking, and building a portfolio. Formal submissions made in auspicious windows carry stronger momentum.",
  negotiating: "Initiate salary or contract negotiations. Begin conversations on a lucky day and aim to conclude agreements before the window closes.",
  starting_business: "Register the business name, open bank accounts, or make your first public announcement. Start on a favorable day for maximum alignment.",
  growing_business: "Hire, expand products, or enter new markets. This stage benefits most from calculated action with precise timing.",
  transitioning: "Step back before stepping forward. This window favors reflection, graceful exits, and laying groundwork for the next chapter.",
  scaling: "Seek investors, form partnerships, or launch major campaigns. Scaling requires building on a strong timing foundation.",
  recovering: "Recovery needs steady energy. Focus on restructuring internally. Avoid major public moves until a highly auspicious window opens.",
};

// ════════════════════════════════════════════════════════════
// Core calculation
// ════════════════════════════════════════════════════════════

export function calculateCareerNumerology(profile: CareerProfile): CareerNumerology {
  let nameSum = 0;
  let motherSum = 0;

  // Use spiritual divination engine for base gematria
  try {
    const divination = calculateFullDivination(profile.geezName, profile.motherGeezName);
    nameSum = divination.nameSubtotal ?? 0;
    motherSum = divination.motherSubtotal ?? 0;
  } catch {
    // Fallback: simple character code sum
    for (const ch of profile.geezName) nameSum += ch.codePointAt(0) ?? 0;
    for (const ch of profile.motherGeezName) motherSum += ch.codePointAt(0) ?? 0;
    nameSum = nameSum % 144;
    motherSum = motherSum % 144;
  }

  const totalSum = nameSum + motherSum;
  const dividedBy12 = Math.floor(totalSum / 12);
  const lifePathNumber = ((dividedBy12 - 1 + 12) % 12) + 1; // 1–12
  const businessNumber = ((totalSum % 12) || 12); // 1–12
  const elementKey = lifePathNumber;
  const element = CAREER_ELEMENTS[elementKey] ?? CAREER_ELEMENTS[1];

  const narrativeSummary = buildCareerNarrative(lifePathNumber, businessNumber, element.english);

  return {
    nameSum,
    motherSum,
    totalSum,
    lifePathNumber,
    businessNumber,
    careerElement: element.english,
    careerElementAmharic: element.amharic,
    luckyDays: element.luckyDays,
    luckyColors: element.luckyColors,
    avoidDays: element.avoidDays,
    narrativeSummary,
  };
}

function buildCareerNarrative(
  lifePathNumber: number,
  businessNumber: number,
  element: string
): string {
  return `In this Ge'ez numerology tradition, the number ${lifePathNumber} and the ${element} association are symbolic cultural interpretations. The number ${businessNumber} is another traditional association. Meanings differ between practitioners; these associations do not measure ability, determine career suitability, or predict outcomes.`;
}

// ════════════════════════════════════════════════════════════
// Timing window generation
// ════════════════════════════════════════════════════════════

export function calculateTimingWindows(profile: CareerProfile): TimingAnalysis {
  const numerology = calculateCareerNumerology(profile);
  const awdeWindow = getAwudeNegestWindow ? getAwudeNegestWindow(new Date()) : null;

  const windows = generateNextWindows(numerology, profile.careerStage, 4);
  const [currentWindow, ...nextThreeWindows] = windows;

  const bestDayOfWeek = numerology.luckyDays[0] ?? "Thursday";

  return {
    numerology,
    currentWindow,
    nextThreeWindows,
    recommendedActionMonth: getRecommendedMonth(profile.careerStage, numerology.lifePathNumber),
    bestDayOfWeek,
    bestDayAmharic: DAY_AMHARIC[bestDayOfWeek] ?? "ሐሙስ",
    lunarPhaseNote: awdeWindow
      ? `Current Awde Negest window: ${String(awdeWindow)}`
      : getLunarPhaseNote(numerology.lifePathNumber),
  };
}

function generateNextWindows(
  numerology: CareerNumerology,
  stage: CareerStage,
  count: number
): AuspiciousWindow[] {
  const windows: AuspiciousWindow[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const start = new Date(now);
    start.setDate(start.getDate() + i * 14); // ~14-day windows

    const end = new Date(start);
    end.setDate(end.getDate() + 13);

    const score = calculateWindowScore(numerology, i, stage);
    const label = scoreToLabel(score);

    windows.push({
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
      awdeCircle: `Circle ${((numerology.lifePathNumber + i - 1) % 16) + 1}`,
      score,
      label,
      actionRecommendation: label === "highly_auspicious" || label === "favorable"
        ? STAGE_ACTION_RECOMMENDATIONS[stage]
        : "Hold major decisions. Focus on preparation, reflection, and internal work.",
      ritualNote: label === "highly_auspicious"
        ? `Begin with a morning prayer or blessing ritual on ${numerology.luckyDays[0]}. Light a white candle and speak your intention clearly.`
        : undefined,
      warningNote: label === "avoid"
        ? `Avoid signing contracts, making major investments, or announcing pivotal decisions during this window.`
        : undefined,
    });
  }

  return windows;
}

function calculateWindowScore(numerology: CareerNumerology, offset: number, stage: CareerStage): number {
  const base = ((numerology.lifePathNumber * 3 + numerology.businessNumber * 2 + offset * 7) % 10) + 1;
  const stageBonus: Partial<Record<CareerStage, number>> = {
    starting_business: 1,
    scaling: 1,
    recovering: -1,
  };
  return Math.min(10, Math.max(1, base + (stageBonus[stage] ?? 0)));
}

function scoreToLabel(score: number): AuspiciousWindow["label"] {
  if (score >= 8) return "highly_auspicious";
  if (score >= 6) return "favorable";
  if (score >= 4) return "neutral";
  return "avoid";
}

function getRecommendedMonth(stage: CareerStage, lifePathNumber: number): string {
  const ethiopianMonths = [
    "Meskerem (September)", "Tikimit (October)", "Hidar (November)", "Tahisas (December)",
    "Tir (January)", "Yekatit (February)", "Megabit (March)", "Miazia (April)",
    "Ginbot (May)", "Sene (June)", "Hamle (July)", "Nehase (August)",
  ];
  const idx = (lifePathNumber + (stage === "starting_business" ? 2 : 0)) % 12;
  return ethiopianMonths[idx];
}

function getLunarPhaseNote(lifePathNumber: number): string {
  if (lifePathNumber <= 4) return "New moon phase — best for starting and planting seeds of new ventures.";
  if (lifePathNumber <= 8) return "Waxing moon phase — best for growth, expansion, and building momentum.";
  if (lifePathNumber <= 11) return "Full moon phase — best for completion, visibility, and major announcements.";
  return "Waning moon phase — best for releasing, restructuring, and internal refinement.";
}
