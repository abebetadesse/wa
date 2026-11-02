"use client";

import React from "react";
import { CrisisScreenResult } from "@/lib/case-workflow/spiritualQuestionEngine";
import { EmergencyHelp } from "@/components/safety/EmergencyHelp";

export function CrisisAlertBanner({ crisis }: { crisis?: CrisisScreenResult }) {
  if (!crisis || !crisis.isCrisis || !crisis.crisisContent) {
    return null;
  }

  const { title, message, emergencyContacts, safetyPlanSteps } = crisis.crisisContent;

  return (
    <div className="my-6 p-6 rounded-3xl bg-danger-soft border-2 border-danger/80 shadow-raised  text-foreground animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-danger flex items-center justify-center text-2xl flex-shrink-0 shadow-panel">
          🛡️
        </div>
        <div className="space-y-2 flex-1">
          <div className="inline-block px-3 py-1 rounded-full bg-danger/30 text-danger-strong text-xs font-bold uppercase tracking-wider">
            Immediate Support & Safety Notice · Non-Gated
          </div>
          <h3 className="text-xl font-extrabold text-foreground">{title}</h3>
          <p className="text-sm text-danger-strong leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Verified emergency numbers only (none until verified; the steps below give guidance) */}
      <EmergencyHelp contacts={emergencyContacts} tone="dark" showGuidance={false} className="mt-5" />

      {/* Safety Steps */}
      {safetyPlanSteps && safetyPlanSteps.length > 0 && (
        <div className="mt-5 pt-4 border-t border-danger/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-danger-strong mb-2">
            Recommended Immediate Actions:
          </div>
          <ul className="space-y-1.5 text-xs text-danger-strong">
            {safetyPlanSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-danger font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-danger">
        Emergency resources are 100% free and strictly confidential. You do not need to pay or complete any intake to access help.
      </div>
    </div>
  );
}
