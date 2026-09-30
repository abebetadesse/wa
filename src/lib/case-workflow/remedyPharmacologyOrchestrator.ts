/**
 * Remedy & pharmacology orchestrator for a healer's review. DOMAIN A.
 *
 *   1. urgency screen of the client's own words (danger signs route to clinical care first)
 *   2. symptom categories from the healer's heading and the text
 *   3. candidate plants for those categories, each screened by the safety matrix against the
 *      client's medicines, age and pregnancy (injected: no database access here)
 *   4. PubMed (NCBI E-utilities) bioactivity literature for the plants still in play (injected)
 *   5. the multi-scale biochemical breakdown for the categories and plants
 *
 * The client's humoral constitution is Domain B: it is carried through untouched as cultural
 * context for the healer's own framing and is never used to rank or screen remedies.
 */
import { CATEGORY_PLANT_SLUGS, SYMPTOM_CATEGORIES, type SymptomCategory } from "@/lib/shared/symptomCategories";
import { analyseBiochemistry, type BiochemicalAnalysis } from "@/lib/evaluation/biochemicalAnalysisEngine";
import { assessUrgency, type UrgencyAssessment } from "@/lib/evaluation/urgencyTriage";

export type ScreenCondition = "pregnancy" | "breastfeeding" | "children" | "older" | "kidney" | "liver";

export interface ScreenedItem {
  slug: string;
  name: string;
  scientificName: string | null;
  kind: string;
  toxic: boolean;
  alerts: { condition: string; level: "avoid" | "caution"; note?: string }[];
}

export interface ScreenedPair {
  a: string;
  b: string;
  severity: "contraindicated" | "major" | "moderate" | "minor" | null;
  basis: "documented" | "predicted" | null;
  findings: { effect: string; management: string; mechanism: string }[];
}

export interface OrchestratorDeps {
  /** Runs the safety matrix over plant slugs plus the client's medicines (free text). */
  screen(input: { slugs: string[]; medicineNames: string[]; profile: ScreenCondition[] }): Promise<{ items: ScreenedItem[]; pairs: ScreenedPair[]; unmatched: string[] }>;
  /** Literature on a plant's bioactivity; may return [] when offline. */
  literature(scientificName: string): Promise<{ pmid: string; title: string; journal: string; year: string }[]>;
}

export interface OrchestratorInput {
  symptomsText: string;
  categories?: SymptomCategory[];
  extraPlantSlugs?: string[];
  age?: number | null;
  pregnant?: boolean;
  breastfeeding?: boolean;
  medicinesText?: string;
  nutrientGaps?: ("iron" | "zinc")[];
  /** Domain B, passed through only. */
  culturalContext?: { humor?: string | null };
}

export interface RemedyCandidate {
  slug: string;
  name: string;
  scientificName: string | null;
  status: "consider" | "caution" | "excluded";
  reasons: string[];
  route: "oral_or_topical" | "topical_only";
  literature: { pmid: string; title: string; journal: string; year: string; url: string }[];
}

export interface OrchestratorResult {
  urgency: UrgencyAssessment;
  categories: SymptomCategory[];
  referFirst: boolean;
  candidates: RemedyCandidate[];
  medicineInteractions: { a: string; b: string; severity: string; effect: string; management: string }[];
  unmatchedMedicines: string[];
  biochemistry: BiochemicalAnalysis;
  culturalContext: { humor: string | null; note: string };
  literatureNote: string;
}

const CATEGORY_WORDS: Record<SymptomCategory, RegExp> = {
  digestive: /belly|stomach ache|abdomen|cramp|diarrh|constipat|bloat|intestin|ሆድ|ተቅማጥ|ድርቀት|ቁርጠት|አንጀት/i,
  stomach_acid: /heartburn|burning.*(stomach|chest)|gastritis|ulcer|acid|ጨጓራ|ቃር/i,
  febrile: /fever|chills|shiver|malaria|ትኩሳት|ወባ|ብርድ ብርድ/i,
  respiratory: /cough|chest|breath|asthma|wheez|cold|flu|phlegm|ሳል|አስም|ጉንፋን|ትንፋሽ|አክታ/i,
  dermal: /skin|rash|itch|wound|sore|eczema|boil|wart|ቆዳ|ቁስል|እከክ|ሽፍታ|ኪንታሮት/i,
  headache: /headache|migraine|head pain|ራስ ምታት|ፈንጠር|ራሴን/i,
  joint: /joint|knee|back pain|rheumat|arthrit|body aches?|መገጣጠሚያ|ቁርጥማት|ጉልበት|ወገብ/i,
  blood_sugar: /sugar|diabet|ስኳር/i,
  heart_fatigue: /heart|palpitat|tired|fatigue|weak|ልብ|ድካም/i,
  tremor: /trembl|shak|tremor|መንቀጥቀጥ/i,
  general: /$^/,
};

export function detectCategories(text: string): SymptomCategory[] {
  return SYMPTOM_CATEGORIES.filter((category) => category !== "general" && CATEGORY_WORDS[category].test(text));
}

const TOPICAL_ONLY = new Set(["embuay", "senafich", "bahir-zaf"]);

function profileFor(input: OrchestratorInput): ScreenCondition[] {
  const profile: ScreenCondition[] = [];
  if (input.pregnant) profile.push("pregnancy");
  if (input.breastfeeding) profile.push("breastfeeding");
  if (input.age != null && input.age < 12) profile.push("children");
  if (input.age != null && input.age >= 65) profile.push("older");
  return profile;
}

export async function orchestrateRemedies(input: OrchestratorInput, deps: OrchestratorDeps): Promise<OrchestratorResult> {
  const urgency = assessUrgency(input.symptomsText, { age: input.age, pregnant: input.pregnant });
  const categories = [...new Set([...(input.categories ?? []), ...detectCategories(input.symptomsText)])];
  const slugs = [...new Set([...categories.flatMap((c) => CATEGORY_PLANT_SLUGS[c]), ...(input.extraPlantSlugs ?? [])])];
  const medicineNames = (input.medicinesText ?? "").split(/[\n,;/+]|\band\b/i).map((n) => n.trim()).filter((n) => n.length >= 3);
  const profile = profileFor(input);
  const screened = slugs.length || medicineNames.length ? await deps.screen({ slugs, medicineNames, profile }) : { items: [], pairs: [], unmatched: [] };

  const plantSet = new Set(slugs);
  const medicineSlugs = new Set(screened.items.filter((item) => !plantSet.has(item.slug)).map((item) => item.slug));
  const nameOf = (slug: string) => screened.items.find((item) => item.slug === slug)?.name ?? slug;
  const referFirst = urgency.level === "emergency";

  const candidates: RemedyCandidate[] = screened.items
    .filter((item) => plantSet.has(item.slug))
    .map((item) => {
      const reasons: string[] = [];
      let status: RemedyCandidate["status"] = "consider";
      const topicalOnly = item.toxic || TOPICAL_ONLY.has(item.slug);
      if (item.toxic) reasons.push("Poisonous if swallowed: skin use only, if at all.");
      for (const alert of item.alerts) {
        reasons.push(`${alert.level === "avoid" ? "Avoid" : "Caution"} for ${alert.condition}${alert.note ? `: ${alert.note}` : ""}.`);
        if (alert.level === "avoid") status = "excluded";
        else if (status === "consider") status = "caution";
      }
      for (const pair of screened.pairs) {
        const other = pair.a === item.slug ? pair.b : pair.b === item.slug ? pair.a : null;
        if (!other || !medicineSlugs.has(other) || !pair.severity) continue;
        reasons.push(`With ${nameOf(other)} (${pair.severity}${pair.basis === "predicted" ? ", predicted" : ""}): ${pair.findings[0]?.effect ?? ""}`);
        if (pair.severity === "contraindicated" || pair.severity === "major") status = "excluded";
        else if (pair.severity === "moderate" && status === "consider") status = "caution";
      }
      if (referFirst) {
        status = "excluded";
        reasons.unshift("Danger signs described: clinical care comes first.");
      }
      return { slug: item.slug, name: item.name, scientificName: item.scientificName, status, reasons, route: topicalOnly ? "topical_only" : "oral_or_topical", literature: [] };
    });

  // Literature only for plants still in play; each lookup is independent and may fail quietly.
  const inPlay = candidates.filter((c) => c.status !== "excluded" && c.scientificName).slice(0, 5);
  const results = await Promise.allSettled(inPlay.map((c) => deps.literature(c.scientificName!)));
  let literatureFailed = 0;
  results.forEach((result, index) => {
    if (result.status === "fulfilled") inPlay[index].literature = result.value.slice(0, 3).map((a) => ({ ...a, url: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/` }));
    else literatureFailed++;
  });

  const medicineInteractions = screened.pairs
    .filter((pair) => pair.severity && medicineSlugs.has(pair.a) && medicineSlugs.has(pair.b))
    .map((pair) => ({ a: nameOf(pair.a), b: nameOf(pair.b), severity: pair.severity!, effect: pair.findings[0]?.effect ?? "", management: pair.findings[0]?.management ?? "" }));

  const order = { consider: 0, caution: 1, excluded: 2 };
  return {
    urgency,
    categories,
    referFirst,
    candidates: candidates.sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name)),
    medicineInteractions,
    unmatchedMedicines: screened.unmatched,
    biochemistry: analyseBiochemistry({ categories, plantSlugs: candidates.filter((c) => c.status !== "excluded").map((c) => c.slug), nutrientGaps: input.nutrientGaps }),
    culturalContext: { humor: input.culturalContext?.humor ?? null, note: "Humoral constitution is shown for the healer's own traditional framing; it is not used to screen or rank remedies." },
    literatureNote: literatureFailed ? `PubMed could not be reached for ${literatureFailed} plant(s); try again later.` : "Articles are found live on PubMed; read them before relying on a claim.",
  };
}
