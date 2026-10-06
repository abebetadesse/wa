"use client";

import { useCallback, useEffect, useState } from "react";
import { WORKFLOW_DOMAINS, type WorkflowDomain } from "@/server/cases/types";
import { apiFetch, errorMessage } from "@/lib/api/client";

const DOMAIN_LABELS: Record<WorkflowDomain, string> = {
  career: "Career",
  legal: "Legal",
  relationship: "Relationship",
  social: "Social",
  spiritual: "Spiritual",
};

interface RoutingDesk {
  settings: { domains: Record<WorkflowDomain, string> };
  roles: Array<{ name: string; description: string | null }>;
}

export default function CaseRoutingPage() {
  const [desk, setDesk] = useState<RoutingDesk | null>(null);
  const [domains, setDomains] = useState<Partial<Record<WorkflowDomain, string>>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await apiFetch<RoutingDesk>("/api/admin/case-routing");
      setDesk(result);
      setDomains(result.settings.domains);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    if (!desk) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const settings = { domains: Object.fromEntries(WORKFLOW_DOMAINS.map((domain) => [domain, domains[domain] ?? "admin"])) };
      await apiFetch("/api/admin/case-routing", { method: "PUT", json: settings });
      setNotice("Default request routes saved.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Case request routing</h1>
        <p className="mt-2 text-sm text-slate-400">Choose the role that receives new requests. Assigned members review the request and approve a response for the user.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-200">{notice}</p>}
      {!desk && !error && <p className="text-sm text-slate-400">Loading routing settings…</p>}
      {desk && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="grid gap-5">
            {WORKFLOW_DOMAINS.map((domain) => (
              <label key={domain} className="grid gap-2 text-sm font-medium text-slate-200 sm:grid-cols-[1fr_16rem] sm:items-center">
                {DOMAIN_LABELS[domain]}
                <select
                  value={domains[domain] ?? "admin"}
                  onChange={(event) => setDomains((current) => ({ ...current, [domain]: event.target.value }))}
                  className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {desk.roles.map((role) => <option key={role.name} value={role.name}>{role.name}</option>)}
                </select>
              </label>
            ))}
          </div>
          <p className="mt-5 text-xs text-slate-400">Admins can reassign individual requests from the review queue. Changing a route affects new submissions only.</p>
          <button disabled={saving} onClick={() => void save()} className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save routing"}
          </button>
        </section>
      )}
    </div>
  );
}
