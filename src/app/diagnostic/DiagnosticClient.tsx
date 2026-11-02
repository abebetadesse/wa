"use client";

import Link from "next/link";
import { EmergencyHelp } from "@/components/safety/EmergencyHelp";
import { useEffect, useState } from "react";
import { DiagnosticSolution, DiagnosticUrgencyLevel, KnowledgeStrandType } from "@/lib/knowledge/types";
import { useLanguage } from "@/lib/i18n/context";
import { withBasePath, assetUrl } from '@/lib/base-path';

type InputMode = "text" | "voice" | "image" | "symptom";

const symptomOptions = [
  { id: "headache" },
  { id: "fever" },
  { id: "cough" },
  { id: "breathing_difficulty" },
  { id: "chest_pain" },
  { id: "stomach_pain" },
  { id: "vomiting" },
  { id: "diarrhea" },
  { id: "fatigue" },
  { id: "chills" },
  { id: "jaundice" },
  { id: "bleeding" },
  { id: "joint_pain" },
  { id: "rash" },
  { id: "insomnia" },
  { id: "heart_palpitations" },
];

const domainOptions = [
  { id: "wellbeing", icon: "✚" },
  { id: "peace", icon: "☼" },
  { id: "power", icon: "◇" },
  { id: "money", icon: "◈" },
  { id: "career", icon: "◈" },
  { id: "relationships", icon: "❤" },
  { id: "spiritual", icon: "✦" },
  { id: "legal", icon: "☮" },
  { id: "social", icon: "◎" },
];

const sampleBotanicals = [
  { id: "tenaAdam", name: "Tena Adam (Ruta chalepensis)", icon: "🌿" },
  { id: "kosso", name: "Kosso (Hagenia abyssinica)", icon: "🌸" },
  { id: "tikurAzmud", name: "Tikur Azmud (Nigella sativa)", icon: "🌱" },
  { id: "habeshaGomen", name: "Habesha Gomen (Brassica carinata)", icon: "🥬" },
];

const urgencyBadgeStyles: Record<DiagnosticUrgencyLevel, { border: string; bg: string; text: string; badgeBg: string }> = {
  critical: {
    border: "border-danger/80",
    bg: "bg-gradient-to-br from-danger-soft via-background/80 to-danger-soft",
    text: "text-danger-strong",
    badgeBg: "bg-danger text-danger-foreground animate-pulse",
  },
  high: {
    border: "border-warning/70",
    bg: "bg-gradient-to-br from-warning-soft via-background/80 to-gold-soft",
    text: "text-warning-strong",
    badgeBg: "bg-warning text-warning-foreground",
  },
  medium: {
    border: "border-gold/60",
    bg: "bg-gradient-to-br from-gold-soft via-background/80 to-gold-soft",
    text: "text-gold-strong",
    badgeBg: "bg-gold-fill text-gold-foreground font-bold",
  },
  low: {
    border: "border-brand/50",
    bg: "bg-gradient-to-br from-brand-soft via-background/80 to-brand-soft",
    text: "text-brand-strong",
    badgeBg: "bg-brand text-brand-foreground",
  },
};

type SpeechRecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export default function DiagnosticClient() {
  const { t } = useLanguage();
  const td = t.diagnostic;
  const [mode, setMode] = useState<InputMode>("text");
  const [query, setQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("wellbeing");
  const [analyzedDomain, setAnalyzedDomain] = useState<string>("wellbeing");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedBotanical, setSelectedBotanical] = useState<string | null>(null);
  const [userRegion, setUserRegion] = useState("Addis Ababa (2,400m)");
  const [userMedications, setUserMedications] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<"en-US" | "am-ET">("en-US");
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<DiagnosticSolution | null>(null);
  const [error, setError] = useState("");
  const [activeStrandTab, setActiveStrandTab] = useState<KnowledgeStrandType>("biochemical");
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historyItems, setHistoryItems] = useState<Array<{ id: string; query: string; urgencyLevel: string; createdAt: string }>>([]);
  const [assist, setAssist] = useState<{ suggestions: string[]; urgencyHint: string; safetyFlags: string[] }>({ suggestions: [], urgencyHint: "", safetyFlags: [] });

  // Live language detector
  const detectedLangName = (() => {
    if (/[\u1200-\u137F]/.test(query)) {
      return /[ቐቒቓቄቕቖቘቚቛቜቝጘጚጛጜጝጞጟ]/.test(query) ? "Tigrinya (ትግርኛ)" : "Amharic (አማርኛ)";
    }
    if (/\b(dhukkubbi|garaa|mataan|qufaa|hoo'ina)\b/i.test(query)) return "Afaan Oromo";
    if (/\b(xanuun|qandho|madax|qufac|daawo)\b/i.test(query)) return "Somali";
    return "English";
  })();

  function toggleSymptom(id: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleActionCheck(id: string) {
    setCompletedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function startVoiceRecognition() {
    const browserWindow = window as Window & typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError(td.voiceUnsupported);
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = speechLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError("");
      };

      recognition.onend = () => setIsListening(false);

      recognition.onerror = () => {
        setIsListening(false);
        setError(td.voiceCaptureError);
      };

      recognition.onresult = (event: SpeechRecognitionResultEvent) => {
        const transcript = event.results[0]?.[0]?.transcript || "";
        setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setError(td.microphoneInitError);
      setIsListening(false);
    }
  }

  async function handleAnalyze() {
    let finalQuery = query;
    if (mode === "symptom" && selectedSymptoms.length > 0) {
      const symptomLabels = symptomOptions
        .filter((s) => selectedSymptoms.includes(s.id))
        .map((s) => td.symptoms[s.id].label);
      finalQuery = `Patient reports experiencing: ${symptomLabels.join(", ")}. ${query}`.trim();
    } else if (mode === "image" && selectedBotanical) {
      finalQuery = `Botanical photo inspection of ${selectedBotanical}. Scientific inquiry: ${query || "Assess medicinal safety and interactions"}`.trim();
    }

    if (!finalQuery || finalQuery.trim().length < 2) {
      setError(td.emptyQueryError);
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);
    setProcessingStep(1);

    // Animated stepper timer intervals for rich interactive feel
    const timer1 = setTimeout(() => setProcessingStep(2), 700);
    const timer2 = setTimeout(() => setProcessingStep(3), 1400);
    const timer3 = setTimeout(() => setProcessingStep(4), 2100);

    try {
      const medsArray = userMedications
        ? userMedications.split(",").map((m) => m.trim()).filter(Boolean)
        : [];

      const domainLabel = td.domains[selectedDomain]?.label ?? "wellbeing";

      const response = await fetch(withBasePath("/api/diagnostic/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: finalQuery,
          mode,
          domain: selectedDomain,
          domainLabel,
          language: detectedLangName.toLowerCase().includes("amharic") ? "am" : "en",
          symptoms: selectedSymptoms,
          userProfile: {
            medications: medsArray,
            location: {
              region: userRegion,
              altitude: userRegion.includes("Lowland") ? 1200 : 2400,
            },
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || td.genericDiagnosisError);
      }

      setResult(payload.data);
      setAnalyzedDomain(selectedDomain);
      if (payload.data.summary.urgency === "critical") {
        setShowEmergencyModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : td.genericDiagnosisError);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setLoading(false);
      setProcessingStep(0);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch(withBasePath("/api/diagnostic/history?limit=10"));
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHistoryItems(json.data);
      }
    } catch (err) {
      console.warn("Could not load history:", err);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (query.trim().length < 10) {
      setAssist({ suggestions: [], urgencyHint: "", safetyFlags: [] });
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const contextQuery = userMedications ? `${query} Current medications: ${userMedications}` : query;
        const response = await fetch(withBasePath(`/api/diagnostic/assist?query=${encodeURIComponent(contextQuery)}`));
        const payload = await response.json();
        if (payload.success) setAssist(payload.data);
      } catch {
        // Assistance is optional and must not interrupt diagnostic entry.
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [query, userMedications]);

  return (
    <div className="py-10 min-h-screen text-foreground">
      <div className="app-container max-w-6xl mx-auto">
        {/* Portal Header */}
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-brand/40 text-brand-strong text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
              {td.portalBadge}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
              {td.portalTitle}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              {td.portalDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 self-center md:self-end">
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="px-4 py-2 rounded-xl bg-danger-soft border border-danger/50 text-danger-strong text-xs font-bold hover:bg-danger-soft transition-all flex items-center gap-2 shadow-panel"
            >
              <span className="text-base">🚨</span>
              <span>{td.emergencySos}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowHistoryDrawer(!showHistoryDrawer);
                loadHistory();
              }}
              className="px-3.5 py-2 rounded-xl bg-foreground/5 border border-border text-soft text-xs font-medium hover:text-foreground hover:bg-foreground/10 transition-colors flex items-center gap-1.5"
            >
              <span>🕒</span>
              <span>{td.history.replace("{count}", String(historyItems.length))}</span>
            </button>
          </div>
        </header>

        {/* Multi-Modal Input Section */}
        <section className="glass-panel p-6 md:p-8 mb-8 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            {/* Input Mode Tabs */}
            <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-sunken/80 border border-border" role="tablist">
              {(["text", "voice", "image", "symptom"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-2 ${mode === m
                    ? "bg-brand text-brand-foreground shadow-md"
                    : "text-muted-foreground hover:text-brand-foreground hover:bg-foreground/5"
                    }`}
                >
                  <span>{m === "text" ? `⌨️ ${td.textMode}` : m === "voice" ? `🎙️ ${td.voiceMode}` : m === "image" ? `📷 ${td.botanicalPhotoMode}` : `🩺 ${td.symptomGridMode}`}</span>
                </button>
              ))}
            </div>

            {/* Context Calibrations */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sunken/50 border border-border">
                <span className="text-subtle">{td.domain}</span>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-transparent text-brand font-semibold outline-none cursor-pointer"
                >
                  {domainOptions.map((domain) => (
                    <option key={domain.id} value={domain.id} className="bg-card">
                      {td.domains[domain.id].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sunken/50 border border-border">
                <span className="text-subtle">{td.region}</span>
                <select
                  value={userRegion}
                  onChange={(e) => setUserRegion(e.target.value)}
                  className="bg-transparent text-brand font-semibold outline-none cursor-pointer"
                >
                  {Object.entries(td.regions).map(([value, label]) => (
                    <option key={value} value={value} className="bg-card">{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sunken/50 border border-border">
                <span className="text-subtle">{td.detectedLanguage}</span>
                <span className="text-gold font-bold">{detectedLangName}</span>
              </div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {domainOptions.map((domain) => {
              const active = selectedDomain === domain.id;
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${active
                    ? "border-brand/60 bg-brand-soft text-foreground shadow-panel"
                    : "border-border bg-sunken/50 text-soft hover:border-border-strong"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xl">{domain.icon}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{td.focus}</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">{td.domains[domain.id].label}</div>
                  <p className="text-[11px] mt-1 leading-relaxed text-muted-foreground">{td.domains[domain.id].description}</p>
                </button>
              );
            })}
          </div>

          {/* Active Medication Input Bar */}
          <div className="mb-4 px-4 py-3 rounded-xl bg-sunken/50 border border-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-xs font-bold text-soft flex items-center gap-1.5 whitespace-nowrap">
              <span>💊</span> {td.activeMedications}
            </span>
            <input
              type="text"
              value={userMedications}
              onChange={(e) => setUserMedications(e.target.value)}
              placeholder={td.medicationPlaceholder}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-subtle outline-none"
            />
          </div>

          {/* Mode 1: Text Input */}
          {mode === "text" && (
            <div>
              <label htmlFor="wellbeing-query" className="block text-xs font-bold text-soft uppercase tracking-wider mb-2">
                {td.symptomsLabel}
              </label>
              <textarea
                id="wellbeing-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={td.domainInsights[selectedDomain]?.questions[0] || td.symptomPlaceholder}
                maxLength={3000}
                rows={5}
                className="w-full rounded-xl bg-sunken/80 border border-border p-4 text-sm text-foreground placeholder:text-subtle outline-none focus:border-brand transition-all resize-y leading-relaxed"
              />
              {(assist.suggestions.length > 0 || assist.urgencyHint || assist.safetyFlags.length > 0) && (
                <div className="mt-3 rounded-xl border border-info/30 bg-info-soft p-3 space-y-2" aria-live="polite">
                  <p className="text-xs font-semibold text-info-strong">{td.liveCheck}</p>
                  {assist.urgencyHint && <p className="text-xs text-danger-strong">{assist.urgencyHint}</p>}
                  {assist.safetyFlags.map((flag) => <p key={flag} className="text-xs text-gold-strong">{flag}</p>)}
                  {assist.suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setQuery((current) => `${current.trim()} ${suggestion}`.trim())} className="block text-left text-xs text-info-strong underline">
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Voice Input */}
          {mode === "voice" && (
            <div className="p-6 rounded-2xl bg-sunken/80 border border-border text-center">
              <div className="flex justify-center items-center gap-3 mb-4">
                <span className="text-xs text-muted-foreground">{td.speechLanguage}</span>
                <button
                  type="button"
                  onClick={() => setSpeechLang("en-US")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${speechLang === "en-US" ? "bg-brand text-brand-foreground" : "bg-foreground/5 text-muted-foreground"
                    }`}
                >
                  {td.englishUs}
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLang("am-ET")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${speechLang === "am-ET" ? "bg-gold-fill text-gold-foreground" : "bg-foreground/5 text-muted-foreground"
                    }`}
                >
                  {td.amharic}
                </button>
              </div>

              <div className="my-6">
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  disabled={isListening}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl transition-all shadow-panel ${isListening
                    ? "bg-danger text-danger-foreground animate-pulse scale-110"
                    : "bg-brand hover:bg-brand text-danger-foreground hover:scale-105"
                    }`}
                >
                  🎙️
                </button>
                <p className="text-xs font-medium text-soft mt-3">
                  {isListening ? td.listening : td.startRecording}
                </p>
              </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={td.transcribedPlaceholder}
                rows={3}
                className="w-full rounded-xl bg-sunken/80 border border-border p-3 text-xs text-foreground placeholder:text-subtle outline-none resize-none"
              />
            </div>
          )}

          {/* Mode 3: Image & Botanical Inspection */}
          {mode === "image" && (
            <div className="p-6 rounded-2xl bg-sunken/80 border border-border">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground mb-1">{td.botanicalRecognition}</h3>
                <p className="text-xs text-muted-foreground">
                  {td.botanicalInstructions}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {sampleBotanicals.map((specimen) => (
                  <button
                    key={specimen.name}
                    type="button"
                    onClick={() => {
                      setSelectedBotanical(specimen.name);
                      setQuery(`Inquiry regarding safety and indications of ${specimen.name}`);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedBotanical === specimen.name
                      ? "bg-brand-soft border-brand text-foreground shadow-md"
                      : "bg-foreground/[0.02] border-border text-soft hover:border-border-strong"
                      }`}
                  >
                    <span className="text-2xl mb-2 block">{specimen.icon}</span>
                    <h4 className="text-xs font-bold text-foreground">{specimen.name}</h4>
                    <p className="text-[10px] text-brand font-mono mt-1">{td.botanicals[specimen.id].category}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-tight">{td.botanicals[specimen.id].detectedEffect}</p>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={td.additionalBotanicalQuestion}
                className="w-full rounded-xl bg-sunken/80 border border-border p-3 text-xs text-foreground outline-none"
              />
            </div>
          )}

          {/* Mode 4: Symptom Grid Selector */}
          {mode === "symptom" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-soft uppercase tracking-wider">
                  {td.selectSymptoms.replace("{count}", String(selectedSymptoms.length))}
                </label>
                {selectedSymptoms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSymptoms([])}
                    className="text-[10px] text-danger hover:underline"
                  >
                    {td.clearAll}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-4">
                {symptomOptions.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym.id);
                  const isCritical = sym.id === "bleeding" || sym.id === "breathing_difficulty" || sym.id === "chest_pain";
                  const localizedSymptom = td.symptoms[sym.id];

                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => toggleSymptom(sym.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${isSelected
                        ? isCritical
                          ? "bg-danger-soft border-danger text-danger-strong shadow-md"
                          : "bg-brand-soft border-brand text-brand-strong shadow-md"
                        : "bg-sunken/50 border-border text-soft hover:border-border-strong"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{localizedSymptom.label}</span>
                        <span className="text-[10px] opacity-70 font-mono">{localizedSymptom.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={td.symptomPlaceholder}
                className="w-full rounded-xl bg-sunken/80 border border-border p-3 text-xs text-foreground outline-none"
              />
            </div>
          )}

          {/* Quick Suggestions Pills */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-2">
              {td.commonInquiries}
            </div>
            <div className="flex flex-wrap gap-2">
              {td.quickSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setQuery(sug);
                    setMode("text");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-foreground/[0.03] border border-border text-xs text-soft hover:text-foreground hover:border-brand/40 hover:bg-foreground/[0.07] transition-all text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-danger-soft border border-danger/40 text-danger-strong text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-subtle font-mono">
              {td.firewallStatus}
            </span>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || (mode === "symptom" ? selectedSymptoms.length === 0 && !query : !query.trim())}
              className="btn-primary text-sm py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-panel flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-border-strong border-t-transparent rounded-full animate-spin"></span>
                  <span>{td.synthesizing}</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>{td.runDiagnosis}</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Animated Processing Stepper */}
        {loading && (
          <section className="glass-panel p-6 mb-8 border border-brand/40 bg-brand-soft" aria-live="polite">
            <h3 className="text-xs font-bold text-brand uppercase tracking-wider mb-4">
              {td.processingPipeline}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: 1, title: `🔍 ${td.queryParsing}`, desc: td.queryParsingDescription },
                { step: 2, title: `📊 ${td.knowledgeRetrieval}`, desc: td.knowledgeRetrievalDescription },
                { step: 3, title: `🧠 ${td.causalGraph}`, desc: td.causalGraphDescription },
                { step: 4, title: `💡 ${td.solutionSynthesis}`, desc: td.solutionSynthesisDescription },
              ].map((s) => {
                const isCurrent = processingStep === s.step;
                const isDone = processingStep > s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-3.5 rounded-xl border transition-all ${isDone
                      ? "bg-brand-soft border-brand/50 text-brand-strong"
                      : isCurrent
                        ? "bg-brand/20 border-brand text-foreground animate-pulse"
                        : "bg-sunken/50 border-border text-subtle"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{td.step} {s.step}</span>
                      <span>{isDone ? "✓" : isCurrent ? "⏳" : "○"}</span>
                    </div>
                    <div className="text-xs font-semibold text-foreground">{s.title}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Diagnostic Results Dashboard */}
        {result && (
          <div className="space-y-8 animate-fadeIn" aria-live="polite">
            {/* 1. Urgency Alert Banner */}
            <div
              className={`rounded-2xl border p-6 md:p-8 shadow-raised ${urgencyBadgeStyles[result.summary.urgency].border
                } ${urgencyBadgeStyles[result.summary.urgency].bg}`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${urgencyBadgeStyles[result.summary.urgency].badgeBg
                        }`}
                    >
                      {result.summary.urgency === "critical"
                        ? `🔥 ${td.urgencyCritical}`
                        : result.summary.urgency === "high"
                          ? `⚠️ ${td.urgencyHigh}`
                          : result.summary.urgency === "medium"
                            ? `ℹ️ ${td.urgencyModerate}`
                            : `✅ ${td.urgencyRoutine}`}
                    </span>
                    <span className="text-xs font-mono text-soft">
                      {td.urgencyScore} <strong className="text-foreground">{result.summary.urgencyScore}/100</strong>
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                    {result.referral.type}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-danger hover:bg-danger text-danger-foreground text-xs font-bold shadow-panel transition-all flex items-center gap-2"
                  >
                    <span>📞</span>
                    <span>{td.emergencyContacts}</span>
                  </button>
                  <Link
                    href="/safety"
                    className="px-4 py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground text-xs font-bold border border-border-strong transition-colors"
                  >
                    {td.safetyGate}
                  </Link>
                </div>
              </div>

              <p className="text-sm md:text-base mt-4 text-foreground leading-relaxed max-w-4xl">
                {result.referral.message}
              </p>

              {result.summary.matchedSignals.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-muted-foreground">{td.signalsIdentified}</span>
                  {result.summary.matchedSignals.map((sig) => (
                    <span key={sig} className="px-2.5 py-0.5 rounded-md bg-foreground/10 text-soft font-mono text-[11px]">
                      {sig}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Diagnostic Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 col-span-1 md:col-span-2">
                <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">{td.synthesizedProblem}</div>
                <h3 className="text-lg font-bold text-foreground leading-snug">{result.summary.problem}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {result.reasoning.summaryReasoning}
                </p>
                <div className="mt-4 rounded-xl border border-brand/30 bg-brand-soft p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-brand font-bold mb-2">{td.domainLens}</div>
                  <div className="text-sm font-semibold text-foreground">
                    {td.domainInsights[analyzedDomain]?.headline || td.domains.wellbeing.label}
                  </div>
                  <p className="text-xs text-soft mt-2 leading-relaxed">
                    {td.domainInsights[analyzedDomain]?.emphasis || td.domains.wellbeing.description}
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 text-center flex flex-col justify-between">
                <div className="text-[11px] font-bold text-subtle uppercase tracking-wider">{td.confidence}</div>
                <div className="my-2">
                  <span className="text-4xl font-extrabold text-brand">{result.summary.confidence}%</span>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-brand h-full rounded-full" style={{ width: `${result.summary.confidence}%` }}></div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">{td.bayesianSynthesis}</div>
              </div>

              <div className="glass-panel p-5 text-center flex flex-col justify-between">
                <div className="text-[11px] font-bold text-subtle uppercase tracking-wider">{td.scientificIntent}</div>
                <div className="my-2">
                  <span className="text-xl font-extrabold text-gold capitalize">{result.summary.intent}</span>
                  <p className="text-xs text-muted-foreground mt-1">{td.language} {result.language.toUpperCase()}</p>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">{result.crossStrandIntersections.length} {td.intersections}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-subtle mb-3">{td.domainQuestions}</div>
                <h3 className="text-lg font-bold text-foreground mb-3">{td.domainInsights[analyzedDomain]?.headline || td.domains.wellbeing.label}</h3>
                <p className="text-xs text-soft leading-relaxed mb-4">
                  {td.domainInsights[analyzedDomain]?.emphasis || td.domains.wellbeing.description}
                </p>
                <ul className="space-y-2">
                  {(td.domainInsights[analyzedDomain]?.questions || []).map((question) => (
                    <li key={question} className="flex items-start gap-2 text-xs text-soft">
                      <span className="mt-0.5 text-brand">•</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-subtle mb-3">{td.responseDetail}</div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-sunken/50 border border-border">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">{td.primaryFocus}</div>
                    <div className="text-sm font-semibold text-foreground">{td.domains[analyzedDomain]?.label || td.domains.wellbeing.label}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-sunken/50 border border-border">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">{td.urgencySignal}</div>
                    <div className="text-sm font-semibold text-gold uppercase">{result.summary.urgency}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-sunken/50 border border-border">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">{td.recommendedNextStep}</div>
                    <div className="text-sm text-soft">{result.referral.message}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Potential Root Causes & Causal Pathways */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <div className="badge badge-safe mb-1">{td.causalEngine}</div>
                  <h3 className="text-xl font-extrabold text-foreground">{td.rootCauses}</h3>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{td.causalMapping}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {result.causes.map((cause) => (
                  <div key={cause.name} className="p-4 rounded-xl bg-sunken/80 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">{cause.name}</span>
                      <span className="text-xs font-mono font-bold text-gold">{cause.probability}% {td.probability}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mb-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-brand to-gold-fill h-full rounded-full" style={{ width: `${cause.probability}%` }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cause.evidence}</p>
                    {cause.culturalContext && (
                      <div className="mt-3 rounded-lg border border-gold/25 bg-gold-soft/70 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{td.domainContext}</div>
                        <p className="mt-1 text-[11px] leading-relaxed text-gold-strong">{cause.culturalContext.interpretation}</p>
                        <p className="mt-2 text-[10px] leading-relaxed text-gold-strong">{td.reflection} {cause.culturalContext.practice}</p>
                      </div>
                    )}
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-foreground/5 text-muted-foreground uppercase">
                      {td.domain} {cause.domain}
                    </span>
                  </div>
                ))}
              </div>

              {/* Visual Causal Graph */}
              {result.causalPathways.map((pathway) => (
                <div key={pathway.id} className="p-5 rounded-2xl bg-sunken/80 border border-brand/20">
                  <h4 className="text-sm font-bold text-brand mb-1 flex items-center gap-2">
                    <span>⛓️</span>
                    <span>{pathway.title}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mb-5">{pathway.description}</p>

                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 overflow-x-auto pb-2">
                    {pathway.nodes.map((node, i) => (
                      <div key={node.id} className="flex-1 flex flex-col lg:flex-row items-center gap-2">
                        <div className="w-full p-3 rounded-xl bg-foreground/[0.04] border border-border text-left">
                          <span className="text-[9px] uppercase text-brand block mb-1">
                            {td.node} {i + 1} &bull; {node.domain}
                          </span>
                          <span className="text-xs font-bold text-foreground block">{node.label}</span>
                          {node.description && <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{node.description}</p>}
                        </div>
                        {i < pathway.nodes.length - 1 && (
                          <div className="text-subtle font-bold hidden lg:block text-base">&rarr;</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Prioritized Solutions Grid */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <div className="badge badge-safe mb-1">{td.targetedInterventions}</div>
                  <h3 className="text-xl font-extrabold text-foreground">{td.prioritizedSolutions}</h3>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{td.safetyFiltered}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.solutions.map((sol) => {
                  const priorityStyles =
                    sol.priority === "critical"
                      ? "border-danger/50 bg-danger-soft"
                      : sol.priority === "high"
                        ? "border-warning/50 bg-warning-soft"
                        : sol.priority === "medium"
                          ? "border-gold/40 bg-gold-soft"
                          : "border-brand/40 bg-brand-soft";

                  return (
                    <div key={sol.id} className={`p-5 rounded-2xl border ${priorityStyles} flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-sunken/80 text-soft">
                            {sol.priority.toUpperCase()} {td.priority}
                          </span>
                          {sol.safetyGatePassed && (
                            <span className="badge badge-safe text-[9px]">{td.etmPassed}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-foreground mb-2">{sol.title}</h4>
                        <p className="text-xs text-soft leading-relaxed">{sol.description}</p>
                        {sol.culturalContext && (
                          <div className="mt-3 rounded-lg border border-gold/25 bg-gold-soft/70 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{td.culturalReflection}</div>
                            <p className="mt-1 text-[11px] leading-relaxed text-gold-strong">{sol.culturalContext.interpretation}</p>
                            <p className="mt-2 text-[10px] leading-relaxed text-gold-strong">{td.reflection} {sol.culturalContext.practice}</p>
                          </div>
                        )}
                      </div>
                      {sol.sourceRef && (
                        <div className="mt-4 pt-2 border-t border-border text-[10px] font-mono text-subtle">
                          {td.evidenceCitation} {sol.sourceRef}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Five-Stage Action Plan Timeline */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-border">
                <div>
                  <div className="badge badge-safe mb-1">{td.structuredTimeline}</div>
                  <h3 className="text-xl font-extrabold text-foreground">{td.actionPlan}</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>{td.markComplete}</span>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { key: "immediate_actions", label: td.stageNow, color: "text-danger border-danger/40", items: result.action_plan.immediate_actions },
                  { key: "short_term", label: td.stageShort, color: "text-warning border-warning/40", items: result.action_plan.short_term },
                  { key: "medium_term", label: td.stageMedium, color: "text-gold border-gold/40", items: result.action_plan.medium_term },
                  { key: "long_term", label: td.stageLong, color: "text-brand border-brand/40", items: result.action_plan.long_term },
                  { key: "ongoing", label: td.stageOngoing, color: "text-brand border-brand/40", items: result.action_plan.ongoing },
                ].map((stage) => (
                  <div key={stage.key} className="border-l-2 pl-4 border-border">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-3 ${stage.color}`}>
                      {stage.label}
                    </h4>
                    <div className="space-y-2">
                      {stage.items.map((item) => {
                        const isDone = completedActions[item.id] || false;
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleActionCheck(item.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${isDone
                              ? "bg-brand-soft border-brand/30 opacity-70 line-through text-muted-foreground"
                              : "bg-sunken/80 border-border hover:border-border-strong text-soft"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => { }}
                              className="mt-0.5 rounded text-brand focus:ring-0 cursor-pointer"
                            />
                            <div className="flex-1 text-xs">
                              <div className="font-bold text-foreground">{item.title}</div>
                              <p className="text-muted-foreground mt-0.5 leading-relaxed">{item.action}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-muted-foreground uppercase">
                              {item.category}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Safety Gate & Herb-Drug Matrix Warning Panel */}
            {result.safety.herbDrugInteractions.length > 0 && (
              <div className="p-6 rounded-2xl bg-danger-soft border-2 border-danger/50 shadow-panel">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-moderate text-xs">{td.certifiedSafety}</span>
                  <span className="text-xs font-mono text-danger">{td.pharmacopoeiaGuardrail}</span>
                </div>
                <h3 className="text-lg font-extrabold text-foreground mb-2">
                  {td.interactionWarningTitle}
                </h3>
                <p className="text-xs text-soft mb-4 leading-relaxed">
                  {td.interactionWarningBody}
                </p>
                <div className="space-y-3">
                  {result.safety.herbDrugInteractions.map((hdi) => (
                    <div key={`${hdi.herb}-${hdi.drug}`} className="p-4 rounded-xl bg-sunken/80 border border-danger/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-danger-strong">{hdi.herb} &times; {hdi.drug}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-danger/20 text-danger-strong">
                          {hdi.severity} {td.severity}
                        </span>
                      </div>
                      <p className="text-soft leading-relaxed">{hdi.mechanism}</p>
                      <p className="text-gold font-semibold mt-2">{hdi.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Cultural & Astrological Insights (Domain B Firewalled) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cultural Context */}
              <div className="glass-panel p-6 border-l-4 border-l-gold">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-soft text-gold-strong border border-gold/30">
                    {td.domainHeritage}
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground mb-2">{result.cultural_context.title}</h4>
                <p className="text-xs text-soft leading-relaxed mb-3">{result.cultural_context.traditionalHealing}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{result.cultural_context.culturalSignificance}</p>
                <div className="p-2.5 rounded-lg bg-sunken/80 border border-border text-[10px] text-subtle leading-normal">
                  {result.cultural_context.disclaimer}
                </div>
              </div>

              {/* Astrological Context */}
              <div className="glass-panel p-6 border-l-4 border-l-plum">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-plum-soft text-plum-strong border border-plum/30">
                    {td.domainHeritage} • Awde Negest
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground mb-2">{result.astrological_context.title}</h4>
                <p className="text-xs text-soft leading-relaxed mb-3">
                  {td.constitutionalTemperament} <strong className="text-plum">{result.astrological_context.humoralElement}</strong>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{result.astrological_context.seasonalAdvice}</p>
                <div className="p-2.5 rounded-lg bg-sunken/80 border border-border text-[10px] text-subtle leading-normal">
                  {result.astrological_context.disclaimer}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 md:p-8 border border-gold/30 bg-gold-soft/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="badge badge-moderate mb-2">{td.unifiedDomainReport}</div>
                  <h3 className="text-xl font-extrabold text-foreground">{td.culturalLayersTitle}</h3>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-gold">
                  {result.culturalLayers?.[0]?.status || "included"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(result.culturalLayers?.[0]?.strands || ["cultural", "astrological", "awudeNegest", "numerology"]).map((strand) => (
                  <span key={strand} className="px-2.5 py-1 rounded-md bg-gold/10 border border-gold/25 text-[10px] uppercase text-gold-strong">
                    {strand}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl bg-sunken/50 border border-border p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">{td.interpretation}</div>
                  <p className="text-xs text-soft leading-relaxed">
                    {result.culturalLayers?.[0]?.interpretation || result.cultural_context.culturalSignificance}
                  </p>
                </div>
                <div className="rounded-xl bg-sunken/50 border border-border p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">{td.reflectivePractice}</div>
                  <p className="text-xs text-soft leading-relaxed">
                    {result.culturalLayers?.[0]?.practice || result.astrological_context.seasonalAdvice}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-gold-strong leading-relaxed">
                {result.culturalLayers?.[0]?.disclaimer || result.cultural_context.disclaimer}
              </p>
            </div>

            {/* 8. 11-Strand Knowledge Deep Dive Explorer */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                <div>
                  <div className="badge badge-safe mb-1">{td.evidenceBreakdown}</div>
                  <h3 className="text-xl font-extrabold text-foreground">{td.knowledgeStrandsDeepDive}</h3>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {Object.values(result.rawFindings).flat().length} {td.totalVerifiedFindings}
                </span>
              </div>

              {/* Strand Switcher Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-6 p-1.5 rounded-xl bg-sunken/80 border border-border">
                {(Object.keys(result.rawFindings) as KnowledgeStrandType[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setActiveStrandTab(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${activeStrandTab === st
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "text-muted-foreground hover:text-brand-foreground hover:bg-foreground/5"
                      }`}
                  >
                    {st} ({result.rawFindings[st]?.length || 0})
                  </button>
                ))}
              </div>

              {/* Active Strand Findings */}
              <div className="space-y-3">
                {(!result.rawFindings[activeStrandTab] || result.rawFindings[activeStrandTab].length === 0) ? (
                  <p className="text-xs text-subtle py-6 text-center">
                    {td.noFindings.replace("{strand}", activeStrandTab)}
                  </p>
                ) : (
                  result.rawFindings[activeStrandTab].map((finding, idx) => (
                    <div key={`${finding.name}-${idx}`} className="p-4 rounded-xl bg-sunken/50 border border-border">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-foreground">{finding.name}</span>
                        <span className="text-[10px] font-mono text-brand">
                          {Math.round(finding.relevanceScore * 100)}% {td.relevance}
                        </span>
                      </div>
                      <p className="text-xs text-soft leading-relaxed">{finding.description}</p>
                      {finding.evidenceItems && finding.evidenceItems.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {finding.evidenceItems.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex gap-3 items-start p-2 rounded-lg bg-sunken/50 border border-border">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={assetUrl(item.imageUrl)}
                                alt={item.imageAlt}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full flex-shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                {item.caption && (
                                  <div className="text-[10px] uppercase tracking-wide text-gold font-semibold mb-0.5">
                                    {item.caption}
                                  </div>
                                )}
                                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">{item.description}</p>
                                {item.source && (
                                  <p className="text-[10px] text-subtle mt-0.5">{td.source} {item.source}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {finding.evidence && (
                            <p className="text-[11px] text-muted-foreground mt-2 font-mono leading-relaxed">
                              {td.evidence} {finding.evidence}
                            </p>
                          )}
                          {finding.ethiopian_context && (
                            <div className="mt-2 text-[10px] text-gold font-medium">
                              {td.ethiopianContext} {Array.isArray(finding.ethiopian_context) ? finding.ethiopian_context.join(" • ") : finding.ethiopian_context}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 9. Export & Share Actions */}
            <div className="glass-panel p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">{td.saveOrShare}</h4>
                <p className="text-xs text-muted-foreground">
                  {td.exportDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `diagnostic-report-${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-foreground/5 border border-border hover:border-brand/40 text-xs font-bold text-soft transition-all flex items-center gap-2"
                >
                  <span>⬇️</span>
                  <span>{td.exportJson}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-foreground/5 border border-border hover:border-brand/40 text-xs font-bold text-soft transition-all flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>{td.printSummary}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: td.scientificSummaryTitle,
                        text: `Diagnostic Result: ${result.summary.problem} (${result.summary.urgency.toUpperCase()} priority). Consult: ${result.referral.type}`,
                      }).catch(() => { });
                    } else {
                      navigator.clipboard.writeText(
                        `Ethiopian Wisdom Diagnostic Summary:\n${result.summary.problem}\nUrgency: ${result.summary.urgency.toUpperCase()}\nRecommendation: ${result.referral.message}`
                      );
                      alert(td.copiedToClipboard);
                    }
                  }}
                  className="btn-primary text-xs py-2.5 px-5"
                >
                  {td.shareSummary}
                </button>
              </div>
            </div>

            {/* Legal Disclaimers */}
            <div className="text-[11px] text-subtle space-y-1.5 p-4 rounded-xl bg-sunken/50 border border-border">
              <p className="font-bold text-muted-foreground">{td.governanceNotice}</p>
              {result.safety.disclaimers.map((disc, idx) => (
                <p key={idx} className="leading-relaxed">&bull; {disc}</p>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Hotlines Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel p-6 md:p-8 max-w-lg w-full border-2 border-danger/70 shadow-raised">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-danger/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🚨</span>
                  <h3 className="text-xl font-extrabold text-foreground">{td.emergencyHotlines}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="text-muted-foreground hover:text-foreground text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-soft mb-6 leading-relaxed">
                {td.emergencyInstructions}
              </p>

              <EmergencyHelp tone="dark" className="mb-6" />

              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="w-full py-2.5 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-xs font-bold text-foreground transition-colors"
              >
                {td.closeEmergencyNotice}
              </button>
            </div>
          </div>
        )}

        {/* History Drawer Modal */}
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-overlay backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md h-full bg-card border-l border-border shadow-raised p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span>🕒</span>
                    <h3 className="text-base font-bold text-foreground">{td.inquiryHistory}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHistoryDrawer(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                {historyItems.length === 0 ? (
                  <p className="text-xs text-subtle text-center py-10">{td.noHistory}</p>
                ) : (
                  <div className="space-y-3">
                    {historyItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setQuery(item.query);
                          setShowHistoryDrawer(false);
                          setMode("text");
                        }}
                        className="p-3.5 rounded-xl bg-foreground/[0.02] border border-border hover:border-brand/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.urgencyLevel === "critical"
                            ? "bg-danger-soft text-danger-strong"
                            : item.urgencyLevel === "high"
                              ? "bg-warning-soft text-warning-strong"
                              : "bg-brand-soft text-brand-strong"
                            }`}>
                            {item.urgencyLevel}
                          </span>
                          <span className="text-[10px] text-subtle">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-foreground line-clamp-2 mt-1">{item.query}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="btn-secondary text-xs py-2.5 mt-6 w-full"
              >
                {td.closeDrawer}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
