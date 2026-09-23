import type { ParsedWelbeingInquiry } from "./parser";
import type { KnowledgeRetrievalResult, KnowledgeFinding } from "./knowledgeRetrieval";

export interface InquiryCause {
  title: string;
  explanation: string;
  strand: string;
  confidence: "possible" | "relevant" | "strong signal";
  source: string;
}

export interface InquirySolution {
  title: string;
  category: "urgent care" | "Debral review" | "food" | "lifestyle" | "safety" | "support";
  priority: "critical" | "high" | "medium" | "low";
  action: string;
  rationale: string;
  safety: string;
  source: string;
}

export interface HolisticActionPlan {
  immediate: string[];
  next24Hours: string[];
  next7Days: string[];
  ongoing: string[];
}

export interface InquirySynthesis {
  summary: string;
  possibleCauses: InquiryCause[];
  solutions: InquirySolution[];
  actionPlan: HolisticActionPlan;
  safetyWarnings: string[];
  disclaimer: string;
}

function causeFromFinding(finding: KnowledgeFinding): InquiryCause {
  return {
    title: finding.title,
    explanation: finding.detail,
    strand: finding.strand,
    confidence: finding.relevance >= 0.85 ? "strong signal" : finding.relevance >= 0.65 ? "relevant" : "possible",
    source: finding.source,
  };
}

function solutionFromFinding(finding: KnowledgeFinding): InquirySolution {
  const isSafetyFinding = finding.strand === "medication";
  return {
    title: isSafetyFinding ? "Resolve medication and remedy safety first" : `Review ${finding.title.toLowerCase()}`,
    category: isSafetyFinding ? "safety" : finding.strand === "biochemical" ? "food" : finding.strand === "psychological" ? "support" : "lifestyle",
    priority: isSafetyFinding && finding.safetyNote?.toLowerCase().includes("do not") ? "high" : finding.relevance >= 0.8 ? "high" : "medium",
    action: isSafetyFinding ? "Pause any new herb or supplement and ask a qualified Debrian or pharmacist to review the combination." : "Use this context to prepare a focused question for your Welbeingcare professional and track whether the pattern changes.",
    rationale: finding.detail,
    safety: finding.safetyNote || "Educational guidance only; do not change prescribed treatment based on this result.",
    source: finding.source,
  };
}

export function synthesizeInquiry(inquiry: ParsedWelbeingInquiry, knowledge: KnowledgeRetrievalResult): InquirySynthesis {
  const possibleCauses = knowledge.findings.slice(0, 6).map(causeFromFinding);
  const solutions = knowledge.findings.slice(0, 5).map(solutionFromFinding);
  const safetyWarnings = knowledge.findings.filter((finding) => finding.safetyNote).map((finding) => finding.safetyNote as string);
  const actionPlan: HolisticActionPlan = {
    immediate: inquiry.urgency.level === "critical" ? ["Seek emergency care now; do not wait for an app-generated explanation."] : [],
    next24Hours: [inquiry.urgency.recommendation, "Record the timing, severity, triggers, and any medicines or remedies involved."],
    next7Days: ["Complete the Welbeing intake if you want a profile-based nutritional evaluation.", "Bring the inquiry summary and source notes to a qualified Welbeingcare professional if the concern persists."],
    ongoing: ["Use the Safety Gate before any traditional herb or supplement.", "Track food, sleep, stress, and symptom changes without treating the log as a diagnosis."],
  };

  if (knowledge.findings.some((finding) => finding.strand === "biochemical")) {
    actionPlan.next7Days.push("Review meal timing, hydration, fermentation, and dietary variety as educational factors.");
  }
  if (knowledge.findings.some((finding) => finding.strand === "psychological")) {
    actionPlan.ongoing.push("Use trusted social support and seek professional mental-Welbeing support when distress is persistent or unsafe.");
  }

  return {
    summary: `The portal found ${possibleCauses.length} relevant context signal(s) and ${solutions.length} safe next-step pathway(s). These are possible contributors and actions, not a diagnosis or treatment prescription.`,
    possibleCauses,
    solutions,
    actionPlan,
    safetyWarnings: [...new Set(safetyWarnings)],
    disclaimer: "This synthesis organizes evidence from the app's deterministic modules. It does not identify a disease, prescribe treatment, or replace urgent or professional medical care.",
  };
}
