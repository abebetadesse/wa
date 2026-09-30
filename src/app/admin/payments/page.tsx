"use client";

import { useEffect, useState } from "react";
import { Check, Gift, Landmark, Plus, Smartphone, Trash2, X } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, PageHeader, PageShell, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import { PAYMENT_STATUS, payMethodLabel } from "@/features/payments/labels";
import type { PaymentSettings } from "@/server/settings";
import { cn } from "@/lib/utils";

interface SettingsResponse {
  value: PaymentSettings;
  status: { chapa: { configured: boolean; mode: "live" | "test" | "off"; webhookSecret: boolean }; available: string[] };
}

interface LedgerRow {
  id: string;
  txRef: string;
  description: string | null;
  amountEtb: string;
  method: string;
  channel: string;
  status: string;
  providerReference: string | null;
  payerName: string | null;
  payerNote: string | null;
  payerEmail: string | null;
  payerAccountName: string | null;
  reviewNote: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface Ledger {
  payments: LedgerRow[];
  totals: { paidEtb: number; paid30Etb: number; awaitingReview: number; needsAttention: number };
}

interface Domain {
  domain: string;
  label: string;
  pricing: { reportEtb: number; consultationEtb: number };
}

type Tab = "review" | "settings";
const etb = (value: number | string) => `${Number(value).toLocaleString()} ETB`;

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState<Tab>("review");
  return (
    <PageShell width="wide">
      <PageHeader eyebrow="Administration" title="Payments & pricing" description="Make the platform free or paid, choose how people pay, set prices and confirm manual payments." />
      <div role="tablist" className="mb-6 flex gap-2">
        {([["review", "Payments"], ["settings", "Settings & prices"]] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("rounded-full px-4 py-2 text-sm font-semibold", tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>
      {tab === "review" ? <PaymentsLedger /> : <PaymentSettingsForm />}
    </PageShell>
  );
}

// ── Ledger and review ────────────────────────────────────────────────────────

function PaymentsLedger() {
  const toast = useToast();
  const [status, setStatus] = useState("awaiting_review");
  const { data, error, reload } = useApi<Ledger>(`/api/admin/payments?status=${status}`, { liveTypes: ["notification", "payment."] });
  const [rejecting, setRejecting] = useState<LedgerRow | null>(null);
  const [note, setNote] = useState("");

  async function review(row: LedgerRow, decision: "paid" | "rejected", reviewNote?: string) {
    try {
      await apiFetch(`/api/admin/payments/${row.id}/review`, { method: "POST", json: { decision, note: reviewNote || undefined } });
      toast({ tone: "success", title: decision === "paid" ? "Payment confirmed. The report is unlocked." : "Payer notified" });
      setRejecting(null);
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not update", body: errorMessage(err) });
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="flex flex-col gap-6">
      {data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Received (all time)" value={etb(data.totals.paidEtb)} />
          <Stat label="Last 30 days" value={etb(data.totals.paid30Etb)} />
          <Stat label="Waiting for review" value={String(data.totals.awaitingReview)} tone={data.totals.awaitingReview ? "warning" : undefined} onClick={() => setStatus("awaiting_review")} />
          <Stat label="Needs attention" value={String(data.totals.needsAttention)} tone={data.totals.needsAttention ? "danger" : undefined} onClick={() => setStatus("needs_attention")} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-foreground" htmlFor="status-filter">Show</label>
        <Select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-56">
          <option value="awaiting_review">Waiting for review</option>
          <option value="needs_attention">Needs attention</option>
          <option value="paid">Paid</option>
          <option value="pending">Checkout started</option>
          <option value="rejected">Rejected</option>
          <option value="failed">Failed</option>
          <option value="all">Everything</option>
        </Select>
      </div>

      {!data ? (
        <LoadingState />
      ) : data.payments.length === 0 ? (
        <EmptyState title={status === "awaiting_review" ? "Nothing to review" : "No payments here"} description={status === "awaiting_review" ? "Manual telebirr and bank payments appear here for you to confirm." : undefined} />
      ) : (
        <div className="flex flex-col gap-3">
          {data.payments.map((row) => {
            const tone = PAYMENT_STATUS[row.status] ?? { label: row.status, tone: "neutral" as const };
            return (
              <Card key={row.id}>
                <CardContent className="flex flex-wrap items-center gap-4 pt-6">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{row.description ?? row.txRef}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.payerAccountName ?? row.payerEmail ?? "Unknown payer"}
                      {row.payerEmail ? ` · ${row.payerEmail}` : ""}
                      {row.payerName ? ` · paid as “${row.payerName}”` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payMethodLabel(row.method)} ({row.channel}) · {new Date(row.createdAt).toLocaleString()}
                      {row.providerReference && <> · ref <span className="font-mono font-semibold text-foreground">{row.providerReference}</span></>}
                    </p>
                    {row.payerNote && <p className="mt-1 text-xs text-muted-foreground">“{row.payerNote}”</p>}
                    {row.reviewNote && <p className="mt-1 text-xs text-warning">{row.reviewNote}</p>}
                  </div>
                  <span className="font-display text-xl font-extrabold tabular-nums text-foreground">{etb(row.amountEtb)}</span>
                  <Badge tone={tone.tone}>{tone.label}</Badge>
                  {row.status === "awaiting_review" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setNote(""); setRejecting(row); }}><X className="size-4" aria-hidden="true" /> Not received</Button>
                      <Button size="sm" onClick={() => review(row, "paid")}><Check className="size-4" aria-hidden="true" /> Received</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        size="sm"
        title="Reject this payment?"
        description="The payer is notified with your reason and can submit the correct transaction number."
        footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="destructive" disabled={note.trim().length < 3} onClick={() => rejecting && review(rejecting, "rejected", note)}>Reject</Button></>}
      >
        <Field label="Reason" required>{(control) => <Textarea {...control} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. No transfer with this reference on our statement" />}</Field>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, tone, onClick }: { label: string; value: string; tone?: "warning" | "danger"; onClick?: () => void }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn("rounded-3xl border bg-card p-5 text-left", tone === "warning" ? "border-warning/40" : tone === "danger" ? "border-danger/40" : "border-border", onClick && "transition-colors hover:border-brand/40")}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-extrabold text-foreground">{value}</p>
    </Wrapper>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────

function PaymentSettingsForm() {
  const toast = useToast();
  const loaded = useApi<SettingsResponse>("/api/admin/settings/payments");
  const domains = useApi<{ domains: Domain[] }>("/api/case-workflows");
  const [draft, setDraft] = useState<PaymentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded.data && !draft) setDraft(loaded.data.value);
  }, [loaded.data, draft]);

  if (loaded.error) return <ErrorState message={loaded.error} onRetry={loaded.reload} />;
  if (!draft || !loaded.data) return <LoadingState />;
  const status = loaded.data.status;
  const methods = draft.methods;
  const update = (patch: Partial<PaymentSettings>) => setDraft({ ...draft, ...patch });
  const setMethod = <K extends keyof PaymentSettings["methods"]>(key: K, patch: Partial<PaymentSettings["methods"][K]>) =>
    update({ methods: { ...methods, [key]: { ...methods[key], ...patch } } });

  async function save(next = draft) {
    setSaving(true);
    setError(null);
    try {
      const result = await apiFetch<SettingsResponse>("/api/admin/settings/payments", { method: "PUT", json: { value: next } });
      setDraft(result.value);
      loaded.setData(result);
      toast({ tone: "success", title: "Payment settings saved", body: "They apply immediately." });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className={cn(draft.freeMode && "border-success/50")}>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <Gift className={cn("size-8", draft.freeMode ? "text-success" : "text-muted-foreground")} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-extrabold text-foreground">Free mode {draft.freeMode ? "is on" : "is off"}</p>
            <p className="text-sm text-muted-foreground">When on, everything the platform charges for is free: reports unlock on approval and consultations cost nothing. Businesses still set their own booking prices.</p>
          </div>
          <Button variant={draft.freeMode ? "outline" : "primary"} disabled={saving} onClick={() => save({ ...draft, freeMode: !draft.freeMode })}>
            {draft.freeMode ? "Start charging" : "Make everything free"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment methods</CardTitle>
          <CardDescription>
            Available now: {status.available.length ? status.available.map(payMethodLabel).join(", ") : "none"}.
            {" "}Online payments use Chapa (set CHAPA_SECRET_KEY on the server).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <MethodRow
            title="Chapa checkout"
            description="Cards, CBE Birr, M-Pesa, Amole and bank payments on Chapa's secure page. Confirmed automatically."
            enabled={methods.chapa.enabled}
            onToggle={(enabled) => setMethod("chapa", { enabled })}
            badge={status.chapa.configured ? <Badge tone={status.chapa.mode === "live" ? "success" : "warning"}>{status.chapa.mode === "live" ? "Live key" : "Test key"}</Badge> : <Badge tone="danger">Not connected</Badge>}
          >
            {!status.chapa.configured && <Alert tone="warning">Add your Chapa secret key as CHAPA_SECRET_KEY in the server environment, then set the webhook URL in the Chapa dashboard to <code className="font-mono">/api/payments/chapa/webhook</code> on your domain.</Alert>}
            {status.chapa.configured && !status.chapa.webhookSecret && <p className="text-xs text-muted-foreground">Tip: set CHAPA_WEBHOOK_SECRET so webhook signatures are checked too. Payments are always re-verified with Chapa either way.</p>}
          </MethodRow>

          <MethodRow title="telebirr" icon={<Smartphone className="size-5 text-brand" aria-hidden="true" />} description="Through Chapa checkout (confirmed automatically), or sent to your telebirr number and confirmed by you." enabled={methods.telebirr.enabled} onToggle={(enabled) => setMethod("telebirr", { enabled })}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="How">
                {(control) => (
                  <Select {...control} value={methods.telebirr.channel} onChange={(e) => setMethod("telebirr", { channel: e.target.value as "chapa" | "manual" })}>
                    <option value="chapa">Inside Chapa checkout</option>
                    <option value="manual">To our telebirr number</option>
                  </Select>
                )}
              </Field>
              {methods.telebirr.channel === "manual" && (
                <>
                  <Field label="telebirr number" required>{(control) => <Input {...control} value={methods.telebirr.phone} onChange={(e) => setMethod("telebirr", { phone: e.target.value })} placeholder="09…" />}</Field>
                  <Field label="Account name">{(control) => <Input {...control} value={methods.telebirr.accountName} onChange={(e) => setMethod("telebirr", { accountName: e.target.value })} />}</Field>
                </>
              )}
            </div>
          </MethodRow>

          <MethodRow title="Bank transfer" icon={<Landmark className="size-5 text-brand" aria-hidden="true" />} description="People transfer to your account and enter the reference. You confirm it against your statement." enabled={methods.bank_transfer.enabled} onToggle={(enabled) => setMethod("bank_transfer", { enabled })}>
            <div className="flex flex-col gap-3">
              {methods.bank_transfer.accounts.map((account, index) => (
                <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                  {(["bank", "accountName", "accountNumber"] as const).map((key) => (
                    <Field key={key} label={key === "bank" ? "Bank" : key === "accountName" ? "Account name" : "Account number"}>
                      {(control) => <Input {...control} value={account[key]} onChange={(e) => setMethod("bank_transfer", { accounts: methods.bank_transfer.accounts.map((a, i) => (i === index ? { ...a, [key]: e.target.value } : a)) })} />}
                    </Field>
                  ))}
                  <button type="button" aria-label="Remove account" className="mb-1 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-danger" onClick={() => setMethod("bank_transfer", { accounts: methods.bank_transfer.accounts.filter((_, i) => i !== index) })}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="self-start" onClick={() => setMethod("bank_transfer", { accounts: [...methods.bank_transfer.accounts, { bank: "", accountName: "", accountNumber: "" }] })}>
                <Plus className="size-4" aria-hidden="true" /> Add account
              </Button>
            </div>
          </MethodRow>

          <Field label="Note shown on the payment screen (optional)">{(control) => <Textarea {...control} rows={2} maxLength={1000} value={draft.instructions} onChange={(e) => update({ instructions: e.target.value })} />}</Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prices</CardTitle>
          <CardDescription>What the platform charges for each type of expert-reviewed case. Set a price to 0 to make it free.</CardDescription>
        </CardHeader>
        <CardContent>
          {!domains.data ? (
            <LoadingState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="py-2 pr-4">Case type</th><th className="py-2 pr-4">Full report (ETB)</th><th className="py-2 pr-4">Consultation (ETB)</th><th /></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {domains.data.domains.map((domain) => {
                    const key = domain.domain as keyof PaymentSettings["prices"];
                    const current = draft.prices[key] ?? domain.pricing;
                    const setPrice = (field: "reportEtb" | "consultationEtb", value: string) =>
                      update({ prices: { ...draft.prices, [key]: { ...current, [field]: Math.max(0, Number(value) || 0) } } });
                    return (
                      <tr key={domain.domain}>
                        <td className="py-3 pr-4 font-semibold text-foreground">{domain.label}</td>
                        <td className="py-3 pr-4"><Input aria-label={`${domain.label} report price`} className="h-10 w-32" inputMode="numeric" value={String(current.reportEtb)} onChange={(e) => setPrice("reportEtb", e.target.value)} /></td>
                        <td className="py-3 pr-4"><Input aria-label={`${domain.label} consultation price`} className="h-10 w-32" inputMode="numeric" value={String(current.consultationEtb)} onChange={(e) => setPrice("consultationEtb", e.target.value)} /></td>
                        <td className="py-3 text-xs text-muted-foreground">{draft.prices[key] ? <button type="button" className="font-semibold text-brand hover:underline" onClick={() => { const next = { ...draft.prices }; delete next[key]; update({ prices: next }); }}>Reset to {domain.pricing.reportEtb} / {domain.pricing.consultationEtb}</button> : "Default"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paying businesses</CardTitle>
          <CardDescription>Clients pay businesses directly. The platform only passes on the transaction number for the business to confirm.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
            <span>
              <span className="block font-semibold text-foreground">Let clients report telebirr and bank payments on their bookings</span>
              <span className="text-sm text-muted-foreground">Businesses see them under Payments and confirm or reject each one.</span>
            </span>
            <input type="checkbox" className="size-5 accent-[var(--brand-accent)]" checked={draft.bookingPayments.clientSubmissions} onChange={(e) => update({ bookingPayments: { clientSubmissions: e.target.checked } })} />
          </label>
        </CardContent>
      </Card>

      {error && <Alert tone="danger">{error}</Alert>}
      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => save()} disabled={saving} className="shadow-lg">{saving ? "Saving…" : "Save payment settings"}</Button>
      </div>
    </div>
  );
}

function MethodRow({ title, description, enabled, onToggle, badge, icon, children }: { title: string; description: string; enabled: boolean; onToggle: (enabled: boolean) => void; badge?: React.ReactNode; icon?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl border p-4", enabled ? "border-brand/40" : "border-border")}>
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 size-5 accent-[var(--brand-accent)]" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 font-semibold text-foreground">{icon}{title}{badge}</span>
          <span className="text-sm text-muted-foreground">{description}</span>
        </span>
      </label>
      {enabled && children}
    </div>
  );
}
