import { isBionicConfigured, synthesizeCaseReportAnalysis } from "@/lib/ai/bionicGPT";
import type { ReportSection, WorkflowQuestion } from "../types";

export const REPORT_DISCLAIMER =
  "This report is reflective, educational guidance prepared from your answers and reviewed by a practitioner. " +
  "It is not a diagnosis, legal ruling, financial or medical advice. Cultural and spiritual sections are offered " +
  "for reflection and never replace professional support.";

export const RECOMMENDATION_GRADES = {
  strong: { label: "Strong evidence", color: "emerald" },
  moderate: { label: "Moderate evidence", color: "amber" },
  preliminary: { label: "Preliminary evidence", color: "sky" },
  traditional: { label: "Traditional / cultural practice", color: "violet" },
  reflective_only: { label: "Reflective only", color: "slate" },
} as const;

export const STANDARD_CHECKLIST = [
  { id: "read_answers", label: "I read every answer and the safety screen result." },
  { id: "safety_reviewed", label: "Any safety concern is addressed or referred." },
  { id: "content_accurate", label: "The report is accurate, respectful and free of harmful advice." },
  { id: "scope_respected", label: "No diagnosis, prescription, legal ruling or financial instruction is given." },
];

interface RawQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: string;
  required: boolean;
  options?: { value: string; label: string; labelAmharic?: string }[];
  placeholder?: string;
  hint?: string;
  dependsOn?: { questionId: string; value?: unknown; operator?: string };
}

export function normalizeQuestions(questions: RawQuestion[]): WorkflowQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    textAmharic: question.textAmharic,
    type: question.type,
    required: question.required,
    options: question.options?.map(({ value, label, labelAmharic }) => ({ value, label, labelAmharic })),
    placeholder: question.placeholder,
    hint: question.hint,
    dependsOn:
      question.dependsOn && (typeof question.dependsOn.value === "string" || Array.isArray(question.dependsOn.value))
        ? { questionId: question.dependsOn.questionId, value: question.dependsOn.value as string | string[] }
        : undefined,
  }));
}

export const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** A reflective analysis section from the configured language model; omitted when none is configured. */
export async function aiSection(domain: string, input: Record<string, unknown>): Promise<ReportSection | null> {
  if (!isBionicConfigured()) return null;
  try {
    const analysis = await synthesizeCaseReportAnalysis(domain, input);
    return {
      id: "ai_analysis",
      title: "Situation analysis",
      body: analysis.situationSummary,
      items: analysis.strategicRecommendations.map((item) => `${item.title}: ${item.description}`),
      locked: true,
      evidence: {
        sources: ["BionicGPT synthesis", "user case inputs"],
        confidence: 0.72,
        note: "AI-assisted synthesis is included for expert review and never substitutes for human clinical or legal judgment.",
      },
      data: { strengths: analysis.strengths, challenges: analysis.challenges, insights: analysis.sectorInsights },
    };
  } catch (error) {
    console.error(`[cases] AI synthesis failed for ${domain}:`, error);
    return null;
  }
}

export function buildEvidenceBasedRecommendations(
  domain: string,
  input: Record<string, unknown>,
): Array<{ id: string; title: string; description: string; evidence: { grade: keyof typeof RECOMMENDATION_GRADES; source: string; confidence: number; note: string }; domain: "scientific" | "cultural" | "social" | "legal" | "career" | "spiritual"; requiresReview?: boolean }>
{
  const records = [
    {
      id: `${domain}-recommendation-1`,
      title: "Evidence-aware next step",
      description: "Use the least invasive, highest-confidence action first and re-check safety and consent before acting.",
      evidence: {
        grade: "moderate",
        source: "case workflow review protocol",
        confidence: 0.74,
        note: "This recommendation reflects a standard safety-first review pattern and should be verified by an expert before execution.",
        professionalGate: domain === "legal" ? "legal_review_required" : domain === "career" ? "specialist_review_required" : "none",
      },
      domain: domain === "spiritual" ? "spiritual" : domain === "career" ? "career" : domain === "legal" ? "legal" : domain === "relationship" ? "social" : "scientific",
      requiresReview: true,
    },
    {
      id: `${domain}-recommendation-2`,
      title: "Context-sensitive support",
      description: "Apply local context, personal constraints, and cultural expectations while keeping clinical or legal safeguards intact.",
      evidence: {
        grade: "preliminary",
        source: "user context + domain-specific guidance",
        confidence: 0.68,
        note: "Context matters, but this recommendation still requires human confirmation when risk or coercion is involved.",
        professionalGate: domain === "legal" ? "legal_review_required" : domain === "spiritual" ? "specialist_review_required" : "none",
      },
      domain: domain === "spiritual" ? "spiritual" : domain === "career" ? "career" : domain === "legal" ? "legal" : domain === "relationship" ? "social" : "scientific",
      requiresReview: true,
    },
  ];

  if (input && Object.keys(input).length === 0) {
    return records.slice(0, 1);
  }

  return records;
}

export const compact = <T>(items: (T | null | undefined | false)[]): T[] => items.filter(Boolean) as T[];
