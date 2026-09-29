"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { WEEKDAYS, minutesToTime, timeToMinutes } from "@/features/workspace/labels";

interface Rule {
  weekday: number;
  startMinute: number;
  endMinute: number;
  memberId: string | null;
}

interface Hours {
  rules: Rule[];
  timeOff: { id: string; startsAt: string; endsAt: string; reason: string | null; memberId: string | null }[];
}

/** Monday-first display order. */
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function HoursPage() {
  const { business } = useWorkspace();
  const toast = useToast();
  const { data, error, reload } = useApi<Hours>(`/api/workspace/businesses/${business.id}/hours`, { liveTypes: ["schedule."] });
  const [days, setDays] = useState<Record<number, { start: string; end: string }[]>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offForm, setOffForm] = useState({ start: "", end: "", reason: "" });

  useEffect(() => {
    if (!data || dirty) return;
    const next: Record<number, { start: string; end: string }[]> = {};
    for (const rule of data.rules.filter((r) => r.memberId === null)) {
      (next[rule.weekday] ??= []).push({ start: minutesToTime(rule.startMinute), end: minutesToTime(rule.endMinute) });
    }
    setDays(next);
  }, [data, dirty]);

  const update = (weekday: number, windows: { start: string; end: string }[]) => {
    setDirty(true);
    setDays((current) => ({ ...current, [weekday]: windows }));
  };

  async function save() {
    setSaving(true);
    try {
      const rules = Object.entries(days).flatMap(([weekday, windows]) =>
        windows.map((w) => ({ weekday: Number(weekday), startMinute: timeToMinutes(w.start), endMinute: w.end === "24:00" ? 1440 : timeToMinutes(w.end) })),
      );
      await apiFetch(`/api/workspace/businesses/${business.id}/hours`, { method: "PUT", json: { memberId: null, rules } });
      setDirty(false);
      toast({ tone: "success", title: "Opening hours saved", body: "Clients see the new times immediately." });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not save hours", body: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  function copyToWeekdays(from: number) {
    setDirty(true);
    setDays((current) => ({ ...current, ...Object.fromEntries([1, 2, 3, 4, 5].map((d) => [d, [...(current[from] ?? [])]])) }));
  }

  async function addTimeOff() {
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/time-off`, {
        method: "POST",
        json: { memberId: null, startsAt: new Date(offForm.start).toISOString(), endsAt: new Date(offForm.end).toISOString(), reason: offForm.reason || undefined },
      });
      setOffForm({ start: "", end: "", reason: "" });
      toast({ tone: "success", title: "Time off added" });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not add time off", body: errorMessage(err) });
    }
  }

  async function removeTimeOff(id: string) {
    await apiFetch(`/api/workspace/businesses/${business.id}/time-off/${id}`, { method: "DELETE" }).catch(() => null);
    reload();
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Opening hours" description={`Clients can only book inside these hours (${business.timezone.replace("_", " ")} time).`} className="mb-0" actions={<Button onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : dirty ? "Save changes" : "Saved"}</Button>} />
      {Object.keys(days).length === 0 && <Alert tone="warning" title="No opening hours yet">Add hours for at least one day so clients can book.</Alert>}

      <Card>
        <CardContent className="divide-y divide-border pt-2">
          {ORDER.map((weekday) => {
            const windows = days[weekday] ?? [];
            return (
              <div key={weekday} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
                <div className="flex w-40 items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${weekday}`}
                    checked={windows.length > 0}
                    onChange={(e) => update(weekday, e.target.checked ? [{ start: "09:00", end: "17:00" }] : [])}
                    className="size-4 accent-[var(--brand-accent)]"
                  />
                  <label htmlFor={`day-${weekday}`} className="font-semibold text-foreground">{WEEKDAYS[weekday]}</label>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {windows.length === 0 && <p className="text-sm text-muted-foreground">Closed</p>}
                  {windows.map((window, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <Input type="time" aria-label={`${WEEKDAYS[weekday]} opens`} className="h-10 w-32" value={window.start} onChange={(e) => update(weekday, windows.map((w, i) => (i === index ? { ...w, start: e.target.value } : w)))} />
                      <span className="text-muted-foreground">to</span>
                      <Input type="time" aria-label={`${WEEKDAYS[weekday]} closes`} className="h-10 w-32" value={window.end} onChange={(e) => update(weekday, windows.map((w, i) => (i === index ? { ...w, end: e.target.value } : w)))} />
                      <button type="button" onClick={() => update(weekday, windows.filter((_, i) => i !== index))} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-danger" aria-label="Remove time range">
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {windows.length > 0 && (
                    <div className="flex gap-3">
                      <button type="button" onClick={() => update(weekday, [...windows, { start: "14:00", end: "17:00" }])} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                        <Plus className="size-3.5" aria-hidden="true" /> Add a break / second range
                      </button>
                      {weekday === 1 && (
                        <button type="button" onClick={() => copyToWeekdays(1)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Copy to Mon–Fri</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarOff className="size-5 text-brand" aria-hidden="true" /> Time off</CardTitle>
          <CardDescription>Holidays, fasting days or travel. No bookings are offered in these periods.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <Field label="From">{(control) => <Input {...control} type="datetime-local" value={offForm.start} onChange={(e) => setOffForm((f) => ({ ...f, start: e.target.value }))} />}</Field>
            <Field label="Until">{(control) => <Input {...control} type="datetime-local" value={offForm.end} onChange={(e) => setOffForm((f) => ({ ...f, end: e.target.value }))} />}</Field>
            <Field label="Reason (optional)">{(control) => <Input {...control} value={offForm.reason} onChange={(e) => setOffForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Timket" />}</Field>
            <Button onClick={addTimeOff} disabled={!offForm.start || !offForm.end}>Add</Button>
          </div>
          {data.timeOff.length > 0 && (
            <ul className="flex flex-col gap-2">
              {data.timeOff.map((off) => (
                <li key={off.id} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-2 text-sm">
                  <span className="flex-1 text-foreground">
                    {new Date(off.startsAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} → {new Date(off.endsAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    {off.reason && <span className="text-muted-foreground"> · {off.reason}</span>}
                  </span>
                  <button type="button" onClick={() => removeTimeOff(off.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-danger" aria-label="Remove time off">
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
