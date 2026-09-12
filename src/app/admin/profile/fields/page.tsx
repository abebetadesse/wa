"use client";

import { useEffect, useState } from "react";

interface Field {
  id: string;
  section: string;
  label: string;
  fieldType: string;
  required: boolean;
  isActive: boolean;
}

const blank = { section: "Personal", label: "", fieldType: "text", required: false };

export default function ProfileFieldsAdminPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [draft, setDraft] = useState(blank);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/profile/fields");
    const result = await response.json();
    if (response.ok) setFields(result.fields || []);
    else setMessage(result.error || "Unable to load fields.");
  }
  useEffect(() => { load(); }, []);

  async function create() {
    const response = await fetch("/api/admin/profile/fields", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const result = await response.json();
    setMessage(response.ok ? "Field created." : result.error || "Unable to create field.");
    if (response.ok) { setDraft(blank); load(); }
  }

  async function archive(id: string) {
    const response = await fetch(`/api/admin/profile/fields/${id}`, { method: "DELETE" });
    setMessage(response.ok ? "Field archived." : "Unable to archive field.");
    if (response.ok) load();
  }

  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">Profile field manager</h1><p className="text-slate-600">Manage the fields rendered in user profiles without code changes.</p></div><a className="btn-pill-secondary" href="/api/admin/profile/export">Export JSON</a></div><section className="card-warm grid gap-3 p-6 md:grid-cols-4"><input className="input-warm" placeholder="Section" value={draft.section} onChange={(event) => setDraft({ ...draft, section: event.target.value })} /><input className="input-warm" placeholder="Label" value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} /><select className="input-warm" value={draft.fieldType} onChange={(event) => setDraft({ ...draft, fieldType: event.target.value })}>{["text", "textarea", "select", "number", "date", "email", "phone", "checkbox", "section_header"].map((type) => <option key={type}>{type}</option>)}</select><button className="btn-pill-primary" onClick={create}>Create field</button></section>{message && <p role="status">{message}</p>}<section className="card-warm overflow-x-auto p-6"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Section</th><th className="p-3">Label</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{fields.map((field) => <tr className="border-b" key={field.id}><td className="p-3">{field.section}</td><td className="p-3">{field.label}</td><td className="p-3">{field.fieldType}</td><td className="p-3">{field.isActive ? "Active" : "Archived"}</td><td className="p-3"><button className="text-red-600" onClick={() => archive(field.id)}>Archive</button></td></tr>)}</tbody></table></section></main>;
}
