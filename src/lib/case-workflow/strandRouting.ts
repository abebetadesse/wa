import { KNOWLEDGE_STRANDS } from "@/lib/knowledge/catalog";
import { KnowledgeStrandType } from "@/lib/knowledge/types";

export type CaseDomain = "wellbeing" | "peace" | "power" | "money" | "career" | "relationships" | "spiritual" | "legal" | "social";

const ALL_CASE_STRANDS = [...KNOWLEDGE_STRANDS];
const domainA = ALL_CASE_STRANDS.filter((strand) => strand !== "cultural" && strand !== "astrological");
const domainB = ["cultural", "astrological"] as KnowledgeStrandType[];
const reflectiveOnlyStrands = [...domainB];

export const CASE_STRAND_FILTERS: Record<CaseDomain, KnowledgeStrandType[]> = {
  wellbeing: ALL_CASE_STRANDS,
  peace: ALL_CASE_STRANDS,
  power: ALL_CASE_STRANDS,
  money: reflectiveOnlyStrands,
  career: reflectiveOnlyStrands,
  relationships: ALL_CASE_STRANDS,
  spiritual: ALL_CASE_STRANDS,
  legal: reflectiveOnlyStrands,
  social: ALL_CASE_STRANDS,
};

export const CASE_DOMAIN_A_STRANDS: Record<CaseDomain, KnowledgeStrandType[]> = {
  wellbeing: domainA,
  peace: domainA,
  power: domainA,
  money: [],
  career: [],
  relationships: domainA,
  spiritual: domainA,
  legal: [],
  social: domainA,
};

export const CASE_DOMAIN_B_STRANDS: Record<CaseDomain, KnowledgeStrandType[]> = {
  wellbeing: domainB,
  peace: domainB,
  power: domainB,
  money: domainB,
  career: domainB,
  relationships: domainB,
  spiritual: domainB,
  legal: domainB,
  social: domainB,
};

export function getCaseStrandFilters(domain: string): KnowledgeStrandType[] {
  return CASE_STRAND_FILTERS[domain as CaseDomain] || [];
}
