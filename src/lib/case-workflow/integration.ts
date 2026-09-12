import { UrgencyDetector } from "@/lib/knowledge/parsing/urgencyDetector";
import { KnowledgeStrandType } from "@/lib/knowledge/types";
import { CASE_DOMAIN_A_STRANDS, CASE_DOMAIN_B_STRANDS } from "./strandRouting";

export type WorkflowStrand = KnowledgeStrandType;

export type WorkflowLayer = "A" | "B";

export interface WorkflowSafety {
  level: "critical" | "high" | "medium" | "low";
  score: number;
  action: string;
  recommendation: string;
  matchedSignals: string[];
  domainBAllowed: boolean;
}

export interface WorkflowContext {
  domainA: WorkflowStrand[];
  domainB: WorkflowStrand[];
  queried: WorkflowStrand[];
  safety: WorkflowSafety;
}

const urgencyDetector = new UrgencyDetector();

export function getWorkflowStrands(domain: string, includeDomainB: boolean): { domainA: WorkflowStrand[]; domainB: WorkflowStrand[]; queried: WorkflowStrand[] } {
  const domainA = CASE_DOMAIN_A_STRANDS[domain as keyof typeof CASE_DOMAIN_A_STRANDS] || [];
  const domainB = includeDomainB ? (CASE_DOMAIN_B_STRANDS[domain as keyof typeof CASE_DOMAIN_B_STRANDS] || []) : [];
  return { domainA, domainB, queried: [...domainA, ...domainB] };
}

export function buildWorkflowContext(domain: string, query: string, includeDomainB: boolean): WorkflowContext {
  const strands = getWorkflowStrands(domain, includeDomainB);
  const detected = urgencyDetector.detect(query, []);
  const safety: WorkflowSafety = {
    ...detected,
    domainBAllowed: detected.level !== "critical",
  };

  if (!safety.domainBAllowed) {
    return {
      domainA: strands.domainA,
      domainB: [],
      queried: strands.domainA,
      safety,
    };
  }

  return { ...strands, safety };
}
