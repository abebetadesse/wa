"use client";

import { useEffect, useState } from "react";
import { PhoneCall, Plus, Trash2 } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Field, Input, LoadingState, PageHeader, PageShell } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import { EMERGENCY_GUIDANCE } from "@/lib/safety/emergencyContacts";
import type { EmergencyContactSettings } from "@/server/settings";

interface Response {
  value: EmergencyContactSettings;
}

type Contact = EmergencyContactSettings["contacts"][number];

const blank = (): Contact => ({ name: "", number: "", verifiedOn: new Date().toISOString().slice(0, 10) });

export default function EmergencyNumbersPage() {
  const toast = useToast();
  const { data, error, reload, setData } = useApi<Response>("/api/admin/settings/emergencyContacts");
  const [draft, setDraft] = useState<Contact[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !draft) setDraft(data.value.contacts);
  }, [data, draft]);

  const update = (index: number, patch: Partial<Contact>) => setDraft((rows) => rows?.map((row, i) => (i === index ? { ...row, ...patch } : row)) ?? null);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const contacts = draft.filter((row) => row.name.trim() || row.number.trim());
      const result = await apiFetch<Response>("/api/admin/settings/emergencyContacts", { method: "PUT", json: { value: { contacts } } });
      setData(result);
      setDraft(result.value.contacts);
      toast({ tone: "success", title: "Emergency numbers saved" });
    } catch (err) {
      toast({ tone: "error", title: "Could not save", body: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title="Emergency numbers"
        description="Numbers shown to people in a crisis or medical emergency. Add a number only after you have confirmed it with the service that answers it."
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || !draft ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-6">
          <Alert tone={draft.length ? "info" : "warning"} title={draft.length ? "Verified numbers are shown on every emergency screen" : "No numbers are shown yet"}>
            While this list is empty, people see this guidance instead: “{EMERGENCY_GUIDANCE}”
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PhoneCall className="size-5 text-brand" aria-hidden="true" /> Verified numbers</CardTitle>
              <CardDescription>Use the service name people will recognise. Record the date you confirmed the number.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {draft.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                  <Field label="Service">
                    {(control) => <Input {...control} value={row.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="Ambulance" />}
                  </Field>
                  <Field label="Number">
                    {(control) => <Input {...control} type="tel" inputMode="tel" value={row.number} onChange={(e) => update(index, { number: e.target.value })} />}
                  </Field>
                  <Field label="Confirmed on">
                    {(control) => <Input {...control} type="date" value={row.verifiedOn} onChange={(e) => update(index, { verifiedOn: e.target.value })} />}
                  </Field>
                  <Button variant="ghost" size="icon" aria-label="Remove number" onClick={() => setDraft(draft.filter((_, i) => i !== index))}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <div>
                <Button variant="outline" onClick={() => setDraft([...draft, blank()])} disabled={draft.length >= 12}>
                  <Plus className="size-4" aria-hidden="true" /> Add a number
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
