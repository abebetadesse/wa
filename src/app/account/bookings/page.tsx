"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, ChevronRight } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { ButtonLink, EmptyState, ErrorState, LoadingState, PageHeader, PageShell } from "@/components/ui";
import { useRealtime } from "@/features/realtime/RealtimeProvider";
import { BookingStatusBadge, formatWhen } from "@/features/marketplace/status";
import { MODE_LABELS, formatEtb } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

interface ClientBooking {
  id: string;
  reference: string;
  status: string;
  startsAt: string;
  deliveryMode: string;
  priceEtb: string;
  serviceName: string;
  businessName: string;
  businessSlug: string;
  timezone: string;
}

export default function MyBookingsPage() {
  const { t } = useLanguage();
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<ClientBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setBookings(await apiFetch<ClientBooking[]>(`/api/account/bookings?scope=${scope}`));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [scope]);

  useEffect(() => {
    setBookings(null);
    load();
  }, [load]);

  useRealtime(["booking."], () => load());

  return (
    <PageShell>
      <PageHeader eyebrow={t.bookings.yourAccount} title={t.bookings.myBookings} description={t.bookings.statusChangesAppear} actions={<ButtonLink href="/marketplace" variant="outline">{t.bookings.bookSomethingNew}</ButtonLink>} />

      <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1" role="tablist" aria-label={t.bookings.myBookings}>
        {(["upcoming", "past"] as const).map((value) => (
          <button
            key={value}
            role="tab"
            aria-selected={scope === value}
            onClick={() => setScope(value)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors", scope === value ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {value === "upcoming" ? t.bookings.upcoming : t.bookings.past}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !bookings && <LoadingState label={t.bookings.loadingYourBookings} />}
      {bookings && bookings.length === 0 && (
        <EmptyState
          title={scope === "upcoming" ? t.bookings.noUpcomingBookings : t.bookings.noPastBookings}
          description={t.bookings.whenYouBook}
          action={<ButtonLink href="/marketplace">{t.bookings.findAHealer}</ButtonLink>}
        />
      )}
      {bookings && bookings.length > 0 && (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <Link href={`/account/bookings/${booking.id}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-input">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <CalendarCheck className="size-6" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold text-foreground">{booking.serviceName} · {booking.businessName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatWhen(booking.startsAt, booking.timezone, "short")} · {MODE_LABELS[booking.deliveryMode]?.label ?? booking.deliveryMode} · {formatEtb(booking.priceEtb)}
                  </span>
                </span>
                <BookingStatusBadge status={booking.status} />
                <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
