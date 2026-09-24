"use client";

import { Check, Circle, Clock, Lock, Phone, Sparkles } from "lucide-react";
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

// ── Progress ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "intake", label: "Your answers" },
  { id: "review", label: "Expert review" },
  { id: "report", label: "Report" },
  { id: "consult", label: "Consultation" },
] as const;

function stepIndex(stage: OwnerView["stage"]) {
  switch (stage) {
    case "intake":
    case "referred":
      return 0;
    case "awaiting_expert":
    case "in_review":
      return 1;
    case "visible_to_user":
    case "full_report_released":
      return 2;
    case "consultation_requested":
      return 3;
    default:
      return 0;
  }
}

export function StageProgress({ stage }: { stage: OwnerView["stage"] }) {
  if (stage === "crisis_routed") return null;
  const current = stepIndex(stage);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Case progress">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.id} className="flex flex-col gap-2" aria-current={active ? "step" : undefined}>
            <span className={cn("h-1.5 rounded-full", done ? "bg-brand" : active ? "bg-brand/60" : "bg-border")} />
            <span className={cn("flex items-center gap-1 text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
              {done ? <Check className="size-3.5 text-brand" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
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
            {review.status === "queued" ? "Waiting for an available expert" : `Being reviewed${review.expert?.name ? ` by ${review.expert.name}` : ""}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {review.status === "queued"
              ? "Your answers are saved. A verified practitioner will pick up your case; you can close this page and come back any time."
              : "Your report is being checked by a human practitioner before it is shared with you."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Report ───────────────────────────────────────────────────────────────────

export function ReportView({ report, review }: { report: NonNullable<OwnerView["report"]>; review: OwnerView["review"] }) {
  return (
    <article className="flex flex-col gap-4">
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

      {review?.notes && (
        <Alert tone="info" title="Note from your reviewer">{review.notes}</Alert>
      )}

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

      {report.recommendations && report.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Evidence-guided recommendations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {report.recommendations.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-foreground">{item.title}</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={item.evidence.grade === "strong" ? "success" : item.evidence.grade === "moderate" ? "warning" : "neutral"}>
                      {item.evidence.grade}
                    </Badge>
                    {item.evidence.professionalGate && item.evidence.professionalGate !== "none" && (
                      <Badge tone="danger">{item.evidence.professionalGate.replace(/_/g, " ")}</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">Source: {item.evidence.source} · Confidence: {Math.round(item.evidence.confidence * 100)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.evidence.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {report.sections.map((section) =>
        section.locked && !report.unlocked ? (
          <div key={section.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
            <span className="font-medium text-foreground">{section.title}</span>
            <span className="ml-auto text-xs">Included in the full report</span>
          </div>
        ) : (
          <Card key={section.id} className={cn(section.cultural && "border-gold/30")}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{section.title}</CardTitle>
                {section.cultural && <Badge tone="gold">Cultural reflection</Badge>}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-foreground">
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
          </Card>
        ),
      )}

      <p className="text-xs text-muted-foreground">{report.disclaimer}</p>
    </article>
  );
}
