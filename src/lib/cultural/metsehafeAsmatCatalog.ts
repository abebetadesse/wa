/**
 * መጽሐፈ አስማት (Metsehafe Asmat): catalogue for healer intake dropdowns and review workspaces.
 * DOMAIN B (heritage). No clinical or pharmacological claims live here; physical-safety cautions
 * and plant screening are attached at run time by the server from Domain A, never by this module.
 *
 * ASMAT_CONTENTS reproduces only the book's table of contents (ማውጫ, page 2 of the 24-page
 * edition "መጽሐፈ አስማት.pdf"), read from the rendered pages: 13 chapters with their page numbers.
 * Sub-headings and the pages of seals (ጠልሰም) were read from the chapter pages themselves.
 * English glosses and client-facing purposes are the platform's own wording.
 *
 * The book's prayers, names of power, seals and procedures (ገቢር) are NOT reproduced. Each healer
 * records the text they use from their own copy (stored per business, see fewus_texts), which then
 * fills their review workspace and templates. The materials listed per chapter are an index of
 * what the procedures name, kept so the server can screen them; quantities and steps are not kept.
 */
import type { SymptomCategory } from "@/lib/shared/symptomCategories";
import type { PracticeForm } from "@/lib/shared/practiceForms";
import { ETHIOPIAN_MANUSCRIPT_INDEX } from "./manuscriptIndex";

export const ASMAT_SOURCE_ID = "mets-hafe-asmat";

export interface AsmatContentsEntry {
  number: number;
  titleGeez: string;
  /** Approximate English gloss (platform translation). */
  gloss: string;
  /** Page given in the table of contents. */
  page: number;
  /** Last page of the chapter, from the chapter pages. */
  endPage: number;
  kind: "release" | "protection" | "spirits" | "livelihood" | "learning" | "affection" | "favour" | "angels";
}

/** Verified from the table of contents on page 2. */
export const ASMAT_CONTENTS: AsmatContentsEntry[] = [
  { number: 1, titleGeez: "ስለ መፍትሔ ስራይ", gloss: "On release from sorcery (siray)", page: 3, endPage: 4, kind: "release" },
  { number: 2, titleGeez: "ስለ መድፌ ወጊ መመለሻ", gloss: "On turning back medfe wegi (piercing harm)", page: 5, endPage: 5, kind: "protection" },
  { number: 3, titleGeez: "ስለ ማዕሠረ አጋንንት", gloss: "On the binding of troubling spirits", page: 6, endPage: 6, kind: "spirits" },
  { number: 4, titleGeez: "ስለ መስጥመ አጋንንት", gloss: "On the subduing of troubling spirits", page: 7, endPage: 13, kind: "spirits" },
  { number: 5, titleGeez: "ስለ አይነ ጥላ መፍትሔ", gloss: "On release from ayne tila (shadow affliction)", page: 14, endPage: 15, kind: "release" },
  { number: 6, titleGeez: "ስለ ቡዳ መፍትሔ", gloss: "On release from buda (the evil eye)", page: 16, endPage: 17, kind: "release" },
  { number: 7, titleGeez: "ስለ አቃቤ ርዕስ", gloss: "On the guardian of the head", page: 17, endPage: 18, kind: "protection" },
  { number: 8, titleGeez: "ስለ ገብያ መፍትሔ", gloss: "On release for the market (trade)", page: 18, endPage: 18, kind: "livelihood" },
  { number: 9, titleGeez: "ስለ መፍትሔ ሀብት", gloss: "On release for wealth", page: 19, endPage: 19, kind: "livelihood" },
  { number: 10, titleGeez: "ስለ ትምህርት መፍትሔ", gloss: "On release for learning", page: 20, endPage: 21, kind: "learning" },
  { number: 11, titleGeez: "ስለ መስተፋቅር", gloss: "On mesetefaqir (winning affection)", page: 21, endPage: 22, kind: "affection" },
  { number: 12, titleGeez: "ስለ ግርማ ሞገስ", gloss: "On girma mogese (dignity and favour)", page: 22, endPage: 23, kind: "favour" },
  { number: 13, titleGeez: "ድርሳን በገቢር", gloss: "Dirsan in practice (homilies of the archangels)", page: 23, endPage: 24, kind: "angels" },
];

/** How a chapter must be framed when a healer delivers it. */
export type AsmatEthic = "protective_only" | "consent_required" | "no_outcome_promise" | "health_overlap";

export const ASMAT_ETHIC_NOTES: Record<AsmatEthic, { en: string; am: string }> = {
  protective_only: {
    en: "Offered only as protection and release for the client. It is never directed at harming, or 'returning harm' to, a named person.",
    am: "ለደንበኛው ጥበቃና መፍትሔ ብቻ ይሰጣል። በስም በተጠቀሰ ሰው ላይ ጉዳት ለማድረስ ወይም «ለመመለስ» አይውልም።",
  },
  consent_required: {
    en: "For affection and harmony between people who both want it. Nothing is done to, or given to, another person without their knowledge and agreement.",
    am: "ሁለቱም ለሚፈልጉት ፍቅርና ስምምነት ብቻ። ያለ ሌላው ሰው እውቀትና ፈቃድ በሱ ላይ ምንም አይደረግም፣ ምንም አይሰጠውም።",
  },
  no_outcome_promise: {
    en: "A prayer for blessing, not a promise: no result in trade, wealth, exams or standing is guaranteed.",
    am: "የበረከት ጸሎት እንጂ ዋስትና አይደለም፤ በንግድ፣ በሀብት፣ በፈተና ወይም በክብር ውጤት አይረጋገጥም።",
  },
  health_overlap: {
    en: "What people attribute to spirits, buda or ayne tila (fits, fainting, confusion, wasting, not sleeping, forgetting) can also be illness. The client should be seen at a health centre as well.",
    am: "በመንፈስ፣ በቡዳ ወይም በአይነ ጥላ የሚመሰሉ ምልክቶች (መጣል፣ ራስን መሳት፣ መደናገር፣ መክሳት፣ እንቅልፍ ማጣት፣ መርሳት) ሕመምም ሊሆኑ ይችላሉ። ደንበኛው ጤና ተቋምም ይታይ።",
  },
};

export interface AsmatMaterial {
  amharic: string;
  name: string;
  /** Safety-matrix slug when the material is screenable; null for non-plant materials. */
  safetySlug: string | null;
}

export interface AsmatHeading {
  key: string;
  /** The chapter (ASMAT_CONTENTS number) this heading opens. */
  chapter: number;
  titleAm: string;
  /** Client-facing purpose, in the platform's words. */
  purposeEn: string;
  purposeAm: string;
  /** Sub-headings printed inside the chapter, with their pages. */
  subheadings: { titleGeez: string; page: number }[];
  /** Pages carrying a seal (ጠልሰም) drawing. */
  sealPages: number[];
  /** What the chapter's procedures name, for screening (no quantities or steps). */
  materials: AsmatMaterial[];
  practiceForms: PracticeForm[];
  ethics: AsmatEthic[];
  symptomCategory: SymptomCategory;
  /** ETHIOPIAN_MANUSCRIPT_INDEX entries about this chapter. */
  indexEntryIds: string[];
}

const M = (amharic: string, name: string, safetySlug: string | null = null): AsmatMaterial => ({ amharic, name, safetySlug });
const contents = (number: number) => ASMAT_CONTENTS.find((entry) => entry.number === number)!;

export const ASMAT_HEADINGS: AsmatHeading[] = [
  {
    key: "asmat_siray",
    chapter: 1,
    titleAm: "የሥራይ መፍትሔ",
    purposeEn: "Release from sorcery or a curse you feel is on you",
    purposeAm: "ከሥራይ ወይም ከተደረገብኝ ብዬ ከምጠረጥረው ነገር መፈታት",
    subheadings: [],
    sealPages: [],
    materials: [M("ቁንዶ በርበሬ", "Black pepper", "kundo-berbere"), M("ዝንጅብል", "Ginger", "zinjibil"), M("መቅመቆ", "Mekmeko root", "mekmeko")],
    practiceForms: ["recited_prayer", "taken_by_mouth"],
    ethics: ["protective_only", "health_overlap"],
    symptomCategory: "general",
    indexEntryIds: [],
  },
  {
    key: "asmat_medfe",
    chapter: 2,
    titleAm: "የመድፌ ወጊ መመለሻ",
    purposeEn: "Protection from harm you feel is sent against you",
    purposeAm: "ይላክብኛል ብዬ ከምፈራው ጉዳት መጠበቅ",
    subheadings: [],
    sealPages: [5],
    materials: [],
    practiceForms: ["recited_prayer", "written_scroll"],
    ethics: ["protective_only"],
    symptomCategory: "general",
    indexEntryIds: ["asmat-telsem-medfe-memelesha"],
  },
  {
    key: "asmat_maesere",
    chapter: 3,
    titleAm: "ማዕሠረ አጋንንት",
    purposeEn: "Protection from troubling spirits (binding)",
    purposeAm: "ከሚያስጨንቁ መናፍስት መጠበቅ (ማሠሪያ)",
    subheadings: [],
    sealPages: [6],
    materials: [M("ድኝ", "Sulfur (burned)")],
    practiceForms: ["recited_prayer", "written_scroll", "fumigation"],
    ethics: ["protective_only", "health_overlap"],
    symptomCategory: "general",
    indexEntryIds: ["asmat-telsem-maesere-aganint"],
  },
  {
    key: "asmat_mestme",
    chapter: 4,
    titleAm: "መስጥመ አጋንንት",
    purposeEn: "Protection from troubling spirits (prayers for each day of the week)",
    purposeAm: "ከሚያስጨንቁ መናፍስት መጠበቅ (የዕለታት ጸሎቶች)",
    subheadings: [{ titleGeez: "የመስጥመ አጋንንት ጸሎቶች ከሰኞ እስከ እሑድ", page: 7 }],
    sealPages: [11, 13],
    materials: [],
    practiceForms: ["recited_prayer", "written_scroll", "worn_amulet"],
    ethics: ["protective_only", "health_overlap"],
    symptomCategory: "general",
    indexEntryIds: ["asmat-telsem-mesteme-aganint-11-13"],
  },
  {
    key: "asmat_ayne_tila",
    chapter: 5,
    titleAm: "የአይነ ጥላ መፍትሔ",
    purposeEn: "Ayne tila (shadow affliction)",
    purposeAm: "አይነ ጥላ",
    subheadings: [{ titleGeez: "ለየአይነ ጥላ ማውጫ", page: 14 }, { titleGeez: "ሌላ የአይነ ጥላ መፍትሔ", page: 14 }],
    sealPages: [],
    materials: [M("ቁልቋል ወተት", "Euphorbia latex", "kulkual"), M("የሾላ ወተት", "Sycamore fig latex", "shola")],
    practiceForms: ["recited_prayer", "applied_near_eyes"],
    ethics: ["health_overlap"],
    symptomCategory: "general",
    indexEntryIds: ["asmat-telsem-buda-ayne-tila"],
  },
  {
    key: "asmat_buda",
    chapter: 6,
    titleAm: "የቡዳ መፍትሔ",
    purposeEn: "Buda (the evil eye)",
    purposeAm: "ቡዳ",
    subheadings: [],
    sealPages: [16],
    materials: [M("ነጭ ሽንኩርት", "Garlic", "nech-shinkurt"), M("ጤና አዳም", "Rue", "tena-adam"), M("የምድር እንቧይ", "Sodom apple", "embuay")],
    practiceForms: ["recited_prayer", "written_scroll", "worn_amulet", "snuffed_into_nose"],
    ethics: ["protective_only", "health_overlap"],
    symptomCategory: "general",
    indexEntryIds: ["asmat-telsem-buda-ayne-tila"],
  },
  {
    key: "asmat_aqabe_ries",
    chapter: 7,
    titleAm: "አቃቤ ርዕስ",
    purposeEn: "Guarding the head: sleep, dreams and fear",
    purposeAm: "የራስ ጠባቂ፦ እንቅልፍ፣ ሕልምና ፍርሃት",
    subheadings: [{ titleGeez: "በድጋም ብቻ አቃቤ ርዕስ", page: 18 }],
    sealPages: [17],
    materials: [],
    practiceForms: ["recited_prayer", "written_scroll", "worn_amulet"],
    ethics: ["health_overlap"],
    symptomCategory: "general",
    indexEntryIds: ["asmat-telsem-aqabe-rees"],
  },
  {
    key: "asmat_gebya",
    chapter: 8,
    titleAm: "የገብያ መፍትሔ",
    purposeEn: "Blessing for trade and the market",
    purposeAm: "ለንግድና ለገበያ በረከት",
    subheadings: [{ titleGeez: "ለገብያ", page: 18 }],
    sealPages: [],
    materials: [M("ነጭ ዕጣን", "Frankincense (burned)", "itan")],
    practiceForms: ["recited_prayer", "fumigation"],
    ethics: ["no_outcome_promise"],
    symptomCategory: "general",
    indexEntryIds: [],
  },
  {
    key: "asmat_habt",
    chapter: 9,
    titleAm: "መፍትሔ ሀብት",
    purposeEn: "Blessing for prosperity",
    purposeAm: "ለሀብትና ለብልጽግና በረከት",
    subheadings: [{ titleGeez: "ለመፍትሔ ሀብት", page: 18 }],
    sealPages: [],
    materials: [],
    practiceForms: ["recited_prayer", "written_scroll", "worn_amulet", "applied_to_skin"],
    ethics: ["no_outcome_promise"],
    symptomCategory: "general",
    indexEntryIds: [],
  },
  {
    key: "asmat_timhirt",
    chapter: 10,
    titleAm: "የትምህርት መፍትሔ",
    purposeEn: "Learning, memory and exams",
    purposeAm: "ትምህርት፣ ማስታወስና ፈተና",
    subheadings: [{ titleGeez: "ለሚረሳ ሰው", page: 20 }, { titleGeez: "ለትምህርት", page: 20 }, { titleGeez: "ሌላ የትምህርት", page: 21 }],
    sealPages: [],
    materials: [M("ጫት", "Khat", "khat"), M("ዘቢብ", "Raisins"), M("ጥቁር ሽንብራ", "Black chickpea")],
    practiceForms: ["recited_prayer", "taken_by_mouth"],
    ethics: ["no_outcome_promise", "health_overlap"],
    symptomCategory: "general",
    indexEntryIds: [],
  },
  {
    key: "asmat_mesetefaqir",
    chapter: 11,
    titleAm: "መስተፋቅር",
    purposeEn: "Affection and harmony in a relationship",
    purposeAm: "በግንኙነት ውስጥ ፍቅርና ስምምነት",
    subheadings: [{ titleGeez: "መስተፋቅር", page: 21 }, { titleGeez: "መስተፋቅር ወመግረሬ ፀር", page: 22 }],
    sealPages: [],
    materials: [M("ሎሚ", "Lemon")],
    practiceForms: ["recited_prayer", "written_scroll", "fumigation", "given_to_another_person"],
    ethics: ["consent_required", "no_outcome_promise"],
    symptomCategory: "general",
    indexEntryIds: [],
  },
  {
    key: "asmat_girma",
    chapter: 12,
    titleAm: "ግርማ ሞገስ",
    purposeEn: "Dignity, respect and favour",
    purposeAm: "ግርማ፣ ክብርና ሞገስ",
    subheadings: [{ titleGeez: "ለግርማ ሞገስ", page: 22 }],
    sealPages: [],
    materials: [M("ወተት", "Milk")],
    practiceForms: ["recited_prayer", "taken_by_mouth"],
    ethics: ["no_outcome_promise"],
    symptomCategory: "general",
    indexEntryIds: [],
  },
  {
    key: "asmat_dirsan",
    chapter: 13,
    titleAm: "ድርሳን በገቢር",
    purposeEn: "Prayers of the archangels",
    purposeAm: "የሊቃነ መላእክት ድርሳን",
    subheadings: [{ titleGeez: "የደ፯ ሊቃነ መላእክት ድርሳን ገበር", page: 23 }],
    sealPages: [],
    materials: [M("ማር", "Honey", "mar"), M("ጥንጁት", "Tinjut", "tinjut"), M("የዱባ ፍሬ", "Pumpkin seed", "duba-fre"), M("ዝንጅብል", "Ginger", "zinjibil"), M("ቁንዶ በርበሬ", "Black pepper", "kundo-berbere"), M("ነጭ ሽንኩርት", "Garlic", "nech-shinkurt"), M("ጽጌረዳ", "Rose petals")],
    practiceForms: ["recited_prayer", "worn_amulet", "taken_by_mouth"],
    ethics: ["no_outcome_promise"],
    symptomCategory: "general",
    indexEntryIds: ["asmat-telsem-dirsan-archangels"],
  },
];

export function getAsmatHeading(key: string) {
  return ASMAT_HEADINGS.find((heading) => heading.key === key) ?? null;
}

export function asmatBookReferences(heading: AsmatHeading) {
  return [contents(heading.chapter)];
}

/** Safety-matrix slugs of the chapter's screenable materials. */
export function asmatPlantSlugs(heading: AsmatHeading) {
  return [...new Set(heading.materials.map((m) => m.safetySlug).filter((slug): slug is string => Boolean(slug)))];
}

/** Review status and safe-use rules from the manuscript index: the contents entry plus this chapter's entries. */
export function asmatSourceNotes(heading?: AsmatHeading) {
  const ids = new Set(["asmat-contents-table", ...(heading?.indexEntryIds ?? [])]);
  return ETHIOPIAN_MANUSCRIPT_INDEX.filter((entry) => entry.sourceId === ASMAT_SOURCE_ID && ids.has(entry.id)).map((entry) => ({
    title: entry.title,
    pages: `${entry.pageStart}${entry.pageEnd && entry.pageEnd !== entry.pageStart ? `–${entry.pageEnd}` : ""}`,
    safeUse: entry.safeUse,
    reviewStatus: entry.reviewStatus,
  }));
}

/** Dropdown options for intake forms: the chapter title with a plain purpose. */
export function asmatDropdownOptions() {
  return ASMAT_HEADINGS.map((heading) => ({ value: heading.key, label: `${contents(heading.chapter).titleGeez} · ${heading.purposeEn}` }));
}
