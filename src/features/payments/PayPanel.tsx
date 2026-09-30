"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Copy, CreditCard, Landmark, Smartphone } from "lucide-react";
import { ApiClientError, apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ChoiceGroup, Field, Input, LoadingState } from "@/components/ui";
import { useRealtime } from "@/features/realtime/RealtimeProvider";
import type { PaymentOption } from "@/server/payments";
import type { PaymentAttempt } from "@/server/cases/billing";
import { payMethodLabel } from "./labels";

interface Options {
  freeMode: boolean;
  options: PaymentOption[];
  instructions: string | null;
}

/**
 * Pays for something the platform sells (today: a case's full report).
 *   - free → one tap releases it
 *   - online (Chapa / telebirr via Chapa) → redirect to checkout, confirmed on return or by webhook
 *   - manual (telebirr number / bank account) → pay, then submit the transaction number for review
 */
export function PayPanel<T>({
  title,
  description,
  amountEtb,
  attempt,
  endpoints,
  onUpdated,
}: {
  title: string;
  description: string;
  amountEtb: number;
  attempt: PaymentAttempt | null | undefined;
  endpoints: { view: string; purchase: string; confirm: string; manual: string };
  onUpdated: (next: T) => void;
}) {
  const [options, setOptions] = useState<Options | null>(null);
  const [method, setMethod] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Options>("/api/payments/options")
      .then((result) => {
        setOptions(result);
        setMethod((current) => current || result.options[0]?.id || "");
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  // Back from Chapa checkout: ?payment=<txRef>. Ask the server (which asks Chapa) until it settles.
  const polls = useRef(0);
  useEffect(() => {
    const txRef = new URLSearchParams(window.location.search).get("payment");
    if (!txRef) return;
    setConfirming(txRef);
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await apiFetch<T>(endpoints.confirm, { method: "POST", json: { purchaseId: txRef } });
        if (cancelled) return;
        window.history.replaceState(null, "", window.location.pathname);
        setConfirming(null);
        onUpdated(next);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiClientError && err.status === 402 && polls.current++ < 20) {
          setTimeout(tick, 3000);
        } else {
          setConfirming(null);
          setError(err instanceof ApiClientError && err.status === 402 ? "We haven't received the payment yet. If you completed it, it will appear here automatically within a few minutes." : errorMessage(err));
        }
      }
    };
    void tick();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoints.confirm]);

  // A webhook or an administrator settles the payment: refresh straight away.
  useRealtime(["payment.paid"], () => {
    apiFetch<T>(endpoints.view)
      .then(onUpdated)
      .catch(() => null);
  });

  async function unlockFree() {
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ released: true; view: T }>(endpoints.purchase, { method: "POST", json: {} });
      onUpdated(result.view);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  async function payOnline() {
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ released: boolean; checkoutUrl?: string; view?: T }>(endpoints.purchase, { method: "POST", json: { method } });
      if (result.released && result.view) return onUpdated(result.view);
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <Card>
        <CardContent className="py-8">
          <LoadingState label="Confirming your payment with the payment service…" />
        </CardContent>
      </Card>
    );
  }

  if (amountEtb <= 0) {
    return (
      <Card className="border-success/40">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Free right now. Open it with one tap.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && <Alert tone="danger">{error}</Alert>}
          <Button onClick={unlockFree} disabled={busy} className="self-end">{busy ? "Opening…" : "Open the full report"}</Button>
        </CardContent>
      </Card>
    );
  }

  const selected = options?.options.find((option) => option.id === method);
  const reviewing = attempt?.status === "awaiting_review";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {reviewing && (
          <Alert tone="info" title="We're checking your payment">
            {payMethodLabel(attempt.method)} · {attempt.amountEtb} ETB · reference {attempt.reference}. You&apos;ll be notified as soon as it&apos;s confirmed, usually within a few hours.
          </Alert>
        )}
        {attempt?.status === "rejected" && (
          <Alert tone="warning" title="Your last payment couldn't be confirmed">
            {attempt.reviewNote} You can try again below.
          </Alert>
        )}
        {!reviewing &&
          (!options ? (
            error ? <Alert tone="danger">{error}</Alert> : <LoadingState />
          ) : options.options.length === 0 ? (
            <Alert tone="warning" title="Payment isn't available yet">The platform hasn&apos;t set up payment methods. Please check back soon or contact support.</Alert>
          ) : (
            <>
              <ChoiceGroup
                name="pay-method"
                legend="How would you like to pay?"
                options={options.options.map((option) => ({ value: option.id, label: option.label, hint: option.description }))}
                value={method}
                onChange={setMethod}
              />
              {options.instructions && <p className="text-sm text-muted-foreground">{options.instructions}</p>}
              {selected?.kind === "online" && (
                <>
                  {error && <Alert tone="danger">{error}</Alert>}
                  <Button onClick={payOnline} disabled={busy} className="self-end">
                    <CreditCard className="size-4" aria-hidden="true" /> {busy ? "Opening secure checkout…" : `Pay ${amountEtb} ETB`}
                  </Button>
                </>
              )}
              {selected?.kind === "manual" && <ManualPayment option={selected} amountEtb={amountEtb} endpoint={endpoints.manual} onUpdated={onUpdated} />}
            </>
          ))}
      </CardContent>
    </Card>
  );
}

export function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        await navigator.clipboard?.writeText(value).catch(() => null);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 font-mono font-semibold text-foreground hover:bg-accent"
    >
      {value} {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5 text-muted-foreground" aria-hidden="true" />}
    </button>
  );
}

export function PayToDetails({ option, amountEtb }: { option: Pick<PaymentOption, "id" | "telebirr" | "accounts">; amountEtb: number }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
      <p className="font-semibold text-foreground">Send exactly {amountEtb} ETB to:</p>
      {option.telebirr && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
          <Smartphone className="size-4" aria-hidden="true" /> telebirr <CopyValue value={option.telebirr.phone} label="telebirr number" /> {option.telebirr.accountName && `(${option.telebirr.accountName})`}
        </p>
      )}
      {option.accounts?.map((account) => (
        <p key={account.accountNumber} className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground">
          <Landmark className="size-4" aria-hidden="true" /> {account.bank} <CopyValue value={account.accountNumber} label={`${account.bank} account number`} /> ({account.accountName})
        </p>
      ))}
      <p className="mt-3 text-xs text-muted-foreground">Then enter the transaction number from your SMS or receipt below.</p>
    </div>
  );
}

function ManualPayment<T>({ option, amountEtb, endpoint, onUpdated }: { option: PaymentOption; amountEtb: number; endpoint: string; onUpdated: (next: T) => void }) {
  const [reference, setReference] = useState("");
  const [payerName, setPayerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onUpdated(await apiFetch<T>(endpoint, { method: "POST", json: { method: option.id, reference, payerName: payerName || undefined } }));
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <PayToDetails option={option} amountEtb={amountEtb} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Transaction number" required hint="e.g. the telebirr SMS code or bank reference">
          {(control) => <Input {...control} value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" />}
        </Field>
        <Field label="Name on the payment (optional)">{(control) => <Input {...control} value={payerName} onChange={(e) => setPayerName(e.target.value)} />}</Field>
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button type="submit" disabled={busy || reference.trim().length < 4} className="self-end">{busy ? "Sending…" : "I've paid: send for confirmation"}</Button>
    </form>
  );
}
