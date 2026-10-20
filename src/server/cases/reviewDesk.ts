/**
 * The review desk's working rules: how long a request may wait for each priority, which request
 * to pick up next, and how much each reviewer is carrying.
 *
 * Response targets come from Admin settings ("reviewDesk"), defaulting to 4 hours for urgent, 24
 * for high and 72 for routine requests, measured from submission until approval. A request is
 * "due soon" in the last quarter of its target and "overdue" after it. The queue is ordered by
 * priority first, then by how much of its target has been used, so nothing urgent sits behind a
 * routine request and the most overdue request of each priority comes first.
 */
import type { WorkflowCase } from "./types";

export type Priority = WorkflowCase["safety"]["priority"];
export type TargetStatus = "on_track" | "due_soon" | "overdue";

export interface ReviewTargets {
  urgent: number;
  high: number;
  routine: number;
}

export const DEFAULT_REVIEW_TARGETS: ReviewTargets = { urgent: 4, high: 24, routine: 72 };

export interface ReplyTemplate {
  id: string;
  title: string;
  body: string;
  kind: "message" | "question";
}

export const DEFAULT_REPLY_TEMPLATES: ReplyTemplate[] = [
  { id: "more-detail", title: "Ask for more detail", kind: "question", body: "Thank you for your request. To give you a useful answer, could you tell me a little more about when this started and what you have already tried?" },
  { id: "medicines", title: "Ask about medicines and herbs", kind: "question", body: "Are you taking any medicines, herbs or supplements at the moment, including traditional remedies? Please list them with how often you take them." },
  { id: "in-progress", title: "Review in progress", kind: "message", body: "I have started reviewing your request and will write to you here as soon as your report is ready." },
  { id: "see-clinic", title: "Please see a clinic", kind: "message", body: "Some of what you describe should be checked in person. Please visit your nearest health facility soon; this does not need to wait for your report." },
];

const HOUR = 60 * 60 * 1000;
const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, routine: 2 };

/** When the request reached the review queue: its latest submission, else when it was created. */
export function submittedAt(record: Pick<WorkflowCase, "createdAt" | "auditTrail">): string {
  const submissions = record.auditTrail.filter((event) => event.type === "submitted");
  return submissions.length ? submissions[submissions.length - 1].at : record.createdAt;
}

export interface Triage {
  submittedAt: string;
  waitingHours: number;
  targetHours: number;
  dueAt: string;
  /** Share of the target used so far: 1 means exactly at the target. */
  used: number;
  status: TargetStatus;
}

export function triage(record: Pick<WorkflowCase, "createdAt" | "auditTrail" | "safety">, now: Date, targets: ReviewTargets = DEFAULT_REVIEW_TARGETS): Triage {
  const since = submittedAt(record);
  const targetHours = targets[record.safety.priority] ?? targets.routine;
  const waitingHours = Math.max(0, (now.getTime() - Date.parse(since)) / HOUR);
  const used = targetHours > 0 ? waitingHours / targetHours : 0;
  return {
    submittedAt: since,
    waitingHours: Math.round(waitingHours * 10) / 10,
    targetHours,
    dueAt: new Date(Date.parse(since) + targetHours * HOUR).toISOString(),
    used: Math.round(used * 100) / 100,
    status: used >= 1 ? "overdue" : used >= 0.75 ? "due_soon" : "on_track",
  };
}

/** Next request to pick up first: higher priority, then more of its target used, then older. */
export function byTriage(now: Date, targets: ReviewTargets = DEFAULT_REVIEW_TARGETS) {
  return (a: Pick<WorkflowCase, "createdAt" | "auditTrail" | "safety">, b: Pick<WorkflowCase, "createdAt" | "auditTrail" | "safety">) =>
    PRIORITY_RANK[a.safety.priority] - PRIORITY_RANK[b.safety.priority] ||
    triage(b, now, targets).used - triage(a, now, targets).used ||
    submittedAt(a).localeCompare(submittedAt(b));
}

export interface DeskStats {
  waiting: number;
  inReview: number;
  overdue: number;
  dueSoon: number;
  /** Hours the oldest waiting request has waited; null when nothing waits. */
  oldestWaitingHours: number | null;
}

export function deskStats(waiting: Triage[], inReview: Triage[]): DeskStats {
  const all = [...waiting, ...inReview];
  return {
    waiting: waiting.length,
    inReview: inReview.length,
    overdue: all.filter((item) => item.status === "overdue").length,
    dueSoon: all.filter((item) => item.status === "due_soon").length,
    oldestWaitingHours: waiting.length ? Math.max(...waiting.map((item) => item.waitingHours)) : null,
  };
}

export interface ReviewerLoad {
  reviewerId: string;
  inReview: number;
  overdue: number;
}

/** Requests each reviewer has claimed and not yet approved, busiest first. */
export function workload(records: Array<Pick<WorkflowCase, "review" | "createdAt" | "auditTrail" | "safety">>, now: Date, targets: ReviewTargets = DEFAULT_REVIEW_TARGETS): ReviewerLoad[] {
  const loads = new Map<string, ReviewerLoad>();
  for (const record of records) {
    const reviewerId = record.review?.expertId;
    if (!reviewerId) continue;
    const load = loads.get(reviewerId) ?? { reviewerId, inReview: 0, overdue: 0 };
    load.inReview += 1;
    if (triage(record, now, targets).status === "overdue") load.overdue += 1;
    loads.set(reviewerId, load);
  }
  return [...loads.values()].sort((a, b) => b.inReview - a.inReview || b.overdue - a.overdue);
}
