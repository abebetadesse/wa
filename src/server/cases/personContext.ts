/**
 * Aligns a case with the person who opened it.
 *
 * From the consented profile this builds what a reviewer needs to write for one particular person:
 * their life stage, where they live and the season they are in, cautions from the wellbeing
 * profile and, when they agreed to cultural and spiritual reflection, a reading from their birth
 * details that is turned towards the kind of matter the case is about.
 *
 * Raw values stay out: the result carries bands, counts and cautions, never an exact age, a city,
 * a gender or religion, or the name of a medicine or condition.
 */
import type { UserProfile } from "@/lib/knowledge/types";
import { resolveAgroEcologicalZone } from "@/lib/engines/agroEcologicalEngine";
import { calculateCelestialPositions } from "@/lib/profiling/astrology/chartCalculator";
import { calculateTransits } from "@/lib/profiling/astrology/personalSky";
import { calculatePersonalDayAlignment, calculateVedicChart, calculateVimshottariDasha } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { ELEMENT_LABEL, ordinal } from "@/lib/profiling/astrology/zodiac";
import { calculateDanMillmanLifePath } from "@/lib/profiling/numerology/danMillmanNumerology";
import { DIET_BY_HUMOR, seasonForDate } from "@/lib/profiling/synthesis/personalCalibration";
import type { HumoralElement } from "@/lib/profiling/types";
import type { CasePersonContext, WorkflowDomain } from "./types";

interface LifeStage {
  label: string;
  band: string;
  max: number;
  general: string[];
  /** What a factor found in the case usually means at this stage of life. */
  byFactor: Record<string, string>;
}

const LIFE_STAGES: LifeStage[] = [
  {
    label: "Under 18",
    band: "under 18",
    max: 17,
    general: ["The person is a minor: a parent, guardian or other trusted adult should be part of any next step."],
    byFactor: {},
  },
  {
    label: "Emerging adulthood",
    band: "18–24",
    max: 24,
    general: [
      "Study, first work and first independent decisions tend to arrive together at this stage.",
      "Family expectations usually still carry great weight, in decisions and in money.",
    ],
    byFactor: {
      work: "A first job or the wait for one shapes confidence strongly at this stage; short practical experience counts for more than a perfect plan.",
      purpose: "Uncertainty about direction is the ordinary condition of this stage rather than a sign that something is wrong.",
      money: "Income is usually irregular or dependent on family at this stage, so agreements about contributions matter more than budgets.",
      family: "Negotiating independence from parents without breaking respect is the central task at this stage.",
    },
  },
  {
    label: "Early adulthood",
    band: "25–39",
    max: 39,
    general: [
      "Establishing a livelihood, a partnership and often young children compete for the same time and money at this stage.",
      "Obligations to the wider family (support to parents, siblings' schooling, social contributions) commonly peak now.",
    ],
    byFactor: {
      money: "At this stage money pressure usually comes from several obligations landing at once, which is why listing and sharing them works better than cutting spending alone.",
      conflict: "Disagreements in these years are very often about the division of money, time and family duties rather than about feelings for each other.",
      work: "Work insecurity in these years affects the whole household's plans, so it is worth treating as a shared problem rather than a private worry.",
      sleep: "Short sleep in these years is frequently built into the routine (work hours, young children), so the realistic aim is regular hours rather than long ones.",
      fatigue: "Tiredness at this stage most often follows from load and short sleep, but it is still worth a basic check when it persists.",
    },
  },
  {
    label: "Midlife",
    band: "40–59",
    max: 59,
    general: [
      "Responsibility often runs in two directions at this stage: towards children becoming independent and towards ageing parents.",
      "Questions about what the working years have built, and what to change while there is time, are common now.",
    ],
    byFactor: {
      fatigue: "At this stage persistent tiredness deserves a routine health check before other explanations are settled on.",
      physical: "Bodily complaints at this stage are worth raising at a health facility rather than waiting, even when they seem minor.",
      work: "A change or loss of work at this stage carries extra weight because others depend on it and starting again feels harder.",
      purpose: "Reassessing direction in midlife is common and usually productive when it leads to one concrete change rather than a general restlessness.",
      legal: "Property and inheritance questions often surface at this stage as parents age; putting documents in order early prevents later disputes.",
      family: "Being the person everyone relies on is typical of this stage; saying what you can and cannot carry is part of the solution.",
    },
  },
  {
    label: "Elder years",
    band: "60 and over",
    max: 200,
    general: [
      "Health, mobility and the wish to remain useful and respected shape most concerns at this stage.",
      "An elder's word carries authority in the family, which can be used to settle matters as well as to carry them alone.",
    ],
    byFactor: {
      isolation: "Loneliness is a particular risk at this stage as peers are lost and children move away; regular contact is protective.",
      grief: "Losses accumulate at this stage; shared remembrance and faith practices are a real support, not a formality.",
      legal: "Setting out wishes about property clearly, with witnesses, is the surest way to protect family peace.",
      physical: "New or changing symptoms at this stage should be seen at a health facility without delay.",
      fatigue: "Tiredness at this stage should be assessed by a health professional rather than explained away.",
    },
  },
];

const SEASON_NOTES: Record<string, string> = {
  "Kiremt (Rainy)": "It is Kiremt, the main rains: travel, farm work and cash are all tighter, and damp and cold affect the body.",
  "Tsedey (Bloom & Harvest)": "It is Tsedey, after the rains: the new year, school costs and the coming harvest shape household budgets and plans.",
  "Bega (Dry & Sunny)": "It is Bega, the dry season: harvest income, weddings and travel fall in these months, and so do the long fasts that follow.",
  "Belg (Short Rains)": "It is Belg, the short rains: the hottest months, with planting decisions and, for many, the Lenten fast.",
  "Pagume (Renewal)": "It is Pagume, the closing days of the year: a customary time for settling matters and beginning again.",
};

/** The house and natal points of a chart that speak to each kind of case, in the words used in the report. */
const MATTER_HOUSE: Record<WorkflowDomain, { house: number; label: string; points: string[] }> = {
  relationship: { house: 7, label: "partnership and close one-to-one ties", points: ["Venus", "Moon"] },
  career: { house: 10, label: "vocation, standing and direction", points: ["Midheaven", "Sun", "Saturn"] },
  legal: { house: 9, label: "law, principle and fair judgement", points: ["Jupiter", "Saturn", "Mercury"] },
  social: { house: 11, label: "community, friends and belonging", points: ["Mercury", "Venus", "Moon"] },
  spiritual: { house: 9, label: "faith, meaning and guidance", points: ["Jupiter", "Moon", "Sun"] },
  biological: { house: 6, label: "daily routine, self-care and wellbeing", points: ["Sun", "Moon", "Mars", "Ascendant"] },
};

const DASHA_THEME: Record<string, string> = {
  Sun: "standing, responsibility and the father's line",
  Moon: "home, mother, feeling and the public",
  Mars: "effort, courage, land and conflict",
  Rahu: "ambition, the unfamiliar and restlessness",
  Jupiter: "learning, counsel, children and growth",
  Saturn: "duty, patience, endurance and elders",
  Mercury: "trade, study, communication and skill",
  Ketu: "letting go, withdrawal and inner work",
  Venus: "partnership, comfort, agreements and the arts",
};

const formatDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function reading(profile: UserProfile, domain: WorkflowDomain, now: Date): CasePersonContext["reading"] {
  const birthDate = profile.cultural?.birthDate;
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return undefined;
  const birthTime = profile.cultural?.birthTime && /^\d{1,2}:\d{2}/.test(profile.cultural.birthTime) ? profile.cultural.birthTime.slice(0, 5) : "";
  const birthPlace = profile.cultural?.birthLocation || profile.location?.city || profile.location?.region || "Addis Ababa";
  const timeKnown = Boolean(birthTime);
  const castTime = birthTime || "12:00";

  const chart = calculateCelestialPositions(birthDate, castTime, birthPlace);
  const vedic = calculateVedicChart(birthDate, castTime, birthPlace);
  const sun = chart.planets.find((planet) => planet.planet === "Sun")!;
  const moon = chart.planets.find((planet) => planet.planet === "Moon")!;
  const ascendant = chart.planets.find((planet) => planet.planet === "Ascendant")!;
  const siderealMoon = vedic.d1Placements.find((planet) => planet.planet === "Moon")!;
  const lifePath = calculateDanMillmanLifePath(birthDate);

  // The same weighting the profile page uses for the constitution.
  const weights: Record<string, number> = { Sun: 3, Moon: 3, Ascendant: timeKnown ? 3 : 0, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1.5, Saturn: 1.5 };
  const tally: Record<HumoralElement, number> = { esat: 0, afere: 0, nifas: 0, may: 0 };
  for (const planet of chart.planets) tally[planet.element] += weights[planet.planet] ?? 0;
  const humor = (Object.keys(tally) as HumoralElement[]).reduce((best, element) => (tally[element] > tally[best] ? element : best), "esat" as HumoralElement);

  const alignment = calculatePersonalDayAlignment({ moonSiderealLongitude: siderealMoon.totalLongitude, ascendantTropicalLongitude: ascendant.totalLongitude }, now);
  const today = now.toISOString().slice(0, 10);
  const dashas = calculateVimshottariDasha(birthDate, siderealMoon.totalLongitude, castTime, chart.place.utcOffsetHours);
  const maha = dashas.find((period) => period.startDate <= today && today < period.endDate);
  const antar = maha?.subPeriods?.find((period) => period.startDate <= today && today < period.endDate);

  const matterHouse = MATTER_HOUSE[domain];
  const house = chart.houses.find((entry) => entry.houseNumber === matterHouse.house)!;
  // Transits that touch the house of the matter, or the Sun, Moon and Ascendant, speak to this case first.
  const bearsOnMatter = (transit: { natalHouse?: number; targetPlanetOrPoint: string }) =>
    Number(matterHouse.points.includes(transit.targetPlanetOrPoint) || (timeKnown && transit.natalHouse === matterHouse.house));
  const transits = calculateTransits(chart.planets, now, 10)
    .filter((transit) => timeKnown || (transit.targetPlanetOrPoint !== "Ascendant" && transit.targetPlanetOrPoint !== "Midheaven"))
    .sort((a, b) => bearsOnMatter(b) - bearsOnMatter(a))
    .slice(0, 3);

  const timing: string[] = [];
  if (maha) {
    timing.push(
      `Life period (Vimshottari): ${maha.planet} until ${formatDay(maha.endDate)}, a chapter concerned with ${DASHA_THEME[maha.planet] ?? "its own themes"}` +
        (antar ? `; within it, the ${antar.planet} sub-period until ${formatDay(antar.endDate)} brings forward ${DASHA_THEME[antar.planet] ?? "its themes"}.` : ".")
    );
  }
  for (const transit of transits) {
    // Without a birth time the houses are not reliable, so that clause is left out.
    const text = timeKnown ? transit.wellbeingForecast : transit.wellbeingForecast.replace(/, in your \d+(st|nd|rd|th) house of [^.]+\./, ".");
    timing.push(`${text} ${transit.balancingAdvice} In orb ${transit.durationWindow}.`);
  }
  timing.push(`Today (${formatDay(alignment.date)}): ${alignment.taraBala.meaning} ${alignment.chandraBala.meaning}`);

  const season = seasonForDate(now);
  const diet = DIET_BY_HUMOR[humor];

  return {
    basis:
      (timeKnown
        ? "Cast from the birth date, time and place on your profile."
        : "Cast from the birth date and place on your profile; no birth time is recorded, so noon is assumed and nothing here relies on the Ascendant or houses.") +
      (chart.place.matched ? "" : " The birth place was not recognised, so Addis Ababa was used."),
    signature: [
      `Sun in ${sun.sign}`,
      `Moon in ${moon.sign}`,
      ...(timeKnown ? [`${chart.ascendant.sign} rising`] : []),
      `birth star ${alignment.birthStar.name}`,
      `Life Path ${lifePath.unreducedNumber}`,
      `${ELEMENT_LABEL[humor]} constitution`,
    ].join(" · "),
    temperament: [
      `Birth star ${alignment.birthStar.name} (${alignment.birthStar.geezName}), ruled by ${alignment.birthStar.rulingPlanet}: ${alignment.birthStar.temperament.toLowerCase()}.`,
      `Life Path ${lifePath.unreducedNumber}: ${lifePath.corePurpose}`,
      ...chart.aspects
        .filter((aspect) => ["Sun", "Moon", "Mercury", "Venus", "Mars"].some((planet) => planet === aspect.planet1 || planet === aspect.planet2))
        .slice(0, 2)
        .map((aspect) => `${aspect.planet1} ${aspect.aspectType} ${aspect.planet2} (orb ${aspect.orb.toFixed(1)}°): ${aspect.nature === "harmonious" ? "an easy, supportive link between the two" : aspect.nature === "challenging" ? "a tension between the two that shows under strain" : "the two act as one, which concentrates energy"}.`),
    ],
    matter: timeKnown
      ? {
          house: matterHouse.house,
          label: matterHouse.label,
          sign: house.signOnCusp,
          occupants: house.activePlanets,
          note: house.activePlanets.length
            ? `The ${ordinal(matterHouse.house)} house, which speaks to ${matterHouse.label}, falls in ${house.signOnCusp} and holds ${house.activePlanets.join(", ")}: this area of life is emphasised in the chart.`
            : `The ${ordinal(matterHouse.house)} house, which speaks to ${matterHouse.label}, falls in ${house.signOnCusp} and holds no planet: the matter is read through its sign and through the planets now passing over it.`,
        }
      : undefined,
    timing,
    constitution: [
      `${ELEMENT_LABEL[humor]} is the strongest element in the chart. ${diet.principles[0]}`,
      `Foods that tradition favours for this constitution: ${diet.favored.slice(0, 3).join("; ")}.`,
      `Season: ${season}. ${SEASON_NOTES[season] ?? ""}`.trim(),
    ],
  };
}

export interface PersonContextInput {
  profile: UserProfile;
  domain: WorkflowDomain;
  /** Ids of the factors found in the case, most weight first. */
  factors: string[];
  now: Date;
  /** False while a safety signal is active: no reflection is produced. */
  allowReflection: boolean;
}

/** Returns undefined when the profile holds nothing usable (for example without consent to data usage). */
export function buildPersonContext({ profile, domain, factors, now, allowReflection }: PersonContextInput): CasePersonContext | undefined {
  const context: CasePersonContext = { care: [] };

  const age = profile.age ?? profile.demographics?.age;
  if (typeof age === "number" && age >= 0) {
    const stage = LIFE_STAGES.find((entry) => age <= entry.max)!;
    const specific = factors.map((id) => stage.byFactor[id]).filter((line): line is string => Boolean(line));
    context.lifeStage = { label: stage.label, band: stage.band, considerations: [...stage.general, ...specific.slice(0, 3)] };
  }

  const region = profile.location?.region;
  if (region && region !== "Unspecified") {
    const season = seasonForDate(now);
    const altitude = profile.location?.altitude;
    const zone = typeof altitude === "number" ? resolveAgroEcologicalZone(altitude) : null;
    context.place = {
      region,
      zone: zone ? `${zone.zone.replace(/_/g, " ")} (${zone.nameAmharic}), about ${altitude} m` : undefined,
      season,
      notes: [SEASON_NOTES[season], ...(zone ? [`Staple crops of this zone: ${zone.keyStapleCrops.slice(0, 4).join(", ")}.`] : [])].filter(Boolean),
    };
  }

  if (profile.language) context.language = profile.language;

  const medicines = profile.medications?.length ?? 0;
  const conditions = profile.conditions?.length ?? 0;
  const allergies = profile.wellbeing?.allergies?.length ?? 0;
  if (profile.pregnant) {
    context.care.push({
      id: "pregnancy",
      reviewer: "The wellbeing profile records pregnancy or breastfeeding: leave out every herbal and fasting suggestion and refer health questions to antenatal care.",
      report: "Because of what your wellbeing profile records, herbal remedies and fasting changes are left out of this report; please raise any remedy with your health provider first.",
    });
  }
  if (medicines > 0) {
    context.care.push({
      id: "medicines",
      reviewer: `The wellbeing profile lists ${medicines} medicine${medicines === 1 ? "" : "s"}: any herbal, dietary or fasting suggestion must be checked against them by a pharmacist or doctor.`,
      report: "Your wellbeing profile lists medicines you take: please check any herbal, dietary or fasting suggestion with a pharmacist or doctor before trying it.",
    });
  }
  if (conditions > 0) {
    context.care.push({
      id: "conditions",
      reviewer: `The wellbeing profile lists ${conditions} health condition${conditions === 1 ? "" : "s"}: keep suggestions general and refer health questions to the person's clinician.`,
      report: "Your wellbeing profile lists health conditions: the suggestions here are general, and anything touching your health should be confirmed with the clinician who knows your history.",
    });
  }
  if (allergies > 0) {
    context.care.push({
      id: "allergies",
      reviewer: `The wellbeing profile lists ${allergies} allerg${allergies === 1 ? "y" : "ies"}: avoid naming foods or plants without checking.`,
      report: "Your wellbeing profile lists allergies: please check any food or plant mentioned here against them.",
    });
  }

  if (allowReflection) {
    try {
      context.reading = reading(profile, domain, now);
    } catch {
      // The reading is an optional reflection; a chart that cannot be cast is simply left out.
    }
  }

  const empty = !context.lifeStage && !context.place && !context.language && !context.care.length && !context.reading;
  return empty ? undefined : context;
}
