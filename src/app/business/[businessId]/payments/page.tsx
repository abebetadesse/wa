"use client";

import { useState } from "react";
import { Check, Download, Plus, Undo2, X } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { RecordPaymentDialog } from "@/features/workspace/RecordPaymentDialog";
import { PAYMENT_METHOD_LABELS } from "@/features/workspace/labels";
import { formatEtb } from "@/features/marketplace/shared";
import { csvCell } from "@/lib/csv";
import { cn } from "@/lib/utils";

interface PaymentRow {
  payment: { id: string; amountEtb: string; method: string; reference: string | null; note: string | null; status: string; receivedOn: string; voidReason: string | null };
  clientName: string | null;
  bookingReference: string | null;
}

const monthRange = (offset: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  return { from: iso(start), to: iso(end), label: start.toLocaleDateString([], { month: "long", year: "numeric" }) };
};

export default function PaymentsPage() {
  const { business, can } = useWorkspace();
  const toast = useToast();
  const [offset, setOffset] = useState(0);
  const range = monthRange(offset);
  const { data, error, reload } = useApi<{ payments: PaymentRow[]; pending: PaymentRow[]; totalEtb: number; byMethod: Record<string, number> }>(
    `/api/workspace/businesses/${business.id}/payments?from=${range.from}&to=${range.to}`,
    { liveTypes: ["payment."] },
  );
  const [recording, setRecording] = useState(false);
  const [voiding, setVoiding] = useState<PaymentRow | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [rejecting, setRejecting] = useState<PaymentRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function review(row: PaymentRow, decision: "confirm" | "reject", reason?: string) {
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/payments/${row.payment.id}/review`, { method: "POST", json: { decision, reason } });
      toast({ tone: "success", title: decision === "confirm" ? "Payment confirmed" : "Client told the payment wasn't found" });
      setRejecting(null);
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not update the payment", body: errorMessage(err) });
    }
  }

  async function confirmVoid() {
    if (!voiding) return;
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/payments/${voiding.payment.id}/void`, { method: "POST", json: { reason: voidReason } });
      toast({ tone: "success", title: "Payment voided" });
      setVoiding(null);
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not void payment", body: errorMessage(err) });
    }
  }

  function exportCsv() {
    if (!data) return;
    const header = ["Date", "Client", "Booking", "Method", "Reference", "Amount (ETB)", "Status", "Note"];
    const rows = data.payments.map(({ payment, clientName, bookingReference }) => [payment.receivedOn, clientName, bookingReference, PAYMENT_METHOD_LABELS[payment.method] ?? payment.method, payment.reference, payment.amountEtb, payment.status, payment.note]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `payments-${range.from.slice(0, 7)}.csv` });
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Money you received, recorded by your team. Totals exclude voided entries."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} disabled={!data?.payments.length}><Download className="size-4" aria-hidden="true" /> Export CSV</Button>
            {can("recordPayments") && <Button onClick={() => setRecording(true)}><Plus className="size-4" aria-hidden="true" /> Record payment</Button>}
          </>
        }
        className="mb-0"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOffset((o) => o - 1)}>←</Button>
        <span className="min-w-40 text-center font-semibold text-foreground">{range.label}</span>
        <Button variant="outline" size="sm" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0}>→</Button>
      </div>

      {data && data.pending.length > 0 && (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle>Payments to confirm ({data.pending.length})</CardTitle>
            <CardDescription>Clients say they paid you. Check each transaction number against your telebirr or bank statement, then confirm or reject it.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.pending.map((row) => (
              <div key={row.payment.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{row.clientName ?? "Client"} · {formatEtb(row.payment.amountEtb)}</p>
                  <p className="text-xs text-muted-foreground">
                    {PAYMENT_METHOD_LABELS[row.payment.method] ?? row.payment.method} · <span className="font-mono">{row.payment.reference}</span>
                    {row.bookingReference ? ` · ${row.bookingReference}` : ""}
                  </p>
                  {row.payment.note && <p className="text-xs text-muted-foreground">“{row.payment.note}”</p>}
                </div>
                {can("recordPayments") && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => { setRejectReason(""); setRejecting(row); }}><X className="size-4" aria-hidden="true" /> Not received</Button>
                    <Button size="sm" onClick={() => review(row, "confirm")}><Check className="size-4" aria-hidden="true" /> Received</Button>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="col-span-2 bg-gradient-to-br from-brand/15 to-gold/10">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Received in {range.label}</p>
                <p className="font-display text-4xl font-extrabold text-foreground">{formatEtb(data.totalEtb)}</p>
              </CardContent>
            </Card>
            {Object.entries(data.byMethod).map(([method, total]) => (
              <Card key={method}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{PAYMENT_METHOD_LABELS[method] ?? method}</p>
                  <p className="font-display text-2xl font-extrabold text-foreground">{formatEtb(total)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.payments.length === 0 ? (
            <EmptyState title="No payments recorded this month" description="Record payments from a booking or here when clients pay you." />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3" /></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.payments.map((row) => {
                    const voided = row.payment.status === "voided" || row.payment.status === "rejected";
                    return (
                      <tr key={row.payment.id} className={cn(voided && "text-muted-foreground")}>
                        <td className="px-4 py-3">{new Date(row.payment.receivedOn).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={cn("font-semibold", !voided && "text-foreground")}>{row.clientName ?? "—"}</span>
                          {row.bookingReference && <span className="block font-mono text-[11px] text-muted-foreground">{row.bookingReference}</span>}
                        </td>
                        <td className="px-4 py-3">{PAYMENT_METHOD_LABELS[row.payment.method] ?? row.payment.method}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.payment.reference ?? "—"}</td>
                        <td className={cn("px-4 py-3 text-right font-semibold", voided ? "line-through" : "text-foreground")}>{formatEtb(row.payment.amountEtb)}</td>
                        <td className="px-4 py-3 text-right">
                          {voided ? (
                            <Badge tone="neutral" title={row.payment.voidReason ?? undefined}>{row.payment.status === "rejected" ? "Rejected" : "Voided"}</Badge>
                          ) : (
                            can("voidPayments") && (
                              <button type="button" onClick={() => { setVoidReason(""); setVoiding(row); }} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-danger">
                                <Undo2 className="size-3.5" aria-hidden="true" /> Void
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Dialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        size="sm"
        title="Payment not received?"
        description="The client is told, with your reason, and can send the correct transaction number."
        footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="destructive" onClick={() => rejecting && review(rejecting, "reject", rejectReason)} disabled={rejectReason.trim().length < 3}>Reject</Button></>}
      >
        <Field label="Reason" required>{(control) => <Textarea {...control} rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. No transfer with this number on our statement" />}</Field>
      </Dialog>
      {recording && <RecordPaymentDialog open onClose={() => setRecording(false)} businessId={business.id} onRecorded={reload} />}
      <Dialog
        open={Boolean(voiding)}
        onClose={() => setVoiding(null)}
        size="sm"
        title="Void this payment?"
        description="Use this for mistakes. The entry stays in the history, marked as voided."
        footer={<><Button variant="ghost" onClick={() => setVoiding(null)}>Keep it</Button><Button variant="destructive" onClick={confirmVoid} disabled={voidReason.trim().length < 3}>Void payment</Button></>}
      >
        <Field label="Reason" required>{(control) => <Textarea {...control} rows={2} value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="e.g. Entered twice" />}</Field>
      </Dialog>
    </div>
  );
}

