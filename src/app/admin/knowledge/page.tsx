"use client";

import { ChangeEvent, useEffect, useState, useMemo } from "react";
import { SYSTEM_KNOWLEDGE_STRANDS, SystemStrandMetadata } from "@/lib/hexacore/HexacoreVisionEngine";
import { withBasePath, assetUrl } from '@/lib/base-path';

type Field = { name: string; label?: string; type?: string; required?: boolean; options?: string[]; default?: unknown };
type Strand = { id: string; name: string; description: string; version: string; isActive: boolean };
type Category = { id: string; name: string; description: string; schema: { fields?: Field[] }; isActive: boolean };
type Item = { id: string; data: Record<string, unknown>; version: number; status: string; updatedAt: string };

async function api(url: string, options?: RequestInit) {
  const response = await fetch(withBasePath(url), options);
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.error || "Request failed");
  return payload.data;
}

const emptyField: Field = { name: "field", label: "Field", type: "text", required: false };

export default function KnowledgeAdminPage() {
  const [strands, setStrands] = useState<Strand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<Strand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemData, setItemData] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showSystemStrands, setShowSystemStrands] = useState(true);
  const [strandFilter, setStrandFilter] = useState<"all" | "A" | "B" | "synced" | "unseeded">("all");
  const [strandForm, setStrandForm] = useState({ name: "", description: "", version: "1.0.0" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", fields: [emptyField] });
  const [somaticPayloadInput, setSomaticPayloadInput] = useState("");
  const [showSomaticModal, setShowSomaticModal] = useState(false);
  const [ingestingSomatic, setIngestingSomatic] = useState(false);

  const refreshStrands = () =>
    api("/api/admin/knowledge/strands").then((data) => {
      setStrands(data);
      if (!selectedStrand && data[0]) setSelectedStrand(data[0]);
    });
  const refreshCategories = (strand: Strand) =>
    api(`/api/admin/knowledge/strands/${strand.id}/categories`).then((data) => {
      setCategories(data);
      setSelectedCategory(data[0] || null);
    });
  const refreshItems = (category: Category) =>
    api(`/api/admin/knowledge/categories/${category.id}/items`).then((data) => {
      setItems(data);
      setSelectedItem(null);
      setItemData({});
    });

  useEffect(() => {
    refreshStrands()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedStrand) refreshCategories(selectedStrand).catch((e) => setError(e.message));
  }, [selectedStrand]);

  useEffect(() => {
    if (selectedCategory) refreshItems(selectedCategory).catch((e) => setError(e.message));
  }, [selectedCategory]);

  function report(message: string) {
    setError("");
    setNotice(message);
    setTimeout(() => setNotice(""), 4000);
  }

  // System strands merged with DB status
  const systemStrandsWithDbStatus = useMemo(() => {
    return SYSTEM_KNOWLEDGE_STRANDS.map((sys) => {
      const match = strands.find(
        (s) => s.name.trim().toLowerCase() === sys.name.trim().toLowerCase()
      );
      return {
        ...sys,
        isSynced: Boolean(match),
        dbRecord: match || null,
      };
    });
  }, [strands]);

  const filteredSystemStrands = useMemo(() => {
    if (strandFilter === "A") return systemStrandsWithDbStatus.filter((s) => s.domain === "A");
    if (strandFilter === "B") return systemStrandsWithDbStatus.filter((s) => s.domain === "B");
    if (strandFilter === "synced") return systemStrandsWithDbStatus.filter((s) => s.isSynced);
    if (strandFilter === "unseeded") return systemStrandsWithDbStatus.filter((s) => !s.isSynced);
    return systemStrandsWithDbStatus;
  }, [systemStrandsWithDbStatus, strandFilter]);

  const syncedCount = useMemo(() => systemStrandsWithDbStatus.filter((s) => s.isSynced).length, [systemStrandsWithDbStatus]);

  async function handleSeedSystemStrands() {
    try {
      setSeeding(true);
      setError("");
      const res = await api("/api/admin/knowledge/strands/seed", { method: "POST" });
      await refreshStrands();
      report(res.message || `Successfully seeded ${res.seededCount || 11} knowledge strands.`);
    } catch (e: any) {
      setError(e.message || "Failed to seed knowledge strands.");
    } finally {
      setSeeding(false);
    }
  }

  async function createStrand() {
    if (!strandForm.name.trim()) return setError("Strand name is required.");
    const strand = await api("/api/admin/knowledge/strands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(strandForm),
    });
    setStrands((current) => [...current, strand]);
    setSelectedStrand(strand);
    setStrandForm({ name: "", description: "", version: "1.0.0" });
    report("Strand created.");
  }

  async function archiveStrand(strand: Strand) {
    if (!confirm(`Archive ${strand.name}?`)) return;
    await api(`/api/admin/knowledge/strands/${strand.id}`, { method: "DELETE" });
    await refreshStrands();
    report("Strand archived.");
  }

  async function editStrand(strand: Strand) {
    const name = prompt("Strand name", strand.name);
    if (name === null || !name.trim()) return;
    const description = prompt("Description", strand.description);
    const updated = await api(`/api/admin/knowledge/strands/${strand.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description ?? strand.description,
        version: strand.version,
        isActive: strand.isActive,
      }),
    });
    setStrands((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    if (selectedStrand?.id === updated.id) setSelectedStrand(updated);
    report("Strand updated.");
  }

  async function createCategory() {
    if (!selectedStrand || !categoryForm.name.trim())
      return setError("Select a strand and enter a category name.");
    const category = await api(`/api/admin/knowledge/strands/${selectedStrand.id}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...categoryForm, schema: { fields: categoryForm.fields } }),
    });
    setCategories((current) => [...current, category]);
    setSelectedCategory(category);
    setCategoryForm({ name: "", description: "", fields: [emptyField] });
    report("Category created.");
  }

  async function archiveCategory(category: Category) {
    if (!confirm(`Archive ${category.name}?`)) return;
    await api(`/api/admin/knowledge/categories/${category.id}`, { method: "DELETE" });
    if (selectedStrand) await refreshCategories(selectedStrand);
    report("Category archived.");
  }

  async function editCategory(category: Category) {
    const name = prompt("Category name", category.name);
    if (name === null || !name.trim()) return;
    const description = prompt("Description", category.description);
    const updated = await api(`/api/admin/knowledge/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description ?? category.description,
        schema: category.schema,
        isActive: category.isActive,
      }),
    });
    setCategories((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    if (selectedCategory?.id === updated.id) setSelectedCategory(updated);
    report("Category updated.");
  }

  async function createItem() {
    if (!selectedCategory) return;
    const data = Object.fromEntries(
      (selectedCategory.schema.fields || []).map((field) => [
        field.name,
        field.default ?? (field.type === "boolean" ? false : ""),
      ])
    );
    const item = await api(`/api/admin/knowledge/categories/${selectedCategory.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    setItems((current) => [item, ...current]);
    setSelectedItem(item);
    setItemData(item.data);
    report("Draft created.");
  }

  async function saveItem() {
    if (!selectedItem) return;
    const item = await api(`/api/admin/knowledge/items/${selectedItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: itemData, changeComment: "Edited from knowledge admin" }),
    });
    setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    setSelectedItem(item);
    report("Item saved as draft.");
  }

  async function transition(item: Item, status: string) {
    const updated = await api(`/api/admin/knowledge/items/${item.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
    if (selectedItem?.id === item.id) setSelectedItem(updated);
    report(`Item moved to ${status}.`);
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedCategory) {
      setError("Select a category before importing CSV items.");
      event.target.value = "";
      return;
    }
    const form = new FormData();
    form.append("categoryId", selectedCategory.id);
    form.append("file", file);
    try {
      const result = await api("/api/admin/knowledge/import/csv", { method: "POST", body: form });
      await refreshItems(selectedCategory);
      report(`${result.imported} CSV items imported.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "CSV import failed.");
    } finally {
      event.target.value = "";
    }
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await api("/api/admin/knowledge/import/json", { method: "POST", body: form });
      if (selectedCategory) await refreshItems(selectedCategory);
      report(`${result.imported} JSON items imported.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "JSON import failed.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleIngestSomaticPayload() {
    if (!somaticPayloadInput.trim()) return setError("Please paste the somatic scan payload JSON.");
    try {
      setIngestingSomatic(true);
      setError("");
      const parsed = JSON.parse(somaticPayloadInput);
      const itemsToIngest = parsed.knowledgeItems || (parsed.exportPayload && parsed.exportPayload.knowledgeItems);
      if (!itemsToIngest || !Array.isArray(itemsToIngest)) {
        throw new Error("Payload does not contain a valid knowledgeItems array.");
      }

      if (!selectedCategory) {
        throw new Error("Please select a target Category in the workspace below before ingesting items.");
      }

      let count = 0;
      for (const kItem of itemsToIngest) {
        await api(`/api/admin/knowledge/categories/${selectedCategory.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: kItem.data || kItem }),
        });
        count++;
      }

      await refreshItems(selectedCategory);
      setShowSomaticModal(false);
      setSomaticPayloadInput("");
      report(`Successfully ingested ${count} somatic scan knowledge items into ${selectedCategory.name}!`);
    } catch (err: any) {
      setError(err.message || "Failed to ingest somatic payload.");
    } finally {
      setIngestingSomatic(false);
    }
  }

  if (loading)
    return <main className="app-container py-12 text-muted-foreground">Loading knowledge workspace...</main>;

  return (
    <main className="app-container py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-safe">Knowledge Governance & Somatic Engine</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-info/10 border border-info/30 text-info-strong font-mono">
                port:5500
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Knowledge Management & Engine Strands
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
              Manage the 11 epistemic knowledge strands spanning Domain A (Biomedical & Empirical) and Domain B (Ethnobotanical & Awde Negast Archetypes). Direct exports available for somatic vision scanners.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSomaticModal(true)}
              className="px-3 py-1.5 rounded-xl border border-plum/30 bg-plum/15 hover:bg-plum/25 text-plum-strong text-xs font-bold transition flex items-center gap-1.5"
            >
              �� Ingest Somatic Scan
            </button>

            <button
              onClick={handleSeedSystemStrands}
              disabled={seeding}
              className="px-3 py-1.5 rounded-xl border border-gold/40 bg-gold/15 hover:bg-gold/25 text-gold-strong text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {seeding ? "⚡ Seeding..." : `⚡ Seed 11 Engine Strands (${syncedCount}/11 Synced)`}
            </button>

            {/* Available Strands Exports */}
            <a
              href={withBasePath("/api/admin/knowledge/export/strands?download=true")}
              className="px-3 py-1.5 rounded-xl border border-brand/40 bg-brand/15 hover:bg-brand/25 text-brand-strong text-xs font-bold transition flex items-center gap-1.5"
              title="Download all 11 system strands in JSON format"
            >
              �� Export Strands (JSON)
            </a>

            <a
              href={withBasePath("/api/admin/knowledge/export/strands?format=csv")}
              className="px-3 py-1.5 rounded-xl border border-info/40 bg-info/15 hover:bg-info/25 text-info-strong text-xs font-bold transition flex items-center gap-1.5"
              title="Download all 11 system strands in CSV format"
            >
              �� Export Strands (CSV)
            </a>

            <label className="btn-secondary text-xs cursor-pointer">
              Import CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} />
            </label>
            <label className="btn-secondary text-xs cursor-pointer">
              Import JSON
              <input type="file" accept=".json,application/json" className="hidden" onChange={importJson} />
            </label>
            <a
              className="btn-secondary text-xs"
              href={assetUrl(selectedCategory
                  ? `/api/admin/knowledge/export/csv?categoryId=${selectedCategory.id}`
                  : "/api/admin/knowledge/export/csv")}
            >
              Export Items CSV
            </a>
            <a className="btn-secondary text-xs" href={withBasePath("/api/admin/knowledge/export/json")}>
              Export Items JSON
            </a>
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger-soft p-3.5 text-sm text-danger-strong flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="text-xs text-danger hover:text-foreground ml-2">Dismiss</button>
          </div>
        )}
        {notice && (
          <div className="rounded-xl border border-brand/40 bg-brand-soft p-3.5 text-sm text-brand-strong flex items-center justify-between">
            <span>✅ {notice}</span>
            <button onClick={() => setNotice("")} className="text-xs text-brand hover:text-foreground ml-2">Dismiss</button>
          </div>
        )}

        {/* SECTION: AVAILABLE SYSTEM STRANDS SHOWCASE (11 STRANDS) */}
        <section className="glass-panel p-5 rounded-2xl border border-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>�� Available Hexacore Knowledge Strands</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gold/10 text-gold-strong border border-gold/20">
                    11 System Strands
                  </span>
                </h2>
                <button
                  onClick={() => setShowSystemStrands(!showSystemStrands)}
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                >
                  {showSystemStrands ? "Collapse" : "Expand"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                The Hexacore epistemic taxonomy merges 9 Domain A biomedical/somatic axes with 2 Domain B traditional Awde Negast axes.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-sunken/80 p-1 rounded-xl border border-border text-xs">
              {(
                [
                  { id: "all", label: `All (${SYSTEM_KNOWLEDGE_STRANDS.length})` },
                  { id: "A", label: "Domain A: Scientific (9)" },
                  { id: "B", label: "Domain B: Cultural (2)" },
                  { id: "synced", label: `Synced in DB (${syncedCount})` },
                  { id: "unseeded", label: `Available (${11 - syncedCount})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStrandFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    strandFilter === tab.id
                      ? "bg-foreground/15 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {showSystemStrands && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {filteredSystemStrands.map((strand) => {
                const isSelected = selectedStrand?.name.toLowerCase() === strand.name.toLowerCase();
                return (
                  <div
                    key={strand.key}
                    className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? "border-gold/80 bg-gold/10 shadow-panel"
                        : "border-border bg-foreground/[0.02] hover:border-border-strong hover:bg-foreground/[0.04]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{strand.name}</span>
                          </div>
                          <div className="text-xs text-gold font-medium">{strand.nameAm}</div>
                        </div>

                        {/* Domain Badge */}
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              strand.domain === "A"
                                ? "bg-brand/10 text-brand-strong border-brand/30"
                                : "bg-plum/10 text-plum-strong border-plum/30"
                            }`}
                          >
                            Domain {strand.domain}: {strand.domain === "A" ? "Scientific" : "Cultural"}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-foreground/5 border border-border">
                            {strand.tier}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-soft leading-relaxed line-clamp-2">
                        {strand.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                        {strand.descriptionAm}
                      </p>

                      {/* Categories preview */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {strand.categories.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 border border-border text-soft"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-border text-[11px]">
                      {strand.isSynced ? (
                        <div className="flex items-center gap-1.5 text-brand font-medium">
                          <span>✓ Synced in DB</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gold font-medium">
                          <span>○ Available to Seed</span>
                        </div>
                      )}

                      {strand.dbRecord ? (
                        <button
                          onClick={() => setSelectedStrand(strand.dbRecord)}
                          className="px-2.5 py-1 rounded-lg border border-info/40 bg-info/10 hover:bg-info/20 text-info-strong text-xs font-semibold transition"
                        >
                          Select in Workspace →
                        </button>
                      ) : (
                        <button
                          onClick={handleSeedSystemStrands}
                          disabled={seeding}
                          className="px-2.5 py-1 rounded-lg border border-gold/40 bg-gold/10 hover:bg-gold/20 text-gold-strong text-xs font-semibold transition"
                        >
                          Seed to DB
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* WORKSPACE 3-COLUMN LAYOUT: STRANDS -> CATEGORIES -> ITEMS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Column 1: Strands */}
          <section className="glass-panel p-4 lg:col-span-3 rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground text-base">Active Strands ({strands.length})</h2>
              <span className="text-[11px] text-muted-foreground">Database Records</span>
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {strands.length === 0 ? (
                <div className="p-4 text-center text-xs text-subtle border border-dashed border-border rounded-xl">
                  No strands currently stored in DB. Click <strong>⚡ Seed 11 Engine Strands</strong> above to populate the registry.
                </div>
              ) : (
                strands.map((strand) => (
                  <div key={strand.id} className="flex gap-1">
                    <button
                      onClick={() => setSelectedStrand(strand)}
                      className={`flex-1 text-left p-3 rounded-xl border text-sm transition ${
                        selectedStrand?.id === strand.id
                          ? "border-info bg-info/15 text-foreground"
                          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                      }`}
                    >
                      <strong className="block text-foreground font-medium">{strand.name}</strong>
                      <span className="block text-[11px] text-subtle mt-0.5">
                        v{strand.version} · {strand.isActive ? "active" : "archived"}
                      </span>
                    </button>
                    <button onClick={() => editStrand(strand)} className="px-2 text-info hover:text-info-strong" title="Edit">
                      ✎
                    </button>
                    <button onClick={() => archiveStrand(strand)} className="px-2 text-danger hover:text-danger-strong" title="Archive">
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Strand Form */}
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <div className="text-xs font-semibold text-soft">Add Custom Strand</div>
              <input
                value={strandForm.name}
                onChange={(e) => setStrandForm({ ...strandForm, name: e.target.value })}
                placeholder="New strand name"
                className="input-warm w-full text-xs"
              />
              <input
                value={strandForm.description}
                onChange={(e) => setStrandForm({ ...strandForm, description: e.target.value })}
                placeholder="Description"
                className="input-warm w-full text-xs"
              />
              <button onClick={createStrand} className="btn-primary text-xs w-full">
                Add Strand
              </button>
            </div>
          </section>

          {/* Column 2: Categories */}
          <section className="glass-panel p-4 lg:col-span-3 rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground text-base">Categories ({categories.length})</h2>
                <div className="text-[11px] text-gold truncate max-w-[180px]">
                  {selectedStrand ? selectedStrand.name : "Select a strand"}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {!selectedStrand ? (
                <div className="p-4 text-center text-xs text-subtle border border-dashed border-border rounded-xl">
                  Select a strand on the left to inspect its categories.
                </div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-center text-xs text-subtle border border-dashed border-border rounded-xl">
                  No categories in this strand yet.
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex gap-1">
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`flex-1 text-left p-3 rounded-xl border text-sm transition ${
                        selectedCategory?.id === category.id
                          ? "border-gold bg-gold/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                      }`}
                    >
                      <strong className="block text-foreground font-medium">{category.name}</strong>
                      <span className="block text-[11px] text-subtle mt-0.5">
                        {category.schema?.fields?.length || 0} schema fields
                      </span>
                    </button>
                    <button onClick={() => editCategory(category)} className="px-2 text-info hover:text-info-strong" title="Edit">
                      ✎
                    </button>
                    <button onClick={() => archiveCategory(category)} className="px-2 text-danger hover:text-danger-strong" title="Archive">
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Category Form */}
            {selectedStrand && (
              <div className="mt-4 pt-3 border-t border-border space-y-2">
                <div className="text-xs font-semibold text-soft">Add Category to {selectedStrand.name}</div>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="New category name"
                  className="input-warm w-full text-xs"
                />
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Description"
                  className="input-warm w-full text-xs"
                  rows={2}
                />
                {categoryForm.fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-2 gap-1">
                    <input
                      value={field.name}
                      onChange={(e) => {
                        const fields = [...categoryForm.fields];
                        fields[index] = { ...field, name: e.target.value };
                        setCategoryForm({ ...categoryForm, fields });
                      }}
                      className="input-warm text-xs"
                      placeholder="field name"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const fields = [...categoryForm.fields];
                        fields[index] = { ...field, type: e.target.value };
                        setCategoryForm({ ...categoryForm, fields });
                      }}
                      className="input-warm text-xs"
                    >
                      <option>text</option>
                      <option>textarea</option>
                      <option>number</option>
                      <option>date</option>
                      <option>boolean</option>
                      <option>select</option>
                      <option>array</option>
                      <option>object</option>
                    </select>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setCategoryForm({
                      ...categoryForm,
                      fields: [...categoryForm.fields, { ...emptyField, name: `field${categoryForm.fields.length + 1}` }],
                    })
                  }
                  className="btn-secondary text-xs w-full"
                >
                  + Add Schema Field
                </button>
                <button onClick={createCategory} className="btn-primary text-xs w-full">
                  Add Category
                </button>
              </div>
            )}
          </section>

          {/* Column 3: Items & Dynamic Editor */}
          <section className="glass-panel p-4 lg:col-span-6 rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h2 className="font-bold text-foreground text-base">Knowledge Items ({items.length})</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedCategory ? `${selectedCategory.name} Category` : "Select a category to view items"}
                </p>
              </div>
              <button onClick={createItem} className="btn-primary text-xs" disabled={!selectedCategory}>
                + New Item
              </button>
            </div>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-subtle">
                {selectedCategory ? "No items in this category yet. Click '+ New Item' or import." : "Select a category to inspect its items."}
              </p>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition ${
                      selectedItem?.id === item.id ? "border-info bg-info/10" : "border-border hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="text-left flex-1"
                        onClick={() => {
                          setSelectedItem(item);
                          setItemData(item.data);
                        }}
                      >
                        <strong className="text-sm text-foreground font-medium">
                          {String(item.data.name || item.data.title || "Untitled Knowledge Item")}
                        </strong>
                        <span className="block text-[11px] text-muted-foreground mt-0.5">
                          v{item.version} · <span className="capitalize">{item.status}</span> · updated {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        {item.status === "draft" && (
                          <button onClick={() => transition(item, "review")} className="btn-secondary text-[10px]">
                            Review
                          </button>
                        )}
                        {item.status === "review" && (
                          <button onClick={() => transition(item, "published")} className="btn-primary text-[10px]">
                            Publish
                          </button>
                        )}
                        {item.status !== "archived" && (
                          <button onClick={() => transition(item, "archived")} className="btn-secondary text-[10px]">
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dynamic Schema Item Editor */}
            <div className="border-t border-border pt-4">
              {selectedItem && selectedCategory ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>Dynamic Schema Item Editor</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground/10 text-soft">
                        {selectedCategory.name}
                      </span>
                    </h3>
                    <span className="text-xs text-muted-foreground">Status: {selectedItem.status}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {(selectedCategory.schema.fields || []).map((field) => (
                      <label key={field.name} className="text-xs text-soft">
                        <span className="font-medium text-soft">
                          {field.label || field.name}
                          {field.required ? " *" : ""}
                        </span>
                        {field.type === "textarea" ? (
                          <textarea
                            rows={3}
                            value={String(itemData[field.name] ?? "")}
                            onChange={(e) => setItemData({ ...itemData, [field.name]: e.target.value })}
                            className="input-warm w-full mt-1 text-xs"
                          />
                        ) : field.type === "boolean" ? (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(itemData[field.name])}
                              onChange={(e) => setItemData({ ...itemData, [field.name]: e.target.checked })}
                              className="rounded border-border-strong"
                            />
                            <span className="text-muted-foreground text-xs">Enabled / Active</span>
                          </div>
                        ) : field.type === "select" ? (
                          <select
                            value={String(itemData[field.name] ?? "")}
                            onChange={(e) => setItemData({ ...itemData, [field.name]: e.target.value })}
                            className="input-warm w-full mt-1 text-xs"
                          >
                            {(field.options || []).map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                            value={String(itemData[field.name] ?? "")}
                            onChange={(e) =>
                              setItemData({
                                ...itemData,
                                [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value,
                              })
                            }
                            className="input-warm w-full mt-1 text-xs"
                          />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                    <button onClick={saveItem} className="btn-primary text-xs">
                      Save Draft
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        setItemData({});
                      }}
                      className="btn-secondary text-xs"
                    >
                      Close Editor
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-xs text-subtle border border-dashed border-border rounded-xl">
                  Select an item to edit it dynamically using its category schema.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* SOMATIC PAYLOAD INGEST MODAL */}
      {showSomaticModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-border-strong space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>�� Ingest Somatic Vision Payload</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-plum/20 text-plum-strong border border-plum/30">
                    Hexacore Vision Bridge
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the JSON exported from the camera scanner (Tongue or Palm) to automatically create knowledge items in the active category: <strong>{selectedCategory?.name || "No Category Selected"}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowSomaticModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg p-1"
              >
                ✕
              </button>
            </div>

            {!selectedCategory && (
              <div className="p-3 rounded-xl border border-gold/40 bg-gold-soft text-xs text-gold-strong">
                ⚠️ Please select a Category in the workspace before ingesting, or close this dialog, choose a strand/category, and reopen.
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-soft block mb-1">
                Somatic Scan Payload JSON
              </label>
              <textarea
                value={somaticPayloadInput}
                onChange={(e) => setSomaticPayloadInput(e.target.value)}
                placeholder='{"source": "Hexacore Vision & Somatic Engine", "knowledgeItems": [ ... ] }'
                rows={10}
                className="input-warm w-full text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSomaticModal(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleIngestSomaticPayload}
                disabled={ingestingSomatic || !selectedCategory}
                className="btn-primary text-xs disabled:opacity-50"
              >
                {ingestingSomatic ? "Ingesting..." : "Ingest Knowledge Items"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

