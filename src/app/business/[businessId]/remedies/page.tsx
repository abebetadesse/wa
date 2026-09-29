"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FlaskConical, Minus, PackagePlus, Pencil, Plus, X } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, PageHeader, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { formatEtb } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";

interface Ingredient {
  name: string;
  herbId: string | null;
  herbName?: string | null;
  scientificName?: string | null;
  safetyLevel?: string | null;
}

interface Remedy {
  id: string;
  name: string;
  nameAm: string | null;
  form: string;
  description: string | null;
  unit: string;
  stockQuantity: string;
  reorderLevel: string;
  priceEtb: string | null;
  safetyNotes: string | null;
  isActive: boolean;
  lowStock: boolean;
  ingredients: Ingredient[];
}

interface Herb {
  id: string;
  vernacularName: string;
  scientificName: string;
  amharicName: string | null;
  safetyLevel: string;
  contraindications: string | null;
}

const SAFETY_TONE: Record<string, "success" | "warning" | "danger"> = { safe: "success", caution: "warning", contraindicated: "danger", toxic: "danger" };
const FORMS = ["powder", "decoction", "infusion", "oil", "ointment", "tincture", "smoke / incense", "fresh leaves", "other"];

export default function RemediesPage() {
  const { business } = useWorkspace();
  const toast = useToast();
  const { data, error, reload } = useApi<Remedy[]>(`/api/workspace/businesses/${business.id}/remedies`, { liveTypes: ["remedy.", "stock."] });
  const [editing, setEditing] = useState<Remedy | "new" | null>(null);
  const [moving, setMoving] = useState<{ remedy: Remedy; reason: "restock" | "dispensed" | "waste" } | null>(null);
  const [filter, setFilter] = useState<"all" | "low">("all");

  const list = (data ?? []).filter((remedy) => filter === "all" || remedy.lowStock);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Remedies & stock" description="What you prepare, what it contains and how much you have." actions={<Button onClick={() => setEditing("new")}><Plus className="size-4" aria-hidden="true" /> Add remedy</Button>} className="mb-0" />
      <Alert tone="info" title="Safety first">
        Link ingredients to the herb knowledge base to see known cautions. Always ask clients about medicines, pregnancy and allergies before giving a remedy.
      </Alert>
      {data && data.some((r) => r.lowStock) && (
        <div className="flex gap-2">
          {(["all", "low"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", filter === value ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>
              {value === "all" ? "All remedies" : `Low stock (${data.filter((r) => r.lowStock).length})`}
            </button>
          ))}
        </div>
      )}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && data.length === 0 && <EmptyState title="No remedies yet" description="Track the remedies you prepare and get warned before you run out." action={<Button onClick={() => setEditing("new")}>Add a remedy</Button>} />}
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((remedy) => (
          <li key={remedy.id} className={cn("flex flex-col gap-3 rounded-3xl border bg-card p-5", remedy.lowStock ? "border-danger/40" : "border-border")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-display text-lg font-bold text-foreground"><FlaskConical className="size-5 text-brand" aria-hidden="true" /> {remedy.name}</p>
                {remedy.nameAm && <p lang="am" className="font-geez text-sm text-muted-foreground">{remedy.nameAm}</p>}
                <p className="text-xs capitalize text-muted-foreground">{remedy.form}{remedy.priceEtb ? ` · ${formatEtb(remedy.priceEtb)} per ${remedy.unit}` : ""}</p>
              </div>
              <div className="text-right">
                <p className={cn("font-display text-2xl font-extrabold", remedy.lowStock ? "text-danger" : "text-foreground")}>{Number(remedy.stockQuantity)}</p>
                <p className="text-xs text-muted-foreground">{remedy.unit} in stock</p>
              </div>
            </div>
            {remedy.lowStock && <p className="flex items-center gap-1.5 text-xs font-semibold text-danger"><AlertTriangle className="size-4" aria-hidden="true" /> At or below reorder level ({Number(remedy.reorderLevel)} {remedy.unit})</p>}
            {remedy.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {remedy.ingredients.map((ingredient) => (
                  <Badge key={`${ingredient.name}-${ingredient.herbId}`} tone={ingredient.safetyLevel ? SAFETY_TONE[ingredient.safetyLevel] ?? "neutral" : "neutral"} title={ingredient.scientificName ?? undefined}>
                    {ingredient.name}{ingredient.safetyLevel && ingredient.safetyLevel !== "safe" ? ` · ${ingredient.safetyLevel}` : ""}
                  </Badge>
                ))}
              </div>
            )}
            {remedy.safetyNotes && <p className="rounded-xl bg-warning/10 px-3 py-2 text-xs text-foreground">{remedy.safetyNotes}</p>}
            <div className="mt-auto flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setMoving({ remedy, reason: "restock" })}><PackagePlus className="size-4" aria-hidden="true" /> Restock</Button>
              <Button size="sm" variant="outline" onClick={() => setMoving({ remedy, reason: "dispensed" })}><Minus className="size-4" aria-hidden="true" /> Dispense</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(remedy)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
            </div>
          </li>
        ))}
      </ul>
      {editing && <RemedyEditor remedy={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={reload} />}
      {moving && (
        <StockDialog
          {...moving}
          onClose={() => setMoving(null)}
          onDone={(message) => {
            toast({ tone: "success", title: message });
            reload();
          }}
        />
      )}
    </div>
  );
}

function StockDialog({ remedy, reason: initialReason, onClose, onDone }: { remedy: Remedy; reason: "restock" | "dispensed" | "waste"; onClose: () => void; onDone: (message: string) => void }) {
  const { business } = useWorkspace();
  const [reason, setReason] = useState(initialReason);
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/remedies/${remedy.id}/stock`, { method: "POST", json: { quantity: Number(quantity), reason, note: note.trim() || undefined } });
      onDone(reason === "restock" ? `Added ${quantity} ${remedy.unit} of ${remedy.name}` : `Recorded ${quantity} ${remedy.unit} ${reason === "waste" ? "discarded" : "dispensed"}`);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} size="sm" title={`Update stock · ${remedy.name}`} description={`Currently ${Number(remedy.stockQuantity)} ${remedy.unit}`} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy || !(Number(quantity) > 0)}>{busy ? "Saving…" : "Save"}</Button></>}>
      <div className="flex flex-col gap-4">
        <Field label="What happened?">
          {(control) => (
            <Select {...control} value={reason} onChange={(e) => setReason(e.target.value as typeof reason)}>
              <option value="restock">Prepared or bought more (restock)</option>
              <option value="dispensed">Given to a client (dispensed)</option>
              <option value="waste">Expired or spoiled (waste)</option>
            </Select>
          )}
        </Field>
        <Field label={`Quantity (${remedy.unit})`} required>{(control) => <Input {...control} type="number" min="0" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} />}</Field>
        <Field label="Note (optional)">{(control) => <Input {...control} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </Dialog>
  );
}

function RemedyEditor({ remedy, onClose, onSaved }: { remedy: Remedy | null; onClose: () => void; onSaved: () => void }) {
  const { business } = useWorkspace();
  const toast = useToast();
  const [form, setForm] = useState({
    name: remedy?.name ?? "",
    nameAm: remedy?.nameAm ?? "",
    form: remedy?.form ?? "powder",
    description: remedy?.description ?? "",
    unit: remedy?.unit ?? "g",
    reorderLevel: remedy ? String(Number(remedy.reorderLevel)) : "0",
    priceEtb: remedy?.priceEtb ? String(Number(remedy.priceEtb)) : "",
    safetyNotes: remedy?.safetyNotes ?? "",
    isActive: remedy?.isActive ?? true,
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>(remedy?.ingredients ?? []);
  const [herbQuery, setHerbQuery] = useState("");
  const [herbResults, setHerbResults] = useState<Herb[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = herbQuery.trim();
    if (q.length < 2) {
      setHerbResults([]);
      return;
    }
    const timer = setTimeout(() => {
      apiFetch<Herb[]>(`/api/workspace/businesses/${business.id}/herbs?q=${encodeURIComponent(q)}`).then(setHerbResults).catch(() => setHerbResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [herbQuery, business.id]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/remedies${remedy ? `/${remedy.id}` : ""}`, {
        method: remedy ? "PUT" : "POST",
        json: {
          ...form,
          nameAm: form.nameAm || undefined,
          description: form.description || undefined,
          safetyNotes: form.safetyNotes || undefined,
          reorderLevel: Number(form.reorderLevel || 0),
          priceEtb: form.priceEtb ? Number(form.priceEtb) : undefined,
          ingredients: ingredients.map((ingredient) => ({ name: ingredient.name, herbId: ingredient.herbId ?? undefined })),
        },
      });
      toast({ tone: "success", title: remedy ? "Remedy updated" : "Remedy added" });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const risky = ingredients.filter((ingredient) => ingredient.safetyLevel && ingredient.safetyLevel !== "safe");

  return (
    <Dialog open onClose={onClose} size="lg" title={remedy ? "Edit remedy" : "Add a remedy"} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy || form.name.trim().length < 2 || !form.unit.trim()}>{busy ? "Saving…" : "Save remedy"}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>{(control) => <Input {...control} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />}</Field>
        <Field label="Name in Amharic">{(control) => <Input {...control} lang="am" className="font-geez" value={form.nameAm} onChange={(e) => setForm((f) => ({ ...f, nameAm: e.target.value }))} />}</Field>
        <Field label="Form">
          {(control) => (
            <Select {...control} value={form.form} onChange={(e) => setForm((f) => ({ ...f, form: e.target.value }))}>
              {FORMS.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Stock unit" required hint="e.g. g, ml, bottle, bundle">{(control) => <Input {...control} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />}</Field>
        <Field label="Warn me when stock falls to">{(control) => <Input {...control} type="number" min="0" value={form.reorderLevel} onChange={(e) => setForm((f) => ({ ...f, reorderLevel: e.target.value }))} />}</Field>
        <Field label="Price per unit (ETB, optional)">{(control) => <Input {...control} type="number" min="0" value={form.priceEtb} onChange={(e) => setForm((f) => ({ ...f, priceEtb: e.target.value }))} />}</Field>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <p className="text-sm font-semibold text-foreground">Ingredients</p>
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((ingredient, index) => (
              <span key={`${ingredient.name}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                {ingredient.name}
                {ingredient.safetyLevel && <Badge tone={SAFETY_TONE[ingredient.safetyLevel] ?? "neutral"} className="px-1.5 py-0">{ingredient.safetyLevel}</Badge>}
                <button type="button" onClick={() => setIngredients((list) => list.filter((_, i) => i !== index))} aria-label={`Remove ${ingredient.name}`}><X className="size-3.5" aria-hidden="true" /></button>
              </span>
            ))}
          </div>
          <div className="relative">
            <Input value={herbQuery} onChange={(e) => setHerbQuery(e.target.value)} placeholder="Search herbs (e.g. tena adam, damakesse) or type a name and press Enter" onKeyDown={(e) => {
              if (e.key === "Enter" && herbQuery.trim()) {
                e.preventDefault();
                setIngredients((list) => [...list, { name: herbQuery.trim(), herbId: null }]);
                setHerbQuery("");
              }
            }} />
            {herbResults.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-xl">
                {herbResults.map((herb) => (
                  <li key={herb.id}>
                    <button type="button" onClick={() => { setIngredients((list) => [...list, { name: herb.vernacularName, herbId: herb.id, scientificName: herb.scientificName, safetyLevel: herb.safetyLevel }]); setHerbQuery(""); setHerbResults([]); }} className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent">
                      <span>
                        <span className="font-semibold text-foreground">{herb.vernacularName}</span>
                        {herb.amharicName && <span lang="am" className="font-geez text-muted-foreground"> · {herb.amharicName}</span>}
                        <span className="block text-xs italic text-muted-foreground">{herb.scientificName}</span>
                      </span>
                      <Badge tone={SAFETY_TONE[herb.safetyLevel] ?? "neutral"}>{herb.safetyLevel}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {risky.length > 0 && (
            <Alert tone="warning" title="Ingredients that need care">
              {risky.map((ingredient) => ingredient.name).join(", ")} {risky.length === 1 ? "is" : "are"} marked as requiring caution in the herb knowledge base. Record who should avoid this remedy in the safety notes.
            </Alert>
          )}
        </div>

        <Field label="Safety notes for clients" hint="Who should not use it, and how to take it safely." className="sm:col-span-2">
          {(control) => <Textarea {...control} rows={3} value={form.safetyNotes} onChange={(e) => setForm((f) => ({ ...f, safetyNotes: e.target.value }))} />}
        </Field>
        <Field label="Description (optional)" className="sm:col-span-2">
          {(control) => <Textarea {...control} rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />}
        </Field>
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}
