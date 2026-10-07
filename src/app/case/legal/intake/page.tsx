"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  Shield,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  Users,
  Clock,
  Phone,
  Lock,
  Video,
  MessageCircle,
  MapPin,
  Loader2,
  Star,
  Gavel,
} from "lucide-react";

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════

type Stage =
  | "landing"
  | "safety_screen"
  | "questions"
  | "submitting"
  | "expert_status"
  | "report_preview"
  | "crisis_route"
  | "legal_aid_route"
  | "consult_book";

type SafetyAnswers = {
  immediateHarm: "no" | "physical_danger" | "threats" | "prefer_not" | "";
  criminalMatter: "no" | "yes" | "unsure" | "prefer_not" | "";
  evictionRisk: "no" | "within_30" | "within_7" | "prefer_not" | "";
  childWelfare: "no_children" | "safe" | "concerned" | "prefer_not" | "";
};

interface LegalExpert {
  id: string;
  name: string;
  credential: string;
  specialization: string;
  languages: string[];
  rating: number;
  isAvailable: boolean;
}

interface LegalReport {
  title: string;
  summary: string;
  recommendations: string[];
}

interface CrisisContent {
  title: string;
  message: string;
  hotlines: { name: string; number: string }[];
  safetyPlanSteps: string[];
}

interface LegalAidContent {
  title: string;
  message: string;
  hotlines: { name: string; number: string }[];
  resources: string[];
}

const STAGE_LABELS: Record<Stage, string> = {
  landing: "Overview",
  safety_screen: "Safety Check",
  questions: "Your Matter",
  submitting: "Processing",
  expert_status: "Expert Review",
  report_preview: "Report",
  crisis_route: "Safety Support",
  legal_aid_route: "Legal Aid",
  consult_book: "Consultation",
};

const PROGRESS_STAGES: Stage[] = [
  "safety_screen",
  "questions",
  "expert_status",
  "report_preview",
  "consult_book",
];

// ════════════════════════════════════════════════════════════
// Sub-Components
// ════════════════════════════════════════════════════════════

function StageProgress({ current }: { current: Stage }) {
  const idx = PROGRESS_STAGES.indexOf(current);
  if (idx < 0) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-zinc-500">
      {PROGRESS_STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <span
            className={`h-1.5 rounded-full transition-all ${
              i < idx
                ? "w-6 bg-purple-500"
                : i === idx
                ? "w-6 bg-purple-400"
                : "w-4 bg-zinc-700"
            }`}
          />
        </React.Fragment>
      ))}
      <span className="ml-1 font-mono">{STAGE_LABELS[current]}</span>
    </div>
  );
}

function SafetyRadio({
  name,
  value,
  current,
  label,
  sublabel,
  urgent,
  onChange,
}: {
  name: string;
  value: string;
  current: string;
  label: string;
  sublabel?: string;
  urgent?: boolean;
  onChange: (v: string) => void;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
        selected
          ? urgent
            ? "border-red-500/60 bg-red-950/40 text-red-200"
            : "border-purple-500/60 bg-purple-950/30 text-purple-100"
          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selected
              ? urgent
                ? "border-red-400 bg-red-400"
                : "border-purple-400 bg-purple-400"
              : "border-zinc-600"
          }`}
        >
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          {sublabel && <div className="text-xs text-zinc-500 mt-0.5">{sublabel}</div>}
        </div>
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════

export default function LegalIntakePage() {
  const [stage, setStage] = useState<Stage>("landing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // Safety
  const [safety, setSafety] = useState<SafetyAnswers>({
    immediateHarm: "",
    criminalMatter: "",
    evictionRisk: "",
    childWelfare: "",
  });

  // Questions
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [caseId, setCaseId] = useState("");

  // Results
  const [expert, setExpert] = useState<LegalExpert | null>(null);
  const [report, setReport] = useState<LegalReport | null>(null);
  const [crisisContent, setCrisisContent] = useState<CrisisContent | null>(null);
  const [legalAidContent, setLegalAidContent] = useState<LegalAidContent | null>(null);
  const [safetyFlag, setSafetyFlag] = useState<{ reason: string; priority: string } | null>(null);

  // Consultation
  const [selectedFormat, setSelectedFormat] = useState<"video" | "voice" | "chat" | "in_person">("video");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("0911234567");
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe_birr" | "chapa">("telebirr");
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stage]);

  const safetyComplete =
    safety.immediateHarm !== "" &&
    safety.criminalMatter !== "" &&
    safety.evictionRisk !== "" &&
    safety.childWelfare !== "";

  // ── Handlers ────────────────────────────────────────────

  const handleSafetySubmit = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/case/legal/safety-screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: safety }),
      });
      const data = await res.json() as {
        success: boolean;
        data?: {
          action: string;
          expertFlag?: { reason: string; priority: string };
          crisisContent?: CrisisContent;
          legalAidContent?: LegalAidContent;
        };
        error?: string;
      };
      if (!data.success) throw new Error(data.error ?? "Safety check failed");
      const result = data.data!;

      if (result.action === "crisis_route") {
        setCrisisContent(result.crisisContent ?? null);
        setStage("crisis_route");
      } else if (result.action === "legal_aid_route") {
        setLegalAidContent(result.legalAidContent ?? null);
        setStage("legal_aid_route");
      } else {
        if (result.expertFlag) setSafetyFlag(result.expertFlag);
        setStage("questions");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Safety check failed");
    } finally {
      setLoading(false);
    }
  }, [safety]);

  const handleSubmitCase = useCallback(async () => {
    setStage("submitting");
    setError("");
    try {
      const res = await fetch("/api/case/legal/safety-screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: safety }),
      });
      const safetyData = await res.json() as { success: boolean; data?: { action: string; expertFlag?: { reason: string; priority: string }; crisisContent?: CrisisContent; legalAidContent?: LegalAidContent } };
      const safetyResult = safetyData.data;

      // Simulate server-side case assignment with generated data
      await new Promise((r) => setTimeout(r, 1200));

      const mockExpert: LegalExpert = (() => {
        const issueType = answers.issue_type || "dispute";
        if (issueType === "housing") return {
          id: "legal-aid-1", name: "Aster Gashaw", credential: "Legal Aid Specialist",
          specialization: "Tenant rights and urgent housing support", languages: ["am", "en"],
          rating: 4.9, isAvailable: true,
        };
        if (issueType === "family") return {
          id: "legal-mediator-1", name: "Daniel Tesfaye", credential: "Verified Dispute Mediator",
          specialization: "Family and community mediation", languages: ["am", "en", "om"],
          rating: 4.7, isAvailable: true,
        };
        return {
          id: "legal-lawyer-1", name: "Mihret Bekele", credential: "Licensed Attorney",
          specialization: "Contract and business disputes", languages: ["am", "en"],
          rating: 4.8, isAvailable: true,
        };
      })();

      const jurisdiction = answers.jurisdiction || "Addis Ababa";
      const mockReport: LegalReport = {
        title: "Legal Review & Next-Step Plan",
        summary: `Your matter in ${jurisdiction} has been prepared for expert review. The case focuses on immediate risk, any upcoming deadlines, and lawful next steps for your situation.`,
        recommendations: [
          "Document the issue clearly and store evidence in a secure location.",
          "Confirm any court dates, eviction notices, or official deadlines.",
          "Consult a licensed attorney or legal aid provider before taking major action.",
          "Do not sign any documents without fully understanding the terms.",
        ],
      };

      setExpert(mockExpert);
      setReport(mockReport);
      setCaseId(`legal-${Date.now()}`);
      setStage("expert_status");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setStage("questions");
    }
  }, [answers, safety]);

  const handleConfirmPayment = useCallback(async () => {
    setProcessingPayment(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setReportUnlocked(true);
      setShowPayment(false);
    } finally {
      setProcessingPayment(false);
    }
  }, []);

  const handleBookConsult = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setBookingConfirmed(true);
      setStage("consult_book");
    } finally {
      setLoading(false);
    }
  }, []);

  // ════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════

  return (
    <div ref={topRef} className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/case"
            className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Case Domains
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-zinc-200 tracking-wide">Peace & Harmony</span>
          </div>
          <StageProgress current={stage} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ═════════════════════════════ LANDING ═════════════════════════════ */}
        {stage === "landing" && (
          <div className="space-y-10">
            {/* Hero */}
            <div className="text-center space-y-4 pt-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 mb-2">
                <Scale className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-purple-300 bg-clip-text text-transparent">
                Peace & Harmony
              </h1>
              <p className="text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed">
                Spiritual peacemaking, community reconciliation (ሽምግልና), and cultural restorative justice. Grounded entirely in traditional Ethiopian wisdom — no scientific or statutory legal advice.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Shield,
                  title: "Safety & Conscience First",
                  desc: "A brief check ensures your safety and peace of mind before any reflection begins.",
                  color: "text-red-400",
                  bg: "bg-red-500/10 border-red-500/20",
                },
                {
                  icon: Gavel,
                  title: "Elders & Spiritual Mentors",
                  desc: "Traditional elders (ሽማግሌዎች) and spiritual peacemakers experienced in Ethiopian customary reconciliation.",
                  color: "text-purple-400",
                  bg: "bg-purple-500/10 border-purple-500/20",
                },
                {
                  icon: FileText,
                  title: "Cultural Reconciliation Plan",
                  desc: "A restorative path rooted in mutual dignity, spiritual conscience, and community harmony — no scientific advice.",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className={`rounded-2xl border p-5 space-y-3 ${bg}`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                  <h3 className="font-semibold text-zinc-100 text-sm">{title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">How it works</h2>
              <div className="space-y-3">
                {[
                  { step: "01", label: "Safety & Peace Check", desc: "Four quick questions to ensure immediate safety and comfort." },
                  { step: "02", label: "Describe the Situation", desc: "Community context, dispute nature, and reconciliation goals." },
                  { step: "03", label: "Elder & Mentor Reflection", desc: "A respected customary elder or spiritual mediator reflects on the matter." },
                  { step: "04", label: "Restorative Guidance", desc: "Cultural reconciliation principles, spiritual peacemaking, and elder consultation." },
                ].map(({ step, label, desc }) => (
                  <div key={step} className="flex gap-4 items-start">
                    <span className="text-xs font-mono text-purple-500 mt-0.5 w-6 shrink-0">{step}</span>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{label}</div>
                      <div className="text-xs text-zinc-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-xs text-amber-300/80 leading-relaxed">
              <span className="font-semibold text-amber-300">Disclaimer: </span>
              Grounded exclusively in Ethiopian cultural and spiritual traditions (ሽምግልና / Shemgelna, traditional restorative peacemaking, and spiritual conscience). It provides spiritual and cultural reflection only — no scientific, clinical, or statutory legal advice is provided.
            </div>

            <button
              onClick={() => setStage("safety_screen")}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2 text-sm"
            >
              Begin Cultural & Spiritual Intake
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ════════════════════════ SAFETY SCREEN ════════════════════════ */}
        {stage === "safety_screen" && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <Shield className="w-10 h-10 text-red-400 mx-auto" />
              <h1 className="text-2xl font-bold">Safety Check</h1>
              <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                Four brief questions to make sure you have the right support before we proceed. All answers are confidential.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Q1 */}
              <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="text-sm font-medium text-zinc-200">
                  1. Is anyone in immediate physical danger right now?
                </div>
                <div className="space-y-2">
                  {[
                    { value: "no", label: "No — no immediate danger", urgent: false },
                    { value: "physical_danger", label: "Yes — someone is in immediate danger", sublabel: "We will direct you to emergency support first", urgent: true },
                    { value: "threats", label: "There have been threats or harassment", urgent: true },
                    { value: "prefer_not", label: "Prefer not to say", urgent: false },
                  ].map(({ value, label, sublabel, urgent }) => (
                    <SafetyRadio
                      key={value}
                      name="immediateHarm"
                      value={value}
                      current={safety.immediateHarm}
                      label={label}
                      sublabel={sublabel}
                      urgent={urgent}
                      onChange={(v) => setSafety((p) => ({ ...p, immediateHarm: v as SafetyAnswers["immediateHarm"] }))}
                    />
                  ))}
                </div>
              </div>

              {/* Q2 */}
              <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="text-sm font-medium text-zinc-200">
                  2. Does this involve a criminal charge or active criminal case?
                </div>
                <div className="space-y-2">
                  {[
                    { value: "no", label: "No — this is a civil matter" },
                    { value: "yes", label: "Yes — there is a criminal charge or case", sublabel: "Criminal matters require a licensed attorney" },
                    { value: "unsure", label: "I am not sure" },
                    { value: "prefer_not", label: "Prefer not to say" },
                  ].map(({ value, label, sublabel }) => (
                    <SafetyRadio
                      key={value}
                      name="criminalMatter"
                      value={value}
                      current={safety.criminalMatter}
                      label={label}
                      sublabel={sublabel}
                      onChange={(v) => setSafety((p) => ({ ...p, criminalMatter: v as SafetyAnswers["criminalMatter"] }))}
                    />
                  ))}
                </div>
              </div>

              {/* Q3 */}
              <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="text-sm font-medium text-zinc-200">
                  3. Is there a risk of eviction or loss of housing soon?
                </div>
                <div className="space-y-2">
                  {[
                    { value: "no", label: "No eviction risk" },
                    { value: "within_30", label: "Risk within the next 30 days" },
                    { value: "within_7", label: "Risk within the next 7 days", sublabel: "Urgent — we will prioritise your case" },
                    { value: "prefer_not", label: "Prefer not to say" },
                  ].map(({ value, label, sublabel }) => (
                    <SafetyRadio
                      key={value}
                      name="evictionRisk"
                      value={value}
                      current={safety.evictionRisk}
                      label={label}
                      sublabel={sublabel}
                      urgent={value === "within_7"}
                      onChange={(v) => setSafety((p) => ({ ...p, evictionRisk: v as SafetyAnswers["evictionRisk"] }))}
                    />
                  ))}
                </div>
              </div>

              {/* Q4 */}
              <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div className="text-sm font-medium text-zinc-200">
                  4. Are children involved in this matter?
                </div>
                <div className="space-y-2">
                  {[
                    { value: "no_children", label: "No children are involved" },
                    { value: "safe", label: "Children are involved and safe" },
                    { value: "concerned", label: "I am concerned about a child's safety", sublabel: "Child welfare cases are treated with highest priority", urgent: true },
                    { value: "prefer_not", label: "Prefer not to say" },
                  ].map(({ value, label, sublabel, urgent }) => (
                    <SafetyRadio
                      key={value}
                      name="childWelfare"
                      value={value}
                      current={safety.childWelfare}
                      label={label}
                      sublabel={sublabel}
                      urgent={urgent}
                      onChange={(v) => setSafety((p) => ({ ...p, childWelfare: v as SafetyAnswers["childWelfare"] }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSafetySubmit}
              disabled={!safetyComplete || loading}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
              ) : (
                <>Continue to Your Matter <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}

        {/* ══════════════════════════ QUESTIONS ══════════════════════════ */}
        {stage === "questions" && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <FileText className="w-9 h-9 text-purple-400 mx-auto" />
              <h1 className="text-2xl font-bold">Describe Your Matter</h1>
              <p className="text-zinc-400 text-sm">Answer in your own words — Amharic or English. No technical knowledge needed.</p>
            </div>

            {safetyFlag && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex gap-3 text-sm text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{safetyFlag.reason}</span>
              </div>
            )}

            <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">

              {/* Jurisdiction */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  Area or Jurisdiction
                </label>
                <input
                  type="text"
                  value={answers.jurisdiction ?? ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, jurisdiction: e.target.value }))}
                  placeholder="Addis Ababa, Oromia, etc."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              {/* Issue type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Type of legal question</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "housing", label: "🏠 Housing / Tenancy" },
                    { value: "contract", label: "📄 Contract / Business" },
                    { value: "family", label: "👨‍👩‍👧 Family / Inheritance" },
                    { value: "dispute", label: "⚖️ Dispute / Conflict" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, issue_type: value }))}
                      className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                        answers.issue_type === value
                          ? "border-purple-500/60 bg-purple-950/30 text-purple-200"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matter detail */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Describe your situation <span className="text-zinc-500 font-normal">(in your own words)</span>
                </label>
                <textarea
                  value={answers.matter_detail ?? ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, matter_detail: e.target.value }))}
                  placeholder="What happened? Who is involved? What outcome matters most to you?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 text-sm resize-none"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">Upcoming deadline or hearing?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "no", label: "No deadline" },
                    { value: "within_30", label: "Within 30 days" },
                    { value: "within_7", label: "Within 7 days — urgent" },
                    { value: "prefer_not", label: "Not sure" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, deadline: value }))}
                      className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                        answers.deadline === value
                          ? value === "within_7"
                            ? "border-red-500/60 bg-red-950/30 text-red-200"
                            : "border-purple-500/60 bg-purple-950/30 text-purple-200"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">What matters most right now?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "rights", label: "Know my rights" },
                    { value: "strategy", label: "Next-step strategy" },
                    { value: "contract", label: "Review a contract" },
                    { value: "urgency", label: "Urgent action" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswers((p) => ({ ...p, legal_goal: value }))}
                      className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                        answers.legal_goal === value
                          ? "border-purple-500/60 bg-purple-950/30 text-purple-200"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStage("safety_screen")}
                className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-all text-sm flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSubmitCase}
                disabled={!answers.jurisdiction?.trim() || !answers.issue_type || !answers.matter_detail?.trim()}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
              >
                Submit for Expert Review <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════ SUBMITTING ═══════════════════════ */}
        {stage === "submitting" && (
          <div className="text-center space-y-6 py-20">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Assigning your expert...</h2>
              <p className="text-zinc-500 text-sm mt-2">Matching your case to the right attorney or mediator.</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════ EXPERT STATUS ═══════════════════════ */}
        {stage === "expert_status" && expert && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h1 className="text-2xl font-bold">Case Received</h1>
              <p className="text-zinc-400 text-sm">Your case has been assigned to a qualified expert.</p>
            </div>

            {/* Expert card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg font-bold text-purple-300">
                  {expert.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-100">{expert.name}</div>
                  <div className="text-sm text-purple-300">{expert.credential}</div>
                  <div className="text-xs text-zinc-400 mt-1">{expert.specialization}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {expert.rating}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-600" />
                  Review in 2–6 hours
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Users className="w-3.5 h-3.5 text-zinc-600" />
                  {expert.languages.map((l) => l.toUpperCase()).join(", ")}
                </div>
              </div>
            </div>

            {/* Case ID */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">Case Reference</div>
              <div className="font-mono text-xs text-zinc-300">{caseId}</div>
            </div>

            <button
              onClick={() => setStage("report_preview")}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              View Report Preview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ═══════════════════════ REPORT PREVIEW ═══════════════════════ */}
        {stage === "report_preview" && report && expert && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <FileText className="w-9 h-9 text-purple-400 mx-auto" />
              <h1 className="text-2xl font-bold">{report.title}</h1>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Summary</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{report.summary}</p>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Key Recommendations</h2>
              {reportUnlocked ? (
                <ul className="space-y-3">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="relative">
                  <ul className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden>
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/60 rounded-xl">
                    <Lock className="w-6 h-6 text-purple-400" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-zinc-200">Full report locked</div>
                      <div className="text-xs text-zinc-500 mt-1">Unlock for 850 ETB</div>
                    </div>
                    <button
                      onClick={() => setShowPayment(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all"
                    >
                      Unlock Report
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment modal */}
            {showPayment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-7 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-zinc-100">Unlock Full Report</h3>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="text-zinc-500 hover:text-zinc-300 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(["telebirr", "cbe_birr", "chapa"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          paymentMethod === method
                            ? "border-purple-500/60 bg-purple-950/30 text-purple-200"
                            : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {method === "telebirr" ? "Telebirr" : method === "cbe_birr" ? "CBE Birr" : "Chapa"}
                      </button>
                    ))}
                  </div>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder="Mobile / account number"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button
                    onClick={handleConfirmPayment}
                    disabled={processingPayment}
                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {processingPayment ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      "Pay 850 ETB & Unlock"
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStage("expert_status")}
                className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-600 text-sm flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleBookConsult}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Book Consultation <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════ CONSULT BOOK ═══════════════════════ */}
        {stage === "consult_book" && (
          <div className="space-y-8">
            {bookingConfirmed ? (
              <div className="text-center space-y-5 py-12">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                <div>
                  <h1 className="text-2xl font-bold text-zinc-100">Consultation Booked</h1>
                  <p className="text-zinc-400 text-sm mt-2">
                    Your {selectedFormat} session with your assigned expert is confirmed.
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-300 space-y-3 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4" /> Scheduled in ~72 hours
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    {selectedFormat === "video" ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    {selectedFormat === "video" ? "Video call" : selectedFormat === "voice" ? "Phone call" : selectedFormat === "chat" ? "Secure chat" : "In-person"}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Lock className="w-4 h-4" /> Confidential & recorded with consent
                  </div>
                </div>
                <Link
                  href="/case"
                  className="inline-block px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 text-sm transition-all"
                >
                  Back to Case Domains
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold">Book a Consultation</h1>
                  <p className="text-zinc-400 text-sm">Choose how you would like to meet your expert.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "video", label: "Video Call", icon: Video, desc: "Face-to-face via secure link" },
                    { value: "voice", label: "Phone Call", icon: Phone, desc: "Audio only" },
                    { value: "chat", label: "Secure Chat", icon: MessageCircle, desc: "Written back-and-forth" },
                    { value: "in_person", label: "In Person", icon: MapPin, desc: "At a verified office" },
                  ] as const).map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedFormat(value)}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                        selectedFormat === value
                          ? "border-purple-500/60 bg-purple-950/30"
                          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selectedFormat === value ? "text-purple-400" : "text-zinc-500"}`} />
                      <div className="text-sm font-medium text-zinc-200">{label}</div>
                      <div className="text-xs text-zinc-500">{desc}</div>
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
                  Consultation fee: <span className="text-zinc-200 font-semibold">1,500 ETB</span> (payable at booking confirmation)
                </div>

                <button
                  onClick={handleBookConsult}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirm Booking</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ CRISIS ROUTE ═══════════════════════ */}
        {stage === "crisis_route" && crisisContent && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-8 space-y-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h1 className="text-2xl font-bold text-red-300">{crisisContent.title}</h1>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">{crisisContent.message}</p>

              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">Emergency Contacts</h2>
                {crisisContent.hotlines.map((h) => (
                  <a
                    key={h.number}
                    href={h.number.startsWith("+") || /^\d/.test(h.number) ? `tel:${h.number}` : "#"}
                    className="flex items-center justify-between p-4 rounded-xl bg-red-900/40 border border-red-500/30 hover:bg-red-900/60 transition-colors"
                  >
                    <span className="font-medium text-zinc-200 text-sm">{h.name}</span>
                    <span className="text-red-300 font-mono font-bold">{h.number}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Steps you can take now</h2>
                {crisisContent.safetyPlanSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="text-red-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
              When you feel ready,{" "}
              <button
                onClick={() => setStage("safety_screen")}
                className="text-zinc-300 underline hover:text-white"
              >
                return to the beginning
              </button>
              .
            </p>
          </div>
        )}

        {/* ═══════════════════════ LEGAL AID ROUTE ═══════════════════════ */}
        {stage === "legal_aid_route" && legalAidContent && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-8 space-y-5">
              <div className="flex items-center gap-3">
                <Scale className="w-7 h-7 text-amber-400" />
                <h1 className="text-2xl font-bold text-amber-200">{legalAidContent.title}</h1>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm">{legalAidContent.message}</p>

              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Legal Support</h2>
                {legalAidContent.hotlines.map((h) => (
                  <a
                    key={h.number}
                    href={h.number.startsWith("+") ? `tel:${h.number}` : "#"}
                    className="flex items-center justify-between p-4 rounded-xl bg-amber-900/30 border border-amber-500/30 hover:bg-amber-900/50 transition-colors"
                  >
                    <span className="font-medium text-zinc-200 text-sm">{h.name}</span>
                    <span className="text-amber-300 font-mono text-sm">{h.number}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Resources</h2>
                {legalAidContent.resources.map((r, i) => (
                  <div key={i} className="flex gap-2 text-sm text-zinc-300">
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
              If this is a civil matter instead,{" "}
              <button
                onClick={() => {
                  setSafety((p) => ({ ...p, criminalMatter: "no" }));
                  setStage("safety_screen");
                }}
                className="text-zinc-300 underline hover:text-white"
              >
                start over
              </button>
              .
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
