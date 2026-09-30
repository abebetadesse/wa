"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Circle, Clock, FlaskConical, Inbox, ShieldAlert, Star, UserPlus, Wallet } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, ButtonLink, Card, CardContent, CardHeader, CardTitle, ErrorState, LoadingState } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { BookingStatusBadge, formatWhen } from "@/features/marketplace/status";
import { MODE_LABELS, formatEtb } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";

interface Dashboard {
  status: string;
  timezone: string;
  kpis: {
    bookingsToday: number;
    pendingRequests: number;
    bookingsNext7Days: number;
    completedUnpaid: number;
    newClients30Days: number;
    lowStockRemedies: number;
    paymentsToConfirm: number;
    ratingAverage: number | null;
    ratingCount: number;
    revenueMonthEtb: number | null;
  };
  revenueSeries: { day: string; totalEtb: number }[] | null;
  upcoming: { id: string; reference: string; startsAt: string; status: string; deliveryMode: string; serviceName: string; clientName: string; flagged: boolean }[];
  latestReviews: { id: string; rating: number; comment: string | null; createdAt: string; responded: boolean }[];
}

function Kpi({ icon: Icon, label, value, hint, href, tone = "brand" }: { icon: typeof Clock; label: string; value: string | number; hint?: string; href?: string; tone?: "brand" | "gold" | "warning" | "danger" }) {
  const body = (
    <div className="flex h-full flex-col gap-3 rounded-3xl border border-border bg-card p-5 transition-colors hover:border-input">
      <span className={cn("grid size-10 place-items-center rounded-2xl", { brand: "bg-brand/10 text-brand", gold: "bg-gold/15 text-gold", warning: "bg-warning/10 text-warning", danger: "bg-danger/10 text-danger" }[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="font-display text-3xl font-extrabold tracking-tight text-foreground">{value}</span>
      <span className="text-sm text-muted-foreground">{label}{hint && <span className="block text-xs">{hint}</span>}</span>
    </div>
  );
  return href ? <Link href={href} className="block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{body}</Link> : body;
}

function RevenueChart({ series }: { series: { day: string; totalEtb: number }[] }) {
  const max = Math.max(1, ...series.map((point) => point.totalEtb));
  const total = series.reduce((sum, point) => sum + point.totalEtb, 0);
  return (
    <figure>
      <div className="flex h-36 items-end gap-1" role="img" aria-label={`Payments received over the last 30 days, total ${formatEtb(total)}`}>
        {series.map((point) => (
          <div key={point.day} className="group relative flex-1">
            <div
              className={cn("w-full rounded-t-md transition-colors", point.totalEtb > 0 ? "bg-gradient-to-t from-brand to-sky-400 group-hover:from-gold group-hover:to-amber-400" : "bg-border")}
              style={{ height: `${Math.max(4, (point.totalEtb / max) * 136)}px` }}
            />
            <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-inverse px-2 py-1 text-[11px] font-semibold text-inverse-foreground group-hover:block">
              {new Date(`${point.day}T12:00:00Z`).toLocaleDateString([], { day: "numeric", month: "short" })} · {formatEtb(point.totalEtb)}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span className="font-semibold text-foreground">{formatEtb(total)} received</span>
        <span>Today</span>
      </figcaption>
    </figure>
  );
}

function SetupChecklist({ hasServices, hasHours }: { hasServices: boolean; hasHours: boolean }) {
  const { business, base } = useWorkspace();
  const steps = [
    { done: true, label: "Create your business", href: `${base}/settings` },
    { done: hasServices, label: "Add at least one service with a price", href: `${base}/services` },
    { done: hasHours, label: "Set your opening hours", href: `${base}/hours` },
    { done: Boolean(business.paymentAccounts?.telebirr || business.paymentAccounts?.banks?.length), label: "Add your telebirr or bank details so clients can pay you", href: `${base}/settings#payments` },
    { done: business.status === "pending_verification" || business.status === "verified", label: "Request verification to appear in the marketplace", href: `${base}/settings#verification` },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-border"><div className="h-full bg-gradient-to-r from-brand to-gold transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} /></div>
      <CardHeader>
        <CardTitle>Get ready to take bookings</CardTitle>
        <p className="text-sm text-muted-foreground">{doneCount} of {steps.length} done</p>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-2">
          {steps.map((step) => (
            <li key={step.label}>
              <Link href={step.href} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors", step.done ? "border-transparent bg-success/10 text-foreground" : "border-border hover:border-input")}>
                {step.done ? <CheckCircle2 className="size-5 text-success" aria-hidden="true" /> : <Circle className="size-5 text-muted-foreground" aria-hidden="true" />}
                <span className={cn("flex-1", step.done && "line-through decoration-muted-foreground/50")}>{step.label}</span>
                {!step.done && <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { business, base, can } = useWorkspace();
  const params = useSearchParams();
  const toast = useToast();
  const board = useApi<Dashboard>(`/api/workspace/businesses/${business.id}/dashboard`, { liveTypes: ["booking.", "payment.", "review.", "stock.", "client."] });
  const services = useApi<unknown[]>(can("manageServices") ? `/api/workspace/businesses/${business.id}/services` : null, { liveTypes: ["service."] });
  const hours = useApi<{ rules: unknown[] }>(can("manageSchedule") ? `/api/workspace/businesses/${business.id}/hours` : null, { liveTypes: ["schedule."] });
  const [acting, setActing] = useState<string | null>(null);

  async function act(bookingId: string, status: "confirmed" | "declined") {
    setActing(bookingId);
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/bookings/${bookingId}`, { method: "PATCH", json: { status } });
      toast({ tone: "success", title: status === "confirmed" ? "Booking confirmed" : "Booking declined", body: "The client has been notified." });
      board.reload();
    } catch (error) {
      toast({ tone: "error", title: "Could not update the booking", body: errorMessage(error) });
    } finally {
      setActing(null);
    }
  }

  if (board.error) return <ErrorState message={board.error} onRetry={board.reload} />;
  if (!board.data) return <LoadingState label="Loading your dashboard…" />;
  const { kpis } = board.data;
  const needsSetup = business.status === "draft" || (services.data !== null && services.data.length === 0) || (hours.data !== null && hours.data.rules.length === 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-muted-foreground">{new Intl.DateTimeFormat("en-GB", { timeZone: board.data.timezone, weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Selam, welcome back</h1>
      </header>

      {params.get("welcome") && <Alert tone="success" title="Your business is created">Follow the steps below to start taking bookings.</Alert>}
      {business.status === "suspended" && <Alert tone="danger" title="This business is suspended">{business.verification?.notes ?? "Contact support to resolve this."}</Alert>}
      {business.status === "draft" && business.verification?.notes && <Alert tone="warning" title="Verification needs changes">{business.verification.notes}</Alert>}

      {needsSetup && can("manageProfile") && <SetupChecklist hasServices={(services.data?.length ?? 0) > 0} hasHours={(hours.data?.rules.length ?? 0) > 0} />}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi icon={Inbox} label="Requests waiting" value={kpis.pendingRequests} tone={kpis.pendingRequests ? "warning" : "brand"} href={`${base}/bookings?status=requested`} />
        <Kpi icon={CalendarClock} label="Bookings today" value={kpis.bookingsToday} hint={`${kpis.bookingsNext7Days} in the next 7 days`} href={`${base}/bookings`} />
        {kpis.revenueMonthEtb !== null ? (
          <Kpi icon={Wallet} label="Received this month" value={formatEtb(kpis.revenueMonthEtb)} tone="gold" href={`${base}/payments`} />
        ) : (
          <Kpi icon={UserPlus} label="New clients (30 days)" value={kpis.newClients30Days} />
        )}
        <Kpi icon={Star} label="Rating" value={kpis.ratingAverage !== null ? kpis.ratingAverage.toFixed(1) : "—"} hint={`${kpis.ratingCount} reviews`} tone="gold" href={`${base}/reviews`} />
      </div>

      {(kpis.completedUnpaid > 0 || kpis.lowStockRemedies > 0 || kpis.paymentsToConfirm > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {kpis.paymentsToConfirm > 0 && can("viewFinance") && (
            <Link href={`${base}/payments`} className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/10 p-4 text-sm">
              <Wallet className="size-5 text-brand" aria-hidden="true" />
              <span className="flex-1 text-foreground"><strong>{kpis.paymentsToConfirm}</strong> client {kpis.paymentsToConfirm === 1 ? "payment" : "payments"} to confirm</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
          {kpis.completedUnpaid > 0 && can("recordPayments") && (
            <Link href={`${base}/bookings?status=completed`} className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
              <AlertTriangle className="size-5 text-warning" aria-hidden="true" />
              <span className="flex-1 text-foreground"><strong>{kpis.completedUnpaid}</strong> completed {kpis.completedUnpaid === 1 ? "booking is" : "bookings are"} not fully paid</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
          {kpis.lowStockRemedies > 0 && can("manageInventory") && (
            <Link href={`${base}/remedies`} className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm">
              <FlaskConical className="size-5 text-danger" aria-hidden="true" />
              <span className="flex-1 text-foreground"><strong>{kpis.lowStockRemedies}</strong> {kpis.lowStockRemedies === 1 ? "remedy is" : "remedies are"} low on stock</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Coming up</CardTitle>
            <ButtonLink href={`${base}/bookings`} variant="ghost" size="sm">All bookings <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
          </CardHeader>
          <CardContent>
            {board.data.upcoming.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No upcoming bookings yet. New requests appear here instantly.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {board.data.upcoming.map((booking) => (
                  <li key={booking.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-3">
                    <div className="w-16 shrink-0 text-center">
                      <p className="font-display text-lg font-extrabold text-foreground">{new Intl.DateTimeFormat("en-GB", { timeZone: board.data!.timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(booking.startsAt))}</p>
                      <p className="text-[11px] text-muted-foreground">{new Intl.DateTimeFormat("en-GB", { timeZone: board.data!.timezone, day: "numeric", month: "short" }).format(new Date(booking.startsAt))}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate font-semibold text-foreground">
                        {booking.clientName}
                        {booking.flagged && <ShieldAlert className="size-4 text-warning" aria-label="Safety notes attached" />}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{booking.serviceName} · {MODE_LABELS[booking.deliveryMode]?.label ?? booking.deliveryMode}</p>
                    </div>
                    {booking.status === "requested" ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => act(booking.id, "confirmed")} disabled={acting === booking.id}>Confirm</Button>
                        <Button size="sm" variant="ghost" onClick={() => act(booking.id, "declined")} disabled={acting === booking.id}>Decline</Button>
                      </div>
                    ) : (
                      <BookingStatusBadge status={booking.status} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          {board.data.revenueSeries && (
            <Card>
              <CardHeader><CardTitle>Payments received</CardTitle></CardHeader>
              <CardContent><RevenueChart series={board.data.revenueSeries} /></CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Latest reviews</CardTitle>
              <ButtonLink href={`${base}/reviews`} variant="ghost" size="sm">All</ButtonLink>
            </CardHeader>
            <CardContent>
              {board.data.latestReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Reviews appear after clients complete a booking.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {board.data.latestReviews.map((review) => (
                    <li key={review.id} className="text-sm">
                      <p className="text-gold">{"★".repeat(review.rating)}<span className="text-muted-foreground/40">{"★".repeat(5 - review.rating)}</span></p>
                      {review.comment && <p className="line-clamp-2 text-foreground">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground">{formatWhen(review.createdAt, board.data!.timezone, "short")}{review.responded ? " · replied" : ""}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
