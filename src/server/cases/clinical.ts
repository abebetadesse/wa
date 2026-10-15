/**
 * The clinical picture of a case with bodily symptoms: which symptoms the person described, how soon
 * they should be seen, the warning signs still to rule out, what a clinician may consider and check
 * for each combination, and how every knowledge strand reads the picture (clinicalLexicon.ts).
 *
 * It sharpens the referral; it never replaces it. Conditions named here are for the reviewer's
 * judgement only (the report uses the `person` wording), and Domain B readings are withheld while a
 * safety signal is active.
 */
import { evaluateRiftValleyFluoride } from "@/lib/engines/agroEcologicalEngine";
import type { KnowledgeStrandType, UserProfile } from "@/lib/knowledge/types";
import { PATTERNS } from "./analysisLexicon";
import type { DetectedFactor } from "./analysis";
import { CLUSTERS, PRIORITY, STRAND_LENSES, SYMPTOM_DETAIL, type ClinicalPriority, type ClusterConsideration, type StrandLens } from "./clinicalLexicon";
import type { SpellingCorrection } from "./spelling";
import { LIFE_LENSES } from "./strandLexicon";
import type { CaseLens, ClinicalPicture, GroundedFinding } from "./types";

const DOMAIN_B = new Set<string>(["cultural", "astrological"]);
const STRAND_ORDER: KnowledgeStrandType[] = ["biological", "biochemical", "medication", "addiction", "ecological", "epidemiological", "psychological", "socioeconomic", "dietary", "cultural", "astrological"];
const LOWLAND_REGIONS = /afar|somali|gambella|benishangul/i;

interface ClinicalInput {
  detected: DetectedFactor[];
  corrections: SpellingCorrection[];
  profile: UserProfile;
  /** Grounded findings by strand, to show which catalogue entries each reading ties to. */
  findings: Map<string, GroundedFinding[]>;
  urgencyLevel: string;
  safetyActive: boolean;
}

/** What the profile says about the conditions some readings depend on; undefined means unknown. */
function profileFacts(profile: UserProfile, detected: Set<string>) {
  const age = profile.age ?? profile.demographics?.age;
  const gender = String(profile.demographics?.gender ?? "").toLowerCase();
  const region = profile.location?.region && profile.location.region !== "Unspecified" ? profile.location.region : undefined;
  const altitude = profile.location?.altitude;
  return {
    age: typeof age === "number" ? age : undefined,
    female: gender ? gender.startsWith("f") : undefined,
    lowland: typeof altitude === "number" ? altitude < 2000 : region ? LOWLAND_REGIONS.test(region) || undefined : undefined,
    riftValley: region ? evaluateRiftValleyFluoride(region).isRiftValleyZone : undefined,
    medicines: Boolean(profile.medications?.length),
    substances: detected.has("substance") || Boolean(profile.substanceUse?.length),
    pregnancy: Boolean(profile.pregnant ?? profile.wellbeing?.pregnant),
  };
}

type Facts = ReturnType<typeof profileFacts>;

/** Whether a profile-dependent item applies, and the caveat to add when the profile cannot say. */
function applies(condition: ClusterConsideration["when"] | StrandLens["only"], facts: Facts): { keep: boolean; caveat?: string } {
  switch (condition) {
    case undefined:
      return { keep: true };
    case "age_45_plus":
      return facts.age === undefined ? { keep: true, caveat: "weigh this more if the person is over about 45 (the profile has no age)" } : { keep: facts.age >= 45 };
    case "age_60_plus":
      return facts.age === undefined ? { keep: false } : { keep: facts.age >= 60 };
    case "lowland":
      return facts.lowland === undefined ? { keep: true, caveat: "relevant if the person lives in or has travelled to the lowlands" } : { keep: facts.lowland };
    case "highland":
      return { keep: facts.lowland === false };
    case "rift_valley":
      return facts.riftValley === undefined ? { keep: true, caveat: "relevant if the person lives in the Rift Valley" } : { keep: facts.riftValley };
    case "female":
      return { keep: facts.female === true };
    case "medicines":
      return facts.medicines ? { keep: true } : { keep: true, caveat: "ask whether any of these are being taken" };
    case "substances":
      return facts.substances ? { keep: true } : { keep: true, caveat: "ask about use; nothing was said about it" };
    case "pregnancy":
      return { keep: facts.pregnancy };
  }
}

const withCaveat = (text: string, caveat?: string) => (caveat ? `${text} (${caveat})` : text);
const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

interface LensInput {
  detected: DetectedFactor[];
  profile: UserProfile;
  findings: Map<string, GroundedFinding[]>;
  safetyActive: boolean;
  /** Conditions the symptom combinations bring into consideration, by strand (reviewer-only). */
  considerations?: Map<string, string[]>;
}

/**
 * Every strand's reading of the case: the bodily readings (clinicalLexicon.ts) when symptoms were
 * described, the life readings (strandLexicon.ts) for everything else, the catalogue entries kept
 * for that strand, and what to ask. Domain B strands are left out while a safety signal is active.
 */
export function buildStrandLenses({ detected, profile, findings, safetyActive, considerations = new Map() }: LensInput): CaseLens[] {
  const ids = new Set(detected.map((entry) => entry.factor.id));
  if (detected.some((entry) => entry.factor.physical && !["medication", "substance", "food"].includes(entry.factor.id))) ids.add("physical");
  if (detected.length) ids.add("any");
  const facts = profileFacts(profile, ids);
  return STRAND_ORDER.filter((strand) => !(safetyActive && DOMAIN_B.has(strand))).map((strand) => {
    const points = [...STRAND_LENSES[strand], ...LIFE_LENSES[strand]].flatMap((lens) => {
      if (!lens.when.some((id) => ids.has(id))) return [];
      const { keep, caveat } = applies(lens.only, facts);
      return keep ? [{ reviewer: withCaveat(lens.reviewer, caveat), ...(lens.person && !caveat ? { person: lens.person } : {}), ask: lens.ask }] : [];
    });
    return {
      strand,
      layer: (DOMAIN_B.has(strand) ? "B" : "A") as "A" | "B",
      points: points.map(({ reviewer, person }) => ({ reviewer, ...(person ? { person } : {}) })),
      ask: unique(points.map((point) => point.ask ?? "")),
      considerations: unique(considerations.get(strand) ?? []),
      findings: (findings.get(strand) ?? []).map((finding) => finding.name),
    };
  }).filter((lens) => lens.points.length || lens.considerations.length || lens.findings.length);
}

export function buildClinicalPicture({ detected, corrections, profile, findings, urgencyLevel, safetyActive }: ClinicalInput): ClinicalPicture | undefined {
  const physical = detected.filter((entry) => entry.factor.physical && entry.factor.id !== "medication" && entry.factor.id !== "substance" && entry.factor.id !== "food");
  if (!physical.length) return undefined;
  const ids = new Set(detected.map((entry) => entry.factor.id));
  ids.add("physical");
  const facts = profileFacts(profile, ids);

  const symptoms = physical.map((entry) => ({
    id: entry.factor.id,
    label: entry.factor.label,
    system: entry.factor.system ?? "General",
    quotes: entry.quotes,
    priority: SYMPTOM_DETAIL[entry.factor.id]?.priority ?? "routine",
  }));

  const clusters = PATTERNS.filter((pattern) => CLUSTERS[pattern.id] && pattern.needs.every((group) => group.some((id) => ids.has(id)))).map((pattern) => {
    const detail = CLUSTERS[pattern.id];
    const considerations = detail.considerations.flatMap((item) => {
      const { keep, caveat } = applies(item.when, facts);
      return keep ? [{ name: item.name, why: withCaveat(item.why, caveat), strand: item.strand }] : [];
    });
    return { id: pattern.id, title: pattern.title, priority: detail.priority, considerations, checks: detail.checks, ask: detail.ask };
  });

  // How soon: the most pressing of the symptoms, their combinations and the urgency detector.
  const reasons: Array<{ level: ClinicalPriority; why: string }> = [
    ...symptoms.filter((symptom) => symptom.priority !== "routine").map((symptom) => ({ level: symptom.priority, why: `${symptom.label} on its own` })),
    ...clusters.filter((cluster) => cluster.priority !== "routine").map((cluster) => ({ level: cluster.priority, why: cluster.title })),
    ...(urgencyLevel === "critical" ? [{ level: "emergency" as const, why: "The urgency detector found emergency signs in the person's words" }] : []),
    ...(urgencyLevel === "high" ? [{ level: "soon" as const, why: "The urgency detector found signs that should be seen soon" }] : []),
    ...(facts.age !== undefined && facts.age >= 60 ? [{ level: "prompt" as const, why: "New bodily symptoms at 60 or over" }] : []),
    ...(facts.pregnancy ? [{ level: "prompt" as const, why: "Bodily symptoms during pregnancy" }] : []),
  ];
  const level = reasons.reduce<ClinicalPriority>((best, reason) => (PRIORITY[reason.level].rank > PRIORITY[best].rank ? reason.level : best), "routine");
  const priority = {
    level,
    label: PRIORITY[level].label,
    timeframe: PRIORITY[level].timeframe,
    reasons: unique(reasons.filter((reason) => reason.level === level).map((reason) => reason.why)),
  };

  const details = symptoms.map((symptom) => SYMPTOM_DETAIL[symptom.id]).filter(Boolean);
  const considerations = new Map<string, string[]>();
  for (const item of clusters.flatMap((cluster) => cluster.considerations)) considerations.set(item.strand, [...(considerations.get(item.strand) ?? []), item.name]);
  const lenses = buildStrandLenses({ detected, profile, findings, safetyActive, considerations });

  const profileNotes = [
    ...(facts.age === undefined ? ["Age is not on the profile: thresholds for some checks (for example endoscopy over about 45) cannot be applied."] : []),
    ...(facts.lowland === undefined ? ["Where the person lives is not known: lowland infections (malaria, schistosomiasis, kala-azar) stay on the list until asked."] : []),
    ...(!facts.medicines ? ["No medicines are on the profile: ask about painkillers and traditional remedies directly."] : []),
  ];

  return {
    readAs: corrections,
    symptoms,
    priority,
    redFlags: unique(details.flatMap((detail) => detail.redFlags)).slice(0, 12),
    describe: unique(details.flatMap((detail) => detail.characterise)).slice(0, 8),
    clusters,
    checks: unique([...clusters.flatMap((cluster) => cluster.checks), ...details.flatMap((detail) => detail.checks)]).slice(0, 14),
    lenses,
    profileNotes,
  };
}

/** Extra words for the knowledge search, so every strand is asked about the symptoms described. */
export function clinicalSearchTerms(detected: DetectedFactor[]): string[] {
  const terms = detected.flatMap((entry) => SYMPTOM_DETAIL[entry.factor.id]?.retrieval ?? []);
  // The context every bodily complaint is lived in: remedies tried, fasting, food and healing practice.
  if (terms.length) terms.push("traditional medicine", "herbalist", "fasting", "food security", "healing", "health routine");
  return unique(terms);
}
