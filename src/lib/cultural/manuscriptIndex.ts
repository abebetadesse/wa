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
    summary: "Later pages include an OCR-indexed plant and preparation section; plant identity, dosage, toxicity, and claims require expert botanical and clinical review.",
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
    summary: "The contents identify sections covering digestive complaints, respiratory symptoms, pain, wounds, skin conditions, and other health topics.",
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
    safeUse: "Use to support faith-sensitive calendar context and user-requested cultural education; do not infer health status from observance.",
    reviewStatus: "needs_cultural_review",
  },
  {
    id: "asmat-ritual-topics",
    sourceId: "mets-hafe-asmat",
    pageStart: 2,
    pageEnd: 25,
    title: "Protective and remedial ritual topics",
    titleAmharic: "የመፍትሔ እና የመከላከያ ርዕሶች",
    kind: "ritual_topic",
    summary: "The text contains headings and ritual material concerning protection, spiritual disturbance, prosperity, education, affection, and related esoteric themes.",
    safeUse: "Only provide non-operational historical summaries. Do not provide instructions involving ingestion, burning, smoke, bodily fluids, weapons, coercion, or treatment substitution.",
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
