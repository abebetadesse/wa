import { Gap } from "./types";

interface ExplanationCause {
  title: string;
  description: string;
  evidenceStrength: string;
  sourceRef: string;
}

interface ExplanationSolution {
  title: string;
  description: string;
  interactionChecked: string;
  sourceRef: string;
}

export interface ExplanationStep {
  label: string;
  detail: string;
  sourceRef?: string;
}

export interface GapExplanation {
  summary: string;
  steps: ExplanationStep[];
  disclaimer: string;
}

export function explainGap(
  gap: Gap,
  causes: ExplanationCause[] = [],
  solutions: ExplanationSolution[] = []
): GapExplanation {
  const direction = gap.gapType === "deficiency" ? "below" : "above";
  const summary = `${gap.nutrientName} is estimated at ${gap.estimatedIntakePct}% of the adjusted target, so the engine marked a ${gap.severity}-severity ${gap.gapType} pattern.`;
  const steps: ExplanationStep[] = [
    {
      label: "Observed intake",
      detail: `${gap.calculatedDailyIntake} ${gap.unit} per day compared with an adjusted target of ${gap.targetRda} ${gap.unit}.`,
      sourceRef: gap.sourceRef,
    },
    {
      label: "Threshold comparison",
      detail: `The estimated intake is ${direction} the personalized threshold used by the deterministic gap rule.`,
      sourceRef: gap.sourceRef,
    },
  ];

  for (const cause of causes) {
    steps.push({
      label: `Cause: ${cause.title}`,
      detail: `${cause.description} Evidence strength: ${cause.evidenceStrength}.`,
      sourceRef: cause.sourceRef,
    });
  }

  for (const solution of solutions.slice(0, 3)) {
    steps.push({
      label: `Next step: ${solution.title}`,
      detail: `${solution.description} Interaction status: ${solution.interactionChecked}.`,
      sourceRef: solution.sourceRef,
    });
  }

  return {
    summary,
    steps,
    disclaimer: "This is a trace of the app's rules and recorded evidence, not a diagnosis or prediction of disease.",
  };
}
