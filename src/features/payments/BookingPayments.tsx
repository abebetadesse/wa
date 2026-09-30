"use client";

import { useState, type FormEvent } from "react";
import { Banknote, Wallet } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ChoiceGroup, Field, Input, LoadingState } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import { PAYMENT_STATUS, payMethodLabel } from "./labels";
import { PayToDetails } from "./PayPanel";

interface Info {
  priceEtb: number;
  paidEtb: number;
  pendingEtb: number;
  balanceEtb: number;
  canSubmit: boolean;
  accounts: {
    telebirr: { name: string; phone: string } | null;
    banks: { bank: string; accountName: string; accountNumber: string }[];
    acceptsCash: boolean;
    instructions: string | null;
  };
  submissions: { id: string; amountEtb: string; method: string; reference: string | null; status: string; reason: string | null; createdAt: string }[];
}

/** Lets a client pay a business by telebirr or bank transfer and report the transaction number. */
export function BookingPayments({ bookingId, businessName, active }: { bookingId: string; businessName: string; active: boolean }) {
  const toast = useToast();
  const { data, error, reload } = useApi<Info>(`/api/account/bookings/${bookingId}/payments`, { liveTypes: ["payment.", "booking.payment"] });
  const [method, setMethod] = useState<"telebirr" | "bank_transfer" | "">("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (error) return null;
  if (!data) return <Card className="mt-6"><CardContent className="pt-6"><LoadingState /></CardContent></Card>;
  if (!data.canSubmit && data.submissions.length === 0 && data.paidEtb === 0 && !data.accounts.acceptsCash) return null;

  const options = [
    ...(data.accounts.telebirr ? [{ value: "telebirr", label: "telebirr", hint: `${data.accounts.telebirr.phone} · ${data.accounts.telebirr.name}` }] : []),
    ...(data.accounts.banks.length ? [{ value: "bank_transfer", label: "Bank transfer", hint: data.accounts.banks.map((b) => b.bank).join(", ") }] : []),
  ];
  const chosen = method || (options[0]?.value as typeof method) || "";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await apiFetch(`/api/account/bookings/${bookingId}/payments`, { method: "POST", json: { method: chosen, amountEtb: Number(amount), reference } });
      toast({ tone: "success", title: "Sent to the business", body: "You'll be notified when they confirm it." });
      setAmount("");
      setReference("");
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="size-5 text-gold" aria-hidden="true" /> Payment</CardTitle>
        <CardDescription>
          {data.paidEtb.toLocaleString()} of {data.priceEtb.toLocaleString()} ETB confirmed
          {data.pendingEtb > 0 ? ` · ${data.pendingEtb.toLocaleString()} ETB being checked` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {data.submissions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {data.submissions.map((submission) => {
              const status = submission.status === "pending" ? { label: "Being checked", tone: "warning" as const } : PAYMENT_STATUS[submission.status] ?? { label: submission.status, tone: "neutral" as const };
              return (
                <li key={submission.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm">
                  <span className="font-semibold tabular-nums text-foreground">{Number(submission.amountEtb).toLocaleString()} ETB</span>
                  <span className="text-muted-foreground">{payMethodLabel(submission.method)} · {submission.reference}</span>
                  <Badge tone={status.tone} className="ml-auto">{status.label}</Badge>
                  {submission.reason && submission.status === "rejected" && <p className="w-full text-xs text-danger">{submission.reason}</p>}
                </li>
              );
            })}
          </ul>
        )}

        {data.accounts.instructions && <p className="text-sm text-muted-foreground">{data.accounts.instructions}</p>}
        {data.accounts.acceptsCash && data.balanceEtb > 0 && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Banknote className="size-4" aria-hidden="true" /> You can also pay {businessName} in cash at your visit.</p>
        )}

        {active && data.canSubmit && data.balanceEtb > 0 && options.length > 0 && (
          <form onSubmit={submit} className="flex flex-col gap-4 border-t border-border pt-5">
            <ChoiceGroup name="booking-pay-method" legend="Pay now by" options={options} value={chosen} onChange={(value) => setMethod(value as typeof method)} />
            <PayToDetails
              option={{ id: chosen === "telebirr" ? "telebirr" : "bank_transfer", telebirr: chosen === "telebirr" && data.accounts.telebirr ? { accountName: data.accounts.telebirr.name, phone: data.accounts.telebirr.phone } : undefined, accounts: chosen === "bank_transfer" ? data.accounts.banks : undefined }}
              amountEtb={data.balanceEtb}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount you sent (ETB)" required hint={`Up to ${data.balanceEtb.toLocaleString()} ETB`}>
                {(control) => <Input {...control} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(data.balanceEtb)} />}
              </Field>
              <Field label="Transaction number" required>{(control) => <Input {...control} value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" />}</Field>
            </div>
            {formError && <Alert tone="danger">{formError}</Alert>}
            <Button type="submit" disabled={busy || !amount || reference.trim().length < 4} className="self-end">{busy ? "Sending…" : "I've paid: send to the business"}</Button>
          </form>
        )}
        {data.balanceEtb === 0 && data.paidEtb > 0 && <Alert tone="success">Fully paid. Thank you!</Alert>}
      </CardContent>
    </Card>
  );
}
