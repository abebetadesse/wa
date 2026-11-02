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
  biological: "Biological, wellbeing and health",
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
        <h1 className="text-2xl font-bold text-foreground">Case request routing</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose the role that receives new requests. Assigned members review the request and approve a response for the user.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger-strong">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-brand/30 bg-brand-soft p-3 text-sm text-brand-strong">{notice}</p>}
      {!desk && !error && <p className="text-sm text-muted-foreground">Loading routing settings…</p>}
      {desk && (
        <section className="rounded-2xl border border-border bg-foreground/[0.03] p-5">
          <div className="grid gap-5">
            {WORKFLOW_DOMAINS.map((domain) => (
              <label key={domain} className="grid gap-2 text-sm font-medium text-soft sm:grid-cols-[1fr_16rem] sm:items-center">
                {DOMAIN_LABELS[domain]}
                <select
                  value={domains[domain] ?? "admin"}
                  onChange={(event) => setDomains((current) => ({ ...current, [domain]: event.target.value }))}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  {desk.roles.map((role) => <option key={role.name} value={role.name}>{role.name}</option>)}
                </select>
              </label>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Admins can reassign individual requests from the review queue. Changing a route affects new submissions only.</p>
          <button disabled={saving} onClick={() => void save()} className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50">
            {saving ? "Saving…" : "Save routing"}
          </button>
        </section>
      )}
    </div>
  );
}
