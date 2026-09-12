/**
 * Multi-System Numerology Engine
 * Unifies Pythagorean, Chaldean, Dan Millman, and Ethiopian Gematria
 * Inspired by AstroNumer & Numi
 */

import {
  ChaldeanNumerologyData,
  ExtendedNumerologyProfile,
  PersonalDayYearData,
} from "../extendedTypes";
import { calculateDanMillmanLifePath } from "./danMillmanNumerology";
import { calculateLifePath, calculateDestiny, calculateSoulUrge, calculatePersonality, calculateBirthDayNumber } from "./numberCalculator";
import { calculateGeezGematria } from "@/lib/cultural/geezFidelGematria";

// Classical Chaldean letter values (1 to 8; 9 is sacred and omitted from alphabet assignment)
const CHALDEAN_VALUES: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
};

// House color palette resonances for personal cycles
const HOUSE_COLORS: Record<number, { hex: string; house: number; theme: string }> = {
  1: { hex: "#ef4444", house: 1, theme: "1st House (Identity, Vitality, Fresh Beginnings)" },
  2: { hex: "#10b981", house: 2, theme: "2nd House (Resources, Stability, Grounding)" },
  3: { hex: "#38bdf8", house: 3, theme: "3rd House (Eloquence, Curiosity, Local Connections)" },
  4: { hex: "#14b8a6", house: 4, theme: "4th House (Sanctuary, Ancestral Roots, Emotional Hearth)" },
  5: { hex: "#f59e0b", house: 5, theme: "5th House (Joy, Spontaneous Creativity, Play)" },
  6: { hex: "#6366f1", house: 6, theme: "6th House (Somatic Habits, Daily Service, Physical Healing)" },
  7: { hex: "#ec4899", house: 7, theme: "7th House (Relational Harmony, Sacred Mirrors, Balance)" },
  8: { hex: "#8b5cf6", house: 8, theme: "8th House (Depth, Metamorphosis, Shared Regeneration)" },
  9: { hex: "#06b6d4", house: 9, theme: "9th House (Higher Wisdom, Pilgrimage, Expanding Horizons)" },
};

/**
 * Calculates Chaldean Numerology Name Vibration and Compound Meaning
 */
export function calculateChaldeanNumerology(name: string, birthDateStr: string): ChaldeanNumerologyData {
  let sum = 0;
  const clean = name.toLowerCase().replace(/[^a-z]/g, "");
  for (const char of clean) {
    sum += CHALDEAN_VALUES[char] || 0;
  }

  // Reduce to single digit
  let root = sum;
  while (root > 8) {
    if (root === 9) break; // 9 is preserved in Chaldean compound
    root = root
      .toString()
      .split("")
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  }

  const birthDayPart = parseInt(birthDateStr.split("-")[2] || "1", 10);
  let birthDayRoot = birthDayPart;
  while (birthDayRoot > 8 && birthDayRoot !== 9) {
    birthDayRoot = birthDayRoot
      .toString()
      .split("")
      .reduce((acc, d) => acc + parseInt(d, 10), 0);
  }

  const compoundMeanings: Record<number, { meaning: string; days: string[]; gems: string[]; tone: string }> = {
    1: { meaning: "The Creative Solar Initiator. Strong will, independent magnetism, natural inventor.", days: ["Sunday", "Monday"], gems: ["Ruby", "Garnet"], tone: "Majestic, radiant" },
    2: { meaning: "The Lunar Harmonizer. Intuitive diplomacy, peace-weaving, empathetic depth.", days: ["Monday", "Friday"], gems: ["Pearl", "Moonstone"], tone: "Gentle, receptive" },
    3: { meaning: "The Jovian Expander. Optimism, scholarly knowledge, inspirational rhetoric.", days: ["Thursday", "Friday"], gems: ["Yellow Topaz", "Amber"], tone: "Expansive, noble" },
    4: { meaning: "The Earthy Builder. Sturdy realism, structural integrity, resistance to pretense.", days: ["Sunday", "Saturday"], gems: ["Sapphire", "Onyx"], tone: "Steadfast, methodical" },
    5: { meaning: "The Mercurial Explorer. Fast-moving intellect, adaptable communicator, quick wit.", days: ["Wednesday", "Friday"], gems: ["Emerald", "Aquamarine"], tone: "Electric, agile" },
    6: { meaning: "The Venerean Caretaker. Aesthetics, domestic peace, healing sanctuary creator.", days: ["Friday", "Tuesday"], gems: ["Turquoise", "Emerald"], tone: "Harmonious, graceful" },
    7: { meaning: "The Mystical Philosopher. Introspective discernment, sacred research, esoteric vision.", days: ["Sunday", "Monday"], gems: ["Cat's Eye", "Amethyst"], tone: "Contemplative, profound" },
    8: { meaning: "The Saturnian Executive. Material endurance, karmic equilibrium, formidable willpower.", days: ["Saturday", "Sunday"], gems: ["Blue Sapphire", "Black Tourmaline"], tone: "Sovereign, unshakeable" },
    9: { meaning: "The Martial Master. Universal courage, protective defense of truth, fiery resolution.", days: ["Tuesday", "Thursday"], gems: ["Coral", "Bloodstone"], tone: "Dynamic, heroic" },
  };

  const selected = compoundMeanings[root] || compoundMeanings[1];

  return {
    nameVibrationNumber: root,
    birthDayVibrationNumber: birthDayRoot,
    compoundNumberMeaning: `Compound sum ${sum} reduces to vibration ${root}: ${selected.meaning}`,
    luckyDays: selected.days,
    harmoniousGems: selected.gems,
    vibrationalTone: selected.tone,
  };
}

/**
 * Calculates Personal Day, Personal Month, and Personal Year cycles (Numi style)
 */
export function calculatePersonalCycles(birthDateStr: string, targetDateStr?: string): PersonalDayYearData {
  const [bYear, bMonthStr, bDayStr] = birthDateStr.split("-");
  const birthMonth = parseInt(bMonthStr || "1", 10);
  const birthDay = parseInt(bDayStr || "1", 10);

  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth() + 1;
  const currentDay = targetDate.getDate();

  // Personal Year = Birth Month + Birth Day + Current Calendar Year
  const yearSum = birthMonth + birthDay + currentYear;
  let pYear = yearSum;
  while (pYear > 9) {
    pYear = pYear.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }

  // Personal Month = Personal Year + Current Calendar Month
  const monthSum = pYear + currentMonth;
  let pMonth = monthSum;
  while (pMonth > 9) {
    pMonth = pMonth.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }

  // Personal Day = Personal Month + Current Calendar Day
  const daySum = pMonth + currentDay;
  let pDay = daySum;
  while (pDay > 9) {
    pDay = pDay.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }

  const houseInfo = HOUSE_COLORS[pDay] || HOUSE_COLORS[1];

  const affirmations: Record<number, { affirmation: string; prompt: string; pacing: "Accelerate" | "Consolidate" | "Reflect" | "Rest" }> = {
    1: {
      affirmation: "Today, I plant seeds of original vision with unshakeable confidence in my authentic path.",
      prompt: "What new initiative or mindset is calling for your courageous first step today?",
      pacing: "Accelerate",
    },
    2: {
      affirmation: "Today, I honor gentle pacing, listening deeply to subtle relational and somatic cues.",
      prompt: "Where can you invite collaborative ease rather than pushing through resistance?",
      pacing: "Consolidate",
    },
    3: {
      affirmation: "Today, my authentic voice brings joy, clarity, and creative inspiration to those around me.",
      prompt: "How can you express what has felt unspoken with warmth and kindness?",
      pacing: "Accelerate",
    },
    4: {
      affirmation: "Today, I build enduring stability through methodical attention to foundational details.",
      prompt: "What practical structure or habit will anchor your nervous system today?",
      pacing: "Consolidate",
    },
    5: {
      affirmation: "Today, I welcome fresh curiosity, adapting flexibly to unexpected invitations.",
      prompt: "What outdated routine are you ready to loosen to make room for spontaneous vitality?",
      pacing: "Accelerate",
    },
    6: {
      affirmation: "Today, I nurture my domestic sanctuary and extend compassionate care without taking on others' burdens.",
      prompt: "How can you bring harmony and aesthetic beauty into your physical surroundings?",
      pacing: "Reflect",
    },
    7: {
      affirmation: "Today, I retreat into sacred quietude, allowing deeper spiritual wisdom to surface.",
      prompt: "What insights reveal themselves when you silence external noise for thirty minutes?",
      pacing: "Rest",
    },
    8: {
      affirmation: "Today, I step into ethical authority, directing my energy and resources with sovereign clarity.",
      prompt: "Where in your financial or professional life can you claim greater self-respect?",
      pacing: "Accelerate",
    },
    9: {
      affirmation: "Today, I release outgrown attachments with gratitude, celebrating completion and generous goodwill.",
      prompt: "What emotional burden or incomplete project can you peacefully close today?",
      pacing: "Reflect",
    },
  };

  const selectedCycle = affirmations[pDay] || affirmations[1];

  return {
    personalDay: pDay,
    personalMonth: pMonth,
    personalYear: pYear,
    houseColor: houseInfo.hex,
    astrologicalHouseResonance: houseInfo.house,
    dailyAffirmation: selectedCycle.affirmation,
    journalPrompt: selectedCycle.prompt,
    suggestedPacing: selectedCycle.pacing,
  };
}

/**
 * Builds the complete multi-system numerology profile
 */
export function buildMultiSystemNumerologyProfile(
  fullName: string,
  birthDateStr: string,
  geEzName?: string
): ExtendedNumerologyProfile {
  const pythagorean = {
    lifePath: calculateLifePath(birthDateStr),
    destinyNumber: calculateDestiny(fullName),
    soulUrge: calculateSoulUrge(fullName),
    personalityNumber: calculatePersonality(fullName),
    birthDayNumber: calculateBirthDayNumber(birthDateStr),
  };

  const chaldean = calculateChaldeanNumerology(fullName, birthDateStr);
  const danMillman = calculateDanMillmanLifePath(birthDateStr);
  const personalCycles = calculatePersonalCycles(birthDateStr);

  const textForGematria = geEzName || fullName;
  const gematriaRes = calculateGeezGematria(textForGematria);

  return {
    pythagorean,
    chaldean,
    danMillman,
    personalCycles,
    geezGematria: {
      totalWeight: gematriaRes.totalNumericalSum,
      digitalRoot: gematriaRes.reducedDigitValue,
      virtue: gematriaRes.philosophicalVirtue,
      biblicalResonance: gematriaRes.biblicalResonance,
    },
  };
}
