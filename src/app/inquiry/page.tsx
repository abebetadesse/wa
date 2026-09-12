"use client";

import Link from "next/link";
import { useState } from "react";
import type { ParsedhealthInquiry } from "@/lib/inquiry/parser";
import type { KnowledgeRetrievalResult } from "@/lib/inquiry/knowledgeRetrieval";
import type { InquirySynthesis } from "@/lib/inquiry/solutionSynthesis";

type InquiryResult = ParsedhealthInquiry & { knowledge: KnowledgeRetrievalResult; synthesis: InquirySynthesis };

const suggestions = [
  "I have a headache after fasting",
  "I have stomach pain for 3 days",
  "I am taking warfarin and want to use a traditional herb",
  "I have difficulty breathing",
];

const symptomOptions = [
  "Headache",
  "Fever",
  "Cough",
  "Stomach pain",
  "Diarrhea",
  "Vomiting",
  "Fatigue",
  "Rash",
  "Difficulty breathing",
  "Bleeding",
];

const urgencyStyles = {
  critical: "border-rose-500/50 bg-rose-950/40 text-rose-100",
  high: "border-orange-500/50 bg-orange-950/30 text-orange-100",
  medium: "border-amber-500/50 bg-amber-950/30 text-amber-100",
  low: "border-emerald-500/40 bg-emerald-950/25 text-emerald-100",
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
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export default function InquiryPage() {
  const [mode, setMode] = useState<"text" | "voice" | "symptom">("text");
  const [query, setQuery] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);
  }

  function startVoiceInput() {
    const browserWindow = window as Window & typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not supported by this browser. You can type your concern instead.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => { setIsListening(true); setError(""); };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice input could not be captured. Check microphone permissions or type your concern instead.");
    };
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setQuery((current) => current ? `${current} ${transcript}` : transcript);
    };
    recognition.start();
  }

  async function analyze() {
    const submittedQuery = mode === "symptom"
      ? `I am experiencing: ${selectedSymptoms.join(", ")}`
      : query;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: submittedQuery }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to analyze concern.");
      setResult({ ...payload.data.inquiry, knowledge: payload.data.knowledge, synthesis: payload.data.synthesis });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to analyze concern.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container py-10">
      <div className="max-w-5xl mx-auto">
        <header className="max-w-3xl mb-8">
          <Link href="/diagnostic" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-4 hover:bg-emerald-900/80 transition-all">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>✨ Try the new 11-Strand Multi-Modal Diagnostic Portal &rarr;</span>
          </Link>
          <div className="badge badge-safe mb-3">Intelligent inquiry portal</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Describe what is concerning you</h1>
          <p className="text-slate-400 mt-3 leading-relaxed">
            Write in English or Amharic. The portal organizes symptoms, identifies explicit urgency signals, and routes you to the right next step. It does not diagnose.
          </p>
        </header>

        <section className="glass-panel p-6 md:p-8 mb-8">
          <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Inquiry input mode">
            {(["text", "voice", "symptom"] as const).map((inputMode) => (
              <button key={inputMode} type="button" onClick={() => setMode(inputMode)} className={`px-3 py-2 rounded-lg text-xs font-bold capitalize border ${mode === inputMode ? "bg-emerald-500/20 border-emerald-400 text-emerald-200" : "bg-black/30 border-white/10 text-slate-400"}`}>
                {inputMode === "text" ? "Text" : inputMode === "voice" ? "Voice" : "Symptoms"}
              </button>
            ))}
          </div>

          <label htmlFor="health-query" className="block text-sm font-bold text-white mb-2">Your concern</label>
          {mode === "symptom" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" aria-label="Common symptoms">
              {symptomOptions.map((symptom) => <button key={symptom} type="button" onClick={() => toggleSymptom(symptom)} className={`p-3 rounded-lg border text-xs text-left ${selectedSymptoms.includes(symptom) ? "bg-rose-500/15 border-rose-400/60 text-rose-100" : "bg-black/30 border-white/10 text-slate-400"}`}>{symptom}</button>)}
            </div>
          ) : (
            <textarea
              id="health-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: I have stomach pain for 3 days after meals..."
              maxLength={2000}
              rows={6}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 resize-y"
            />
          )}
          {mode === "voice" && <button type="button" onClick={startVoiceInput} className="btn-secondary mt-4 text-xs py-2.5 px-4">{isListening ? "Listening..." : "Start voice input"}</button>}
          <div className="flex flex-wrap justify-between gap-3 mt-3 text-xs text-slate-500">
            <span>{mode === "symptom" ? `${selectedSymptoms.length} symptoms selected` : `${query.length}/2000 characters`}</span>
            <span>Emergency symptoms require immediate local care.</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuery(suggestion)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:border-emerald-500/40">
                {suggestion}
              </button>
            ))}
          </div>
          <button type="button" onClick={analyze} disabled={loading || (mode === "symptom" ? selectedSymptoms.length === 0 : query.trim().length < 2)} className="btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Analyzing..." : "Analyze concern"}
          </button>
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </section>

        {result && (
          <section className="space-y-6" aria-live="polite">
            <div className={`rounded-xl border p-5 ${urgencyStyles[result.urgency.level]}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-75">Routing result</div>
                  <h2 className="text-2xl font-extrabold mt-1">{result.urgency.level} priority</h2>
                </div>
                <span className="text-3xl font-black">{result.urgency.score}/100</span>
              </div>
              <p className="text-sm mt-3 leading-relaxed">{result.urgency.recommendation}</p>
              {result.urgency.matchedSignals.length > 0 && <p className="text-xs mt-3 opacity-75">Signals matched: {result.urgency.matchedSignals.join(", ")}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="glass-panel p-5">
                <div className="text-xs uppercase tracking-wider text-emerald-400">Intent</div>
                <h3 className="text-lg font-bold text-white mt-1 capitalize">{result.intent}</h3>
                <p className="text-xs text-slate-400 mt-2">Language detected: {result.language === "am" ? "Amharic" : "English"}</p>
              </div>
              <div className="glass-panel p-5">
                <div className="text-xs uppercase tracking-wider text-amber-400">Symptoms</div>
                <p className="text-sm text-white mt-2">{result.symptoms.length ? result.symptoms.map((item) => item.value.replaceAll("_", " ")).join(", ") : "No symptom keyword detected"}</p>
              </div>
              <div className="glass-panel p-5">
                <div className="text-xs uppercase tracking-wider text-sky-400">Duration</div>
                <p className="text-sm text-white mt-2">{result.duration?.value || "Not specified"}</p>
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="badge badge-moderate mb-2">Active problem-solving</div>
              <h2 className="text-xl font-bold text-white mb-2">What may be contributing</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{result.synthesis.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.synthesis.possibleCauses.map((cause) => (
                  <div key={`${cause.strand}-${cause.title}`} className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white">{cause.title}</h3>
                      <span className="text-[10px] uppercase text-amber-300">{cause.confidence}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{cause.explanation}</p>
                    <p className="text-[10px] font-mono text-slate-600 mt-2">{cause.strand} · {cause.source}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="badge badge-safe mb-2">Holistic solutions</div>
              <h2 className="text-xl font-bold text-white mb-4">Prioritized paths forward</h2>
              <div className="space-y-3">
                {result.synthesis.solutions.map((solution) => (
                  <div key={`${solution.category}-${solution.title}`} className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-white">{solution.title}</h3>
                      <span className={`badge ${solution.priority === "high" || solution.priority === "critical" ? "badge-high" : solution.priority === "medium" ? "badge-moderate" : "badge-safe"}`}>{solution.priority} · {solution.category}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{solution.action}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">Why: {solution.rationale}</p>
                    <p className="text-xs text-amber-300 leading-relaxed mt-2">Safety: {solution.safety}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="badge badge-safe mb-2">Action timeline</div>
              <h2 className="text-xl font-bold text-white mb-4">Turn the analysis into action</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["immediate", "next24Hours", "next7Days", "ongoing"] as const).map((phase) => (
                  <div key={phase} className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <h3 className="text-sm font-bold text-emerald-300 capitalize mb-2">{phase === "next24Hours" ? "Next 24 hours" : phase === "next7Days" ? "Next 7 days" : phase}</h3>
                    <ul className="space-y-2 text-xs text-slate-300">{result.synthesis.actionPlan[phase].map((action) => <li key={action}>• {action}</li>)}</ul>
                  </div>
                ))}
              </div>
              {result.synthesis.safetyWarnings.length > 0 && <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-100">{result.synthesis.safetyWarnings.join(" ")}</div>}
              <p className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-white/10">{result.synthesis.disclaimer}</p>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recommended next steps</h2>
              <ol className="space-y-3">
                {result.nextSteps.map((step, index) => <li key={step} className="flex gap-3 text-sm text-slate-300"><span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-xs font-bold">{index + 1}</span><span>{step}</span></li>)}
              </ol>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/safety" className="btn-secondary text-xs py-2.5 px-4">Open Safety Gate</Link>
                <Link href="/intake" className="btn-primary text-xs py-2.5 px-4">Complete health intake</Link>
                {result.urgency.level === "critical" && <Link href="/emergency" className="btn-secondary text-xs py-2.5 px-4 border-rose-500/40 text-rose-200">Emergency profile</Link>}
              </div>
            </div>

            <div className="glass-panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="badge badge-safe mb-2">Multi-strand retrieval</div>
                  <h2 className="text-xl font-bold text-white">Relevant context from the existing engines</h2>
                </div>
                <span className="text-xs text-slate-500">{result.knowledge.findings.length} findings · {result.knowledge.strandsQueried.length} strands</span>
              </div>
              {result.knowledge.intersections.length > 0 && (
                <div className="mb-4 p-4 rounded-xl bg-sky-950/20 border border-sky-500/20">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-2">Cross-strand intersections</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.knowledge.intersections.map((intersection) => <li key={intersection}>{intersection}</li>)}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.knowledge.findings.map((finding) => (
                  <div key={`${finding.strand}-${finding.title}`} className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400">{finding.strand}</span>
                      <span className="text-[10px] text-slate-500">{Math.round(finding.relevance * 100)}% relevant</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{finding.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">{finding.detail}</p>
                    {finding.safetyNote && <p className="text-xs text-amber-300 mt-2">{finding.safetyNote}</p>}
                    <p className="text-[10px] font-mono text-slate-600 mt-3">Source: {finding.source}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-white/10">{result.knowledge.disclaimer}</p>
            </div>

            <p className="text-xs text-slate-500 border-t border-white/10 pt-5 leading-relaxed">{result.disclaimer}</p>
          </section>
        )}
      </div>
    </div>
  );
}
