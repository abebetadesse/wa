/**
 * The Domain A / Domain B layout of every case report (docs/AI_ASSISTANT_PROMPT.md, section 5.2).
 *
 * Part A (scientific) comes first, then the "When not to wait" safety section, then Part B
 * (cultural reflection, `cultural: true`). Every Part B title starts with "Cultural reflection — ",
 * so the distinction holds when the report is printed or forwarded without the app's badge, and
 * the first Part B section opens with a fixed line. When Domain B is withheld (an active safety
 * signal, a crisis route or no consent), Part B is left out and a one-line notice stands in its
 * place.
 *
 * The section builders lay their drafts out with `layoutSections`; approval refuses a draft that
 * `layoutProblems` finds fault with. The Amharic comes from amharicPhrases.json.
 */
import { amharicFor, type ReportLanguage } from "./amharic";
import type { ReportSection } from "./types";

// Limits enforced when a draft is saved (schemas.ts).
const MAX_TITLE = 200;
const MAX_BODY = 7800;

export const CULTURAL_LABEL = "Cultural reflection";
export const PART_B_OPENING =
  "This part is cultural and spiritual reflection drawn from Ethiopian tradition. It is not scientific evidence, a diagnosis or a prediction, and it does not change anything in the scientific part above. You are free to take from it what is meaningful to you.";
export const PART_B_WITHHELD = "Cultural reflection is not included in this report.";

const inLanguage = (english: string, language: ReportLanguage) => (language === "am" ? amharicFor(english) ?? english : english);
const SEPARATOR = " — ";
const MARKERS = [CULTURAL_LABEL, amharicFor(CULTURAL_LABEL) ?? CULTURAL_LABEL].map((label) => `${label}${SEPARATOR}`);
const OPENINGS = [PART_B_OPENING, amharicFor(PART_B_OPENING) ?? PART_B_OPENING];

/** The "Cultural reflection — " marker in the report language. */
export const culturalMarker = (language: ReportLanguage) => `${inLanguage(CULTURAL_LABEL, language)}${SEPARATOR}`;

/** Sections that carry the "When not to wait" warning signs and support contacts. */
const SAFETY_IDS = new Set(["analysis-act-sooner", "safety", "when_not_to_wait"]);
/** The notice that stands in for a withheld Part B. */
const WITHHELD_IDS = new Set(["analysis-cultural-withheld", "cultural_withheld"]);

export const isSafetySection = (section: Pick<ReportSection, "id">) => SAFETY_IDS.has(section.id);
// Compared without the trailing space, which a saved title loses when the marker stands alone.
export const hasCulturalMarker = (title: string) => MARKERS.some((marker) => title.startsWith(marker.trimEnd()));

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** A Part B title with exactly one marker, in the report language. */
export function markCulturalTitle(title: string, language: ReportLanguage): string {
  const marker = MARKERS.find((entry) => title.startsWith(entry));
  const bare = (marker ? title.slice(marker.length) : title).trim();
  return clip(`${culturalMarker(language)}${bare}`, MAX_TITLE);
}

/** Part B with the fixed opening line at the start of its first section, and nowhere else. */
function opened(partB: ReportSection[], opening: string): ReportSection[] {
  return partB.map((section, index) => {
    const found = OPENINGS.find((line) => (section.body ?? "").startsWith(line));
    const body = found ? (section.body ?? "").slice(found.length).replace(/^\s+/, "") : section.body ?? "";
    const next = index === 0 ? clip(body ? `${opening}\n\n${body}` : opening, MAX_BODY) : body;
    return { ...section, body: next || undefined };
  });
}

const split = (sections: ReportSection[]) => ({
  partA: sections.filter((section) => !section.cultural && !isSafetySection(section)),
  safety: sections.filter((section) => !section.cultural && isSafetySection(section)),
  partB: sections.filter((section) => section.cultural),
});

export interface LayoutOptions {
  language: ReportLanguage;
  /** Domain B is not allowed: an active safety signal, a crisis route, or no consent to reflection. */
  withhold: boolean;
  /** Id of the notice section that replaces a withheld Part B. */
  noticeId?: string;
}

/**
 * Lays sections out as Part A → safety → Part B. Running it again on its own output changes nothing,
 * so a rebuilt or edited report can always be passed through it.
 */
export function layoutSections(sections: ReportSection[], { language, withhold, noticeId = "analysis-cultural-withheld" }: LayoutOptions): ReportSection[] {
  const { partA, safety, partB } = split(sections.filter((section) => !WITHHELD_IDS.has(section.id)));
  if (withhold) {
    const notice: ReportSection = { id: noticeId, title: inLanguage(CULTURAL_LABEL, language), body: inLanguage(PART_B_WITHHELD, language), locked: false };
    return [...partA, ...safety, notice];
  }
  const marked = partB.map((section) => ({ ...section, title: markCulturalTitle(section.title, language) }));
  return [...partA, ...safety, ...opened(marked, inLanguage(PART_B_OPENING, language))];
}

/**
 * The reviewer's editor: puts sections in Part A → safety → Part B order and keeps the opening line
 * on the first cultural section, in the language Part B already uses. Titles are left as written.
 */
export function orderSections(sections: ReportSection[]): ReportSection[] {
  const { partA, safety, partB } = split(sections);
  const inUse = partB.map((section) => OPENINGS.find((line) => (section.body ?? "").startsWith(line))).find(Boolean);
  const amharic = partB[0]?.title.startsWith(MARKERS[1].trimEnd());
  return [...partA, ...safety, ...opened(partB, inUse ?? OPENINGS[amharic ? 1 : 0])];
}

/** What keeps a draft from the Part A / Part B layout, worded for the reviewer. Empty when it is fine. */
export function layoutProblems(sections: Array<Pick<ReportSection, "title" | "cultural">>): string[] {
  const problems: string[] = [];
  const firstCultural = sections.findIndex((section) => section.cultural);
  const after = firstCultural < 0 ? undefined : sections.slice(firstCultural + 1).find((section) => !section.cultural);
  if (after) {
    problems.push(`“${sections[firstCultural].title}” is cultural reflection but comes before “${after.title}”. Move every cultural reflection section to the end of the report, after the scientific and safety sections.`);
  }
  for (const section of sections) {
    if (section.cultural && !hasCulturalMarker(section.title)) {
      problems.push(`“${section.title}” is cultural reflection, so its title must start with “${MARKERS[0]}” (Amharic: “${MARKERS[1]}”). The marker keeps the difference clear when the report is printed or forwarded.`);
    }
  }
  return problems;
}
