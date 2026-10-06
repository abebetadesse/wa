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
}

interface Queue {
  domains: WorkflowDomain[];
  waiting: CaseSummary[];
  inReview: CaseSummary[];
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
      <h2 className="text-lg font-semibold text-white">{title} <span className="text-sm text-slate-400">({items.length})</span></h2>
      {items.length === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-slate-400">Nothing here yet.</p> : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Link href={`/case-review/${item.id}`} className="min-w-[15rem] flex-1">
                <span className="block font-semibold text-white">{item.label}</span>
                <span className="block text-xs text-slate-400">{item.priority} priority · {item.concern ?? "No safety concern flagged"} · {new Date(item.createdAt).toLocaleString()}</span>
                <span className="block text-xs text-slate-500">Assigned role: {item.assignedRole ?? "expert pool"}</span>
              </Link>
              <Link href={`/case-review/${item.id}`} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10">Open request</Link>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <select aria-label={`Reassign ${item.label}`} value={selectedRoles[item.id] ?? item.assignedRole ?? "admin"} onChange={(event) => setSelectedRoles((current) => ({ ...current, [item.id]: event.target.value }))} className="max-w-40 rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-xs text-white">
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <button disabled={busyId === item.id} onClick={() => void reassign(item)} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Reassign</button>
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
          <h1 className="text-2xl font-bold text-white">Case request review</h1>
          <p className="mt-2 text-sm text-slate-400">Review assigned requests in the background queue. The user sees the response after you approve it.</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Refresh queue</button>
      </header>
      {isAdmin && <Link href="/admin/case-routing" className="text-sm text-emerald-300 hover:underline">Configure default case-type routing</Link>}
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>}
      {!queue && !error && <p className="text-sm text-slate-400">Loading requests…</p>}
      {queue && <>{section("Waiting", queue.waiting)}{section("In review", queue.inReview)}</>}
    </main>
  );
}
