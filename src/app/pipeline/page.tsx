"use client";

import React, { useState, useEffect } from "react";
import { StatusTimeline } from "@/components/pipeline/StatusTimeline";
import { getPipelineI18n, PipelineI18nCatalog } from "@/lib/i18n/pipeline";
import { CaseStatus } from "@/lib/pipeline/types";
import {
  ShieldAlert,
  Send,
  MapPin,
  Leaf,
  HeartHandshake,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileText,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
} from "lucide-react";

export default function UserPipelinePage() {
  const [locale, setLocale] = useState<"am" | "en">("am");
  const i18n = getPipelineI18n(locale);

  // Profile Form state
  const [profile, setProfile] = useState<any>(null);
  const [preliminaryAnalysis, setPreliminaryAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Intake Form fields
  const [ageBand, setAgeBand] = useState("25-40");
  const [sex, setSex] = useState("Female");
  const [pregnancyStatus, setPregnancyStatus] = useState("Non-pregnant");
  const [region, setRegion] = useState("Amhara");
  const [zone, setZone] = useState("North Gondar");
  const [woreda, setWoreda] = useState("Debark");
  const [currentMeds, setCurrentMeds] = useState("Metformin 500mg BID");
  const [traditionalRemedies, setTraditionalRemedies] = useState("Kosso (Hagenia abyssinica) infusion");
  const [spiritualOptIn, setSpiritualOptIn] = useState(true);
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);

  // Case Submission state
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [narrative, setNarrative] = useState(
    "I have been experiencing persistent abdominal cramping, mild dizziness, and fatigue for the past 4 days after drinking traditional Kosso tea alongside my prescription medication."
  );
  const [symptoms, setSymptoms] = useState("Abdominal cramping, Dizziness, Fatigue");
  const [duration, setDuration] = useState("4 days");
  const [selfTreatments, setSelfTreatments] = useState("Kosso tea (1 cup), Metformin");
  const [caseConsent, setCaseConsent] = useState(true);

  // User Report state
  const [userReport, setUserReport] = useState<any>(null);

  // Submit profile to get location intelligence & preliminary analysis
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        ageBand,
        sex,
        pregnancyStatus: pregnancyStatus === "Pregnant" ? "Pregnant" : undefined,
        chronicConditions: ["Type 2 Diabetes"],
        currentMeds: currentMeds
          ? currentMeds.split(",").map((m) => ({ name: m.trim() }))
          : [],
        allergies: [],
        traditionalUse: traditionalRemedies
          ? traditionalRemedies.split(",").map((h) => ({ name: h.trim() }))
          : [],
        diet: {
          primaryStaple: "Teff Injera",
          fastingSchedule: "Orthodox Tsom",
          meatDairyFrequency: "Intermittent",
        },
        substanceUse: {
          coffeeDailyCups: 3,
        },
        location: {
          region,
          zone,
          woreda,
          source: "manual" as const,
        },
        spiritualContext: spiritualOptIn ? "Orthodox Tewahedo fasting observance" : undefined,
        consent: {
          spiritualAnalysisOptIn: spiritualOptIn,
          dataUseAcknowledged: consentAcknowledged,
          requiresProfessionalApprovalAcknowledged: true,
        },
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "demo-user-1",
          "x-actor-role": "USER",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit profile");
      }

      setProfile(json.data.profile);
      setPreliminaryAnalysis(json.data.preliminaryAnalysis);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit clinical case for dual-track evaluation
  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        narrative,
        symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        duration,
        selfTreatments: selfTreatments.split(",").map((t) => t.trim()).filter(Boolean),
        profileId: profile.id,
        consentToProfessionalApproval: caseConsent,
      };

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "demo-user-1",
          "x-actor-role": "USER",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit case");
      }

      setCurrentCase(json.data);
      // Attempt to load report if already published
      fetchUserReport(json.data.caseId);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReport = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/report/user`, {
        headers: {
          "x-actor-id": "demo-user-1",
          "x-actor-role": "USER",
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setUserReport(json.data);
      } else {
        setUserReport(null);
      }
    } catch {
      setUserReport(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header with Bilingual Toggle */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "am" ? "የሁለትዮሽ ባህላዊ የጤና ምርመራ" : "Two-Track Clinical Health Pipeline"}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {i18n.profile.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {i18n.profile.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocale(locale === "am" ? "en" : "am")}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
            >
              {locale === "am" ? "English" : "አማርኛ"}
            </button>
            <a
              href="/professional/cases"
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-medium text-amber-300 transition-colors"
            >
              {locale === "am" ? "የባለሙያ ገጽ (Pro View)" : "Professional Desk"}
            </a>
            <a
              href="/admin/cases"
              className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-medium text-purple-300 transition-colors"
            >
              {locale === "am" ? "አስተዳዳሪ (Admin View)" : "Admin Desk"}
            </a>
          </div>
        </header>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">{locale === "am" ? "ስህተት ተከስቷል" : "Notice"}</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Case Status Timeline if Case Submitted */}
        {currentCase && (
          <StatusTimeline
            currentStatus={currentCase.status}
            locale={locale}
            hasOverride={currentCase.hasSafetyGateOverride}
          />
        )}

        {/* STAGE 1: Profile & Location Intake */}
        {!profile && (
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <MapPin className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {locale === "am" ? "ደረጃ 1፡ የመገለጫ እና የመልክአ-ምድር መረጃ" : "Stage 1: Profile & Geographic Location"}
                </h2>
                <p className="text-xs text-slate-400">
                  {locale === "am"
                    ? "አካባቢው የመጀመሪያ ደረጃ ግብዓት በመሆኑ ትክክለኛውን ክልል እና ወረዳ ይምረጡ"
                    : "Location is a first-class input. Health insights are grounded in your agro-ecological context."}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.profile.ageBand}
                  </label>
                  <select
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="18-24">18-24</option>
                    <option value="25-40">25-40</option>
                    <option value="41-60">41-60</option>
                    <option value="60+">60+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.profile.sex}
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {locale === "am" ? "የእርግዝና ሁኔታ" : "Pregnancy Status"}
                  </label>
                  <select
                    value={pregnancyStatus}
                    onChange={(e) => setPregnancyStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Non-pregnant">Non-pregnant</option>
                    <option value="Pregnant">Pregnant</option>
                    <option value="Postpartum">Postpartum</option>
                  </select>
                </div>
              </div>

              {/* Geographic Location Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.profile.region} *
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Amhara">Amhara</option>
                    <option value="Oromia">Oromia</option>
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Tigray">Tigray</option>
                    <option value="Sidama">Sidama</option>
                    <option value="Afar">Afar</option>
                    <option value="Somali">Somali</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.profile.zone} *
                  </label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="e.g. North Gondar"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.profile.woreda} *
                  </label>
                  <input
                    type="text"
                    value={woreda}
                    onChange={(e) => setWoreda(e.target.value)}
                    placeholder="e.g. Debark"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Medications & Traditional Use */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.profile.currentMeds}
                  </label>
                  <input
                    type="text"
                    value={currentMeds}
                    onChange={(e) => setCurrentMeds(e.target.value)}
                    placeholder="e.g. Metformin 500mg, Warfarin 5mg"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.profile.traditionalRemedies}
                  </label>
                  <input
                    type="text"
                    value={traditionalRemedies}
                    onChange={(e) => setTraditionalRemedies(e.target.value)}
                    placeholder="e.g. Kosso, Tena Adam, Feto"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Opt-ins and Consent */}
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spiritualOptIn}
                    onChange={(e) => setSpiritualOptIn(e.target.checked)}
                    className="mt-1 rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-300">
                    <strong className="text-white block">{i18n.profile.spiritualConsent}</strong>
                    {locale === "am"
                      ? "መንፈሳዊ ክፍል እንደ አማራጭ ብቻ የሚካተት ሲሆን ያለእርስዎ ፈቃድ አይካተትም።"
                      : "Spiritual analysis is strictly opt-in and will be omitted if you decline."}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAcknowledged}
                    onChange={(e) => setConsentAcknowledged(e.target.checked)}
                    className="mt-1 rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-300">
                    <strong className="text-white block">{i18n.disclaimers.preliminaryOrientationNotDiagnosis}</strong>
                    {i18n.profile.consentNotice}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {locale === "am"
                  ? "መገለጫውን መርምር እና የመጀመሪያ ደረጃ ትንተና አሳይ"
                  : "Resolve Location & Generate Preliminary Analysis"}
              </button>
            </form>
          </div>
        )}

        {/* STAGE 2: Preliminary Analysis Display */}
        {preliminaryAnalysis && !currentCase && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {i18n.preliminary.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {preliminaryAnalysis.locationSummary.narrative}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {locale === "am" ? "የተረጋገጠ አቀማመጥ" : "Resolved Zone"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Cultural Patterns */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-semibold text-emerald-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {i18n.preliminary.culturalPatterns}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {preliminaryAnalysis.cultural.observedPatterns.map((p: string, idx: number) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Nutrition & Seasonal Gaps */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-semibold text-amber-400 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    {i18n.preliminary.nutritionEcological}
                  </h4>
                  <p className="text-slate-300">
                    <strong>Staples:</strong> {preliminaryAnalysis.nutrition.localStaples.join(", ")}
                  </p>
                  <p className="text-slate-300">
                    <strong>Seasonal Gaps:</strong>{" "}
                    {preliminaryAnalysis.nutrition.seasonalGaps.map((g: any) => `${g.month}: ${g.gap}`).join("; ")}
                  </p>
                </div>

                {/* Spiritual Framing (if consented) */}
                {preliminaryAnalysis.spiritual?.framing && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4" />
                      {i18n.preliminary.spiritualFraming}
                    </h4>
                    <p className="text-slate-300">{preliminaryAnalysis.spiritual.framing}</p>
                  </div>
                )}

                {/* Body Science */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-semibold text-cyan-400 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {i18n.preliminary.bodyScience}
                  </h4>
                  <p className="text-slate-300">{preliminaryAnalysis.bodyScience.summary}</p>
                </div>
              </div>

              {/* Mandatory Verbatim Disclaimer (§1) */}
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                <strong>{i18n.disclaimers.noRuleMatchedNotSafe}</strong>
              </div>
            </div>

            {/* STAGE 3: Case Intake Form */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <FileText className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {i18n.caseIntake.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {i18n.caseIntake.subtitle}
                  </p>
                </div>
              </div>

              <form onSubmit={handleCaseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {i18n.caseIntake.narrativeLabel} *
                  </label>
                  <textarea
                    rows={4}
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder={i18n.caseIntake.narrativePlaceholder}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {i18n.caseIntake.symptomsLabel} *
                    </label>
                    <input
                      type="text"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. Abdominal cramping, Dizziness"
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {i18n.caseIntake.durationLabel} *
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 4 days"
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {i18n.caseIntake.priorTreatmentsLabel} *
                    </label>
                    <input
                      type="text"
                      value={selfTreatments}
                      onChange={(e) => setSelfTreatments(e.target.value)}
                      placeholder="e.g. Kosso tea, Metformin"
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={caseConsent}
                      onChange={(e) => setCaseConsent(e.target.checked)}
                      className="mt-1 rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    <span className="text-xs text-slate-300">
                      {i18n.disclaimers.professionalApprovalRequired}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !caseConsent}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {i18n.caseIntake.submitCaseBtn}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STAGE 4: Published User Report Display (Only when published by admin!) */}
        {currentCase && userReport && (
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase mb-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {locale === "am" ? "የጸደቀ ይፋዊ ሪፖርት" : "Official Published User Report"}
                </div>
                <h2 className="text-2xl font-black text-white">
                  {userReport.headline}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {i18n.reports.userReportSubtitle}
                </p>
              </div>
            </div>

            {/* Urgent directive if present */}
            {userReport.urgentDirective && (
              <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-sm font-semibold flex items-center gap-3 animate-pulse">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                <span>{userReport.urgentDirective}</span>
              </div>
            )}

            {/* Cultural & Spiritual Situation */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                {locale === "am" ? "የእርስዎ ሁለንተናዊ ሁኔታ" : "Your Holistic Health Context"}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {userReport.yourSituation.culturalFraming}
              </p>
              {userReport.yourSituation.spiritualFraming && (
                <p className="text-sm text-purple-200/90 leading-relaxed border-t border-white/10 pt-2">
                  {userReport.yourSituation.spiritualFraming}
                </p>
              )}
            </div>

            {/* What May Be Happening */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                {i18n.reports.whatMayBeHappening}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {userReport.whatMayBeHappening.plainLanguage}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {userReport.whatMayBeHappening.bodySystems.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-white/10 text-xs">
                    <strong className="text-cyan-300 block mb-1">{s.name}</strong>
                    <span className="text-slate-300">{s.explanation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditional Remedies Safety */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                {i18n.reports.traditionalRemedies}
              </h3>
              <div className="space-y-2">
                {userReport.traditionalRemedies.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900 border border-white/10 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white text-sm">
                        {r.name} ({r.amharic})
                      </span>
                      <p className="text-slate-300 mt-1">{r.reason}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold uppercase shrink-0 ${
                        r.status === "avoid"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : r.status === "caution"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Nutrition */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider">
                {i18n.reports.localFoods}
              </h3>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {userReport.foodAndNutrition.localFoodsToEmphasize.map((f: string, idx: number) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-2">
                {userReport.foodAndNutrition.seasonalNotes}
              </p>
            </div>

            {/* Next Steps & When to Seek Help */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h4 className="font-bold text-emerald-300">{i18n.reports.nextSteps}</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {userReport.nextSteps.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <h4 className="font-bold text-rose-300">{i18n.reports.whenToSeekHelpNow}</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {userReport.whenToSeekHelpNow.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimers verbatim (§1) */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-[11px] text-slate-400 space-y-1">
              {userReport.disclaimers.map((d: string, idx: number) => (
                <p key={idx}>• {d}</p>
              ))}
            </div>
          </div>
        )}

        {/* Pending Review Notice when case is not published yet */}
        {currentCase && !userReport && (
          <div className="p-8 rounded-2xl glass-panel border border-amber-500/30 text-center space-y-3">
            <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-white">
              {locale === "am"
                ? "ጉዳዩ በክሊኒካል ባለሙያዎች ግምገማ ላይ ነው"
                : "Case is Under Professional Review"}
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              {locale === "am"
                ? "የሁለትዮሽ ሪፖርት ማመንጫው ጉዳይዎን ገምግሟል። ይፋዊ ሪፖርትዎ ለደህንነትዎ ሲባል በህክምና ባለሙያ እና በአስተዳዳሪ ተገምግሞ ሲጸድቅ እዚህ ይገለጻል።"
                : "Your case is undergoing safety gate analysis and clinical review. Once approved and published by the medical director and administrative board, your personalized User Report will appear here."}
            </p>
            <button
              onClick={() => fetchUserReport(currentCase.caseId)}
              className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {locale === "am" ? "የሪፖርት ሁኔታን አድስ" : "Check for Published Report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
