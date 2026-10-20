/**
 * Reviewer's analysis of a submitted case.
 *
 * Every knowledge strand and the cross-strand, urgency, fasting and agro-ecological engines are run
 * over the request. The strands return most of their catalogue with near-identical scores, so the
 * result is then GROUNDED: a finding is kept only when the person's own answers, an extracted
 * entity or their profile supports it, and the reason is recorded next to it. Causes are ranked
 * hypotheses built from what the person said (analysisLexicon.ts), each with its supporting words.
 *
 * The dossier is for the reviewer only. Domain A (evidence) and Domain B (cultural reflection) stay
 * apart, and Domain B is withheld while a safety signal is active.
 */
import { globalOrchestrator } from "@/lib/knowledge/orchestrator";
import { EntityExtractor, type ExtractedEntity } from "@/lib/knowledge/parsing/entityExtractor";
import { IntentClassifier } from "@/lib/knowledge/parsing/intentClassifier";
import { UrgencyDetector } from "@/lib/knowledge/parsing/urgencyDetector";
import type { IntersectionFinding, KnowledgeStrandType, StrandFinding, UserProfile } from "@/lib/knowledge/types";
import { evaluateFastingStatus } from "@/lib/engines/fastingMetabolismEngine";
import { evaluateRiftValleyFluoride, resolveAgroEcologicalZone } from "@/lib/engines/agroEcologicalEngine";
import { isBionicConfigured } from "@/lib/ai/bionicGPT";
import { FACTORS, GENERIC_FOLLOW_UPS, PATTERNS, type Factor } from "./analysisLexicon";
import { buildPersonContext } from "./personContext";
import { buildFoodHerbReview, foodHerbStatements, foodHerbWarnings } from "./foodHerb";
import { buildClinicalPicture, buildStrandLenses, clinicalSearchTerms } from "./clinical";
import { correctSpelling, type SpellingCorrection } from "./spelling";
import { citationFor } from "./citations";
import { CONTACTS } from "./support";
import {
  buildDecisionFramework,
  buildDecisionGuidance,
  buildDecisionResources,
  categorizeCause,
} from "./decisionEngine";
import type {
  AnalysisCause,
  AnalysisConfidence,
  AnalysisLayer,
  AnalysisSolution,
  CaseAnalysis,
  CauseStatus,
  ClinicalPicture,
  DomainConfig,
  GroundedFinding,
  WorkflowCase,
} from "./types";

const DOMAIN_B = new Set<string>(["cultural", "astrological"]);
/** Case types whose published report is cultural and spiritual reflection only (see strandRouting.ts). */
const REFLECTION_ONLY = new Set<string>(["career", "legal"]);
const PROFESSIONAL_STRANDS = new Set<string>(["medication", "biochemical", "biological", "epidemiological", "addiction", "dietary"]);
const MAX_PER_STRAND = 4;
const KEEP_SCORE = 3;

const intentClassifier = new IntentClassifier();
const entityExtractor = new EntityExtractor();
const urgencyDetector = new UrgencyDetector();

export interface AnalysisDeps {
  retrieve: typeof globalOrchestrator.retrieveAll;
  now: () => Date;
}

const defaultDeps: AnalysisDeps = {
  retrieve: (...args) => globalOrchestrator.retrieveAll(...args),
  now: () => new Date(),
};

// ── What the person said ─────────────────────────────────────────────────────

export interface Statement {
  /** The question (or "Follow-up reply"). */
  topic: string;
  text: string;
  /** Free text the person wrote, as opposed to an option they picked. */
  free: boolean;
  /** An answer to the safety screen: handled by the domain's safety rules, not read for factors. */
  screen?: boolean;
}

/** Answers as readable statements: option values become their labels, internal fields are skipped. */
export function caseStatements(record: Pick<WorkflowCase, "answers" | "safetyAnswers" | "messages" | "foodHerbNotes">, config: DomainConfig): Statement[] {
  const screen = new Set(config.safetyQuestions.map((question) => question.id));
  const questions = [...config.safetyQuestions, ...(config.startQuestions ?? []), ...config.questions(record.answers)];
  const answers = { ...record.safetyAnswers, ...record.answers };
  const statements: Statement[] = [];
  const seen = new Set<string>();
  for (const question of questions) {
    if (seen.has(question.id)) continue;
    seen.add(question.id);
    const raw = answers[question.id];
    const values = (Array.isArray(raw) ? raw : [raw]).filter((value) => value !== undefined && value !== null && String(value).trim() !== "");
    if (!values.length || question.type === "name_geez") continue;
    const labels = values.map((value) => question.options?.find((option) => option.value === String(value))?.label ?? String(value).trim());
    if (labels.every((label) => label === "prefer_not" || label.toLowerCase() === "prefer not to say")) continue;
    statements.push({ topic: question.text, text: labels.join(", "), free: !question.options?.length, screen: screen.has(question.id) });
  }
  for (const message of record.messages ?? []) {
    if (message.from === "owner") statements.push({ topic: "Follow-up reply", text: message.body, free: true });
  }
  statements.push(...foodHerbStatements(record.foodHerbNotes ?? []));
  return statements;
}

const sentences = (text: string) => text.split(/(?<=[.!?።\n])\s*/u).map((part) => part.trim()).filter(Boolean);
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

function triggerPattern(trigger: string): RegExp {
  const escaped = trigger.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Ethiopic and other non-Latin triggers match anywhere; Latin ones at the start of a word.
  if (!/^[a-z]/.test(trigger)) return new RegExp(escaped, "iu");
  return new RegExp(`(?<![a-z])${escaped}${trigger.endsWith(" ") ? "(?![a-z])" : ""}`, "iu");
}

const FACTOR_PATTERNS = FACTORS.map((factor) => ({ factor, patterns: factor.triggers.map(triggerPattern) }));
const NEGATED = /(?<![a-z])(no|not|never|without|don't|dont|doesn't|didn't|do not|does not|did not|neither|nor)(?![a-z])[^.!?,;]{0,24}$/i;
const NEGATIVE_OPTION = /^(no|none|not|never|n\/a)(?![a-z])/i;

function mentions(factor: Factor, patterns: RegExp[], sentence: string): boolean {
  return patterns.some((pattern) => {
    const match = pattern.exec(sentence);
    return Boolean(match) && !(factor.negatable && NEGATED.test(sentence.slice(0, match!.index)));
  });
}

export interface DetectedFactor {
  factor: Factor;
  hits: number;
  quotes: string[];
  weight: number;
}

/** Symptom-word slips in the person's free text, read as they were meant (spelling.ts). */
export function spellingCorrections(statements: Statement[]): SpellingCorrection[] {
  const corrections = statements.filter((statement) => statement.free).flatMap((statement) => correctSpelling(statement.text).corrections);
  return corrections.filter((entry, index) => corrections.findIndex((other) => other.from === entry.from) === index);
}

/** Factors present in the person's own statements, with the sentences that show them. */
export function detectFactors(statements: Statement[]): DetectedFactor[] {
  // Free text is matched with symptom-word slips corrected, and quoted as the person wrote it.
  const readings = statements.map((statement) => {
    const parts = statement.free ? sentences(statement.text) : [statement.text];
    return { statement, parts, read: statement.free ? parts.map((part) => correctSpelling(part).text) : parts };
  });
  const detected: DetectedFactor[] = [];
  for (const { factor, patterns } of FACTOR_PATTERNS) {
    const quotes: string[] = [];
    let hits = 0;
    for (const { statement, parts, read } of readings) {
      // Picked options count when they state something; "No" answers and the safety screen do not.
      if (statement.screen || (!statement.free && NEGATIVE_OPTION.test(statement.text))) continue;
      parts.forEach((sentence, index) => {
        if (!mentions(factor, patterns, read[index])) return;
        hits++;
        const quote = statement.free ? clip(sentence, 180) : `${clip(statement.topic, 80)} — ${clip(sentence, 100)}`;
        if (quotes.length < 3 && !quotes.includes(quote)) quotes.push(quote);
      });
    }
    if (hits) detected.push({ factor, hits, quotes, weight: factor.weight + Math.min(hits, 3) * 0.5 });
  }
  // A named symptom ("abdominal pain") says more than the general "bodily symptoms" theme.
  const specific = detected.some((entry) => entry.factor.system);
  return detected.filter((entry) => !(specific && entry.factor.id === "physical")).sort((a, b) => b.weight - a.weight);
}

// ── Grounding knowledge findings ─────────────────────────────────────────────

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : []);

function findingSteps(finding: StrandFinding): string[] {
  const steps = [...strings(finding.recommendations), ...strings(finding.management), ...strings(finding.prevention), ...strings(finding.risk_assessment?.recommendations)];
  return [...new Set(steps.map((step) => clip(step.trim(), 240)))].slice(0, 3);
}

/**
 * Keeps the findings that something in the case supports. Score: a factor's knowledge stem in the
 * finding's name (3), in its category or type (1.5) or description (1, halved when the strand is
 * not one that explains the factor); an extracted entity in the name (3); the person's region or
 * city in the name (2).
 */
export function groundFindings(
  strand: string,
  findings: StrandFinding[],
  detected: DetectedFactor[],
  entities: ExtractedEntity[],
  profile: UserProfile,
): GroundedFinding[] {
  const layer: AnalysisLayer = DOMAIN_B.has(strand) ? "B" : "A";
  const places = [profile.location?.region, profile.location?.city, profile.demographics?.region, profile.demographics?.city]
    .filter((place): place is string => Boolean(place && place.length > 3 && place !== "Unspecified"))
    .map((place) => place.toLowerCase());
  const entityWords = entities
    .filter((entity) => entity.category === "symptom" || entity.category === "medication" || entity.category === "substance")
    .map((entity) => ({ label: entity.label, word: entity.value.replace(/_/g, " ").toLowerCase() }))
    .filter((entity) => entity.word.length > 3);

  const grounded: GroundedFinding[] = [];
  for (const finding of findings) {
    const name = finding.name.toLowerCase();
    const kind = `${finding.category ?? ""} ${finding.type ?? ""}`.replace(/_/g, " ").toLowerCase();
    const description = (finding.description ?? "").toLowerCase();
    let score = 0;
    const matchedOn: string[] = [];
    // A stem shared by two factors ("livelihood" for work and money) supports the finding once.
    const counted = new Set<string>();
    for (const { factor, quotes } of detected) {
      const explains = factor.strands.includes(strand as KnowledgeStrandType);
      let best = 0;
      let bestStem = "";
      for (const stem of factor.knowledge) {
        const weight = counted.has(stem) ? 0 : name.includes(stem) ? 3 : kind.includes(stem) ? 1.5 : description.includes(stem) ? 1 : 0;
        if (weight > best) [best, bestStem] = [weight, stem];
      }
      if (!best) continue;
      counted.add(bestStem);
      score += explains ? best : best / 2;
      matchedOn.push(`${factor.label}: “${clip(quotes[0] ?? "", 90)}”`);
    }
    for (const entity of entityWords) {
      if (!name.includes(entity.word)) continue;
      score += 3;
      matchedOn.push(`Mentioned: ${entity.label}`);
    }
    for (const place of new Set(places)) {
      if (!name.includes(place)) continue;
      score += 2;
      matchedOn.push(`Profile: ${place}`);
    }
    if (score < KEEP_SCORE) continue;
    grounded.push({
      strand,
      layer,
      name: finding.name,
      summary: clip(finding.description ?? "", 320),
      relevance: Math.min(1, Math.round((score / 9) * 100) / 100),
      matchedOn: [...new Set(matchedOn)].slice(0, 4),
      severity: finding.severity,
      steps: findingSteps(finding),
      source: strings(finding.sources)[0] ?? (typeof finding.evidence === "string" ? clip(finding.evidence, 160) : undefined),
      citation: citationFor(strand, finding),
    });
  }
  return grounded.sort((a, b) => b.relevance - a.relevance).slice(0, MAX_PER_STRAND);
}

// ── Causes and solutions ─────────────────────────────────────────────────────

/**
 * strong: factors that explain each other, said more than in passing, with supporting knowledge.
 * moderate: a joined pattern, or one factor raised repeatedly with supporting knowledge.
 */
function confidenceFor(signals: number, corroborated: boolean, joined: boolean): AnalysisConfidence {
  if (joined && corroborated && signals >= 3) return "strong";
  if (joined || (corroborated && signals >= 2)) return "moderate";
  return "tentative";
}

export function rankCauses(detected: DetectedFactor[], kept: GroundedFinding[], profile: UserProfile = {}): AnalysisCause[] {
  if (!detected.length) return [];
  const byId = new Map(detected.map((entry) => [entry.factor.id, entry]));
  const strandsFor = (ids: string[]) => {
    const labels = ids.map((id) => byId.get(id)!.factor.label);
    return [...new Set(kept.filter((finding) => finding.layer === "A" && labels.some((label) => finding.matchedOn.some((reason) => reason.startsWith(`${label}:`)))).map((finding) => finding.strand))];
  };
  const causes: Array<AnalysisCause & { score: number }> = [];
  const covered = new Set<string>();

  for (const pattern of PATTERNS) {
    const groups = pattern.needs.map((group) => group.filter((id) => byId.has(id)));
    if (groups.some((group) => !group.length)) continue;
    const ids = [...new Set(groups.flat())];
    const members = ids.map((id) => byId.get(id)!);
    const strands = strandsFor(ids);
    ids.forEach((id) => covered.add(id));
    causes.push({
      id: pattern.id,
      title: pattern.title,
      explanation: pattern.explanation,
      confidence: confidenceFor(members.reduce((sum, member) => sum + member.hits, 0), strands.length > 0, true),
      because: [...new Set(members.flatMap((member) => member.quotes.slice(0, 2)))].slice(0, 4),
      factors: ids,
      strands,
      // The average, so a pattern is not ranked higher merely for joining more factors.
      score: (members.reduce((sum, member) => sum + member.weight, 0) / members.length) * (members.some((member) => member.factor.safety) ? 2 : 1.2),
    });
  }

  // Profile-augmented causal hypotheses (when supported by detected user factors)
  const habits = profile.lifestyleHabits ?? {};
  const hasTeaOrCoffeeHabit = Boolean(habits.teaWithMeals || habits.coffeeWithMeals || habits.bunnaWithMeals);
  if (byId.has("fatigue") && hasTeaOrCoffeeHabit && !covered.has("caffeine")) {
    const fatigueMember = byId.get("fatigue")!;
    causes.push({
      id: "tannin_chelation_iron",
      title: "Tea or coffee with meals may be inhibiting iron and mineral absorption",
      explanation: "Tannins and polyphenols in tea or coffee taken alongside plant-based meals bind non-heme iron and zinc, leading to unreplenished fatigue.",
      confidence: "moderate",
      because: [...fatigueMember.quotes.slice(0, 2), "Profile: habitual bunna/tea immediately with meals"],
      factors: ["caffeine", "fatigue"],
      strands: strandsFor(["caffeine", "fatigue"]),
      score: 1.6,
    });
  }

  const altitude = profile.location?.altitude;
  if (typeof altitude === "number" && altitude >= 2200 && (byId.has("fatigue") || byId.has("headache_dizziness") || byId.has("physical"))) {
    const target = byId.get("fatigue") ?? byId.get("headache_dizziness") ?? byId.get("physical")!;
    causes.push({
      id: "altitude_adaptation_strain",
      title: "High altitude living increases baseline oxygen-carrying and hydration demands",
      explanation: "Elevations above 2,200m demand 15-25% higher hemoglobin baseline and accelerated respiratory water loss, potentially manifesting as low energy.",
      confidence: "moderate",
      because: [...target.quotes.slice(0, 2), `Profile: residing at ${altitude}m elevation`],
      factors: [target.factor.id],
      strands: strandsFor([target.factor.id]),
      score: 1.5,
    });
  }

  if ((profile.lifestyle?.fasting || habits.fastingSchedule || profile.wellbeing?.fasting) && (byId.has("food") || byId.has("fatigue") || byId.has("weight_loss"))) {
    const target = byId.get("food") ?? byId.get("fatigue") ?? byId.get("weight_loss")!;
    causes.push({
      id: "fasting_metabolic_adaptation",
      title: "Fasting schedule without sufficient legume diversity strains energy reserves",
      explanation: "Plant-based fasting days without planned combinations of protein and micronutrient-dense seeds commonly manifest as fatigue.",
      confidence: "moderate",
      because: [...target.quotes.slice(0, 2), "Profile: observed fasting schedule"],
      factors: [target.factor.id],
      strands: strandsFor([target.factor.id]),
      score: 1.5,
    });
  }

  for (const entry of detected) {
    if (covered.has(entry.factor.id)) continue;
    const strands = strandsFor([entry.factor.id]);
    causes.push({
      id: entry.factor.id,
      title: entry.factor.causeTitle,
      explanation: `Raised ${entry.hits === 1 ? "once" : `${entry.hits} times`} in the request. Treat as a contributing factor to confirm with the person.`,
      confidence: confidenceFor(entry.hits, strands.length > 0, false),
      because: entry.quotes,
      factors: [entry.factor.id],
      strands,
      score: entry.weight * (entry.factor.safety ? 2 : 1),
    });
  }

  return causes
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ score: _score, ...cause }) => {
      const category = categorizeCause(cause.id, cause.factors);
      const decisionGuidance = buildDecisionGuidance(cause.id, cause.factors, profile);
      const resources = buildDecisionResources(cause.id, cause.factors, profile);
      return {
        ...cause,
        category,
        status: "hypothesized" as CauseStatus,
        decisionGuidance,
        resources,
        includeInReport: true,
      };
    });
}

export function proposeSolutions(causes: AnalysisCause[], detected: DetectedFactor[], kept: GroundedFinding[], urgent: boolean, clinical?: ClinicalPicture): AnalysisSolution[] {
  const byId = new Map(detected.map((entry) => [entry.factor.id, entry.factor]));
  const solutions: AnalysisSolution[] = [];
  const personalSafety = detected.some((entry) => entry.factor.safety);
  if (urgent || personalSafety) {
    solutions.push({
      id: "safety",
      title: "Safety first",
      // A medical emergency starts with the ambulance; fear of harm starts with the support line.
      steps: personalSafety
        ? [
          `Share the support line ${CONTACTS.crisisLine.number} (${CONTACTS.crisisLine.name}) and police ${CONTACTS.police.number}; ambulance ${CONTACTS.ambulance.number} for a medical emergency.`,
          "Check that the person is safe now and has one trusted contact before sending any other guidance.",
        ]
        : [
          `Tell the person to call the ambulance (${CONTACTS.ambulance.number}) or go to the nearest emergency department now, and not to wait for this report.`,
          "Confirm by message that they have been seen before sending any other guidance.",
        ],
      horizon: "now",
      addresses: causes.filter((cause) => cause.factors.some((id) => byId.get(id)?.safety)).map((cause) => cause.id),
      needsProfessional: true,
      source: personalSafety ? "Platform crisis protocol" : "Medical urgency protocol",
    });
  }
  if (clinical && clinical.priority.level !== "emergency") {
    const symptomIds = new Set(clinical.symptoms.map((symptom) => symptom.id));
    solutions.push({
      id: "health-assessment",
      title: `Health assessment ${clinical.priority.timeframe}`,
      steps: [
        `Arrange an in-person assessment at a health centre or clinic ${clinical.priority.timeframe}.`,
        "Ask the person to bring every medicine, painkiller and traditional remedy they use, and a note of when the symptoms began and what changes them.",
        ...(symptomIds.has("weight_loss") ? ["Ask for the weight to be measured and recorded, so the trend can be followed."] : []),
        `Checks a health worker may consider: ${clinical.checks.slice(0, 6).join("; ")}.`,
      ],
      horizon: clinical.priority.level === "soon" ? "now" : "this_week",
      addresses: causes.filter((cause) => cause.factors.some((id) => symptomIds.has(id))).map((cause) => cause.id),
      needsProfessional: true,
      source: "Clinical referral protocol",
    });
  }
  for (const cause of causes) {
    const factors = cause.factors.map((id) => byId.get(id)).filter((factor): factor is Factor => Boolean(factor) && !factor!.safety);
    const steps = [...new Set(factors.flatMap((factor) => factor.steps))].slice(0, 4);
    if (!steps.length) continue;
    solutions.push({
      id: `plan-${cause.id}`,
      title: `Plan for: ${cause.title}`,
      steps,
      horizon: "this_week",
      addresses: [cause.id],
      needsProfessional: factors.some((factor) => factor.physical),
      source: "Case review protocol",
    });
  }
  // Catalogue advice is proposed only for findings the person named or that several signals support;
  // weaker matches stay available under "Knowledge by strand".
  const specific = (finding: GroundedFinding) => finding.relevance >= 0.6 || finding.matchedOn.some((reason) => reason.startsWith("Mentioned:"));
  const used = new Set<string>();
  for (const finding of kept.filter((item) => item.layer === "A" && item.steps.length && specific(item)).sort((a, b) => b.relevance - a.relevance)) {
    if (used.size >= 4 || used.has(finding.strand)) continue;
    used.add(finding.strand);
    solutions.push({
      id: `knowledge-${finding.strand}`,
      title: `${finding.name} (${finding.strand} knowledge)`,
      steps: finding.steps,
      horizon: "ongoing",
      addresses: causes.filter((cause) => cause.strands.includes(finding.strand)).map((cause) => cause.id),
      needsProfessional: PROFESSIONAL_STRANDS.has(finding.strand),
      source: finding.source ?? `${finding.strand} knowledge strand`,
    });
  }
  return solutions;
}

// ── Engines ──────────────────────────────────────────────────────────────────

function contextEngines(detected: DetectedFactor[], profile: UserProfile, record: WorkflowCase, now: Date): CaseAnalysis["engines"] {
  const has = (...ids: string[]) => detected.some((entry) => ids.includes(entry.factor.id));
  const engines: CaseAnalysis["engines"] = [];
  if (has("food", "fatigue", "weight_loss", "appetite_loss", "abdominal")) {
    const fasting = evaluateFastingStatus(now);
    engines.push({
      id: "fasting_calendar",
      title: "Fasting calendar",
      summary: `Current season: ${String(fasting.currentSeason).replace(/_/g, " ")} (${fasting.seasonNameAmharic})${fasting.isStrictVeganDay ? "; today is a fasting day" : ""}.`,
      items: fasting.micronutrientVulnerabilities.slice(0, 3).map((item) => `${item.nutrient} (${item.depletionRisk} risk): ${item.indigenousCompensationStrategy}`),
    });
  }
  const altitude = profile.location?.altitude;
  if (typeof altitude === "number" && has("food", "fatigue", "physical")) {
    const zone = resolveAgroEcologicalZone(altitude);
    engines.push({
      id: "agro_ecology",
      title: "Agro-ecological zone",
      summary: `${zone.zone.replace(/_/g, " ")} (${zone.nameAmharic}) at about ${altitude} m.`,
      items: [`Staple crops: ${zone.keyStapleCrops.slice(0, 4).join(", ")}`],
    });
  }
  const region = profile.location?.region;
  if (region && region !== "Unspecified" && has("physical", "food", "fatigue")) {
    const fluoride = evaluateRiftValleyFluoride(region);
    if (fluoride.isRiftValleyZone) {
      engines.push({
        id: "fluoride",
        title: "Rift Valley water fluoride",
        summary: `${fluoride.fluorosisRiskTier} fluorosis risk for ${region}.`,
        items: fluoride.recommendations.slice(0, 2).map((item) => `${item.title}: ${item.description}`),
      });
    }
  }
  if (record.context.gematria) {
    engines.push({ id: "awde_negest", title: "Awde Negest name reading", summary: "Computed from the Ge'ez name when the case was opened; its sections are in the report draft.", items: [] });
  }
  engines.push({
    id: "language_model",
    title: "Language-model synthesis",
    summary: isBionicConfigured() ? "Configured: an AI-assisted situation analysis is added to the report draft for your review." : "Not configured: the draft and this analysis come from the knowledge base and rules only.",
    items: [],
  });
  return engines;
}

function groundedIntersections(intersections: IntersectionFinding[], keptStrands: Set<string>): CaseAnalysis["intersections"] {
  return intersections
    .filter((item) => item.strands.every((strand) => keptStrands.has(strand) && !DOMAIN_B.has(strand)))
    .slice(0, 4)
    .map((item) => ({ title: item.type.replace(/_/g, " "), description: item.description, recommendation: item.recommendation, strands: item.strands }));
}

// ── Data quality ─────────────────────────────────────────────────────────────

const TIMING = /\d|since|ago|day|week|month|year|yesterday|recent|ቀን|ሳምንት|ወር|ዓመት|አመት|ጀምሮ/iu;

function assessData(words: number, detected: DetectedFactor[], profile: UserProfile, asked: Set<string>, said: string, clinical?: ClinicalPicture): CaseAnalysis["dataQuality"] {
  const used = [`Request answers (${words} words)`];
  const gaps: string[] = [];
  const age = profile.age ?? profile.demographics?.age;
  const fields: Array<[string, boolean]> = [
    ["age", typeof age === "number"],
    ["gender", Boolean(profile.demographics?.gender)],
    ["region", Boolean(profile.location?.region && profile.location.region !== "Unspecified")],
  ];
  const physical = detected.some((entry) => entry.factor.physical);
  if (physical) fields.push(["medicines and health conditions", Boolean(profile.medications?.length || profile.conditions?.length)]);
  for (const [label, present] of fields) (present ? used : gaps).push(present ? `Profile: ${label}` : `The profile has no ${label}`);
  if (words < 40) gaps.push(`The description is short (${words} words)`);
  if (!detected.length) gaps.push("No recognisable factor in the answers; the person's main concern is unclear");
  if (clinical && !TIMING.test(said)) gaps.push("When the symptoms began and how they have changed is not stated");

  const followUps = detected.slice(0, 3).map((entry) => entry.factor.followUp);
  // With symptoms, the warning-sign question comes straight after the main one.
  if (clinical?.redFlags.length) followUps.splice(1, 0, `Have you noticed any of these: ${clinical.redFlags.slice(0, 4).map((flag) => flag.charAt(0).toLowerCase() + flag.slice(1)).join("; ")}?`);
  if (words < 40 || !detected.length) followUps.push(...GENERIC_FOLLOW_UPS);
  if (physical && !profile.medications?.length) followUps.push("Are you taking any medicines or traditional remedies at the moment?");

  const present = fields.filter(([, value]) => value).length;
  const score = Math.round(40 * Math.min(1, words / 80) + 30 * (present / fields.length) + 30 * Math.min(1, detected.length / 3));
  // Questions the reviewer has already sent are not suggested again.
  return { score, used, gaps, followUps: [...new Set(followUps)].filter((question) => !asked.has(question)).slice(0, 6) };
}

// ── Urgency ──────────────────────────────────────────────────────────────────

const CLINICAL_URGENCY = { prompt: { level: "medium", score: 50 }, soon: { level: "high", score: 75 } } as const;
const URGENCY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };

/**
 * The detector reads alarm words; the clinical picture reads combinations ("pain with weight loss").
 * The shown urgency is the higher of the two. Safety warnings still follow the detector alone.
 */
function withClinicalPriority(urgency: ReturnType<UrgencyDetector["detect"]>, clinical?: ClinicalPicture): CaseAnalysis["urgency"] {
  const shown = { level: urgency.level as string, score: urgency.score, signals: urgency.matchedSignals, recommendation: urgency.recommendation };
  const raised = clinical && clinical.priority.level !== "routine" && clinical.priority.level !== "emergency" ? CLINICAL_URGENCY[clinical.priority.level] : undefined;
  if (!raised || URGENCY_RANK[raised.level] <= (URGENCY_RANK[shown.level] ?? 0)) return shown;
  return {
    level: raised.level,
    score: Math.max(shown.score, raised.score),
    signals: [...clinical!.priority.reasons.map((reason) => `clinical: ${reason}`), ...shown.signals.filter((signal) => signal !== "routine presentation")],
    recommendation: `Arrange an in-person health assessment ${clinical!.priority.timeframe}, and sooner if any warning sign appears.`,
  };
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function buildCaseAnalysis(record: WorkflowCase, config: DomainConfig, profile: UserProfile = {}, deps: Partial<AnalysisDeps> = {}): Promise<CaseAnalysis> {
  const { retrieve, now } = { ...defaultDeps, ...deps };
  const statements = caseStatements(record, config);
  // The safety screen is answered by the domain's own rules (record.safety). Its wording ("chest
  // pain, heavy bleeding, fainting…") must not be read as something the person reported.
  const told = statements.filter((statement) => !statement.screen);
  const read = (statement: Statement) => (statement.free ? correctSpelling(statement.text).text : statement.text);
  const narrative = told.map((statement) => (statement.free ? read(statement) : `${statement.topic}: ${statement.text}`)).join("\n");
  const said = told.filter((statement) => statement.free).map((statement) => statement.text).join(" ");
  const words = said.split(/\s+/u).filter(Boolean).length;
  const detected = detectFactors(statements);
  const corrections = spellingCorrections(told);
  // The search also names the symptoms' body systems, so every strand is asked about them.
  const query = clip([narrative, clinicalSearchTerms(detected).join(", ")].filter(Boolean).join("\n"), 3000) || config.label;

  const entities = entityExtractor.extract(narrative);
  // Urgency is read from the person's own words and the options they chose, never from question text.
  const ownWords = told.map(read).join("\n");
  const urgency = urgencyDetector.detect(ownWords, entityExtractor.extract(ownWords));
  const intent = intentClassifier.classify(narrative || config.label);

  const mentioned = (category: ExtractedEntity["category"]) => entities.filter((entity) => entity.category === category).map((entity) => entity.value);
  const enriched: UserProfile = {
    ...profile,
    userId: record.userId,
    medications: [...new Set([...(profile.medications ?? []), ...mentioned("medication")])],
    substanceUse: [...new Set([...(profile.substanceUse ?? []), ...mentioned("substance")])],
    location: profile.location ?? { region: "Unspecified" },
  };
  const { strandResults, intersections, solution } = await retrieve(query, "text", intent.detectedLanguage, enriched, intent.intent, urgency);

  const safetyActive = urgency.level === "critical" || record.safety.action === "crisis_route" || detected.some((entry) => entry.factor.safety);
  const strands = (Object.entries(strandResults) as Array<[string, StrandFinding[]]>).map(([strand, findings]) => {
    const kept = groundFindings(strand, findings, detected, entities, enriched);
    return { strand, layer: (DOMAIN_B.has(strand) ? "B" : "A") as AnalysisLayer, considered: findings.length, kept: kept.length, findings: kept };
  });
  const keptA = strands.filter((entry) => entry.layer === "A").flatMap((entry) => entry.findings);
  // A finding kept only because a symptom brings it into consideration (TB for weight loss) is for
  // the reviewer's differential; it must not be joined into "connections" shown to the person.
  const symptomLabels = new Set(detected.filter((entry) => entry.factor.system).map((entry) => `${entry.factor.label}:`));
  const saidDirectly = (finding: GroundedFinding) => finding.matchedOn.some((reason) => ![...symptomLabels].some((label) => reason.startsWith(label)));
  const reflections = safetyActive ? [] : strands.filter((entry) => entry.layer === "B").flatMap((entry) => entry.findings);
  const causes = rankCauses(detected, keptA, enriched);
  const interactions = entities.some((entity) => entity.category === "medication" || entity.category === "substance")
    ? solution.safety.herbDrugInteractions.slice(0, 5).map((item) => `${item.herb} + ${item.drug} (${item.severity}): ${item.recommendation}`)
    : [];
  const foodAndHerbs = buildFoodHerbReview(record.foodHerbNotes ?? [], profile);
  const clinical = buildClinicalPicture({
    detected,
    corrections,
    profile: enriched,
    findings: new Map(strands.map((entry) => [entry.strand, entry.findings])),
    urgencyLevel: urgency.level,
    safetyActive,
  });
  const findingsByStrand = new Map(strands.map((entry) => [entry.strand, entry.findings]));
  const lenses = clinical?.lenses ?? buildStrandLenses({ detected, profile: enriched, findings: findingsByStrand, safetyActive });
  const warnings = [
    ...(record.safety.reason ? [`Safety screen: ${record.safety.reason}`] : []),
    ...foodHerbWarnings(foodAndHerbs),
    ...(urgency.level === "critical" || urgency.level === "high" ? [`Urgency ${urgency.level}: ${urgency.recommendation}`] : []),
    ...detected.filter((entry) => entry.factor.safety).map((entry) => `${entry.factor.label}: “${entry.quotes[0]}”`),
  ];
  const intersectionsForReport = groundedIntersections(
    intersections,
    new Set(strands.filter((entry) => entry.layer === "A" && entry.findings.some(saidDirectly)).map((entry) => entry.strand)),
  );
  const dataQuality = assessData(
    words,
    detected,
    enriched,
    new Set((record.messages ?? []).filter((message) => message.from === "reviewer").map((message) => message.body)),
    said,
    clinical,
  );
  const entityCounts = new Map<string, number>();
  for (const entity of entities) entityCounts.set(entity.category, (entityCounts.get(entity.category) ?? 0) + 1);
  const contextualEngines = contextEngines(detected, enriched, record, now());
  const engines: CaseAnalysis["engines"] = [
    {
      id: "urgency_screening",
      title: "Urgency and safety screening",
      summary: `Screened the submitted case as ${urgency.level} priority (score ${urgency.score}/100).`,
      items: urgency.matchedSignals,
    },
    {
      id: "intent_classification",
      title: "Case intent and language classification",
      summary: `Classified the request as ${intent.intent} in ${intent.detectedLanguage}.`,
      items: [],
    },
    {
      id: "entity_extraction",
      title: "Case detail extraction",
      summary: `Extracted ${entities.length} named detail${entities.length === 1 ? "" : "s"} to support profile-aware matching.`,
      items: [...entityCounts].map(([category, count]) => `${category}: ${count} mentioned`),
    },
    {
      id: "knowledge_retrieval",
      title: "Knowledge-strand retrieval",
      summary: `Queried ${strands.length} knowledge strands and considered ${strands.reduce((sum, strand) => sum + strand.considered, 0)} library entries.`,
      items: strands.map((strand) => `${strand.strand}: ${strand.considered} entries considered, ${strand.kept} grounded to case or profile details.`),
    },
    {
      id: "cross_strand_integration",
      title: "Cross-strand integration",
      summary: `${intersectionsForReport.length} grounded connections across knowledge strands were retained for this report.`,
      items: intersectionsForReport.map((item) => `${item.title} (${item.strands.join(", ")})`),
    },
    {
      id: "recommendation_synthesis",
      title: "Recommendation synthesis",
      summary: `The analysis assembled ${solution.solutions.length} system-level suggestion${solution.solutions.length === 1 ? "" : "s"} and ${causes.length} case-grounded pattern${causes.length === 1 ? "" : "s"} for reviewer consideration.`,
      items: [],
    },
    ...(clinical ? [{
      id: "clinical_triage",
      title: "Clinical symptom triage",
      summary: `Reviewed the described symptom pattern; suggested priority is ${clinical.priority.level}.`,
      items: clinical.checks.slice(0, 4),
    }] : []),
    ...contextualEngines,
  ];

  const decisionFramework = buildDecisionFramework(causes, detected, withClinicalPriority(urgency, clinical), enriched, clinical);

  return {
    version: 1,
    generatedAt: now().toISOString(),
    publishScope: REFLECTION_ONLY.has(record.domain) ? "reflection_only" : "full",
    narrative: { words, excerpt: clip(said || narrative, 600) },
    urgency: withClinicalPriority(urgency, clinical),
    factors: detected.map((entry) => ({ id: entry.factor.id, label: entry.factor.label, weight: Math.round(entry.weight * 10) / 10, quotes: entry.quotes })),
    causes,
    solutions: proposeSolutions(causes, detected, keptA, urgency.level === "critical", clinical),
    strands: strands.map((entry) => (entry.layer === "B" && safetyActive ? { ...entry, kept: 0, findings: [] } : entry)),
    reflections,
    intersections: intersectionsForReport,
    engines,
    safety: { warnings, interactions, domainBSuppressed: safetyActive },
    dataQuality,
    person: buildPersonContext({ profile, domain: record.domain, factors: detected.map((entry) => entry.factor.id), now: now(), allowReflection: !safetyActive }),
    ...(foodAndHerbs ? { foodAndHerbs } : {}),
    lenses,
    ...(clinical ? { clinical } : {}),
    decisionFramework,
  };
}
