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
    <div className="my-6 p-6 rounded-3xl bg-rose-950/80 border-2 border-rose-500/80 shadow-2xl backdrop-blur-md text-white animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
          🛡️
        </div>
        <div className="space-y-2 flex-1">
          <div className="inline-block px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 text-xs font-bold uppercase tracking-wider">
            Immediate Support & Safety Notice · Non-Gated
          </div>
          <h3 className="text-xl font-extrabold text-white">{title}</h3>
          <p className="text-sm text-rose-100/90 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Verified emergency numbers only (none until verified; the steps below give guidance) */}
      <EmergencyHelp contacts={emergencyContacts} tone="dark" showGuidance={false} className="mt-5" />

      {/* Safety Steps */}
      {safetyPlanSteps && safetyPlanSteps.length > 0 && (
        <div className="mt-5 pt-4 border-t border-rose-500/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-200 mb-2">
            Recommended Immediate Actions:
          </div>
          <ul className="space-y-1.5 text-xs text-rose-100">
            {safetyPlanSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-rose-300/80">
        Emergency resources are 100% free and strictly confidential. You do not need to pay or complete any intake to access help.
      </div>
    </div>
  );
}
