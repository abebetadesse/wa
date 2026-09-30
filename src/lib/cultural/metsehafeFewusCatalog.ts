/**
 * መጽሐፈ ፈውስ (Metsehafe Fewus): catalogue for healer intake dropdowns and review workspaces.
 * DOMAIN B (heritage). No clinical or pharmacological claims live here; safety information is
 * attached at run time from the safety matrix (Domain A) by the server, never by this module.
 *
 * FEWUS_CONTENTS reproduces only the book's table of contents (ማውጫ, printed pages ፬–፮ of the
 * scanned edition "መጽሐፈ ፈውስ.pdf"), read from the scan: 38 headings with their page numbers.
 * English glosses are the platform's own approximate translations.
 *
 * The book's prayers, formulae and remedy texts are NOT reproduced. Each healer records the
 * text they use from their own copy (stored per business), which then fills their review
 * workspace and templates. Plant lists on the intake headings are the platform's mapping for
 * safety screening, not quotations from the book.
 */
import { CATEGORY_PLANT_SLUGS, type SymptomCategory } from "@/lib/shared/symptomCategories";
import { ETHIOPIAN_MANUSCRIPT_INDEX } from "./manuscriptIndex";

export interface FewusContentsEntry {
  number: number;
  titleGeez: string;
  /** Approximate English gloss (platform translation). */
  gloss: string;
  page: number;
  kind: "letter_reckoning" | "prayer_and_names" | "condition" | "plants_and_animals" | "section";
}

/** Verified from the scanned table of contents (pages ፬, ፭, ፮). */
export const FEWUS_CONTENTS: FewusContentsEntry[] = [
  { number: 1, titleGeez: "ፈውስ፡ ሁልቆ ፊደላት", gloss: "Healing: the count of letters", page: 1, kind: "letter_reckoning" },
  { number: 2, titleGeez: "ሐሳበ ፊደላት ወትርጓሜ", gloss: "Reckoning of letters and their interpretation", page: 13, kind: "letter_reckoning" },
  { number: 3, titleGeez: "ሐሳበ ፊደላት ወባህርያት", gloss: "Reckoning of letters and the natures (humours)", page: 14, kind: "letter_reckoning" },
  { number: 4, titleGeez: "መፍትሔ ሐብት", gloss: "Release for prosperity", page: 24, kind: "prayer_and_names" },
  { number: 5, titleGeez: "ጸሎት በእንተ መፍትሔ ሥራይ", gloss: "Prayer for release from sorcery", page: 31, kind: "prayer_and_names" },
  { number: 6, titleGeez: "አስም", gloss: "Asthma", page: 33, kind: "condition" },
  { number: 7, titleGeez: "ጨጓራ", gloss: "The stomach (gastric complaints)", page: 38, kind: "condition" },
  { number: 8, titleGeez: "የስኳር ህመም", gloss: "Sugar illness", page: 42, kind: "condition" },
  { number: 9, titleGeez: "ሣልና ጉንፋን", gloss: "Cough and cold", page: 44, kind: "condition" },
  { number: 10, titleGeez: "ጉንፋን", gloss: "Common cold", page: 47, kind: "condition" },
  { number: 11, titleGeez: "የሆድ ደዌ ለድርቀት መፈውስ", gloss: "Belly ailment: easing constipation", page: 48, kind: "condition" },
  { number: 12, titleGeez: "የእጅና የአካል መንቀጥቀጥ ፈውስ", gloss: "Trembling of the hands and body", page: 53, kind: "condition" },
  { number: 13, titleGeez: "የግብረ ወሲብ ድክመት ፈውስ", gloss: "Weakness in marital intimacy", page: 56, kind: "condition" },
  { number: 14, titleGeez: "ክፍል ፩ መንስኤ እስኪት", gloss: "Part 1: the cause", page: 61, kind: "section" },
  { number: 15, titleGeez: "ክፍል ፪ መጽንኤ እስኪት", gloss: "Part 2", page: 63, kind: "section" },
  { number: 16, titleGeez: "ክፍል ፫ መፍትሔ እስኪት", gloss: "Part 3: the release", page: 65, kind: "section" },
  { number: 17, titleGeez: "ክፍል ፬ ዘኢያወርድ /ገትር/", gloss: "Part 4", page: 67, kind: "section" },
  { number: 18, titleGeez: "ክፍል ፭", gloss: "Part 5", page: 68, kind: "section" },
  { number: 19, titleGeez: "ክፍል ፮", gloss: "Part 6", page: 69, kind: "section" },
  { number: 20, titleGeez: "ክፍል ፯", gloss: "Part 7", page: 72, kind: "section" },
  { number: 21, titleGeez: "የልብ ህመምና ድካም ፈውስ", gloss: "Heart pain and fatigue", page: 75, kind: "condition" },
  { number: 22, titleGeez: "የራስ ሕመም ዓይነቶችና ፈውሱ", gloss: "Kinds of headache", page: 78, kind: "condition" },
  { number: 23, titleGeez: "ለማንኛውም ነገር አስፈላጊውን መርጦ ለሚጸልይ", gloss: "For one who prays, choosing what each matter needs", page: 93, kind: "prayer_and_names" },
  { number: 24, titleGeez: "መፍትሔ ሐብት", gloss: "Release for prosperity (continued)", page: 104, kind: "prayer_and_names" },
  { number: 25, titleGeez: "ሁሉን ቻይ የሆነው የፍጥረት ባለቤትና ጌታ እግዚአብሔር የሚመሰገንበት ቅዱስ ስሙ", gloss: "The holy name by which God, almighty Lord of creation, is praised", page: 114, kind: "prayer_and_names" },
  { number: 26, titleGeez: "ለሰላምና ለምህረት ለመልካም ዜና የተዘጋጁና የሚላኩ የእግዚአብሔር ቅዱሳን መላእክቱ ስም", gloss: "Names of the holy angels sent for peace, mercy and good tidings", page: 117, kind: "prayer_and_names" },
  { number: 27, titleGeez: "ለጥፋትና ለመቅሰፍት ለፍርድ የተዘጋጁ የፍዳ መላእክት ነገዶች", gloss: "The orders of angels of judgement", page: 119, kind: "prayer_and_names" },
  { number: 28, titleGeez: "የነቀርሣ መንስኤውና ፈውሱ", gloss: "Nekersa (malignant sores): cause", page: 121, kind: "condition" },
  { number: 29, titleGeez: "ለማንኛውም ለጡት ህመም ፈውስ", gloss: "Breast pain", page: 122, kind: "condition" },
  { number: 30, titleGeez: "ለተደበቀ ወይም ውስጥ ውስጡን ለሚያመው ... ነቀርሣ ወይም ለቆሰለ ... ፈውስ", gloss: "Hidden or inward aching, nekersa or ulcerated sores", page: 124, kind: "condition" },
  { number: 31, titleGeez: "የኪንታሮት ፈውስ", gloss: "Kintarot (warts and piles)", page: 132, kind: "condition" },
  { number: 32, titleGeez: "ለለምጽ ሥጋ ደዌ ፈውስ", gloss: "Lemts (patchy skin disease)", page: 141, kind: "condition" },
  { number: 33, titleGeez: "ለቁስል ለሥጋ ደዌና ለነቀርሣና ለኪንታሮት የሚሆኑ እጽዋቶች ፈውስ", gloss: "Plants for wounds, skin disease, nekersa and kintarot", page: 143, kind: "plants_and_animals" },
  { number: 34, titleGeez: "ሰውነትን ለሚያንቀጠቅጥና ለሚጥል ለሚያዝል ለሌጌዎን መድኃኒት ፈውስ", gloss: "For what shakes, fells and weakens the body", page: 151, kind: "condition" },
  { number: 35, titleGeez: "ስለ አራዊትና ስለ እንስሳ ሥጋ መድኃኒትነት", gloss: "Wild and domestic animals in healing", page: 154, kind: "plants_and_animals" },
  { number: 36, titleGeez: "የአትክልትና የእህል አገልግሎት ፈውስ", gloss: "Healing uses of vegetables and grains", page: 169, kind: "plants_and_animals" },
  { number: 37, titleGeez: "መከሰት - እፀአንግሥ", gloss: "Mekeset: the plant of revelation", page: 183, kind: "plants_and_animals" },
  { number: 38, titleGeez: "በግእዝና በአማርኛ ከሀ እስከ ፈ የእፀዋት ስም ዝርዝር እና ገቢር", gloss: "Ge'ez and Amharic plant-name index (ሀ–ፈ) with their actions", page: 185, kind: "plants_and_animals" },
];

export interface FewusPlant {
  scientificName: string;
  amharic: string;
  /** Safety-matrix slug, so the server can attach live safety information. */
  safetySlug: string;
}

export interface FewusHeading {
  key: string;
  titleAm: string;
  titleEn: string;
  /** Which book headings (FEWUS_CONTENTS numbers) this intake heading points to. */
  bookSections: number[];
  /** direct: the book has this heading; grouped: spans related headings; none: no dedicated heading. */
  bookMatch: "direct" | "grouped" | "none";
  symptomCategory: SymptomCategory;
  plants: FewusPlant[];
  /** Short orientation in the platform's own words, shown to the healer. */
  orientationAm: string;
}

const P = (scientificName: string, amharic: string, safetySlug: string): FewusPlant => ({ scientificName, amharic, safetySlug });

export const FEWUS_HEADINGS: FewusHeading[] = [
  {
    key: "fewus_digestive",
    titleAm: "የሆድ ቁርጠትና የአንጀት ደዌ",
    titleEn: "Digestive & intestinal complaints",
    bookSections: [7, 11],
    bookMatch: "grouped",
    symptomCategory: "digestive",
    plants: [P("Ruta chalepensis", "ጤና አዳም", "tena-adam"), P("Allium sativum", "ነጭ ሽንኩርት", "nech-shinkurt"), P("Trigonella foenum-graecum", "አብሽ", "abish")],
    orientationAm: "ከመጽሐፉ ጨጓራ (ገጽ ፴፰) እና የሆድ ደዌ (ገጽ ፵፰) ክፍሎች ጋር የተያያዘ።",
  },
  {
    key: "fewus_febrile_malaria",
    titleAm: "የተኩሳት፣ የወባና የብርድ ደዌ",
    titleEn: "Periodic fevers & chills",
    bookSections: [],
    bookMatch: "none",
    symptomCategory: "febrile",
    plants: [P("Ocimum lamiifolium", "ደማከሴ", "damakesse"), P("Artemisia afra", "አሪቲ", "ariti")],
    orientationAm: "በማውጫው ለዚህ የተለየ ርዕስ የለም፤ ከገጽ ፴፰–፻፷፬ ያሉትን የደዌ ክፍሎች ይመልከቱ። ወባ ሊሆን ስለሚችል ምርመራ ያስፈልጋል።",
  },
  {
    key: "fewus_respiratory",
    titleAm: "የደረትና የትንፋሽ ደዌ",
    titleEn: "Chest, cough & breathing",
    bookSections: [6, 9, 10],
    bookMatch: "grouped",
    symptomCategory: "respiratory",
    plants: [P("Zingiber officinale", "ዝንጅብል", "zinjibil"), P("Eucalyptus globulus", "ባህር ዛፍ", "bahir-zaf")],
    orientationAm: "ከመጽሐፉ አስም (ገጽ ፴፫)፣ ሣልና ጉንፋን (ገጽ ፵፬) እና ጉንፋን (ገጽ ፵፯) ክፍሎች ጋር የተያያዘ።",
  },
  {
    key: "fewus_dermatological",
    titleAm: "የቁስልና የቆዳ ደዌ",
    titleEn: "Skin eruptions & wounds",
    bookSections: [31, 32, 33],
    bookMatch: "grouped",
    symptomCategory: "dermal",
    plants: [P("Solanum incanum", "እምቧይ", "embuay"), P("Withania somnifera", "ጊዛዋ", "gizawa")],
    orientationAm: "ከመጽሐፉ ኪንታሮት (ገጽ ፻፴፪)፣ ለምጽ (ገጽ ፻፵፩) እና ለቁስል የሚሆኑ እጽዋት (ገጽ ፻፵፫) ክፍሎች ጋር የተያያዘ።",
  },
  {
    key: "fewus_headache_migraine",
    titleAm: "የራስ ምታትና የቀኝ/የግራ ፈንጠር",
    titleEn: "Headache & one-sided headache",
    bookSections: [22],
    bookMatch: "direct",
    symptomCategory: "headache",
    plants: [P("Lepidium sativum", "ፌጦ", "feto"), P("Ocimum lamiifolium", "ደማከሴ", "damakesse")],
    orientationAm: "የመጽሐፉ «የራስ ሕመም ዓይነቶችና ፈውሱ» (ገጽ ፸፰)።",
  },
  {
    key: "fewus_rheumatic_joint",
    titleAm: "የቁርጥማትና የመገጣጠሚያ ደዌ",
    titleEn: "Rheumatism & joint pain",
    bookSections: [],
    bookMatch: "none",
    symptomCategory: "joint",
    plants: [P("Brassica nigra", "ሰናፍጭ", "senafich"), P("Lepidium sativum", "ፌጦ", "feto")],
    orientationAm: "በማውጫው ለቁርጥማት የተለየ ርዕስ የለም፤ ከገጽ ፴፰–፻፷፬ ያሉትን የደዌ ክፍሎች ይመልከቱ።",
  },
  { key: "fewus_stomach", titleAm: "ጨጓራ", titleEn: "Stomach burning", bookSections: [7], bookMatch: "direct", symptomCategory: "stomach_acid", plants: [], orientationAm: "የመጽሐፉ «ጨጓራ» ክፍል (ገጽ ፴፰)።" },
  { key: "fewus_sugar", titleAm: "የስኳር ህመም", titleEn: "Sugar illness", bookSections: [8], bookMatch: "direct", symptomCategory: "blood_sugar", plants: [], orientationAm: "የመጽሐፉ «የስኳር ህመም» ክፍል (ገጽ ፵፪)። የስኳር መድኃኒት የሚወስዱ ከሆነ ከሐኪም ጋር ያማክሩ።" },
  { key: "fewus_heart_fatigue", titleAm: "የልብ ህመምና ድካም", titleEn: "Heart pain & fatigue", bookSections: [21], bookMatch: "direct", symptomCategory: "heart_fatigue", plants: [], orientationAm: "የመጽሐፉ «የልብ ህመምና ድካም ፈውስ» (ገጽ ፸፭)። የደረት ሕመም ድንገተኛ ሊሆን ይችላል።" },
  { key: "fewus_tremor", titleAm: "የእጅና የአካል መንቀጥቀጥ", titleEn: "Trembling of hands & body", bookSections: [12], bookMatch: "direct", symptomCategory: "tremor", plants: [], orientationAm: "የመጽሐፉ «የእጅና የአካል መንቀጥቀጥ ፈውስ» (ገጽ ፶፫)።" },
  { key: "fewus_breast", titleAm: "የጡት ህመም", titleEn: "Breast pain", bookSections: [29], bookMatch: "direct", symptomCategory: "general", plants: [], orientationAm: "የመጽሐፉ «ለማንኛውም ለጡት ህመም ፈውስ» (ገጽ ፻፳፪)። እብጠት ካለ ምርመራ ያስፈልጋል።" },
];

/** Plant identifiers to screen for a heading: its own list, or the neutral category mapping. */
export function fewusPlantSlugs(heading: FewusHeading) {
  return heading.plants.length ? heading.plants.map((plant) => plant.safetySlug) : CATEGORY_PLANT_SLUGS[heading.symptomCategory];
}

export function getFewusHeading(key: string) {
  return FEWUS_HEADINGS.find((heading) => heading.key === key) ?? null;
}

export function fewusBookReferences(heading: FewusHeading) {
  return heading.bookSections.map((number) => FEWUS_CONTENTS.find((entry) => entry.number === number)!).filter(Boolean);
}

/** The manuscript index's review status and safe-use rules for the Fewus source, shown with every heading. */
export function fewusSourceNotes() {
  return ETHIOPIAN_MANUSCRIPT_INDEX.filter((entry) => entry.sourceId === "metsehafe-fewus").map((entry) => ({ title: entry.title, pages: `${entry.pageStart}${entry.pageEnd ? `–${entry.pageEnd}` : ""}`, safeUse: entry.safeUse, reviewStatus: entry.reviewStatus }));
}

/** Dropdown options for intake forms. */
export function fewusDropdownOptions() {
  return FEWUS_HEADINGS.map((heading) => ({ value: heading.key, label: `${heading.titleAm} · ${heading.titleEn}` }));
}
