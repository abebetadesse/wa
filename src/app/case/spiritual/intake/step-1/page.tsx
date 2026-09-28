"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveGematria } from "@/hooks/useLiveGematria";
import { useGeezVoiceInput } from "@/hooks/useGeezVoiceInput";
import { AnimatedGematriaPreview } from "@/components/cultural/AnimatedGematriaPreview";
import { AmharicKeyboardModal } from "@/components/cultural/AmharicKeyboardModal";
import { SpiritualIntakeProgress } from "@/components/case/SpiritualIntakeProgress";
import VoiceCaptureConsent from "@/components/case/VoiceCaptureConsent";

const FIDEL_NAME_MIN_LENGTH = 2;

export default function SpiritualStep1Page() {
  const router = useRouter();
  const [nameGeez, setNameGeez] = useState("");
  const [motherNameGeez, setMotherNameGeez] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthLocationName, setBirthLocationName] = useState("");
  const [birthLatitude, setBirthLatitude] = useState<number | null>(null);
  const [birthLongitude, setBirthLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [activeInput, setActiveInput] = useState<"name" | "mother">("name");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const gematria = useLiveGematria(nameGeez, motherNameGeez);

  const { isListening, startListening, stopListening, error: voiceError, consentPending, acceptVoiceConsent, declineVoiceConsent } = useGeezVoiceInput((text) => {
    const cleanText = (text || "").trim();
    if (!cleanText) return;

    if (activeInput === "name") {
      setNameGeez(cleanText);
    } else {
      setMotherNameGeez(cleanText);
    }
  });

  useEffect(() => {
    try {
      const storedName = sessionStorage.getItem("spiritual_name_geez") || "";
      const storedMother = sessionStorage.getItem("spiritual_mother_geez") || "";
      setBirthDate(sessionStorage.getItem("spiritual_birth_date") || "");
      setBirthLocationName(sessionStorage.getItem("spiritual_birth_location") || "");
      const storedCoordinates = sessionStorage.getItem("spiritual_birth_coordinates");
      if (storedCoordinates) {
        const coordinates = JSON.parse(storedCoordinates) as { latitude?: number; longitude?: number };
        setBirthLatitude(typeof coordinates.latitude === "number" ? coordinates.latitude : null);
        setBirthLongitude(typeof coordinates.longitude === "number" ? coordinates.longitude : null);
      }
      if (storedName) {
        setNameGeez(storedName);
      }
      if (storedMother) {
        setMotherNameGeez(storedMother);
      }
    } catch {
      // sessionStorage can be unavailable in certain embedded or locked browser modes.
    }
  }, []);

  useEffect(() => {
    if (nameGeez.trim()) {
      try {
        sessionStorage.setItem("spiritual_name_geez", nameGeez);
      } catch {
        // ignore storage quota or privacy exceptions.
      }
    }
  }, [nameGeez]);

  useEffect(() => {
    if (motherNameGeez.trim()) {
      try {
        sessionStorage.setItem("spiritual_mother_geez", motherNameGeez);
      } catch {
        // ignore storage quota or privacy exceptions.
      }
    }
  }, [motherNameGeez]);

  const autofetchLocation = async () => {
    if (!birthLocationName.trim()) {
      setLocationStatus("Enter a birth location name first.");
      return;
    }
    setLocationStatus("Finding a matching Ethiopian location...");
    try {
      const response = await fetch(`/api/locations?id=${encodeURIComponent(birthLocationName.trim())}`, { cache: "no-store" });
      const payload = await response.json() as { selectedLocation?: { name?: string; latitude?: number; longitude?: number } | null };
      const location = payload.selectedLocation;
      if (!location || typeof location.latitude !== "number" || typeof location.longitude !== "number") {
        setLocationStatus("No exact local match found. Coordinates were not guessed.");
        return;
      }
      setBirthLocationName(location.name || birthLocationName.trim());
      setBirthLatitude(location.latitude);
      setBirthLongitude(location.longitude);
      setLocationStatus(`Coordinates found: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
    } catch {
      setLocationStatus("Location lookup failed. You can continue without coordinates.");
    }
  };

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

  const nameLengthClass = nameGeez.trim().length >= FIDEL_NAME_MIN_LENGTH;
  const isNameEntryReady = gematria.isValid && nameLengthClass;

  const handleContinue = async () => {
    if (!nameGeez.trim()) {
      setError("Enter your name in Ge’ez or Amharic before continuing.");
      return;
    }

    if (nameGeez.trim().length < FIDEL_NAME_MIN_LENGTH) {
      setError("Enter at least two letters or characters for a valid name signal.");
      return;
    }

    if (!gematria.isValid) {
      setError("Your name needs a valid Ge’ez letter structure before the intake can continue.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/case/spiritual/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameGeez,
          motherNameGeez,
          birthDate: birthDate || undefined,
          birthLocationName: birthLocationName || undefined,
          birthLatitude: birthLatitude ?? undefined,
          birthLongitude: birthLongitude ?? undefined,
        }),
      });

      const payload = await res.json();
      if (res.status === 401) {
        setNeedsSignIn(true);
        throw new Error("Sign in to your account before starting a private spiritual reading.");
      }
      if (payload.success && payload.data) {
        const caseId = payload.data.id;
        try {
          sessionStorage.setItem("spiritual_case_id", caseId);
          sessionStorage.setItem("spiritual_name_geez", nameGeez);
          sessionStorage.setItem("spiritual_mother_geez", motherNameGeez);
          sessionStorage.setItem("spiritual_birth_date", birthDate);
          sessionStorage.setItem("spiritual_birth_location", birthLocationName);
          if (birthLatitude !== null && birthLongitude !== null) {
            sessionStorage.setItem("spiritual_birth_coordinates", JSON.stringify({ latitude: birthLatitude, longitude: birthLongitude }));
          }
        } catch {
          setLocationStatus("This browser could not save locally; your case is saved to your account.");
        }
        router.push(`/case/spiritual/intake/step-2?caseId=${caseId}`);
      } else {
        throw new Error(payload.error || "Failed to start case");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Case 1.");
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
                    <span>Step 1 of 5 — Name & context</span>
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
                Enter your name in Ge&apos;ez or Amharic for an optional symbolic calculation. A mother&apos;s name and birth
                details are optional context; they do not determine personality, health, or future outcomes.
              </p>
              <div className="mt-6"><SpiritualIntakeProgress current={1} /></div>

              {error && (
                <div role="alert" className="mt-5 rounded-2xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
                  {error}
                  {needsSignIn && <Link href="/auth" className="ml-2 font-bold underline underline-offset-2">Sign in</Link>}
                </div>
              )}

              <div className="mt-7 space-y-6">
                <section className="rounded-2xl border border-sky-500/20 bg-sky-950/10 p-5">
                  <h2 className="text-sm font-bold text-sky-200">Birth context for cultural calculations</h2>
                  <p className="mt-1 text-xs leading-5 text-stone-400">Optional cultural context only. It does not determine medical, legal, or psychological outcomes.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-stone-300">
                      Birth year, month and day
                      <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="input-warm w-full" />
                    </label>
                    <label className="space-y-2 text-sm text-stone-300">
                      Birth location name
                      <div className="flex gap-2">
                        <input value={birthLocationName} onChange={(event) => { setBirthLocationName(event.target.value); setBirthLatitude(null); setBirthLongitude(null); }} placeholder="Addis Ababa" className="input-warm min-w-0 flex-1" />
                        <button type="button" onClick={autofetchLocation} className="rounded-xl border border-sky-500/40 px-3 text-xs font-semibold text-sky-200 hover:bg-sky-500/10">Autofetch</button>
                      </div>
                    </label>
                  </div>
                  {locationStatus && <p role="status" className="mt-3 text-xs text-sky-300">{locationStatus}</p>}
                  {birthLatitude !== null && birthLongitude !== null && <p className="mt-2 font-mono text-[11px] text-emerald-300">Verified local coordinates: {birthLatitude.toFixed(5)}, {birthLongitude.toFixed(5)}</p>}
                </section>
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
                    <span>🌟 LIVE SYMBOLIC NAME CALCULATION</span>
                  </div>

                  <AnimatedGematriaPreview state={gematria} />

                  <p className="text-[11px] text-stone-400 italic">
                    This calculation updates as you type. The resulting reflection uses only submitted information; no practitioner review is implied.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 flex items-start gap-3 text-xs text-stone-300">
                  <span className="text-xl">🔒</span>
                  <div>
                    <span className="font-bold text-stone-200 block">Privacy & Lineage Protection</span>
                    Your name calculation is performed in this reading flow. Avoid sharing details you do not want included in the report.
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
                <span className="rounded-full border border-stone-700 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-stone-300">
                  Private reading
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Name entry</span>
                    <span className={`text-xs font-bold ${isNameEntryReady ? "text-emerald-300" : "text-stone-400"}`}>{isNameEntryReady ? "Valid name input" : "Awaiting name"}</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-stone-400">The number is a traditional symbolic calculation, not a measure of personal signal, readiness, or certainty.</p>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Name Resonance</div>
                  <div className="mt-2 font-serif text-3xl font-black text-amber-100">{nameGeez || "—"}</div>
                  <div className="mt-2 text-[11px] text-stone-400">
                    Lineage signal: <span className={gematria.scriptDetected ? "text-emerald-300" : "text-stone-500"}>{gematria.scriptDetected ? "Detected" : "Awaiting"}</span>
                  </div>
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
                  <div className="mt-3 text-[11px] text-stone-400">
                    <span className="font-bold text-amber-300">{gematria.totalSum}</span> total sum / <span className="font-bold text-emerald-300">{gematria.finalNumber}</span> final vibration
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">Name-based calculation</div>
                  <div className="mt-3 text-sm text-stone-300">Name: <span className="font-serif text-amber-100">{nameGeez || "Not entered"}</span></div>
                  <div className="mt-2 text-sm text-stone-300">Mother&apos;s name: <span className="font-serif text-amber-100">{motherNameGeez || "Not supplied"}</span></div>
                  <div className="mt-2 text-sm text-stone-300">Calculation: <span className="font-mono text-amber-100">{gematria.isValid ? `${gematria.totalSum} total · ${gematria.finalNumber} final value` : "Awaiting valid name"}</span></div>
                </div>

                {consentPending && <VoiceCaptureConsent onAccept={acceptVoiceConsent} onDecline={declineVoiceConsent} />}
                {(voiceError || isListening) && (
                  <div className="rounded-2xl border border-amber-500/30 bg-black/30 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.21em] text-amber-200">
                      {isListening ? "Voice Listening" : "Voice Signal"}
                    </div>
                    <div className="mt-1 text-xs text-stone-300">
                      {voiceError || (isListening ? "Listening for Ge’ez / Amharic input..." : "Voice channel available")}
                    </div>
                  </div>
                )}
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
