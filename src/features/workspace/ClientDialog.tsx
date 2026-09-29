"use client";

import { useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Dialog, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/features/feedback/Toaster";
import { useWorkspace } from "./WorkspaceContext";

export function ClientDialog({ client, onClose, onSaved }: { client?: { id: string; name: string; phone: string | null; email: string | null; notes: string | null; tags: string[] }; onClose: () => void; onSaved: () => void }) {
  const { business } = useWorkspace();
  const toast = useToast();
  const [form, setForm] = useState({ name: client?.name ?? "", phone: client?.phone ?? "", email: client?.email ?? "", notes: client?.notes ?? "", tags: client?.tags.join(", ") ?? "" });
  const [consent, setConsent] = useState(Boolean(client));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/clients${client ? `/${client.id}` : ""}`, {
        method: client ? "PUT" : "POST",
        json: {
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          notes: form.notes || undefined,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          recordKeepingConsent: consent,
        },
      });
      toast({ tone: "success", title: client ? "Client updated" : "Client added" });
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
      title={client ? "Edit client" : "Add a client"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy || form.name.trim().length < 2 || (!client && !consent)}>{busy ? "Saving…" : "Save"}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required className="sm:col-span-2">{(control) => <Input {...control} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />}</Field>
        <Field label="Phone">{(control) => <Input {...control} type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />}</Field>
        <Field label="Email">{(control) => <Input {...control} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />}</Field>
        <Field label="Private notes" hint="Only you and your practitioners see these." className="sm:col-span-2">
          {(control) => <Textarea {...control} rows={4} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />}
        </Field>
        <Field label="Tags" hint="Comma separated, e.g. regular, family, referral" className="sm:col-span-2">
          {(control) => <Input {...control} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />}
        </Field>
        {!client && (
          <label className="flex items-start gap-2 text-sm text-foreground sm:col-span-2">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[var(--brand-accent)]" />
            The client agreed that I keep a record of their details and visits.
          </label>
        )}
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
      </div>
    </Dialog>
  );
}
