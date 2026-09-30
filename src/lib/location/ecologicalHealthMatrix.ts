/**
 * Geo-ecological, nutritional and food matrix for a client's place of living. DOMAIN A.
 * Combines the location profile (agro-ecology, altitude, endemic patterns, staples, lean months)
 * with food-composition data (phytate:mineral molar ratios before and after traditional
 * fermentation). Population-level context for the healer, not a statement about the individual.
 */
import { calculatePhytateMineralRatio, ETHIOPIAN_RAW_CEREALS_AND_MATERIALS, estimateProcessingBioavailability } from "@/lib/nutrition/ethiopianFoodScience";
import { resolveLocation } from "./index";
import type { LocationContext, LocationInput } from "./types";

const FE_MW = 55.845;
const ZN_MW = 65.38;
/** Molar-ratio thresholds commonly used for bioavailability: Phy:Fe < 1, Phy:Zn < 15. */
const FE_LIMIT = 1;
const ZN_LIMIT = 15;

const ZONES = {
  wurch: { am: "ውርጭ", en: "Wurch (alpine)", note: "Above about 3,200 m: cold, frost, barley and pulses." },
  dega: { am: "ደጋ", en: "Dega (highland)", note: "About 2,300–3,200 m: cool; teff, barley, wheat, pulses." },
  weyna_dega: { am: "ወይና ደጋ", en: "Weyna Dega (midland)", note: "About 1,500–2,300 m: temperate; teff, maize, enset, coffee." },
  kolla: { am: "ቆላ", en: "Kolla (lowland)", note: "Below about 1,500 m: hot; sorghum, maize, livestock." },
  rift_valley: { am: "ስምጥ ሸለቆ", en: "Rift Valley", note: "Rift lakes and plains: volcanic soils and high-fluoride groundwater in places." },
  bereha: { am: "በረሃ", en: "Bereha (desert)", note: "Arid lowland: pastoral diets, heat and water stress." },
} as const;
export type EcoZone = keyof typeof ZONES;

const ENDEMIC: Record<string, { label: string; level: "high" | "moderate"; note: string; prevention: string }> = {
  podoconiosis: { label: "Podoconiosis", level: "high", note: "Swelling of the feet and legs from long barefoot contact with red volcanic clay soils.", prevention: "Shoes and daily foot washing with soap; early care of swelling." },
  malaria: { label: "Malaria", level: "high", note: "Transmission in lowland and midland areas, peaking after the rains.", prevention: "Bed nets and prompt testing of any fever; herbal fever remedies must not replace a malaria test." },
  malaria_seasonal: { label: "Seasonal malaria", level: "moderate", note: "Malaria mainly after the rainy seasons.", prevention: "Test every fever during and after the rains." },
  dental_fluorosis: { label: "Fluorosis", level: "high", note: "Rift Valley groundwater can hold high fluoride: mottled teeth and, over years, stiff bones and joints.", prevention: "Use defluoridated or rain water for drinking and cooking where available." },
  goiter_iodine_deficiency: { label: "Goitre / iodine deficiency", level: "high", note: "Iodine-poor highland soils; neck swelling and tiredness.", prevention: "Iodised salt, added at the end of cooking." },
  trachoma: { label: "Trachoma", level: "moderate", note: "Eye infection spread where water is scarce.", prevention: "Face washing and latrines." },
  schistosomiasis: { label: "Schistosomiasis", level: "moderate", note: "From contact with slow fresh water.", prevention: "Avoid wading in slow water; periodic treatment programmes." },
  visceral_leishmaniasis: { label: "Visceral leishmaniasis (kala-azar)", level: "moderate", note: "Sandfly-borne; long fever, weight loss, swollen belly.", prevention: "Bed nets; see a clinic for long fever." },
  cutaneous_leishmaniasis: { label: "Cutaneous leishmaniasis", level: "moderate", note: "Slow-healing skin sores in highland rock-hyrax areas.", prevention: "Skin sores that do not heal need a clinic check." },
  typhoid: { label: "Typhoid", level: "moderate", note: "From unsafe water and food.", prevention: "Boil drinking water; hand washing." },
  helminthiasis: { label: "Intestinal worms", level: "moderate", note: "Common where sanitation is limited; worsens anaemia.", prevention: "Shoes, latrines, periodic deworming." },
  anemia: { label: "Anaemia", level: "high", note: "Low iron intake and absorption, worms and malaria combine.", prevention: "Iron-rich foods with fermentation; treat worms and malaria." },
  undernutrition: { label: "Undernutrition", level: "high", note: "Food insecurity, especially in the lean season.", prevention: "Diverse diet; community food programmes." },
  cholera_seasonal: { label: "Seasonal cholera", level: "moderate", note: "Outbreaks with flooding or drought.", prevention: "Safe water; oral rehydration at the first watery diarrhoea." },
  acute_watery_diarrhea: { label: "Acute watery diarrhoea", level: "moderate", note: "Unsafe water.", prevention: "Oral rehydration salts early." },
  tuberculosis: { label: "Tuberculosis", level: "moderate", note: "Long cough, night sweats, weight loss.", prevention: "Any cough over two weeks needs a free TB test." },
  dengue_fever: { label: "Dengue", level: "moderate", note: "Mosquito-borne in the Afar and eastern lowlands.", prevention: "Remove standing water; clinic for fever with bleeding." },
  heat_exhaustion: { label: "Heat stress", level: "moderate", note: "Very hot lowland climate.", prevention: "Water, shade and rest at midday." },
  respiratory_infections: { label: "Respiratory infections", level: "moderate", note: "Cold highland nights and indoor smoke from cooking fires.", prevention: "Ventilation and improved stoves." },
  upper_respiratory_infections: { label: "Respiratory infections", level: "moderate", note: "Urban air and crowding.", prevention: "Ventilation; clinic for breathing difficulty." },
  hypertension: { label: "High blood pressure", level: "moderate", note: "More common in towns; salt-rich diets.", prevention: "Less salt; blood pressure checks." },
};

/** Staple names in location profiles → food-composition entries. */
const STAPLE_FOODS: [RegExp, string][] = [
  [/teff/i, "cereal-red-teff"],
  [/barley/i, "cereal-highland-barley"],
  [/sorghum/i, "cereal-sorghum"],
  [/wheat/i, "cereal-emmer-wheat"],
  [/millet|dagussa/i, "cereal-finger-millet"],
  [/enset|kocho|qocho/i, "material-enset-qocho"],
  [/chickpea|shimbra/i, "material-chickpea"],
  [/flax|telba/i, "material-flaxseed"],
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface MineralRow {
  food: string;
  foodAm: string;
  raw: { phytateFe: number; phytateZn: number };
  fermented: { phytateFe: number; phytateZn: number; method: string };
  ironOk: boolean;
  zincOk: boolean;
}

export interface EcologicalHealthMatrix {
  location: { region: string; zone: string; woreda: string; confidence: string };
  ecology: { key: EcoZone; am: string; en: string; note: string; altitudeBand: string; ecosystem: string; climate: string; rainySeasons: string[] };
  altitudeRisks: { risk: string; level: "high" | "moderate" | "low"; note: string }[];
  endemic: { key: string; label: string; level: "high" | "moderate"; note: string; prevention: string }[];
  food: { staples: string[]; leanMonths: string[]; currentlyLean: boolean; leanNote: string };
  minerals: MineralRow[];
  deficiencies: { nutrient: string; why: string; traditionalSolution: string }[];
  fermentationSolutions: string[];
  summary: string;
}

function zoneFor(context: LocationContext): EcoZone {
  if (context.agroEcological === "rift-valley") return "rift_valley";
  if (context.agroEcological === "desert") return "bereha";
  if (context.altitudeBand === ">3200") return "wurch";
  if (context.agroEcological === "highland" || context.altitudeBand === "2300-3200") return "dega";
  if (context.agroEcological === "midland" || context.altitudeBand === "1500-2300") return "weyna_dega";
  return "kolla";
}

const round = (value: number, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;

export function mineralRowsFor(staples: string[]): MineralRow[] {
  const ids = [...new Set(staples.map((staple) => STAPLE_FOODS.find(([pattern]) => pattern.test(staple))?.[1]).filter((id): id is string => Boolean(id)))];
  return ids
    .map((id) => ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((food) => food.id === id))
    .filter((food): food is NonNullable<typeof food> => Boolean(food))
    .map((food) => {
      const phytate = food.antinutrients.phyticAcidMgPer100g;
      const fermented = estimateProcessingBioavailability(phytate, "fermentation_4day");
      const raw = { phytateFe: round(calculatePhytateMineralRatio(phytate, food.minerals.ironMg, FE_MW)), phytateZn: round(calculatePhytateMineralRatio(phytate, food.minerals.zincMg, ZN_MW)) };
      const after = {
        phytateFe: round(calculatePhytateMineralRatio(fermented.residualPhytateMg, food.minerals.ironMg, FE_MW)),
        phytateZn: round(calculatePhytateMineralRatio(fermented.residualPhytateMg, food.minerals.zincMg, ZN_MW)),
        method: "Traditional 4-day fermentation (ersho)",
      };
      return { food: food.nameEn, foodAm: food.nameAmharic, raw, fermented: after, ironOk: after.phytateFe < FE_LIMIT, zincOk: after.phytateZn < ZN_LIMIT };
    });
}

export function buildEcologicalMatrix(context: LocationContext, now = new Date()): EcologicalHealthMatrix {
  const key = zoneFor(context);
  const zone = ZONES[key];
  const altitudeRisks: EcologicalHealthMatrix["altitudeRisks"] = [];
  if (key === "wurch") altitudeRisks.push({ risk: "Low oxygen (hypoxia)", level: "high", note: "Breathlessness on effort, headaches and higher red-cell counts; heart and lung conditions weigh more." });
  if (key === "dega") altitudeRisks.push({ risk: "Mild altitude strain", level: "moderate", note: "Visitors from lowlands may feel breathless or have headaches for the first days." });
  if (key === "dega" || key === "wurch") altitudeRisks.push({ risk: "Cold and indoor smoke", level: "moderate", note: "Cold nights and wood-smoke cooking raise chest complaints." });
  if (key === "kolla" || key === "bereha") altitudeRisks.push({ risk: "Heat and dehydration", level: "high", note: "High temperatures increase fluid loss; remedies that purge or act as water pills matter more." });
  if (key === "rift_valley") altitudeRisks.push({ risk: "Fluoride in groundwater", level: "high", note: "Some Rift Valley wells exceed safe fluoride levels." });

  const endemicKeys = [...new Set([...context.endemicDiseases, ...(key === "rift_valley" ? ["dental_fluorosis"] : [])])];
  const endemic = endemicKeys.map((k) => (ENDEMIC[k] ? { key: k, ...ENDEMIC[k] } : { key: k, label: k.replace(/_/g, " "), level: "moderate" as const, note: "Reported for the region.", prevention: "Ask a local health centre." }));

  const leanMonths = context.foodAvailability.seasonalGaps;
  const currentlyLean = leanMonths.includes(MONTHS[now.getMonth()]);
  const minerals = mineralRowsFor(context.foodAvailability.staples);

  const deficiencies: EcologicalHealthMatrix["deficiencies"] = [];
  const ironPoor = minerals.some((row) => row.raw.phytateFe >= FE_LIMIT);
  const zincPoor = minerals.some((row) => row.raw.phytateZn >= ZN_LIMIT);
  if (ironPoor || endemicKeys.includes("anemia")) {
    deficiencies.push({ nutrient: "Iron", why: `Phytate in unfermented staples binds iron (phytate:iron ratio above ${FE_LIMIT})${endemicKeys.includes("anemia") ? " and anaemia is common here" : ""}.`, traditionalSolution: "Ferment teff batter 3–4 days with ersho before baking injera; serve with a vitamin C source (tomato, lemon, gomen); keep tea and coffee away from meals." });
  }
  if (zincPoor) {
    deficiencies.push({ nutrient: "Zinc", why: `Phytate:zinc ratios above ${ZN_LIMIT} in unfermented grains limit zinc absorption.`, traditionalSolution: "Fermentation and germination (malting, as for beso or tella grain) break down phytate; add pulses soaked overnight." });
  }
  if (endemicKeys.includes("goiter_iodine_deficiency")) deficiencies.push({ nutrient: "Iodine", why: "Iodine-poor highland soils.", traditionalSolution: "Use iodised salt, added after cooking so the iodine is not lost." });
  if (endemicKeys.includes("undernutrition") || currentlyLean) deficiencies.push({ nutrient: "Energy and protein", why: currentlyLean ? "The household is in its lean months." : "Undernutrition is common in the region.", traditionalSolution: "Pair cereals with pulses (injera with shiro or misir) to complete protein; kinche and kocho stretch stores." });

  const fermentationSolutions = [
    "Injera: 2–4 days of ersho fermentation removes most phytate; longer fermentation frees more iron and zinc.",
    "Kocho: pit fermentation of enset makes a stable, digestible starch store for the lean season.",
    "Germination: sprouting grains for beso or tella activates the grain's own phytase.",
    "Soaking pulses overnight and discarding the water lowers phytate and cooking time.",
  ];

  return {
    location: { region: context.admin.region, zone: context.admin.zone, woreda: context.admin.woreda, confidence: context.confidence ?? "reduced" },
    ecology: { key, am: zone.am, en: zone.en, note: zone.note, altitudeBand: context.altitudeBand, ecosystem: context.ecosystem, climate: context.climate.zone, rainySeasons: context.climate.rainySeasons },
    altitudeRisks,
    endemic,
    food: {
      staples: context.foodAvailability.staples,
      leanMonths,
      currentlyLean,
      leanNote: leanMonths.length ? `Lean months here: ${leanMonths.join(", ")}${currentlyLean ? " (now)" : ""}.` : "No lean months recorded for this area.",
    },
    minerals,
    deficiencies,
    fermentationSolutions,
    summary: `${zone.en} (${zone.am}) in ${context.admin.region}. ${endemic.filter((e) => e.level === "high").map((e) => e.label).join(", ") || "No high-burden conditions recorded"}; ${deficiencies.map((d) => d.nutrient.toLowerCase()).join(", ") || "no dietary gaps flagged"}.`,
  };
}

export async function ecologicalMatrixFor(input: LocationInput, now = new Date()) {
  return buildEcologicalMatrix(await resolveLocation({ source: "manual", ...input }), now);
}
