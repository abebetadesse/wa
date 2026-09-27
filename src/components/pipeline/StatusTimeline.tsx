"use client";

import React from "react";
import { CaseStatus } from "@/lib/pipeline/types";
import { getPipelineI18n } from "@/lib/i18n/pipeline";
import { AlertTriangle, CheckCircle, Clock, FileText, Send, ShieldAlert, ArrowRight } from "lucide-react";

interface StatusTimelineProps {
  currentStatus: CaseStatus;
  locale?: "am" | "en";
  hasOverride?: boolean;
  className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  locale = "am",
  hasOverride = false,
  className = "",
}) => {
  const i18n = getPipelineI18n(locale);

  // States sequence
  const steps = [
    { key: CaseStatus.SUBMITTED, label: i18n.statuses.SUBMITTED, icon: Send },
    { key: CaseStatus.EVALUATING, label: i18n.statuses.EVALUATING, icon: Clock },
    {
      key: currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE
        ? CaseStatus.BLOCKED_BY_SAFETY_GATE
        : CaseStatus.PENDING_PROFESSIONAL,
      label: currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE
        ? i18n.statuses.BLOCKED_BY_SAFETY_GATE
        : i18n.statuses.PENDING_PROFESSIONAL,
      icon: currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE ? ShieldAlert : AlertTriangle,
      isBlocked: currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE,
    },
    { key: CaseStatus.PENDING_ADMIN, label: i18n.statuses.PENDING_ADMIN, icon: FileText },
    { key: CaseStatus.PUBLISHED, label: i18n.statuses.PUBLISHED, icon: CheckCircle },
  ];

  // Map progress index
  const statusRank: Record<CaseStatus, number> = {
    [CaseStatus.REGISTERED]: -1,
    [CaseStatus.PROFILE_SUBMITTED]: -0.5,
    [CaseStatus.PRELIMINARY_ANALYSIS_READY]: -0.25,
    [CaseStatus.CASE_SUBMITTED]: 0,
    [CaseStatus.SUBMITTED]: 0,
    [CaseStatus.CASE_EVALUATING]: 1,
    [CaseStatus.EVALUATING]: 1,
    [CaseStatus.BLOCKED_BY_SAFETY_GATE]: 2,
    [CaseStatus.PENDING_PROFESSIONAL]: 2,
    [CaseStatus.PROFESSIONAL_RETURNED]: 1, // Sent back
    [CaseStatus.ADMIN_RETURNED]: 2.5,
    [CaseStatus.PENDING_ADMIN]: 3,
    [CaseStatus.APPROVED]: 3.5,
    [CaseStatus.PUBLISHED]: 4,
  };

  const currentIndex = statusRank[currentStatus] ?? 0;

  return (
    <div className={`glass-panel p-5 rounded-2xl border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold tracking-wider uppercase text-emerald-400/90 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {locale === "am" ? "የጉዳይ ክትትል ሁኔታ" : "Case Lifecycle Timeline"}
        </h4>
        {currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            {locale === "am" ? "በደህንነት በር ታግዷል" : "Blocked by Safety Gate"}
          </span>
        ) : currentStatus === CaseStatus.PUBLISHED ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            {locale === "am" ? "ይፋ ተደርጓል" : "Published to Patient"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {locale === "am" ? "በግምገማ ላይ" : "Under Active Review"}
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className="relative flex items-center justify-between mt-2">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-white/10 z-0 rounded-full" />
        <div
          className={`absolute top-1/2 left-0 -translate-y-1/2 h-1 rounded-full transition-all duration-700 z-0 ${
            currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE
              ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              : "bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"
          }`}
          style={{ width: `${Math.min(100, Math.max(10, (currentIndex / 4) * 100))}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = currentIndex > idx;
          const isCurrent = Math.floor(currentIndex) === idx;
          const Icon = step.icon;

          let badgeColor = "bg-slate-900 border-white/20 text-slate-400";
          if (step.isBlocked) {
            badgeColor = "bg-rose-950 border-rose-500 text-rose-300 ring-4 ring-rose-500/20";
          } else if (isCurrent) {
            badgeColor = "bg-amber-950 border-amber-400 text-amber-300 ring-4 ring-amber-400/20 animate-pulse";
          } else if (isDone) {
            badgeColor = "bg-emerald-950 border-emerald-400 text-emerald-300";
          }

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${badgeColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-[11px] text-center max-w-[90px] font-medium leading-tight ${
                  isCurrent
                    ? "text-amber-200 font-semibold"
                    : isDone
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {hasOverride && (
        <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            {locale === "am"
              ? "የደህንነት ደንብ ውሳኔ በክሊኒካል ባለሙያ ተሻሽሏል (Clinical Override Active)"
              : "Safety gate was successfully overridden with documented clinical justification."}
          </span>
        </div>
      )}
    </div>
  );
};
