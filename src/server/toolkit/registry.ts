/**
 * Built-in tools: the platform's engines and knowledge repositories, described for traditional
 * healers and cultural practitioners. This registry is the code-owned source; `syncBuiltinTools()`
 * copies new entries into `toolkit_tools` automatically, where administrators can rename, re-target
 * or hide them without a deploy. Care pathways are generated from the case workflow domains, so a
 * new domain appears as a pathway on its own.
 *
 * Pure: no server imports beyond the domain configs, so tests and the admin UI can share it.
 */
import { DOMAIN_CONFIGS } from "@/server/cases/domains";
import type { KnowledgeStrandType } from "@/lib/knowledge/types";

export const TOOL_GROUPS = ["care_pathway", "evidence", "practice", "support", "governance"] as const;
export type ToolGroup = (typeof TOOL_GROUPS)[number];

/** public: everyone · practitioner: people who work in a business (and experts) · admin: administrators. */
export const TOOL_AUDIENCES = ["public", "practitioner", "admin"] as const;
export type ToolAudience = (typeof TOOL_AUDIENCES)[number];

export const GROUP_LABELS: Record<ToolGroup, string> = {
  care_pathway: "Care pathways",
  evidence: "Evidence repositories",
  practice: "Practice knowledge",
  support: "Safety & support",
  governance: "Governance",
};

export interface ToolDefinition {
  key: string;
  name: string;
  description: string;
  group: ToolGroup;
  href: string;
  audience: ToolAudience;
  strands: KnowledgeStrandType[];
  /** Business categories and service kinds (slugs) this tool naturally serves. */
  suggestedFor: { categories: string[]; serviceKinds: string[] };
  sortOrder: number;
}

const HEALING = ["herbalist", "debtera", "bone-setter", "spiritual-guide", "bodywork", "hexacore-practitioner"];

const STATIC_TOOLS: Omit<ToolDefinition, "sortOrder">[] = [
  // Evidence repositories: what healers check before advising or preparing anything.
  { key: "herb-medicine-safety", name: "Herb & medicine safety check", description: "Check remedies against a client's medicines, pregnancy and conditions before preparing them.", group: "evidence", href: "/safety", audience: "public", strands: ["medication", "biochemical"], suggestedFor: { categories: ["herbalist", "bone-setter", "bodywork"], serviceKinds: ["remedy-preparation", "consultation"] } },
  { key: "medicinal-plant-atlas", name: "Medicinal plant atlas", description: "Ethiopian medicinal plants: local names, parts used, preparation traditions and known cautions.", group: "evidence", href: "/library/medicinal-plants", audience: "public", strands: ["biological", "ecological", "cultural"], suggestedFor: { categories: ["herbalist"], serviceKinds: ["remedy-preparation"] } },
  { key: "food-knowledge", name: "Food knowledge matrix", description: "Composition of Ethiopian foods, for dietary guidance alongside remedies and fasting.", group: "evidence", href: "/foods", audience: "public", strands: ["dietary", "biochemical"], suggestedFor: { categories: ["herbalist", "coffee-ceremony"], serviceKinds: ["consultation", "remedy-preparation"] } },
  { key: "regional-atlas", name: "Regional living-conditions atlas", description: "Altitude, climate, food access and seasonal patterns by region, to understand where a client lives.", group: "evidence", href: "/atlas", audience: "practitioner", strands: ["epidemiological", "ecological", "socioeconomic"], suggestedFor: { categories: HEALING, serviceKinds: ["consultation"] } },
  { key: "ecology", name: "Ecology & plant habitats", description: "Where plants grow, seasons of harvest and sustainable gathering.", group: "evidence", href: "/ecology", audience: "practitioner", strands: ["ecological", "biological"], suggestedFor: { categories: ["herbalist"], serviceKinds: ["remedy-preparation"] } },
  { key: "animal-human-links", name: "Animal–human living links", description: "Livestock, animals and shared-environment patterns relevant to rural households.", group: "evidence", href: "/zoonotic", audience: "practitioner", strands: ["epidemiological", "ecological"], suggestedFor: { categories: ["herbalist", "bone-setter"], serviceKinds: ["consultation"] } },
  { key: "fasting-rhythm", name: "Fasting & lunar rhythm", description: "Fasting seasons and the church and lunar calendar, for timing remedies, meals and ceremonies.", group: "evidence", href: "/fasting", audience: "public", strands: ["dietary", "cultural", "astrological"], suggestedFor: { categories: ["herbalist", "debtera", "spiritual-guide", "coffee-ceremony", "ceremony-events"], serviceKinds: ["remedy-preparation", "ceremony"] } },

  // Practice knowledge: the traditions healers work within.
  { key: "awde-negest", name: "Awde Negest reading", description: "Name-and-season reading from the Awde Negest tradition, framed as reflection.", group: "practice", href: "/awde-negast", audience: "practitioner", strands: ["cultural", "astrological"], suggestedFor: { categories: ["debtera", "spiritual-guide"], serviceKinds: ["reading", "life-direction-review"] } },
  { key: "geez-gematria-calendar", name: "Ge'ez gematria & calendar", description: "Ge'ez letter values, naming and the Ethiopian calendar for readings and naming work.", group: "practice", href: "/cultural", audience: "practitioner", strands: ["cultural", "astrological"], suggestedFor: { categories: ["debtera", "spiritual-guide", "language-manuscripts"], serviceKinds: ["reading"] } },
  { key: "sacred-library", name: "Sacred library", description: "Manuscripts and commentaries: Awde Negest, Hatata and Telsem archives with translations.", group: "practice", href: "/library", audience: "practitioner", strands: ["cultural"], suggestedFor: { categories: ["debtera", "spiritual-guide", "language-manuscripts"], serviceKinds: ["reading", "class"] } },
  { key: "hatata-commentary", name: "Hatata commentary", description: "Spirit commentary and translations for study and teaching.", group: "practice", href: "/library/hatata", audience: "practitioner", strands: ["cultural"], suggestedFor: { categories: ["debtera", "spiritual-guide"], serviceKinds: ["reading", "class"] } },
  { key: "telsem-archive", name: "Telsem archive", description: "Protective art (telsem) archive with meanings and provenance.", group: "practice", href: "/library/telsem", audience: "practitioner", strands: ["cultural"], suggestedFor: { categories: ["debtera", "artisan", "language-manuscripts"], serviceKinds: ["commission", "reading"] } },
  { key: "hexacore-arcana", name: "Hexacore arcana", description: "Six-part symbolic reading used for reflective guidance sessions.", group: "practice", href: "/hexacore", audience: "practitioner", strands: ["cultural", "astrological", "psychological"], suggestedFor: { categories: ["debtera", "spiritual-guide", "hexacore-practitioner"], serviceKinds: ["reading", "life-direction-review", "hexacore-reading"] } },
  { key: "hexacore-body-signs", name: "Hexacore body signs", description: "Unified body-sign toolkit: tongue, palm and face reading for reflective client sessions.", group: "practice", href: "/body-reading/tongue", audience: "practitioner", strands: ["biological", "cultural", "psychological"], suggestedFor: { categories: ["hexacore-practitioner"], serviceKinds: ["tongue-reading", "palm-reading", "face-reading", "body-sign-reading"] } },
  { key: "tongue-reading", name: "Tongue reading", description: "Tongue surface, colour, coat and shape analysis as a traditional body-sign assessment tool. Reflective and educational cultural reference.", group: "practice", href: "/body-reading/tongue", audience: "practitioner", strands: ["biological", "cultural", "psychological"], suggestedFor: { categories: ["hexacore-practitioner"], serviceKinds: ["tongue-reading", "body-sign-reading"] } },
  { key: "palm-reading", name: "Palm reading", description: "Hand lines, mounts and finger shape analysis as cultural and reflective guidance. Includes both traditional Ethiopian hand-reading and comparative palmistry.", group: "practice", href: "/body-reading/palm", audience: "practitioner", strands: ["cultural", "astrological", "psychological"], suggestedFor: { categories: ["hexacore-practitioner"], serviceKinds: ["palm-reading"] } },
  { key: "face-reading", name: "Face reading & biometrics", description: "Facial zone, feature and expression mapping using traditional physiognomy and modern biometric pattern reference. Includes forehead, eye, nose, mouth and ear zone analysis. Reflective only — never a medical or forensic claim.", group: "practice", href: "/body-reading/face", audience: "practitioner", strands: ["biological", "cultural", "psychological"], suggestedFor: { categories: ["hexacore-practitioner"], serviceKinds: ["face-reading", "body-sign-reading"] } },
  { key: "energy-pattern", name: "Energy & body pattern", description: "Resilience, digestion, rest and seasonal rhythm, for bodywork and remedy planning.", group: "practice", href: "/constitution", audience: "practitioner", strands: ["biological", "dietary", "psychological"], suggestedFor: { categories: ["herbalist", "bodywork", "bone-setter", "hexacore-practitioner"], serviceKinds: ["bodywork-session", "consultation"] } },
  { key: "body-awareness", name: "Body awareness (somatics)", description: "Body signs, tension and posture patterns to support hands-on sessions.", group: "practice", href: "/somatics", audience: "practitioner", strands: ["biological", "psychological"], suggestedFor: { categories: ["bodywork", "bone-setter"], serviceKinds: ["bodywork-session"] } },
  { key: "multi-strand-review", name: "Multi-strand situation review", description: "Brings body, food, place, culture and life circumstances together to understand a client's existing condition.", group: "practice", href: "/diagnostic", audience: "practitioner", strands: ["biological", "dietary", "ecological", "cultural", "psychological", "socioeconomic"], suggestedFor: { categories: HEALING, serviceKinds: ["consultation"] } },
  { key: "integrative-view", name: "Integrative view", description: "Traditional practice and scientific safety side by side for one client.", group: "practice", href: "/integrative", audience: "practitioner", strands: ["medication", "cultural", "biological"], suggestedFor: { categories: ["herbalist", "spiritual-guide"], serviceKinds: ["consultation"] } },
  { key: "heritage-atlas", name: "Heritage & ritual memory", description: "Food wisdom, ritual memory, ceremony and living context across Ethiopia's communities.", group: "practice", href: "/heritage", audience: "public", strands: ["cultural", "dietary", "ecological"], suggestedFor: { categories: ["coffee-ceremony", "ceremony-events", "music-dance", "heritage-tours", "artisan"], serviceKinds: ["ceremony", "class", "event-service"] } },

  // Safety & support.
  { key: "emergency-support", name: "Emergency support", description: "Who to call and what to do when a client is in danger. Always available.", group: "support", href: "/emergency", audience: "public", strands: ["psychological"], suggestedFor: { categories: HEALING, serviceKinds: [] } },

  // Governance (administrators).
  { key: "audit-ledger", name: "Audit ledger", description: "Every sensitive action, recorded and unchangeable.", group: "governance", href: "/audit", audience: "admin", strands: [], suggestedFor: { categories: [], serviceKinds: [] } },
  { key: "locations-dataset", name: "Locations dataset", description: "Regions, zones and districts used across the platform.", group: "governance", href: "/locations", audience: "admin", strands: ["epidemiological"], suggestedFor: { categories: [], serviceKinds: [] } },
];

/** Care pathways follow the case workflow domains, so they stay in step with the case engine. */
const PATHWAY_FIT: Record<string, { categories: string[]; serviceKinds: string[]; strands: KnowledgeStrandType[] }> = {
  spiritual: { categories: ["debtera", "spiritual-guide"], serviceKinds: ["reading"], strands: ["cultural", "astrological"] },
  career: { categories: ["debtera", "spiritual-guide"], serviceKinds: ["life-direction-review"], strands: ["cultural", "socioeconomic"] },
  relationship: { categories: ["spiritual-guide", "debtera"], serviceKinds: ["consultation"], strands: ["psychological", "cultural"] },
  legal: { categories: ["spiritual-guide"], serviceKinds: ["consultation"], strands: ["cultural", "socioeconomic"] },
  social: { categories: ["spiritual-guide", "herbalist"], serviceKinds: ["consultation"], strands: ["psychological", "socioeconomic"] },
};

export function builtinTools(): ToolDefinition[] {
  const pathways: Omit<ToolDefinition, "sortOrder">[] = Object.values(DOMAIN_CONFIGS).map((config) => {
    const fit = PATHWAY_FIT[config.domain] ?? { categories: [], serviceKinds: [], strands: ["cultural"] as KnowledgeStrandType[] };
    return {
      key: `pathway-${config.domain}`,
      name: config.label.replace(/\s*\(.*\)\s*$/, ""),
      description: config.description,
      group: "care_pathway",
      href: `/case/workflows/new/${config.domain}`,
      audience: "public",
      strands: fit.strands,
      suggestedFor: { categories: fit.categories, serviceKinds: fit.serviceKinds },
    };
  });
  return [...pathways, ...STATIC_TOOLS].map((tool, index) => ({ ...tool, sortOrder: index * 10 }));
}

/** Longest registered path that is a prefix of `pathname` (so /library/hatata beats /library). */
export function toolForPath<T extends { key: string; href: string }>(tools: T[], pathname: string): T | null {
  let best: T | null = null;
  for (const tool of tools) {
    const path = tool.href.split("?")[0];
    if (!path.startsWith("/") || path === "/") continue;
    if ((pathname === path || pathname.startsWith(`${path}/`)) && (!best || path.length > best.href.split("?")[0].length)) best = tool;
  }
  return best;
}
