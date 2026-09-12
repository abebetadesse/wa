/**
 * Multi-Dimensional Compatibility Analyzer Engine
 * Integrating best practices from The Pattern (6 Bond Categories) and CUE Astrology (Brand/Company/Date Analysis)
 */

import { CompatibilityReport, ThePatternBondCategory } from "../extendedTypes";
import { calculateCelestialPositions } from "../astrology/chartCalculator";
import { calculateDanMillmanLifePath } from "../numerology/danMillmanNumerology";
import { calculateAwudeNegestReading } from "@/lib/cultural/awudeNegestEngine";

// Harmonious sun sign elemental pairs
const ELEMENT_MAP: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

/**
 * Analyzes multi-dimensional compatibility between two profiles or between a person and a brand/company founding date
 */
export function analyzeCompatibility(
  person1: { name: string; birthDate: string; city?: string },
  person2: { name: string; birthDate: string; city?: string; isBrandOrCompany?: boolean }
): CompatibilityReport {
  // 1. Calculate Astrological Charts
  const chart1 = calculateCelestialPositions(person1.birthDate, "12:00", person1.city || "Addis Ababa");
  const chart2 = calculateCelestialPositions(person2.birthDate, "12:00", person2.city || "Addis Ababa");

  const sun1 = chart1.planets.find((p) => p.planet === "Sun")?.sign || "Aries";
  const sun2 = chart2.planets.find((p) => p.planet === "Sun")?.sign || "Taurus";
  const moon1 = chart1.planets.find((p) => p.planet === "Moon")?.sign || "Cancer";
  const moon2 = chart2.planets.find((p) => p.planet === "Moon")?.sign || "Pisces";

  // Astrological score calculation
  let astroScore = 68;
  const elem1 = ELEMENT_MAP[sun1] || "fire";
  const elem2 = ELEMENT_MAP[sun2] || "earth";

  if (elem1 === elem2) astroScore += 18; // Same element
  else if ((elem1 === "fire" && elem2 === "air") || (elem1 === "air" && elem2 === "fire")) astroScore += 16;
  else if ((elem1 === "earth" && elem2 === "water") || (elem1 === "water" && elem2 === "earth")) astroScore += 16;
  else astroScore -= 6; // Element clash

  // Moon harmony
  const moonElem1 = ELEMENT_MAP[moon1] || "water";
  const moonElem2 = ELEMENT_MAP[moon2] || "water";
  if (moonElem1 === moonElem2) astroScore += 10;

  astroScore = Math.max(35, Math.min(98, astroScore));

  // 2. Numerological Life Path
  const lp1 = calculateDanMillmanLifePath(person1.birthDate);
  const lp2 = calculateDanMillmanLifePath(person2.birthDate);

  let numeroScore = 70;
  const p1 = lp1.primaryNumber;
  const p2 = lp2.primaryNumber;

  // Natural numerology affinities
  if (p1 === p2) numeroScore += 16;
  else if (Math.abs(p1 - p2) === 2 || Math.abs(p1 - p2) === 4) numeroScore += 14;
  else if ((p1 === 1 && p2 === 8) || (p1 === 8 && p2 === 1)) numeroScore += 18;
  else if ((p1 === 3 && p2 === 5) || (p1 === 5 && p2 === 3)) numeroScore += 18;
  else if ((p1 === 2 && p2 === 6) || (p1 === 6 && p2 === 2)) numeroScore += 15;
  else numeroScore += 5;

  numeroScore = Math.max(40, Math.min(96, numeroScore));

  // 3. Ethiopian AwudeNegest Circle Alignment
  const awude1 = calculateAwudeNegestReading({ name: person1.name, category: "marriage" });
  const awude2 = calculateAwudeNegestReading({ name: person2.name, category: "marriage" });

  let awudeScore = 72;
  const circleDiff = Math.abs(awude1.circle.number - awude2.circle.number);
  if (circleDiff === 0) awudeScore += 20;
  else if (circleDiff === 4 || circleDiff === 8 || circleDiff === 12) awudeScore += 18;
  else if (awude1.circle.elementalAffinity === awude2.circle.elementalAffinity) awudeScore += 12;
  else if (circleDiff % 2 === 0) awudeScore += 8;
  else awudeScore -= 5;

  awudeScore = Math.max(42, Math.min(97, awudeScore));

  // 4. Overall Score & Bond Category
  const overall = Math.round((astroScore * 0.35 + numeroScore * 0.35 + awudeScore * 0.3));

  let bondCategory: ThePatternBondCategory = "meaningful";
  let bondDescription = "";

  if (overall >= 90) {
    bondCategory = "soulmate";
    bondDescription = "A rare, transcendent alignment across celestial elements, life purposes, and ancestral vibrations. Interactions feel timeless and profoundly catalytic.";
  } else if (overall >= 80) {
    bondCategory = "extraordinary";
    bondDescription = "High natural synergy with profound mutual respect. You stimulate each other's highest growth and easily co-create tangible accomplishments.";
  } else if (overall >= 70) {
    bondCategory = "powerful";
    bondDescription = "Dynamic, magnetic energy characterized by intense focus and shared ambition. Remarkable results when direct communication is maintained.";
  } else if (overall >= 60) {
    bondCategory = "meaningful";
    bondDescription = "Warm, supportive, and emotionally grounding companionship. Provides safe harbor and mutual appreciation.";
  } else if (overall >= 50) {
    bondCategory = "complex";
    bondDescription = "Fascinating differences in pacing and priorities. Demands conscious patience, active listening, and clear boundary management.";
  } else {
    bondCategory = "growth";
    bondDescription = "Karmic mirror dynamic. Challenges you to cultivate patience, develop self-mastery, and appreciate vastly contrasting life views.";
  }

  // Highlights
  const highlights: CompatibilityReport["synastryHighlights"] = [
    {
      title: `${sun1} & ${sun2} Elemental Chemistry`,
      type: elem1 === elem2 || (elem1 === "fire" && elem2 === "air") ? "strength" : "friction",
      description: `${elem1.toUpperCase()} meets ${elem2.toUpperCase()}. ${
        elem1 === elem2
          ? "Shared elemental instincts create effortless mutual understanding."
          : "Different elemental temperaments offer exciting balance once appreciated."
      }`,
    },
    {
      title: `Life Path ${lp1.unreducedNumber} & ${lp2.unreducedNumber} Synergy`,
      type: "strength",
      description: `${person1.name}'s mission of ${lp1.primaryNumber} harmonizes with ${person2.name}'s mission of ${lp2.primaryNumber}, creating mutual accountability.`,
    },
    {
      title: `AwudeNegest Circle #${awude1.circle.number} and #${awude2.circle.number}`,
      type: circleDiff === 0 || circleDiff % 4 === 0 ? "karmic" : "strength",
      description: `Classical Ethiopian tables show an alignment score of ${awudeScore}%. ${awude1.circle.guardianAngel} resonates with ${awude2.circle.guardianAngel}.`,
    },
  ];

  if (person2.isBrandOrCompany) {
    highlights.push({
      title: "Founding Date / Corporate Resonance (CUE Mode)",
      type: "strength",
      description: `Your birth chart indicates strong vocational harmony with this enterprise. Your leadership style aligns with the company's inaugural energy.`,
    });
  }

  return {
    id: `compat_${Date.now()}`,
    profile1: {
      name: person1.name,
      birthDate: person1.birthDate,
      sunSign: sun1,
      lifePath: lp1.unreducedNumber,
      awudeCircle: awude1.circle.number,
    },
    profile2: {
      name: person2.name,
      birthDate: person2.birthDate,
      sunSign: sun2,
      lifePath: lp2.unreducedNumber,
      awudeCircle: awude2.circle.number,
      isBrandOrCompany: person2.isBrandOrCompany,
    },
    scores: {
      astrological: astroScore,
      numerological: numeroScore,
      awudeNegest: awudeScore,
      overall,
    },
    bondCategory,
    bondDescription,
    synastryHighlights: highlights,
    lifePathSynergy: `Life Path ${lp1.unreducedNumber} brings ${lp1.innateGifts[0] || "vitality"}, complemented by ${person2.name}'s ${lp2.unreducedNumber} (${lp2.innateGifts[0] || "resilience"}).`,
    awudeCircleResonance: `Under traditional Ethiopian astrology, Circle #${awude1.circle.number} (${awude1.circle.name}) and Circle #${awude2.circle.number} (${awude2.circle.name}) form a balanced highland bond.`,
    recommendations: [
      `Practice open morning communication to prevent minor misunderstandings.`,
      `Honor each other's individual downtime and personal spiritual reflection.`,
      `In commercial partnerships, explicitly clarify financial roles and legal responsibilities.`,
    ],
  };
}
