"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    fetch(`/api/case/spiritual/${caseId}/status`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) return;
        setSelectedService(payload.data?.serviceChoice ?? null);
      })
      .catch(() => undefined);
  }, [caseId]);

  useEffect(() => {
    setLoadingSlots(true);
    fetch(`/api/experts/expert-selamawit-tadesse/availability?date=${selectedDate}`)
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
      const res = await fetch(`/api/case/spiritual/${caseId}/consult`, {
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
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-4">
          <Link href={`/case/spiritual/${caseId}/report`} className="hover:text-amber-400 transition-colors">
            ← Return to Full Report
          </Link>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-mono">
            STAGE 8: DEBTERA CONSULTATION
          </span>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono uppercase tracking-widest">
            <span>📅 Live Booking Calendar</span>
          </div>
          <h1 className="text-3xl font-black font-serif text-amber-100">
            Book Your Consultation with Selamawit Tadesse
          </h1>
        </div>

        {selectedService && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Selected service</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-amber-50">{selectedService.title}</h2>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                {selectedService.label}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-200">“{selectedService.prayer}”</p>
            {selectedService.telsemName && <p className="mt-2 text-xs text-emerald-200">Telsem match: {selectedService.telsemName}</p>}
          </div>
        )}

        {/* Expert Profile Header Card */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-amber-500/30 flex items-center gap-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-3xl flex-shrink-0">
            👵🏾
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Selamawit Tadesse</h3>
            <p className="text-xs text-amber-300">Verified Debtera · Awde Negest Practitioner</p>
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-1 font-mono">
              <span>★★★★★ 4.9 (247 reviews)</span>
              <span>·</span>
              <span>18 years of practice</span>
            </div>
          </div>
        </div>

        {bookedSuccess ? (
          <div className="p-8 rounded-3xl bg-emerald-950/60 border-2 border-emerald-500/60 text-center space-y-4 shadow-2xl">
            <span className="text-5xl block">🎉</span>
            <h2 className="text-2xl font-bold text-white">Consultation Successfully Scheduled!</h2>
            <p className="text-sm text-stone-300">
              Your 30-minute {selectedFormat} session for {selectedService?.title || "your selected spiritual focus"} with Selamawit Tadesse is confirmed for:
            </p>
            <div className="p-4 rounded-2xl bg-black/50 text-emerald-300 font-mono text-base font-bold">
              {selectedDate} at {selectedSlot}
            </div>
            <p className="text-xs text-stone-400">
              Meeting links and telephone dial-in credentials have been sent to your registered phone and inbox.
            </p>
            <Link
              href={`/case/spiritual/${caseId}/report`}
              className="inline-block px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all"
            >
              Return to Your Full Reading
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date & Time Selector */}
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
              <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
                Select Date & Time Slot
              </div>

              <div className="space-y-2">
                <label className="text-xs text-stone-300 block">Consultation Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-black/60 border border-stone-700 text-stone-200 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-stone-300 block">Available Slots for Selected Day</label>
                {loadingSlots ? (
                  <div className="text-xs text-stone-400 animate-pulse">Loading debtera availability...</div>
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
                            ? "bg-stone-900/40 border-stone-800 text-stone-600 cursor-not-allowed line-through"
                            : selectedSlot === s.time
                            ? "bg-amber-500 border-amber-400 text-black font-bold shadow-md"
                            : "bg-black/40 border-stone-800 text-stone-200 hover:border-stone-700"
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
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
              <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
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
                        ? "bg-amber-950/40 border-amber-500 text-white"
                        : "bg-black/40 border-stone-800 text-stone-400 hover:border-stone-700"
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
                    <div className="text-xs font-bold text-white">{fmt.label}</div>
                    <div className="text-[10px] text-stone-400">{fmt.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Fee Summary */}
            <div className="p-6 rounded-3xl bg-stone-900 border border-amber-500/30 flex justify-between items-center">
              <div>
                <span className="text-xs text-stone-400 uppercase font-mono block">Consultation Fee</span>
                <span className="text-sm font-semibold text-white">30-Minute Debtera Session</span>
              </div>
              <span className="text-2xl font-black font-mono text-amber-400">1000 ETB</span>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleBook}
              disabled={isBooking}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{isBooking ? "Confirming Slot..." : "Book & Confirm Consultation"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
