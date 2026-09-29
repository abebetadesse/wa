"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Phone, Plus, ShieldAlert, Wallet } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, PageHeader, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { RecordPaymentDialog } from "@/features/workspace/RecordPaymentDialog";
import { useToast } from "@/features/feedback/Toaster";
import { BOOKING_STATUS, BookingStatusBadge, PaymentStatusBadge } from "@/features/marketplace/status";
import { MODE_LABELS, formatEtb } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  startsAt: string;
  endsAt: string;
  deliveryMode: string;
  priceEtb: string;
  paidEtb: string;
  clientNote: string | null;
  businessNote: string | null;
  serviceName: string;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  safety: { flags?: string[] } | null;
}

const ACTIONS: Record<string, { status: string; label: string; variant: "primary" | "outline" | "ghost" | "destructive"; askReason?: boolean }[]> = {
  requested: [
    { status: "confirmed", label: "Confirm", variant: "primary" },
    { status: "declined", label: "Decline", variant: "ghost", askReason: true },
  ],
  confirmed: [
    { status: "completed", label: "Mark completed", variant: "primary" },
    { status: "no_show", label: "No-show", variant: "ghost" },
    { status: "cancelled", label: "Cancel", variant: "ghost", askReason: true },
  ],
};

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return copy;
};

export default function BookingsPage() {
  const { business, can } = useWorkspace();
  const params = useSearchParams();
  const toast = useToast();
  const statusFilter = params.get("status") ?? "";
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 7 * 86_400_000), [weekStart]);

  const query = new URLSearchParams(statusFilter ? { status: statusFilter } : { from: weekStart.toISOString(), to: weekEnd.toISOString() });
  const { data, error, reload } = useApi<Booking[]>(`/api/workspace/businesses/${business.id}/bookings?${query}`, { liveTypes: ["booking."] });

  const [reasonFor, setReasonFor] = useState<{ booking: Booking; status: string } | null>(null);
  const [reason, setReason] = useState("");
  const [paymentFor, setPaymentFor] = useState<Booking | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const focus = params.get("focus");

  useEffect(() => {
    if (focus && data) document.getElementById(`booking-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus, data]);

  async function transition(booking: Booking, status: string, withReason?: string) {
    setBusy(booking.id);
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/bookings/${booking.id}`, { method: "PATCH", json: { status, reason: withReason || undefined } });
      toast({ tone: "success", title: `Booking ${BOOKING_STATUS[status]?.label.toLowerCase() ?? status}`, body: booking.clientName });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not update the booking", body: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  }

  const tz = business.timezone;
  const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(iso));
  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of data ?? []) map.set(dayKey(booking.startsAt), [...(map.get(dayKey(booking.startsAt)) ?? []), booking]);
    return [...map.entries()];
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const weekLabel = `${weekStart.toLocaleDateString([], { day: "numeric", month: "short" })} – ${new Date(weekEnd.getTime() - 86_400_000).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bookings"
        description="New requests and changes appear instantly."
        actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" aria-hidden="true" /> New booking</Button>}
        className="mb-0"
      />

      <div className="flex flex-wrap items-center gap-2">
        {!statusFilter && (
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button type="button" className="rounded-full p-1.5 hover:bg-accent" onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 86_400_000))} aria-label="Previous week"><ChevronLeft className="size-4" aria-hidden="true" /></button>
            <span className="px-2 text-sm font-semibold text-foreground">{weekLabel}</span>
            <button type="button" className="rounded-full p-1.5 hover:bg-accent" onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 86_400_000))} aria-label="Next week"><ChevronRight className="size-4" aria-hidden="true" /></button>
          </div>
        )}
        {!statusFilter && <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>This week</Button>}
        <div className="ml-auto flex flex-wrap gap-1">
          {[["", "Week view"], ["requested", "Requests"], ["confirmed", "Confirmed"], ["completed", "Completed"]].map(([value, label]) => (
            <a
              key={value}
              href={value ? `?status=${value}` : "?"}
              className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", statusFilter === value ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:bg-accent")}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && !data && <LoadingState />}
      {data && data.length === 0 && <EmptyState title={statusFilter ? "Nothing here" : "No bookings this week"} description="Clients book from your public page; you can also add phone or walk-in bookings." />}

      {groups.map(([day, bookings]) => (
        <section key={day} aria-label={day}>
          <h2 className="sticky top-16 z-10 mb-2 bg-background/90 py-1 text-sm font-bold text-muted-foreground backdrop-blur">
            {new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(`${day}T12:00:00Z`))}
          </h2>
          <ul className="flex flex-col gap-3">
            {bookings.map((booking) => {
              const flags = booking.safety?.flags ?? [];
              const outstanding = Number(booking.priceEtb) - Number(booking.paidEtb);
              return (
                <li key={booking.id} id={`booking-${booking.id}`} className={cn("rounded-3xl border bg-card p-4 transition-shadow", focus === booking.id ? "border-brand shadow-lg ring-2 ring-brand/30" : "border-border")}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="w-20 shrink-0">
                      <p className="font-display text-xl font-extrabold text-foreground">{new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(booking.startsAt))}</p>
                      <p className="text-xs text-muted-foreground">to {new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(booking.endsAt))}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{booking.clientName}</p>
                        <BookingStatusBadge status={booking.status} />
                        <PaymentStatusBadge status={booking.paymentStatus} />
                        <span className="font-mono text-[11px] text-muted-foreground">{booking.reference}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.serviceName} · {MODE_LABELS[booking.deliveryMode]?.label ?? booking.deliveryMode} · {formatEtb(booking.priceEtb)}</p>
                      {booking.clientPhone && (
                        <a href={`tel:${booking.clientPhone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"><Phone className="size-3.5" aria-hidden="true" /> {booking.clientPhone}</a>
                      )}
                      {booking.clientNote && <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-sm text-foreground">“{booking.clientNote}”</p>}
                      {flags.length > 0 && (
                        <div className="mt-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
                          <p className="flex items-center gap-1.5 font-semibold text-foreground"><ShieldAlert className="size-4 text-warning" aria-hidden="true" /> Safety notes</p>
                          <ul className="mt-1 list-disc pl-5 text-foreground">{flags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(ACTIONS[booking.status] ?? []).map((action) => (
                        <Button
                          key={action.status}
                          size="sm"
                          variant={action.variant}
                          disabled={busy === booking.id}
                          onClick={() => (action.askReason ? (setReason(""), setReasonFor({ booking, status: action.status })) : transition(booking, action.status))}
                        >
                          {action.label}
                        </Button>
                      ))}
                      {can("recordPayments") && booking.paymentStatus !== "paid" && ["confirmed", "completed"].includes(booking.status) && (
                        <Button size="sm" variant="outline" onClick={() => setPaymentFor(booking)}>
                          <Wallet className="size-4" aria-hidden="true" /> Payment{outstanding > 0 ? ` · ${formatEtb(outstanding)} due` : ""}
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <Dialog
        open={Boolean(reasonFor)}
        onClose={() => setReasonFor(null)}
        title={reasonFor?.status === "declined" ? "Decline this request?" : "Cancel this booking?"}
        description="The client is notified immediately. A short, kind reason helps."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReasonFor(null)}>Keep it</Button>
            <Button variant="destructive" onClick={() => { if (reasonFor) transition(reasonFor.booking, reasonFor.status, reason.trim()); setReasonFor(null); }}>
              {reasonFor?.status === "declined" ? "Decline" : "Cancel booking"}
            </Button>
          </>
        }
      >
        <Field label="Reason for the client">
          {(control) => <Textarea {...control} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. I'm travelling that day — could you book next week?" />}
        </Field>
      </Dialog>

      {paymentFor && (
        <RecordPaymentDialog
          open
          onClose={() => setPaymentFor(null)}
          businessId={business.id}
          bookingId={paymentFor.id}
          suggestedAmount={Math.max(0, Number(paymentFor.priceEtb) - Number(paymentFor.paidEtb))}
          onRecorded={reload}
        />
      )}

      {creating && <NewBookingDialog onClose={() => setCreating(false)} onCreated={reload} />}
    </div>
  );
}

function NewBookingDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { business } = useWorkspace();
  const toast = useToast();
  const clients = useApi<{ clients: { id: string; name: string; phone: string | null }[] }>(`/api/workspace/businesses/${business.id}/clients?page=1`);
  const services = useApi<{ id: string; name: string; isActive: boolean; deliveryModes: string[]; durationMinutes: number }[]>(`/api/workspace/businesses/${business.id}/services`);
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [when, setWhen] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const service = services.data?.find((s) => s.id === serviceId);

  useEffect(() => {
    if (service && !service.deliveryModes.includes(mode)) setMode(service.deliveryModes[0] ?? "");
  }, [service, mode]);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      // datetime-local is wall-clock time in the business timezone; the server converts it.
      await apiFetch(`/api/workspace/businesses/${business.id}/bookings`, {
        method: "POST",
        json: { clientId, serviceId, startsAtLocal: when.slice(0, 16), deliveryMode: mode, status, note: note.trim() || undefined },
      });
      toast({ tone: "success", title: "Booking added" });
      onCreated();
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
      title="New booking"
      description="For phone or walk-in clients. To add someone new, create them under Clients first."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={create} disabled={busy || !clientId || !serviceId || !when || !mode}>{busy ? "Saving…" : "Add booking"}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client" required className="sm:col-span-2">
          {(control) => (
            <Select {...control} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Choose a client…</option>
              {clients.data?.clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.phone ? ` · ${client.phone}` : ""}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Service" required>
          {(control) => (
            <Select {...control} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">Choose…</option>
              {services.data?.filter((s) => s.isActive).map((s) => <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>)}
            </Select>
          )}
        </Field>
        <Field label="How">
          {(control) => (
            <Select {...control} value={mode} onChange={(e) => setMode(e.target.value)} disabled={!service}>
              {service?.deliveryModes.map((m) => <option key={m} value={m}>{MODE_LABELS[m]?.label ?? m}</option>)}
            </Select>
          )}
        </Field>
        <Field label="Date and time" required hint={`Local time (${business.timezone.replace("_", " ")})`}>
          {(control) => <Input {...control} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />}
        </Field>
        <Field label="Status">
          {(control) => (
            <Select {...control} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="confirmed">Confirmed</option>
              <option value="requested">Requested (confirm later)</option>
            </Select>
          )}
        </Field>
        <Field label="Internal note (optional)" className="sm:col-span-2">
          {(control) => <Textarea {...control} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
        {clients.data && clients.data.clients.length === 0 && <Badge tone="warning" className="sm:col-span-2">Add a client first under Clients.</Badge>}
      </div>
    </Dialog>
  );
}
