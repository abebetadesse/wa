import { getManuscriptSource, type ManuscriptSource } from "./manuscriptSources";

export interface ManuscriptIndexEntry {
  id: string;
  sourceId: string;
  pageStart: number;
  pageEnd?: number;
  title: string;
  titleAmharic?: string;
  kind: "contents" | "historical_context" | "calendar" | "healing_topic" | "ritual_topic";
  summary: string;
  safeUse: string;
  reviewStatus: "needs_cultural_review";
}

export const ETHIOPIAN_MANUSCRIPT_INDEX: ManuscriptIndexEntry[] = [
  {
    id: "fewus-contents-healing-topics",
    sourceId: "metsehafe-fewus",
    pageStart: 4,
    pageEnd: 6,
    title: "Healing topics and plant index",
    titleAmharic: "የፈውስ ርዕሶች እና የእፀዋት ዝርዝር",
    kind: "contents",
    summary: "The contents pages organize sections on general healing, conditions, prayer, animal and plant references, and a later plant-name index.",
    safeUse: "Use as a navigation aid and historical source map only; do not convert listed remedies into self-treatment.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "fewus-plant-index",
    sourceId: "metsehafe-fewus",
    pageStart: 165,
    pageEnd: 399,
    title: "Plant names and preparation references",
    titleAmharic: "የእፀዋት ስም ዝርዝር እና ገቢር",
    kind: "healing_topic",
    summary: "Later pages include an OCR-indexed plant and preparation section; plant identity, dosage, toxicity, and claims require expert botanical and scientific review.",
    safeUse: "Use for candidate-name discovery and cultural documentation, never as an automatically generated prescription.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "fewus-condition-sections",
    sourceId: "metsehafe-fewus",
    pageStart: 38,
    pageEnd: 164,
    title: "Condition-oriented sections",
    kind: "healing_topic",
    summary: "The contents identify sections covering digestive complaints, respiratory symptoms, pain, wounds, skin conditions, and other wellbeing topics.",
    safeUse: "The section labels are indexed for retrieval; the app must route symptoms through safety triage and qualified care.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "gitsaw-introduction-and-structure",
    sourceId: "mets-hafe-gitsaw",
    pageStart: 2,
    pageEnd: 3,
    title: "Gitsaw introduction and reading structure",
    titleAmharic: "የግጻዌ መግቢያ እና አወቃቀር",
    kind: "historical_context",
    summary: "The introduction describes Gitsaw as an organized collection of readings, teaching, praise, prayer, feast, and liturgical reference material, with tabular reading directions.",
    safeUse: "Use for liturgical and calendar context, not as clinical evidence or compulsory religious guidance.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "gitsaw-calendar-and-feasts",
    sourceId: "mets-hafe-gitsaw",
    pageStart: 2,
    pageEnd: 182,
    title: "Calendar, feasts, readings, and seasonal observance",
    kind: "calendar",
    summary: "OCR identifies recurring references to feast days, seasons, readings, saints, and liturgical observances.",
    safeUse: "Use to support faith-sensitive calendar context and user-requested cultural education; do not infer wellbeing status from observance.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-contents-table",
    sourceId: "mets-hafe-asmat",
    pageStart: 2,
    pageEnd: 2,
    title: "Table of Chapters & Telsem Topics",
    titleAmharic: "ማውጫ እና የጠልሰም ርዕሶች ዝርዝር",
    kind: "contents",
    summary: "Complete table of contents detailing 13 core chapters from Meftehe Seray to the 7 Archangels.",
    safeUse: "Use as an organizational and navigational index.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-telsem-medfe-memelesha",
    sourceId: "mets-hafe-asmat",
    pageStart: 5,
    pageEnd: 5,
    title: "Seal for Reversing Piercing Ills (Psalm 1)",
    titleAmharic: "የመድፌ ወጊና የተንኮል መመለሻ ጠልሰም",
    kind: "ritual_topic",
    summary: "Authentic talismanic drawing and Ge'ez psalm formula designed to deflect occult piercing needles and subtle hostility.",
    safeUse: "Cultural and artistic study of classical scroll geometry only; do not attempt self-treatment.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-telsem-maesere-aganint",
    sourceId: "mets-hafe-asmat",
    pageStart: 6,
    pageEnd: 6,
    title: "Seal of Spirit Binding & Truth Unveiling",
    titleAmharic: "የአጋንንት ማሠሪያ ጠልሰም (ባርያ ዘመሸምሸሞ)",
    kind: "ritual_topic",
    summary: "Geometric grid seal with 8 directional boundary markers and invocation formula for dispelling deceitful spiritual interference.",
    safeUse: "Preserved for historical esoteric study. Non-operational.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-telsem-mesteme-aganint-11-13",
    sourceId: "mets-hafe-asmat",
    pageStart: 11,
    pageEnd: 13,
    title: "Master Subduing Seals & Neck Amulet (Mahteb)",
    titleAmharic: "የአጋንንት ማውገዣና ማሠሪያ ታላላቅ ጠልሰሞች",
    kind: "ritual_topic",
    summary: "Features two elaborate multi-node talismanic drawings (pages 11 & 13) invoked with saffron ink and protective botanical seeds.",
    safeUse: "Historical documentation of debtera amulet construction traditions.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-telsem-buda-ayne-tila",
    sourceId: "mets-hafe-asmat",
    pageStart: 14,
    pageEnd: 16,
    title: "Ocular Affliction & Buda Shield (Sador Alador)",
    titleAmharic: "የቡዳና የአይነ ጥላ መፍትሔ ጠልሰም",
    kind: "healing_topic",
    summary: "Talismanic drawing (page 16) combining the 5 cruciform wounds of Christ with traditional herbal cordons (Tena Adam, garlic, lemon).",
    safeUse: "Do not inhale smoke, burn substances, or substitute for licensed clinical diagnosis.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-telsem-aqabe-rees",
    sourceId: "mets-hafe-asmat",
    pageStart: 17,
    pageEnd: 18,
    title: "Crown Guardian & Cognitive Shield",
    titleAmharic: "የአቃቤ ርዕስ ጠልሰም",
    kind: "healing_topic",
    summary: "Horizontal panoramic eye-band talisman (page 17) designed to shield the crown, forehead, and sleep from nightmares and intrusive exhaustion.",
    safeUse: "Spiritual reflection only; medical or psychological conditions must be evaluated by licensed providers.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-telsem-dirsan-archangels",
    sourceId: "mets-hafe-asmat",
    pageStart: 23,
    pageEnd: 24,
    title: "The 7 Archangels in Active Practice (Dirsan be-Gebir)",
    titleAmharic: "የ፯ቱ ሊቃነ መላእክት ድርሳን በገቢር",
    kind: "ritual_topic",
    summary: "Sacred formulas and traditional associations for Michael, Gabriel, Raphael, Raguel, Uriel, and Saqwael/Phanuel.",
    safeUse: "Faith-sensitive calendar and liturgical context.",
    reviewStatus: "needs_cultural_review",
  },
];

export function getManuscriptIndex(sourceId?: string) {
  return sourceId
    ? ETHIOPIAN_MANUSCRIPT_INDEX.filter((entry) => entry.sourceId === sourceId)
    : ETHIOPIAN_MANUSCRIPT_INDEX;
}

export function getIndexedManuscriptSource(sourceId: string): ManuscriptSource | undefined {
  return getManuscriptSource(sourceId);
}
