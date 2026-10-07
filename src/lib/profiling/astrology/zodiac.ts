import { HumoralElement, ZodiacSignName } from "../types";

export const ZODIAC_SIGNS: { name: ZodiacSignName; startDegree: number; element: HumoralElement; ethiopianGeez: string }[] = [
  { name: "Aries", startDegree: 0, element: "esat", ethiopianGeez: "ሐመል (Hamel)" },
  { name: "Taurus", startDegree: 30, element: "afere", ethiopianGeez: "ሰውር (Sowr)" },
  { name: "Gemini", startDegree: 60, element: "nifas", ethiopianGeez: "ጀውዛ (Jawza)" },
  { name: "Cancer", startDegree: 90, element: "may", ethiopianGeez: "ሰርጣን (Saratan)" },
  { name: "Leo", startDegree: 120, element: "esat", ethiopianGeez: "አሰድ (Asad)" },
  { name: "Virgo", startDegree: 150, element: "afere", ethiopianGeez: "ሰንቡላ (Senbula)" },
  { name: "Libra", startDegree: 180, element: "nifas", ethiopianGeez: "ሚዛን (Mizan)" },
  { name: "Scorpio", startDegree: 210, element: "may", ethiopianGeez: "አቅራብ (Akrab)" },
  { name: "Sagittarius", startDegree: 240, element: "esat", ethiopianGeez: "ቀውስ (Qaws)" },
  { name: "Capricorn", startDegree: 270, element: "afere", ethiopianGeez: "ጃዲ (Jadi)" },
  { name: "Aquarius", startDegree: 300, element: "nifas", ethiopianGeez: "ደለው (Delaw)" },
  { name: "Pisces", startDegree: 330, element: "may", ethiopianGeez: "ሁት (Hut)" },
];

export const ZODIAC_NAMES: ZodiacSignName[] = ZODIAC_SIGNS.map((sign) => sign.name);

export const ELEMENT_LABEL: Record<HumoralElement, string> = {
  esat: "Esat (fire)",
  afere: "Afere (earth)",
  nifas: "Nifas (air)",
  may: "May (water)",
};

function normalizeDegree(deg: number): number {
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}

export function getSignFromLongitude(totalLongitude: number): { sign: ZodiacSignName; degreeInSign: number; element: HumoralElement } {
  const norm = normalizeDegree(totalLongitude);
  const signObj = ZODIAC_SIGNS[Math.floor(norm / 30)] || ZODIAC_SIGNS[0];
  return {
    sign: signObj.name,
    degreeInSign: Number((norm % 30).toFixed(2)),
    element: signObj.element,
  };
}

export function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th";
  return `${n}${suffix}`;
}

/** What each house of the chart is concerned with, in everyday words. */
export const HOUSE_THEMES: Record<number, string> = {
  1: "body, temperament and how you meet the world",
  2: "food, income and what you rely on",
  3: "learning, siblings and everyday errands",
  4: "home, family and roots",
  5: "creativity, children and enjoyment",
  6: "daily work, routines and self-care",
  7: "partnership and close one-to-one ties",
  8: "shared resources and deep change",
  9: "belief, study and long journeys",
  10: "vocation, standing and direction",
  11: "friends, community and hopes",
  12: "rest, retreat and spiritual practice",
};
