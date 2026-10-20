/**
 * One person's health and wellbeing history in one place: requests and their reports, check-in
 * answers, bookings, foods and plants they shared, symptom checks and nutrition reports, newest
 * first, plus a short summary they can print or show a clinician.
 *
 * Only the person's own records are used; nothing here is inferred or diagnosed. The rules are
 * pure so the timeline is tested without a database (loaders are in ./index.ts).
 */
import type { WorkflowCase } from "@/server/cases/types";

export type TimelineKind = "request" | "report" | "check_in" | "booking" | "food_herb" | "symptom_check" | "nutrition_report";
export type TimelineTone = "neutral" | "good" | "warning" | "danger";

export interface TimelineEvent {
  id: string;
  at: string;
  kind: TimelineKind;
  title: string;
  detail?: string;
  href?: string;
  tone: TimelineTone;
}

export interface AnsweredCheckIn {
  id: string;
  caseId: string | null;
  bookingId: string | null;
  label: string;
  dayOffset: number;
  answeredAt: Date | string;
  helped: "yes" | "partly" | "no";
  sideEffects: string | null;
  comment: string | null;
}

export interface BookingEntry {
  id: string;
  serviceName: string;
  businessName: string;
  startsAt: Date | string;
  status: string;
}

export interface SymptomCheck {
  id: string;
  query: string;
  urgencyLevel: string;
  createdAt: Date | string;
}

export interface NutritionReport {
  id: string;
  generatedAt: Date | string;
}

type CaseRecord = Pick<WorkflowCase, "id" | "stage" | "createdAt" | "auditTrail" | "review" | "foodHerbNotes" | "consultation">;

const iso = (value: Date | string) => (value instanceof Date ? value.toISOString() : new Date(value).toISOString());
const shorten = (text: string, max = 120) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export function caseEvents(record: CaseRecord, label: string): TimelineEvent[] {
  const href = `/case/workflows/${record.id}`;
  const events: TimelineEvent[] = [{ id: `${record.id}:started`, at: record.createdAt, kind: "request", title: `Started a ${label} request`, href, tone: "neutral" }];
  const submitted = record.auditTrail.filter((event) => event.type === "submitted").pop();
  if (submitted) events.push({ id: `${record.id}:submitted`, at: submitted.at, kind: "request", title: `Sent the ${label} request for review`, href, tone: "neutral" });
  if (record.stage === "crisis_routed") {
    events.push({ id: `${record.id}:support`, at: record.createdAt, kind: "request", title: "Urgent support was shared", detail: label, href, tone: "danger" });
  }
  if (record.review?.approvedAt) {
    events.push({ id: `${record.id}:report`, at: record.review.approvedAt, kind: "report", title: `${label} report ready`, href, tone: "good" });
  }
  for (const note of record.foodHerbNotes ?? []) {
    events.push({
      id: `${record.id}:food:${note.id}`,
      at: note.at,
      kind: "food_herb",
      title: note.kind === "herb" ? "Shared plants or herbs" : "Shared foods",
      detail: shorten(note.items.map((item) => item.name).join(", ")),
      href,
      tone: "neutral",
    });
  }
  return events;
}

export function checkInEvents(rows: AnsweredCheckIn[]): TimelineEvent[] {
  return rows.map((row) => ({
    id: `checkin:${row.id}`,
    at: iso(row.answeredAt),
    kind: "check_in" as const,
    title: row.helped === "yes" ? `${row.label}: it helped` : row.helped === "partly" ? `${row.label}: it helped partly` : `${row.label}: it did not help`,
    detail: [row.sideEffects ? `Side effects: ${row.sideEffects}` : "", row.comment ?? ""].filter(Boolean).join(" · ") || `Day ${row.dayOffset} check-in`,
    href: row.caseId ? `/case/workflows/${row.caseId}` : row.bookingId ? `/account/bookings/${row.bookingId}` : undefined,
    tone: row.sideEffects || row.helped === "no" ? "warning" : row.helped === "yes" ? "good" : "neutral",
  }));
}

export function bookingEvents(rows: BookingEntry[]): TimelineEvent[] {
  return rows
    .filter((row) => row.status === "completed" || row.status === "confirmed" || row.status === "requested")
    .map((row) => ({
      id: `booking:${row.id}`,
      at: iso(row.startsAt),
      kind: "booking" as const,
      title: row.status === "completed" ? `Session: ${row.serviceName}` : `Booked: ${row.serviceName}`,
      detail: row.businessName,
      href: `/account/bookings/${row.id}`,
      tone: "neutral" as const,
    }));
}

export function symptomCheckEvents(rows: SymptomCheck[]): TimelineEvent[] {
  return rows.map((row) => ({
    id: `symptom:${row.id}`,
    at: iso(row.createdAt),
    kind: "symptom_check" as const,
    title: "Symptom check",
    detail: shorten(row.query),
    href: "/diagnostic",
    tone: row.urgencyLevel === "critical" || row.urgencyLevel === "high" ? "danger" : row.urgencyLevel === "medium" ? "warning" : "neutral",
  }));
}

export function nutritionReportEvents(rows: NutritionReport[]): TimelineEvent[] {
  return rows.map((row) => ({ id: `nutrition:${row.id}`, at: iso(row.generatedAt), kind: "nutrition_report" as const, title: "Nutrition report", href: `/report/${row.id}`, tone: "neutral" as const }));
}

/** All events, newest first. */
export function mergeTimeline(...groups: TimelineEvent[][]): TimelineEvent[] {
  return groups.flat().sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id));
}

const SCORE = { yes: 1, partly: 0.5, no: 0 } as const;

export interface OutcomeTrend {
  answered: number;
  /** 0–100, "partly" counting half; null without answers. */
  helpedRate: number | null;
  /** The two most recent answers against the ones before them. */
  direction: "improving" | "steady" | "worse" | "unknown";
  sideEffects: number;
}

export function outcomeTrend(rows: AnsweredCheckIn[]): OutcomeTrend {
  const ordered = [...rows].sort((a, b) => iso(a.answeredAt).localeCompare(iso(b.answeredAt)));
  const scores = ordered.map((row) => SCORE[row.helped]);
  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  let direction: OutcomeTrend["direction"] = "unknown";
  if (scores.length >= 3) {
    const recent = mean(scores.slice(-2));
    const before = mean(scores.slice(0, -2));
    direction = recent - before > 0.25 ? "improving" : before - recent > 0.25 ? "worse" : "steady";
  }
  return {
    answered: rows.length,
    helpedRate: scores.length ? Math.round(mean(scores) * 100) : null,
    direction,
    sideEffects: rows.filter((row) => row.sideEffects).length,
  };
}

export interface ClinicianSummary {
  openRequests: Array<{ label: string; stage: string; since: string }>;
  reports: Array<{ label: string; at: string }>;
  sideEffects: Array<{ label: string; text: string; at: string }>;
  foodsAndPlants: string[];
  outcome: OutcomeTrend;
}

const OPEN_STAGES = new Set(["intake", "referred", "awaiting_expert", "in_review", "crisis_routed"]);

/** What a person may want to show a clinician: only what they entered or were sent, no conclusions. */
export function clinicianSummary(cases: Array<CaseRecord & { label: string }>, checkIns: AnsweredCheckIn[]): ClinicianSummary {
  const names = new Set<string>();
  for (const record of cases) for (const note of record.foodHerbNotes ?? []) for (const item of note.items) names.add(item.name);
  return {
    openRequests: cases.filter((record) => OPEN_STAGES.has(record.stage)).map((record) => ({ label: record.label, stage: record.stage, since: record.createdAt })),
    reports: cases.filter((record) => record.review?.approvedAt).map((record) => ({ label: record.label, at: record.review!.approvedAt! })),
    sideEffects: checkIns.filter((row) => row.sideEffects).map((row) => ({ label: row.label, text: row.sideEffects!, at: iso(row.answeredAt) })),
    foodsAndPlants: [...names].sort((a, b) => a.localeCompare(b)),
    outcome: outcomeTrend(checkIns),
  };
}
