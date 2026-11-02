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
    <div className={`glass-panel p-5 rounded-2xl border border-border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold tracking-wider uppercase text-brand flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          {locale === "am" ? "የጉዳይ ክትትል ሁኔታ" : "Case Lifecycle Timeline"}
        </h4>
        {currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger-strong border border-danger/40 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-danger" />
            {locale === "am" ? "በደህንነት በር ታግዷል" : "Blocked by Safety Gate"}
          </span>
        ) : currentStatus === CaseStatus.PUBLISHED ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand/20 text-brand-strong border border-brand/40">
            <CheckCircle className="w-3.5 h-3.5 text-brand" />
            {locale === "am" ? "ይፋ ተደርጓል" : "Published to Patient"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold/20 text-gold-strong border border-gold/40">
            <Clock className="w-3.5 h-3.5 text-gold" />
            {locale === "am" ? "በግምገማ ላይ" : "Under Active Review"}
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className="relative flex items-center justify-between mt-2">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-foreground/10 z-0 rounded-full" />
        <div
          className={`absolute top-1/2 left-0 -translate-y-1/2 h-1 rounded-full transition-all duration-700 z-0 ${
            currentStatus === CaseStatus.BLOCKED_BY_SAFETY_GATE
              ? "bg-danger"
              : "bg-gradient-to-r from-brand via-brand to-gold-fill"
          }`}
          style={{ width: `${Math.min(100, Math.max(10, (currentIndex / 4) * 100))}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = currentIndex > idx;
          const isCurrent = Math.floor(currentIndex) === idx;
          const Icon = step.icon;

          let badgeColor = "bg-card border-border-strong text-muted-foreground";
          if (step.isBlocked) {
            badgeColor = "bg-danger-soft border-danger text-danger-strong ring-4 ring-danger/20";
          } else if (isCurrent) {
            badgeColor = "bg-gold-soft border-gold text-gold-strong ring-4 ring-gold/20 animate-pulse";
          } else if (isDone) {
            badgeColor = "bg-brand-soft border-brand text-brand-strong";
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
                    ? "text-gold-strong font-semibold"
                    : isDone
                    ? "text-soft"
                    : "text-subtle"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {hasOverride && (
        <div className="mt-4 p-2.5 rounded-lg bg-brand/10 border border-brand/20 flex items-center gap-2 text-xs text-brand-strong">
          <CheckCircle className="w-4 h-4 shrink-0 text-brand" />
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
