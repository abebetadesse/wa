/**
 * "AI" on a report section: develops one section of the reviewer's draft further.
 *
 * Two layers, in this order:
 *  1. Case data. A section the platform knows how to build (the Awde Negest sections, the detailed
 *     analysis sections) is rebuilt in full from the case as it stands now; any other section is
 *     extended with what the analysis holds about the themes it touches.
 *  2. Language model, when one is configured. It is asked to write the result out more fully for
 *     this person, under strict limits, with the person's names masked on the way out.
 *
 * The result goes back to the reviewer's editor unsaved. Nothing reaches the person unless the
 * reviewer keeps it and approves the report.
 */
import { ApiError } from "@/lib/api/route";
import { bionicChat, buildBionicMessages, isBionicConfigured } from "@/lib/ai/bionicGPT";
import type { FullDivinationResult } from "@/lib/cultural/spiritualDivinationEngine";
import { FACTOR_GUIDANCE } from "./analysisGuidance";
import { FACTORS } from "./analysisLexicon";
import { buildSpiritualSections } from "./domains/spiritualContent";
import { buildEnhancedReportSections } from "./reportEnhancer";
import type { ReportSection, WorkflowCase } from "./types";

const MAX_BODY = 7800;
const MAX_ITEM = 1900;
const MAX_ITEMS = 40;
/** A line that is mainly Amharic or Ge'ez: the scroll, the seal's prayer, scripture. */
function isSacredLine(line: string): boolean {
  const ethiopic = (line.match(/[ሀ-᎟]/gu) ?? []).length;
  const latin = (line.match(/[A-Za-z]/g) ?? []).length;
  return ethiopic > 0 && ethiopic >= latin;
}

export interface EnhanceInput {
  section: ReportSection;
  /** What the reviewer wants developed, in their own words. */
  instruction?: string;
  /** Baptismal name for the seal and the scroll, when the case does not hold one. */
  christianName?: string;
}

export interface EnhanceResult {
  section: ReportSection;
  source: "model" | "case_data" | "unchanged";
  note: string;
}

export interface ModelRequest {
  kind: "cultural reflection" | "evidence-based";
  domain: string;
  title: string;
  body: string;
  items: string[];
  context: Record<string, unknown>;
  instruction?: string;
}

export interface EnhanceDeps {
  /** Returns the model's version of the section, or null when it has nothing usable. Absent: no model. */
  model?: (request: ModelRequest) => Promise<{ body?: unknown; items?: unknown } | null>;
  now: () => Date;
}

const SYSTEM_PROMPT = [
  "You assist a human reviewer on an Ethiopian wellbeing and cultural-reflection platform.",
  "You receive ONE section of a report written for a person, with a little context. Write that section out more fully for this person:",
  "develop each point in two to four clear sentences, explain why it matters for them, and keep a warm, plain, respectful tone.",
  "Rules you must not break:",
  "- Keep every fact, quotation, number, date and name token (such as ⟦N1⟧) exactly as given. Never invent facts, sources, people or outcomes.",
  "- Keep lines written in Amharic or Ge'ez verbatim; do not translate, correct or shorten them.",
  "- No diagnosis, no prediction, no medical, legal or financial instruction, and never advise taking herbs, fasting or stopping treatment.",
  "- A cultural reflection stays a reflection: describe what the tradition says, never claim it will happen.",
  "- Follow the reviewer's instruction if one is given, within these rules.",
  'Return JSON only, in this shape: {"body": string, "items": string[]}. At most 12 items.',
].join("\n");

async function bionicModel(request: ModelRequest): Promise<{ body?: unknown; items?: unknown } | null> {
  const response = await bionicChat({
    messages: buildBionicMessages(SYSTEM_PROMPT, [{ role: "user", content: JSON.stringify(request, null, 2) }]),
    temperature: 0.4,
    maxTokens: 1600,
    jsonMode: true,
  });
  return response.parsedJson && typeof response.parsedJson === "object" ? (response.parsedJson as { body?: unknown; items?: unknown }) : null;
}

const defaultDeps = (): EnhanceDeps => ({ model: isBionicConfigured() ? bionicModel : undefined, now: () => new Date() });

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function fitted(section: ReportSection): ReportSection {
  const items = (section.items ?? []).map((item) => clip(item.trim(), MAX_ITEM)).filter(Boolean).slice(0, MAX_ITEMS);
  return { ...section, body: section.body ? clip(section.body, MAX_BODY) : undefined, items: items.length ? items : undefined };
}

const sameContent = (a: ReportSection, b: ReportSection) => (a.body ?? "") === (b.body ?? "") && JSON.stringify(a.items ?? []) === JSON.stringify(b.items ?? []);

// ── Layer 1: the case itself ─────────────────────────────────────────────────

/** A section the platform builds, rebuilt from the case as it stands now. */
function rebuilt(record: WorkflowCase, input: EnhanceInput, now: Date): ReportSection | null {
  const { section } = input;
  if (record.domain === "spiritual" && record.context.gematria) {
    const christianName = text(input.christianName) || text(record.answers.christianNameGeez);
    const category = text(record.answers.question_category) || "life_direction";
    const match = buildSpiritualSections(record.context.gematria as FullDivinationResult, category, { christianName, now }).find((entry) => entry.id === section.id);
    if (match) return { ...match, locked: section.locked };
  }
  if (section.id.startsWith("analysis-") && record.analysis) {
    const match = buildEnhancedReportSections(record.analysis, record.consent.dataUsage).find((entry) => entry.id === section.id);
    if (match) return { ...match, locked: section.locked };
  }
  return null;
}

/** Any other section: what the analysis holds about the themes this section touches. */
function extended(record: WorkflowCase, section: ReportSection): ReportSection | null {
  const analysis = record.analysis;
  if (!analysis) return null;
  const existing = new Set(section.items ?? []);
  const additions: string[] = [];
  const add = (line: string) => {
    if (line && !existing.has(line) && !additions.includes(line)) additions.push(line);
  };

  if (section.cultural) {
    // A reflection is extended only with reflection: the reading from the person's birth details.
    const reading = record.consent.dataUsage && !analysis.safety.domainBSuppressed ? analysis.person?.reading : undefined;
    if (!reading) return null;
    add(`Your personal profile: ${reading.signature}.`);
    if (reading.matter) add(reading.matter.note);
    reading.temperament.slice(0, 2).forEach(add);
    reading.timing.slice(0, 2).forEach(add);
    const today = reading.timing.find((line) => line.startsWith("Today"));
    if (today) add(today);
  } else {
    // Evidence-based material never enters the report of a reflection-only case type.
    if (analysis.publishScope !== "full") return null;
    const haystack = `${section.title} ${section.body ?? ""} ${(section.items ?? []).join(" ")}`.toLowerCase();
    const lexicon = new Map(FACTORS.map((factor) => [factor.id, factor]));
    const touches = (id: string, label: string) => {
      const factor = lexicon.get(id);
      const words = [label.toLowerCase(), ...label.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 4), ...(factor?.knowledge ?? [])];
      return words.some((word) => word && haystack.includes(word));
    };
    const matched = analysis.factors.filter((factor) => touches(factor.id, factor.label));
    const themes = (matched.length ? matched : analysis.factors).slice(0, 3);
    for (const theme of themes) {
      const guidance = FACTOR_GUIDANCE[theme.id];
      const factor = lexicon.get(theme.id);
      if (theme.quotes[0]) add(`In your words — ${theme.label}: “${theme.quotes[0]}”`);
      if (guidance?.insight) add(`${theme.label}: ${guidance.insight}`);
      if (guidance?.watchFor) add(`When not to wait — ${theme.label.toLowerCase()}: ${guidance.watchFor}`);
      if (factor?.followUp) add(`A question that would sharpen this: ${factor.followUp}`);
    }
    const stage = record.consent.dataUsage ? analysis.person?.lifeStage : undefined;
    if (stage) add(`At your stage of life (${stage.band}): ${stage.considerations.slice(-2).join(" ")}`);
    (record.consent.dataUsage ? analysis.person?.care ?? [] : []).forEach((entry) => add(entry.report));
  }

  return additions.length ? { ...section, items: [...(section.items ?? []), ...additions] } : null;
}

// ── Layer 2: the language model ──────────────────────────────────────────────

/** The person's names leave the platform as tokens and are put back when the text returns. */
function nameMask(record: WorkflowCase, christianName: string) {
  const gematria = record.context.gematria as FullDivinationResult | undefined;
  const names = [...new Set([christianName, text(record.answers.christianNameGeez), gematria?.nameGeez ?? "", gematria?.motherNameGeez ?? "", text(record.answers.nameGeez), text(record.answers.motherNameGeez)].filter((name) => name.length > 1))]
    // Longest first, so a name contained in another is not broken up.
    .sort((a, b) => b.length - a.length);
  const token = (index: number) => `⟦N${index + 1}⟧`;
  return {
    mask: (value: string) => names.reduce((result, name, index) => result.split(name).join(token(index)), value),
    unmask: (value: string) => names.reduce((result, name, index) => result.split(token(index)).join(name), value),
  };
}

function modelContext(record: WorkflowCase): Record<string, unknown> {
  const analysis = record.analysis;
  const person = record.consent.dataUsage ? analysis?.person : undefined;
  return {
    caseType: record.domain,
    reflectionOnly: analysis?.publishScope === "reflection_only",
    themesInTheirWords: analysis?.factors.slice(0, 5).map((factor) => factor.label) ?? [],
    lifeStage: person?.lifeStage ? `${person.lifeStage.label} (${person.lifeStage.band})` : undefined,
    season: person?.place?.season,
    cautions: person?.care.map((entry) => entry.reviewer) ?? [],
    topic: text(record.answers.question_category).replace(/_/g, " ") || undefined,
  };
}

async function withModel(record: WorkflowCase, base: ReportSection, input: EnhanceInput, model: NonNullable<EnhanceDeps["model"]>): Promise<ReportSection | null> {
  const names = nameMask(record, text(input.christianName));
  const reply = await model({
    kind: base.cultural ? "cultural reflection" : "evidence-based",
    domain: record.domain,
    title: names.mask(base.title),
    body: names.mask(base.body ?? ""),
    items: (base.items ?? []).map(names.mask),
    context: modelContext(record),
    instruction: text(input.instruction) ? names.mask(text(input.instruction)) : undefined,
  });
  if (!reply) return null;

  const body = typeof reply.body === "string" && reply.body.trim() ? names.unmask(reply.body.trim()) : base.body;
  const proposed = Array.isArray(reply.items) ? reply.items.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => names.unmask(item.trim())) : [];

  // Lines in Amharic or Ge'ez are the scroll, the seal's prayer and scripture: they are kept exactly
  // as they were, in their order, whatever the model returned.
  const sacred = (base.items ?? []).filter(isSacredLine);
  const commentary = proposed.filter((item) => !isSacredLine(item));
  const plain = (base.items ?? []).filter((item) => !isSacredLine(item));
  const items = [...sacred, ...(commentary.length ? commentary : plain)];

  // A leftover name token means the model mangled a name: discard its version.
  const candidate = { ...base, body, items: items.length ? items : undefined };
  if (/⟦N\d+⟧/.test(JSON.stringify(candidate))) return null;
  return candidate;
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function enhanceReportSection(record: WorkflowCase, input: EnhanceInput, deps: Partial<EnhanceDeps> = {}): Promise<EnhanceResult> {
  const { model, now } = { ...defaultDeps(), ...deps };
  if (record.analysis?.safety.warnings.length) {
    throw ApiError.conflict("Resolve the safety review before generating report text.");
  }

  const original = input.section;
  const fromCase = rebuilt(record, input, now()) ?? extended(record, original);
  const base = fitted(fromCase ?? original);
  const caseChanged = Boolean(fromCase) && !sameContent(base, original);

  if (model) {
    try {
      const written = await withModel(record, base, input, model);
      if (written && !sameContent(fitted(written), original)) {
        return { section: fitted(written), source: "model", note: "Written out by the language model from the case data. Check every line before keeping it." };
      }
    } catch (error) {
      console.error("[case-workflow] section enhancement by the model failed:", error);
    }
  }

  if (caseChanged) {
    return {
      section: base,
      source: "case_data",
      note: model
        ? "The language model did not return a usable version, so the section was built out from the case data instead."
        : "Built out in full from the case data. No language model is configured, so the wording was not rewritten.",
    };
  }
  return {
    section: original,
    source: "unchanged",
    note: model
      ? "The language model had nothing to add to this section."
      : "This section already holds everything the case data offers, and no language model is configured to rewrite it.",
  };
}
