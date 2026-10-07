"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mic, MicOff, Keyboard } from "lucide-react";
import type { CareerStage } from "@/lib/cultural/careerTimingEngine";
import type { CareerQuestion } from "@/lib/case-workflow/careerQuestionEngine";
import type { CareerSafetyAnswers } from "@/lib/case-workflow/careerSafetyScreen";
import { useLiveGematria } from "@/hooks/useLiveGematria";
import { useGeezVoiceInput } from "@/hooks/useGeezVoiceInput";
import { useDynamicFollowUps } from "@/hooks/useDynamicFollowUps";
import { AnimatedGematriaPreview } from "@/components/cultural/AnimatedGematriaPreview";
import { AmharicKeyboardModal } from "@/components/cultural/AmharicKeyboardModal";
import VoiceCaptureConsent from "@/components/case/VoiceCaptureConsent";

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════

type Stage =
  | "safety_screen"
  | "name_gematria"
  | "questions"
  | "timing_reveal"
  | "expert_status"
  | "report_preview"
  | "consult_book"
  | "crisis_route";

interface TimingWindow {
  dateRange: { start: string; end: string };
  awdeCircle: string;
  score: number;
  label: string;
  actionRecommendation: string;
  ritualNote?: string;
  warningNote?: string;
}

interface TimingAnalysis {
  numerology: {
    nameSum: number;
    motherSum: number;
    totalSum: number;
    lifePathNumber: number;
    businessNumber: number;
    careerElement: string;
    careerElementAmharic: string;
    luckyDays: string[];
    luckyColors: string[];
    avoidDays: string[];
    narrativeSummary: string;
  };
  currentWindow: TimingWindow;
  nextThreeWindows: TimingWindow[];
  recommendedActionMonth: string;
  bestDayOfWeek: string;
  bestDayAmharic: string;
  lunarPhaseNote: string;
}

interface ExpertAssignment {
  advisorName: string;
  advisorNameAmharic?: string;
  advisorTitle: string;
  advisorRole: string;
  estimatedReviewMinutes: number;
  reviewWindowEnd: string;
  consultationFeeETB: number;
  consultationFormats: string[];
  rating: number;
  bioQuote: string;
  avatarInitials: string;
}

// ════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════

export default function CareerCasePage() {
  const router = useRouter();

  // ── Stage State ────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>("safety_screen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Safety Screen ─────────────────────────────────────────
  const [safetyAnswers, setSafetyAnswers] = useState<CareerSafetyAnswers>({
    basic_needs: "yes_comfortable",
    self_harm: "no",
    financial_pressure: "no",
  });
  const [crisisContent, setCrisisContent] = useState<null | { title: string; message: string; hotlines: { name: string; number: string }[]; safetyPlanSteps: string[] }>(null);
  const [safetyFlag, setSafetyFlag] = useState<null | { reason: string; priority: string }>(null);

  // ── Name / Gematria ───────────────────────────────────────
  const [sessionId, setSessionId] = useState("");
  const [geezName, setGeezName] = useState("");
  const [motherGeezName, setMotherGeezName] = useState("");
  const [activeNameInput, setActiveNameInput] = useState<"name" | "mother">("name");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Real gematria via shared hook (replaces approximate char-code computation)
  const gematriaLive = useLiveGematria(geezName, motherGeezName);

  // Voice input for Ge'ez names
  const { isListening, startListening, stopListening, error: voiceError, consentPending, acceptVoiceConsent, declineVoiceConsent } = useGeezVoiceInput((text) => {
    const clean = text.trim();
    if (!clean) return;
    if (activeNameInput === "name") setGeezName(clean);
    else setMotherGeezName(clean);
  });

  const handleKeyboardInsert = (val: string) => {
    if (val === "__backspace__") {
      if (activeNameInput === "name") setGeezName((p) => p.slice(0, -1));
      else setMotherGeezName((p) => p.slice(0, -1));
      return;
    }
    if (activeNameInput === "name") setGeezName((p) => p + val);
    else setMotherGeezName((p) => p + val);
  };

  // ── Questions ─────────────────────────────────────────────
  const [careerStage, setCareerStage] = useState<CareerStage>("exploring");
  const [questions, setQuestions] = useState<CareerQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isReportUnlocked, setIsReportUnlocked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe_birr" | "chapa">("telebirr");
  const [paymentPhone, setPaymentPhone] = useState("0911234567");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [financialDisclaimer, setFinancialDisclaimer] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // ── Timing / Analysis ─────────────────────────────────────
  const [timingAnalysis, setTimingAnalysis] = useState<TimingAnalysis | null>(null);
  const [expertAssignment, setExpertAssignment] = useState<ExpertAssignment | null>(null);
  const [reportId, setReportId] = useState("");
  const [culturalIntegration, setCulturalIntegration] = useState<{ numerologySummary: string; auspiciousActionNote: string; blessingRitual?: string; communityAngle: string } | null>(null);

  // ── Consultation ──────────────────────────────────────────
  const [selectedFormat, setSelectedFormat] = useState<"video" | "voice" | "chat" | "in_person">("video");
  const [bookingResult, setBookingResult] = useState<{ bookingId: string; meetingLink?: string; preparationNotes: string[] } | null>(null);

  // ── Refs ──────────────────────────────────────────────────
  const stageRef = useRef<HTMLDivElement>(null);

  // Scroll to top on stage change
  useEffect(() => {
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stage]);

  // gematriaLive is now computed by useLiveGematria hook above (real engine, not approximate).

  // ════════════════════════════════════════════════════════════
  // Handlers
  // ════════════════════════════════════════════════════════════

  const handleSafetySubmit = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/case/career/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ safetyAnswers }),
      });
      const data = await res.json() as { success: boolean; action: string; sessionId: string; crisisContent?: typeof crisisContent; expertFlag?: typeof safetyFlag; error?: string; questions?: CareerQuestion[] };
      if (!data.success) throw new Error(data.error ?? "Failed to start case");

      setSessionId(data.sessionId);
      if (data.action === "crisis_route") {
        setCrisisContent(data.crisisContent ?? null);
        setStage("crisis_route");
      } else {
        if (data.expertFlag) setSafetyFlag(data.expertFlag);
        if (data.questions) setQuestions(data.questions);
        setStage("name_gematria");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start case");
    } finally {
      setLoading(false);
    }
  }, [safetyAnswers]);

  const handleNamesSubmit = useCallback(async () => {
    if (!geezName.trim() || !motherGeezName.trim()) {
      setError("Please enter both your Ge'ez name and your mother's name.");
      return;
    }
    setError("");
    setAnswers((prev) => ({ ...prev, career_geez_name: geezName, career_mother_geez_name: motherGeezName }));

    // Load stage-specific questions
    setLoading(true);
    try {
      const res = await fetch("/api/case/career/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, careerStage: "exploring", answers: { career_geez_name: geezName, career_mother_geez_name: motherGeezName } }),
      });
      const data = await res.json() as { success: boolean; questions?: CareerQuestion[]; financialDisclaimer?: string; error?: string };
      if (data.questions) setQuestions(data.questions);
      if (data.financialDisclaimer) setFinancialDisclaimer(data.financialDisclaimer);
    } catch {
      // Use cached questions from start call
    } finally {
      setLoading(false);
    }

    setCurrentQuestionIdx(0);
    setStage("questions");
  }, [geezName, motherGeezName, sessionId]);

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      // Auto-detect career stage change
      if (questionId === "career_stage") {
        setCareerStage(value as CareerStage);
        // Re-fetch questions for new stage
        fetch("/api/case/career/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, careerStage: value, answers: next }),
        })
          .then((r) => r.json())
          .then((d: { questions?: CareerQuestion[]; financialDisclaimer?: string }) => {
            if (d.questions) setQuestions(d.questions);
            if (d.financialDisclaimer) setFinancialDisclaimer(d.financialDisclaimer);
          })
          .catch(() => {});
      }
      return next;
    });
  }, [sessionId]);

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const allAnswers = { ...answers, career_geez_name: geezName, career_mother_geez_name: motherGeezName };
      const res = await fetch("/api/case/career/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: allAnswers }),
      });
      const data = await res.json() as {
        success: boolean;
        timingAnalysis?: TimingAnalysis;
        expertAssignment?: ExpertAssignment;
        reportId?: string;
        culturalIntegration?: typeof culturalIntegration;
        error?: string;
        code?: string;
      };
      if (!data.success) throw new Error(data.error ?? "Analysis failed");
      setTimingAnalysis(data.timingAnalysis ?? null);
      setExpertAssignment(data.expertAssignment ?? null);
      setReportId(data.reportId ?? "");
      setCulturalIntegration(data.culturalIntegration ?? null);
      setStage("timing_reveal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [answers, geezName, motherGeezName, sessionId]);

  const handleBookConsult = useCallback(async () => {
    if (!expertAssignment) return;
    setLoading(true);
    try {
      const res = await fetch("/api/case/career/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: sessionId,
          advisorId: "ca-001",
          format: selectedFormat,
          preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          feeETB: expertAssignment.consultationFeeETB,
        }),
      });
      const data = await res.json() as { success: boolean; bookingId?: string; meetingLink?: string; preparationNotes?: string[] };
      if (data.success) {
        setBookingResult({ bookingId: data.bookingId ?? "", meetingLink: data.meetingLink, preparationNotes: data.preparationNotes ?? [] });
        setStage("consult_book");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }, [expertAssignment, selectedFormat, sessionId]);

  const handleConfirmPayment = useCallback(async () => {
    setIsProcessingPayment(true);
    setPaymentError("");
    try {
      if (!paymentPhone.trim()) {
        throw new Error("Please enter a valid mobile number or account.");
      }
      // Simulated instant payment settlement
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsReportUnlocked(true);
      setShowPayment(false);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment processing failed");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [paymentPhone]);

  // ════════════════════════════════════════════════════════════
  // Helpers
  // ════════════════════════════════════════════════════════════

  const currentQuestion = questions[currentQuestionIdx];
  const currentAnswerText = currentQuestion ? (answers[currentQuestion.id] ?? "") : "";

  // Dynamic AI follow-ups grounded in user reflections & live gematria
  const { followUps, isLoading: followUpLoading, crisisFlag } = useDynamicFollowUps(
    currentQuestion?.id ?? "",
    currentQuestion?.type === "textarea" ? currentAnswerText : "",
    {
      nameGeez: geezName,
      zodiac: gematriaLive.zodiac,
      awdeCircle: gematriaLive.awdeCircle,
      talismanic: gematriaLive.talismanic,
    },
    answers
  );

  const isLastQuestion = currentQuestionIdx >= questions.length - 1;
  const progressPct = questions.length > 0 ? Math.round(((currentQuestionIdx + 1) / questions.length) * 100) : 0;

  // ════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════

  return (
    <div ref={stageRef} className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/case" className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5">
            ← Case Domains
          </Link>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-zinc-200 tracking-wide">Career &amp; Business</span>
          </div>
          <div className="text-xs text-zinc-500 font-mono hidden sm:block">
            {stage.replace(/_/g, " ").toUpperCase()}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ═══════════════════════════════════════════════════
            STAGE: CRISIS ROUTE
        ═══════════════════════════════════════════════════ */}
        {stage === "crisis_route" && crisisContent && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-8 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🆘</span>
                <h1 className="text-2xl font-bold text-red-300">{crisisContent.title}</h1>
              </div>
              <p className="text-zinc-300 leading-relaxed">{crisisContent.message}</p>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-red-400 uppercase tracking-widest">Emergency Contacts</h2>
                {crisisContent.hotlines.map((h) => (
                  <a
                    key={h.number}
                    href={`tel:${h.number}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-red-900/40 border border-red-500/30 hover:bg-red-900/60 transition-colors group"
                  >
                    <span className="font-medium text-zinc-200">{h.name}</span>
                    <span className="text-red-300 font-mono text-lg font-bold group-hover:scale-105 transition-transform">{h.number}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Steps you can take now</h2>
                {crisisContent.safetyPlanSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="text-red-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
              When you feel ready, you can{" "}
              <button onClick={() => setStage("safety_screen")} className="text-zinc-300 underline hover:text-white">
                return to the beginning
              </button>
              .
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE: SAFETY SCREEN
        ═══════════════════════════════════════════════════ */}
        {stage === "safety_screen" && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="text-5xl">↗</div>
              <h1 className="text-3xl font-bold tracking-tight">Career &amp; Business Guidance</h1>
              <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">
                Before we begin, we ask three brief questions to make sure this is the right moment
                to proceed and to ensure you have the support you need.
              </p>
            </div>

            {safetyFlag && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex gap-3 text-sm text-amber-300">
                <span>⚠️</span>
                <span>{safetyFlag.reason}</span>
              </div>
            )}

            <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
              {/* Q1: Basic needs */}
              <div className="space-y-3">
                <label className="block font-medium text-zinc-200">
                  Are your basic needs — food, shelter, safety — currently being met?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { value: "yes_comfortable", label: "Yes, comfortably" },
                    { value: "yes_difficult", label: "Yes, but with difficulty" },
                    { value: "no", label: "No — I am struggling" },
                    { value: "prefer_not", label: "Prefer not to answer" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSafetyAnswers((prev) => ({ ...prev, basic_needs: opt.value as CareerSafetyAnswers["basic_needs"] }))}
                      className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${safetyAnswers.basic_needs === opt.value ? "border-blue-500 bg-blue-500/20 text-blue-200" : "border-zinc-700 hover:border-zinc-500 text-zinc-300"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Self-harm */}
              <div className="space-y-3">
                <label className="block font-medium text-zinc-200">
                  Are you currently having thoughts of harming yourself?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { value: "no", label: "No" },
                    { value: "occasionally", label: "Occasionally" },
                    { value: "frequently", label: "Frequently" },
                    { value: "prefer_not", label: "Prefer not to answer" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSafetyAnswers((prev) => ({ ...prev, self_harm: opt.value as CareerSafetyAnswers["self_harm"] }))}
                      className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${safetyAnswers.self_harm === opt.value ? "border-blue-500 bg-blue-500/20 text-blue-200" : "border-zinc-700 hover:border-zinc-500 text-zinc-300"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: External pressure */}
              <div className="space-y-3">
                <label className="block font-medium text-zinc-200">
                  Are you being pressured by someone else to make a financial or business decision right now?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                    { value: "prefer_not", label: "Prefer not to say" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSafetyAnswers((prev) => ({ ...prev, financial_pressure: opt.value as CareerSafetyAnswers["financial_pressure"] }))}
                      className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${safetyAnswers.financial_pressure === opt.value ? "border-blue-500 bg-blue-500/20 text-blue-200" : "border-zinc-700 hover:border-zinc-500 text-zinc-300"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="text-sm text-red-400 text-center">{error}</div>}

            <button
              onClick={handleSafetySubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold text-white text-lg transition-all shadow-lg shadow-blue-900/30"
            >
              {loading ? "Starting…" : "Continue →"}
            </button>

            <p className="text-center text-xs text-zinc-500 leading-relaxed">
              Your answers are private and are used only to ensure you receive the right support.
              Nothing here constitutes financial or investment advice.
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE: NAME / GEMATRIA
        ═══════════════════════════════════════════════════ */}
        {stage === "name_gematria" && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold font-mono text-blue-400">
                {gematriaLive.isValid
                  ? `${gematriaLive.nameSubtotal} + ${gematriaLive.motherSubtotal} = ${gematriaLive.totalSum}`
                  : "· · ·"}
              </div>
              <h2 className="text-2xl font-bold">Your Career Numerology</h2>
              <p className="text-zinc-400 text-sm">
                Enter your Ge'ez name and your mother&apos;s name to calculate your career timing number (Abushakir gematria).
                The numbers update live as you type.
              </p>
            </div>

            {/* Shared toolbar: keyboard + voice */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  isListening
                    ? "border-red-500/60 bg-red-950/30 text-red-300 animate-pulse"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? "Stop" : "Voice"}
              </button>
              <button
                type="button"
                onClick={() => setIsKeyboardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-900/40 transition-all"
              >
                <Keyboard className="w-3.5 h-3.5" />
                Ge'ez Keyboard
              </button>
            </div>

            {consentPending && <VoiceCaptureConsent onAccept={acceptVoiceConsent} onDecline={declineVoiceConsent} />}
            {voiceError && (
              <div className="text-xs text-amber-400 text-center">{voiceError}</div>
            )}

            <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Your Ge'ez Name <span className="text-zinc-500">(ሙሉ ስምዎ)</span>
                </label>
                <input
                  type="text"
                  value={geezName}
                  onChange={(e) => { setGeezName(e.target.value); setActiveNameInput("name"); }}
                  onFocus={() => setActiveNameInput("name")}
                  placeholder="e.g. ሰሎሞን"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none text-xl placeholder:text-zinc-600 transition-colors"
                  dir="auto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Mother&apos;s Ge'ez Name <span className="text-zinc-500">(የእናትዎ ስም)</span>
                </label>
                <input
                  type="text"
                  value={motherGeezName}
                  onChange={(e) => { setMotherGeezName(e.target.value); setActiveNameInput("mother"); }}
                  onFocus={() => setActiveNameInput("mother")}
                  placeholder="e.g. ማርያም"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none text-xl placeholder:text-zinc-600 transition-colors"
                  dir="auto"
                />
              </div>

              {/* Live gematria preview (shared AnimatedGematriaPreview, same as spiritual step-1) */}
              <div className="pt-2">
                <AnimatedGematriaPreview state={gematriaLive} />
              </div>
            </div>

            {error && <div className="text-sm text-red-400 text-center">{error}</div>}

            <button
              onClick={handleNamesSubmit}
              disabled={loading || !geezName.trim() || !motherGeezName.trim()}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold text-white text-lg transition-all"
            >
              {loading ? "Loading questions…" : "Continue to Questions →"}
            </button>

            {/* Amharic keyboard modal */}
            <AmharicKeyboardModal
              isOpen={isKeyboardOpen}
              onClose={() => setIsKeyboardOpen(false)}
              onInsert={handleKeyboardInsert}
              context="career"
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE: QUESTIONS
        ═══════════════════════════════════════════════════ */}
        {stage === "questions" && currentQuestion && (
          <div className="space-y-8">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Financial disclaimer banner */}
            {financialDisclaimer && showDisclaimer && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex gap-3 text-sm text-amber-300">
                <span>⚠️</span>
                <span>{financialDisclaimer}</span>
                <button onClick={() => setShowDisclaimer(false)} className="ml-auto text-amber-400 hover:text-amber-200 text-xs">✕</button>
              </div>
            )}

            {/* Crisis Alert Banner if distress signals are detected in reflections */}
            {crisisFlag && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-4 space-y-2 text-sm text-red-200">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <span>🚨</span>
                  <span>Distress or Acute Pressure Detected</span>
                </div>
                <p className="text-xs text-red-200 leading-relaxed">
                  Your safety and wellbeing are paramount. If you are experiencing acute financial or emotional distress, confidential support is available 24/7.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCrisisContent({
                        title: "Support Resources Available",
                        message: "We detected indications of acute distress or pressure in your response. Professional and confidential support is available.",
                        hotlines: [
                          { name: "Ethiopian Mental Health Hotline", number: "952" },
                          { name: "National Emergency Helpline", number: "911" },
                        ],
                        safetyPlanSteps: [
                          "Step away from high-stakes decisions and rest in a safe environment.",
                          "Speak with a trusted family member, elder, or counselor.",
                          "Contact a certified professional before committing financial resources.",
                        ],
                      });
                      setStage("crisis_route");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                  >
                    View Emergency Support Resources →
                  </button>
                </div>
              </div>
            )}

            {/* Safety note */}
            {currentQuestion.safetyNote && currentQuestion.safetyNote !== "SAFETY_SCREEN_TRIGGER" && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-3 text-sm text-blue-300 flex gap-2">
                <span>🔒</span>
                <span>{currentQuestion.safetyNote}</span>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{careerStage.replace(/_/g, " ")}</p>
                <h2 className="text-xl font-semibold text-zinc-100">{currentQuestion.text}</h2>
                {currentQuestion.textAmharic && (
                  <p className="text-sm text-zinc-500" dir="auto">{currentQuestion.textAmharic}</p>
                )}
                {currentQuestion.hint && (
                  <p className="text-xs text-zinc-500 italic mt-1">{currentQuestion.hint}</p>
                )}
              </div>

              {/* Text / Textarea */}
              {(currentQuestion.type === "text" || currentQuestion.type === "name_geez" || currentQuestion.type === "textarea") && (
                currentQuestion.type === "textarea" ? (
                  <textarea
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none resize-none placeholder:text-zinc-600 transition-colors"
                    dir="auto"
                  />
                ) : (
                  <input
                    type="text"
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600 transition-colors text-lg"
                    dir="auto"
                  />
                )
              )}

              {/* Number */}
              {currentQuestion.type === "number" && (
                <input
                  type="number"
                  value={answers[currentQuestion.id] ?? ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder={currentQuestion.placeholder ?? "0"}
                  min={0}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none placeholder:text-zinc-600 transition-colors text-lg"
                />
              )}

              {/* Select */}
              {(currentQuestion.type === "select" || currentQuestion.type === "radio") && currentQuestion.options && (
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((opt) => {
                    const val = typeof opt === "string" ? opt : opt.value;
                    const label = typeof opt === "string" ? opt : opt.label;
                    const labelAm = typeof opt === "object" ? opt.labelAmharic : undefined;
                    const isSelected = answers[currentQuestion.id] === val;
                    return (
                      <button
                        key={val}
                        onClick={() => {
                          handleAnswerChange(currentQuestion.id, val);
                          if (currentQuestion.financialDisclaimerRequired) setShowDisclaimer(true);
                        }}
                        className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${isSelected ? "border-blue-500 bg-blue-500/20 text-blue-200" : "border-zinc-700 hover:border-zinc-500 text-zinc-300"}`}
                      >
                        <span>{label}</span>
                        {labelAm && <span className="block text-xs opacity-60 mt-0.5" dir="auto">{labelAm}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Checkbox */}
              {currentQuestion.type === "checkbox" && currentQuestion.options && (
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((opt) => {
                    const val = typeof opt === "string" ? opt : opt.value;
                    const label = typeof opt === "string" ? opt : opt.label;
                    const current = (answers[currentQuestion.id] ?? "").split(",").filter(Boolean);
                    const isChecked = current.includes(val);
                    return (
                      <button
                        key={val}
                        onClick={() => {
                          const next = isChecked ? current.filter((v) => v !== val) : [...current, val];
                          handleAnswerChange(currentQuestion.id, next.join(","));
                        }}
                        className={`px-4 py-3 rounded-xl text-sm text-left border flex items-center gap-3 transition-all ${isChecked ? "border-blue-500 bg-blue-500/20 text-blue-200" : "border-zinc-700 hover:border-zinc-500 text-zinc-300"}`}
                      >
                        <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${isChecked ? "bg-blue-500 border-blue-500" : "border-zinc-600"}`}>
                          {isChecked ? "✓" : ""}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Slider */}
              {currentQuestion.type === "slider" && (
                <div className="space-y-3">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={answers[currentQuestion.id] ?? "5"}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>1 — Not ready</span>
                    <span className="text-blue-300 font-bold text-sm">{answers[currentQuestion.id] ?? "5"}</span>
                    <span>10 — Fully ready</span>
                  </div>
                </div>
              )}

              {/* Dynamic Follow-Ups from Wisdom Engine */}
              {followUpLoading && (
                <div className="flex items-center gap-2 text-xs text-blue-400 py-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing tailored follow-up based on your response...</span>
                </div>
              )}

              {followUps.length > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                      Tailored Follow-Up Question
                    </span>
                    <span className="text-[11px] text-zinc-400">Contextual Reflection</span>
                  </div>
                  {followUps.map((fu) => (
                    <div key={fu.id} className="space-y-2">
                      <label className="text-sm font-medium text-zinc-200 block">
                        {fu.text}
                      </label>
                      {fu.textAmharic && (
                        <p className="text-xs text-zinc-400" dir="auto">{fu.textAmharic}</p>
                      )}
                      <textarea
                        rows={3}
                        value={answers[fu.id] ?? ""}
                        onChange={(e) => handleAnswerChange(fu.id, e.target.value)}
                        placeholder="Add deeper reflection..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800/90 border border-zinc-700 text-sm text-zinc-200 focus:border-blue-400 outline-none resize-none"
                        dir="auto"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
                disabled={currentQuestionIdx === 0}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 disabled:opacity-30 transition-all"
              >
                ← Back
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleAnalyze}
                  disabled={loading || (!answers[currentQuestion.id] && currentQuestion.required)}
                  className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold text-white transition-all"
                >
                  {loading ? "Analysing…" : "Analyse My Case →"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIdx((i) => i + 1)}
                  disabled={!answers[currentQuestion.id] && currentQuestion.required}
                  className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold text-white transition-all"
                >
                  Next →
                </button>
              )}
            </div>

            {error && <div className="text-sm text-red-400 text-center">{error}</div>}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE: TIMING REVEAL
        ═══════════════════════════════════════════════════ */}
        {stage === "timing_reveal" && timingAnalysis && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Traditional Timing Reflection</h2>
              <p className="text-zinc-400 text-sm">A symbolic reading from Ge'ez name traditions and Awde Negest. This is cultural reflection, not a forecast or a guide for career or financial decisions.</p>
            </div>

            {/* Numerology Card */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Traditional Element Association</p>
                  <p className="text-xl font-bold text-blue-200">{timingAnalysis.numerology.careerElement}</p>
                  <p className="text-sm text-zinc-400" dir="auto">{timingAnalysis.numerology.careerElementAmharic}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Symbolic Number</p>
                  <p className="text-4xl font-bold font-mono text-blue-300">{timingAnalysis.numerology.lifePathNumber}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{timingAnalysis.numerology.narrativeSummary}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Traditional Day Associations</p>
                  <p className="text-zinc-200">{timingAnalysis.numerology.luckyDays.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Traditional Color Associations</p>
                  <p className="text-zinc-200">{timingAnalysis.numerology.luckyColors.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* Current Window */}
            <div className="rounded-2xl p-6 space-y-3 border border-zinc-700 bg-zinc-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current Symbolic Cycle</p>
                  <p className="text-sm text-zinc-300">{timingAnalysis.currentWindow.dateRange.start} → {timingAnalysis.currentWindow.dateRange.end}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-zinc-300 bg-zinc-800">
                  Traditional cycle
                </span>
              </div>
              <p className="text-sm text-zinc-300">This cycle label is part of a traditional symbolic reading; it does not indicate whether or when to take career or financial action.</p>
              {timingAnalysis.currentWindow.ritualNote && (
                <div className="rounded-xl bg-amber-900/20 border border-amber-600/20 p-3 text-sm text-amber-200">
                  ✨ {timingAnalysis.currentWindow.ritualNote}
                </div>
              )}
            </div>

            {/* Next 3 Windows */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Other Symbolic Cycles</h3>
              {timingAnalysis.nextThreeWindows.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                  <div>
                    <p className="text-sm text-zinc-200">{w.dateRange.start} → {w.dateRange.end}</p>
                    <p className="text-xs text-zinc-500">Awde Negest cycle · {w.awdeCircle}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-xs text-zinc-300 bg-zinc-800">Traditional cycle</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cultural Integration */}
            {culturalIntegration && (
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/30 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Community &amp; Cultural Angle</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{culturalIntegration.communityAngle}</p>
              </div>
            )}

            <button
              onClick={() => setStage("expert_status")}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-lg transition-all"
            >
              See Expert Review Status →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE: EXPERT STATUS
        ═══════════════════════════════════════════════════ */}
        {stage === "expert_status" && expertAssignment && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Expert Review Assigned</h2>
              <p className="text-zinc-400 text-sm">A verified advisor has been matched to your case</p>
            </div>

            <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white">
                  {expertAssignment.avatarInitials}
                </div>
                <div>
                  <p className="font-semibold text-zinc-100 text-lg">{expertAssignment.advisorName}</p>
                  {expertAssignment.advisorNameAmharic && (
                    <p className="text-sm text-zinc-400" dir="auto">{expertAssignment.advisorNameAmharic}</p>
                  )}
                  <p className="text-xs text-blue-400">{expertAssignment.advisorTitle}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-amber-400 font-bold">{expertAssignment.rating}</p>
                  <p className="text-xs text-zinc-500">rating</p>
                </div>
              </div>

              <blockquote className="text-sm italic text-zinc-400 border-l-2 border-blue-500/40 pl-4">
                &ldquo;{expertAssignment.bioQuote}&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-zinc-800/50 p-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Est. Review Time</p>
                  <p className="text-zinc-200 font-semibold">{expertAssignment.estimatedReviewMinutes} minutes</p>
                </div>
                <div className="rounded-xl bg-zinc-800/50 p-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Review Window</p>
                  <p className="text-zinc-200 font-semibold text-xs">{new Date(expertAssignment.reviewWindowEnd).toLocaleString()}</p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Review in progress</span>
                  <span>~{expertAssignment.estimatedReviewMinutes} min remaining</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full w-2/5 bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStage("report_preview")}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-lg transition-all"
            >
              Preview Report →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE: REPORT PREVIEW
        ═══════════════════════════════════════════════════ */}
        {stage === "report_preview" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Your Career Report</h2>
              <p className="text-zinc-500 text-sm font-mono">Case ID: {reportId.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* TOC */}
            <div className="space-y-2">
              {[
                { label: "Traditional Timing Reflection", locked: false, icon: "🔢" },
                { label: "Vocation, Identity & Community", locked: !isReportUnlocked, icon: "🌐" },
                { label: "Optional Spiritual Reflection", locked: !isReportUnlocked, icon: "✨" },
                { label: "Cultural Interpretation", locked: !isReportUnlocked, icon: "🪶" },
              ].map((section) => (
                <div
                  key={section.label}
                  className={`flex items-center justify-between p-4 rounded-xl border ${section.locked ? "border-zinc-800 bg-zinc-900/30 opacity-60" : "border-zinc-700 bg-zinc-900/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <span>{section.icon}</span>
                    <span className="text-sm font-medium text-zinc-200">{section.label}</span>
                  </div>
                  <span className={`text-xs ${section.locked ? "text-zinc-500" : "text-emerald-400 font-medium"}`}>
                    {section.locked ? "🔒 Locked" : "✓ Available"}
                  </span>
                </div>
              ))}
            </div>

            {/* Scope disclaimer */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 text-xs text-amber-300 leading-relaxed">
              This report contains optional spiritual and cultural reflection only. It does not provide career, business, financial, scientific, or predictive advice.
            </div>

            {/* Unlocked Full Sections */}
            {isReportUnlocked ? (
              <div className="space-y-6 pt-2">
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex items-center justify-between text-emerald-300 text-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>✓</span>
                    <span>Cultural Reflection Unlocked</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400/80">Verified Access</span>
                </div>

                {/* Vocation and community reflection */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <h3 className="text-lg font-semibold text-zinc-100">Vocation, Identity &amp; Community</h3>
                  </div>
                  <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
                    <p>Work and vocation may be reflected on through community, identity, service, and spiritual values. Traditions and personal interpretations differ.</p>
                    <p>Consider which of these themes, if any, resonate with your own beliefs and experience. They do not prescribe a career or business choice.</p>
                  </div>
                </div>

                {/* Spiritual interpretation */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👤</span>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100">Cultural Interpretation</h3>
                      <p className="text-xs text-blue-400">A symbolic reading, not a professional recommendation</p>
                    </div>
                  </div>
                  <blockquote className="text-sm italic text-zinc-300 border-l-2 border-blue-500/50 pl-4 py-1">
                    &ldquo;The name and number associations shown here belong to a traditional symbolic framework. You may use them as prompts to reflect on identity, values, and meaning; they do not establish a person&apos;s abilities or predict career outcomes.&rdquo;
                  </blockquote>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Meanings differ between practitioners and communities. Keep only interpretations that are consistent with your own beliefs and experience.
                  </p>
                </div>

                {/* Section 3: Blessing Ritual for Career Launch */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <h3 className="text-lg font-semibold text-zinc-100">Traditional Blessing Ritual (ምርቃት)</h3>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
                      <p className="font-medium text-amber-200 text-xs uppercase tracking-wider mb-1">Optional personal reflection</p>
                      <p className="text-xs text-zinc-400">If prayer, quiet reflection, or another practice belongs to your own tradition, you may choose to include it in a way that feels meaningful to you.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
                      <p className="font-medium text-amber-200 text-xs uppercase tracking-wider mb-1">Community and tradition</p>
                      <p className="text-xs text-zinc-400">Some people find meaning in conversation, prayer, or a coffee ceremony with trusted community members. Participation is entirely optional.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
                      <p className="font-medium text-amber-200 text-xs uppercase tracking-wider mb-1">Personal meaning</p>
                      <p className="text-xs text-zinc-400">Practices vary by faith and community. Choose only what aligns with your beliefs; no ritual guarantees or predicts a career or financial outcome.</p>
                    </div>
                  </div>
                </div>

                {/* Tradition note */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪶</span>
                    <h3 className="text-lg font-semibold text-zinc-100">Traditions Are Diverse</h3>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Ethiopian cultural and spiritual traditions are diverse and personal. This reflection is not a substitute for your own community&apos;s interpretation, and it does not offer practical career or financial guidance.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 text-sm font-medium transition-all"
                  >
                    Print / Save Report (PDF)
                  </button>
                  <button
                    onClick={() => setStage("consult_book")}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
                  >
                    Book Advisor Consultation →
                  </button>
                </div>
              </div>
            ) : (
              /* Unlock CTA */
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-6 text-center space-y-4">
                <p className="text-zinc-300 text-sm">
                  Unlock the extended cultural reflection for <span className="font-bold text-blue-300">{expertAssignment?.consultationFeeETB ?? 500} ETB</span>.
                </p>
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all shadow-lg shadow-blue-900/30"
                >
                  Unlock Full Report
                </button>
                <p className="text-xs text-zinc-500">or</p>
                <button
                  onClick={() => setStage("consult_book")}
                  className="w-full py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 transition-all text-sm"
                >
                  Book a 30-minute consultation instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            STAGE: CONSULT BOOKING
        ═══════════════════════════════════════════════════ */}
        {stage === "consult_book" && !bookingResult && expertAssignment && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Book a Cultural Reflection Consultation</h2>
              <p className="text-zinc-400 text-sm">30 minutes with {expertAssignment.advisorName}</p>
              <p className="text-xs text-zinc-500">This consultation is limited to spiritual and cultural reflection, not practical career, financial, or scientific advice.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-300">Choose format</label>
              <div className="grid grid-cols-2 gap-3">
                {(expertAssignment.consultationFormats as ("video" | "voice" | "chat" | "in_person")[]).map((fmt) => {
                  const icons: Record<string, string> = { video: "🎥", voice: "📞", chat: "💬", in_person: "🤝" };
                  const labels: Record<string, string> = { video: "Video Call", voice: "Voice Call", chat: "Chat", in_person: "In Person" };
                  return (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`p-4 rounded-xl border text-sm flex items-center gap-2 transition-all ${selectedFormat === fmt ? "border-blue-500 bg-blue-500/20 text-blue-200" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"}`}
                    >
                      <span>{icons[fmt]}</span>
                      <span>{labels[fmt]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>Duration</span><span>30 minutes</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Advisor</span><span>{expertAssignment.advisorName}</span>
              </div>
              <div className="flex justify-between text-zinc-100 font-semibold border-t border-zinc-700 pt-2 mt-2">
                <span>Fee</span><span>{expertAssignment.consultationFeeETB} ETB</span>
              </div>
            </div>

            <button
              onClick={handleBookConsult}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold text-white text-lg transition-all"
            >
              {loading ? "Booking…" : "Confirm Booking →"}
            </button>
          </div>
        )}

        {/* Booking confirmed */}
        {stage === "consult_book" && bookingResult && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="text-5xl">✅</div>
              <h2 className="text-2xl font-bold text-emerald-300">Booking Confirmed</h2>
              <p className="text-zinc-400 text-sm font-mono">{bookingResult.bookingId.slice(0, 8).toUpperCase()}</p>
            </div>

            {bookingResult.meetingLink && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center space-y-2">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Meeting Link</p>
                <a href={bookingResult.meetingLink} className="text-blue-400 underline text-sm break-all hover:text-blue-300">
                  {bookingResult.meetingLink}
                </a>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">How to prepare</h3>
              {bookingResult.preparationNotes.map((note, i) => (
                <div key={i} className="flex gap-3 text-sm text-zinc-300 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            <Link
              href="/case"
              className="block w-full py-4 rounded-2xl border border-zinc-700 text-center text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-all text-sm"
            >
              Return to Case Domains
            </Link>
          </div>
        )}

      </main>

      {/* ── Payment Modal / Sheet ── */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Unlock Career Report</h3>
                <p className="text-xs text-zinc-400">Complete analysis &amp; expert strategy</p>
              </div>
              <button
                onClick={() => setShowPayment(false)}
                className="w-8 h-8 rounded-full border border-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Fee summary */}
            <div className="rounded-2xl bg-zinc-800/50 p-4 space-y-2 text-sm border border-zinc-700/50">
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Career Numerology &amp; Timing</span>
                <span className="text-emerald-400">Included</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Full Blueprint, Ritual &amp; Expert Review</span>
                <span className="text-zinc-200">{expertAssignment?.consultationFeeETB ?? 500} ETB</span>
              </div>
              <div className="flex justify-between text-zinc-100 font-bold border-t border-zinc-700 pt-2 text-base">
                <span>Total Due</span>
                <span className="text-blue-400">{expertAssignment?.consultationFeeETB ?? 500} ETB</span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "telebirr", name: "Telebirr", icon: "📱" },
                  { id: "cbe_birr", name: "CBE Birr", icon: "🏦" },
                  { id: "chapa", name: "Chapa", icon: "💳" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as "telebirr" | "cbe_birr" | "chapa")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === m.id
                        ? "border-blue-500 bg-blue-500/20 text-blue-200 shadow-sm"
                        : "border-zinc-800 bg-zinc-800/40 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs font-medium">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile / Account input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                {paymentMethod === "telebirr" ? "Telebirr Mobile Number" : paymentMethod === "cbe_birr" ? "CBE Birr Mobile / Account" : "Phone or Card Identifier"}
              </label>
              <input
                type="text"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="0911234567"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm focus:border-blue-500 outline-none"
              />
            </div>

            {paymentError && (
              <div className="text-xs text-red-400 text-center">{paymentError}</div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing payment...</span>
                  </>
                ) : (
                  <span>Pay {expertAssignment?.consultationFeeETB ?? 500} ETB &amp; Unlock</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="w-full py-2.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
