/**
 * Turns one person's chart into the wording of their synthesis.
 *
 * Every line produced here cites the placement it comes from (a sign, a house, an aspect with its
 * orb, a share of the elemental balance), so two people only read the same sentence when they
 * share the same placement. The associations are those of traditional astrology and Ethiopian
 * humoral thought; they are cultural and educational, not medical statements.
 */

import { AstrologicalAspect, AstrologicalProfile, CelestialBody, HumoralElement, SeasonalwellbeingPattern, ZodiacSignName } from "../types";
import { ELEMENT_LABEL, HOUSE_THEMES, ordinal } from "../astrology/zodiac";

const SIGN_PROFILE: Record<ZodiacSignName, { zone: string; strength: string; watch: string }> = {
  Aries: { zone: "head and face", strength: "quick recovery and the nerve to begin things", watch: "tension headaches and running hot when you rush" },
  Taurus: { zone: "neck and throat", strength: "stamina, patience and a steady appetite for life", watch: "a stiff neck and shoulders, and heaviness when rich food outpaces movement" },
  Gemini: { zone: "shoulders, arms, lungs and nerves", strength: "mental agility and fast adaptation", watch: "nervous restlessness, shallow breathing and scattered sleep" },
  Cancer: { zone: "chest and stomach", strength: "a sure instinct for nourishment and care", watch: "digestion that follows your mood, and worry held in the stomach" },
  Leo: { zone: "heart and upper back", strength: "warm vitality and a generous spirit", watch: "overexertion and upper-back strain when pride will not let you rest" },
  Virgo: { zone: "intestines and digestion", strength: "discernment and care for good routine", watch: "a nervous digestion and worrying over details" },
  Libra: { zone: "kidneys, lower back and skin", strength: "a sense of balance and grace under pressure", watch: "lower-back fatigue, and wearing yourself out to keep the peace" },
  Scorpio: { zone: "eliminative and reproductive systems", strength: "deep reserves and the capacity to renew yourself", watch: "holding things in, emotionally and physically" },
  Sagittarius: { zone: "hips, thighs and liver", strength: "optimism and a love of movement", watch: "excess in food, drink or plans, and strain in the hips and thighs" },
  Capricorn: { zone: "knees, bones and joints", strength: "endurance and self-discipline", watch: "stiff joints and dryness, and working past the point of fatigue" },
  Aquarius: { zone: "ankles, calves and circulation", strength: "originality and a cool head", watch: "cold hands and feet, and irregular routines" },
  Pisces: { zone: "feet and lymphatic system", strength: "sensitivity and imagination", watch: "absorbing other people's moods, and sluggishness" },
};

const MOON_NEED: Record<HumoralElement, string> = {
  esat: "action and encouragement — you steady yourself by doing",
  afere: "routine, good food and physical comfort — you steady yourself through the body",
  nifas: "conversation and variety — you steady yourself by talking things through",
  may: "closeness and quiet — you steady yourself in trusted company",
};

const MOON_STRESS: Record<HumoralElement, string> = {
  esat: "you tend to push harder and flare up; the release is physical exertion followed by real rest",
  afere: "you tend to dig in and reach for comfort food; the release is movement and a change of scene",
  nifas: "you tend to overthink and sleep lightly; the release is slow breathing and time away from screens",
  may: "you tend to withdraw and absorb the atmosphere around you; the release is warmth, water and saying what you feel",
};

const PLANET_KEYWORD: Partial<Record<CelestialBody, string>> = {
  Sun: "vitality", Moon: "feelings", Mercury: "thinking", Venus: "affections", Mars: "drive", Jupiter: "confidence",
  Saturn: "discipline", Uranus: "need for change", Neptune: "imagination", Pluto: "resolve",
};

const ELEMENT_STRENGTH: Record<HumoralElement, string> = {
  esat: "warmth, courage and a strong digestive fire",
  afere: "endurance, patience and a body that holds its reserves",
  nifas: "quick thinking, sociability and adaptability",
  may: "empathy, intuition and emotional depth",
};

const ELEMENT_LACK: Record<HumoralElement, string> = {
  esat: "motivation and warmth can run low — morning sunlight, movement and warming spices help",
  afere: "routine and physical grounding do not come by themselves — fixed meal and sleep times help",
  nifas: "perspective and lightness can be scarce — conversation, fresh air and learning help",
  may: "rest and emotional processing are easily skipped — quiet time, water and unhurried company help",
};

const ELEMENT_KEY: Record<HumoralElement, "fire" | "earth" | "air" | "water"> = { esat: "fire", afere: "earth", nifas: "air", may: "water" };

// Aspects between the slow planets belong to a whole generation; only those touching a personal planet describe the individual.
const PERSONAL: CelestialBody[] = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
function isPersonal(aspect: AstrologicalAspect): boolean {
  return PERSONAL.includes(aspect.planet1) || PERSONAL.includes(aspect.planet2);
}

function aspectLine(aspect: AstrologicalAspect): string {
  const first = PLANET_KEYWORD[aspect.planet1] || aspect.planet1;
  const second = PLANET_KEYWORD[aspect.planet2] || aspect.planet2;
  const pair = `${aspect.planet1} ${aspect.aspectType} ${aspect.planet2} (orb ${aspect.orb.toFixed(1)}°)`;
  if (aspect.nature === "harmonious") return `${pair}: your ${first} and ${second} work together without effort.`;
  if (aspect.nature === "challenging") return `${pair}: your ${first} and ${second} pull against each other, and the tension shows when you are tired.`;
  return `${pair}: your ${first} and ${second} act as one, which concentrates energy and needs pacing.`;
}

export function describeStrengths(astro: AstrologicalProfile, timeKnown: boolean): string[] {
  const sun = astro.planetaryPositions.find((p) => p.planet === "Sun")!;
  const moon = astro.planetaryPositions.find((p) => p.planet === "Moon")!;
  const lines = [
    `Sun in ${sun.sign}${timeKnown ? `, ${ordinal(sun.house)} house of ${HOUSE_THEMES[sun.house]}` : ""}: ${SIGN_PROFILE[sun.sign].strength}.`,
    `Moon in ${moon.sign}: you need ${MOON_NEED[moon.element]}.`,
  ];
  if (timeKnown) lines.push(`${astro.risingSign} rising: you meet the world with ${SIGN_PROFILE[astro.risingSign].strength}.`);
  const easy = astro.aspects.find((aspect) => aspect.nature === "harmonious" && isPersonal(aspect));
  if (easy) lines.push(aspectLine(easy));
  const strongest = (Object.keys(ELEMENT_KEY) as HumoralElement[]).reduce((best, el) => (astro.elementalBalance[ELEMENT_KEY[el]] > astro.elementalBalance[ELEMENT_KEY[best]] ? el : best), "esat" as HumoralElement);
  lines.push(`${astro.elementalBalance[ELEMENT_KEY[strongest]]}% of your chart's weight is in ${ELEMENT_LABEL[strongest]}: ${ELEMENT_STRENGTH[strongest]}.`);
  return lines;
}

export function describeRisks(astro: AstrologicalProfile, timeKnown: boolean): string[] {
  const sun = astro.planetaryPositions.find((p) => p.planet === "Sun")!;
  const moon = astro.planetaryPositions.find((p) => p.planet === "Moon")!;
  const lines = [
    `Sun in ${sun.sign}: tradition links this sign with the ${SIGN_PROFILE[sun.sign].zone}; watch for ${SIGN_PROFILE[sun.sign].watch}.`,
    `Moon in ${moon.sign}: under stress ${MOON_STRESS[moon.element]}.`,
  ];
  const hard = astro.aspects.find((aspect) => aspect.nature === "challenging" && isPersonal(aspect));
  if (hard) lines.push(aspectLine(hard));
  if (timeKnown && astro.risingSign !== sun.sign) lines.push(`${astro.risingSign} rising: the body's sensitive zone is the ${SIGN_PROFILE[astro.risingSign].zone}; watch for ${SIGN_PROFILE[astro.risingSign].watch}.`);
  const weakest = (Object.keys(ELEMENT_KEY) as HumoralElement[]).reduce((least, el) => (astro.elementalBalance[ELEMENT_KEY[el]] < astro.elementalBalance[ELEMENT_KEY[least]] ? el : least), "esat" as HumoralElement);
  lines.push(`Only ${astro.elementalBalance[ELEMENT_KEY[weakest]]}% of your chart's weight is in ${ELEMENT_LABEL[weakest]}: ${ELEMENT_LACK[weakest]}.`);
  return lines;
}

export const DIET_BY_HUMOR: Record<HumoralElement, { principles: string[]; favored: string[]; moderate: string[] }> = {
  esat: {
    principles: [
      "Cool and moisten: your constitution runs warm and dry, so favour mild, juicy and fermented foods over fiery ones.",
      "Pair every Berbere-rich stew with a cooling side such as Ayib.",
      "Eat at regular times — a missed meal shows up in you as irritability.",
    ],
    favored: [
      "Ayib (fresh cottage cheese) alongside spiced dishes",
      "Telba (flaxseed drink)",
      "Habesha Gomen (collard greens) and other leafy sides",
      "Besso (barley drink) and Atmit in the heat of the day",
      "Kocho with mild accompaniments",
    ],
    moderate: ["Raw hot peppers (Kariya) and extra Mitmita", "Coffee after midday", "Alcohol and heavily salted dried meat (Quanta)"],
  },
  afere: {
    principles: [
      "Lighten and warm: your constitution is steady and holds on, so favour lighter, well-spiced meals and keep moving.",
      "Make the midday meal the main one and keep supper small and early.",
      "Use ginger, garlic and Korerima to keep digestion lively.",
    ],
    favored: [
      "Shiro and Misir Wot (lentil stew) with garlic and ginger",
      "Teff injera with plenty of vegetable sides (Atkilt, Gomen)",
      "Zingibil (ginger) and Korerima tea",
      "Sprouted or boiled pulses (Nifro) as snacks",
      "Fresh fruit in place of sweets",
    ],
    moderate: ["Rich, butter-heavy meat dishes late in the day", "Large portions of cheese and fried pastries", "Long sitting after meals"],
  },
  nifas: {
    principles: [
      "Ground and regulate: your constitution is quick and changeable, so favour warm, cooked meals at fixed times.",
      "Never let coffee stand in for breakfast.",
      "Choose soft, oily and soupy foods over dry and crunchy ones, especially in Bega.",
    ],
    favored: [
      "Genfo and Atmit (warm porridges) in the morning",
      "Kinche (cracked wheat) with a little Niter Kibe",
      "Shiro and root-vegetable Atkilt",
      "Telba (flaxseed drink)",
      "Kocho and well-fermented injera",
    ],
    moderate: ["Skipped meals and eating on the move", "Buna on an empty stomach", "Dry roasted snacks (Kolo) in place of a meal", "Cold, raw food in the evening"],
  },
  may: {
    principles: [
      "Warm and stimulate: your constitution is cool and moist, so favour hot, freshly cooked and well-spiced food.",
      "Start the day with something warm and move before you eat.",
      "Keep dairy fermented and portions of sweet, heavy food small — most of all in Kiremt.",
    ],
    favored: [
      "Berbere-spiced Misir Wot and Shiro",
      "Zingibil (ginger), Korerima and Tosign (thyme) teas",
      "Garlic and onion bases in stews",
      "Roasted barley (Kolo) as a snack",
      "Habesha Gomen and other bitter greens",
    ],
    moderate: ["Unfermented, heavy dairy", "Iced drinks", "Deep-fried pastries and very sweet foods"],
  },
};

// What each Ethiopian season is like, in humoral terms, and the months (1–12) it covers.
const SEASON_QUALITY: Record<SeasonalwellbeingPattern["season"], HumoralElement> = {
  "Kiremt (Rainy)": "may",
  "Tsedey (Bloom & Harvest)": "afere",
  "Bega (Dry & Sunny)": "nifas",
  "Belg (Short Rains)": "esat",
  "Pagume (Renewal)": "may",
};

const OPPOSITE: Record<HumoralElement, HumoralElement> = { esat: "may", may: "esat", afere: "nifas", nifas: "afere" };

/** The Ethiopian season a Gregorian date falls in. */
export function seasonForDate(date: Date): SeasonalwellbeingPattern["season"] {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  if (month === 9 && day >= 6 && day <= 10) return "Pagume (Renewal)";
  if (month >= 6 && month <= 8) return "Kiremt (Rainy)";
  if (month >= 9 && month <= 11) return "Tsedey (Bloom & Harvest)";
  if (month === 4 || month === 5) return "Belg (Short Rains)";
  return "Bega (Dry & Sunny)";
}

/** Marks the season in progress and says how each season sits with this person's constitution. */
export function calibrateSeasons(patterns: SeasonalwellbeingPattern[], humor: HumoralElement, today: Date): SeasonalwellbeingPattern[] {
  const current = seasonForDate(today);
  return patterns
    .map((pattern) => {
      const quality = SEASON_QUALITY[pattern.season];
      const personalNote =
        quality === humor
          ? `This season has the same quality as your ${ELEMENT_LABEL[humor]} constitution, so it amplifies it: the cautions here apply to you more than to most.`
          : quality === OPPOSITE[humor]
            ? `This season is the counterweight to your ${ELEMENT_LABEL[humor]} constitution: you tend to feel at your best now, so use it to rebuild reserves.`
            : `This season is neutral for your ${ELEMENT_LABEL[humor]} constitution: follow the general guidance and adjust to how you feel.`;
      return { ...pattern, isCurrent: pattern.season === current, personalNote };
    })
    .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
}
