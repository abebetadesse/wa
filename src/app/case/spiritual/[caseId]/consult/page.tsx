"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withBasePath } from '@/lib/base-path';

export default function SpiritualConsultPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const router = useRouter();
  const { caseId } = use(params);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("10:00 – 10:30");
  const [selectedFormat, setSelectedFormat] = useState<"video" | "voice" | "chat" | "in_person">("video");
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState<{ id: string; title: string; label: string; prayer: string; prayerGe?: string; telsemName?: string | null } | null>(null);

  useEffect(() => {
    fetch(withBasePath(`/api/case/spiritual/${caseId}/status`), { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) return;
        setSelectedService(payload.data?.serviceChoice ?? null);
      })
      .catch(() => undefined);
  }, [caseId]);

  useEffect(() => {
    setLoadingSlots(true);
    fetch(withBasePath(`/api/experts/expert-selamawit-tadesse/availability?date=${selectedDate}`))
      .then((r) => r.json())
      .then((payload) => {
        if (payload.success && payload.data) {
          setSlots(payload.data.slots || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleBook = async () => {
    setIsBooking(true);
    try {
      const res = await fetch(withBasePath(`/api/case/spiritual/${caseId}/consult`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId: "expert-selamawit-tadesse",
          slot: `${selectedDate} ${selectedSlot}`,
          format: selectedFormat,
        }),
      });

      const payload = await res.json();
      if (payload.success) {
        setBookedSuccess(true);
      } else {
        throw new Error(payload.error || "Booking failed");
      }
    } catch (err) {
      alert("Booking error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-4">
          <Link href={`/case/spiritual/${caseId}/report`} className="hover:text-gold transition-colors">
            ← Return to Full Report
          </Link>
          <span className="px-3 py-1 rounded-full bg-gold/10 text-gold-strong font-mono">
            STAGE 8: DEBTERA CONSULTATION
          </span>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
            <span>📅 Live Booking Calendar</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-gold-strong">
            Book Your Consultation with Selamawit Tadesse
          </h1>
        </div>

        {selectedService && (
          <div className="rounded-3xl border border-gold/30 bg-gold/5 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Selected service</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-gold-strong">{selectedService.title}</h2>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-strong">
                {selectedService.label}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-soft">“{selectedService.prayer}”</p>
            {selectedService.telsemName && <p className="mt-2 text-xs text-brand-strong">Telsem match: {selectedService.telsemName}</p>}
          </div>
        )}

        {/* Expert Profile Header Card */}
        <div className="p-6 rounded-3xl bg-card border border-gold/30 flex items-center gap-4 shadow-panel">
          <div className="w-16 h-16 rounded-2xl bg-gold/30 border border-gold/40 flex items-center justify-center text-3xl flex-shrink-0">
            👵🏾
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Selamawit Tadesse</h3>
            <p className="text-xs text-gold">Verified Debtera · Awde Negest Practitioner</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-mono">
              <span>★★★★★ 4.9 (247 reviews)</span>
              <span>·</span>
              <span>18 years of practice</span>
            </div>
          </div>
        </div>

        {bookedSuccess ? (
          <div className="p-8 rounded-3xl bg-brand-soft border-2 border-brand/60 text-center space-y-4 shadow-raised">
            <span className="text-5xl block">🎉</span>
            <h2 className="text-2xl font-bold text-foreground">Consultation Successfully Scheduled!</h2>
            <p className="text-sm text-soft">
              Your 30-minute {selectedFormat} session for {selectedService?.title || "your selected spiritual focus"} with Selamawit Tadesse is confirmed for:
            </p>
            <div className="p-4 rounded-2xl bg-sunken/80 text-brand font-mono text-base font-bold">
              {selectedDate} at {selectedSlot}
            </div>
            <p className="text-xs text-muted-foreground">
              Meeting links and telephone dial-in credentials have been sent to your registered phone and inbox.
            </p>
            <Link
              href={`/case/spiritual/${caseId}/report`}
              className="inline-block px-8 py-3.5 rounded-2xl bg-brand hover:bg-brand text-brand-foreground font-bold text-sm transition-all"
            >
              Return to Your Full Reading
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date & Time Selector */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <div className="text-xs uppercase tracking-wider text-gold font-bold">
                Select Date & Time Slot
              </div>

              <div className="space-y-2">
                <label className="text-xs text-soft block">Consultation Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-sunken/80 border border-border text-soft text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-soft block">Available Slots for Selected Day</label>
                {loadingSlots ? (
                  <div className="text-xs text-muted-foreground animate-pulse">Loading debtera availability...</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {slots.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!s.available}
                        onClick={() => setSelectedSlot(s.time)}
                        className={`p-3 rounded-xl border text-xs font-mono font-medium transition-all ${
                          !s.available
                            ? "bg-card/40 border-border text-subtle cursor-not-allowed line-through"
                            : selectedSlot === s.time
                            ? "bg-gold-fill border-gold text-gold-foreground font-bold shadow-md"
                            : "bg-sunken/80 border-border text-soft hover:border-border"
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Format */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
              <div className="text-xs uppercase tracking-wider text-gold font-bold">
                Consultation Format
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "video", label: "Video Call", desc: "Private encrypted room", icon: "📹" },
                  { id: "voice", label: "Voice Call", desc: "Standard phone / WhatsApp", icon: "📞" },
                  { id: "chat", label: "Live Private Chat", desc: "Synchronous text dialogue", icon: "💬" },
                  { id: "in_person", label: "In-Person", desc: "Addis Ababa Debtera Sanctuary", icon: "🏛️" },
                ].map((fmt) => (
                  <label
                    key={fmt.id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedFormat === fmt.id
                        ? "bg-gold-soft border-gold text-foreground"
                        : "bg-sunken/80 border-border text-muted-foreground hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={fmt.id}
                      checked={selectedFormat === fmt.id}
                      onChange={() => setSelectedFormat(fmt.id as any)}
                      className="sr-only"
                    />
                    <div className="text-xl mb-1">{fmt.icon}</div>
                    <div className="text-xs font-bold text-foreground">{fmt.label}</div>
                    <div className="text-[10px] text-muted-foreground">{fmt.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Fee Summary */}
            <div className="p-6 rounded-3xl bg-card border border-gold/30 flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground uppercase block">Consultation Fee</span>
                <span className="text-sm font-semibold text-foreground">30-Minute Debtera Session</span>
              </div>
              <span className="text-2xl font-bold font-mono text-gold">1000 ETB</span>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleBook}
              disabled={isBooking}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-fill to-gold-fill hover:from-gold-fill hover:to-gold-fill text-gold-foreground font-extrabold text-base shadow-panel transition-all flex items-center justify-center gap-2"
            >
              <span>{isBooking ? "Confirming Slot..." : "Book & Confirm Consultation"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
