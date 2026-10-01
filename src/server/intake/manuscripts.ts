/**
 * One interface over the manuscripts a healer can offer from (መጽሐፈ ፈውስ, መጽሐፈ አስማት).
 * The server joins Domain B (the catalogues: chapters, pages, framing) with Domain A (physical-safety
 * cautions for how a practice is carried out) here, so neither domain imports the other.
 *
 * The composed "solution" is what a healer delivers for a selected chapter: their own text from
 * their copy of the book, the chapter reference, the platform's framing notes and the safety
 * cautions. Cautions marked danger and the framing notes are always included; the healer can
 * refine everything else in a draft before it goes out.
 */
import type { fewusTexts } from "@/lib/db/schema";
import type { SymptomCategory } from "@/lib/shared/symptomCategories";
import { PRACTICE_FORM_LABELS, type PracticeForm } from "@/lib/shared/practiceForms";
import { FEWUS_CONTENTS, FEWUS_HEADINGS, fewusBookReferences, fewusDropdownOptions, fewusPlantSlugs, fewusSourceNotes, getFewusHeading } from "@/lib/cultural/metsehafeFewusCatalog";
import { ASMAT_CONTENTS, ASMAT_ETHIC_NOTES, ASMAT_HEADINGS, asmatBookReferences, asmatDropdownOptions, asmatPlantSlugs, asmatSourceNotes, getAsmatHeading } from "@/lib/cultural/metsehafeAsmatCatalog";
import { practiceFormCautions, type PracticeCaution } from "@/lib/evaluation/practiceFormSafety";
import type { StoredIntake } from "./settings";

export const MANUSCRIPT_SOURCES = {
  metsehafe_fewus: { titleAm: "መጽሐፈ ፈውስ", titleEn: "Metsehafe Fewus", slug: "fewus", keyPrefix: "fewus_" },
  metsehafe_asmat: { titleAm: "መጽሐፈ አስማት", titleEn: "Metsehafe Asmat", slug: "asmat", keyPrefix: "asmat_" },
} as const;
export type ManuscriptSource = keyof typeof MANUSCRIPT_SOURCES;

export const isManuscriptSource = (value: string | null | undefined): value is ManuscriptSource => Boolean(value && value in MANUSCRIPT_SOURCES);

/** URL slug (fewus | asmat) to source. */
export function sourceFromSlug(slug: string): ManuscriptSource | null {
  return (Object.keys(MANUSCRIPT_SOURCES) as ManuscriptSource[]).find((source) => MANUSCRIPT_SOURCES[source].slug === slug) ?? null;
}

export function sourceForHeadingKey(key: string): ManuscriptSource | null {
  if (getFewusHeading(key)) return "metsehafe_fewus";
  if (getAsmatHeading(key)) return "metsehafe_asmat";
  return null;
}

export interface BookReference {
  number: number;
  titleGeez: string;
  gloss: string;
  page: number;
  endPage?: number;
}

export interface ManuscriptSelection {
  source: ManuscriptSource;
  bookTitleAm: string;
  bookTitleEn: string;
  heading: { key: string; titleAm: string; titleEn: string; bookMatch: "direct" | "grouped" | "none"; orientation: string };
  bookReferences: BookReference[];
  subheadings: { titleGeez: string; page: number }[];
  sealPages: number[];
  materials: { amharic: string; name: string; safetySlug: string | null }[];
  plantSlugs: string[];
  symptomCategory: SymptomCategory;
  practiceForms: { form: PracticeForm; en: string; am: string }[];
  cautions: PracticeCaution[];
  ethics: { key: string; en: string; am: string }[];
  sourceNotes: { title: string; pages: string; safeUse: string; reviewStatus: string }[];
}

const pages = (ref: BookReference) => (ref.endPage && ref.endPage !== ref.page ? `${ref.page}–${ref.endPage}` : `${ref.page}`);

export function manuscriptSelection(source: ManuscriptSource, key: string): ManuscriptSelection | null {
  const book = MANUSCRIPT_SOURCES[source];
  if (source === "metsehafe_fewus") {
    const heading = getFewusHeading(key);
    if (!heading) return null;
    return {
      source,
      bookTitleAm: book.titleAm,
      bookTitleEn: book.titleEn,
      heading: { key: heading.key, titleAm: heading.titleAm, titleEn: heading.titleEn, bookMatch: heading.bookMatch, orientation: heading.orientationAm },
      bookReferences: fewusBookReferences(heading),
      subheadings: [],
      sealPages: [],
      materials: heading.plants.map((plant) => ({ amharic: plant.amharic, name: plant.scientificName, safetySlug: plant.safetySlug })),
      plantSlugs: fewusPlantSlugs(heading),
      symptomCategory: heading.symptomCategory,
      practiceForms: [],
      cautions: [],
      ethics: [],
      sourceNotes: fewusSourceNotes(),
    };
  }
  const heading = getAsmatHeading(key);
  if (!heading) return null;
  const refs = asmatBookReferences(heading);
  return {
    source,
    bookTitleAm: book.titleAm,
    bookTitleEn: book.titleEn,
    heading: {
      key: heading.key,
      titleAm: heading.titleAm,
      titleEn: heading.purposeEn,
      bookMatch: "direct",
      orientation: `የመጽሐፉ «${refs[0].titleGeez}» (ገጽ ${pages(refs[0])})። ${heading.purposeAm}።`,
    },
    bookReferences: refs,
    subheadings: heading.subheadings,
    sealPages: heading.sealPages,
    materials: heading.materials,
    plantSlugs: asmatPlantSlugs(heading),
    symptomCategory: heading.symptomCategory,
    practiceForms: heading.practiceForms.map((form) => ({ form, ...PRACTICE_FORM_LABELS[form] })),
    cautions: practiceFormCautions(heading.practiceForms),
    ethics: heading.ethics.map((ethic) => ({ key: ethic, ...ASMAT_ETHIC_NOTES[ethic] })),
    sourceNotes: asmatSourceNotes(heading),
  };
}

/** The manuscript chapter a client chose at booking, if the service offers one. */
export function manuscriptSelectionFor(intake: StoredIntake | null): ManuscriptSelection | null {
  if (!intake?.dropdownValue || !isManuscriptSource(intake.dropdownType)) return null;
  return manuscriptSelection(intake.dropdownType, intake.dropdownValue);
}

export function manuscriptDropdownOptions(source: ManuscriptSource) {
  return source === "metsehafe_fewus" ? fewusDropdownOptions() : asmatDropdownOptions();
}

/** Contents and headings of one book, for the library screen. */
export function manuscriptCatalogue(source: ManuscriptSource) {
  const contents: BookReference[] = source === "metsehafe_fewus" ? FEWUS_CONTENTS : ASMAT_CONTENTS;
  const keys = source === "metsehafe_fewus" ? FEWUS_HEADINGS.map((h) => h.key) : ASMAT_HEADINGS.map((h) => h.key);
  return { source, ...MANUSCRIPT_SOURCES[source], contents, headings: keys.map((key) => manuscriptSelection(source, key)!) };
}

// ── Composing what the healer delivers ──────────────────────────────────────

type ManuscriptText = Pick<typeof fewusTexts.$inferSelect, "geezText" | "amharicText" | "guidance">;

export interface ComposeOptions {
  /** The healer's opening words, placed first. */
  lead?: string | null;
  /** Client-specific plant screening lines (from the safety matrix). */
  plantLines?: string[];
  /** Name reckoning block (from the healer profile), when the client gave a Ge'ez name. */
  profileText?: string | null;
  /** Leave out informational cautions (danger and caution levels are always kept). */
  essentialCautionsOnly?: boolean;
}

export const SOLUTION_MAX_LENGTH = 8000;

export function manuscriptHeader(selection: ManuscriptSelection) {
  const refs = selection.bookReferences.map((r) => `${r.titleGeez} (ገጽ ${pages(r)})`).join("; ");
  return `${selection.bookTitleAm} · ${selection.heading.titleAm}${refs ? ` — ${refs}` : ""}`;
}

/** The block a rule or the healer sends for a chapter: own text, reference, cautions and framing. */
export function composeManuscriptBlock(selection: ManuscriptSelection, text: ManuscriptText | null, options: ComposeOptions = {}) {
  const cautions = selection.cautions.filter((c) => !options.essentialCautionsOnly || c.level !== "info");
  const join = (parts: (string | null | undefined)[]) => parts.filter((part): part is string => Boolean(part && part.trim())).join("\n\n");
  const content = join([options.lead, manuscriptHeader(selection), text?.geezText, text?.amharicText, text?.guidance, options.profileText]);
  // Safety and framing come last and are never cut: a long text is shortened instead.
  const tail = join([
    cautions.length ? `ጥንቃቄ · Safety:\n${cautions.map((c) => `• ${c.label}: ${c.am}\n  ${c.en}`).join("\n")}` : "",
    options.plantLines?.length ? `Plants checked against your medicines:\n${options.plantLines.join("\n")}` : "",
    ...selection.ethics.map((e) => `${e.am}\n${e.en}`),
  ]);
  const room = SOLUTION_MAX_LENGTH - (tail ? tail.length + 2 : 0);
  return join([content.length > room ? `${content.slice(0, Math.max(0, room - 1))}…` : content, tail]);
}
