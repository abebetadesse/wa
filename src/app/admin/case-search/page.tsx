"use client";

import { useEffect, useState } from "react";
import type { CaseSearchField, CaseSearchSettings } from "@/lib/discovery/caseSearch";

const fields: { key: CaseSearchField; label: string; description: string }[] = [
  { key: "caseType", label: "Case topics", description: "Show case-topic filters and search case categories." },
  { key: "herb", label: "Herbs and food ingredients", description: "Show ingredient filters and include them in text search." },
  { key: "diet", label: "Diet", description: "Show diet filters and include diet examples in text search." },
  { key: "location", label: "Location", description: "Show Ethiopian location filters and include locations in text search." },
  { key: "element", label: "Hexacore element", description: "Show Hexacore element filters and include elements in text search." },
];

const defaults: CaseSearchSettings = { caseType: true, herb: true, diet: true, location: true, element: true };

export default function AdminCaseSearchPage() {
  const [settings, setSettings] = useState<CaseSearchSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/case-search/filters");
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to load search filters.");
      setSettings(payload.data as CaseSearchSettings);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load search filters.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/case-search/filters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to save search filters.");
      setSettings(payload.data as CaseSearchSettings);
      setNotice("Case-search filters saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save search filters.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="border-b border-white/10 pb-5">
        <span className="badge badge-safe mb-3">Search configuration</span>
        <h1 className="text-2xl font-bold text-white">Manage case-search filters</h1>
        <p className="mt-2 text-sm text-slate-400">Choose which filter fields users can see and search. Changes are saved as platform settings.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-200">{notice}</p>}
      <section className="glass-panel divide-y divide-white/10 p-5">
        {loading ? <p className="text-sm text-slate-400">Loading filter settings...</p> : fields.map(({ key, label, description }) => (
          <label key={key} className="flex cursor-pointer items-start gap-3 py-4 first:pt-0 last:pb-0">
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.checked }))}
              className="mt-1 accent-emerald-500"
            />
            <span>
              <span className="block text-sm font-semibold text-white">{label}</span>
              <span className="mt-1 block text-xs text-slate-400">{description}</span>
            </span>
          </label>
        ))}
      </section>
      <button type="button" onClick={() => void save()} disabled={loading || saving} className="btn-primary">
        {saving ? "Saving..." : "Save filters"}
      </button>
    </div>
  );
}
