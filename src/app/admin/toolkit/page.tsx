"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, RefreshCw, RotateCcw, Send, Trash2 } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, PageHeader, PageShell, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import { AUDIENCE_LABELS, GROUP_LABELS, STRAND_LABELS } from "@/features/toolkit/labels";
import { cn } from "@/lib/utils";

interface AdminTool {
  key: string;
  name: string;
  description: string;
  group: string;
  href: string;
  audience: string;
  strands: string[];
  suggestedFor: { categories: string[]; serviceKinds: string[] };
  source: "builtin" | "custom";
  customized: boolean;
  isActive: boolean;
  sortOrder: number;
  opens30: number;
  businesses30: number;
}

interface KnowledgeSet {
  id: string;
  name: string;
  description: string;
  toolKeys: string[];
  strands: string[];
  categorySlugs: string[];
  guidance: string | null;
  status: "draft" | "published" | "archived";
  version: number;
  publishedAt: string | null;
  updatedAt: string;
  subscribers: number;
}

interface CatalogueRow {
  slug: string;
  name: string;
  sector?: string;
}

type Tab = "tools" | "sets" | "insights";

export default function AdminToolkitPage() {
  const [tab, setTab] = useState<Tab>("sets");
  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Administration"
        title="Healer toolkit"
        description="Prepare the knowledge sets and tools healers use. Published sets reach matching businesses automatically, and every business gets recommendations from what it actually does."
      />
      <CulturalVisibility />
      <div role="tablist" className="my-6 flex flex-wrap gap-2">
        {([["sets", "Knowledge sets"], ["tools", "Tools & engines"], ["insights", "Usage"]] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("rounded-full px-4 py-2 text-sm font-semibold", tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>
      {tab === "sets" ? <SetsTab /> : tab === "tools" ? <ToolsTab /> : <InsightsTab />}
    </PageShell>
  );
}

// ── Marketplace visibility ───────────────────────────────────────────────────

function CulturalVisibility() {
  const toast = useToast();
  const { data, setData } = useApi<{ value: { culturalVisibility: "admins" | "everyone" } }>("/api/admin/settings/marketplace");
  if (!data) return null;
  const hidden = data.value.culturalVisibility === "admins";
  async function toggle() {
    try {
      setData(await apiFetch("/api/admin/settings/marketplace", { method: "PUT", json: { value: { culturalVisibility: hidden ? "everyone" : "admins" } } }));
      toast({ tone: "success", title: hidden ? "Cultural services are now visible to everyone" : "Cultural services are now hidden from clients" });
    } catch (err) {
      toast({ tone: "error", title: "Could not save", body: errorMessage(err) });
    }
  }
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4 pt-6">
        {hidden ? <EyeOff className="size-6 text-muted-foreground" aria-hidden="true" /> : <Eye className="size-6 text-success" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">Cultural services are {hidden ? "visible to administrators only" : "visible to everyone"}</p>
          <p className="text-sm text-muted-foreground">Covers the &ldquo;Cultural services&rdquo; menu, cultural categories in the directory, and cultural business pages. Their own teams can always open their workspace.</p>
        </div>
        <Button variant="outline" onClick={toggle}>{hidden ? "Show to everyone" : "Hide from clients"}</Button>
      </CardContent>
    </Card>
  );
}

// ── Knowledge sets ───────────────────────────────────────────────────────────

function useCatalogues() {
  const tools = useApi<AdminTool[]>("/api/admin/toolkit/tools");
  const categories = useApi<CatalogueRow[]>("/api/admin/marketplace/categories");
  return { tools, categories };
}

function SetsTab() {
  const toast = useToast();
  const { data, error, reload } = useApi<KnowledgeSet[]>("/api/admin/toolkit/sets");
  const { tools, categories } = useCatalogues();
  const [editing, setEditing] = useState<KnowledgeSet | "new" | null>(null);
  const [publishing, setPublishing] = useState<KnowledgeSet | null>(null);
  const [note, setNote] = useState("");

  async function publish(set: KnowledgeSet) {
    try {
      const result = await apiFetch<{ version: number; subscribers: number }>(`/api/admin/toolkit/sets/${set.id}/publish`, { method: "POST", json: { note: note.trim() || undefined } });
      toast({ tone: "success", title: `${set.name} v${result.version} published`, body: `${result.subscribers} ${result.subscribers === 1 ? "business" : "businesses"} updated.` });
      setPublishing(null);
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not publish", body: errorMessage(err) });
    }
  }

  async function archive(set: KnowledgeSet) {
    try {
      await apiFetch(`/api/admin/toolkit/sets/${set.id}/archive`, { method: "POST" });
      toast({ tone: "success", title: `${set.name} archived` });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not archive", body: errorMessage(err) });
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data || !tools.data) return <LoadingState />;
  const toolName = (key: string) => tools.data?.find((tool) => tool.key === key)?.name ?? key;
  const categoryName = (slug: string) => categories.data?.find((category) => category.slug === slug)?.name ?? slug;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}><Plus className="size-4" aria-hidden="true" /> New knowledge set</Button></div>
      {data.length === 0 && <EmptyState title="No knowledge sets yet" description="Bundle tools and knowledge strands for a kind of healer, then publish." />}
      {data.map((set) => {
        const unpublishedChanges = set.status === "published" && set.publishedAt && new Date(set.updatedAt).getTime() - new Date(set.publishedAt).getTime() > 2000;
        return (
          <Card key={set.id} className={cn(set.status === "archived" && "opacity-60")}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-foreground">{set.name}</h3>
                <Badge tone={set.status === "published" ? "success" : set.status === "draft" ? "warning" : "neutral"}>{set.status === "published" ? `Published v${set.version}` : set.status === "draft" ? "Draft" : "Archived"}</Badge>
                {unpublishedChanges && <Badge tone="warning">Unpublished changes</Badge>}
                <span className="ml-auto text-sm text-muted-foreground">{set.subscribers} {set.subscribers === 1 ? "business" : "businesses"}</span>
              </div>
              {set.description && <p className="text-sm text-muted-foreground">{set.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {set.toolKeys.map((key) => <Badge key={key} tone="brand">{toolName(key)}</Badge>)}
                {set.strands.map((strand) => <Badge key={strand} tone="neutral">{STRAND_LABELS[strand] ?? strand}</Badge>)}
              </div>
              <p className="text-xs text-muted-foreground">
                {set.categorySlugs.length ? `Delivered automatically to: ${set.categorySlugs.map(categoryName).join(", ")}` : "Not delivered automatically; businesses can follow it themselves."}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                {set.status !== "archived" && <Button size="sm" variant="ghost" onClick={() => archive(set)}>Archive</Button>}
                <Button size="sm" variant="outline" onClick={() => setEditing(set)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
                <Button size="sm" onClick={() => { setNote(""); setPublishing(set); }}><Send className="size-4" aria-hidden="true" /> {set.status === "published" ? "Publish update" : "Publish"}</Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {editing && (
        <SetEditor
          set={editing === "new" ? null : editing}
          tools={tools.data.filter((tool) => tool.isActive)}
          categories={categories.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}
      <Dialog
        open={Boolean(publishing)}
        onClose={() => setPublishing(null)}
        title={`Publish ${publishing?.name ?? ""}?`}
        description="Businesses in its categories receive it now, and everyone following it is notified."
        footer={<><Button variant="ghost" onClick={() => setPublishing(null)}>Cancel</Button><Button onClick={() => publishing && publish(publishing)}>Publish</Button></>}
      >
        <Field label="What changed? (optional)" hint="Shown to healers in their notification.">{(control) => <Textarea {...control} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
      </Dialog>
    </div>
  );
}

function Chips({ options, selected, onChange }: { options: { value: string; label: string }[]; selected: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const on = selected.includes(option.value);
        return (
          <button key={option.value} type="button" aria-pressed={on} onClick={() => onChange(on ? selected.filter((v) => v !== option.value) : [...selected, option.value])} className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", on ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground hover:text-foreground")}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SetEditor({ set, tools, categories, onClose, onSaved }: { set: KnowledgeSet | null; tools: AdminTool[]; categories: CatalogueRow[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: set?.name ?? "",
    description: set?.description ?? "",
    guidance: set?.guidance ?? "",
    toolKeys: set?.toolKeys ?? [],
    strands: set?.strands ?? [],
    categorySlugs: set?.categorySlugs ?? [],
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(set ? `/api/admin/toolkit/sets/${set.id}` : "/api/admin/toolkit/sets", { method: set ? "PUT" : "POST", json: { ...form, guidance: form.guidance.trim() || undefined } });
      toast({ tone: "success", title: set ? "Saved. Publish to deliver the changes." : "Knowledge set created as a draft" });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const groups = [...new Set(tools.map((tool) => tool.group))];
  return (
    <Dialog open onClose={onClose} size="lg" title={set ? `Edit ${set.name}` : "New knowledge set"} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy || form.name.trim().length < 2}>{busy ? "Saving…" : "Save"}</Button></>}>
      <div className="flex flex-col gap-4">
        <Field label="Name" required>{(control) => <Input {...control} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rainy-season herbal practice" />}</Field>
        <Field label="Description">{(control) => <Textarea {...control} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}</Field>
        <Field label="Guidance for healers (optional)" hint="How to use this set well; shown when it updates.">{(control) => <Textarea {...control} rows={3} value={form.guidance} onChange={(e) => setForm({ ...form, guidance: e.target.value })} />}</Field>
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Tools</p>
          {groups.map((group) => (
            <div key={group} className="mb-3">
              <p className="mb-1 text-xs text-muted-foreground">{GROUP_LABELS[group] ?? group}</p>
              <Chips options={tools.filter((tool) => tool.group === group).map((tool) => ({ value: tool.key, label: tool.name }))} selected={form.toolKeys} onChange={(toolKeys) => setForm({ ...form, toolKeys })} />
            </div>
          ))}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Knowledge strands</p>
          <Chips options={Object.entries(STRAND_LABELS).map(([value, label]) => ({ value, label }))} selected={form.strands} onChange={(strands) => setForm({ ...form, strands })} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Deliver automatically to</p>
          <Chips options={categories.map((category) => ({ value: category.slug, label: category.name }))} selected={form.categorySlugs} onChange={(categorySlugs) => setForm({ ...form, categorySlugs })} />
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </Dialog>
  );
}

// ── Tools ────────────────────────────────────────────────────────────────────

function ToolsTab() {
  const toast = useToast();
  const { tools, categories } = useCatalogues();
  const kinds = useApi<CatalogueRow[]>("/api/admin/marketplace/service-kinds");
  const [editing, setEditing] = useState<AdminTool | "new" | null>(null);

  async function sync() {
    try {
      tools.setData(await apiFetch<AdminTool[]>("/api/admin/toolkit/sync", { method: "POST" }));
      toast({ tone: "success", title: "Tools are up to date with the latest engines" });
    } catch (err) {
      toast({ tone: "error", title: "Sync failed", body: errorMessage(err) });
    }
  }

  async function resetOrDelete(tool: AdminTool) {
    try {
      await apiFetch(`/api/admin/toolkit/tools/${encodeURIComponent(tool.key)}`, { method: "DELETE" });
      toast({ tone: "success", title: tool.source === "custom" ? `${tool.name} deleted` : `${tool.name} reset` });
      tools.reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not update", body: errorMessage(err) });
    }
  }

  if (tools.error) return <ErrorState message={tools.error} onRetry={tools.reload} />;
  if (!tools.data) return <LoadingState />;
  const groups = [...new Set(tools.data.map((tool) => tool.group))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={sync}><RefreshCw className="size-4" aria-hidden="true" /> Check for new engines</Button>
        <Button onClick={() => setEditing("new")}><Plus className="size-4" aria-hidden="true" /> Add a tool</Button>
      </div>
      {groups.map((group) => (
        <Card key={group}>
          <CardHeader><CardTitle className="text-base">{GROUP_LABELS[group] ?? group}</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border pt-0">
            {tools.data!.filter((tool) => tool.group === group).map((tool) => (
              <div key={tool.key} className={cn("flex flex-wrap items-center gap-3 py-3", !tool.isActive && "opacity-60")}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {tool.name} {!tool.isActive && <Badge tone="neutral">Hidden</Badge>} {tool.source === "custom" && <Badge tone="gold">Custom</Badge>} {tool.customized && tool.source === "builtin" && <Badge tone="warning">Edited</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{tool.href} · {AUDIENCE_LABELS[tool.audience] ?? tool.audience} · {tool.strands.map((strand) => STRAND_LABELS[strand] ?? strand).join(", ") || "no strands"}</p>
                </div>
                <span className="text-xs text-muted-foreground">{tool.opens30} opens · {tool.businesses30} businesses (30 days)</span>
                <Button size="sm" variant="ghost" onClick={() => setEditing(tool)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
                {(tool.customized || tool.source === "custom") && (
                  <Button size="sm" variant="ghost" onClick={() => resetOrDelete(tool)} title={tool.source === "custom" ? "Delete" : "Back to the built-in wording"}>
                    {tool.source === "custom" ? <Trash2 className="size-4" aria-hidden="true" /> : <RotateCcw className="size-4" aria-hidden="true" />}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {editing && <ToolEditor tool={editing === "new" ? null : editing} categories={categories.data ?? []} kinds={kinds.data ?? []} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); tools.reload(); }} />}
    </div>
  );
}

function ToolEditor({ tool, categories, kinds, onClose, onSaved }: { tool: AdminTool | null; categories: CatalogueRow[]; kinds: CatalogueRow[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: tool?.name ?? "",
    description: tool?.description ?? "",
    group: tool?.group ?? "practice",
    href: tool?.href ?? "",
    audience: tool?.audience ?? "practitioner",
    strands: tool?.strands ?? [],
    categories: tool?.suggestedFor.categories ?? [],
    serviceKinds: tool?.suggestedFor.serviceKinds ?? [],
    isActive: tool?.isActive ?? true,
    sortOrder: tool?.sortOrder ?? 1000,
  });
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      const body = { name: form.name, description: form.description, group: form.group, href: form.href, audience: form.audience, strands: form.strands, suggestedFor: { categories: form.categories, serviceKinds: form.serviceKinds }, isActive: form.isActive, sortOrder: form.sortOrder };
      await apiFetch(tool ? `/api/admin/toolkit/tools/${encodeURIComponent(tool.key)}` : "/api/admin/toolkit/tools", { method: tool ? "PUT" : "POST", json: body });
      toast({ tone: "success", title: "Tool saved" });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Dialog open onClose={onClose} size="lg" title={tool ? `Edit ${tool.name}` : "Add a tool"} description={tool?.source === "builtin" ? "Your edits are kept when the engine is updated. Use reset to go back to the built-in wording." : "Link a page on this site or a trusted external resource."} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={form.name.trim().length < 2 || !form.href}>Save</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>{(control) => <Input {...control} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
        <Field label="Link" required hint="/page on this site, or https://…">{(control) => <Input {...control} value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />}</Field>
        <Field label="Description" className="sm:col-span-2">{(control) => <Textarea {...control} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}</Field>
        <Field label="Group">{(control) => <Select {...control} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>{Object.entries(GROUP_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>}</Field>
        <Field label="Who can see it">{(control) => <Select {...control} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>{Object.entries(AUDIENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>}</Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold text-foreground">Knowledge strands</p>
          <Chips options={Object.entries(STRAND_LABELS).map(([value, label]) => ({ value, label }))} selected={form.strands} onChange={(strands) => setForm({ ...form, strands })} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold text-foreground">Best for these kinds of business</p>
          <Chips options={categories.map((c) => ({ value: c.slug, label: c.name }))} selected={form.categories} onChange={(next) => setForm({ ...form, categories: next })} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold text-foreground">Best for these services</p>
          <Chips options={kinds.map((k) => ({ value: k.slug, label: k.name }))} selected={form.serviceKinds} onChange={(next) => setForm({ ...form, serviceKinds: next })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="size-4 accent-[var(--brand-accent)]" />
          Available (unticked tools disappear from menus and toolkits)
        </label>
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}

// ── Usage ────────────────────────────────────────────────────────────────────

function InsightsTab() {
  const { data, error, reload } = useApi<{ activeBusinesses: number; byCategory: { category: string; tools: { toolKey: string; name: string; opens: number }[] }[] }>("/api/admin/toolkit/insights");
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Businesses using the toolkit (30 days)</p>
          <p className="font-display text-3xl font-extrabold text-foreground">{data.activeBusinesses}</p>
        </CardContent>
      </Card>
      {data.byCategory.length === 0 ? (
        <EmptyState title="No tool use recorded yet" description="Usage appears here as healers open tools." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.byCategory.map((entry) => (
            <Card key={entry.category}>
              <CardHeader>
                <CardTitle className="text-base">{entry.category}</CardTitle>
                <CardDescription>Most-opened tools, a good starting point for this category&apos;s knowledge set.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {entry.tools.map((tool) => (
                  <div key={tool.toolKey} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{tool.name}</span>
                    <span className="tabular-nums text-muted-foreground">{tool.opens}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
