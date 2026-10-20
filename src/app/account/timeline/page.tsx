"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarCheck, ClipboardList, FileText, HeartPulse, Leaf, Printer, Stethoscope } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, ErrorState, LoadingState, PageHeader, PageShell } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ClinicianSummary, TimelineEvent, TimelineKind } from "@/server/timeline/timeline";

interface Timeline {
  events: TimelineEvent[];
  summary: ClinicianSummary;
}

const KINDS: Array<{ kind: TimelineKind; label: string; icon: typeof Activity }> = [
  { kind: "request", label: "Requests", icon: ClipboardList },
  { kind: "report", label: "Reports", icon: FileText },
  { kind: "check_in", label: "Check-ins", icon: HeartPulse },
  { kind: "booking", label: "Bookings", icon: CalendarCheck },
  { kind: "food_herb", label: "Foods and plants", icon: Leaf },
  { kind: "symptom_check", label: "Symptom checks", icon: Stethoscope },
  { kind: "nutrition_report", label: "Nutrition reports", icon: Activity },
];
const ICON = Object.fromEntries(KINDS.map((entry) => [entry.kind, entry.icon])) as Record<TimelineKind, typeof Activity>;
const TONE: Record<TimelineEvent["tone"], string> = {
  neutral: "border-border",
  good: "border-success/50",
  warning: "border-warning/60",
  danger: "border-danger/60",
};
const DIRECTION: Record<ClinicianSummary["outcome"]["direction"], string> = {
  improving: "Getting better",
  steady: "About the same",
  worse: "Getting worse",
  unknown: "Not enough answers yet",
};

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const month = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });

export default function TimelinePage() {
  const [data, setData] = useState<Timeline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<Set<TimelineKind>>(new Set(KINDS.map((entry) => entry.kind)));

  const load = () => {
    setError(null);
    apiFetch<Timeline>("/api/account/timeline").then(setData).catch((cause) => setError(errorMessage(cause)));
  };
  useEffect(load, []);

  const grouped = useMemo(() => {
    const groups: Array<{ month: string; events: TimelineEvent[] }> = [];
    for (const event of data?.events.filter((item) => shown.has(item.kind)) ?? []) {
      const key = month(event.at);
      const last = groups[groups.length - 1];
      if (last?.month === key) last.events.push(event);
      else groups.push({ month: key, events: [event] });
    }
    return groups;
  }, [data, shown]);

  if (error && !data) return <PageShell width="narrow"><ErrorState message={error} onRetry={load} /></PageShell>;
  if (!data) return <PageShell width="narrow"><LoadingState label="Loading your timeline…" /></PageShell>;

  const { summary } = data;
  const toggle = (kind: TimelineKind) =>
    setShown((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  return (
    <PageShell width="narrow">
      <PageHeader
        eyebrow="Your account"
        title="Your health timeline"
        description="Everything you have shared and received, newest first. Only you can see this page."
        actions={
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="size-4" aria-hidden="true" /> Print or save as PDF
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Summary to show a clinician</CardTitle>
          <CardDescription>Only what you entered and what reviewers sent you. It is not a diagnosis.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-foreground">How things have gone</h3>
            {summary.outcome.answered ? (
              <p className="mt-1 text-muted-foreground">
                {DIRECTION[summary.outcome.direction]} · helped in {summary.outcome.helpedRate}% of {summary.outcome.answered} check-ins
                {summary.outcome.sideEffects > 0 && ` · side effects reported ${summary.outcome.sideEffects} times`}
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">No check-in answers yet.</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Open requests</h3>
            {summary.openRequests.length ? (
              <ul className="mt-1 text-muted-foreground">
                {summary.openRequests.map((request) => <li key={`${request.label}-${request.since}`}>{request.label} · since {day(request.since)}</li>)}
              </ul>
            ) : (
              <p className="mt-1 text-muted-foreground">None.</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Reports received</h3>
            {summary.reports.length ? (
              <ul className="mt-1 text-muted-foreground">
                {summary.reports.map((report) => <li key={`${report.label}-${report.at}`}>{report.label} · {day(report.at)}</li>)}
              </ul>
            ) : (
              <p className="mt-1 text-muted-foreground">None yet.</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Side effects you reported</h3>
            {summary.sideEffects.length ? (
              <ul className="mt-1 text-muted-foreground">
                {summary.sideEffects.map((item) => <li key={`${item.at}-${item.text}`}>{day(item.at)} · {item.label}: {item.text}</li>)}
              </ul>
            ) : (
              <p className="mt-1 text-muted-foreground">None.</p>
            )}
          </div>
          {summary.foodsAndPlants.length > 0 && (
            <div className="sm:col-span-2">
              <h3 className="font-semibold text-foreground">Foods and plants you shared</h3>
              <p className="mt-1 text-muted-foreground" translate="no">{summary.foodsAndPlants.join(", ")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2 print:hidden" role="group" aria-label="Show on the timeline">
        {KINDS.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            aria-pressed={shown.has(kind)}
            onClick={() => toggle(kind)}
            className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", shown.has(kind) ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground")}
          >
            <Icon className="size-3.5" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Your requests, reports, check-ins and bookings will appear here." />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((group) => (
            <section key={group.month} aria-label={group.month}>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{group.month}</h2>
              <ol className="flex flex-col gap-2 border-l border-border pl-4">
                {group.events.map((event) => {
                  const Icon = ICON[event.kind];
                  const body = (
                    <>
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                        {event.title}
                        {event.tone === "danger" && <Badge tone="danger">Important</Badge>}
                      </span>
                      {event.detail && <span className="mt-0.5 block text-sm text-muted-foreground" translate={event.kind === "food_herb" || event.kind === "symptom_check" ? "no" : undefined}>{event.detail}</span>}
                      <span className="mt-0.5 block text-xs text-muted-foreground">{day(event.at)}</span>
                    </>
                  );
                  return (
                    <li key={event.id} className={cn("rounded-xl border bg-card px-3 py-2", TONE[event.tone])}>
                      {event.href ? <Link href={event.href} className="block hover:underline">{body}</Link> : body}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
