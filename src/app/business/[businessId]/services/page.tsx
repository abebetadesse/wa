"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, ShieldCheck } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, PageHeader, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { MODE_LABELS, formatEtb } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  kindId: string;
  name: string;
  nameAm: string | null;
  description: string | null;
  durationMinutes: number;
  priceEtb: string;
  deliveryModes: string[];
  bufferMinutes: number;
  isActive: boolean;
  sortOrder: number;
  kind: { id: string; name: string; requiresSafetyScreen: boolean };
}

interface Kind {
  id: string;
  name: string;
  nameAm: string | null;
  description: string | null;
  requiresSafetyScreen: boolean;
}

export default function ServicesPage() {
  const { business } = useWorkspace();
  const { data, error, reload } = useApi<Service[]>(`/api/workspace/businesses/${business.id}/services`, { liveTypes: ["service."] });
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description="What clients can book, how long it takes and what it costs."
        actions={<Button onClick={() => setEditing("new")}><Plus className="size-4" aria-hidden="true" /> Add service</Button>}
        className="mb-0"
      />
      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && data.length === 0 && (
        <EmptyState title="No services yet" description="Add your first service so clients can book you." action={<Button onClick={() => setEditing("new")}>Add a service</Button>} />
      )}
      {data && data.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.map((service) => (
            <li key={service.id} className={cn("flex flex-col gap-3 rounded-3xl border bg-card p-5", service.isActive ? "border-border" : "border-dashed border-border opacity-70")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-foreground">{service.name}</p>
                  {service.nameAm && <p lang="am" className="font-geez text-sm text-muted-foreground">{service.nameAm}</p>}
                </div>
                <p className="font-display text-lg font-extrabold text-foreground">{formatEtb(service.priceEtb)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">{service.kind.name}</Badge>
                <Badge tone="neutral"><Clock className="size-3" aria-hidden="true" /> {service.durationMinutes} min{service.bufferMinutes ? ` + ${service.bufferMinutes} break` : ""}</Badge>
                {service.kind.requiresSafetyScreen && <Badge tone="warning"><ShieldCheck className="size-3" aria-hidden="true" /> Safety questions</Badge>}
                {!service.isActive && <Badge tone="danger">Hidden</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{service.deliveryModes.map((mode) => MODE_LABELS[mode]?.label ?? mode).join(" · ")}</p>
              <Button variant="outline" size="sm" className="self-start" onClick={() => setEditing(service)}>
                <Pencil className="size-4" aria-hidden="true" /> Edit
              </Button>
            </li>
          ))}
        </ul>
      )}
      {editing && <ServiceEditor service={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={reload} />}
    </div>
  );
}

function ServiceEditor({ service, onClose, onSaved }: { service: Service | null; onClose: () => void; onSaved: () => void }) {
  const { business } = useWorkspace();
  const toast = useToast();
  const kinds = useApi<{ serviceKinds: Kind[] }>("/api/marketplace/catalogue");
  const [form, setForm] = useState({
    kindId: service?.kindId ?? "",
    name: service?.name ?? "",
    nameAm: service?.nameAm ?? "",
    description: service?.description ?? "",
    durationMinutes: String(service?.durationMinutes ?? 60),
    priceEtb: service ? String(Number(service.priceEtb)) : "",
    bufferMinutes: String(service?.bufferMinutes ?? 0),
    isActive: service?.isActive ?? true,
  });
  const [modes, setModes] = useState<string[]>(service?.deliveryModes ?? business.deliveryModes.slice(0, 1));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const kind = kinds.data?.serviceKinds.find((k) => k.id === form.kindId);

  async function save() {
    setBusy(true);
    setError(null);
    const body = {
      kindId: form.kindId,
      name: form.name,
      nameAm: form.nameAm || undefined,
      description: form.description || undefined,
      durationMinutes: Number(form.durationMinutes),
      priceEtb: Number(form.priceEtb),
      bufferMinutes: Number(form.bufferMinutes),
      deliveryModes: modes,
      isActive: form.isActive,
      sortOrder: service?.sortOrder ?? 0,
    };
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/services${service ? `/${service.id}` : ""}`, { method: service ? "PUT" : "POST", json: body });
      toast({ tone: "success", title: service ? "Service updated" : "Service added" });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={service ? "Edit service" : "Add a service"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy || !form.kindId || !form.name.trim() || !(Number(form.priceEtb) >= 0) || !form.priceEtb || modes.length === 0}>
            {busy ? "Saving…" : "Save service"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type of service" required hint={kind?.description ?? undefined}>
          {(control) => (
            <Select {...control} value={form.kindId} onChange={(e) => setForm((f) => ({ ...f, kindId: e.target.value }))}>
              <option value="">Choose…</option>
              {kinds.data?.serviceKinds.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Name" required>
          {(control) => <Input {...control} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. First herbal consultation" />}
        </Field>
        <Field label="Name in Amharic (optional)">
          {(control) => <Input {...control} lang="am" className="font-geez" value={form.nameAm} onChange={(e) => setForm((f) => ({ ...f, nameAm: e.target.value }))} />}
        </Field>
        <Field label="Price (ETB)" required>
          {(control) => <Input {...control} type="number" min="0" step="1" inputMode="decimal" value={form.priceEtb} onChange={(e) => setForm((f) => ({ ...f, priceEtb: e.target.value }))} />}
        </Field>
        <Field label="Length (minutes)" required>
          {(control) => <Input {...control} type="number" min="10" step="5" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} />}
        </Field>
        <Field label="Break after (minutes)" hint="Time kept free to prepare for the next client.">
          {(control) => <Input {...control} type="number" min="0" step="5" value={form.bufferMinutes} onChange={(e) => setForm((f) => ({ ...f, bufferMinutes: e.target.value }))} />}
        </Field>
        <Field label="Description" className="sm:col-span-2">
          {(control) => <Textarea {...control} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What happens in the session and how to prepare." />}
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-semibold text-foreground">Offered as</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MODE_LABELS).map(([mode, meta]) => (
              <button key={mode} type="button" aria-pressed={modes.includes(mode)} onClick={() => setModes((list) => (list.includes(mode) ? list.filter((m) => m !== mode) : [...list, mode]))} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", modes.includes(mode) ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground")}>
                <meta.icon className="size-3.5" aria-hidden="true" /> {meta.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="size-4 accent-[var(--brand-accent)]" />
          Show this service on my public page
        </label>
        {kind?.requiresSafetyScreen && <Alert tone="info" className="sm:col-span-2">Clients answer safety questions (medicines, pregnancy, conditions) when booking this type of service. You&apos;ll see their answers on the booking.</Alert>}
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}
