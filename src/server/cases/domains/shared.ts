import { isBionicConfigured, synthesizeCaseReportAnalysis } from "@/lib/ai/bionicGPT";
import type { ReportSection, WorkflowQuestion } from "../types";

export const REPORT_DISCLAIMER =
  "This report is reflective, educational guidance prepared from your answers and reviewed by a practitioner. " +
  "It is not a diagnosis, legal ruling, financial or medical advice. Cultural and spiritual sections are offered " +
  "for reflection and never replace professional support.";

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
      data: { strengths: analysis.strengths, challenges: analysis.challenges, insights: analysis.sectorInsights },
    };
  } catch (error) {
    console.error(`[cases] AI synthesis failed for ${domain}:`, error);
    return null;
  }
}

export const compact = <T>(items: (T | null | undefined | false)[]): T[] => items.filter(Boolean) as T[];
