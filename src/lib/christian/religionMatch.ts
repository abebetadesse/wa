/**
 * Religion matching utilities.
 *
 * The original component had two issues:
 *   1. Hebrew "ይሁዳዊ" (Jewish) was included in the Christian terms list.
 *   2. Naive substring matching would misfire on "non-Christian", "ex-Catholic", etc.
 *
 * This module provides a normalized match that respects negative prefixes and
 * covers the main Ethiopian Christian traditions.
 */

export type ChristianTradition = 'orthodox' | 'protestant' | 'catholic' | 'unspecified';

interface NormalizedTradition {
  isChristian: boolean;
  tradition: ChristianTradition;
  raw: string;
}

const ORTHODOX_TERMS = [
  'orthodox',
  'tewahedo',
  'tawahedo',
  'ethiopian orthodox',
  'eotc',
  'ኦርቶዶክስ',
  'ተዋሕዶ',
  'ሐዋርያዊ',
];

const PROTESTANT_TERMS = [
  'protestant',
  'evangelical',
  'p\'ent\'ay',
  'pentay',
  'ፕሮቴስታንት',
  'ወንጌላዊ',
  'ሙሉ ወንጌል',
];

const CATHOLIC_TERMS = [
  'catholic',
  'roman catholic',
  'ካቶሊክ',
];

const GENERIC_CHRISTIAN_TERMS = [
  'christian',
  'christianity',
  'ክርስቲያን',
];

const NEGATIVE_PREFIXES = ['non-', 'non ', 'ex-', 'ex ', 'former ', 'not '];

function stripNegation(value: string): string {
  let v = value;
  for (const prefix of NEGATIVE_PREFIXES) {
    if (v.startsWith(prefix)) {
      v = v.slice(prefix.length).trim();
    }
  }
  return v;
}

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

export function matchReligion(raw: unknown): NormalizedTradition {
  const value = String(raw ?? '').trim();
  if (!value) {
    return { isChristian: false, tradition: 'unspecified', raw: '' };
  }

  const normalized = value.toLowerCase();
  const positive = stripNegation(normalized);

  // If the string starts with a negation, treat as not-Christian-of-that-kind
  const negated = normalized !== positive;

  const isOrthodox = containsAny(positive, ORTHODOX_TERMS);
  const isProtestant = containsAny(positive, PROTESTANT_TERMS);
  const isCatholic = containsAny(positive, CATHOLIC_TERMS);
  const isGeneric = containsAny(positive, GENERIC_CHRISTIAN_TERMS);

  const isChristian =
    (isOrthodox || isProtestant || isCatholic || isGeneric) && !negated;

  let tradition: ChristianTradition = 'unspecified';
  if (isOrthodox) tradition = 'orthodox';
  else if (isProtestant) tradition = 'protestant';
  else if (isCatholic) tradition = 'catholic';

  return { isChristian, tradition, raw: value };
}