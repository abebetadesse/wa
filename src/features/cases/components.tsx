"use client";

import { useState } from "react";
import {
  Activity,
  BookOpen,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  ClipboardList,
  Clock,
  FileText,
  Lock,
  Phone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { OwnerView } from "@/server/cases/views";
import type { WorkflowQuestion } from "@/server/cases/types";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle, ChoiceGroup, Field, Input, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

// ── Questions ────────────────────────────────────────────────────────────────

export function isApplicable(question: WorkflowQuestion, answers: Record<string, unknown>) {
  if (!question.dependsOn) return true;
  const actual = answers[question.dependsOn.questionId];
  const values = Array.isArray(actual) ? actual.map(String) : [String(actual ?? "")];
  const expected = question.dependsOn.value;
  return (Array.isArray(expected) ? expected : [expected]).some((value) => values.includes(value));
}

export function QuestionField({
  question,
  value,
  onChange,
  error,
}: {
  question: WorkflowQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string | null;
}) {
  const label = (
    <>
      {question.text}
      {question.textAmharic && <span lang="am" className="mt-0.5 block font-geez text-xs font-normal text-muted-foreground">{question.textAmharic}</span>}
    </>
  );
  const options = question.options ?? [];

  if ((question.type === "radio" || question.type === "select") && options.length > 0 && options.length <= 6) {
    return (
      <div className="flex flex-col gap-1">
        <ChoiceGroup
          name={question.id}
          legend={question.text}
          options={options.map((option) => ({ value: option.value, label: option.label }))}
          value={typeof value === "string" ? value : undefined}
          onChange={onChange}
          required={question.required}
        />
        {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <Field label={label} hint={question.hint} error={error} required={question.required}>
      {(control) => {
        if (options.length) {
          return (
            <Select {...control} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)}>
              <option value="">Choose…</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          );
        }
        if (question.type === "textarea") {
          return <Textarea {...control} value={typeof value === "string" ? value : ""} placeholder={question.placeholder} onChange={(event) => onChange(event.target.value)} />;
        }
        if (question.type === "scale" || question.type === "slider" || question.type === "number") {
          return <Input {...control} type="number" inputMode="numeric" value={value === undefined ? "" : String(value)} onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))} />;
        }
        return (
          <Input
            {...control}
            type={question.type === "date" ? "date" : "text"}
            lang={question.type === "name_geez" ? "am" : undefined}
            className={question.type === "name_geez" ? "font-geez text-base" : undefined}
            value={typeof value === "string" ? value : ""}
            placeholder={question.placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        );
      }}
    </Field>
  );
}

// ── Safety support ───────────────────────────────────────────────────────────

export function SupportPanel({ safety }: { safety: OwnerView["safety"] }) {
  if (!safety.support) return null;
  const { support } = safety;
  const urgent = safety.action === "crisis_route";
  const confidence = safety.confidence ? Math.round(safety.confidence * 100) : null;
  return (
    <section
      aria-labelledby="support-title"
      className={cn("rounded-2xl border p-5", urgent ? "border-danger/40 bg-danger/10" : "border-warning/40 bg-warning/10")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="support-title" className="font-display text-lg font-bold text-foreground">{support.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{support.message}</p>
        </div>
        {confidence !== null && (
          <Badge tone={urgent ? "danger" : "warning"}>Risk confidence {confidence}%</Badge>
        )}
      </div>
      {(safety.reason || safety.reasonCode) && (
        <div className="mt-3 rounded-xl border border-border/80 bg-background/60 p-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Reason:</span> {safety.reason ?? safety.reasonCode}
        </div>
      )}
      {support.hotlines.length > 0 && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {support.hotlines.map((line) => (
            <li key={line.name}>
              <a
                href={`tel:${line.number.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Phone className="size-4 text-brand" aria-hidden="true" />
                <span className="flex flex-col">
                  <span className="font-semibold text-foreground">{line.number}</span>
                  <span className="text-xs text-muted-foreground">{line.name}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {support.steps.length > 0 && (
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-foreground">
          {support.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      )}
      {support.resources && support.resources.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {support.resources.map((resource) => <li key={resource}>{resource}</li>)}
        </ul>
      )}
    </section>
  );
}

// ── Care Pathway ─────────────────────────────────────────────────────────────

interface PathwayStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const PATHWAY_STEPS: PathwayStep[] = [
  { id: "intake", label: "Your answers", description: "Share your situation so your reviewer understands your needs.", icon: ClipboardList },
  { id: "review", label: "Expert review", description: "A verified practitioner reads your case and prepares your report.", icon: Users },
  { id: "report", label: "Report ready", description: "Unlock and read your personalised, reviewed report.", icon: FileText },
  { id: "consult", label: "Consultation", description: "Book a follow-up with your practitioner if you need more support.", icon: CalendarClock },
];

function pathwayStepIndex(stage: OwnerView["stage"]) {
  switch (stage) {
    case "intake":
    case "referred":
      return 0;
    case "awaiting_expert":
    case "in_review":
      return 1;
    case "visible_to_user":
      return 2;
    case "full_report_released":
      return 2;
    case "consultation_requested":
      return 3;
    default:
      return 0;
  }
}

export function CarePathway({ stage }: { stage: OwnerView["stage"] }) {
  if (stage === "crisis_routed") return null;
  const current = pathwayStepIndex(stage);
  const isComplete = stage === "consultation_requested";

  return (
    <nav aria-label="Care pathway">
      {/* Mobile: compact bar */}
      <ol className="flex items-center gap-1 sm:hidden">
        {PATHWAY_STEPS.map((step, index) => {
          const done = index < current || isComplete;
          const active = index === current && !isComplete;
          return (
            <li key={step.id} className="flex flex-1 flex-col gap-1.5">
              <span className={cn("h-1 rounded-full transition-colors", done || (active && index > 0) ? "bg-brand" : active ? "bg-brand/60" : "bg-border")} />
              <span className={cn("text-[10px] font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Desktop: rich stepper */}
      <ol className="hidden sm:grid sm:grid-cols-4 sm:gap-3">
        {PATHWAY_STEPS.map((step, index) => {
          const done = index < current || isComplete;
          const active = index === current && !isComplete;
          const Icon = step.icon;
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={cn(
                "rounded-2xl border p-4 transition-colors",
                done ? "border-brand/30 bg-brand/5" : active ? "border-brand/50 bg-brand/10" : "border-border bg-background"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", done ? "bg-brand text-background" : active ? "border-2 border-brand bg-transparent" : "border border-border bg-muted")}>
                  {done ? <Check className="size-4" aria-hidden="true" /> : <Icon className={cn("size-3.5", active ? "text-brand" : "text-muted-foreground")} aria-hidden="true" />}
                </span>
                <span className={cn("text-sm font-semibold", active ? "text-foreground" : done ? "text-brand" : "text-muted-foreground")}>
                  {step.label}
                </span>
              </div>
              {(active || done) && (
                <p className={cn("mt-2 text-xs leading-relaxed", done ? "text-muted-foreground" : "text-foreground/80")}>
                  {step.description}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Backwards-compatible export */
export function StageProgress({ stage }: { stage: OwnerView["stage"] }) {
  return <CarePathway stage={stage} />;
}

// ── What happens next ─────────────────────────────────────────────────────────

const NEXT_STEP_CONTENT: Partial<Record<OwnerView["stage"], { icon: React.ElementType; title: string; body: string; tone: string }>> = {
  intake: {
    icon: ClipboardList,
    title: "Complete your answers and submit",
    body: "Answer all required questions and click 'Submit for expert review'. You can save your progress and return at any time.",
    tone: "border-brand/30 bg-brand/5",
  },
  referred: {
    icon: Activity,
    title: "Additional support recommended",
    body: "Based on your answers, we recommend contacting a support service first. You can still continue with your case answers once you are safe.",
    tone: "border-warning/30 bg-warning/5",
  },
  awaiting_expert: {
    icon: Clock,
    title: "Your case is in the queue",
    body: "A verified practitioner will claim your case and begin the review. You can close this page — we will notify you when the report is ready.",
    tone: "border-brand/30 bg-brand/5",
  },
  in_review: {
    icon: Users,
    title: "Being reviewed right now",
    body: "Your reviewer is reading your answers and preparing your personalised report. This usually takes 24–48 hours.",
    tone: "border-brand/40 bg-brand/8",
  },
  visible_to_user: {
    icon: FileText,
    title: "Your report is ready — unlock to read it all",
    body: "A one-time payment unlocks every section, including the detailed recommendations and cultural reflection. After unlocking you can book a follow-up consultation.",
    tone: "border-success/30 bg-success/5",
  },
  full_report_released: {
    icon: CalendarClock,
    title: "Book a follow-up consultation (optional)",
    body: "Now that you have the full report, you can book a session with your practitioner to go through it together.",
    tone: "border-success/30 bg-success/5",
  },
  consultation_requested: {
    icon: CalendarClock,
    title: "Consultation request sent",
    body: "Your practitioner will confirm a time from your suggested slots. Keep an eye on your notifications.",
    tone: "border-gold/30 bg-gold/5",
  },
};

export function WhatHappensNext({ stage }: { stage: OwnerView["stage"] }) {
  if (stage === "crisis_routed") return null;
  const content = NEXT_STEP_CONTENT[stage];
  if (!content) return null;
  const Icon = content.icon;
  return (
    <div className={cn("rounded-2xl border p-4", content.tone)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-foreground/70" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">{content.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{content.body}</p>
        </div>
      </div>
    </div>
  );
}

// ── Review status ────────────────────────────────────────────────────────────

export function ReviewStatus({ review }: { review: NonNullable<OwnerView["review"]> }) {
  if (review.status === "approved") return null;
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <Clock className="mt-1 size-6 text-brand" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-display font-bold text-foreground">
            {review.status === "queued" ? `Waiting for ${review.assignedRole ?? "an available expert"}` : `Being reviewed${review.expert?.name ? ` by ${review.expert.name}` : review.assignedRole ? ` by ${review.assignedRole}` : ""}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {review.status === "queued"
              ? "Your request is in the review queue. You can close this page and return later; we will notify you when a response is ready."
              : "Your report is being checked by the assigned reviewer before it is shared with you."}
          </p>
          {review.status === "in_review" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="brand">
                <span className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-brand-foreground" />
                In review
              </Badge>
              <span className="text-xs text-muted-foreground self-center">Typical turnaround: 24–48 hours</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Answers summary ───────────────────────────────────────────────────────────

export function AnswersSummary({
  answers,
  questions,
}: {
  answers: Record<string, unknown>;
  questions: { id: string; text: string; options?: { value: string; label: string }[] }[];
}) {
  const [open, setOpen] = useState(false);
  const pairs = questions
    .map((q) => {
      const raw = answers[q.id];
      if (raw === undefined || raw === null || raw === "") return null;
      const label = q.options?.find((o) => o.value === String(raw))?.label ?? String(raw);
      return { id: q.id, question: q.text, answer: label };
    })
    .filter(Boolean) as { id: string; question: string; answer: string }[];

  if (pairs.length === 0) return null;

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-semibold text-foreground">Your submitted answers</span>
          <Badge tone="neutral">{pairs.length}</Badge>
        </div>
        {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {open && (
        <CardContent className="flex flex-col gap-3 border-t border-border pt-4">
          {pairs.map(({ id, question, answer }) => (
            <div key={id} className="grid gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{question}</dt>
              <dd className="text-sm text-foreground">{answer}</dd>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// ── Care action plan ─────────────────────────────────────────────────────────

interface CareAction {
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  tone: string;
  badgeTone: "neutral" | "brand" | "gold" | "success" | "warning" | "danger";
}

const SHARED_CARE_ACTIONS: CareAction[] = [
  {
    icon: BookOpen,
    label: "Keep a journal",
    title: "Track your progress",
    description: "Write down how things change week by week. Bringing notes to a consultation helps your practitioner understand your journey.",
    tone: "border-brand/25 bg-brand/5",
    badgeTone: "brand",
  },
  {
    icon: Users,
    label: "Trusted support",
    title: "Share with someone you trust",
    description: "Opening up to a trusted friend, family member, or community elder often helps clarify next steps and reduces isolation.",
    tone: "border-gold/25 bg-gold/5",
    badgeTone: "gold",
  },
  {
    icon: Activity,
    label: "Check back in",
    title: "Revisit in 4–6 weeks",
    description: "Return to this report after a month to see whether the situation has changed. Open a new case if you need a fresh assessment.",
    tone: "border-success/25 bg-success/5",
    badgeTone: "success",
  },
];

export function CareActionPlan({ domain }: { domain: string }) {
  const domainActions: Record<string, CareAction> = {
    career: {
      icon: Zap,
      label: "Next step",
      title: "Take one concrete vocation action this week",
      description: "Identify one action from your report — speaking to a mentor, updating a document, or exploring a course — and schedule it.",
      tone: "border-brand/25 bg-brand/5",
      badgeTone: "brand",
    },
    legal: {
      icon: Users,
      label: "Mediation",
      title: "Contact a community elder or mediator",
      description: "Reach out to a trusted elder (ሽማግሌ) or community mediator this week to open a channel for peaceful customary reconciliation.",
      tone: "border-gold/25 bg-gold/5",
      badgeTone: "gold",
    },
    relationship: {
      icon: Activity,
      label: "Communication",
      title: "Start one honest conversation",
      description: "Use gentle 'I feel…' language to open a low-pressure dialogue. Your report's communication steps can guide your pacing.",
      tone: "border-success/25 bg-success/5",
      badgeTone: "success",
    },
    social: {
      icon: Users,
      label: "Community",
      title: "Connect with a local support network",
      description: "Identify one community group, faith community, or mutual aid initiative recommended in your report and make first contact.",
      tone: "border-brand/25 bg-brand/5",
      badgeTone: "brand",
    },
    spiritual: {
      icon: BookOpen,
      label: "Practice",
      title: "Incorporate one spiritual reflection daily",
      description: "Choose one reflection, prayer, or calming ritual from your report's cultural section to practise for the next 21 days.",
      tone: "border-gold/25 bg-gold/5",
      badgeTone: "gold",
    },
  };

  const specific = domainActions[domain];
  const actions = specific ? [specific, ...SHARED_CARE_ACTIONS.filter((a) => a.label !== specific.label).slice(0, 2)] : SHARED_CARE_ACTIONS;

  return (
    <section aria-labelledby="care-plan-title" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 id="care-plan-title" className="font-display text-base font-bold text-foreground">
          Suggested care pathway actions
        </h3>
        <span className="text-xs text-muted-foreground">Actionable next steps</span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.label} className={cn("rounded-2xl border p-4 flex flex-col justify-between", action.tone)}>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-foreground/70" aria-hidden="true" />
                  <Badge tone={action.badgeTone}>{action.label}</Badge>
                </div>
                <p className="mt-2 font-semibold text-foreground text-sm">{action.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{action.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Evidence confidence bar ─────────────────────────────────────────────────

function EvidenceBar({ confidence, grade }: { confidence: number; grade: string }) {
  const percent = Math.round(confidence * 100);
  const color =
    grade === "strong" ? "bg-success"
      : grade === "moderate" ? "bg-warning"
        : grade === "preliminary" ? "bg-brand"
          : grade === "traditional" ? "bg-gold"
            : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="shrink-0 font-medium">Confidence</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${percent}%` }} />
      </div>
      <span className="shrink-0 tabular-nums font-semibold text-foreground">{percent}%</span>
    </div>
  );
}

// ── Report view ──────────────────────────────────────────────────────────────

type ReportTab = "overview" | "scientific" | "cultural" | "recommendations";

export function ReportView({ report, review }: { report: NonNullable<OwnerView["report"]>; review: OwnerView["review"] }) {
  const [tab, setTab] = useState<ReportTab>("overview");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const scientificSections = report.sections.filter((s) => !s.cultural);
  const culturalSections = report.sections.filter((s) => s.cultural);
  const hasRecommendations = (report.recommendations?.length ?? 0) > 0;

  function toggleSection(id: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const tabs: { id: ReportTab; label: string; count?: number }[] = [
    { id: "overview", label: "Summary" },
    { id: "scientific", label: "Findings", count: scientificSections.length || undefined },
    { id: "cultural", label: "Cultural reflection", count: culturalSections.length || undefined },
    { id: "recommendations", label: "Actions", count: report.recommendations?.length || undefined },
  ];

  return (
    <article className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={report.unlocked ? "success" : "brand"}>{report.unlocked ? "Full report" : "Preview"}</Badge>
          {report.aiAssisted && <Badge tone="neutral"><Sparkles className="size-3" aria-hidden="true" /> AI-assisted draft</Badge>}
          {review?.expert?.name && (
            <Badge tone="neutral">Reviewed by {review.expert.name}{review.expert.credential ? `, ${review.expert.credential}` : ""}</Badge>
          )}
        </div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">{report.title}</h2>
        <p className="text-muted-foreground">{report.summary}</p>
      </header>

      {/* Reviewer notes */}
      {review?.notes && (
        <Alert tone="info" title="Note from your reviewer">{review.notes}</Alert>
      )}

      {/* Expert sign-off checklist */}
      {review?.checklist && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Expert sign-off checklist</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-foreground">
            {Object.entries(review.checklist).map(([id, checked]) => (
              <div key={id} className="flex items-center gap-2">
                {checked ? <Check className="size-4 text-brand" aria-hidden="true" /> : <Circle className="size-4 text-muted-foreground" aria-hidden="true" />}
                <span>{id.replace(/_/g, " ")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tab bar */}
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1" aria-label="Report sections">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-selected={tab === id}
            role="tab"
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {count !== undefined && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums", tab === id ? "bg-brand text-background" : "bg-border text-muted-foreground")}>
                {count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div role="tabpanel">
        {/* Summary tab */}
        {tab === "overview" && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground leading-relaxed">
              <p>{report.summary}</p>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Report type</dt>
                  <dd className="mt-1 text-foreground font-medium">{report.aiAssisted ? "AI-assisted, human-reviewed" : "Human-reviewed"}</dd>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sections</dt>
                  <dd className="mt-1 text-foreground font-medium">{report.sections.length} total · {scientificSections.length} findings · {culturalSections.length} cultural</dd>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</dt>
                  <dd className="mt-1 text-foreground font-medium">{hasRecommendations ? `${report.recommendations!.length} recommendations` : "No structured recommendations"}</dd>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</dt>
                  <dd className="mt-1 text-foreground font-medium">{report.unlocked ? "Full report unlocked" : "Preview — locked sections hidden"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Findings tab (scientific/domain A sections) */}
        {tab === "scientific" && (
          <div className="flex flex-col gap-3">
            {scientificSections.length === 0 && (
              <p className="text-sm text-muted-foreground px-1 py-4">No Domain A findings in this report.</p>
            )}
            {scientificSections.map((section) =>
              section.locked && !report.unlocked ? (
                <div key={section.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  <Lock className="size-4" aria-hidden="true" />
                  <span className="font-medium text-foreground">{section.title}</span>
                  <span className="ml-auto text-xs">Included in the full report</span>
                </div>
              ) : (
                <SectionCard
                  key={section.id}
                  section={section}
                  collapsed={collapsedSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              )
            )}
          </div>
        )}

        {/* Cultural tab (domain B) */}
        {tab === "cultural" && (
          <div className="flex flex-col gap-3">
            {culturalSections.length === 0 && (
              <p className="text-sm text-muted-foreground px-1 py-4">No cultural reflection sections in this report.</p>
            )}
            {culturalSections.map((section) =>
              section.locked && !report.unlocked ? (
                <div key={section.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  <Lock className="size-4" aria-hidden="true" />
                  <span className="font-medium text-foreground">{section.title}</span>
                  <span className="ml-auto text-xs">Included in the full report</span>
                </div>
              ) : (
                <SectionCard
                  key={section.id}
                  section={section}
                  collapsed={collapsedSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              )
            )}
            <Alert tone="info" title="About cultural reflection">
              Cultural and spiritual content is reflective only. It does not establish medical, scientific, or legal facts, and represents one perspective among many.
            </Alert>
          </div>
        )}

        {/* Recommendations tab */}
        {tab === "recommendations" && (
          <div className="flex flex-col gap-3">
            {!hasRecommendations && (
              <p className="text-sm text-muted-foreground px-1 py-4">No structured recommendations in this report.</p>
            )}
            {report.recommendations?.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={item.evidence.grade === "strong" ? "success" : item.evidence.grade === "moderate" ? "warning" : item.evidence.grade === "traditional" ? "gold" : "neutral"}>
                        {item.evidence.grade}
                      </Badge>
                      {item.evidence.professionalGate && item.evidence.professionalGate !== "none" && (
                        <Badge tone="danger">{item.evidence.professionalGate.replace(/_/g, " ")}</Badge>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-3 space-y-1.5">
                    <EvidenceBar confidence={item.evidence.confidence} grade={item.evidence.grade} />
                    <p className="text-xs text-muted-foreground">Source: {item.evidence.source}</p>
                    {item.evidence.note && <p className="text-xs text-muted-foreground">{item.evidence.note}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{report.disclaimer}</p>
    </article>
  );
}

// ── Section card (collapsible) ────────────────────────────────────────────────

function SectionCard({
  section,
  collapsed,
  onToggle,
}: {
  section: NonNullable<OwnerView["report"]>["sections"][number];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const hasContent = ("body" in section && section.body) || ("items" in section && section.items && section.items.length > 0);

  return (
    <Card className={cn(section.cultural && "border-gold/30")}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm">{section.title}</span>
          {section.cultural && <Badge tone="gold">Cultural reflection</Badge>}
        </div>
        {hasContent && (
          collapsed
            ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            : <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {!collapsed && hasContent && (
        <CardContent className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-foreground">
          {"body" in section && section.body && <p className="leading-relaxed">{section.body}</p>}
          {"items" in section && section.items && section.items.length > 0 && (
            <ul className="list-disc space-y-1.5 pl-5">
              {section.items.map((item) => (
                <li key={item} lang={/[ሀ-፿]/.test(item) ? "am" : undefined} className={/[ሀ-፿]/.test(item) ? "font-geez" : undefined}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}
