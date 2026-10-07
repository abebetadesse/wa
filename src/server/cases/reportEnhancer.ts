/**
 * Builds the detailed, editable report from the reviewer's analysis.
 *
 * Every section is assembled from this case: the person's own words, the patterns found in them,
 * the steps that answer those patterns and, with consent, the person's profile (life stage, place
 * and season, wellbeing cautions, and a cultural reading from their birth details). Nothing is
 * sent as written here — the reviewer edits and approves each section.
 *
 * Reflection-only case types (career, legal) receive no evidence-based sections, and no text is
 * generated at all while a safety warning is open (the review desk disables the button).
 */
import { CONFIDENCE_MEANING, FACTOR_GUIDANCE } from "./analysisGuidance";
import { FACTORS } from "./analysisLexicon";
import { CONTACTS, REFERRALS } from "./support";
import type { AnalysisSolution, CaseAnalysis, GroundedFinding, ReportSection } from "./types";

// Limits enforced when a draft is saved (schemas.ts).
const MAX_BODY = 7800;
const MAX_ITEM = 1900;
const MAX_ITEMS = 40;

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

const section = (id: string, title: string, body: string, items?: string[], cultural = false): ReportSection => {
  const points = (items ?? []).map((item) => clip(item.trim(), MAX_ITEM)).filter(Boolean).slice(0, MAX_ITEMS);
  return {
    id: `analysis-${id}`,
    title,
    body: clip(body, MAX_BODY),
    ...(points.length ? { items: points } : {}),
    locked: false,
    ...(cultural ? { cultural: true } : {}),
  };
};

const HORIZON: Record<AnalysisSolution["horizon"], string> = { now: "Consider now", this_week: "Consider this week", ongoing: "Ongoing" };
const HORIZON_ORDER: AnalysisSolution["horizon"][] = ["now", "this_week", "ongoing"];
const LANGUAGES: Record<string, string> = { am: "Amharic", om: "Afaan Oromoo", ti: "Tigrinya", so: "Somali", en: "English" };
const PROFESSIONAL_STRANDS = new Set(["medication", "biochemical", "biological", "epidemiological", "addiction", "dietary"]);
const FACTOR_BY_ID = new Map(FACTORS.map((factor) => [factor.id, factor]));

const quoted = (quotes: string[]) => quotes.map((quote) => `“${quote}”`).join("; ");
const sentence = (text: string) => (/[.!?።…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);
const list = (words: string[]) => (words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`);

/** A grounding reason, without any place name taken from the profile. */
function reason(matchedOn: string[]): string {
  return [...new Set(matchedOn.map((entry) => (entry.startsWith("Profile: ") ? "the area you live in" : entry)))].join("; ");
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Creates editable report sections from the latest reviewer-only analysis. */
export function buildEnhancedReportSections(analysis: CaseAnalysis, profileConsented: boolean): ReportSection[] {
  const sections: ReportSection[] = [];
  const full = analysis.publishScope === "full";
  const person = profileConsented ? analysis.person : undefined;
  const care = person?.care ?? [];
  // With a pregnancy or medicines on the profile, catalogue advice that needs a professional is left to that professional.
  const cautious = care.some((entry) => entry.id === "pregnancy" || entry.id === "medicines");
  const profileFields = [...new Set(analysis.dataQuality.used.filter((item) => item.startsWith("Profile: ")).map((item) => item.slice("Profile: ".length)))];
  const themes = analysis.factors.slice(0, 6);

  // ── 1. The situation in the person's own words ─────────────────────────────
  const quotes = themes.flatMap((factor) => factor.quotes.slice(0, 2).map((quote) => `${factor.label}: “${quote}”`));
  if (analysis.narrative.excerpt || quotes.length) {
    const basis = [
      analysis.narrative.words > 0 ? `${analysis.narrative.words} words in your own description` : "",
      profileConsented && profileFields.length ? `${profileFields.length} area${profileFields.length === 1 ? "" : "s"} of your profile (${list(profileFields)})` : "",
    ].filter(Boolean);
    sections.push(section(
      "overview",
      "Your situation, summarized",
      [
        analysis.narrative.excerpt ? `What you shared: “${analysis.narrative.excerpt}”` : "",
        themes.length
          ? `We read ${themes.length === 1 ? "one main theme" : `${themes.length} themes`} in what you wrote: ${themes.map((factor) => factor.label.toLowerCase()).join("; ")}. ${themes.length > 1 ? `${themes[0].label} carries the most weight.` : ""} The points below quote the words each one rests on, so you can see exactly what was understood and correct anything that was not.`
          : "",
        basis.length ? `This report was prepared on ${formatDate(analysis.generatedAt)} from ${list(basis)}. On a scale of 100 for how much there was to work with, this request scores ${analysis.dataQuality.score}${analysis.dataQuality.score < 50 ? ", so several points below are necessarily cautious" : ""}.` : "",
        "This summary reflects the information available at the time of review. Please tell your reviewer if anything is inaccurate or has changed.",
      ].filter(Boolean).join("\n\n"),
      quotes,
    ));
  }

  // ── 2. Each theme, elaborated ──────────────────────────────────────────────
  if (full && themes.length) {
    sections.push(section(
      "themes",
      "What stands out, theme by theme",
      "Each theme below was found in your own words. The note beside it describes how that theme usually works and what it tends to affect; it is general orientation, not a judgement about you.",
      themes.map((factor, index) => {
        const guidance = FACTOR_GUIDANCE[factor.id];
        const prominence = index === 0 && themes.length > 1 ? "the most prominent theme" : factor.quotes.length > 1 ? `raised in ${factor.quotes.length} places` : "mentioned once";
        return `${factor.label} (${prominence}): ${guidance?.insight ?? "Noted from your description."}`;
      }),
    ));
  }

  // ── 3. Patterns ────────────────────────────────────────────────────────────
  if (full && analysis.causes.length) {
    sections.push(section(
      "patterns",
      "Patterns to consider together",
      [
        "These are possible explanations to discuss, not diagnoses or confirmed causes. They are ranked by how strongly the current information supports them.",
        `How to read the confidence labels — strong: ${CONFIDENCE_MEANING.strong}; moderate: ${CONFIDENCE_MEANING.moderate}; tentative: ${CONFIDENCE_MEANING.tentative}.`,
      ].join("\n\n"),
      analysis.causes.slice(0, 5).map((cause) => {
        const confirm = [...new Set(cause.factors.map((id) => FACTOR_BY_ID.get(id)?.followUp).filter((question): question is string => Boolean(question)))].slice(0, 2);
        return [
          `${cause.title} (${cause.confidence} confidence): ${sentence(cause.explanation)}`,
          cause.because.length ? `What you shared that suggests it: ${quoted(cause.because)}` : "",
          confirm.length ? `What would confirm or rule it out: ${confirm.join(" ")}` : "",
          cause.strands.length ? `Related areas reviewed: ${cause.strands.join(", ")}.` : "",
        ].filter(Boolean).join(" ");
      }),
    ));
  }

  // ── 4. Connections between areas ───────────────────────────────────────────
  if (full && analysis.intersections.length) {
    sections.push(section(
      "connections",
      "How different areas may connect",
      "These connections help organize the discussion; they are not proof that one issue caused another.",
      analysis.intersections.slice(0, 4).map((link) => `${link.title.charAt(0).toUpperCase()}${link.title.slice(1)} (${link.strands.join(" + ")}): ${sentence(link.description)} Consider: ${link.recommendation}`),
    ));
  }

  // ── 5. Next steps, in order ────────────────────────────────────────────────
  const solutions = analysis.solutions.filter((solution) => !(cautious && solution.id.startsWith("knowledge-") && solution.needsProfessional));
  if (full && solutions.length) {
    const causeTitle = new Map(analysis.causes.map((cause) => [cause.id, cause.title]));
    const ordered = HORIZON_ORDER.flatMap((horizon) => solutions.filter((solution) => solution.horizon === horizon)).slice(0, 7);
    sections.push(section(
      "next-steps",
      "Possible next steps",
      [
        "These options are drawn from the current case analysis. Choose only what fits the person's circumstances, and confirm any specialist or health-related step with a qualified professional.",
        "They are ordered by when to consider them — now, this week, then ongoing — and each one names the pattern it answers, so a step can be dropped if that pattern does not fit.",
        ...care.map((entry) => entry.report),
      ].join("\n\n"),
      ordered.map((solution) => {
        const answers = solution.addresses.map((id) => causeTitle.get(id)).filter((title): title is string => Boolean(title));
        const steps = solution.steps.map((step, index) => `(${index + 1}) ${sentence(step)}`).join(" ");
        const fromCatalogue = solution.id.startsWith("knowledge-");
        return [
          `${HORIZON[solution.horizon]} — ${fromCatalogue ? `reference guidance under “${solution.title}” (a catalogue heading, not a diagnosis)` : solution.title.replace(/^Plan for: /, "")}: ${steps}`,
          // A plan is titled after the pattern it answers; only catalogue guidance needs the link spelled out.
          fromCatalogue && answers.length ? `Relevant to: ${answers.join("; ")}.` : "",
          solution.needsProfessional ? "Confirm with a qualified professional before acting." : "",
          `Source: ${solution.source}.`,
        ].filter(Boolean).join(" ");
      }),
    ));
  }

  // ── 6. When not to wait ────────────────────────────────────────────────────
  if (full && themes.length) {
    const has = (...ids: string[]) => themes.some((factor) => ids.includes(factor.id));
    const signs = themes.map((factor) => FACTOR_GUIDANCE[factor.id]?.watchFor).filter((line): line is string => Boolean(line));
    const services = [
      `Urgent help: ${CONTACTS.crisisLine.name} ${CONTACTS.crisisLine.number}; ${CONTACTS.police.name} ${CONTACTS.police.number}; ${CONTACTS.ambulance.name} ${CONTACTS.ambulance.number}.`,
      ...(has("low_mood", "anxiety", "sleep", "grief", "substance", "isolation") ? [`For support with mood, sleep or substance use: ${REFERRALS.healthCenter}.`] : []),
      ...(has("money", "work") ? [`For hardship: ${REFERRALS.socialServices}.`] : []),
      ...(has("legal") ? [`For legal questions: ${REFERRALS.legalAid}.`] : []),
      ...(has("family", "conflict", "spiritual", "grief") ? [`Someone to stand with you: ${REFERRALS.elders.charAt(0).toLowerCase()}${REFERRALS.elders.slice(1)}.`] : []),
    ];
    if (signs.length) {
      sections.push(section(
        "act-sooner",
        "When to seek help sooner",
        "Most of what is described here can be worked on step by step. The signs below, chosen for the themes in your request, mean it should not wait for the next message from your reviewer.",
        [...signs, ...services],
      ));
    }
  }

  // ── 7. Reference knowledge that applies ────────────────────────────────────
  // Only entries the person named, or that several of their statements support: the catalogues are
  // broad, and a loosely matched entry reads as noise (or as a claim) in a report.
  const references: GroundedFinding[] = analysis.strands
    .filter((strand) => strand.layer === "A")
    .flatMap((strand) => strand.findings)
    .filter((finding) => finding.relevance >= 0.6 || finding.matchedOn.some((entry) => entry.startsWith("Mentioned:")))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 4);
  if (full && references.length) {
    sections.push(section(
      "knowledge",
      "Reference knowledge behind this report",
      `${analysis.strands.reduce((sum, strand) => sum + strand.considered, 0)} reference entries across ${analysis.strands.length} knowledge areas were checked against your request; the ${references.length === 1 ? "one" : references.length} below ${references.length === 1 ? "is" : "are"} the most closely supported by what you wrote. They are background reading: a heading is the name used by the reference source and does not mean the entry describes you.`,
      references.map((finding) => {
        const needsProfessional = PROFESSIONAL_STRANDS.has(finding.strand);
        return `${finding.name} (${finding.strand} knowledge): ${sentence(clip(finding.summary || "Reference entry", 260))} Included because of — ${reason(finding.matchedOn)}.${needsProfessional ? " Anything here that touches your health is for a qualified professional to confirm." : ""}${finding.source ? ` Source: ${finding.source}.` : ""}`;
      }),
    ));
  }

  // ── 8. The person: what the profile adds ───────────────────────────────────
  if (profileConsented) {
    const profileFindings = analysis.strands.flatMap((strand) => strand.findings)
      .filter((finding) => finding.matchedOn.some((match) => match.startsWith("Profile: ")))
      .slice(0, 4)
      .map((finding) => `${finding.name}: ${finding.summary}`);
    // The zone is already given with the place; nutrient and water detail is dropped when the profile calls for caution.
    const context = analysis.engines
      .filter((engine) => ["fasting_calendar", "fluoride"].includes(engine.id) || (engine.id === "agro_ecology" && !person?.place?.zone))
      .map((engine) => `${engine.title}: ${sentence(engine.summary)}${engine.items.length && !cautious ? ` ${engine.items.map(sentence).join(" ")} Check any change of diet or supplement with a health professional.` : ""}`);
    const missing = analysis.dataQuality.gaps
      .filter((gap) => gap.startsWith("The profile has no ") && !gap.includes("gender"))
      .map((gap) => gap.slice("The profile has no ".length));
    const items = [
      ...(person?.lifeStage ? [`Life stage — ${person.lifeStage.label} (${person.lifeStage.band}): ${person.lifeStage.considerations.join(" ")}`] : []),
      ...(person?.place ? [`Where you live — ${person.place.region}${person.place.zone ? `, ${person.place.zone}` : ""}: ${person.place.notes.join(" ")}`] : []),
      ...context,
      ...care.map((entry) => entry.report),
      ...(person?.language && LANGUAGES[person.language] ? [`Language: your profile prefers ${LANGUAGES[person.language]}. Tell your reviewer if you would like this report, or a conversation about it, in that language.`] : []),
      ...profileFindings,
      ...(missing.length ? [`Not yet on your profile: ${list(missing)}. Adding ${missing.length === 1 ? "it" : "them"} would let a future review be more specific.`] : []),
    ];
    sections.push(section(
      "profile-context",
      "Personal context and what to verify",
      profileFields.length
        ? `With consent, the analysis considered these available profile areas where relevant: ${profileFields.join(", ")}. The points below show how each one shaped this report. Please confirm that this context is accurate and current.`
        : "Profile use was consented to, but the analysis did not have enough relevant profile information to personalize a finding. This report is grounded mainly in the case information provided.",
      items,
    ));
  } else {
    sections.push(section(
      "profile-context",
      "Personal context and what to verify",
      "Account and wellbeing profile details were not used. This report is grounded in the information shared in this case and its follow-up messages.",
    ));
  }

  // ── 9. Cultural and spiritual reflection ───────────────────────────────────
  if (analysis.reflections.length) {
    sections.push(section(
      "reflections",
      "Cultural and spiritual reflections",
      "These optional reflections are kept separate from evidence-based explanations. Keep only those that fit the person's own beliefs and preferences.",
      analysis.reflections.slice(0, 5).map((finding) => `${finding.name}: ${sentence(finding.summary)}${finding.steps.length ? ` Possible reflection prompts: ${finding.steps.map(sentence).join(" ")}` : ""}${finding.matchedOn.length ? ` Offered because of — ${reason(finding.matchedOn)}.` : ""}`),
      true,
    ));
  }

  const reading = person?.reading;
  if (reading && !analysis.safety.domainBSuppressed) {
    sections.push(section(
      "personal-reading",
      "Timing and temperament from your personal profile",
      [
        `${reading.signature}.`,
        reading.basis,
        "This is a cultural reflection drawn from your birth details and today's sky. It is offered for self-understanding and for choosing your moment; it does not predict outcomes and is not advice.",
      ].join("\n\n"),
      [
        ...(reading.matter ? [reading.matter.note] : []),
        ...reading.temperament,
        ...reading.timing,
        // Food lines from the constitution are left out when the wellbeing profile calls for caution.
        ...(care.length ? reading.constitution.filter((line) => line.startsWith("Season:")) : reading.constitution),
      ],
      true,
    ));
  }

  // ── 10. What would sharpen it ──────────────────────────────────────────────
  if (analysis.dataQuality.followUps.length) {
    sections.push(section(
      "clarifying-questions",
      "Questions that could make this more specific",
      "The report may be refined if the person chooses to share more. These are optional questions, not requirements. A reply in the conversation, in the app or from Telegram or WhatsApp, is added to the analysis automatically.",
      analysis.dataQuality.followUps.slice(0, 5),
    ));
  }

  return sections;
}

/** Word count and reading time of a report, for the reviewer's editor. */
export function reportStatistics(report: { summary: string; sections: Array<Pick<ReportSection, "body" | "items">> }): { sections: number; words: number; minutes: number } {
  const text = [report.summary, ...report.sections.flatMap((entry) => [entry.body ?? "", ...(entry.items ?? [])])].join(" ");
  const words = text.split(/\s+/u).filter(Boolean).length;
  return { sections: report.sections.length, words, minutes: Math.max(1, Math.round(words / 200)) };
}
