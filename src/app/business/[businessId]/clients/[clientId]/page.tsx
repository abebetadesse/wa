"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Lock, Mail, Pencil, Phone, ShieldAlert, Wallet } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, ErrorState, LoadingState } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { RecordPaymentDialog } from "@/features/workspace/RecordPaymentDialog";
import { BookingStatusBadge, PaymentStatusBadge, formatWhen } from "@/features/marketplace/status";
import { Monogram, formatEtb } from "@/features/marketplace/shared";
import { PAYMENT_METHOD_LABELS } from "@/features/workspace/labels";
import { ClientDialog } from "@/features/workspace/ClientDialog";

interface ClientDetail {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  tags: string[];
  userId: string | null;
  consent: { recordKeeping?: string };
  createdAt: string;
  history: { id: string; reference: string; startsAt: string; status: string; paymentStatus: string; priceEtb: string; serviceName: string; safety: { flags?: string[] } | null }[];
  payments: { id: string; amountEtb: string; method: string; receivedOn: string; status: string; reference: string | null }[];
}

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { business, base, can } = useWorkspace();
  const { data, error, reload } = useApi<ClientDetail>(`/api/workspace/businesses/${business.id}/clients/${clientId}`, { liveTypes: ["client.", "booking.", "payment."] });
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;

  const recorded = data.payments.filter((p) => p.status === "recorded");
  const totalPaid = recorded.reduce((sum, p) => sum + Number(p.amountEtb), 0);
  const allFlags = [...new Set(data.history.flatMap((h) => h.safety?.flags ?? []))];

  return (
    <div className="flex flex-col gap-6">
      <Link href={`${base}/clients`} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Clients
      </Link>
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-card p-6">
        <Monogram name={data.name} className="size-16 rounded-full text-2xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold text-foreground">{data.name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {data.phone && <a href={`tel:${data.phone}`} className="inline-flex items-center gap-1 hover:text-foreground"><Phone className="size-4" aria-hidden="true" /> {data.phone}</a>}
            {data.email && <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1 hover:text-foreground"><Mail className="size-4" aria-hidden="true" /> {data.email}</a>}
            <span>Client since {new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
          {data.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{data.tags.map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}</div>}
        </div>
        <div className="flex gap-2">
          {can("recordPayments") && <Button variant="outline" onClick={() => setPaying(true)}><Wallet className="size-4" aria-hidden="true" /> Payment</Button>}
          <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader><CardTitle>Visits</CardTitle></CardHeader>
          <CardContent>
            {data.history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.history.map((visit) => (
                  <li key={visit.id}>
                    <Link href={`${base}/bookings?focus=${visit.id}&status=${visit.status}`} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm hover:border-input">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">{visit.serviceName}</span>
                        <span className="text-xs text-muted-foreground">{formatWhen(visit.startsAt, business.timezone, "short")} · {formatEtb(visit.priceEtb)}</span>
                      </span>
                      {visit.safety?.flags?.length ? <ShieldAlert className="size-4 text-warning" aria-label="Safety notes" /> : null}
                      <BookingStatusBadge status={visit.status} />
                      <PaymentStatusBadge status={visit.paymentStatus} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {data.notes !== null && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lock className="size-4 text-muted-foreground" aria-hidden="true" /> Private notes</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm text-foreground">{data.notes || <span className="text-muted-foreground">No notes yet.</span>}</p></CardContent>
            </Card>
          )}
          {allFlags.length > 0 && (
            <Card className="border-warning/40">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="size-4 text-warning" aria-hidden="true" /> Safety history</CardTitle></CardHeader>
              <CardContent><ul className="list-disc space-y-1 pl-5 text-sm text-foreground">{allFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul></CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">Payments · {formatEtb(totalPaid)}</CardTitle></CardHeader>
            <CardContent>
              {data.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {data.payments.map((payment) => (
                    <li key={payment.id} className="flex items-center justify-between gap-2">
                      <span className={payment.status === "voided" ? "text-muted-foreground line-through" : "text-foreground"}>
                        {new Date(payment.receivedOn).toLocaleDateString()} · {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                      </span>
                      <span className="font-semibold text-foreground">{formatEtb(payment.amountEtb)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            {data.consent.recordKeeping ? `Record-keeping consent given ${new Date(data.consent.recordKeeping).toLocaleDateString()}.` : "No record-keeping consent recorded."}
          </p>
        </div>
      </div>

      {editing && <ClientDialog client={data} onClose={() => setEditing(false)} onSaved={reload} />}
      {paying && <RecordPaymentDialog open onClose={() => setPaying(false)} businessId={business.id} clientId={data.id} onRecorded={reload} />}
    </div>
  );
}
