"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  IntegratedPersonalProfile,
  HumoralElement,
  NameSuggestionResult,
} from "@/lib/profiling/types";
import { ETHIOPIAN_CITIES } from "@/lib/profiling/astrology/chartCalculator";
import { buildPersonalProfile } from "@/lib/profiling/synthesis/profileBuilder";

// Visual Components & Calculation Engines
import NatalChartWheel from "@/components/profiling/NatalChartWheel";
import VedicChartViewer from "@/components/profiling/VedicChartViewer";
import NumerologyView from "@/components/profiling/NumerologyView";
import AwudeNegestViewer from "@/components/profiling/AwudeNegestViewer";
import AIChatView from "@/components/profiling/AIChatView";
import CompatibilityView from "@/components/profiling/CompatibilityView";

import {
  calculateVedicChart,
  calculateVimshottariDasha,
  calculatePanchang,
  tropicalToSidereal,
} from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { buildMultiSystemNumerologyProfile } from "@/lib/profiling/numerology/multiSystemNumerology";
import { calculateDanMillmanLifePath } from "@/lib/profiling/numerology/danMillmanNumerology";
import { calculateAwudeNegestReading } from "@/lib/cultural/awudeNegestEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";
import { notifyAuthStateChanged } from "@/lib/auth/clientEvents";

type ActiveTab =
  | "synthesis"
  | "astrology"
  | "numerology"
  | "awudenegest"
  | "aichat"
  | "compatibility"
  | "naming"
  | "suggester";

type AccountProfile = {
  name: string;
  fatherName?: string;
  motherName?: string;
  birthLocation?: string;
  birthTime?: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  region: string;
  city: string;
  gender: string;
  religion: string;
  dateOfBirth: string;
  role: string;
  isVerified: boolean;
  consent: {
    location: boolean;
    spiritual: boolean;
    traditionalMedicine: boolean;
    bioNarrative: boolean;
    voiceIntake: boolean;
    manuscriptKnowledge: boolean;
    identityContext: boolean;
  };

};

type GenerateProfile = (name?: string, date?: string, time?: string, location?: string, consentConfirmed?: boolean) => void;

const DEFAULT_CONSENT: AccountProfile["consent"] = {
  location: false,
  spiritual: false,
  traditionalMedicine: false,
  bioNarrative: false,
  voiceIntake: false,
  manuscriptKnowledge: false,
  identityContext: false,
};

const CONSENT_OPTIONS: Array<{ key: keyof AccountProfile["consent"]; label: string; detail: string }> = [
  { key: "location", label: "Location context", detail: "Resolve and use regional context in reports." },
  { key: "spiritual", label: "Cultural and spiritual reflection", detail: "Use cultural, lineage, numerology, and astrology content." },
  { key: "traditionalMedicine", label: "Traditional medicine context", detail: "Include population-level regional medicine context; this is not a treatment recommendation." },
  { key: "bioNarrative", label: "Bio-narrative generation", detail: "Allow generation of a personal profile report." },
  { key: "voiceIntake", label: "Voice intake", detail: "Allow browser speech recognition for case intake; transcription may use a third-party service." },
  { key: "manuscriptKnowledge", label: "Manuscript knowledge matching", detail: "Allow historical manuscript references in relevant reports." },
  { key: "identityContext", label: "Optional identity context in cases", detail: "Allow your chosen religion and gender identity to appear in a case's personal context panel only when you also opt in for that case. Never send these details with analysis requests." },
];

const PRESETS = [
  {
    name: "Tigist Mulugeta",
    birthDate: "1985-06-15",
    birthTime: "14:30",
    city: "Addis Ababa",
    desc: "Amharic Heritage • Life Path 35/8 • Gemini/Cancer Cusp",
  },
  {
    name: "Dawit Haile",
    birthDate: "1992-10-24",
    birthTime: "08:15",
    city: "Gondar",
    desc: "Highland Tradition • Life Path 28/10 • Scorpio/Akrab",
  },
  {
    name: "Chaltu Tolessa",
    birthDate: "1996-03-21",
    birthTime: "10:00",
    city: "Jimma",
    desc: "Afaan Oromo • Life Path 31/4 • Aries/Hamel Pioneer",
  },
  {
    name: "Abebe Kebede",
    birthDate: "1988-01-08",
    birthTime: "16:45",
    city: "Lalibela",
    desc: "Earthy Foundation • Life Path 35/8 • Capricorn/Jadi",
  },
  {
    name: "Senait Berhane",
    birthDate: "1994-07-18",
    birthTime: "06:30",
    city: "Mekelle",
    desc: "Tigrinya Tradition • Life Path 39/12 • Cancer/Saratan",
  },
];

const HUMOR_COLORS: Record<HumoralElement, { badge: string; bg: string; border: string; text: string }> = {
  esat: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    bg: "from-amber-950/40 to-orange-950/20",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  afere: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    bg: "from-emerald-950/40 to-stone-950/20",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
  nifas: {
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    bg: "from-sky-950/40 to-indigo-950/20",
    border: "border-sky-500/30",
    text: "text-sky-400",
  },
  may: {
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    bg: "from-teal-950/40 to-cyan-950/20",
    border: "border-teal-500/30",
    text: "text-teal-400",
  },
};

export default function ProfileClient() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [city, setCity] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("synthesis");
  const [profile, setProfile] = useState<IntegratedPersonalProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Extended Calculation States
  const [vedicData, setVedicData] = useState<any>(null);
  const [dashasData, setDashasData] = useState<any[]>([]);
  const [panchangData, setPanchangData] = useState<any>(null);
  const [multiNumeroData, setMultiNumeroData] = useState<any>(null);
  const [awudeReadingData, setAwudeReadingData] = useState<any>(null);

  // Name suggester state
  const [suggestTargetElement, setSuggestTargetElement] = useState<string>("may");
  const [suggestGender, setSuggestGender] = useState<string>("");
  const [suggestLanguage, setSuggestLanguage] = useState<string>("");
  const [suggestReason, setSuggestReason] = useState<string>("general_alignment");
  const [suggestions, setSuggestions] = useState<NameSuggestionResult[]>([]);
  const [appreciation, setAppreciation] = useState<any>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Profile finalize & 50% Gating Paywall state
  const [showFinalizeBanner, setShowFinalizeBanner] = useState(false);
  const generateProfileRef = useRef<GenerateProfile>(() => undefined);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [gatingSettings, setGatingSettings] = useState<{
    enabled: boolean;
    priceEtb: number;
    title: string;
    description: string;
  } | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");

  // Initialize on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("finalize") === "1" || sp.get("welcome") === "1") {
        setShowFinalizeBanner(true);
      }
      if (sp.get("unlocked") === "1" || sp.get("payment")) {
        setIsUnlocked(true);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/profile", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to load your profile.");
        if (active) {
          const resData = payload.data;
          const accProfile: AccountProfile = {
            name: resData.name || "",
            fatherName: resData.fatherName || resData.data?.fatherName || "",
            motherName: resData.motherName || resData.profile?.motherName || "",
            birthLocation: resData.birthLocation || resData.profile?.birthLocation || resData.city || "",
            birthTime: resData.birthTime || resData.profile?.birthTime || "",
            email: resData.email || "",
            phone: resData.phone || "",
            preferredLanguage: resData.preferredLanguage || "en",
            region: resData.region || "",
            city: resData.city || "",
            gender: resData.gender || "",
            religion: resData.religion || "",
            dateOfBirth: resData.dateOfBirth || "",
            consent: { ...DEFAULT_CONSENT, ...(resData.profile?.consent || {}) },
            role: resData.role || "user",
            isVerified: Boolean(resData.isVerified),
          };
          setAccountProfile(accProfile);

          setIsUnlocked(Boolean(resData.isUnlocked));
          if (resData.gatingSettings) {
            setGatingSettings(resData.gatingSettings);
          }

          if (!accProfile.dateOfBirth || !accProfile.birthLocation || !accProfile.motherName || !accProfile.consent.spiritual) {
            setShowFinalizeBanner(true);
          }

          // Auto-populate coordinates with real user profile data (never force hardcoded names)
          const targetName = accProfile.name;
          const targetDOB = accProfile.dateOfBirth;
          const targetCity = accProfile.birthLocation || accProfile.city;
          const targetTime = accProfile.birthTime || "12:00";

          if (accProfile.name) setFullName(accProfile.name);
          if (accProfile.dateOfBirth) setBirthDate(accProfile.dateOfBirth);
          if (accProfile.birthLocation || accProfile.city) setCity(accProfile.birthLocation || accProfile.city);
          if (accProfile.birthTime) setBirthTime(accProfile.birthTime);
          // Generate personal profile calculations with the real registered data
          if (targetDOB && targetCity && accProfile.consent.spiritual) {
            generateProfileRef.current(targetName, targetDOB, targetTime, targetCity, true);
          }
        }
      })
      .catch((error: unknown) => {
        if (active) setAccountMessage(error instanceof Error ? error.message : "Unable to load your profile.");
      })
      .finally(() => {
        if (active) setAccountLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleUnlockProfile = async () => {
    setUnlockLoading(true);
    setUnlockMessage("");
    try {
      const res = await fetch("/api/profile/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "chapa", origin: window.location.origin }),
      });
      const data = await res.json();
      if (data.unlocked) {
        setIsUnlocked(true);
        setUnlockMessage("✨ Complete 5-system profile reading unlocked!");
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.awaitingReview) {
        setUnlockMessage("Payment reference submitted. An administrator will confirm shortly.");
      } else {
        setUnlockMessage(data.error || "Unable to initiate payment.");
      }
    } catch (err) {
      setUnlockMessage(err instanceof Error ? err.message : "Unlock request failed.");
    } finally {
      setUnlockLoading(false);
    }
  };

  async function saveAccountProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountProfile) return;
    setAccountSaving(true);
    setAccountMessage("Saving...");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountProfile.name,
          phone: accountProfile.phone,
          preferredLanguage: accountProfile.preferredLanguage,
          region: accountProfile.region,
          city: accountProfile.city,
          gender: accountProfile.gender,
          religion: accountProfile.religion,
          dateOfBirth: accountProfile.dateOfBirth,
          consent: accountProfile.consent,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to save your profile.");
      setAccountProfile((current) => current ? { ...current, ...payload.data } : current);
      notifyAuthStateChanged();
      setAccountMessage("Profile saved.");
    } catch (error: unknown) {
      setAccountMessage(error instanceof Error ? error.message : "Unable to save your profile.");
    } finally {
      setAccountSaving(false);
    }
  }

  const handleGenerateProfile = (
    customName?: string,
    customDate?: string,
    customTime?: string,
    customCity?: string,
    consentConfirmed = false
  ) => {
    if (!consentConfirmed && !accountProfile?.consent.spiritual) {
      setAccountMessage("Enable cultural and spiritual reflection consent in your profile before generating these readings.");
      return;
    }
    setLoading(true);
    const targetName = customName || fullName;
    const targetDate = customDate || birthDate;
    const targetTime = customTime || birthTime;
    const targetCity = customCity || city;
    if (!targetName.trim() || !targetDate || !targetCity) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const generated = buildPersonalProfile({
        fullName: targetName,
        birthDate: targetDate,
        birthTime: targetTime,
        birthPlace: targetCity,
      });
      setProfile(generated);

      // 1. Vedic calculations (Jyotish, D1, D9)
      const vChart = calculateVedicChart(targetDate, targetTime, targetCity);
      setVedicData(vChart);

      // 2. Vimshottari Dasha
      const moonTrop = generated.astrology.planetaryPositions.find((p) => p.planet === "Moon")?.totalLongitude || 0;
      const moonSid = tropicalToSidereal(moonTrop, vChart.ayanamsha);
      const dPeriods = calculateVimshottariDasha(targetDate, moonSid);
      setDashasData(dPeriods);

      // 3. Panchang
      const pan = calculatePanchang(new Date().toISOString().slice(0, 10), targetCity);
      setPanchangData(pan);

      // 4. Multi-System Numerology (Dan Millman unreduced, Chaldean, Pythagorean, Personal Cycles)
      const mNum = buildMultiSystemNumerologyProfile(targetName, targetDate);
      setMultiNumeroData(mNum);

      // 5. AwudeNegest
      const aw = calculateAwudeNegestReading({ name: targetName, category: "wellbeing" });
      setAwudeReadingData(aw);
    } catch (err) {
      console.error("Failed to generate profile:", err);
    } finally {
      setLoading(false);
    }
  };
  generateProfileRef.current = handleGenerateProfile;

  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    setFullName(preset.name);
    setBirthDate(preset.birthDate);
    setBirthTime(preset.birthTime);
    setCity(preset.city);
    handleGenerateProfile(preset.name, preset.birthDate, preset.birthTime, preset.city);
  };

  const handleFetchSuggestions = async (overrideReason?: string) => {
    setSuggestLoading(true);
    try {
      const res = await fetch("/api/profile/suggest-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetElement: suggestTargetElement || undefined,
          gender: suggestGender || undefined,
          languagePreference: suggestLanguage || undefined,
          fullName: fullName || undefined,
          birthDate: birthDate || undefined,
          birthTime: birthTime || undefined,
          city: city || undefined,
          reason: overrideReason || suggestReason || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions);
        if (data.appreciation) {
          setAppreciation(data.appreciation);
        }
      }
    } catch (err) {
      console.error("Suggestions error:", err);
    } finally {
      setSuggestLoading(false);
    }
  };

  const humorStyle = profile ? HUMOR_COLORS[profile.synthesis.humoralDominance] : HUMOR_COLORS.esat;
  const danMillmanPath = calculateDanMillmanLifePath(birthDate);
  const isAdmin = accountProfile?.role === "admin" || accountProfile?.role === "super_admin";
  const isGated = Boolean(gatingSettings?.enabled && !isUnlocked && !isAdmin);

  return (
    <div className="py-10 space-y-10">
      <div className="app-container space-y-8">
        {/* Finalize Profile Coordinates Request Banner */}
        {showFinalizeBanner && (
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 via-stone-900/95 to-amber-950/50 border-2 border-amber-500/60 shadow-2xl relative animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm uppercase tracking-wide">
                  <span className="text-xl">🌟</span>
                  <span>እንኳን ደህና መጡ! Welcome! Please finalize your profile coordinates to get the best results</span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  Add your birth date and location to generate preliminary astrology and numerology, name and heritage reflection, and the dietary overview. If birth time is unavailable, charts use an approximate noon time. These cultural readings and food patterns are educational only, not medical advice.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/case/workflows" className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/5">
                  Explore care pathways
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("coordinates-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-xl transition flex items-center gap-2"
                >
                  <span>✍️</span>
                  <span>Finalize Coordinates</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFinalizeBanner(false)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 50% Gating Paywall Banner */}
        {isGated && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-900/40 via-stone-900/70 to-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-lg">
            <div className="flex items-center gap-3 text-amber-300">
              <span className="text-2xl">🔐</span>
              <div>
                <strong className="block text-white text-sm">Previewing 50% of Your Personal Profile Results</strong>
                <span className="text-slate-300 text-xs">
                  {gatingSettings?.title || "Complete 5-System Sacred Blueprint"}: Administrator policy requires unlocking to view complete botanical formulas, dietary strategy, D9 Navamsha chart, and full lineage formulas.
                </span>
              </div>
            </div>
            <button
              onClick={handleUnlockProfile}
              disabled={unlockLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs transition flex items-center gap-2 shadow-lg shrink-0"
            >
              {unlockLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin"></span>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Unlock Full Reading ({gatingSettings?.priceEtb || 150} ETB)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>የግል መገለጫ • Domain B Sacred Heritage, Astrology &amp; Numerology</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Astrology, Numerology &amp; Cultural Profiling
            </h1>
            <Link href="/profile/edit" className="mt-4 inline-block btn-pill-primary">
              Edit wellbeing profile
            </Link>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl">
              World-class profiling unifying Western &amp; Vedic Astrology, Dan Millman's 45-path framework, the 16 Circular Tables of AwudeNegest, Däbtära healing scrolls, and multi-dimensional relationship compatibility.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-2 border border-emerald-500/30"
              title="Copy shareable link"
            >
              <span>{copied ? "✓ Copied!" : "🔗 Share Reading"}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition flex items-center gap-2"
            >
              <span>🖨️</span>
              <span>Print Profile</span>
            </button>
            <Link
              href="/cultural"
              className="px-4 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-2"
            >
              <span>📜</span>
              <span>Heritage Portal</span>
            </Link>
          </div>
        </div>

        {/* Profile Hero Identity Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-stone-900/90 via-stone-950/80 to-stone-900/90 p-5 md:p-6 mb-8 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-2xl font-black text-stone-950 shadow-lg shadow-amber-500/20">
              {(accountProfile?.name || fullName || "TC")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl md:text-2xl font-black text-white">
                  {accountProfile?.name || fullName || "Verified Client"}
                </h2>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 font-semibold">
                  ● {accountProfile?.role === "admin" ? "System Admin" : "Verified Client"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 font-mono">
                <span>📍 {accountProfile?.city || city || "Ethiopia"}</span>
                <span>🌐 {accountProfile?.preferredLanguage?.toUpperCase() || "EN"}</span>
                <span>🎂 {accountProfile?.dateOfBirth || birthDate || "1985-06-15"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-center">
              <div className="text-[10px] uppercase font-mono text-stone-400">Sun Sign</div>
              <div className="text-xs font-bold text-amber-300">
                {profile?.astrology?.sunSign || "Gemini"}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-center">
              <div className="text-[10px] uppercase font-mono text-stone-400">Life Path</div>
              <div className="text-xs font-bold text-cyan-300">
                {multiNumeroData?.danMillman?.unreducedComposite || "35/8"}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-center">
              <div className="text-[10px] uppercase font-mono text-stone-400">Vitality</div>
              <div className="text-xs font-bold text-emerald-300">
                {profile?.synthesis?.vitalityScore || 88}/100
              </div>
            </div>
          </div>
        </div>

        <section className="glass-panel p-6 mb-8 border border-emerald-500/20">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Manage your account profile</h2>
              <p className="text-xs text-slate-400 mt-1">
                Update your personal details used across your wellness workflows. Your email and role are managed securely.
              </p>
            </div>
            <Link href="/profile/edit" className="btn-pill-secondary text-xs whitespace-nowrap">
              Edit wellbeing fields
            </Link>
          </div>
          {accountLoading ? (
            <p className="text-sm text-slate-400" role="status">Loading your profile...</p>
          ) : accountProfile ? (
            <form onSubmit={saveAccountProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Full name</span>
                  <input
                    required
                    value={accountProfile.name}
                    onChange={(event) => setAccountProfile({ ...accountProfile, name: event.target.value })}
                    className="input-warm w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Email</span>
                  <input value={accountProfile.email} readOnly className="input-warm w-full opacity-70 cursor-not-allowed" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Phone</span>
                  <input
                    value={accountProfile.phone}
                    onChange={(event) => setAccountProfile({ ...accountProfile, phone: event.target.value })}
                    placeholder="+251 9..."
                    className="input-warm w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Date of birth</span>
                  <input
                    type="date"
                    value={accountProfile.dateOfBirth}
                    onChange={(event) => setAccountProfile({ ...accountProfile, dateOfBirth: event.target.value })}
                    className="input-warm w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Preferred language</span>
                  <select
                    value={accountProfile.preferredLanguage}
                    onChange={(event) => setAccountProfile({ ...accountProfile, preferredLanguage: event.target.value })}
                    className="input-warm w-full"
                  >
                    <option value="en">English</option>
                    <option value="am">Amharic</option>
                    <option value="om">Afaan Oromo</option>
                    <option value="ti">Tigrinya</option>
                    <option value="so">Somali</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Region</span>
                  <input
                    value={accountProfile.region}
                    onChange={(event) => setAccountProfile({ ...accountProfile, region: event.target.value })}
                    className="input-warm w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">City</span>
                  <input
                    value={accountProfile.city}
                    onChange={(event) => setAccountProfile({ ...accountProfile, city: event.target.value })}
                    className="input-warm w-full"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Gender identity (optional)</span>
                  <input
                    type="text"
                    maxLength={100}
                    value={accountProfile.gender}
                    onChange={(event) => setAccountProfile({ ...accountProfile, gender: event.target.value })}
                    placeholder="Share only if you choose"
                    className="input-warm w-full"
                  />
                  <span className="block text-[11px] leading-relaxed text-slate-500">
                    Used for respectful language only when you opt in for a specific case.
                  </span>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-400">Religion or faith tradition (optional)</span>
                  <input
                    type="text"
                    maxLength={100}
                    value={accountProfile.religion}
                    onChange={(event) => setAccountProfile({ ...accountProfile, religion: event.target.value })}
                    placeholder="Share only if you choose"
                    className="input-warm w-full"
                  />
                  <span className="block text-[11px] leading-relaxed text-slate-500">
                    Use your own terms, leave blank, or clear it at any time.
                  </span>
                </label>
              </div>
              <fieldset className="space-y-3 border-t border-white/10 pt-4">
                <legend className="text-sm font-semibold text-white">Optional data and content permissions</legend>
                <p className="max-w-3xl text-xs leading-relaxed text-slate-400">
                  Religion and gender identity are optional sensitive information. They are private to your profile by default.
                  This permission allows their use only in cultural reflection when you also opt in for an individual case.
                  Changing or clearing these details is always allowed.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CONSENT_OPTIONS.map(({ key, label, detail }) => (
                    <label key={key} className="flex items-start gap-3 rounded-lg border border-white/10 p-3">
                      <input
                        type="checkbox"
                        checked={accountProfile.consent[key]}
                        onChange={(event) => setAccountProfile({
                          ...accountProfile,
                          consent: { ...accountProfile.consent, [key]: event.target.checked },
                        })}
                        className="mt-1 accent-emerald-500"
                      />
                      <span>
                        <span className="block text-sm font-medium text-white">{label}</span>
                        <span className="mt-1 block text-xs text-slate-400">{detail}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={accountSaving} className="btn-pill-primary disabled:opacity-60">
                  {accountSaving ? "Saving..." : "Save account profile"}
                </button>
                {accountMessage && <p className="text-sm text-slate-300" role="status">{accountMessage}</p>}
              </div>
            </form>
          ) : (
            <p className="text-sm text-rose-300" role="alert">{accountMessage || "Unable to load your profile."}</p>
          )}
        </section>

        {/* Client Intake & Preset Selector */}
        <div id="coordinates-section" className="glass-panel p-6 mb-8 border border-white/10 space-y-6 scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>👤</span> Client Profile Coordinates
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select an Ethiopian archetype preset or enter custom birth coordinates to recalculate all celestial &amp; numerological systems.
              </p>
            </div>

            {/* Presets as dropdown list */}
            <div className="flex flex-wrap gap-2">
              <label className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                <span className="sr-only">Preset</span>
                <select
                  value={PRESETS.some((p) => p.name === fullName) ? fullName : "my_profile"}
                  onChange={(event) => {
                    if (event.target.value === "my_profile") {
                      if (accountProfile) {
                        const targetName = accountProfile.name || "";
                        const targetDOB = accountProfile.dateOfBirth || "";
                        const targetCity = accountProfile.birthLocation || accountProfile.city || "";
                        const targetTime = accountProfile.birthTime || "12:00";
                        if (targetName) setFullName(targetName);
                        if (targetDOB) setBirthDate(targetDOB);
                        if (targetCity) setCity(targetCity);
                        if (targetTime) setBirthTime(targetTime);
                        handleGenerateProfile(targetName, targetDOB, targetTime, targetCity);
                      }
                    } else {
                      const chosen = PRESETS.find((p) => p.name === event.target.value);
                      if (chosen) handlePresetSelect(chosen);
                    }
                  }}
                  className="w-full min-w-[220px] px-3 py-2 rounded-lg bg-black/40 border border-amber-500/30 text-white text-sm focus:border-amber-400 focus:outline-none"
                >
                  <option value="my_profile" className="bg-slate-900 text-amber-300 font-bold">
                    {accountProfile?.name ? `👤 ${accountProfile.name} (Registered Profile)` : "👤 My Profile Coordinates"}
                  </option>
                  <optgroup label="Sample Archetypes">
                    {PRESETS.map((p) => (
                      <option key={p.name} value={p.name} className="bg-slate-900 text-white">
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Legal / Indigenous Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Birth Date (Gregorian)</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Birth Time (Local 24-hr)</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Birth Location (Open Text Field)</label>
              <input
                type="text"
                list="ethiopian-cities-list"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Addis Ababa, Gondar, Hawassa, Mekelle..."
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
              <datalist id="ethiopian-cities-list">
                {Object.keys(ETHIOPIAN_CITIES).map((c) => (
                  <option key={c} value={c}>
                    {c} ({ETHIOPIAN_CITIES[c].altitudeMeters}m)
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleGenerateProfile()}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-lg hover:from-amber-400 hover:to-orange-400 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                  <span>Synthesizing Multi-System Blueprint...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Recalculate All 5 Systems</span>
                </>
              )}
            </button>
          </div>
        </div>

        {profile && (
          <>
            {/* Top Summary Banner with Multi-System Metrics */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${humorStyle.bg} border ${humorStyle.border} shadow-xl mb-8`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${humorStyle.badge}`}>
                      {profile.synthesis.humoralDominance.toUpperCase()} ELEMENT • {profile.astrology.ethiopianZodiacSign.geezName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium">
                      Sun in {profile.astrology.sunSign}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium">
                      Moon in {profile.astrology.moonSign}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                      Life Path {danMillmanPath.unreducedNumber}
                    </span>
                    {awudeReadingData && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        Awude Circle #{awudeReadingData.circle.number}
                      </span>
                    )}
                    {multiNumeroData?.personalCycles && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                        style={{
                          backgroundColor: `${multiNumeroData.personalCycles.houseColor}25`,
                          color: multiNumeroData.personalCycles.houseColor,
                          borderColor: `${multiNumeroData.personalCycles.houseColor}50`,
                        }}
                      >
                        Personal Day {multiNumeroData.personalCycles.personalDay}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    {profile.userInfo.fullName}
                  </h2>
                  <p className="text-sm text-slate-300 max-w-3xl">
                    {profile.synthesis.constitutionalType} — {profile.naming.overallNameIdentitySynergy.identityNarrative}
                  </p>
                </div>

                {/* Vitality Gauge Card */}
                <div className="flex items-center gap-4 bg-black/40 px-5 py-3 rounded-xl border border-white/10 self-start md:self-auto">
                  <div className="text-center">
                    <div className="text-3xl font-black text-amber-400">{profile.synthesis.vitalityScore}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Vitality Index</div>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10"></div>
                  <div className="text-xs text-slate-300">
                    <div className="font-semibold text-white">Harmonious Flow</div>
                    <div>{profile.astrology.aspects.filter((a) => a.nature === "harmonious").length} Trines/Sextiles</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex rounded-2xl bg-stone-900/60 p-2 border border-white/10 overflow-x-auto no-scrollbar gap-1.5 mb-8 shadow-inner backdrop-blur-md">
              <button
                onClick={() => setActiveTab("synthesis")}
                className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "synthesis"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>🌿</span>
                <span>Synthesis &amp; wellbeing</span>
              </button>

              <button
                onClick={() => setActiveTab("astrology")}
                className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "astrology"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>🌌</span>
                <span>Astrology</span>
              </button>

              <button
                onClick={() => setActiveTab("numerology")}
                className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "numerology"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>🔢</span>
                <span>Numerology</span>
              </button>

              <button
                onClick={() => setActiveTab("awudenegest")}
                className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "awudenegest"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>👑</span>
                <span>AwudeNegest</span>
              </button>

              {(accountProfile?.role === "admin" || accountProfile?.role === "super_admin") && (
                <button
                  onClick={() => setActiveTab("aichat")}
                  className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "aichat"
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <span>🧠</span>
                  <span>AI Chat</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab("compatibility")}
                className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "compatibility"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>❤️</span>
                <span>Compatibility</span>
              </button>

              <button
                onClick={() => setActiveTab("naming")}
                className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "naming"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>📜</span>
                <span>Naming &amp; Identity</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("suggester");
                  if (suggestions.length === 0) handleFetchSuggestions();
                }}
                className={`py-2.5 px-4 text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${activeTab === "suggester"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span>✨</span>
                <span>Name Suggester</span>
              </button>
            </div>

            {/* TAB 1: SYNTHESIS & wellbeing BLUEPRINT */}
            {activeTab === "synthesis" && (
              <div className="space-y-8">
                {/* Strengths & Vulnerabilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Enduring Strengths */}
                  <div className="glass-panel p-6 border border-emerald-500/20 space-y-4">
                    <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                      <span>🛡️</span> Enduring Constitutional Strengths
                    </h3>
                    <ul className="space-y-2.5">
                      {profile.synthesis.enduringStrengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                          <span className="text-emerald-400 mt-1">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Primary Wellbeing Risks */}
                  <div className="glass-panel p-6 border border-rose-500/20 space-y-4">
                    <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                      <span>⚠️</span> Primary Constitutional Vulnerabilities
                    </h3>
                    <ul className="space-y-2.5">
                      {profile.synthesis.primarywellbeingRisks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                          <span className="text-rose-400 mt-1">!</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ===== GATED 50%: DIETARY + BOTANICALS ===== */}
                {isGated ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* Blurred preview */}
                    <div className="pointer-events-none select-none filter blur-[6px] opacity-40 space-y-6">
                      <div className="glass-panel p-6 border border-white/10 space-y-4">
                        <h3 className="text-lg font-bold text-white">🍲 Personalized Ethiopian Dietary Strategy (EFCT 2025)</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {["Therapeutic Principles","Favored Foods","Foods to Moderate"].map(t => (
                            <div key={t} className="space-y-2">
                              <div className="text-xs font-bold text-amber-400">{t}</div>
                              {[1,2,3].map(i => <div key={i} className="h-3 rounded bg-white/10 my-1" />)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass-panel p-6 border border-white/10 space-y-4">
                        <h3 className="text-lg font-bold text-white">🌿 Indigenous Botanical Adaptogens &amp; Humoral Synergies</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-white/5" />)}
                        </div>
                      </div>
                    </div>
                    {/* Frosted glass unlock overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-amber-500/30 p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30">
                        🔐
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-white">{gatingSettings?.title || "Complete 5-System Sacred Blueprint"}</h3>
                        <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                          {gatingSettings?.description || "Unlock your full personalized dietary strategy, botanical adaptogens formula, and cross-strand wellbeing notes — calibrated uniquely to your cosmic profile."}
                        </p>
                        <p className="text-[11px] text-amber-400 font-semibold">Previewing 50% of your results — admin policy requires payment to view full reading.</p>
                      </div>
                      <button
                        onClick={handleUnlockProfile}
                        disabled={unlockLoading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm transition flex items-center gap-2 shadow-xl shadow-amber-500/30"
                      >
                        {unlockLoading ? (
                          <><span className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" /><span>Connecting...</span></>
                        ) : (
                          <><span>🔓</span><span>Unlock Full Reading — {gatingSettings?.priceEtb || 150} ETB</span></>
                        )}
                      </button>
                      {unlockMessage && <p className="text-xs text-emerald-300">{unlockMessage}</p>}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Dietary Principles & Favored Foods */}
                    <div className="glass-panel p-6 border border-white/10 space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span>🍲</span> Personalized Ethiopian Dietary Strategy (EFCT 2025)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Calibrated for {profile.synthesis.humoralDominance.toUpperCase()} elemental balance and Life Path {profile.numerology.lifePath.number} metabolic rhythms.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">Therapeutic Principles</div>
                          <ul className="space-y-2 text-xs text-slate-300">
                            {profile.synthesis.recommendations.dietary.therapeuticPrinciples.map((tp, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>{tp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Favored Ethiopian Foods</div>
                          <ul className="space-y-2 text-xs text-slate-300">
                            {profile.synthesis.recommendations.dietary.favoredEthiopianFoods.map((f, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-400">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">Foods to Moderate</div>
                          <ul className="space-y-2 text-xs text-slate-300">
                            {profile.synthesis.recommendations.dietary.foodsToModerate.map((f, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-rose-400">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Botanical Adaptogens Table */}
                    <div className="glass-panel p-6 border border-white/10 space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🌿</span> Indigenous Botanical Adaptogens &amp; Humoral Synergies
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {profile.synthesis.recommendations.herbalAdaptogens.map((herb, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                            <div className="text-sm font-bold text-emerald-300">{herb.herb}</div>
                            <div className="text-xs text-slate-300"><strong>Traditional Use:</strong> {herb.traditionalUse}</div>
                            <div className="text-xs text-slate-400">{herb.synergyNote}</div>
                            <div className="text-[11px] text-amber-300/90 pt-1 border-t border-white/5">
                              <strong>Precaution:</strong> {herb.safetyPrecaution}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: ASTROLOGY (WESTERN & VEDIC) */}
            {activeTab === "astrology" && (
              <div className="space-y-8">
                {/* Interactive SVG Natal Chart Wheel */}
                <NatalChartWheel
                  planets={profile.astrology.planetaryPositions}
                  aspects={profile.astrology.aspects}
                  ascendant={{ sign: profile.astrology.risingSign, degree: 14.5 }}
                  midheaven={{ sign: profile.astrology.risingSign, degree: 12.0 }}
                />

                {/* Vedic Kundli, Divisional Charts, Dasha & Panchang Section */}
                {vedicData && (
                  <VedicChartViewer
                    ayanamsha={vedicData.ayanamsha}
                    d1Placements={vedicData.d1Placements}
                    d9Placements={vedicData.d9Placements}
                    dashas={dashasData}
                    panchang={panchangData}
                  />
                )}
              </div>
            )}

            {/* TAB 3: MULTI-SYSTEM NUMEROLOGY */}
            {activeTab === "numerology" && multiNumeroData && (
              <div className="space-y-8">
                <NumerologyView profile={multiNumeroData} birthDate={birthDate} />
                {isGated && (
                  <div className="relative rounded-2xl overflow-hidden">
                    <div className="pointer-events-none select-none filter blur-sm opacity-30 p-6 space-y-3">
                      <div className="h-4 rounded bg-white/10 w-2/3" />
                      <div className="h-4 rounded bg-white/10 w-1/2" />
                      <div className="h-4 rounded bg-white/10 w-3/4" />
                      <div className="h-4 rounded bg-white/10 w-1/3" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-amber-500/30 p-6 text-center">
                      <span className="text-4xl">🔢</span>
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-white">Advanced Numerology Cycles & Forecasts</h4>
                        <p className="text-xs text-slate-300 max-w-xs leading-relaxed">Deep personal year forecasts, pinnacle cycles, and karmic debt analysis are in the full reading.</p>
                      </div>
                      <button onClick={handleUnlockProfile} disabled={unlockLoading}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs transition flex items-center gap-2 shadow-lg">
                        {unlockLoading ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" /><span>Connecting...</span></> : <><span>🔓</span><span>Unlock — {gatingSettings?.priceEtb || 150} ETB</span></>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: AWUDENEGEST & CULTURAL HERITAGE */}
            {activeTab === "awudenegest" && (
              <div className="space-y-8">
                {isGated ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    <div className="pointer-events-none select-none filter blur-md opacity-25 p-10 flex flex-col gap-4">
                      <div className="h-6 rounded bg-amber-500/20 w-1/2" />
                      <div className="h-4 rounded bg-white/10 w-3/4" />
                      <div className="h-4 rounded bg-white/10 w-2/3" />
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 rounded-xl bg-white/5" />)}
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-amber-500/30 p-8 text-center">
                      <span className="text-4xl">👑</span>
                      <div className="space-y-1.5">
                        <h4 className="text-lg font-black text-white">AwudeNegest — 16 Circles of Sacred Wisdom</h4>
                        <p className="text-xs text-slate-300 max-w-sm leading-relaxed">Your complete AwudeNegest circle reading, Däbtära scroll interpretations, and Ethiopian lunar calendar alignments require a full unlock.</p>
                      </div>
                      <button onClick={handleUnlockProfile} disabled={unlockLoading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm transition flex items-center gap-2 shadow-xl">
                        {unlockLoading ? <><span className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" /><span>Connecting...</span></> : <><span>🔓</span><span>Unlock Full Reading — {gatingSettings?.priceEtb || 150} ETB</span></>}
                      </button>
                      {unlockMessage && <p className="text-xs text-emerald-300">{unlockMessage}</p>}
                    </div>
                  </div>
                ) : (
                  <AwudeNegestViewer initialName={fullName} />
                )}
              </div>
            )}

            {/* TAB 5: AI CHAT (CONTEXT-AWARE ASTROLOGER & ADVISOR) */}
            {activeTab === "aichat" && (accountProfile?.role === "admin" || accountProfile?.role === "super_admin") && (
              <div className="space-y-8">
                <AIChatView
                  userId={`user_${fullName.replace(/\s+/g, "_").toLowerCase()}`}
                  userContext={{
                    fullName,
                    birthDate,
                    birthTime,
                    city,
                    sunSign: profile.astrology.sunSign,
                    moonSign: profile.astrology.moonSign,
                    risingSign: profile.astrology.risingSign,
                    danMillmanLifePath: danMillmanPath.unreducedNumber,
                    pythagoreanLifePath: profile.numerology.lifePath.number,
                    destinyNumber: profile.numerology.destiny.number,
                    awudeCircleNumber: awudeReadingData?.circle.number || 1,
                    personalDay: multiNumeroData?.personalCycles.personalDay || 5,
                    personalYear: multiNumeroData?.personalCycles.personalYear || 8,
                  }}
                />
              </div>
            )}

            {/* TAB 6: MULTI-DIMENSIONAL COMPATIBILITY ANALYZER */}
            {activeTab === "compatibility" && (
              <div className="space-y-8">
                {isGated ? (
                  <div className="relative rounded-2xl overflow-hidden min-h-[320px]">
                    <div className="pointer-events-none select-none filter blur-md opacity-25 p-10 flex flex-col gap-4">
                      <div className="h-6 rounded bg-rose-500/20 w-1/2" />
                      <div className="h-4 rounded bg-white/10 w-3/4" />
                      <div className="h-4 rounded bg-white/10 w-2/3" />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-white/5" />)}
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-rose-500/30 p-8 text-center">
                      <span className="text-4xl">❤️</span>
                      <div className="space-y-1.5">
                        <h4 className="text-lg font-black text-white">Multi-Dimensional Compatibility Analyzer</h4>
                        <p className="text-xs text-slate-300 max-w-sm leading-relaxed">Full relationship compatibility — astrology, numerology, humoral, and AwudeNegest cross-analysis — is available in the complete reading.</p>
                      </div>
                      <button onClick={handleUnlockProfile} disabled={unlockLoading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-sm transition flex items-center gap-2 shadow-xl">
                        {unlockLoading ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /><span>Connecting...</span></> : <><span>🔓</span><span>Unlock Full Reading — {gatingSettings?.priceEtb || 150} ETB</span></>}
                      </button>
                      {unlockMessage && <p className="text-xs text-emerald-300">{unlockMessage}</p>}
                    </div>
                  </div>
                ) : (
                  <CompatibilityView currentUser={{ name: fullName, birthDate, city }} />
                )}
              </div>
            )}

            {/* TAB 7: NAMING & IDENTITY */}
            {activeTab === "naming" && (
              <div className="space-y-8">
                <div className="glass-panel p-6 border border-white/10 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>🏷️</span> Indigenous Name Identity Analysis
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Evaluates the cultural etymology, language origin, and vibrational resonances of your given and family names.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-amber-300">
                        {profile.naming.givenNameProfile.name}
                        {profile.naming.givenNameProfile.geezFidel && ` (${profile.naming.givenNameProfile.geezFidel})`}
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                        {profile.naming.givenNameProfile.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic">
                      &quot;{profile.naming.givenNameProfile.meaning}&quot;
                    </p>
                    <p className="text-xs text-slate-400">
                      {profile.naming.givenNameProfile.culturalContext}
                    </p>
                  </div>

                  {/* Lineage & Father Name Card if present */}
                  {profile.naming.familyLineageProfile && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                      <div className="text-xs uppercase tracking-wider text-slate-400">Patronymic Ancestral Pillar</div>
                      <div className="flex items-center justify-between">
                        <div className="text-base font-bold text-white">
                          {profile.naming.familyLineageProfile.name}
                          {profile.naming.familyLineageProfile.geezFidel && ` (${profile.naming.familyLineageProfile.geezFidel})`}
                        </div>
                        <span className="text-xs text-slate-400 italic">
                          {profile.naming.familyLineageProfile.meaning}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {profile.naming.familyLineageProfile.culturalContext}
                      </p>
                    </div>
                  )}

                  {/* Registered Profile Lineage & Roots */}
                  {(accountProfile?.fatherName || accountProfile?.motherName || accountProfile?.birthLocation) && (
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-3">
                      <div className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-2">
                        <span>🌳</span>
                        <span>የተመዘገበ የዘር ሐረግ እና የትውልድ መረጃ (Registered Heritage &amp; Roots)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {accountProfile.fatherName && (
                          <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">የአባት ስም (Father&apos;s Name)</span>
                            <span className="text-white font-bold text-sm">{accountProfile.fatherName}</span>
                          </div>
                        )}
                        {accountProfile.motherName && (
                          <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">የእናት ስም (Mother&apos;s Name)</span>
                            <span className="text-white font-bold text-sm">{accountProfile.motherName}</span>
                          </div>
                        )}
                        {accountProfile.birthLocation && (
                          <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">የትውልድ ቦታ (Birth Location)</span>
                            <span className="text-white font-bold text-sm">{accountProfile.birthLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Overall Identity Synergy */}
                  {isGated ? (
                    <div className="relative rounded-2xl overflow-hidden">
                      <div className="pointer-events-none select-none filter blur-sm opacity-30 p-6 space-y-2">
                        <div className="h-4 rounded bg-white/10 w-3/4" />
                        <div className="h-4 rounded bg-white/10 w-1/2" />
                        <div className="h-4 rounded bg-white/10 w-2/3" />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-amber-500/30 p-5 text-center">
                        <span className="text-2xl">📜</span>
                        <p className="text-xs text-slate-300 max-w-xs">Full identity synthesis and wellbeing behavior analysis are in the complete reading.</p>
                        <button onClick={handleUnlockProfile} disabled={unlockLoading}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs transition flex items-center gap-2">
                          {unlockLoading ? <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" /> : <><span>🔓</span><span>Unlock — {gatingSettings?.priceEtb || 150} ETB</span></>}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2 text-xs text-slate-300">
                      <span className="font-bold text-white block">Holistic Identity &amp; wellbeing Behavior Synthesis:</span>
                      <p>{profile.naming.overallNameIdentitySynergy.wellbeingBehaviorInfluence}</p>
                      <p>{profile.naming.overallNameIdentitySynergy.mindBodyResilience}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 8: NAME HARMONY SUGGESTER */}
            {activeTab === "suggester" && (
              <div className="space-y-8">
                <div className="glass-panel p-6 border border-white/10 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>✨</span> Name Harmony &amp; Elemental Alignment Suggester
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Explore culturally authentic Ethiopian &amp; Biblical names dynamically calculated using your astrology, numerology, and intentional purpose.
                    </p>
                  </div>

                  {/* 85% Name Appreciation & Recommendation Banner */}
                  {appreciation && (
                    <div className={`p-5 rounded-2xl border ${
                      appreciation.isAppreciated
                        ? "bg-gradient-to-r from-amber-950/40 via-emerald-950/30 to-slate-900/60 border-amber-500/40"
                        : "bg-slate-900/60 border-white/10"
                    } space-y-3`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{appreciation.isAppreciated ? "👑" : "📜"}</span>
                          <h4 className="text-sm font-bold text-amber-300">
                            {appreciation.headline}
                          </h4>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Sacred Resonance: {appreciation.harmonyScore}%
                        </span>
                      </div>
                      <div className="text-xs text-emerald-300 font-semibold bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                        <span>✨</span>
                        <span>{appreciation.recommendation}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {appreciation.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Filter & Purpose Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Purpose for Suggestion</label>
                      <select
                        value={suggestReason}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSuggestReason(val);
                          handleFetchSuggestions(val);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none"
                      >
                        <option value="general_alignment">General Alignment (አጠቃላይ ማመጣጠን)</option>
                        <option value="new_baby">New Baby Blessing (የህፃን ምርቃትና ስም)</option>
                        <option value="spiritual_rebirth">Spiritual Rebirth (የክርስትና ስም / መንፈሳዊ እድሳት)</option>
                        <option value="business">Business &amp; Prosperity (የንግድና ስራ ስኬት)</option>
                        <option value="personal_empowerment">Personal Empowerment (የውስጥ ብርታትና ድል)</option>
                        <option value="marriage">Marriage &amp; Union (የጋብቻና ፍቅር ስምምነት)</option>
                        <option value="healing_balance">Healing Balance (ፈውስ እና ሰላም)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Target Humoral Element</label>
                      <select
                        value={suggestTargetElement}
                        onChange={(e) => setSuggestTargetElement(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none"
                      >
                        <option value="may">Water (Maye) — Cooling &amp; Calming</option>
                        <option value="afere">Earth (Afere) — Grounding &amp; Steady</option>
                        <option value="esat">Fire (Isete) — Energizing &amp; Vitalizing</option>
                        <option value="nifas">Air (Nawaye) — Dynamic &amp; Creative</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Name style (optional)</label>
                      <select
                        value={suggestGender}
                        onChange={(e) => setSuggestGender(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none"
                      >
                        <option value="">No preference</option>
                        <option value="female">Feminine names</option>
                        <option value="male">Masculine names</option>
                        <option value="unisex">Unisex / All</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Linguistic Tradition</label>
                      <select
                        value={suggestLanguage}
                        onChange={(e) => setSuggestLanguage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none"
                      >
                        <option value="">All Traditions (Ethiopian &amp; Biblical)</option>
                        <option value="Biblical">Biblical / ቅዱሳት መጻሕፍት (Hebrew, Greek, Ge&apos;ez)</option>
                        <option value="Amharic">Amharic (አማርኛ)</option>
                        <option value="Ge'ez">Ge&apos;ez (ግዕዝ)</option>
                        <option value="Afaan Oromo">Afaan Oromo</option>
                        <option value="Tigrinya">Tigrinya (ትግርኛ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleFetchSuggestions()}
                      disabled={suggestLoading}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg"
                    >
                      {suggestLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                          <span>Calculating Harmonies...</span>
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          <span>Generate Dynamic Name Suggestions</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Suggestions Grid — first 4 always visible; rest gated */}
                {(() => {
                  const visibleItems = isGated ? suggestions.slice(0, 4) : suggestions;
                  const hiddenItems = isGated ? suggestions.slice(4) : [];
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visibleItems.map((item, idx) => (
                          <div key={idx} className="glass-panel p-5 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-base font-bold text-white flex items-center gap-2">
                                  <span>{item.suggestedName}</span>
                                  {item.geezFidel && <span className="text-amber-400 font-serif">({item.geezFidel})</span>}
                                </div>
                                {idx === 0 && item.score !== undefined && (
                                  <span className="inline-block mt-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Best match</span>
                                )}
                                <div className="text-xs text-amber-300 italic">&quot;{item.meaning}&quot;</div>
                                {item.sourceTradition && (
                                  <div className="text-[10px] uppercase tracking-wide text-slate-500">{item.sourceTradition} · Score {item.score ?? "—"}/85</div>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${HUMOR_COLORS[item.primaryElement].badge}`}>{item.primaryElement}</span>
                            </div>
                            <div className="text-xs text-slate-300"><strong className="text-white">Cultural Heritage:</strong> {item.language} • Destiny {item.destinyNumber}</div>
                            <div className="text-xs text-slate-400">{item.alignmentReason}</div>
                            <div className="text-xs p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-200">
                              <strong>Wellbeing Benefit:</strong> {item.wellbeingHarmonizationBenefit}
                            </div>
                            {item.recommendation && (
                              <div className="text-xs p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/20 text-sky-100">
                                <strong>Profile Recommendation:</strong> {item.recommendation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Gate: hidden suggestions blur overlay */}
                      {isGated && hiddenItems.length > 0 && (
                        <div className="relative rounded-2xl overflow-hidden">
                          <div className="pointer-events-none select-none filter blur-sm opacity-25 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {hiddenItems.slice(0, 4).map((_, i) => (
                              <div key={i} className="h-32 rounded-xl bg-white/5" />
                            ))}
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-amber-500/30 p-6 text-center">
                            <span className="text-3xl">✨</span>
                            <div className="space-y-1">
                              <h4 className="text-base font-black text-white">{hiddenItems.length} More Name Suggestions Hidden</h4>
                              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">Unlock your complete set of harmonically-calculated name suggestions with full alignment scores, deep lineage notes, and biblical resonance analysis.</p>
                            </div>
                            <button onClick={handleUnlockProfile} disabled={unlockLoading}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs transition flex items-center gap-2 shadow-lg">
                              {unlockLoading ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" /><span>Connecting...</span></> : <><span>🔓</span><span>Unlock All — {gatingSettings?.priceEtb || 150} ETB</span></>}
                            </button>
                            {unlockMessage && <p className="text-xs text-emerald-300">{unlockMessage}</p>}
                          </div>
                        </div>
                      )}

                      {/* Gate: no suggestions loaded yet */}
                      {isGated && suggestions.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border border-amber-500/30 bg-slate-950/50 text-center">
                          <span className="text-3xl">✨</span>
                          <p className="text-xs text-slate-400">Generate suggestions above, then unlock to view the full set.</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {/* Global Compliance & Disclaimer Section */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            <span>⚖️</span>
            <span>Domain B Compliance &amp; Multi-Tradition Disclaimers</span>
          </div>
          <p className="leading-relaxed">
            {PLATFORM_DISCLAIMERS.astrology} {PLATFORM_DISCLAIMERS.numerology} {PLATFORM_DISCLAIMERS.awudeNegest} {PLATFORM_DISCLAIMERS.aiChat} {PLATFORM_DISCLAIMERS.compatibility} {PLATFORM_DISCLAIMERS.wellbeing}
          </p>
        </div>
      </div>
    </div>
  );
}
