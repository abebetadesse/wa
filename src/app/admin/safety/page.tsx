"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, Dialog, ErrorState, Field, Input, LoadingState, PageHeader, PageShell, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import { CONDITIONS, CONDITION_LABELS, PROPERTIES, SEVERITIES, type Condition } from "@/server/safety/rules";
import { cn } from "@/lib/utils";

interface SubstanceRow {
  id: string;
  slug: string;
  name: string;
  kind: "modern" | "traditional";
  category: string;
  scientificName: string | null;
  amharicName: string | null;
  aliases: string[];
  properties: string[];
  cautions: Partial<Record<Condition, { level: "avoid" | "caution"; note?: string }>>;
  notes: string | null;
  evidence: string | null;
  status: string;
  origin: string;
  customized: boolean;
}

interface InteractionRow {
  id: string;
  substanceA: string;
  substanceB: string;
  severity: string;
  mechanism: string;
  effect: string;
  management: string;
  evidence: string;
  source: string;
  status: string;
  origin: string;
}

interface Reference {
  substances: SubstanceRow[];
  interactions: InteractionRow[];
}

const propertyLabel = (key: string) => (PROPERTIES as Record<string, string>)[key] ?? key;

export default function AdminSafetyPage() {
  const toast = useToast();
  const { data, error, reload, setData } = useApi<Reference>("/api/admin/safety");
  const [tab, setTab] = useState<"substances" | "interactions">("substances");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [editing, setEditing] = useState<SubstanceRow | "new" | null>(null);
  const [pairEditing, setPairEditing] = useState<InteractionRow | "new" | null>(null);

  async function sync() {
    try {
      setData(await apiFetch<Reference>("/api/admin/safety/sync", { method: "POST" }));
      toast({ tone: "success", title: "Starter reference synced", body: "Entries your team edited were kept." });
    } catch (err) {
      toast({ tone: "error", title: "Sync failed", body: errorMessage(err) });
    }
  }

  async function removePair(row: InteractionRow) {
    try {
      await apiFetch(`/api/admin/safety/interactions/${row.id}`, { method: "DELETE" });
      toast({ tone: "success", title: row.origin === "seed" ? "Interaction archived" : "Interaction deleted" });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not remove", body: errorMessage(err) });
    }
  }

  const nameOf = useMemo(() => new Map(data?.substances.map((s) => [s.slug, s.name]) ?? []), [data]);
  if (error) return <PageShell><ErrorState message={error} onRetry={reload} /></PageShell>;
  if (!data) return <PageShell><LoadingState /></PageShell>;

  const q = query.trim().toLowerCase();
  const substances = data.substances.filter((s) => (kind === "all" || s.kind === kind) && (!q || [s.name, s.slug, s.category, s.amharicName, s.scientificName, ...s.aliases].some((v) => v?.toLowerCase().includes(q))));
  const interactions = data.interactions.filter((i) => !q || [nameOf.get(i.substanceA), nameOf.get(i.substanceB), i.source].some((v) => v?.toLowerCase().includes(q)));

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Administration"
        title="Safety matrix reference"
        description="The medicines, traditional remedies, foods and drinks in the safety matrix, their properties, and documented interaction pairs. Changes apply to the matrix within a minute."
        actions={<Button variant="outline" onClick={sync}><RefreshCw className="size-4" aria-hidden="true" /> Sync starter reference</Button>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" className="flex gap-2">
          {([["substances", `Medicines & remedies (${data.substances.length})`], ["interactions", `Documented pairs (${data.interactions.length})`]] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("rounded-full px-4 py-2 text-sm font-semibold", tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {label}
            </button>
          ))}
        </div>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-10 w-64" aria-label="Search" />
        {tab === "substances" && (
          <Select value={kind} onChange={(e) => setKind(e.target.value)} className="h-10 w-44" aria-label="Kind">
            <option value="all">All kinds</option>
            <option value="modern">Modern</option>
            <option value="traditional">Traditional</option>
          </Select>
        )}
        <Button className="ml-auto" onClick={() => (tab === "substances" ? setEditing("new") : setPairEditing("new"))}><Plus className="size-4" aria-hidden="true" /> {tab === "substances" ? "Add medicine or remedy" : "Add documented pair"}</Button>
      </div>

      {tab === "substances" ? (
        <Card>
          <CardContent className="divide-y divide-border pt-2">
            {substances.map((s) => (
              <div key={s.id} className={cn("flex flex-wrap items-center gap-3 py-3", s.status !== "published" && "opacity-60")}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {s.name} <Badge tone={s.kind === "traditional" ? "success" : "brand"}>{s.kind}</Badge> {s.status !== "published" && <Badge tone="neutral">{s.status}</Badge>} {s.customized && s.origin === "seed" && <Badge tone="warning">Edited</Badge>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{s.category} · {s.properties.map(propertyLabel).join(", ") || "no properties"}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setEditing(s)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border pt-2">
            {interactions.map((i) => (
              <div key={i.id} className={cn("flex flex-wrap items-center gap-3 py-3", i.status !== "published" && "opacity-60")}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{nameOf.get(i.substanceA)} + {nameOf.get(i.substanceB)} <Badge tone={i.severity === "minor" ? "brand" : i.severity === "moderate" ? "warning" : "danger"}>{i.severity}</Badge> {i.status !== "published" && <Badge tone="neutral">{i.status}</Badge>}</p>
                  <p className="truncate text-xs text-muted-foreground">{i.effect} · {i.source}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setPairEditing(i)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => removePair(i)} aria-label="Remove"><Trash2 className="size-4" aria-hidden="true" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {editing && <SubstanceEditor row={editing === "new" ? null : editing} categories={[...new Set(data.substances.map((s) => s.category))].sort()} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {pairEditing && <PairEditor row={pairEditing === "new" ? null : pairEditing} substances={data.substances} onClose={() => setPairEditing(null)} onSaved={() => { setPairEditing(null); reload(); }} />}
    </PageShell>
  );
}

function SubstanceEditor({ row, categories, onClose, onSaved }: { row: SubstanceRow | null; categories: string[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: row?.name ?? "",
    kind: row?.kind ?? "traditional",
    category: row?.category ?? "Medicinal plant",
    scientificName: row?.scientificName ?? "",
    amharicName: row?.amharicName ?? "",
    aliases: row?.aliases.join(", ") ?? "",
    properties: row?.properties ?? [],
    cautions: row?.cautions ?? {},
    notes: row?.notes ?? "",
    evidence: row?.evidence ?? "",
    status: row?.status ?? "published",
  });
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      const body = {
        ...form,
        scientificName: form.scientificName.trim() || undefined,
        amharicName: form.amharicName.trim() || undefined,
        aliases: form.aliases.split(/[,;]/).map((a) => a.trim()).filter(Boolean),
        notes: form.notes.trim() || undefined,
        evidence: form.evidence.trim() || undefined,
      };
      await apiFetch(row ? `/api/admin/safety/substances/${row.slug}` : "/api/admin/safety/substances", { method: row ? "PUT" : "POST", json: body });
      toast({ tone: "success", title: "Saved" });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Dialog open onClose={onClose} size="lg" title={row ? `Edit ${row.name}` : "Add a medicine or remedy"} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={form.name.trim().length < 2}>Save</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>{(c) => <Input {...c} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
        <Field label="Kind">{(c) => <Select {...c} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as "modern" | "traditional" })}><option value="traditional">Traditional</option><option value="modern">Modern medicine</option></Select>}</Field>
        <Field label="Group" hint="e.g. Medicinal plant, Antibiotics">{(c) => <><Input {...c} list="safety-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><datalist id="safety-categories">{categories.map((cat) => <option key={cat} value={cat} />)}</datalist></>}</Field>
        <Field label="Status">{(c) => <Select {...c} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></Select>}</Field>
        <Field label="Amharic name">{(c) => <Input {...c} lang="am" value={form.amharicName} onChange={(e) => setForm({ ...form, amharicName: e.target.value })} />}</Field>
        <Field label="Scientific name">{(c) => <Input {...c} value={form.scientificName} onChange={(e) => setForm({ ...form, scientificName: e.target.value })} />}</Field>
        <Field label="Other names" hint="Brands and local names, comma separated" className="sm:col-span-2">{(c) => <Input {...c} value={form.aliases} onChange={(e) => setForm({ ...form, aliases: e.target.value })} />}</Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold text-foreground">Properties</p>
          <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
            {Object.entries(PROPERTIES).map(([key, label]) => {
              const on = form.properties.includes(key);
              return (
                <button key={key} type="button" aria-pressed={on} onClick={() => setForm({ ...form, properties: on ? form.properties.filter((p) => p !== key) : [...form.properties, key] })} className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", on ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground")}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
          {CONDITIONS.map((condition) => (
            <Field key={condition} label={CONDITION_LABELS[condition]}>
              {(c) => (
                <Select {...c} value={form.cautions[condition]?.level ?? ""} onChange={(e) => {
                  const next = { ...form.cautions };
                  if (e.target.value) next[condition] = { level: e.target.value as "avoid" | "caution" };
                  else delete next[condition];
                  setForm({ ...form, cautions: next });
                }}>
                  <option value="">No specific warning</option>
                  <option value="caution">Caution</option>
                  <option value="avoid">Avoid</option>
                </Select>
              )}
            </Field>
          ))}
        </div>
        <Field label="Notes shown to users" className="sm:col-span-2">{(c) => <Textarea {...c} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />}</Field>
        <Field label="Evidence level" className="sm:col-span-2">{(c) => <Input {...c} value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="e.g. Clinical studies, Traditional use" />}</Field>
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}

function PairEditor({ row, substances, onClose, onSaved }: { row: InteractionRow | null; substances: SubstanceRow[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    a: row?.substanceA ?? "",
    b: row?.substanceB ?? "",
    severity: row?.severity ?? "moderate",
    mechanism: row?.mechanism ?? "",
    effect: row?.effect ?? "",
    management: row?.management ?? "",
    evidence: row?.evidence ?? "",
    source: row?.source ?? "",
    status: row?.status ?? "published",
  });
  const [error, setError] = useState<string | null>(null);
  const options = substances.filter((s) => s.status === "published");

  async function save() {
    setError(null);
    try {
      await apiFetch("/api/admin/safety/interactions", { method: "POST", json: form });
      toast({ tone: "success", title: "Interaction saved" });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const picker = (key: "a" | "b", label: string) => (
    <Field label={label} required>
      {(c) => (
        <Select {...c} value={form[key]} disabled={Boolean(row)} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
          <option value="">Choose…</option>
          {options.map((s) => <option key={s.slug} value={s.slug}>{s.name} ({s.kind === "traditional" ? "traditional" : s.category})</option>)}
        </Select>
      )}
    </Field>
  );

  return (
    <Dialog open onClose={onClose} size="lg" title={row ? "Edit documented pair" : "Add a documented pair"} description="Documented pairs override predictions for that pair." footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={!form.a || !form.b || form.a === form.b}>Save</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {picker("a", "First item")}
        {picker("b", "Second item")}
        <Field label="Severity">{(c) => <Select {...c} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>{SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}</Select>}</Field>
        <Field label="Status">{(c) => <Select {...c} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></Select>}</Field>
        <Field label="What happens" required className="sm:col-span-2">{(c) => <Textarea {...c} rows={2} value={form.effect} onChange={(e) => setForm({ ...form, effect: e.target.value })} />}</Field>
        <Field label="Why" required className="sm:col-span-2">{(c) => <Textarea {...c} rows={2} value={form.mechanism} onChange={(e) => setForm({ ...form, mechanism: e.target.value })} />}</Field>
        <Field label="What to do" required className="sm:col-span-2">{(c) => <Textarea {...c} rows={2} value={form.management} onChange={(e) => setForm({ ...form, management: e.target.value })} />}</Field>
        <Field label="Evidence level" required>{(c) => <Input {...c} value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="Clinical, Case reports…" />}</Field>
        <Field label="Source" required>{(c) => <Input {...c} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Reference or citation" />}</Field>
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}
