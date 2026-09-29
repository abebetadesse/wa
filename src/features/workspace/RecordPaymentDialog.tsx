"use client";

import { useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Dialog, Field, Input, Select, Textarea } from "@/components/ui";
import { useToast } from "@/features/feedback/Toaster";
import { PAYMENT_METHOD_LABELS } from "./labels";

/** Records a cash / transfer / mobile-money payment against a booking or a client. */
export function RecordPaymentDialog({
  open,
  onClose,
  businessId,
  bookingId,
  clientId,
  suggestedAmount,
  onRecorded,
}: {
  open: boolean;
  onClose: () => void;
  businessId: string;
  bookingId?: string;
  clientId?: string;
  suggestedAmount?: number;
  onRecorded?: () => void;
}) {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [receivedOn, setReceivedOn] = useState(today);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(suggestedAmount && suggestedAmount > 0 ? String(suggestedAmount) : "");
      setMethod("cash");
      setReference("");
      setReceivedOn(today);
      setNote("");
      setError(null);
    }
  }, [open, suggestedAmount, today]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/workspace/businesses/${businessId}/payments`, {
        method: "POST",
        json: { bookingId, clientId, amountEtb: Number(amount), method, reference: reference.trim() || undefined, receivedOn, note: note.trim() || undefined },
      });
      toast({ tone: "success", title: "Payment recorded" });
      onRecorded?.();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Record a payment"
      description="Record money you received in cash, by transfer or mobile money."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy || !(Number(amount) > 0)}>{busy ? "Saving…" : "Record payment"}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount (ETB)" required>
          {(control) => <Input {...control} type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />}
        </Field>
        <Field label="Method" required>
          {(control) => (
            <Select {...control} value={method} onChange={(e) => setMethod(e.target.value)}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Reference" hint="Transaction ID or receipt number, if any.">
          {(control) => <Input {...control} value={reference} onChange={(e) => setReference(e.target.value)} />}
        </Field>
        <Field label="Received on" required>
          {(control) => <Input {...control} type="date" max={today} value={receivedOn} onChange={(e) => setReceivedOn(e.target.value)} />}
        </Field>
        <Field label="Note (optional)" className="sm:col-span-2">
          {(control) => <Textarea {...control} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}
