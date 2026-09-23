"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DiagnosticSolution, DiagnosticUrgencyLevel, KnowledgeStrandType } from "@/lib/knowledge/types";

type InputMode = "text" | "voice" | "image" | "symptom";

const symptomOptions = [
  { id: "headache", label: "Headache / ራስ ምታት", category: "Neurological" },
  { id: "fever", label: "High Fever / ትኩሳት", category: "Infectious" },
  { id: "cough", label: "Cough / ሳል", category: "Respiratory" },
  { id: "breathing_difficulty", label: "Shortness of Breath / መተንፈስ መቸገር", category: "Respiratory" },
  { id: "chest_pain", label: "Chest Pain / የደረት ህመም", category: "Cardiovascular" },
  { id: "stomach_pain", label: "Stomach Burning / የጨጓራ ህመም", category: "Digestive" },
  { id: "vomiting", label: "Vomiting / ማስመለስ", category: "Digestive" },
  { id: "diarrhea", label: "Diarrhea / ተቅማጥ", category: "Digestive" },
  { id: "fatigue", label: "Chronic Fatigue / ከፍተኛ ድካም", category: "General" },
  { id: "chills", label: "Rigors & Chills / ብርድ ብርድ ማለት", category: "Infectious" },
  { id: "jaundice", label: "Yellowing of Eyes / ወፍ በሽታ", category: "Hepatic" },
  { id: "bleeding", label: "Uncontrolled Bleeding / ደም መፍሰስ", category: "Critical" },
  { id: "joint_pain", label: "Joint Stiffness / ቁርጥማት", category: "Musculoskeletal" },
  { id: "rash", label: "Skin Eruption / አለርጂ ሽፍታ", category: "Dermatological" },
  { id: "insomnia", label: "Insomnia / እንቅልፍ ማጣት", category: "Neurological" },
  { id: "heart_palpitations", label: "Heart Racing / የልብ ምት መጨመር", category: "Cardiovascular" },
];

const quickSuggestions = [
  "High fever and severe headache after visiting Awash lowland",
  "Severe epigastric heartburn after meals and during religious fasting",
  "I am taking Warfarin blood thinner and want to drink Tena Adam tea",
  "Crushing chest pain radiating to left arm with shortness of breath",
  "Extreme fatigue, pale eyes, and weakness despite eating injera daily",
  "Heart palpitations and insomnia after long afternoon khat chewing",
];

const domainOptions = [
  { id: "Welbeing", label: "Welbeing", icon: "✚", description: "Symptoms, recovery, nutrition, medication safety, and preventive care." },
  { id: "peace", label: "Peace", icon: "☼", description: "Stress, safety, sleep, emotional steadiness, and restoration." },
  { id: "power", label: "Power", icon: "◇", description: "Agency, boundaries, energy, motivation, and leadership." },
  { id: "money", label: "Money", icon: "◈", description: "Stability, obligations, planning, and resource pressure." },
  { id: "career", label: "Career", icon: "↗", description: "Direction, work fit, opportunity, and sustainable professional growth." },
  { id: "relationships", label: "Relationships & Family", icon: "❤", description: "Communication, conflict, family roles, safety, and partnership dynamics." },
  { id: "spiritual", label: "Spiritual & Life Direction", icon: "✦", description: "Purpose, ritual, life direction, and cultural reflection with clear safety boundaries." },
  { id: "legal", label: "Legal & Dispute", icon: "⚖", description: "Housing, contracts, rights, and dispute guidance with legal-safety screening." },
  { id: "social", label: "Social", icon: "◎", description: "Belonging, relationships, family patterns, and community support." },
];

const domainInsightMap: Record<string, { headline: string; emphasis: string; questions: string[] }> = {
  Welbeing: {
    headline: "Welbeing-focused synthesis",
    emphasis: "The analysis is anchored on symptoms, physiology, medication-herb safety, nutrition, and recovery patterns.",
    questions: ["What is changing most in your body or daily function?", "Have you started any new medicines, herbs, supplements, or fasting patterns?", "What is making symptoms worse or better?"],
  },
  peace: {
    headline: "Peace-focused synthesis",
    emphasis: "The review emphasizes stress, emotional regulation, sleep disruption, conflict patterns, and safety.",
    questions: ["What feels most destabilizing right now?", "What support or routine helps you feel more grounded?", "What pattern is draining your sense of calm or safety?"],
  },
  power: {
    headline: "Power-focused synthesis",
    emphasis: "This lens prioritizes personal agency, decision fatigue, boundaries, momentum, and practical action.",
    questions: ["Where do you feel least able to act or choose?", "What is draining your energy or confidence?", "What one decision would improve your agency this week?"],
  },
  money: {
    headline: "Money-focused synthesis",
    emphasis: "This review centers financial pressure, obligations, cash flow, planning, and the next workable step.",
    questions: ["What is creating the most pressure right now?", "What bills, commitments, or burdens feel most urgent?", "What would reduce your stress within the next 30 days?"],
  },
  career: {
    headline: "Career-focused synthesis",
    emphasis: "The plan emphasizes work fit, direction, burnout, skill-building, and sustainable professional decisions.",
    questions: ["What part of work or study feels least aligned?", "Where are you stuck between exploration and action?", "What would make the path more sustainable and clear?"],
  },
  relationships: {
    headline: "Relationships & Family synthesis",
    emphasis: "This lens prioritizes communication, safety, boundaries, family roles, and conflict patterns with trauma-aware framing.",
    questions: ["What pattern is repeating in the relationship or family dynamic?", "Where do you feel safest or least safe?", "What would help the communication feel more steady and fair?"],
  },
  spiritual: {
    headline: "Spiritual & Life Direction synthesis",
    emphasis: "This lens emphasizes purpose, life direction, ritual meaning, and reflective guidance while keeping mental-Welbeing safety distinct.",
    questions: ["What area of life feels most unclear or spiritually heavy right now?", "What traditions or questions feel most meaningful to you?", "What would help you feel more grounded in purpose?"],
  },
  legal: {
    headline: "Legal & Dispute synthesis",
    emphasis: "This review focuses on rights, deadlines, obligations, and general legal context while avoiding case-specific legal advice.",
    questions: ["What is the dispute or obligation you are facing?", "Is there a deadline or immediate risk you need to account for?", "What is the concrete next step you need to understand?"],
  },
  social: {
    headline: "Social-focused synthesis",
    emphasis: "This lens prioritizes family ties, belonging, support networks, boundaries, and relationship dynamics.",
    questions: ["Who feels supportive and who contributes to strain?", "What connection feels missing or difficult?", "What would make you feel more seen, included, or safe?"],
  },
};

const sampleBotanicals = [
  { name: "Tena Adam (Ruta chalepensis)", category: "Herb Sample", detectedEffect: "Furanocoumarins • High Warfarin Interaction Risk", icon: "🌿" },
  { name: "Kosso (Hagenia abyssinica)", category: "Anthelmintic Flower", detectedEffect: "Kosotoxin • Hepatotoxic & Anticoagulant Bleeding Risk", icon: "🌸" },
  { name: "Tikur Azmud (Nigella sativa)", category: "Black Seed", detectedEffect: "Thymoquinone • Hypoglycemic Potentiation", icon: "🌱" },
  { name: "Habesha Gomen (Brassica carinata)", category: "Collard Leaf", detectedEffect: "Glucosinolates • Bioavailable Calcium & Lutein", icon: "🥬" },
];

const urgencyBadgeStyles: Record<DiagnosticUrgencyLevel, { border: string; bg: string; text: string; badgeBg: string }> = {
  critical: {
    border: "border-rose-500/80 shadow-rose-950/50",
    bg: "bg-gradient-to-br from-rose-950/90 via-black/80 to-rose-900/40",
    text: "text-rose-100",
    badgeBg: "bg-rose-500 text-white animate-pulse",
  },
  high: {
    border: "border-orange-500/70 shadow-orange-950/40",
    bg: "bg-gradient-to-br from-orange-950/80 via-black/80 to-amber-950/40",
    text: "text-orange-100",
    badgeBg: "bg-orange-500 text-white",
  },
  medium: {
    border: "border-amber-500/60 shadow-amber-950/30",
    bg: "bg-gradient-to-br from-amber-950/70 via-black/80 to-yellow-950/30",
    text: "text-amber-100",
    badgeBg: "bg-amber-500 text-black font-bold",
  },
  low: {
    border: "border-emerald-500/50 shadow-emerald-950/30",
    bg: "bg-gradient-to-br from-emerald-950/60 via-black/80 to-teal-950/30",
    text: "text-emerald-100",
    badgeBg: "bg-emerald-500 text-white",
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
  const [mode, setMode] = useState<InputMode>("text");
  const [query, setQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("Welbeing");
  const [analyzedDomain, setAnalyzedDomain] = useState<string>("Welbeing");
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
      setError("Voice recognition is not natively supported by your browser. Please type your inquiry.");
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
        setError("Voice input could not be captured. Check your microphone permissions or type your symptoms.");
      };

      recognition.onresult = (event: SpeechRecognitionResultEvent) => {
        const transcript = event.results[0]?.[0]?.transcript || "";
        setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setError("Unable to initialize microphone speech recognition.");
      setIsListening(false);
    }
  }

  async function handleAnalyze() {
    let finalQuery = query;
    if (mode === "symptom" && selectedSymptoms.length > 0) {
      const symptomLabels = symptomOptions
        .filter((s) => selectedSymptoms.includes(s.id))
        .map((s) => s.label);
      finalQuery = `Patient reports experiencing: ${symptomLabels.join(", ")}. ${query}`.trim();
    } else if (mode === "image" && selectedBotanical) {
      finalQuery = `Botanical photo inspection of ${selectedBotanical}. Debral inquiry: ${query || "Assess medicinal safety and interactions"}`.trim();
    }

    if (!finalQuery || finalQuery.trim().length < 2) {
      setError("Please describe your Welbeing concern or select symptoms first.");
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

      const domainLabel = domainOptions.find((d) => d.id === selectedDomain)?.label || "Welbeing";

      const response = await fetch("/api/diagnostic/analyze", {
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
        throw new Error(payload.error || "Failed to complete multi-strand diagnostic analysis.");
      }

      setResult(payload.data);
      setAnalyzedDomain(selectedDomain);
      if (payload.data.summary.urgency === "critical") {
        setShowEmergencyModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Diagnostic evaluation failed.");
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
      const res = await fetch("/api/diagnostic/history?limit=10");
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
        const response = await fetch(`/api/diagnostic/assist?query=${encodeURIComponent(contextQuery)}`);
        const payload = await response.json();
        if (payload.success) setAssist(payload.data);
      } catch {
        // Assistance is optional and must not interrupt diagnostic entry.
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [query, userMedications]);

  return (
    <div className="py-10 min-h-screen text-slate-100">
      <div className="app-container max-w-6xl mx-auto">
        {/* Portal Header */}
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              MULTI-STRAND KNOWLEDGE RETRIEVAL &amp; DIAGNOSTIC PORTAL (v4.0)
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Intelligent Diagnostic Portal
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Processes Welbeing concerns across <strong className="text-emerald-400">11 specialized knowledge domains</strong> with cross-strand causal inference, ETM-DB safety gates, and 5-stage action plans.
            </p>
          </div>

          <div className="flex items-center gap-3 self-center md:self-end">
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-bold hover:bg-rose-900/80 transition-all flex items-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <span className="text-base">🚨</span>
              <span>Emergency SOS (907)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowHistoryDrawer(!showHistoryDrawer);
                loadHistory();
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <span>🕒</span>
              <span>History ({historyItems.length})</span>
            </button>
          </div>
        </header>

        {/* Multi-Modal Input Section */}
        <section className="glass-panel p-6 md:p-8 mb-8 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            {/* Input Mode Tabs */}
            <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-black/40 border border-white/10" role="tablist">
              {(["text", "voice", "image", "symptom"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-2 ${mode === m
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <span>{m === "text" ? "⌨️ Text" : m === "voice" ? "🎙️ Voice" : m === "image" ? "📷 Botanical Photo" : "🩺 Symptom Grid"}</span>
                </button>
              ))}
            </div>

            {/* Context Calibrations */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
                <span className="text-slate-500">Domain:</span>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-transparent text-emerald-300 font-semibold outline-none cursor-pointer"
                >
                  {domainOptions.map((domain) => (
                    <option key={domain.id} value={domain.id} className="bg-slate-900">
                      {domain.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
                <span className="text-slate-500">Region:</span>
                <select
                  value={userRegion}
                  onChange={(e) => setUserRegion(e.target.value)}
                  className="bg-transparent text-emerald-300 font-semibold outline-none cursor-pointer"
                >
                  <option value="Addis Ababa (2,400m)" className="bg-slate-900">Addis Ababa (2,400m)</option>
                  <option value="Amhara Highlands (2,600m)" className="bg-slate-900">Amhara Highlands (2,600m)</option>
                  <option value="Oromia Agrarian (2,000m)" className="bg-slate-900">Oromia Agrarian (2,000m)</option>
                  <option value="Rift Valley Basin (1,600m)" className="bg-slate-900">Rift Valley Basin (1,600m)</option>
                  <option value="Afar / Somali Lowlands (600m)" className="bg-slate-900">Afar / Somali Lowlands (600m)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
                <span className="text-slate-500">Detected Language:</span>
                <span className="text-amber-300 font-bold">{detectedLangName}</span>
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
                    ? "border-emerald-500/60 bg-emerald-950/30 text-white shadow-lg shadow-emerald-950/20"
                    : "border-white/10 bg-black/25 text-slate-300 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xl">{domain.icon}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Focus</span>
                  </div>
                  <div className="text-sm font-bold text-white">{domain.label}</div>
                  <p className="text-[11px] mt-1 leading-relaxed text-slate-400">{domain.description}</p>
                </button>
              );
            })}
          </div>

          {/* Active Medication Input Bar */}
          <div className="mb-4 px-4 py-3 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
              <span>💊</span> Active Medications:
            </span>
            <input
              type="text"
              value={userMedications}
              onChange={(e) => setUserMedications(e.target.value)}
              placeholder="e.g. Warfarin, Metformin, Enalapril (for Herb-Drug safety checks)"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 outline-none"
            />
          </div>

          {/* Mode 1: Text Input */}
          {mode === "text" && (
            <div>
              <label htmlFor="Welbeing-query" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Describe your symptoms, duration, triggers &amp; concerns
              </label>
              <textarea
                id="Welbeing-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={domainInsightMap[selectedDomain]?.questions[0] || "Describe what is happening and what you need help with..."}
                maxLength={3000}
                rows={5}
                className="w-full rounded-xl bg-black/50 border border-white/10 p-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 transition-all resize-y leading-relaxed"
              />
              {(assist.suggestions.length > 0 || assist.urgencyHint || assist.safetyFlags.length > 0) && (
                <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 space-y-2" aria-live="polite">
                  <p className="text-xs font-semibold text-sky-200">Live safety and completeness check</p>
                  {assist.urgencyHint && <p className="text-xs text-rose-200">{assist.urgencyHint}</p>}
                  {assist.safetyFlags.map((flag) => <p key={flag} className="text-xs text-amber-200">{flag}</p>)}
                  {assist.suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setQuery((current) => `${current.trim()} ${suggestion}`.trim())} className="block text-left text-xs text-sky-200 underline">
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Voice Input */}
          {mode === "voice" && (
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div className="flex justify-center items-center gap-3 mb-4">
                <span className="text-xs text-slate-400">Speech Language:</span>
                <button
                  type="button"
                  onClick={() => setSpeechLang("en-US")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${speechLang === "en-US" ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400"
                    }`}
                >
                  English (US)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLang("am-ET")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${speechLang === "am-ET" ? "bg-amber-600 text-white" : "bg-white/5 text-slate-400"
                    }`}
                >
                  Amharic (አማርኛ)
                </button>
              </div>

              <div className="my-6">
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  disabled={isListening}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl transition-all shadow-xl ${isListening
                    ? "bg-rose-600 text-white animate-pulse shadow-rose-950/80 scale-110"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:scale-105"
                    }`}
                >
                  🎙️
                </button>
                <p className="text-xs font-medium text-slate-300 mt-3">
                  {isListening ? "Listening... Speak clearly into your microphone" : "Tap the microphone to start voice recording"}
                </p>
              </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Transcribed voice inquiry will appear here..."
                rows={3}
                className="w-full rounded-xl bg-black/60 border border-white/10 p-3 text-xs text-white placeholder:text-slate-600 outline-none resize-none"
              />
            </div>
          )}

          {/* Mode 3: Image & Botanical Inspection */}
          {mode === "image" && (
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white mb-1">Botanical Specimen &amp; Herb Recognition</h3>
                <p className="text-xs text-slate-400">
                  Select a candidate specimen or upload a photo to verify botanical species and screen against drug interactions.
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
                      ? "bg-emerald-950/40 border-emerald-400 text-white shadow-md shadow-emerald-950/40"
                      : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20"
                      }`}
                  >
                    <span className="text-2xl mb-2 block">{specimen.icon}</span>
                    <h4 className="text-xs font-bold text-white">{specimen.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">{specimen.category}</p>
                    <p className="text-[10px] text-slate-400 mt-2 leading-tight">{specimen.detectedEffect}</p>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Add additional questions about this herb or food specimen..."
                className="w-full rounded-xl bg-black/50 border border-white/10 p-3 text-xs text-white outline-none"
              />
            </div>
          )}

          {/* Mode 4: Symptom Grid Selector */}
          {mode === "symptom" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select all active symptoms ({selectedSymptoms.length} selected)
                </label>
                {selectedSymptoms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSymptoms([])}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-4">
                {symptomOptions.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym.id);
                  const isCritical = sym.category === "Critical" || sym.id === "breathing_difficulty" || sym.id === "chest_pain";

                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => toggleSymptom(sym.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${isSelected
                        ? isCritical
                          ? "bg-rose-950/60 border-rose-400 text-rose-100 shadow-md shadow-rose-950/50"
                          : "bg-emerald-950/60 border-emerald-400 text-emerald-100 shadow-md shadow-emerald-950/40"
                        : "bg-black/30 border-white/10 text-slate-300 hover:border-white/20"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{sym.label.split("/")[0]}</span>
                        <span className="text-[10px] opacity-70 font-mono">{sym.category}</span>
                      </div>
                      <div className="text-[10px] opacity-75">{sym.label.split("/")[1] || ""}</div>
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Optional: add duration, severity or additional details here..."
                className="w-full rounded-xl bg-black/50 border border-white/10 p-3 text-xs text-white outline-none"
              />
            </div>
          )}

          {/* Quick Suggestions Pills */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Common Inquiries (Click to populate)
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setQuery(sug);
                    setMode("text");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-white/[0.07] transition-all text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-mono">
              Deterministic Stage 1-5 Firewall Verified • ETM-DB Safety Matrix Active
            </span>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || (mode === "symptom" ? selectedSymptoms.length === 0 && !query : !query.trim())}
              className="btn-primary text-sm py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-950/50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Synthesizing Multi-Strand Reasoning...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Run Multi-Strand Diagnosis</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Animated Processing Stepper */}
        {loading && (
          <section className="glass-panel p-6 mb-8 border border-emerald-500/40 bg-emerald-950/20" aria-live="polite">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
              Multi-Domain Processing Pipeline (Simultaneous 11 Strands)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: 1, title: "🔍 Query Parsing", desc: "Intent, entities & urgency score detection" },
                { step: 2, title: "📊 10+ Strand Retrieval", desc: "Biochemical, pharmacological, ecological & dietary" },
                { step: 3, title: "🧠 Cross-Strand Causal Graph", desc: "Detecting multi-domain intersections & risk chains" },
                { step: 4, title: "💡 Solution Synthesis", desc: "Safety gate verification & 5-stage action plan" },
              ].map((s) => {
                const isCurrent = processingStep === s.step;
                const isDone = processingStep > s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-3.5 rounded-xl border transition-all ${isDone
                      ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-100"
                      : isCurrent
                        ? "bg-emerald-500/20 border-emerald-400 text-white animate-pulse"
                        : "bg-black/30 border-white/5 text-slate-500"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Step {s.step}</span>
                      <span>{isDone ? "✓" : isCurrent ? "⏳" : "○"}</span>
                    </div>
                    <div className="text-xs font-semibold text-white">{s.title}</div>
                    <p className="text-[10px] text-slate-400 mt-1">{s.desc}</p>
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
              className={`rounded-2xl border p-6 md:p-8 shadow-2xl ${urgencyBadgeStyles[result.summary.urgency].border
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
                        ? "🔥 CRITICAL EMERGENCY"
                        : result.summary.urgency === "high"
                          ? "⚠️ HIGH URGENCY"
                          : result.summary.urgency === "medium"
                            ? "ℹ️ MODERATE REVIEW"
                            : "✅ ROUTINE GUIDANCE"}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      Urgency Score: <strong className="text-white">{result.summary.urgencyScore}/100</strong>
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    {result.referral.type}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>📞</span>
                    <span>Emergency Contacts</span>
                  </button>
                  <Link
                    href="/safety"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
                  >
                    Safety Gate
                  </Link>
                </div>
              </div>

              <p className="text-sm md:text-base mt-4 text-slate-100 leading-relaxed max-w-4xl">
                {result.referral.message}
              </p>

              {result.summary.matchedSignals.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-slate-400">Signals identified:</span>
                  {result.summary.matchedSignals.map((sig) => (
                    <span key={sig} className="px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 font-mono text-[11px]">
                      {sig}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Diagnostic Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 col-span-1 md:col-span-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Synthesized Problem</div>
                <h3 className="text-lg font-bold text-white leading-snug">{result.summary.problem}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {result.reasoning.summaryReasoning}
                </p>
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-300 font-bold mb-2">Domain lens</div>
                  <div className="text-sm font-semibold text-white">
                    {domainInsightMap[analyzedDomain]?.headline || "Welbeing-focused synthesis"}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {domainInsightMap[analyzedDomain]?.emphasis || "The analysis is anchored on symptoms, physiology, and recovery pattern review."}
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 text-center flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Evaluation Confidence</div>
                <div className="my-2">
                  <span className="text-4xl font-extrabold text-emerald-400">{result.summary.confidence}%</span>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${result.summary.confidence}%` }}></div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">11-Strand Bayesian Synthesis</div>
              </div>

              <div className="glass-panel p-5 text-center flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Debral Intent</div>
                <div className="my-2">
                  <span className="text-xl font-extrabold text-amber-300 capitalize">{result.summary.intent}</span>
                  <p className="text-xs text-slate-400 mt-1">Language: {result.language.toUpperCase()}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{result.crossStrandIntersections.length} Intersections</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">What this domain is asking</div>
                <h3 className="text-lg font-bold text-white mb-3">{domainInsightMap[analyzedDomain]?.headline || "Welbeing-focused synthesis"}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {domainInsightMap[analyzedDomain]?.emphasis || "The analysis is anchored on symptoms, physiology, and recovery pattern review."}
                </p>
                <ul className="space-y-2">
                  {(domainInsightMap[analyzedDomain]?.questions || []).map((question) => (
                    <li key={question} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="mt-0.5 text-emerald-400">•</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">Response detail</div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1">Primary focus</div>
                    <div className="text-sm font-semibold text-white">{domainOptions.find((d) => d.id === analyzedDomain)?.label || "Welbeing"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1">Urgency signal</div>
                    <div className="text-sm font-semibold text-amber-300 uppercase">{result.summary.urgency}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1">Recommended next step</div>
                    <div className="text-sm text-slate-200">{result.referral.message}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Potential Root Causes & Causal Pathways */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="badge badge-safe mb-1">Causal Inference Engine</div>
                  <h3 className="text-xl font-extrabold text-white">Probabilistic Root Causes &amp; Causal Chains</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Multi-Domain Causal Mapping</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {result.causes.map((cause) => (
                  <div key={cause.name} className="p-4 rounded-xl bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{cause.name}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{cause.probability}% probability</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full" style={{ width: `${cause.probability}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{cause.evidence}</p>
                    {cause.culturalContext && (
                      <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/15 p-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Domain B context</div>
                        <p className="mt-1 text-[11px] leading-relaxed text-amber-100/80">{cause.culturalContext.interpretation}</p>
                        <p className="mt-2 text-[10px] leading-relaxed text-amber-200/70">Reflection: {cause.culturalContext.practice}</p>
                      </div>
                    )}
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 uppercase">
                      Domain: {cause.domain}
                    </span>
                  </div>
                ))}
              </div>

              {/* Visual Causal Graph */}
              {result.causalPathways.map((pathway) => (
                <div key={pathway.id} className="p-5 rounded-2xl bg-black/50 border border-emerald-500/20">
                  <h4 className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">
                    <span>⛓️</span>
                    <span>{pathway.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-5">{pathway.description}</p>

                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 overflow-x-auto pb-2">
                    {pathway.nodes.map((node, i) => (
                      <div key={node.id} className="flex-1 flex flex-col lg:flex-row items-center gap-2">
                        <div className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-left">
                          <span className="text-[9px] uppercase font-mono text-emerald-400 block mb-1">
                            Node {i + 1} &bull; {node.domain}
                          </span>
                          <span className="text-xs font-bold text-white block">{node.label}</span>
                          {node.description && <p className="text-[10px] text-slate-400 mt-1 leading-tight">{node.description}</p>}
                        </div>
                        {i < pathway.nodes.length - 1 && (
                          <div className="text-slate-600 font-bold hidden lg:block text-base">&rarr;</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Prioritized Solutions Grid */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="badge badge-safe mb-1">Targeted Interventions</div>
                  <h3 className="text-xl font-extrabold text-white">Prioritized Holistic Solutions</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Filtered by Safety Gate</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.solutions.map((sol) => {
                  const priorityStyles =
                    sol.priority === "critical"
                      ? "border-rose-500/50 bg-rose-950/30"
                      : sol.priority === "high"
                        ? "border-orange-500/50 bg-orange-950/20"
                        : sol.priority === "medium"
                          ? "border-amber-500/40 bg-amber-950/20"
                          : "border-emerald-500/40 bg-emerald-950/20";

                  return (
                    <div key={sol.id} className={`p-5 rounded-2xl border ${priorityStyles} flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-slate-200">
                            {sol.priority.toUpperCase()} PRIORITY
                          </span>
                          {sol.safetyGatePassed && (
                            <span className="badge badge-safe text-[9px]">ETM-DB Passed</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2">{sol.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{sol.description}</p>
                        {sol.culturalContext && (
                          <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/15 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Cultural reflection</div>
                            <p className="mt-1 text-[11px] leading-relaxed text-amber-100/80">{sol.culturalContext.interpretation}</p>
                            <p className="mt-2 text-[10px] leading-relaxed text-amber-200/70">Reflection: {sol.culturalContext.practice}</p>
                          </div>
                        )}
                      </div>
                      {sol.sourceRef && (
                        <div className="mt-4 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                          Evidence Citation: {sol.sourceRef}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Five-Stage Action Plan Timeline */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="badge badge-safe mb-1">Structured Timeline</div>
                  <h3 className="text-xl font-extrabold text-white">5-Stage Action Plan</h3>
                </div>
                <div className="text-xs text-slate-400">
                  <span>Mark items complete as you proceed</span>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { key: "immediate_actions", label: "Stage 1: NOW (0–24 Hours)", color: "text-rose-400 border-rose-500/40", items: result.action_plan.immediate_actions },
                  { key: "short_term", label: "Stage 2: Short-Term (3–7 Days)", color: "text-orange-400 border-orange-500/40", items: result.action_plan.short_term },
                  { key: "medium_term", label: "Stage 3: Medium-Term (1–4 Weeks)", color: "text-amber-400 border-amber-500/40", items: result.action_plan.medium_term },
                  { key: "long_term", label: "Stage 4: Long-Term (1–6 Months)", color: "text-teal-400 border-teal-500/40", items: result.action_plan.long_term },
                  { key: "ongoing", label: "Stage 5: Ongoing (6+ Months)", color: "text-emerald-400 border-emerald-500/40", items: result.action_plan.ongoing },
                ].map((stage) => (
                  <div key={stage.key} className="border-l-2 pl-4 border-slate-700">
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
                              ? "bg-emerald-950/20 border-emerald-500/30 opacity-70 line-through text-slate-400"
                              : "bg-black/40 border-white/10 hover:border-white/20 text-slate-200"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => { }}
                              className="mt-0.5 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                            />
                            <div className="flex-1 text-xs">
                              <div className="font-bold text-white">{item.title}</div>
                              <p className="text-slate-400 mt-0.5 leading-relaxed">{item.action}</p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 uppercase">
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
              <div className="p-6 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-moderate text-xs">Certified Safety Intercept</span>
                  <span className="text-xs font-mono text-rose-300">ETM-DB Pharmacopoeia Guardrail</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">
                  Potential Herb-Drug &amp; Nutrient Interactions Detected
                </h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  The Debral safety gate intercepted potential adverse biochemical interactions between traditional remedies and prescription drugs:
                </p>
                <div className="space-y-3">
                  {result.safety.herbDrugInteractions.map((hdi) => (
                    <div key={`${hdi.herb}-${hdi.drug}`} className="p-4 rounded-xl bg-black/60 border border-rose-500/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-rose-200">{hdi.herb} &times; {hdi.drug}</span>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {hdi.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{hdi.mechanism}</p>
                      <p className="text-amber-300 font-semibold mt-2">{hdi.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Cultural & Astrological Insights (Domain B Firewalled) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cultural Context */}
              <div className="glass-panel p-6 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                    Domain B &bull; Cultural Heritage Layer
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{result.cultural_context.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{result.cultural_context.traditionalHealing}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{result.cultural_context.culturalSignificance}</p>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-slate-500 leading-normal">
                  {result.cultural_context.disclaimer}
                </div>
              </div>

              {/* Astrological Context */}
              <div className="glass-panel p-6 border-l-4 border-l-violet-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-500/30">
                    Domain B &bull; Awde Negest Cosmology
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{result.astrological_context.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Constitutional Temperament: <strong className="text-violet-300">{result.astrological_context.humoralElement}</strong>
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{result.astrological_context.seasonalAdvice}</p>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-slate-500 leading-normal">
                  {result.astrological_context.disclaimer}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 md:p-8 border border-amber-500/30 bg-amber-950/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="badge badge-moderate mb-2">Unified Domain B report</div>
                  <h3 className="text-xl font-extrabold text-white">Cultural, AwudeNegest, astrology &amp; numerology layer</h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                  {result.culturalLayers?.[0]?.status || "included"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(result.culturalLayers?.[0]?.strands || ["cultural", "astrological", "awudeNegest", "numerology"]).map((strand) => (
                  <span key={strand} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-mono uppercase text-amber-200">
                    {strand}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl bg-black/25 border border-white/10 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 mb-2">Interpretation</div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {result.culturalLayers?.[0]?.interpretation || result.cultural_context.culturalSignificance}
                  </p>
                </div>
                <div className="rounded-xl bg-black/25 border border-white/10 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 mb-2">Reflective practice</div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {result.culturalLayers?.[0]?.practice || result.astrological_context.seasonalAdvice}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-amber-200/70 leading-relaxed">
                {result.culturalLayers?.[0]?.disclaimer || result.cultural_context.disclaimer}
              </p>
            </div>

            {/* 8. 11-Strand Knowledge Deep Dive Explorer */}
            <div className="glass-panel p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="badge badge-safe mb-1">Full Evidence Breakdown</div>
                  <h3 className="text-xl font-extrabold text-white">11 Knowledge Strands Deep Dive</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {Object.values(result.rawFindings).flat().length} Total Verified Findings
                </span>
              </div>

              {/* Strand Switcher Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-6 p-1.5 rounded-xl bg-black/40 border border-white/10">
                {(Object.keys(result.rawFindings) as KnowledgeStrandType[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setActiveStrandTab(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${activeStrandTab === st
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {st} ({result.rawFindings[st]?.length || 0})
                  </button>
                ))}
              </div>

              {/* Active Strand Findings */}
              <div className="space-y-3">
                {(!result.rawFindings[activeStrandTab] || result.rawFindings[activeStrandTab].length === 0) ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No specific findings triggered for the {activeStrandTab} strand in this inquiry.
                  </p>
                ) : (
                  result.rawFindings[activeStrandTab].map((finding, idx) => (
                    <div key={`${finding.name}-${idx}`} className="p-4 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white">{finding.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {Math.round(finding.relevanceScore * 100)}% relevance
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>
                      {finding.evidenceItems && finding.evidenceItems.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {finding.evidenceItems.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex gap-3 items-start p-2 rounded-lg bg-black/20 border border-white/5">
                              <img
                                src={item.imageUrl}
                                alt={item.imageAlt}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full flex-shrink-0"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                {item.caption && (
                                  <div className="text-[10px] uppercase tracking-wide text-amber-300/80 font-semibold mb-0.5">
                                    {item.caption}
                                  </div>
                                )}
                                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">{item.description}</p>
                                {item.source && (
                                  <p className="text-[10px] text-slate-500 mt-0.5">Source: {item.source}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {finding.evidence && (
                            <p className="text-[11px] text-slate-400 mt-2 font-mono leading-relaxed">
                              Evidence: {finding.evidence}
                            </p>
                          )}
                          {finding.ethiopian_context && (
                            <div className="mt-2 text-[10px] text-amber-300/90 font-medium">
                              Ethiopian Context: {Array.isArray(finding.ethiopian_context) ? finding.ethiopian_context.join(" • ") : finding.ethiopian_context}
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
                <h4 className="text-sm font-bold text-white">Save or Share Your Diagnostic Report</h4>
                <p className="text-xs text-slate-400">
                  Export machine-readable JSON or generate a printable Debral summary for your practitioner.
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
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-xs font-bold text-slate-200 transition-all flex items-center gap-2"
                >
                  <span>⬇️</span>
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/40 text-xs font-bold text-slate-200 transition-all flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print Summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Ethiopian Wisdom Diagnostic Summary",
                        text: `Diagnostic Result: ${result.summary.problem} (${result.summary.urgency.toUpperCase()} priority). Consult: ${result.referral.type}`,
                      }).catch(() => { });
                    } else {
                      navigator.clipboard.writeText(
                        `Ethiopian Wisdom Diagnostic Summary:\n${result.summary.problem}\nUrgency: ${result.summary.urgency.toUpperCase()}\nRecommendation: ${result.referral.message}`
                      );
                      alert("Diagnostic summary copied to clipboard!");
                    }
                  }}
                  className="btn-primary text-xs py-2.5 px-5"
                >
                  Share Summary
                </button>
              </div>
            </div>

            {/* Legal Disclaimers */}
            <div className="text-[11px] text-slate-500 space-y-1.5 p-4 rounded-xl bg-black/30 border border-white/5">
              <p className="font-bold text-slate-400">Official Debral Governance Notice:</p>
              {result.safety.disclaimers.map((disc, idx) => (
                <p key={idx} className="leading-relaxed">&bull; {disc}</p>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Hotlines Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel p-6 md:p-8 max-w-lg w-full border-2 border-rose-500/70 shadow-2xl shadow-rose-950">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🚨</span>
                  <h3 className="text-xl font-extrabold text-white">Ethiopian Emergency Hotlines</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                If you or someone nearby is experiencing acute chest pain, shortness of breath, severe bleeding, or loss of consciousness, contact emergency services immediately:
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { name: "EPHI Toll-Free Public Welbeing Hotline", number: "907", desc: "Ethiopian Public Welbeing Institute (24/7 National Dispatch)" },
                  { name: "Ethiopian Red Cross Ambulance", number: "991", desc: "Emergency medical transport across major cities" },
                  { name: "National Emergency Police", number: "911", desc: "Addis Ababa & Regional Emergency Response" },
                  { name: "Tikur Anbessa Hospital Emergency Desk", number: "+251-11-551-1211", desc: "Central tertiary trauma & acute care referral center" },
                ].map((hl) => (
                  <div key={hl.number} className="p-3.5 rounded-xl bg-black/60 border border-rose-500/30 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">{hl.name}</div>
                      <div className="text-[10px] text-slate-400">{hl.desc}</div>
                    </div>
                    <a
                      href={`tel:${hl.number}`}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-extrabold flex items-center gap-1"
                    >
                      <span>📞</span>
                      <span>{hl.number}</span>
                    </a>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Close Emergency Notice
              </button>
            </div>
          </div>
        )}

        {/* History Drawer Modal */}
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md h-full bg-[#080d0a] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span>🕒</span>
                    <h3 className="text-base font-bold text-white">Diagnostic Inquiry History</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHistoryDrawer(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {historyItems.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No previous inquiries saved in this session.</p>
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
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${item.urgencyLevel === "critical"
                            ? "bg-rose-950 text-rose-300"
                            : item.urgencyLevel === "high"
                              ? "bg-orange-950 text-orange-300"
                              : "bg-emerald-950 text-emerald-300"
                            }`}>
                            {item.urgencyLevel}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-white line-clamp-2 mt-1">{item.query}</p>
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
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
