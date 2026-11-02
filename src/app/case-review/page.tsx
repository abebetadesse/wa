"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/session/SessionProvider";
import { apiFetch, errorMessage } from "@/lib/api/client";
import type { WorkflowDomain } from "@/server/cases/types";

interface CaseSummary {
  id: string;
  domain: WorkflowDomain;
  label: string;
  stage: string;
  priority: "urgent" | "high" | "routine";
  concern: string | null;
  assignedRole: string | null;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
  triage: { submittedAt: string; waitingHours: number; targetHours: number; dueAt: string; used: number; status: "on_track" | "due_soon" | "overdue" };
}

interface ReplyTemplate {
  id: string;
  title: string;
  body: string;
  kind: "message" | "question";
}

interface Queue {
  domains: WorkflowDomain[];
  waiting: CaseSummary[];
  inReview: CaseSummary[];
  stats: { waiting: number; inReview: number; overdue: number; dueSoon: number; oldestWaitingHours: number | null };
  workload: Array<{ reviewerId: string; name: string | null; inReview: number; overdue: number }>;
  targets: { urgent: number; high: number; routine: number };
  templates: ReplyTemplate[];
}

const STATUS_STYLE: Record<CaseSummary["triage"]["status"], { label: string; className: string }> = {
  overdue: { label: "Overdue", className: "border-danger/50 bg-danger-soft text-danger-strong" },
  due_soon: { label: "Due soon", className: "border-gold/50 bg-gold-soft text-gold-strong" },
  on_track: { label: "On track", className: "border-brand/40 bg-brand-soft text-brand-strong" },
};

const hours = (value: number) => (value < 1 ? `${Math.round(value * 60)} min` : `${Math.round(value * 10) / 10} h`);

/** Administrators set the response targets and the reply templates reviewers can insert. */
function DeskSettings({ targets, templates, onSaved }: { targets: Queue["targets"]; templates: ReplyTemplate[]; onSaved: () => void }) {
  const [draftTargets, setDraftTargets] = useState(targets);
  const [draftTemplates, setDraftTemplates] = useState(templates);
  const [status, setStatus] = useState("");
  const field = "rounded-lg border border-border bg-card px-2 py-2 text-sm text-foreground";

  async function save() {
    setStatus("");
    try {
      await apiFetch("/api/admin/settings/reviewDesk", { method: "PUT", json: { value: { targets: draftTargets, templates: draftTemplates } } });
      setStatus("Saved.");
      onSaved();
    } catch (cause) {
      setStatus(errorMessage(cause));
    }
  }

  const update = (index: number, patch: Partial<ReplyTemplate>) =>
    setDraftTemplates((current) => current.map((template, at) => (at === index ? { ...template, ...patch } : template)));

  return (
    <details className="rounded-xl border border-border bg-foreground/[0.03] p-4">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">Desk settings: response targets and reply templates</summary>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {(["urgent", "high", "routine"] as const).map((priority) => (
            <label key={priority} className="flex flex-col gap-1 text-xs text-soft">
              {priority} (hours)
              <input type="number" min={1} max={720} value={draftTargets[priority]} onChange={(event) => setDraftTargets((current) => ({ ...current, [priority]: Number(event.target.value) }))} className={`${field} w-28`} />
            </label>
          ))}
        </div>
        <ol className="flex flex-col gap-3">
          {draftTemplates.map((template, index) => (
            <li key={template.id} className="grid gap-2 rounded-lg border border-border p-3">
              <div className="flex flex-wrap gap-2">
                <input aria-label="Template title" value={template.title} maxLength={80} onChange={(event) => update(index, { title: event.target.value })} className={`${field} min-w-0 flex-1`} />
                <select aria-label="Template kind" value={template.kind} onChange={(event) => update(index, { kind: event.target.value as ReplyTemplate["kind"] })} className={field}>
                  <option value="question">Question</option>
                  <option value="message">Message</option>
                </select>
                <button type="button" onClick={() => setDraftTemplates((current) => current.filter((_, at) => at !== index))} className="rounded-lg border border-border px-3 text-xs text-soft hover:bg-foreground/10">Remove</button>
              </div>
              <textarea aria-label="Template text" value={template.body} maxLength={2000} rows={2} onChange={(event) => update(index, { body: event.target.value })} className={field} />
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={draftTemplates.length >= 30} onClick={() => setDraftTemplates((current) => [...current, { id: `t-${Date.now().toString(36)}`, title: "New template", body: "", kind: "message" }])} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-soft hover:bg-foreground/10 disabled:opacity-50">Add template</button>
          <button type="button" onClick={() => void save()} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground">Save desk settings</button>
          {status && <span role="status" className="text-xs text-soft">{status}</span>}
        </div>
      </div>
    </details>
  );
}

interface RoutingDesk {
  roles: Array<{ name: string; description: string | null }>;
}

export default function CaseReviewQueuePage() {
  const { user } = useSession();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await apiFetch<Queue>("/api/expert/cases");
      setQueue(result);
      if (user?.role === "admin" || user?.role === "super_admin") {
        const desk = await apiFetch<RoutingDesk>("/api/admin/case-routing");
        setRoles(desk.roles.map((role) => role.name));
      }
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, [user?.role]);

  useEffect(() => { void load(); }, [load]);
  // Keep waiting times and target status current while the desk is open.
  useEffect(() => {
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  async function reassign(item: CaseSummary) {
    const role = selectedRoles[item.id];
    if (!role) return;
    setBusyId(item.id);
    setError("");
    try {
      await apiFetch(`/api/admin/case-routing/cases/${item.id}`, { method: "PATCH", json: { role } });
      await load();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusyId("");
    }
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const section = (title: string, items: CaseSummary[]) => (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title} <span className="text-sm text-muted-foreground">({items.length})</span></h2>
      {items.length === 0 ? <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">Nothing here yet.</p> : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-foreground/[0.03] p-4">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[item.triage.status].className}`}>{STATUS_STYLE[item.triage.status].label}</span>
              <Link href={`/case-review/${item.id}`} className="min-w-[15rem] flex-1">
                <span className="block font-semibold text-foreground">{item.label}</span>
                <span className="block text-xs text-soft">Waiting {hours(item.triage.waitingHours)} of a {item.triage.targetHours} h target</span>
                <span className="block text-xs text-muted-foreground">{item.priority} priority · {item.concern ?? "No safety concern flagged"} · {new Date(item.createdAt).toLocaleString()}</span>
                <span className="block text-xs text-subtle">Assigned role: {item.assignedRole ?? "expert pool"}</span>
              </Link>
              <Link href={`/case-review/${item.id}`} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-soft hover:bg-foreground/10">Open request</Link>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <select aria-label={`Reassign ${item.label}`} value={selectedRoles[item.id] ?? item.assignedRole ?? "admin"} onChange={(event) => setSelectedRoles((current) => ({ ...current, [item.id]: event.target.value }))} className="max-w-40 rounded-lg border border-border bg-card px-2 py-2 text-xs text-foreground">
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <button disabled={busyId === item.id} onClick={() => void reassign(item)} className="rounded-lg bg-gold-fill px-3 py-2 text-xs font-semibold text-gold-foreground disabled:opacity-50">Reassign</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-7 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Case request review</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review assigned requests in the background queue. The user sees the response after you approve it.</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg border border-border px-3 py-2 text-sm text-soft hover:bg-foreground/10">Refresh queue</button>
      </header>
      {isAdmin && <Link href="/admin/case-routing" className="text-sm text-brand hover:underline">Configure default case-type routing</Link>}
      {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger-strong">{error}</p>}
      {!queue && !error && <p className="text-sm text-muted-foreground">Loading requests…</p>}
      {queue && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Waiting", value: String(queue.stats.waiting), alert: false },
            { label: "In review", value: String(queue.stats.inReview), alert: false },
            { label: "Overdue", value: String(queue.stats.overdue), alert: queue.stats.overdue > 0 },
            { label: "Due soon", value: String(queue.stats.dueSoon), alert: queue.stats.dueSoon > 0 },
            { label: "Oldest wait", value: queue.stats.oldestWaitingHours === null ? "—" : hours(queue.stats.oldestWaitingHours), alert: false },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-foreground/[0.03] p-3">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className={`mt-1 text-xl font-bold ${stat.alert ? "text-gold" : "text-foreground"}`}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {queue && (
        <p className="text-xs text-subtle">
          Targets from submission to approval: urgent {queue.targets.urgent} h · high {queue.targets.high} h · routine {queue.targets.routine} h. Requests are ordered by priority, then by how much of their target has passed.
        </p>
      )}
      {queue && <>{section("Waiting", queue.waiting)}{section("In review", queue.inReview)}</>}
      {queue && isAdmin && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Reviewer workload</h2>
          {queue.workload.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests are being reviewed right now.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr><th className="py-1">Reviewer</th><th>In review</th><th>Overdue</th></tr>
              </thead>
              <tbody>
                {queue.workload.map((load) => (
                  <tr key={load.reviewerId} className="border-t border-border text-soft">
                    <td className="py-2">{load.name ?? load.reviewerId.slice(0, 8)}</td>
                    <td>{load.inReview}</td>
                    <td className={load.overdue ? "text-danger" : ""}>{load.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {queue && isAdmin && <DeskSettings targets={queue.targets} templates={queue.templates} onSaved={() => void load()} />}
    </main>
  );
}
