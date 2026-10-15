/**
 * Foods and plants a case owner shares with their reviewer, from a photo or typed by name.
 *
 * A photo is only ever turned into candidate names (photoRecognition.ts); those names, or the ones
 * the person typed, are matched here against the platform's own catalogues — the Ethiopian food
 * composition table and the traditional-medicine database — and the person confirms which entries
 * are right. Only the confirmed catalogue ids and names are kept on the case.
 *
 * The reviewer's reading of them (`buildFoodHerbReview`) uses the consented profile for cautions
 * (pregnancy, medicine classes, allergies, conditions) without naming any raw profile value.
 */
import { EFCT_MASTER_FOODS } from "@/lib/nutrition/efctDatabase";
import { INTENSIVE_TRADITIONAL_MEDICINES, type SafetyClassification } from "@/lib/knowledge/traditionalMedicineDatabase";
import type { EFCTFoodItem } from "@/lib/nutrition/types";
import type { TraditionalMedicineItem } from "@/lib/knowledge/traditionalMedicineDatabase";
import type { UserProfile } from "@/lib/knowledge/types";
import type { FoodHerbKind, FoodHerbNote, FoodHerbReview, WorkflowCase, WorkflowDomain, WorkflowStage } from "./types";

/** Case types where foods and plants bear on the request. */
export const FOOD_HERB_DOMAINS = new Set<WorkflowDomain>(["biological"]);
/** Stages in which the owner may still add to what the reviewer sees. */
export const FOOD_HERB_STAGES = new Set<WorkflowStage>(["intake", "awaiting_expert", "in_review"]);
export const MAX_FOOD_HERB_NOTES = 12;
export const MAX_ITEMS_PER_NOTE = 8;

export function acceptsFoodHerb(record: Pick<WorkflowCase, "domain" | "stage">): boolean {
  return FOOD_HERB_DOMAINS.has(record.domain) && FOOD_HERB_STAGES.has(record.stage);
}

// ── Catalogue matching ───────────────────────────────────────────────────────

export interface CatalogueMatch {
  id: string;
  kind: FoodHerbKind;
  name: string;
  nameAmharic: string;
  detail: string;
  /** 0–100: how closely the searched name matches this entry. */
  score: number;
}

interface Entry {
  id: string;
  kind: FoodHerbKind;
  name: string;
  nameAmharic: string;
  detail: string;
  aliases: string[];
}

// Common spelling variants of Ethiopian dish and plant names.
const VARIANTS: Array<[RegExp, string]> = [
  [/\bwat\b/g, "wot"],
  [/\btef\b/g, "teff"],
  [/\benjera\b/g, "injera"],
  [/\bshuro\b/g, "shiro"],
  [/\bmisr\b/g, "misir"],
];

export function normalise(text: string): string {
  let value = text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  for (const [pattern, replacement] of VARIANTS) value = value.replace(pattern, replacement);
  return value;
}

const split = (text: string) => text.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean);

function foodEntry(food: EFCTFoodItem): Entry {
  // "Shiro Wot (Spiced Chickpea & Field Pea Stew)": the plain name and each part in brackets are aliases.
  const bracketed = [...food.name.matchAll(/\(([^)]+)\)/g)].flatMap((match) => split(match[1]));
  const plain = food.name.replace(/\([^)]*\)/g, " ").trim();
  return {
    id: food.id,
    kind: "meal",
    name: food.name,
    nameAmharic: food.nameAmharic,
    detail: food.category,
    aliases: [food.name, plain, ...split(plain), ...bracketed, food.nameAmharic].map(normalise).filter((alias) => alias.length >= 2),
  };
}

function herbEntry(herb: TraditionalMedicineItem): Entry {
  return {
    id: herb.id,
    kind: "herb",
    name: herb.vernacularName,
    nameAmharic: herb.amharicName,
    detail: herb.englishName,
    aliases: [herb.vernacularName, ...split(herb.englishName), herb.amharicName, herb.scientificName.split(" ").slice(0, 2).join(" "), herb.slug.replace(/-/g, " ")]
      .map(normalise)
      .filter((alias) => alias.length >= 2),
  };
}

let catalogues: Record<FoodHerbKind, Entry[]> | null = null;
function catalogue(kind: FoodHerbKind): Entry[] {
  catalogues ??= { meal: EFCT_MASTER_FOODS.map(foodEntry), herb: INTENSIVE_TRADITIONAL_MEDICINES.map(herbEntry) };
  return catalogues[kind];
}

let byId: { foods: Map<string, EFCTFoodItem>; herbs: Map<string, TraditionalMedicineItem> } | null = null;
function records() {
  byId ??= { foods: new Map(EFCT_MASTER_FOODS.map((food) => [food.id, food])), herbs: new Map(INTENSIVE_TRADITIONAL_MEDICINES.map((herb) => [herb.id, herb])) };
  return byId;
}

const wordsOf = (text: string) => text.split(" ").filter((word) => word.length >= 3);
const containsPhrase = (haystack: string, needle: string) => ` ${haystack} `.includes(` ${needle} `);

function score(query: string, alias: string): number {
  if (alias === query) return 100;
  if (containsPhrase(alias, query)) return Math.max(60, 90 - Math.round((alias.length - query.length) / 2));
  if (alias.length >= 4 && containsPhrase(query, alias)) return 70;
  // Ethiopic script has no spaces between some compounds; a contained name still counts.
  if (/\p{Script=Ethiopic}/u.test(query) && query.length >= 2 && alias.includes(query)) return 65;
  const asked = wordsOf(query);
  if (!asked.length) return 0;
  const have = new Set(wordsOf(alias));
  const shared = asked.filter((word) => have.has(word)).length;
  return shared / asked.length >= 0.5 ? Math.round((shared / asked.length) * 55) : 0;
}

/** Catalogue entries for one searched name, best first. */
export function matchCatalogue(kind: FoodHerbKind, query: string, limit = 4): CatalogueMatch[] {
  const asked = normalise(query);
  if (asked.length < 2) return [];
  return catalogue(kind)
    .map((entry) => ({ entry, score: Math.max(...entry.aliases.map((alias) => score(asked, alias))) }))
    .filter((hit) => hit.score >= 40)
    .sort((a, b) => b.score - a.score || a.entry.name.length - b.entry.name.length)
    .slice(0, limit)
    .map(({ entry, score: value }) => ({ id: entry.id, kind: entry.kind, name: entry.name, nameAmharic: entry.nameAmharic, detail: entry.detail, score: value }));
}

/** Candidates for several names (from a photo or a typed list), without duplicates. */
export function matchNames(kind: FoodHerbKind, names: string[], limit = 10): CatalogueMatch[] {
  const best = new Map<string, CatalogueMatch>();
  for (const name of names.slice(0, MAX_ITEMS_PER_NOTE)) {
    for (const match of matchCatalogue(kind, name)) {
      const seen = best.get(match.id);
      if (!seen || seen.score < match.score) best.set(match.id, match);
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Typed input: one name per comma, line or semicolon. */
export function splitTypedNames(text: string): string[] {
  return text.split(/[,;\n፣፤]+/u).map((part) => part.trim()).filter((part) => part.length >= 2).slice(0, MAX_ITEMS_PER_NOTE);
}

/** The confirmed ids, resolved against the catalogue so stored names never come from the client. */
export function resolveItems(kind: FoodHerbKind, ids: string[]): Array<{ id: string; name: string }> {
  const known = new Map(catalogue(kind).map((entry) => [entry.id, entry]));
  const items = [...new Set(ids)].map((id) => known.get(id)).filter((entry): entry is Entry => Boolean(entry));
  return items.slice(0, MAX_ITEMS_PER_NOTE).map((entry) => ({ id: entry.id, name: entry.name }));
}

// ── What the reviewer reads ──────────────────────────────────────────────────

/** Statements for the analysis: the confirmed names (worded so the eating and medicine themes are recognised) and the owner's note. */
export function foodHerbStatements(notes: FoodHerbNote[]): Array<{ topic: string; text: string; free: boolean }> {
  return notes.flatMap((note) => {
    const topic = note.kind === "meal" ? (note.source === "photo" ? "Meal shown in a photo" : "Meal named by the person") : note.source === "photo" ? "Plant shown in a photo" : "Plant named by the person";
    const names = note.items.map((item) => item.name).join(", ");
    return [
      { topic, text: note.kind === "meal" ? `Meal: ${names}` : `Traditional medicine: ${names}`, free: false },
      ...(note.note ? [{ topic: `Note with ${topic.toLowerCase()}`, text: note.note, free: true }] : []),
    ];
  });
}

const FASTING: Record<string, string> = { fasting_friendly: "fasting-friendly", non_fasting: "not for fasting days", dual: "made in fasting and non-fasting versions" };
const SAFETY_LABEL: Record<SafetyClassification, string> = {
  safe_culinary: "Culinary; generally safe at food amounts",
  caution_moderate: "Active medicinal plant; caution in pregnancy and with dosage",
  high_risk_potent: "Potent; only under qualified supervision",
  toxic_internal_external_only: "Toxic if swallowed; external use only",
  strictly_poisonous: "Poisonous; reference only, never to be used",
};
const RISKY = new Set<SafetyClassification>(["high_risk_potent", "toxic_internal_external_only", "strictly_poisonous"]);
const GLUCOSE_CONDITIONS = /diabet|sugar|glucose|insulin|ስኳር/i;

/** True when a profile entry (≥ 4 letters) names something in the text. */
const mentionsAny = (values: string[], text: string) => {
  const haystack = normalise(text);
  return values.some((value) => {
    const needle = normalise(value);
    return needle.length >= 4 && haystack.includes(needle);
  });
};

/** A medicine on the profile that belongs to an interaction's drug class ("Anticoagulants (Warfarin, Aspirin)"). */
function onProfile(drugClass: string, medicines: string[]): boolean {
  const cls = normalise(drugClass);
  return medicines.some((medicine) => {
    const name = normalise(medicine).split(" ")[0] ?? "";
    return name.length >= 4 && cls.includes(name);
  });
}

export function buildFoodHerbReview(notes: FoodHerbNote[], profile: UserProfile): FoodHerbReview | undefined {
  if (!notes.length) return undefined;
  const { foods, herbs } = records();
  const medicines = profile.medications ?? [];
  const allergies = profile.wellbeing?.allergies ?? [];
  const conditions = profile.conditions ?? [];
  const glucose = conditions.some((condition) => GLUCOSE_CONDITIONS.test(condition));

  const review: FoodHerbReview = { meals: [], herbs: [], notes: [], cautions: [] };
  const seen = new Set<string>();
  const caution = (text: string) => {
    if (!review.cautions.includes(text)) review.cautions.push(text);
  };

  for (const note of notes) {
    if (note.note) review.notes.push(note.note);
    for (const item of note.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const food = note.kind === "meal" ? foods.get(item.id) : undefined;
      if (food) {
        const anti = food.antinutrients;
        review.meals.push({
          id: food.id,
          name: food.name,
          nameAmharic: food.nameAmharic,
          category: food.category,
          fasting: FASTING[food.fastingSuitability] ?? food.fastingSuitability,
          glycemic: `Glycaemic index ${food.glycemicIndex.value} (${food.glycemicIndex.rating})`,
          nutrients: food.nutrients.slice(0, 5).map((nutrient) => `${nutrient.name} ${nutrient.amountPer100g} ${nutrient.unit} per 100 g${nutrient.note ? ` — ${nutrient.note}` : ""}`),
          antinutrients: anti.phyticAcidMgPer100g || anti.tanninsMgPer100g
            ? `Phytate ${anti.phyticAcidMgPer100g} mg and tannins ${anti.tanninsMgPer100g} mg per 100 g; ${anti.traditionalDegradationMethod}`
            : undefined,
          notes: [food.physiologicalNotes.digestiveTolerance].filter(Boolean),
          source: food.sourceRef,
        });
        if (glucose && food.glycemicIndex.rating === "high") caution(`${food.name} has a high glycaemic index and the profile lists a condition where blood sugar matters.`);
        if (mentionsAny(allergies, `${food.name} ${food.traditionalPreparation}`)) caution(`${food.name} may contain something the profile lists as an allergy; check before mentioning it.`);
        continue;
      }
      const herb = note.kind === "herb" ? herbs.get(item.id) : undefined;
      if (!herb) continue;
      const interactions = herb.herbDrugInteractions.map((interaction) => ({ ...interaction, onProfile: onProfile(interaction.drugClass, medicines) }));
      review.herbs.push({
        id: herb.id,
        name: herb.vernacularName,
        amharicName: herb.amharicName,
        scientificName: herb.scientificName,
        safety: herb.safetyClassification,
        safetyLabel: SAFETY_LABEL[herb.safetyClassification],
        traditionalUse: herb.traditionalUse,
        contraindications: herb.contraindications,
        interactions,
        source: herb.source,
      });
      if (RISKY.has(herb.safetyClassification)) caution(`${herb.vernacularName}: ${SAFETY_LABEL[herb.safetyClassification].toLowerCase()}. Ask how it is being used before anything else.`);
      if (profile.pregnant && herb.safetyClassification !== "safe_culinary") caution(`${herb.vernacularName} is a medicinal plant and the profile records pregnancy or breastfeeding: refer to antenatal care.`);
      const flagged = interactions.filter((interaction) => interaction.onProfile);
      if (flagged.length) caution(`${herb.vernacularName} interacts with ${flagged.map((interaction) => interaction.drugClass.replace(/\s*\(.*\)$/, "").toLowerCase()).join(" and ")}, and the profile lists a medicine of that kind.`);
      else if (medicines.length && interactions.length) caution(`${herb.vernacularName} has known medicine interactions and the profile lists medicines: have a pharmacist check them together.`);
      if (mentionsAny(allergies, `${herb.vernacularName} ${herb.englishName} ${herb.botanicalFamily}`)) caution(`${herb.vernacularName} may match an allergy on the profile.`);
    }
  }
  return review.meals.length || review.herbs.length ? review : undefined;
}

/** Herbs that should stop the report until the reviewer has spoken to the person. */
export function foodHerbWarnings(review: FoodHerbReview | undefined): string[] {
  return (review?.herbs ?? [])
    .filter((herb) => herb.safety === "strictly_poisonous")
    .map((herb) => `The person shared ${herb.name} (${herb.safetyLabel.toLowerCase()}): confirm how it is used before sending any guidance.`);
}
