"use client";

import { useState } from "react";
import { BookOpen, Camera, FileText, Mic, Pencil, Plus, Trash2, Video, Zap } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, PageHeader, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { cn } from "@/lib/utils";

type DropdownType = "none" | "custom" | "metsehafe_fewus" | "awde_negest";

interface IntakeRow {
  serviceId: string;
  serviceName: string;
  isActive: boolean;
  settings: { allowText: boolean; allowImage: boolean; allowAudio: boolean; allowVideo: boolean; dropdownType: DropdownType; dropdownLabel: string | null; textPrompt: string | null; customDropdownOptions: { value: string; label: string }[] };
  config: { options: { value: string; label: string }[] };
}

interface Rule {
  id: string;
  name: string;
  serviceId: string | null;
  isActive: boolean;
  triggerCriteria: { dropdownValues?: string[]; keywords?: string[]; digitalRoots?: number[]; humors?: string[]; minUrgency?: number; maxUrgency?: number };
  responseMode: "instant_auto_send" | "draft_for_review";
  templateTitle: string;
  templateBody: string;
  attachedRemedies: { remedyId?: string; name: string; note?: string }[];
  includeFewusText: boolean;
  includeProfile: boolean;
  priority: number;
}

interface FewusLibrary {
  headings: { key: string; titleAm: string; titleEn: string; bookMatch: string; bookReferences: { number: number; titleGeez: string; page: number }[]; text: { geezText: string | null; amharicText: string | null; guidance: string | null } | null }[];
  contents: { number: number; titleGeez: string; gloss: string; page: number }[];
}

const DROPDOWN_LABELS: Record<DropdownType, string> = { none: "No list", custom: "My own list", metsehafe_fewus: "መጽሐፈ ፈውስ headings", awde_negest: "አውደ ነገሥት question types" };
const HUMORS = [["esat", "እሳት Fire"], ["may", "ማይ Water"], ["nifas", "ነፋስ Air"], ["afere", "አፈር Earth"]] as const;
const VARIABLES = ["client_name", "service_name", "business_name", "booking_reference", "booking_time", "selection", "digital_root", "circle", "humor"];

type Tab = "intake" | "rules" | "fewus";

export default function AutomationPage() {
  const { can } = useWorkspace();
  const manage = can("manageServices");
  const [tab, setTab] = useState<Tab>(manage ? "intake" : "fewus");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Intake & automation" description="What clients share when they book, the responses that go out on their own or wait for you, and your Metsehafe Fewus texts." className="mb-0" />
      <div role="tablist" className="flex flex-wrap gap-2">
        {([["intake", "Intake forms", manage], ["rules", "Auto-responses", manage], ["fewus", "Fewus library", true]] as const).filter(([, , show]) => show).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("rounded-full px-4 py-2 text-sm font-semibold", tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{label}</button>
        ))}
      </div>
      {tab === "intake" ? <IntakeForms /> : tab === "rules" ? <Rules /> : <FewusTexts />}
    </div>
  );
}

// ── Intake forms ─────────────────────────────────────────────────────────────

function IntakeForms() {
  const { business } = useWorkspace();
  const { data, error, reload } = useApi<IntakeRow[]>(`/api/workspace/businesses/${business.id}/intake-settings`);
  const [editing, setEditing] = useState<IntakeRow | null>(null);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  if (!data.length) return <EmptyState title="Add a service first" />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.map((row) => (
        <Card key={row.serviceId} className={cn(!row.isActive && "opacity-60")}>
          <CardContent className="flex flex-col gap-3 pt-5">
            <div className="flex items-start gap-2">
              <p className="flex-1 font-semibold text-foreground">{row.serviceName}</p>
              <Button size="sm" variant="ghost" onClick={() => setEditing(row)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.settings.allowText && <Badge tone="neutral"><FileText className="size-3" aria-hidden="true" /> Text</Badge>}
              {row.settings.allowImage && <Badge tone="neutral"><Camera className="size-3" aria-hidden="true" /> Photos</Badge>}
              {row.settings.allowAudio && <Badge tone="neutral"><Mic className="size-3" aria-hidden="true" /> Voice</Badge>}
              {row.settings.allowVideo && <Badge tone="neutral"><Video className="size-3" aria-hidden="true" /> Video</Badge>}
              {row.settings.dropdownType !== "none" && <Badge tone="gold">{DROPDOWN_LABELS[row.settings.dropdownType]}</Badge>}
            </div>
          </CardContent>
        </Card>
      ))}
      {editing && <IntakeEditor row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </div>
  );
}

function IntakeEditor({ row, onClose, onSaved }: { row: IntakeRow; onClose: () => void; onSaved: () => void }) {
  const { business } = useWorkspace();
  const toast = useToast();
  const [form, setForm] = useState({ ...row.settings, dropdownLabel: row.settings.dropdownLabel ?? "", textPrompt: row.settings.textPrompt ?? "" });
  const [optionsText, setOptionsText] = useState(row.settings.customDropdownOptions.map((o) => o.label).join("\n"));
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const labels = optionsText.split("\n").map((l) => l.trim()).filter(Boolean);
    const customDropdownOptions = labels.map((label, i) => ({ value: label.toLowerCase().normalize("NFKD").replace(/[^a-z0-9ሀ-፿]+/g, "-").replace(/^-|-$/g, "") || `option-${i + 1}`, label }));
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/intake-settings/${row.serviceId}`, {
        method: "PUT",
        json: { allowText: form.allowText, allowImage: form.allowImage, allowAudio: form.allowAudio, allowVideo: form.allowVideo, dropdownType: form.dropdownType, dropdownLabel: form.dropdownLabel.trim() || undefined, textPrompt: form.textPrompt.trim() || undefined, customDropdownOptions: form.dropdownType === "custom" ? customDropdownOptions : [] },
      });
      toast({ tone: "success", title: "Intake saved", body: "Clients see it the next time they book." });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const toggle = (key: "allowText" | "allowImage" | "allowAudio" | "allowVideo", label: string, hint: string) => (
    <label className="flex items-start gap-3 rounded-2xl border border-border p-3">
      <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="mt-1 size-4 accent-[var(--brand-accent)]" />
      <span><span className="block font-semibold text-foreground">{label}</span><span className="text-xs text-muted-foreground">{hint}</span></span>
    </label>
  );

  return (
    <Dialog open onClose={onClose} size="lg" title={`Intake for ${row.serviceName}`} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></>}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {toggle("allowText", "Written description", "Clients describe things in their own words.")}
          {toggle("allowImage", "Photos", "Skin marks, tongue, swelling, documents.")}
          {toggle("allowAudio", "Voice notes", "Recorded in the browser; good for those who prefer speaking.")}
          {toggle("allowVideo", "Video", "Short clips of movement, tremor or breathing.")}
        </div>
        <Field label="Dropdown list">
          {(c) => (
            <Select {...c} value={form.dropdownType} onChange={(e) => setForm({ ...form, dropdownType: e.target.value as DropdownType })}>
              {Object.entries(DROPDOWN_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          )}
        </Field>
        {form.dropdownType !== "none" && <Field label="Question above the list (optional)">{(c) => <Input {...c} value={form.dropdownLabel} onChange={(e) => setForm({ ...form, dropdownLabel: e.target.value })} />}</Field>}
        {form.dropdownType === "custom" && <Field label="Options, one per line" hint="At least two.">{(c) => <Textarea {...c} rows={5} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} />}</Field>}
        {form.dropdownType === "awde_negest" && <Alert tone="info">Clients will also be asked for their name (and optionally their mother&apos;s name) in Ge&apos;ez letters, with a letter picker and live name reckoning.</Alert>}
        {form.allowText && <Field label="Prompt above the text box (optional)">{(c) => <Input {...c} value={form.textPrompt} onChange={(e) => setForm({ ...form, textPrompt: e.target.value })} placeholder="e.g. Where is the pain, and since when?" />}</Field>}
        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </Dialog>
  );
}

// ── Auto-response rules ──────────────────────────────────────────────────────

function Rules() {
  const { business } = useWorkspace();
  const toast = useToast();
  const rules = useApi<Rule[]>(`/api/workspace/businesses/${business.id}/auto-responses`);
  const intake = useApi<IntakeRow[]>(`/api/workspace/businesses/${business.id}/intake-settings`);
  const remedies = useApi<{ id: string; name: string }[]>(`/api/workspace/businesses/${business.id}/remedies`);
  const [editing, setEditing] = useState<Rule | "new" | null>(null);

  async function remove(rule: Rule) {
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/auto-responses/${rule.id}`, { method: "DELETE" });
      toast({ tone: "success", title: "Rule deleted" });
      rules.reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not delete", body: errorMessage(err) });
    }
  }

  if (rules.error) return <ErrorState message={rules.error} onRetry={rules.reload} />;
  if (!rules.data || !intake.data) return <LoadingState />;
  const serviceName = (id: string | null) => (id ? intake.data!.find((s) => s.serviceId === id)?.serviceName ?? "a service" : "All services");

  return (
    <div className="flex flex-col gap-4">
      <Alert tone="info">
        Rules run the moment a booking arrives. Plain acknowledgements can go out instantly; anything with remedies or Fewus texts, and any intake that mentions danger signs, is held as a draft for you to approve on the booking&apos;s review page.
      </Alert>
      <div className="flex justify-end"><Button onClick={() => setEditing("new")}><Plus className="size-4" aria-hidden="true" /> New rule</Button></div>
      {rules.data.length === 0 && <EmptyState title="No rules yet" description="Start with an instant acknowledgement for every booking." />}
      {rules.data.map((rule) => (
        <Card key={rule.id} className={cn(!rule.isActive && "opacity-60")}>
          <CardContent className="flex flex-wrap items-center gap-3 pt-5">
            <Zap className={cn("size-5", rule.responseMode === "instant_auto_send" ? "text-gold" : "text-brand")} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{rule.name} {!rule.isActive && <Badge tone="neutral">Paused</Badge>}</p>
              <p className="text-xs text-muted-foreground">
                {serviceName(rule.serviceId)} · {rule.responseMode === "instant_auto_send" ? "Sends instantly" : "Draft for review"}
                {rule.triggerCriteria.dropdownValues?.length ? ` · ${rule.triggerCriteria.dropdownValues.length} selection(s)` : ""}
                {rule.triggerCriteria.keywords?.length ? ` · words: ${rule.triggerCriteria.keywords.join(", ")}` : ""}
                {rule.triggerCriteria.digitalRoots?.length ? ` · root ${rule.triggerCriteria.digitalRoots.join("/")}` : ""}
                {rule.triggerCriteria.humors?.length ? ` · ${rule.triggerCriteria.humors.join("/")}` : ""}
                {rule.attachedRemedies.length ? ` · ${rule.attachedRemedies.length} remedy` : ""}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditing(rule)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(rule)} aria-label={`Delete ${rule.name}`}><Trash2 className="size-4" aria-hidden="true" /></Button>
          </CardContent>
        </Card>
      ))}
      {editing && <RuleEditor rule={editing === "new" ? null : editing} services={intake.data} remedies={remedies.data ?? []} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); rules.reload(); }} />}
    </div>
  );
}

function RuleEditor({ rule, services, remedies, onClose, onSaved }: { rule: Rule | null; services: IntakeRow[]; remedies: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const { business } = useWorkspace();
  const toast = useToast();
  const [form, setForm] = useState({
    name: rule?.name ?? "",
    serviceId: rule?.serviceId ?? "",
    isActive: rule?.isActive ?? true,
    responseMode: rule?.responseMode ?? "draft_for_review",
    templateTitle: rule?.templateTitle ?? "",
    templateBody: rule?.templateBody ?? "",
    includeFewusText: rule?.includeFewusText ?? false,
    includeProfile: rule?.includeProfile ?? false,
    priority: rule?.priority ?? 100,
    dropdownValues: rule?.triggerCriteria.dropdownValues ?? [],
    keywords: (rule?.triggerCriteria.keywords ?? []).join(", "),
    digitalRoots: rule?.triggerCriteria.digitalRoots ?? [],
    humors: rule?.triggerCriteria.humors ?? [],
    maxUrgency: rule?.triggerCriteria.maxUrgency?.toString() ?? "",
    remedyIds: (rule?.attachedRemedies ?? []).map((r) => r.remedyId).filter(Boolean) as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const selected = services.find((s) => s.serviceId === form.serviceId);
  const options = selected ? selected.config.options : services.flatMap((s) => s.config.options).filter((o, i, all) => all.findIndex((x) => x.value === o.value) === i);
  const hasRemedies = form.remedyIds.length > 0 || form.includeFewusText;

  async function save() {
    setError(null);
    const body = {
      name: form.name,
      serviceId: form.serviceId || null,
      isActive: form.isActive,
      responseMode: hasRemedies ? "draft_for_review" : form.responseMode,
      templateTitle: form.templateTitle,
      templateBody: form.templateBody,
      includeFewusText: form.includeFewusText,
      includeProfile: form.includeProfile,
      priority: Number(form.priority) || 100,
      attachedRemedies: form.remedyIds.map((id) => ({ remedyId: id, name: remedies.find((r) => r.id === id)?.name ?? "Remedy" })),
      triggerCriteria: {
        ...(form.dropdownValues.length ? { dropdownValues: form.dropdownValues } : {}),
        ...(form.keywords.trim() ? { keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean) } : {}),
        ...(form.digitalRoots.length ? { digitalRoots: form.digitalRoots } : {}),
        ...(form.humors.length ? { humors: form.humors } : {}),
        ...(form.maxUrgency ? { maxUrgency: Number(form.maxUrgency) } : {}),
      },
    };
    try {
      await apiFetch(rule ? `/api/workspace/businesses/${business.id}/auto-responses/${rule.id}` : `/api/workspace/businesses/${business.id}/auto-responses`, { method: rule ? "PUT" : "POST", json: body });
      toast({ tone: "success", title: "Rule saved" });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const chip = (on: boolean, label: string, onClick: () => void) => (
    <button key={label} type="button" aria-pressed={on} onClick={onClick} className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", on ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground")}>{label}</button>
  );
  const flip = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <Dialog open onClose={onClose} size="lg" title={rule ? `Edit ${rule.name}` : "New auto-response rule"} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={form.name.trim().length < 2 || form.templateBody.trim().length < 2}>Save</Button></>}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Rule name" required>{(c) => <Input {...c} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
          <Field label="Service">{(c) => <Select {...c} value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value, dropdownValues: [] })}><option value="">All services</option>{services.map((s) => <option key={s.serviceId} value={s.serviceId}>{s.serviceName}</option>)}</Select>}</Field>
        </div>

        <fieldset className="flex flex-col gap-3 rounded-2xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-foreground">When (all that you set must match)</legend>
          {options.length > 0 && <div><p className="mb-1.5 text-xs text-muted-foreground">Client chose one of</p><div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">{options.map((o) => chip(form.dropdownValues.includes(o.value), o.label, () => setForm({ ...form, dropdownValues: flip(form.dropdownValues, o.value) })))}</div></div>}
          <Field label="Their words include (comma separated)" hint="Any language, e.g. ራስ ምታት, headache">{(c) => <Input {...c} value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />}</Field>
          <div><p className="mb-1.5 text-xs text-muted-foreground">Ge&apos;ez name digital root</p><div className="flex flex-wrap gap-1.5">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => chip(form.digitalRoots.includes(n), String(n), () => setForm({ ...form, digitalRoots: flip(form.digitalRoots, n) })))}</div></div>
          <div><p className="mb-1.5 text-xs text-muted-foreground">Humour (from the Awde Negest circle)</p><div className="flex flex-wrap gap-1.5">{HUMORS.map(([key, label]) => chip(form.humors.includes(key), label, () => setForm({ ...form, humors: flip(form.humors, key) })))}</div></div>
          <Field label="Only when urgency is at most (0–100, optional)">{(c) => <Input {...c} inputMode="numeric" value={form.maxUrgency} onChange={(e) => setForm({ ...form, maxUrgency: e.target.value.replace(/\D/g, "").slice(0, 3) })} className="w-28" />}</Field>
        </fieldset>

        <fieldset className="flex flex-col gap-3 rounded-2xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-foreground">Then</legend>
          <Field label="Title" required>{(c) => <Input {...c} value={form.templateTitle} onChange={(e) => setForm({ ...form, templateTitle: e.target.value })} />}</Field>
          <Field label="Message" required hint={`You can use: ${VARIABLES.map((v) => `{{${v}}}`).join(" ")}`}>{(c) => <Textarea {...c} rows={6} value={form.templateBody} onChange={(e) => setForm({ ...form, templateBody: e.target.value })} />}</Field>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.includeFewusText} onChange={(e) => setForm({ ...form, includeFewusText: e.target.checked })} className="size-4 accent-[var(--brand-accent)]" /> Add my Fewus text for the chosen heading</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.includeProfile} onChange={(e) => setForm({ ...form, includeProfile: e.target.checked })} className="size-4 accent-[var(--brand-accent)]" /> Add the name reckoning & Awde Negest reading</label>
          </div>
          {remedies.length > 0 && <div><p className="mb-1.5 text-xs text-muted-foreground">Remedies to suggest</p><div className="flex flex-wrap gap-1.5">{remedies.map((r) => chip(form.remedyIds.includes(r.id), r.name, () => setForm({ ...form, remedyIds: flip(form.remedyIds, r.id) })))}</div></div>}
          <Field label="How it goes out">
            {(c) => (
              <Select {...c} value={hasRemedies ? "draft_for_review" : form.responseMode} disabled={hasRemedies} onChange={(e) => setForm({ ...form, responseMode: e.target.value as Rule["responseMode"] })}>
                <option value="instant_auto_send">Send instantly</option>
                <option value="draft_for_review">Draft for my review</option>
              </Select>
            )}
          </Field>
          {hasRemedies && <p className="text-xs text-muted-foreground">Responses with remedies or Fewus texts always wait for your approval.</p>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="size-4 accent-[var(--brand-accent)]" /> Active</label>
        </fieldset>
        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </Dialog>
  );
}

// ── Fewus library ────────────────────────────────────────────────────────────

function FewusTexts() {
  const { business } = useWorkspace();
  const toast = useToast();
  const { data, error, reload } = useApi<FewusLibrary>(`/api/workspace/businesses/${business.id}/fewus`);
  const [editing, setEditing] = useState<FewusLibrary["headings"][number] | null>(null);
  const [form, setForm] = useState({ geezText: "", amharicText: "", guidance: "" });

  async function save() {
    if (!editing) return;
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/fewus/${editing.key}`, { method: "PUT", json: form });
      toast({ tone: "success", title: "Saved" });
      setEditing(null);
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not save", body: errorMessage(err) });
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  return (
    <div className="flex flex-col gap-4">
      <Alert tone="info" title="Your own texts">
        The platform indexes the book&apos;s table of contents only. Record the prayer, formula and remedy text you use for each heading; it fills the booking review and any rule that includes it.
      </Alert>
      <div className="grid gap-3 md:grid-cols-2">
        {data.headings.map((heading) => (
          <Card key={heading.key}>
            <CardContent className="flex flex-col gap-2 pt-5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p lang="am" className="font-geez font-semibold text-foreground">{heading.titleAm}</p>
                  <p className="text-xs text-muted-foreground">{heading.titleEn}{heading.bookReferences.length ? ` · pages ${heading.bookReferences.map((r) => r.page).join(", ")}` : " · no dedicated heading in the book"}</p>
                </div>
                {heading.text?.geezText || heading.text?.amharicText ? <Badge tone="success">Written</Badge> : <Badge tone="neutral">Empty</Badge>}
              </div>
              <Button size="sm" variant="outline" className="self-end" onClick={() => { setEditing(heading); setForm({ geezText: heading.text?.geezText ?? "", amharicText: heading.text?.amharicText ?? "", guidance: heading.text?.guidance ?? "" }); }}>
                <Pencil className="size-4" aria-hidden="true" /> {heading.text ? "Edit" : "Write"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="size-4" aria-hidden="true" /> <span lang="am" className="font-geez">ማውጫ</span> · the book&apos;s table of contents</CardTitle><CardDescription>38 headings, read from the scanned edition.</CardDescription></CardHeader>
        <CardContent>
          <ol className="grid gap-1 text-sm sm:grid-cols-2">
            {data.contents.map((entry) => <li key={entry.number} className="flex gap-2"><span className="w-6 text-right tabular-nums text-muted-foreground">{entry.number}.</span><span className="min-w-0 flex-1"><span lang="am" className="font-geez text-foreground">{entry.titleGeez}</span> <span className="text-xs text-muted-foreground">{entry.gloss} · p. {entry.page}</span></span></li>)}
          </ol>
        </CardContent>
      </Card>
      {editing && (
        <Dialog open onClose={() => setEditing(null)} size="lg" title={editing.titleAm} description={editing.titleEn} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
          <div className="flex flex-col gap-3">
            <Field label="Ge'ez prayer or formula">{(c) => <Textarea {...c} lang="am" className="font-geez" rows={5} value={form.geezText} onChange={(e) => setForm({ ...form, geezText: e.target.value })} />}</Field>
            <Field label="Amharic remedy text">{(c) => <Textarea {...c} lang="am" rows={5} value={form.amharicText} onChange={(e) => setForm({ ...form, amharicText: e.target.value })} />}</Field>
            <Field label="Guidance and cautions">{(c) => <Textarea {...c} rows={3} value={form.guidance} onChange={(e) => setForm({ ...form, guidance: e.target.value })} />}</Field>
          </div>
        </Dialog>
      )}
    </div>
  );
}
