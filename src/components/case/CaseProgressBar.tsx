"use client";

import type { Phase } from "./types";

const PHASE_LABELS: Record<Phase, string> = {
  domain: "Choose Domain",
  challenge: "Select Challenge",
  specific: "Your Case",
  report: "Review Report",
  causes: "Refine Findings",
  solutions: "Choose Solutions",
  complete: "Complete",
};

interface CaseProgressBarProps {
  /** The current active phase */
  phase: Phase;
}

/**
 * Multi-step stepper showing the case intake workflow progress.
 * Marks completed phases with a checkmark and highlights the active phase with a ring.
 */
export function CaseProgressBar({ phase }: CaseProgressBarProps) {
  const phases = Object.keys(PHASE_LABELS) as Phase[];
  const stepIndex = phases.indexOf(phase);

  return (
    <nav aria-label="Case workflow progress" className="sci-fi-panel p-4 mb-8">
      <ol className="flex items-center gap-0 overflow-x-auto pb-1">
        {phases.map((key, index) => {
          const isCompleted = index < stepIndex;
          const isCurrent = index === stepIndex;
          return (
            <li key={key} className="flex items-center gap-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                    isCompleted
                      ? "bg-brand/20 border-brand/60 text-brand-strong"
                      : isCurrent
                      ? "bg-brand/30 border-brand text-brand-strong ring-2 ring-brand/40"
                      : "bg-foreground/5 border-border text-subtle"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </span>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isCompleted
                      ? "text-brand"
                      : isCurrent
                      ? "text-foreground"
                      : "text-subtle"
                  }`}
                >
                  {PHASE_LABELS[key]}
                </span>
              </div>
              {index < phases.length - 1 && (
                <span className="mx-2 text-subtle text-xs">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
