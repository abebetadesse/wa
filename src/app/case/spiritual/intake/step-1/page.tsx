"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveGematria } from "@/hooks/useLiveGematria";
import { useGeezVoiceInput } from "@/hooks/useGeezVoiceInput";
import { AnimatedGematriaPreview } from "@/components/cultural/AnimatedGematriaPreview";
import { AmharicKeyboardModal } from "@/components/cultural/AmharicKeyboardModal";

export default function SpiritualStep1Page() {
  const router = useRouter();
  const [nameGeez, setNameGeez] = useState("ሰላማዊት");
  const [motherNameGeez, setMotherNameGeez] = useState("ፀሐይ");
  const [activeInput, setActiveInput] = useState<"name" | "mother">("name");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gematria = useLiveGematria(nameGeez, motherNameGeez);

  const { isListening, startListening, stopListening, transcript } = useGeezVoiceInput((text) => {
    if (activeInput === "name") {
      setNameGeez(text);
    } else {
      setMotherNameGeez(text);
    }
  });

  const handleKeyboardInsert = (val: string) => {
    if (val === "__backspace__") {
      if (activeInput === "name") {
        setNameGeez((prev) => prev.slice(0, -1));
      } else {
        setMotherNameGeez((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (activeInput === "name") {
      setNameGeez((prev) => prev + val);
    } else {
      setMotherNameGeez((prev) => prev + val);
    }
  };

  const handleContinue = async () => {
    if (!nameGeez.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/case/spiritual/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameGeez, motherNameGeez }),
      });

      const payload = await res.json();
      if (payload.success && payload.data) {
        const caseId = payload.data.id;
        sessionStorage.setItem("spiritual_case_id", caseId);
        sessionStorage.setItem("spiritual_name_geez", nameGeez);
        sessionStorage.setItem("spiritual_mother_geez", motherNameGeez);
        router.push(`/case/spiritual/intake/step-2?caseId=${caseId}`);
      } else {
        throw new Error(payload.error || "Failed to start case");
      }
    } catch (err) {
      alert("Error starting case: " + (err instanceof Error ? err.message : "Unknown error"));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#110f0c] text-stone-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute right-[-8%] top-[12%] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between border-b border-amber-500/20 pb-6">
            <Link href="/case" className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_#fbbf24]" />
              CASE / SPIRITUAL
            </Link>
            <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-stone-400">
              <span>Step 01</span>
              <span className="text-amber-400">✧</span>
              <span>Gematria & Name</span>
            </div>
          </nav>

          <section className="grid lg:grid-cols-[minmax(640px,1.8fr)_minmax(380px,1fr)] gap-8 mt-8">
            <section className="rounded-[2rem] border border-amber-500/30 bg-stone-950/60 p-8 shadow-2xl shadow-amber-950/20 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4 border-b border-stone-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-amber-300">
                    <span>🔮</span>
                    <span>Step 1 of 4 — Name Entry & Live Gematria</span>
                  </div>
                  <h1 className="mt-4 font-serif text-4xl md:text-5xl font-black text-amber-50">
                    Spiritual & Life Direction Reading
                  </h1>
                </div>
                <span className="hidden md:inline-flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/60 bg-amber-500/5 text-amber-200 text-2xl">
                  ✦
                </span>
              </div>

              <p className="mt-4 text-sm text-stone-300 leading-7">
                In Ethiopian parchment tradition, your name carries an intrinsic numerical vibration that connects
                your personal lineage to the cosmos. Enter your name in Ge&apos;ez script, along with your mother&apos;s
                name (optional but traditional), to begin your personalized Awde Negest alignment.
              </p>

              <div className="mt-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="name-geez" className="text-sm font-bold text-amber-200">
                      Your Name (Ge&apos;ez / Amharic) *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInput("name");
                          setIsKeyboardOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition-colors"
                      >
                        ⌨️ Amharic Keyboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInput("name");
                          if (isListening) stopListening();
                          else startListening();
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
                          isListening && activeInput === "name"
                            ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                            : "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700"
                        }`}
                      >
                        <span>🔊</span>
                        <span>{isListening && activeInput === "name" ? "Listening..." : "Speak"}</span>
                      </button>
                    </div>
                  </div>

                  <input
                    id="name-geez"
                    type="text"
                    value={nameGeez}
                    onChange={(e) => setNameGeez(e.target.value)}
                    onFocus={() => setActiveInput("name")}
                    placeholder="e.g. ሰላማዊት"
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/60 border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xl font-bold font-serif text-white placeholder-stone-600 outline-none transition-all"
                  />

                  {gematria.scriptDetected && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <span>✓</span>
                      <span>Valid Ge&apos;ez script detected ({gematria.letters.map((l) => l.letter).join(" ")})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="mother-geez" className="text-sm font-bold text-amber-200">
                      Mother&apos;s Name (Ge&apos;ez) <span className="text-xs text-stone-400 font-normal">(Optional but traditional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveInput("mother");
                        if (isListening) stopListening();
                        else startListening();
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
                        isListening && activeInput === "mother"
                          ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                          : "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700"
                      }`}
                    >
                      <span>🔊</span>
                      <span>{isListening && activeInput === "mother" ? "Listening..." : "Speak"}</span>
                    </button>
                  </div>

                  <input
                    id="mother-geez"
                    type="text"
                    value={motherNameGeez}
                    onChange={(e) => setMotherNameGeez(e.target.value)}
                    onFocus={() => setActiveInput("mother")}
                    placeholder="e.g. ፀሐይ"
                    className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-stone-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-lg font-serif text-stone-100 placeholder-stone-600 outline-none transition-all"
                  />
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider uppercase font-mono">
                    <span>🌟 LIVE GEMATRIA PREVIEW</span>
                  </div>

                  <AnimatedGematriaPreview state={gematria} />

                  <p className="text-[11px] text-stone-400 italic">
                    ⚠️ This preview updates live as you type. Your comprehensive reading will be personalized and reviewed by verified debteras.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 flex items-start gap-3 text-xs text-stone-300">
                  <span className="text-xl">🔒</span>
                  <div>
                    <span className="font-bold text-stone-200 block">Privacy & Lineage Protection</span>
                    Your Ge&apos;ez name is calculated locally and securely encrypted at rest.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!gematria.isValid || isSubmitting}
                  className={`px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all flex items-center gap-2 ${
                    gematria.isValid && !isSubmitting
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20"
                      : "bg-stone-800 text-stone-500 cursor-not-allowed"
                  }`}
                >
                  <span>{isSubmitting ? "Harmonizing..." : "Continue to Step 2 →"}</span>
                </button>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">Reading Protocol</div>
                  <div className="mt-2 text-xs text-stone-500">Intake Circuit // 01</div>
                </div>
                <span className="rounded-full border border-emerald-500/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                  Secure
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Signal Quality</span>
                    <span className="text-emerald-300 text-xs font-bold">Online</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-stone-800">
                    <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-amber-300 to-emerald-400" />
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Name Resonance</div>
                  <div className="mt-2 font-serif text-3xl font-black text-amber-100">{nameGeez || "—"}</div>
                  <div className="mt-2 text-[11px] text-stone-400">Lineage signal: {gematria.scriptDetected ? "Detected" : "Awaiting"}</div>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Mother&apos;s Name</div>
                  <div className="mt-2 font-serif text-2xl font-black text-amber-100">{motherNameGeez || "Unspecified"}</div>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Gematria Arc</div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {(gematria.letters || []).slice(0, 8).map((l, idx) => (
                      <span key={`${l.letter}-${idx}`} className="rounded-full border border-amber-500/40 px-3 py-1 text-[10px] font-bold text-amber-100">
                        {l.letter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>

        <AmharicKeyboardModal
          isOpen={isKeyboardOpen}
          onClose={() => setIsKeyboardOpen(false)}
          onInsert={handleKeyboardInsert}
        />
      </section>
    </main>
  );
}
