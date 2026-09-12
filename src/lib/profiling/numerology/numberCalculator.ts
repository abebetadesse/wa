import { CoreNumberAnalysis, NumerologyProfile } from "../types";
import { getNumerologyMeaning } from "./meaningMapper";
import { getSomatichealthSummary } from "./healthAdapter";
import { calculateGeezGematria } from "@/lib/cultural/geezFidelGematria";

// Standard Pythagorean Letter Values (1 - 9)
const PYTHAGOREAN_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export function reduceToCoreNumber(num: number, preserveMasterNumbers: boolean = true): number {
  if (preserveMasterNumbers && (num === 11 || num === 22 || num === 33)) {
    return num;
  }
  let current = num;
  while (current > 9) {
    if (preserveMasterNumbers && (current === 11 || current === 22 || current === 33)) {
      return current;
    }
    current = current
      .toString()
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return current;
}

export function calculateLifePath(birthDateStr: string): number {
  // Format: YYYY-MM-DD
  const parts = birthDateStr.split("-");
  if (parts.length < 3) return 1;

  const y = parseInt(parts[0], 10) || 1990;
  const m = parseInt(parts[1], 10) || 1;
  const d = parseInt(parts[2], 10) || 1;

  const redYear = reduceToCoreNumber(y, true);
  const redMonth = reduceToCoreNumber(m, true);
  const redDay = reduceToCoreNumber(d, true);

  return reduceToCoreNumber(redYear + redMonth + redDay, true);
}

export function calculateDestiny(fullName: string): number {
  let sum = 0;
  const clean = fullName.toLowerCase().replace(/[^a-z]/g, "");
  for (const char of clean) {
    sum += PYTHAGOREAN_VALUES[char] || 0;
  }
  return reduceToCoreNumber(sum, true);
}

export function calculateSoulUrge(fullName: string): number {
  let sum = 0;
  const clean = fullName.toLowerCase().replace(/[^a-z]/g, "");
  for (const char of clean) {
    if (VOWELS.has(char)) {
      sum += PYTHAGOREAN_VALUES[char] || 0;
    }
  }
  return reduceToCoreNumber(sum, true);
}

export function calculatePersonality(fullName: string): number {
  let sum = 0;
  const clean = fullName.toLowerCase().replace(/[^a-z]/g, "");
  for (const char of clean) {
    if (!VOWELS.has(char)) {
      sum += PYTHAGOREAN_VALUES[char] || 0;
    }
  }
  return reduceToCoreNumber(sum, true);
}

export function calculateBirthDayNumber(birthDateStr: string): number {
  const parts = birthDateStr.split("-");
  const d = parseInt(parts[2] || "1", 10);
  return reduceToCoreNumber(d, true);
}

export function buildNumerologyProfile(fullName: string, birthDateStr: string): NumerologyProfile {
  const lifePathNum = calculateLifePath(birthDateStr);
  const destinyNum = calculateDestiny(fullName);
  const soulUrgeNum = calculateSoulUrge(fullName);
  const personalityNum = calculatePersonality(fullName);
  const birthDayNum = calculateBirthDayNumber(birthDateStr);

  const lifePath: CoreNumberAnalysis = getNumerologyMeaning(lifePathNum);
  const destiny: CoreNumberAnalysis = getNumerologyMeaning(destinyNum);
  const soulUrge: CoreNumberAnalysis = getNumerologyMeaning(soulUrgeNum);
  const personality: CoreNumberAnalysis = getNumerologyMeaning(personalityNum);
  const birthDayNumber: CoreNumberAnalysis = getNumerologyMeaning(birthDayNum);

  // Check if input contains Ge'ez fidel script
  let geezGematriaSynergy = undefined;
  const hasGeez = /[\u1200-\u137F]/.test(fullName);
  if (hasGeez) {
    const gemResult = calculateGeezGematria(fullName);
    geezGematriaSynergy = {
      totalWeight: gemResult.totalNumericalSum,
      digitalRoot: gemResult.reducedDigitValue,
      virtueMeaning: gemResult.philosophicalVirtue,
    };
  }

  const somatichealthSummary = getSomatichealthSummary(lifePathNum, destinyNum);

  return {
    lifePath,
    destiny,
    soulUrge,
    personality,
    birthDayNumber,
    geezGematriaSynergy,
    somatichealthSummary,
  };
}
