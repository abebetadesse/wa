"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, CardHeader, CardTitle, ErrorState, Field, LoadingState, PageShell, Textarea } from "@/components/ui";
import { useRealtime } from "@/features/realtime/RealtimeProvider";
import { useToast } from "@/features/feedback/Toaster";
import { BookingStatusBadge, PaymentStatusBadge, formatWhen } from "@/features/marketplace/status";
import { MODE_LABELS, formatEtb } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";

interface BookingDetail {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  startsAt: string;
  endsAt: string;
  deliveryMode: string;
  priceEtb: string;
  clientNote: string | null;
  serviceName: string;
  businessName: string;
  businessSlug: string;
  businessPhone: string | null;
  businessAddress: string | null;
  timezone: string;
  cancelReason: string | null;
  reviewed: boolean;
}

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<BookingDetail>(`/api/account/bookings/${bookingId}`);
      setBooking(data);
      if (data.reviewed) setReviewed(true);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime(["booking."], (event) => {
    if (event.payload.bookingId === bookingId) load();
  });

  async function cancel() {
    setCancelling(true);
    try {
      setBooking(await apiFetch<BookingDetail>(`/api/account/bookings/${bookingId}/cancel`, { method: "POST", json: {} }));
      toast({ tone: "success", title: "Booking cancelled" });
    } catch (err) {
      toast({ tone: "error", title: "Could not cancel", body: errorMessage(err) });
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  }

  async function submitReview() {
    try {
      await apiFetch("/api/account/reviews", { method: "POST", json: { bookingId, rating, comment: comment.trim() || undefined } });
      setReviewed(true);
      toast({ tone: "success", title: "Thank you for your review" });
    } catch (err) {
      toast({ tone: "error", title: "Could not save your review", body: errorMessage(err) });
    }
  }

  async function message() {
    if (!booking) return;
    try {
      const conversation = await apiFetch<{ id: string }>(`/api/marketplace/businesses/${booking.businessSlug}/conversation`, { method: "POST" });
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      toast({ tone: "error", title: "Could not open messages", body: errorMessage(err) });
    }
  }

  if (error) return <PageShell width="narrow"><ErrorState message={error} onRetry={load} /></PageShell>;
  if (!booking) return <PageShell width="narrow"><LoadingState /></PageShell>;

  const cancellable = (booking.status === "requested" || booking.status === "confirmed") && new Date(booking.startsAt) > new Date();
  const mode = MODE_LABELS[booking.deliveryMode];

  return (
    <PageShell width="narrow">
      <Link href="/account/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> My bookings
      </Link>

      {params.get("new") && booking.status === "requested" && (
        <Alert tone="success" title="Request sent" className="mb-6">
          {booking.businessName} will confirm shortly. You&apos;ll be notified here the moment they do.
        </Alert>
      )}

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-brand/15 via-transparent to-gold/15 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
            <span className="ml-auto font-mono text-xs text-muted-foreground">{booking.reference}</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-foreground sm:text-3xl">{booking.serviceName}</h1>
          <Link href={`/b/${booking.businessSlug}`} className="font-semibold text-brand hover:underline">{booking.businessName}</Link>
        </div>
        <dl className="grid gap-4 p-6 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">When</dt><dd className="font-semibold text-foreground">{formatWhen(booking.startsAt, booking.timezone)}</dd></div>
          <div><dt className="text-muted-foreground">How</dt><dd className="inline-flex items-center gap-1.5 font-semibold text-foreground">{mode && <mode.icon className="size-4" aria-hidden="true" />}{mode?.label ?? booking.deliveryMode}</dd></div>
          <div><dt className="text-muted-foreground">Price</dt><dd className="font-semibold text-foreground">{formatEtb(booking.priceEtb)}</dd></div>
          {booking.businessAddress && booking.deliveryMode === "in_person" && (
            <div><dt className="text-muted-foreground">Where</dt><dd className="inline-flex items-start gap-1.5 font-semibold text-foreground"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{booking.businessAddress}</dd></div>
          )}
          {booking.clientNote && <div className="sm:col-span-2"><dt className="text-muted-foreground">Your note</dt><dd className="text-foreground">{booking.clientNote}</dd></div>}
          {booking.cancelReason && <div className="sm:col-span-2"><dt className="text-muted-foreground">Reason</dt><dd className="text-foreground">{booking.cancelReason}</dd></div>}
        </dl>
        <div className="flex flex-wrap gap-2 border-t border-border p-6">
          <Button variant="outline" onClick={message}><MessageCircle className="size-4" aria-hidden="true" /> Message</Button>
          {booking.businessPhone && (
            <a href={`tel:${booking.businessPhone}`} className="inline-flex h-11 items-center gap-2 rounded-full border border-input px-5 text-sm font-semibold text-foreground hover:bg-accent">
              <Phone className="size-4" aria-hidden="true" /> Call
            </a>
          )}
          {cancellable && !confirmCancel && <Button variant="ghost" className="ml-auto text-danger" onClick={() => setConfirmCancel(true)}>Cancel booking</Button>}
          {confirmCancel && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Cancel this booking?</span>
              <Button variant="destructive" size="sm" onClick={cancel} disabled={cancelling}>{cancelling ? "Cancelling…" : "Yes, cancel"}</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(false)}>Keep it</Button>
            </div>
          )}
        </div>
      </div>

      {booking.status === "completed" && (
        <Card className="mt-6">
          <CardHeader><CardTitle>{reviewed ? "Review saved" : "How was it?"}</CardTitle></CardHeader>
          <CardContent>
            {reviewed ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-5 text-success" aria-hidden="true" /> Thank you — your review helps others choose well.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setRating(value)} className="rounded-full p-1 hover:scale-110 transition-transform">
                      <Star className={cn("size-8", value <= rating ? "fill-gold text-gold" : "text-muted-foreground/40")} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <Field label="Tell others about your experience (optional)">
                  {(control) => <Textarea {...control} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />}
                </Field>
                <Button onClick={submitReview} disabled={rating === 0} className="self-end">Submit review</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
