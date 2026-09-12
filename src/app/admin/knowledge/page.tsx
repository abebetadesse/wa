"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Field = { name: string; label?: string; type?: string; required?: boolean; options?: string[]; default?: unknown };
type Strand = { id: string; name: string; description: string; version: string; isActive: boolean };
type Category = { id: string; name: string; description: string; schema: { fields?: Field[] }; isActive: boolean };
type Item = { id: string; data: Record<string, unknown>; version: number; status: string; updatedAt: string };

async function api(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
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
  const [strandForm, setStrandForm] = useState({ name: "", description: "", version: "1.0.0" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", fields: [emptyField] });

  const refreshStrands = () => api("/api/admin/knowledge/strands").then((data) => { setStrands(data); if (!selectedStrand && data[0]) setSelectedStrand(data[0]); });
  const refreshCategories = (strand: Strand) => api(`/api/admin/knowledge/strands/${strand.id}/categories`).then((data) => { setCategories(data); setSelectedCategory(data[0] || null); });
  const refreshItems = (category: Category) => api(`/api/admin/knowledge/categories/${category.id}/items`).then((data) => { setItems(data); setSelectedItem(null); setItemData({}); });

  useEffect(() => { refreshStrands().catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (selectedStrand) refreshCategories(selectedStrand).catch((e) => setError(e.message)); }, [selectedStrand]);
  useEffect(() => { if (selectedCategory) refreshItems(selectedCategory).catch((e) => setError(e.message)); }, [selectedCategory]);

  function report(message: string) { setError(""); setNotice(message); setTimeout(() => setNotice(""), 3000); }
  async function createStrand() {
    if (!strandForm.name.trim()) return setError("Strand name is required.");
    const strand = await api("/api/admin/knowledge/strands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(strandForm) });
    setStrands((current) => [...current, strand]); setSelectedStrand(strand); setStrandForm({ name: "", description: "", version: "1.0.0" }); report("Strand created.");
  }
  async function archiveStrand(strand: Strand) {
    if (!confirm(`Archive ${strand.name}?`)) return;
    await api(`/api/admin/knowledge/strands/${strand.id}`, { method: "DELETE" }); await refreshStrands(); report("Strand archived.");
  }
  async function editStrand(strand: Strand) {
    const name = prompt("Strand name", strand.name);
    if (name === null || !name.trim()) return;
    const description = prompt("Description", strand.description);
    const updated = await api(`/api/admin/knowledge/strands/${strand.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: description ?? strand.description, version: strand.version, isActive: strand.isActive }) });
    setStrands((current) => current.map((entry) => entry.id === updated.id ? updated : entry)); if (selectedStrand?.id === updated.id) setSelectedStrand(updated); report("Strand updated.");
  }
  async function createCategory() {
    if (!selectedStrand || !categoryForm.name.trim()) return setError("Select a strand and enter a category name.");
    const category = await api(`/api/admin/knowledge/strands/${selectedStrand.id}/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...categoryForm, schema: { fields: categoryForm.fields } }) });
    setCategories((current) => [...current, category]); setSelectedCategory(category); setCategoryForm({ name: "", description: "", fields: [emptyField] }); report("Category created.");
  }
  async function archiveCategory(category: Category) {
    if (!confirm(`Archive ${category.name}?`)) return;
    await api(`/api/admin/knowledge/categories/${category.id}`, { method: "DELETE" }); if (selectedStrand) await refreshCategories(selectedStrand); report("Category archived.");
  }
  async function editCategory(category: Category) {
    const name = prompt("Category name", category.name);
    if (name === null || !name.trim()) return;
    const description = prompt("Description", category.description);
    const updated = await api(`/api/admin/knowledge/categories/${category.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: description ?? category.description, schema: category.schema, isActive: category.isActive }) });
    setCategories((current) => current.map((entry) => entry.id === updated.id ? updated : entry)); if (selectedCategory?.id === updated.id) setSelectedCategory(updated); report("Category updated.");
  }
  async function createItem() {
    if (!selectedCategory) return;
    const data = Object.fromEntries((selectedCategory.schema.fields || []).map((field) => [field.name, field.default ?? (field.type === "boolean" ? false : "")]));
    const item = await api(`/api/admin/knowledge/categories/${selectedCategory.id}/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
    setItems((current) => [item, ...current]); setSelectedItem(item); setItemData(item.data); report("Draft created.");
  }
  async function saveItem() {
    if (!selectedItem) return;
    const item = await api(`/api/admin/knowledge/items/${selectedItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: itemData, changeComment: "Edited from knowledge admin" }) });
    setItems((current) => current.map((entry) => entry.id === item.id ? item : entry)); setSelectedItem(item); report("Item saved as draft.");
  }
  async function transition(item: Item, status: string) {
    const updated = await api(`/api/admin/knowledge/items/${item.id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry)); if (selectedItem?.id === item.id) setSelectedItem(updated); report(`Item moved to ${status}.`);
  }
  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedCategory) {
      setError("Select a category before importing CSV items.");
      event.target.value = "";
      return;
    }
    const form = new FormData(); form.append("categoryId", selectedCategory.id); form.append("file", file);
    try {
      const result = await api("/api/admin/knowledge/import/csv", { method: "POST", body: form });
      await refreshItems(selectedCategory); report(`${result.imported} CSV items imported.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "CSV import failed.");
    } finally {
      event.target.value = "";
    }
  }
  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const form = new FormData(); form.append("file", file);
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

  if (loading) return <main className="app-container py-12 text-slate-400">Loading knowledge workspace...</main>;
  return <main className="app-container py-8"><div className="max-w-7xl mx-auto space-y-5">
    <header className="flex flex-wrap justify-between gap-4"><div><div className="badge badge-safe mb-3">Knowledge governance</div><h1 className="text-3xl font-extrabold text-white">Knowledge Management</h1><p className="text-sm text-slate-400 mt-2">Manage strands, schemas, items, approvals, and backups.</p></div>
      <div className="flex flex-wrap gap-2 items-start">
        <label className="btn-secondary text-xs cursor-pointer">Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} /></label>
        <label className="btn-secondary text-xs cursor-pointer">Import JSON<input type="file" accept=".json,application/json" className="hidden" onChange={importJson} /></label>
        <a className="btn-secondary text-xs" href={selectedCategory ? `/api/admin/knowledge/export/csv?categoryId=${selectedCategory.id}` : "/api/admin/knowledge/export/csv"}>Export CSV</a>
        <a className="btn-secondary text-xs" href="/api/admin/knowledge/export/json">Export JSON</a>
      </div>
    </header>
    {error && <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</div>}{notice && <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-sm text-emerald-200">{notice}</div>}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <section className="glass-panel p-4 lg:col-span-3"><h2 className="font-bold text-white mb-3">Strands</h2>{strands.map((strand) => <div key={strand.id} className="flex gap-1 mb-2"><button onClick={() => setSelectedStrand(strand)} className={`flex-1 text-left p-3 rounded-xl border text-sm ${selectedStrand?.id === strand.id ? "border-sky-400 bg-sky-500/15 text-white" : "border-white/10 text-slate-400"}`}>{strand.name}<span className="block text-[11px] text-slate-500">v{strand.version} · {strand.isActive ? "active" : "archived"}</span></button><button onClick={() => editStrand(strand)} className="px-2 text-sky-300" title="Edit">✎</button><button onClick={() => archiveStrand(strand)} className="px-2 text-rose-300" title="Archive">×</button></div>)}<div className="mt-4 space-y-2"><input value={strandForm.name} onChange={(e) => setStrandForm({ ...strandForm, name: e.target.value })} placeholder="New strand name" className="input-warm w-full text-xs" /><input value={strandForm.description} onChange={(e) => setStrandForm({ ...strandForm, description: e.target.value })} placeholder="Description" className="input-warm w-full text-xs" /><button onClick={createStrand} className="btn-primary text-xs w-full">Add strand</button></div></section>
      <section className="glass-panel p-4 lg:col-span-3"><h2 className="font-bold text-white mb-3">Categories</h2>{categories.map((category) => <div key={category.id} className="flex gap-1 mb-2"><button onClick={() => setSelectedCategory(category)} className={`flex-1 text-left p-3 rounded-xl border text-sm ${selectedCategory?.id === category.id ? "border-amber-400 bg-amber-500/10 text-white" : "border-white/10 text-slate-400"}`}>{category.name}<span className="block text-[11px] text-slate-500">{category.schema?.fields?.length || 0} fields</span></button><button onClick={() => editCategory(category)} className="px-2 text-sky-300" title="Edit">✎</button><button onClick={() => archiveCategory(category)} className="px-2 text-rose-300">×</button></div>)}<div className="mt-4 space-y-2"><input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="New category name" className="input-warm w-full text-xs" /><textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Description" className="input-warm w-full text-xs" rows={2} />{categoryForm.fields.map((field, index) => <div key={index} className="grid grid-cols-2 gap-1"><input value={field.name} onChange={(e) => { const fields = [...categoryForm.fields]; fields[index] = { ...field, name: e.target.value }; setCategoryForm({ ...categoryForm, fields }); }} className="input-warm text-xs" placeholder="field name" /><select value={field.type} onChange={(e) => { const fields = [...categoryForm.fields]; fields[index] = { ...field, type: e.target.value }; setCategoryForm({ ...categoryForm, fields }); }} className="input-warm text-xs"><option>text</option><option>textarea</option><option>number</option><option>date</option><option>boolean</option><option>select</option><option>array</option><option>object</option></select></div>)}<button onClick={() => setCategoryForm({ ...categoryForm, fields: [...categoryForm.fields, { ...emptyField, name: `field${categoryForm.fields.length + 1}` }] })} className="btn-secondary text-xs w-full">Add schema field</button><button onClick={createCategory} className="btn-primary text-xs w-full">Add category</button></div></section>
      <section className="glass-panel p-4 lg:col-span-6"><div className="flex justify-between mb-3"><div><h2 className="font-bold text-white">Items</h2><p className="text-xs text-slate-500">{selectedCategory?.name || "Select a category"}</p></div><button onClick={createItem} className="btn-primary text-xs" disabled={!selectedCategory}>New item</button></div>{items.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No items in this category.</p> : <div className="space-y-2">{items.map((item) => <div key={item.id} className={`p-3 rounded-xl border ${selectedItem?.id === item.id ? "border-sky-400" : "border-white/10"}`}><div className="flex justify-between gap-2"><button className="text-left" onClick={() => { setSelectedItem(item); setItemData(item.data); }}><strong className="text-sm text-white">{String(item.data.name || item.data.title || "Untitled item")}</strong><span className="block text-[11px] text-slate-500">v{item.version} · {item.status}</span></button><div className="flex gap-1">{item.status === "draft" && <button onClick={() => transition(item, "review")} className="btn-secondary text-[10px]">Review</button>}{item.status === "review" && <button onClick={() => transition(item, "published")} className="btn-primary text-[10px]">Publish</button>}{item.status !== "archived" && <button onClick={() => transition(item, "archived")} className="btn-secondary text-[10px]">Archive</button>}</div></div></div>)}</div>}<div className="mt-5 border-t border-white/10 pt-4">{selectedItem && selectedCategory ? <><h3 className="text-sm font-bold text-white mb-3">Dynamic item editor</h3><div className="grid md:grid-cols-2 gap-3">{(selectedCategory.schema.fields || []).map((field) => <label key={field.name} className="text-xs text-slate-300">{field.label || field.name}{field.required ? " *" : ""}{field.type === "textarea" ? <textarea rows={3} value={String(itemData[field.name] ?? "")} onChange={(e) => setItemData({ ...itemData, [field.name]: e.target.value })} className="input-warm w-full mt-1" /> : field.type === "boolean" ? <input type="checkbox" checked={Boolean(itemData[field.name])} onChange={(e) => setItemData({ ...itemData, [field.name]: e.target.checked })} className="ml-2" /> : field.type === "select" ? <select value={String(itemData[field.name] ?? "")} onChange={(e) => setItemData({ ...itemData, [field.name]: e.target.value })} className="input-warm w-full mt-1">{(field.options || []).map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} value={String(itemData[field.name] ?? "")} onChange={(e) => setItemData({ ...itemData, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value })} className="input-warm w-full mt-1" />}</label>)}</div><button onClick={saveItem} className="btn-primary mt-4 text-xs">Save draft</button></> : <p className="text-xs text-slate-500">Select an item to edit it using its category schema.</p>}</div></section>
    </div>
  </div></main>;
}
