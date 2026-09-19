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
                      ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                      : isCurrent
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40"
                      : "bg-white/5 border-white/10 text-slate-600"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </span>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isCompleted
                      ? "text-emerald-400"
                      : isCurrent
                      ? "text-white"
                      : "text-slate-600"
                  }`}
                >
                  {PHASE_LABELS[key]}
                </span>
              </div>
              {index < phases.length - 1 && (
                <span className="mx-2 text-slate-700 text-xs">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
