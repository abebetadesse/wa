"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, ExternalLink, Pencil, Plus, ShieldOff, Undo2 } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, PageHeader, PageShell, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import { BUSINESS_STATUS } from "@/features/workspace/labels";
import { cn } from "@/lib/utils";

interface QueueItem {
  business: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    region: string | null;
    city: string | null;
    phone: string | null;
    status: string;
    updatedAt: string;
    verification: { submittedAt?: string; notes?: string; credentials?: { label: string; issuer?: string; reference?: string }[] } | null;
  };
  category: string;
  ownerEmail: string;
  ownerTelegramVerifiedAt: string | null;
  ownerName: string | null;
}

interface CatalogueRow {
  id: string;
  slug: string;
  name: string;
  nameAm: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  sector?: string;
  icon?: string | null;
  requiresSafetyScreen?: boolean;
  caseDomain?: string | null;
}

type Tab = "pending_verification" | "verified" | "suspended" | "draft" | "categories" | "service-kinds";

export default function MarketplaceAdminPage() {
  const [tab, setTab] = useState<Tab>("pending_verification");
  return (
    <PageShell width="wide">
      <PageHeader eyebrow="Administration" title="Marketplace" description="Verify businesses and manage the categories and service types everyone uses." />
      <div className="mb-6 flex flex-wrap gap-1 rounded-full border border-border bg-card p-1" role="tablist">
        {([
          ["pending_verification", "Awaiting verification"],
          ["verified", "Verified"],
          ["suspended", "Suspended"],
          ["draft", "Drafts"],
          ["categories", "Categories"],
          ["service-kinds", "Service types"],
        ] as [Tab, string][]).map(([value, label]) => (
          <button key={value} role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", tab === value ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>
      {tab === "categories" || tab === "service-kinds" ? <CatalogueEditor kind={tab} /> : <VerificationQueue status={tab} />}
    </PageShell>
  );
}

function VerificationQueue({ status }: { status: string }) {
  const toast = useToast();
  const { data, error, reload } = useApi<QueueItem[]>(`/api/admin/marketplace/businesses?status=${status}`);
  const [deciding, setDeciding] = useState<{ item: QueueItem; decision: "verified" | "draft" | "suspended" } | null>(null);
  const [notes, setNotes] = useState("");

  async function decide() {
    if (!deciding) return;
    try {
      await apiFetch(`/api/admin/marketplace/businesses/${deciding.item.business.id}/decision`, { method: "POST", json: { decision: deciding.decision, notes: notes.trim() || undefined } });
      toast({ tone: "success", title: `${deciding.item.business.name}: ${BUSINESS_STATUS[deciding.decision]?.label ?? deciding.decision}`, body: "The owner has been notified." });
      setDeciding(null);
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not save decision", body: errorMessage(err) });
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  if (data.length === 0) return <EmptyState title="Nothing here" description="Businesses appear here when their status matches this tab." />;

  return (
    <>
      <ul className="flex flex-col gap-4">
        {data.map((item) => (
          <li key={item.business.id} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-bold text-foreground">{item.business.name}</p>
                  <Badge tone="neutral">{item.category}</Badge>
                </div>
                {item.business.tagline && <p className="text-sm text-muted-foreground">{item.business.tagline}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.ownerName ?? "Owner"} · {item.ownerEmail}{item.business.phone ? ` · ${item.business.phone}` : ""}{item.business.city ? ` · ${item.business.city}` : ""}
                  {item.ownerTelegramVerifiedAt && <Badge tone="success" className="ml-2">Telegram verified</Badge>}
                  {item.business.verification?.submittedAt && ` · submitted ${new Date(item.business.verification.submittedAt).toLocaleDateString()}`}
                </p>
                {item.business.verification?.credentials && item.business.verification.credentials.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1 rounded-2xl bg-muted p-3 text-sm">
                    {item.business.verification.credentials.map((credential, index) => (
                      <li key={index} className="text-foreground">
                        <strong>{credential.label}</strong>
                        {credential.issuer && <span className="text-muted-foreground"> · {credential.issuer}</span>}
                        {credential.reference && <span className="font-mono text-xs text-muted-foreground"> · {credential.reference}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/b/${item.business.slug}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-input px-3 text-sm font-semibold text-foreground hover:bg-accent">
                  <ExternalLink className="size-4" aria-hidden="true" /> Preview
                </Link>
                {item.business.status !== "verified" && item.business.status !== "draft" && (
                  <Button size="sm" onClick={() => { setNotes(""); setDeciding({ item, decision: "verified" }); }}><BadgeCheck className="size-4" aria-hidden="true" /> Verify</Button>
                )}
                {item.business.status === "pending_verification" && (
                  <Button size="sm" variant="outline" onClick={() => { setNotes(""); setDeciding({ item, decision: "draft" }); }}><Undo2 className="size-4" aria-hidden="true" /> Request changes</Button>
                )}
                {item.business.status !== "suspended" && (
                  <Button size="sm" variant="ghost" className="text-danger" onClick={() => { setNotes(""); setDeciding({ item, decision: "suspended" }); }}><ShieldOff className="size-4" aria-hidden="true" /> Suspend</Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Dialog
        open={Boolean(deciding)}
        onClose={() => setDeciding(null)}
        size="sm"
        title={deciding?.decision === "verified" ? "Verify this business?" : deciding?.decision === "draft" ? "Request changes" : "Suspend this business?"}
        description={deciding?.decision === "verified" ? "It will appear in the marketplace immediately." : "The owner sees your note."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeciding(null)}>Cancel</Button>
            <Button variant={deciding?.decision === "suspended" ? "destructive" : "primary"} onClick={decide} disabled={deciding?.decision !== "verified" && notes.trim().length < 5}>Confirm</Button>
          </>
        }
      >
        <Field label={deciding?.decision === "verified" ? "Note (optional)" : "What needs to change?"} required={deciding?.decision !== "verified"}>
          {(control) => <Textarea {...control} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />}
        </Field>
      </Dialog>
    </>
  );
}

function CatalogueEditor({ kind }: { kind: "categories" | "service-kinds" }) {
  const toast = useToast();
  const endpoint = `/api/admin/marketplace/${kind}`;
  const { data, error, reload } = useApi<CatalogueRow[]>(endpoint);
  const [editing, setEditing] = useState<CatalogueRow | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function open(row: CatalogueRow | "new") {
    setFormError(null);
    setEditing(row);
    const r = row === "new" ? null : row;
    setForm({
      slug: r?.slug ?? "",
      name: r?.name ?? "",
      nameAm: r?.nameAm ?? "",
      description: r?.description ?? "",
      sortOrder: String(r?.sortOrder ?? (data?.length ?? 0) * 10 + 10),
      isActive: r?.isActive ?? true,
      sector: r?.sector ?? "healing",
      icon: r?.icon ?? "",
      requiresSafetyScreen: r?.requiresSafetyScreen ?? false,
      caseDomain: r?.caseDomain ?? "",
    });
  }

  async function save() {
    const body: Record<string, unknown> = {
      slug: form.slug,
      name: form.name,
      nameAm: (form.nameAm as string) || undefined,
      description: (form.description as string) || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
      ...(kind === "categories"
        ? { sector: form.sector, icon: (form.icon as string) || undefined }
        : { requiresSafetyScreen: form.requiresSafetyScreen, caseDomain: (form.caseDomain as string) || null }),
    };
    try {
      await apiFetch(editing && editing !== "new" ? `${endpoint}/${editing.id}` : endpoint, { method: editing && editing !== "new" ? "PUT" : "POST", json: body });
      toast({ tone: "success", title: "Saved" });
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const text = (key: string) => ({ value: String(form[key] ?? ""), onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value })) });

  return (
    <>
      <div className="mb-4 flex justify-end"><Button onClick={() => open("new")}><Plus className="size-4" aria-hidden="true" /> Add</Button></div>
      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">{kind === "categories" ? "Sector" : "Safety screen"}</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3"><span className="font-semibold text-foreground">{row.name}</span>{row.nameAm && <span lang="am" className="block font-geez text-xs text-muted-foreground">{row.nameAm}</span>}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.slug}</td>
                <td className="px-4 py-3">{kind === "categories" ? <Badge tone={row.sector === "cultural" ? "gold" : "brand"}>{row.sector}</Badge> : row.requiresSafetyScreen ? <Badge tone="warning">Required</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.sortOrder}</td>
                <td className="px-4 py-3">{row.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Hidden</Badge>}</td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => open(row)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === "new" ? "Add" : "Edit"} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>{(control) => <Input {...control} {...text("name")} />}</Field>
          <Field label="Name in Amharic">{(control) => <Input {...control} lang="am" className="font-geez" {...text("nameAm")} />}</Field>
          <Field label="Slug" required hint="Lowercase, used in links. Changing it breaks saved links.">{(control) => <Input {...control} {...text("slug")} />}</Field>
          <Field label="Sort order">{(control) => <Input {...control} type="number" {...text("sortOrder")} />}</Field>
          {kind === "categories" ? (
            <>
              <Field label="Sector">{(control) => <Select {...control} {...text("sector")}><option value="healing">Healing</option><option value="cultural">Cultural</option></Select>}</Field>
              <Field label="Icon name" hint="Lucide icon name, e.g. leaf">{(control) => <Input {...control} {...text("icon")} />}</Field>
            </>
          ) : (
            <>
              <Field label="Linked case type" hint="Optional expert-reviewed case workflow.">
                {(control) => (
                  <Select {...control} {...text("caseDomain")}>
                    <option value="">None</option>
                    {["career", "legal", "relationship", "social", "spiritual"].map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                )}
              </Field>
              <label className="flex items-center gap-2 self-end pb-3 text-sm text-foreground">
                <input type="checkbox" checked={Boolean(form.requiresSafetyScreen)} onChange={(e) => setForm((f) => ({ ...f, requiresSafetyScreen: e.target.checked }))} className="size-4 accent-[var(--brand-accent)]" />
                Clients answer safety questions when booking
              </label>
            </>
          )}
          <Field label="Description" className="sm:col-span-2">{(control) => <Textarea {...control} rows={2} {...text("description")} />}</Field>
          <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
            <input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="size-4 accent-[var(--brand-accent)]" />
            Active (available to businesses)
          </label>
          {formError && <Alert tone="danger" className="sm:col-span-2">{formError}</Alert>}
        </div>
      </Dialog>
    </>
  );
}
