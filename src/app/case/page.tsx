"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CaseDefinition, CaseSession, Question } from "@/lib/case-workflow/engine";
import type { DiagnosticSolution } from "@/lib/knowledge/types";
import AwudeHeritageContext from "@/components/cultural/AwudeHeritageContext";

type Answers = Record<string, string | number | Record<string, unknown>>;
type Phase = "domain" | "challenge" | "specific" | "report" | "causes" | "solutions" | "complete";
type VoiceRecognition = {
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

const CASE_DRAFT_KEY = "Debtera-active-case-draft";

const PHASE_LABELS: Record<Phase, string> = {
  domain: "Choose care path",
  challenge: "Select the challenge",
  specific: "Your case story",
  report: "Review the guidance",
  causes: "Refine the findings",
  solutions: "Choose practical actions",
  complete: "Complete",
};

const PHASE_ICONS: Record<Phase, string> = {
  domain: "📋",
  challenge: "🎯",
  specific: "✍️",
  report: "📄",
  causes: "🔍",
  solutions: "💡",
  complete: "✅",
};

export default function CasePage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [cases, setCases] = useState<CaseDefinition[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseDefinition | null>(null);
  const [session, setSession] = useState<CaseSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>("domain");
  const [selectedCauseIds, setSelectedCauseIds] = useState<string[]>([]);
  const [selectedSolutionIds, setSelectedSolutionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [casesLoading, setCasesLoading] = useState(true);
  const [error, setError] = useState("");
  const [assist, setAssist] = useState<{ suggestions: string[]; urgencyHint: string; safetyFlags: string[] }>({
    suggestions: [],
    urgencyHint: "",
    safetyFlags: [],
  });
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerSync, setAnswerSync] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [profileContext, setProfileContext] = useState<Record<string, unknown>>({});
  const [diagnosticQuery, setDiagnosticQuery] = useState("");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticSolution | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeResult, setIntakeResult] = useState<{ reportId?: string; message?: string } | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const recognitionRef = useRef<VoiceRecognition | null>(null);

  // ── Effects ──────────────────────────────────────────────────────────────
  async function loadCases() {
    setCasesLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cases", { credentials: "include", cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "The case domains could not be loaded.");
      setCases(payload.data || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The case domains could not be loaded.");
    } finally {
      setCasesLoading(false);
    }
  }

  useEffect(() => {
    void loadCases();
  }, []);

  // Keep the active workflow recoverable when the browser refreshes or closes.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CASE_DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as {
          selectedCase?: CaseDefinition;
          session?: CaseSession;
          questions?: Question[];
          answers?: Answers;
          phase?: Phase;
          selectedCauseIds?: string[];
          selectedSolutionIds?: string[];
        };
        if (draft.selectedCase && draft.session && draft.phase && draft.phase !== "complete") {
          setSelectedCase(draft.selectedCase);
          setSession(draft.session);
          setQuestions(draft.questions || []);
          setAnswers(draft.answers || {});
          setPhase(draft.phase);
          setSelectedCauseIds(draft.selectedCauseIds || []);
          setSelectedSolutionIds(draft.selectedSolutionIds || []);
          setDraftAvailable(true);
        }
      }
    } catch {
      window.localStorage.removeItem(CASE_DRAFT_KEY);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded || !selectedCase || !session) return;
    window.localStorage.setItem(
      CASE_DRAFT_KEY,
      JSON.stringify({ selectedCase, session, questions, answers, phase, selectedCauseIds, selectedSolutionIds }),
    );
  }, [draftLoaded, selectedCase, session, questions, answers, phase, selectedCauseIds, selectedSolutionIds]);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile", { credentials: "include", cache: "no-store" }),
      fetch("/api/auth/me", { credentials: "include", cache: "no-store" }),
    ])
      .then(async ([profileResponse, authResponse]) => ({
        profile: profileResponse.ok ? await profileResponse.json() : null,
        auth: authResponse.ok ? await authResponse.json() : null,
      }))
      .then(({ profile, auth }) => {
        if (!profile?.success) return;
        const values = profile.data || {};
        const labeled = (profile.fields || []).reduce((context: Record<string, unknown>, field: { id: string; label: string }) => {
          if (values[field.id] !== undefined) context[field.label] = values[field.id];
          return context;
        }, {});
        setProfileContext({ ...labeled, ...values, ...auth?.data });
      })
      .catch(() => undefined);
  }, []);

  // Persist each field shortly after it changes so progress survives navigation or refresh.
  useEffect(() => {
    if (!session || Object.keys(answers).length === 0) return;
    const timer = window.setTimeout(async () => {
      setAnswerSync("saving");
      try {
        const response = await fetch(`/api/session/${session.id}/answers`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (!response.ok) throw new Error("Unable to save field changes.");
        setAnswerSync("saved");
      } catch {
        setAnswerSync("error");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, session]);

  // Live assistance when typing detail
  useEffect(() => {
    const detail = String(answers.detail || "");
    if (detail.length < 10) {
      setAssist({ suggestions: [], urgencyHint: "", safetyFlags: [] });
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/diagnostic/assist?query=${encodeURIComponent(detail)}`);
        const payload = await response.json();
        if (payload.success) setAssist(payload.data);
      } catch {
        // Assistance is optional; fail silently.
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [answers.detail]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const stepIndex = useMemo(() => {
    const order: Phase[] = ["domain", "challenge", "specific", "report", "causes", "solutions", "complete"];
    return order.indexOf(phase);
  }, [phase]);

  const workflowStatus = useMemo(() => {
    const level = session?.workflowContext?.safety.level ?? "low";
    const meta: Record<string, { label: string; tone: string; accent: string; action: string }> = {
      low: {
        label: "Stable review",
        tone: "text-emerald-300 border-emerald-500/40 bg-emerald-950/25",
        accent: "bg-emerald-500",
        action: "Continue with the selected findings and monitor the plan over time.",
      },
      moderate: {
        label: "Monitor closely",
        tone: "text-amber-300 border-amber-500/40 bg-amber-950/20",
        accent: "bg-amber-500",
        action: "Review the findings in context and consider a follow-up check-in or additional assessment.",
      },
      high: {
        label: "Watch closely",
        tone: "text-orange-300 border-orange-500/40 bg-orange-950/20",
        accent: "bg-orange-500",
        action: "Prioritize a timely review and consider escalating care if symptoms worsen or become urgent.",
      },
      critical: {
        label: "Urgent attention",
        tone: "text-rose-300 border-rose-500/40 bg-rose-950/25",
        accent: "bg-rose-500",
        action: "This case shows an urgent or high-risk pattern; encourage immediate Scientific attention or emergency support.",
      },
    };
    return meta[level] ?? meta.low;
  }, [session]);

  const activeFindings = useMemo(
    () => session?.causes.filter((cause) => cause.isSelected).slice(0, 3) ?? [],
    [session],
  );

  const activeSolutions = useMemo(
    () => session?.solutions.filter((solution) => selectedSolutionIds.includes(solution.id) || phase === "solutions" || phase === "complete").slice(0, 3) ?? [],
    [phase, selectedSolutionIds, session],
  );

  async function readJson(url: string, options?: RequestInit) {
    const response = await fetch(url, options);
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.error || "The workflow could not continue.");
    return payload.data;
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function chooseDomain(caseDefinition: CaseDefinition) {
    setLoading(true);
    setError("");
    try {
      const nextSession = await readJson("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: caseDefinition.id }),
      }) as CaseSession;
      const next = await readJson(`/api/session/${nextSession.id}/next`) as { questions: Question[] };
      setSelectedCase(caseDefinition);
      setSession(nextSession);
      setQuestions(next.questions);
      setPhase("challenge");
      // Pre‑fill challenge options if the user has already answered? No, start fresh.
      setAnswers({});
      setDiagnosticQuery("");
      setDiagnosticResult(null);
      setIntakeResult(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start this case.");
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(fieldId: string, value: string | number | Record<string, unknown>) {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  async function requestEmbeddedDiagnostic(query: string) {
    if (query.length < 2) {
      throw new Error("Describe the case before running the diagnostic assessment.");
    }
    const response = await fetch("/api/diagnostic/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        mode: "text",
        userProfile: {
          userId: session?.userId,
          demographics: { age: profileContext["Date of birth"] || answers.age, gender: profileContext["Gender identity"] },
          medications: profileContext["Current medications"] || answers.medications || [],
          wellbeing: { allergies: profileContext["Known allergies"] || [], conditions: profileContext["Relevant medical history"] || [] },
          location: { region: profileContext["Region or state"] || answers.region || "Addis Ababa" },
          name: profileContext["Full name"] || profileContext.name,
          fullName: profileContext["Full name"] || profileContext.fullName,
          birthDate: profileContext["Date of birth"] || profileContext.birthDate,
          profileContext,
        },
        domain: selectedCase?.id || "wellbeing",
        domainLabel: selectedCase?.name || "wellbeing",
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.error || "Diagnostic assessment failed.");
    return payload.data as DiagnosticSolution;
  }

  async function runEmbeddedDiagnostic() {
    setDiagnosticLoading(true);
    setError("");
    try {
      const result = await requestEmbeddedDiagnostic(diagnosticQuery.trim() || String(answers.detail || "").trim());
      setDiagnosticResult(result);
      updateAnswer("diagnosticAssessment", result as unknown as Record<string, unknown>);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Diagnostic assessment failed.");
    } finally {
      setDiagnosticLoading(false);
    }
  }

  async function runEmbeddedIntake() {
    setIntakeLoading(true);
    setError("");
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileContext["Full name"] || "Case client",
          email: profileContext.email || `case-${session?.id}@ethio-wellness.local`,
          age: Number(answers.age || 0) || undefined,
          gender: profileContext["Gender identity"] || "prefer_not_to_say",
          weightKg: Number(profileContext["Weight (kg)"] || 0) || undefined,
          region: profileContext["Region or state"] || answers.region || "Addis Ababa",
          altitudeMeters: 2400,
          activityLevel: profileContext["Physical activity level"] || "moderate",
          pregnancyOrLactation: profileContext["Pregnancy or lactation status"] || "none",
          medications: profileContext["Current medications"] || answers.medications || [],
          medicalHistory: profileContext["Relevant medical history"] || [],
          allergies: profileContext["Known allergies"] || [],
          lifestyleHabits: { profileContext, caseAnswers: answers },
          includeCultural: String(answers.reflectionLens || "").toLowerCase().includes("yes"),
          cultural: { ...profileContext },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Client intake assessment failed.");
      const result = { reportId: payload.reportId, message: payload.message };
      setIntakeResult(result);
      updateAnswer("clientIntakeAssessment", result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Client intake assessment failed.");
    } finally {
      setIntakeLoading(false);
    }
  }

  function toggleVoiceInput() {
    const browserWindow = window as unknown as {
      SpeechRecognition?: new () => VoiceRecognition;
      webkitSpeechRecognition?: new () => VoiceRecognition;
    };
    const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported by this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscript(text);
      // Append to the detail field
      const currentDetail = String(answers.detail || "").trim();
      updateAnswer("detail", currentDetail ? `${currentDetail} ${text}` : text);
    };
    recognition.onend = () => {
      setListening(false);
      setTranscript("");
    };
    recognition.onerror = () => {
      setListening(false);
      setError("Voice recognition failed. Please type your input.");
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function exportSession() {
    const data = {
      selectedCase,
      session,
      answers,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Debtera-case-${session?.id || "draft"}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function submitChallenge(event: React.FormEvent) {
    event.preventDefault();
    if (!session || !answers.challenge) return;
    setIsSubmitting(true);
    setError("");
    try {
      const caseQuery = diagnosticQuery.trim() || [answers.challenge, answers.detail, answers.medications, answers.barrier, answers.support].filter(Boolean).join(" ").trim();
      const mergedAnswers = diagnosticResult ? answers : { ...answers, diagnosticAssessment: await requestEmbeddedDiagnostic(caseQuery) };
      const updated = await readJson(`/api/session/${session.id}/answers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { challenge: answers.challenge } }),
      }) as CaseSession;
      const next = await readJson(`/api/session/${updated.id}/next`) as { questions: Question[] };
      setSession(updated);
      setQuestions(next.questions);
      setPhase("specific");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the challenge.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitSpecific(event: React.FormEvent) {
    event.preventDefault();
    if (!session) return;
    // Validate required fields
    const requiredFields = selectedCase?.id === "wellbeing"
      ? [
        ["age", "How old are you?"],
        ["location", "Where are you currently living?"],
        ["detail", "Describe the concern"],
        ["selectedInterest", "Which area should shape the recommendations?"],
        ["reflectionLens", "Would you like a cultural reflection layer included?"],
      ] as const
      : questions.filter((question) => question.required).map((question) => [question.fieldId, question.text] as const);
    const missing = requiredFields.filter(([fieldId]) => !String(answers[fieldId] ?? "").trim());
    if (missing.length) {
      setError(`Please complete the required fields: ${missing.map(([, label]) => label).join(", ")}.`);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const caseQuery = diagnosticQuery.trim() || [answers.challenge, answers.detail, answers.medications, answers.barrier, answers.support].filter(Boolean).join(" ").trim();
      const mergedAnswers = diagnosticResult
        ? answers
        : { ...answers, diagnosticAssessment: await requestEmbeddedDiagnostic(caseQuery) as unknown as Record<string, unknown> };
      const updated = await readJson(`/api/session/${session.id}/answers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: mergedAnswers }),
      }) as CaseSession;
      const report = await readJson(`/api/session/${updated.id}/process`, { method: "POST" }) as CaseSession;
      setSession(report);
      setSelectedCauseIds(report.causes.map((cause) => cause.id));
      setPhase("report");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to prepare the report.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmReport() {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const updated = await readJson(`/api/session/${session.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      }) as CaseSession;
      setSession(updated);
      setPhase("causes");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to confirm the report.");
    } finally {
      setLoading(false);
    }
  }

  async function editReport() {
    if (!session) return;
    setLoading(true);
    setError("");
    try {
      const updated = await readJson(`/api/session/${session.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: false }),
      }) as CaseSession;
      const next = await readJson(`/api/session/${updated.id}/next`) as { questions: Question[] };
      setSession(updated);
      setQuestions(next.questions);
      setPhase("specific");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to edit the case details.");
    } finally {
      setLoading(false);
    }
  }

  async function refineCase(event: React.FormEvent) {
    event.preventDefault();
    if (!session) return;
    if (selectedCauseIds.length === 0) {
      setError("Please select at least one finding to guide the solutions.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const updated = await readJson(`/api/session/${session.id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedCauseIds }),
      }) as CaseSession;
      setSession(updated);
      setSelectedSolutionIds(updated.solutions.map((solution) => solution.id));
      setPhase("solutions");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to refine the case.");
    } finally {
      setLoading(false);
    }
  }

  async function finalizeSolutions(event: React.FormEvent) {
    event.preventDefault();
    if (!session) return;
    if (selectedSolutionIds.length === 0) {
      setError("Please select at least one solution to proceed.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const updated = await readJson(`/api/session/${session.id}/solution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedSolutionIds }),
      }) as CaseSession;
      setSession(updated);
      setPhase("complete");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save your solution choices.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelection(setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) {
    setter((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function resetWorkflow() {
    if (!confirm("Are you sure you want to reset this case? All progress will be lost.")) return;
    setSelectedCase(null);
    setSession(null);
    setQuestions([]);
    setAnswers({});
    setPhase("domain");
    setSelectedCauseIds([]);
    setSelectedSolutionIds([]);
    setError("");
    setAssist({ suggestions: [], urgencyHint: "", safetyFlags: [] });
    window.localStorage.removeItem(CASE_DRAFT_KEY);
    setDraftAvailable(false);
  }

  function discardDraft() {
    window.localStorage.removeItem(CASE_DRAFT_KEY);
    setDraftAvailable(false);
  }

  function renderQuestions() {
    return questions.map((question) => (
      <div key={question.id} className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          {question.text}
          {question.required && <span className="text-amber-400 ml-1">*</span>}
        </label>
        {question.type === "textarea" ? (
          <textarea
            value={String(answers[question.fieldId] ?? "")}
            onChange={(e) => updateAnswer(question.fieldId, e.target.value)}
            rows={5}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
            placeholder="Describe your situation in detail..."
          />
        ) : question.type === "select" ? (
          <select
            value={String(answers[question.fieldId] ?? "")}
            onChange={(e) => updateAnswer(question.fieldId, e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">Select one</option>
            {(question.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={question.type === "number" ? "number" : "text"}
            value={String(answers[question.fieldId] ?? "")}
            onChange={(e) =>
              updateAnswer(question.fieldId, question.type === "number" ? Number(e.target.value) : e.target.value)
            }
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
            placeholder={question.type === "number" ? "Enter a number" : "Enter your response..."}
          />
        )}
      </div>
    ));
  }

  function renderSummaryCards() {
    if (!session || !selectedCase) return null;

    const summaryCards = [
      {
        label: "Status",
        value: workflowStatus.label,
        tone: workflowStatus.tone,
      },
      {
        label: "Confidence",
        value: `${Math.round((session.causes.reduce((sum, cause) => sum + cause.confidence, 0) / Math.max(session.causes.length, 1)) * 100)}%`,
        tone: "border-sky-500/30 bg-sky-950/15 text-sky-100",
      },
      {
        label: "Findings",
        value: `${session.causes.filter((cause) => cause.isSelected).length}`,
        tone: "border-violet-500/30 bg-violet-950/15 text-violet-100",
      },
      {
        label: "Next action",
        value: activeSolutions[0]?.title ?? "Review and refine",
        tone: "border-amber-500/30 bg-amber-950/15 text-amber-100",
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border p-4 ${card.tone}`}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">{card.label}</div>
            <div className="mt-3 text-base font-semibold text-white leading-snug">{card.value}</div>
          </div>
        ))}
      </div>
    );
  }

  function renderAiPanel() {
    const currentDomain = selectedCase?.name ?? "care pathway";
    const currentSummary = diagnosticResult?.summary?.problem ??
      (assist.suggestions.length ? assist.suggestions[0] : "Case pattern is being interpreted.");
    const currentUrgency = diagnosticResult?.summary?.urgency ?? "low";
    const urgencyTone = currentUrgency === "critical"
      ? "text-rose-300 border-rose-500/40 bg-rose-950/20"
      : currentUrgency === "high"
        ? "text-orange-300 border-orange-500/40 bg-orange-950/20"
        : currentUrgency === "medium"
          ? "text-amber-300 border-amber-500/40 bg-amber-950/20"
          : "text-emerald-300 border-emerald-500/40 bg-emerald-950/20";

    const wellbeingContextLoaded = Boolean(profileContext && Object.keys(profileContext).length > 0);
    const hasDiagnostic = Boolean(diagnosticResult);
    const aiSignals = diagnosticResult?.summary?.matchedSignals?.slice(0, 3) ??
      assist.suggestions.slice(0, 3) ??
      ["Clarify the main challenge", "Map care priorities", "Confirm the preferred care pathway"];

    return (
      <aside className="glass-panel p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">AI Case Intelligence</div>
            <div className="mt-2 text-lg font-black text-white font-serif">{currentDomain}</div>
          </div>
          <span className="rounded-full border border-emerald-500/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
            Live
          </span>
        </div>

        <div className={`rounded-2xl border p-4 ${urgencyTone}`}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em]">Signal</div>
          <div className="mt-2 text-sm font-bold text-white">{String(currentUrgency).toUpperCase()}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Analysis Lens</div>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            {currentSummary}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI Response Stream</div>
          <div className="mt-3 space-y-2">
            {aiSignals.map((item) => (
              <div key={String(item)} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                <span>{String(item)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/10 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Care Readiness</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">
              {wellbeingContextLoaded ? "Context" : "Context pending"}
            </span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">
              {hasDiagnostic ? "Diagnostic" : "No diagnostic"}
            </span>
          </div>
        </div>

        {diagnosticResult && (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/15 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Scientific Fit</div>
            <div className="mt-2 text-sm font-bold text-white">
              Confidence {Math.round(diagnosticResult.summary.confidence)}%
            </div>
            <div className="mt-2 text-[11px] text-sky-100">
              {diagnosticResult.summary.intent || "Scientific reasoning loaded"}
            </div>
          </div>
        )}

        {assist.safetyFlags.length > 0 && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">Safety Signals</div>
            <div className="mt-2 space-y-1">
              {assist.safetyFlags.slice(0, 3).map((flag) => (
                <div key={flag} className="text-[11px] text-rose-100">• {String(flag)}</div>
              ))}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-container py-10">
      <div className="max-w-5xl mx-auto">
        <header className="sci-fi-panel p-6 md:p-8 mb-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="status-pill mb-4">
                <span className="status-dot" />
                Guided case intake
              </div>
              <h1 className="dashboard-title text-4xl md:text-5xl lg:text-6xl">
                Start with what matters now
              </h1>
              <p className="dashboard-subtitle mt-4 max-w-2xl">
                Choose a life domain, name the challenge, describe your case, and review the reasoning
                before choosing what to do next. Scientific Domain A and cultural Domain B remain visible
                as separate layers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[220px]">
              <div className="metric-card metric-card--cyan">
                <div className="metric-value text-2xl">{selectedCase ? "1" : "0"}</div>
                <div className="metric-label">Active case</div>
              </div>
              <div className="metric-card metric-card--amber">
                <div className="metric-value text-2xl">{session ? "Live" : "Idle"}</div>
                <div className="metric-label">Status</div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Stepper */}
        <nav aria-label="Case workflow progress" className="sci-fi-panel p-4 mb-8">
          <ol className="flex items-center gap-0 overflow-x-auto pb-1">
            {Object.entries(PHASE_LABELS).map(([key, label], index) => {
              const isCompleted = index < stepIndex;
              const isCurrent = index === stepIndex;
              const isPending = index > stepIndex;
              return (
                <li key={key} className="flex items-center gap-0">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${isCompleted
                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300"
                        : isCurrent
                          ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40"
                          : "bg-white/5 border-white/10 text-slate-600"
                        }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </span>
                    <span
                      className={`text-[11px] font-medium transition-colors ${isCompleted
                        ? "text-emerald-400"
                        : isCurrent
                          ? "text-white"
                          : "text-slate-600"
                        }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < Object.keys(PHASE_LABELS).length - 1 && (
                    <span className="mx-2 text-slate-700 text-xs">/</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {draftAvailable && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 text-sm text-sky-100" role="status">
            <span className="text-sky-300">↻</span>
            <span className="flex-1">Your active case was restored from this browser.</span>
            <button type="button" onClick={discardDraft} className="text-xs text-sky-300 underline underline-offset-2 hover:text-white">
              Discard draft
            </button>
          </div>
        )}

        {session && renderSummaryCards() && (
          <div className="mb-8">{renderSummaryCards()}</div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200 flex items-start gap-3">
            <span className="text-rose-400">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-rose-400 hover:text-rose-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* ─── PHASE: Domain ──────────────────────────────────────────────── */}
        {phase === "domain" && (
          <section aria-label="Choose a case domain">
            {casesLoading ? (
              <p className="text-sm text-slate-400" role="status">Loading case domains...</p>
            ) : cases.length === 0 ? (
              <div className="glass-panel p-6 space-y-4">
                <p className="text-sm text-slate-300">No case domains are available right now.</p>
                <button type="button" onClick={() => void loadCases()} className="btn-secondary">Retry loading domains</button>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(620px,2fr)_minmax(280px,0.8fr)]">
                <div className="space-y-6">
                  {/* CASE 1: SPIRITUAL & LIFE DIRECTION HERO BANNER */}
                  <Link
                    href="/case/spiritual/intake/step-1"
                    className="block p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-black border-2 border-amber-500/60 shadow-2xl hover:border-amber-400 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-l from-amber-500 to-amber-600 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg">
                      ✨ Featured Case 1 · Dynamic Workflow
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        🔮
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-black text-amber-100 font-serif group-hover:text-amber-300 transition-colors">
                            Spiritual & Life Direction (መንፈሳዊ አቅጣጫ)
                          </h2>
                        </div>
                        <p className="text-sm text-stone-300 leading-relaxed max-w-2xl">
                          Full-functioning, real-time, adaptive divination workflow. Live Ge&apos;ez Fidel gematria calculation as you type,
                          16 Circles of Awde Negest, personalized talismanic lineages, AI follow-ups, and verified debtera review.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                            Live Gematria (የፊደል ሂሳብ)
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                            Awde Negest (አውደ ነገሥት)
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                            Verified Debtera Review
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                            Custom Healing Scroll PDF
                          </span>
                        </div>
                      </div>
                      <div className="hidden lg:flex flex-col items-end justify-center">
                        <span className="px-5 py-2.5 rounded-2xl bg-amber-500 text-black font-bold text-xs group-hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                          Begin Case 1 →
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold pt-2">
                    Additional Case Domains
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cases.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => void chooseDomain(item)}
                        disabled={loading}
                        className="glass-panel p-6 text-left hover:border-emerald-400/60 transition-colors disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-950/20 group"
                      >
                        <span className="text-3xl text-amber-300 group-hover:scale-110 transition-transform inline-block">
                          {item.icon}
                        </span>
                        <h2 className="text-xl font-bold text-white mt-4">{item.name}</h2>
                        <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.description}</p>
                        <div className="flex flex-wrap gap-2 mt-5">
                          {item.interests.slice(0, 3).map((interest) => (
                            <span key={interest} className="badge badge-safe normal-case tracking-normal">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="xl:pt-1">
                  {renderAiPanel()}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── PHASE: Challenge ────────────────────────────────────────────── */}
        {phase === "challenge" && selectedCase && (
          <section className="grid gap-6 xl:grid-cols-[minmax(640px,2fr)_minmax(280px,0.8fr)]">
            <section className="glass-panel p-6 md:p-8">
              <div className="badge badge-moderate mb-3">{selectedCase.name} · Common challenges</div>
              <h2 className="text-2xl font-bold text-white">Which pattern sounds closest?</h2>
              <p className="text-sm text-slate-400 mt-2 mb-6">
                This second step is tailored to the domain you selected.
              </p>
              <form onSubmit={submitChallenge} className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-semibold text-white">
                      {question.text}
                      {question.required && <span className="text-amber-400 ml-1">*</span>}
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {(question.options || []).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateAnswer(question.fieldId, option)}
                          disabled={loading || isSubmitting}
                          aria-pressed={answers[question.fieldId] === option}
                          className={`w-full text-left p-4 rounded-xl border transition-colors ${answers[question.fieldId] === option
                            ? "border-emerald-400 bg-emerald-500/15 text-white"
                            : "border-white/10 bg-black/25 text-slate-300 hover:border-white/30"
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  className="btn-primary mt-4"
                  disabled={loading || isSubmitting || !answers.challenge}
                >
                  {isSubmitting ? "Saving..." : "Continue to specific case"}
                </button>
              </form>
            </section>

            <div className="xl:pt-1">{renderAiPanel()}</div>
          </section>
        )}

        {/* ─── PHASE: Specific ─────────────────────────────────────────────── */}
        {phase === "specific" && selectedCase && (
          <section className="grid gap-6 xl:grid-cols-[minmax(640px,2fr)_minmax(280px,0.85fr)]">
            <section className="space-y-6">
              <div className="glass-panel p-6 md:p-8">
                <div className="badge badge-moderate mb-3">{selectedCase.name} · Specific case</div>
                <h2 className="text-2xl font-bold text-white">Tell us what you want to work on</h2>
                <p className="text-sm text-slate-400 mt-2 mb-6">
                  Your chosen interest will refine the report and recommendations.
                </p>

                <form onSubmit={submitSpecific} className="space-y-5" id="specific-case-form">
                  {/* ── wellbeing-domain purpose-built fields ── */}
                  {selectedCase.id === "wellbeing" ? (
                    <>
                      {/* Row 1: Age + Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="case-age" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                            How old are you? <span className="text-amber-400">*</span>
                          </label>
                          <input
                            id="case-age"
                            type="number"
                            min={1}
                            max={120}
                            value={String(answers.age ?? "")}
                            onChange={(e) => updateAnswer("age", e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 32"
                            required
                            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="case-location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                            Where are you currently living? <span className="text-amber-400">*</span>
                          </label>
                          <input
                            id="case-location"
                            type="text"
                            value={String(answers.location ?? "")}
                            onChange={(e) => updateAnswer("location", e.target.value)}
                            placeholder="e.g. Addis Ababa, Oromia Region…"
                            required
                            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      {/* Describe concern */}
                      <div className="space-y-1.5">
                        <label htmlFor="case-detail" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                          Describe the concern, including timing and what makes it better or worse <span className="text-amber-400">*</span>
                        </label>
                        <textarea
                          id="case-detail"
                          value={String(answers.detail ?? "")}
                          onChange={(e) => updateAnswer("detail", e.target.value)}
                          rows={4}
                          required
                          placeholder="e.g. head ache, repeatedly happen at mid day worsen by thirst…"
                          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-none"
                        />
                        {/* Live safety hints */}
                        {(assist.urgencyHint || assist.safetyFlags.length > 0 || assist.suggestions.length > 0) && (
                          <div className="mt-2 rounded-lg border border-sky-500/30 bg-sky-950/20 p-3 space-y-1.5">
                            {assist.urgencyHint && (
                              <p className="text-xs text-rose-300 flex items-center gap-1.5"><span>⚠️</span>{assist.urgencyHint}</p>
                            )}
                            {assist.safetyFlags.map((flag) => (
                              <p key={flag} className="text-xs text-amber-200 flex items-center gap-1.5"><span>⚠️</span>{flag}</p>
                            ))}
                            {assist.suggestions.map((suggestion) => (
                              <button
                                type="button"
                                key={suggestion}
                                onClick={() => updateAnswer("detail", `${String(answers.detail || "").trim()} ${suggestion}`.trim())}
                                className="block text-left text-xs text-sky-300 hover:text-sky-100 underline"
                              >
                                💡 {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Medicines */}
                      <div className="space-y-1.5">
                        <label htmlFor="case-medications" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                          List medicines, supplements, or herbs currently in use
                        </label>
                        <p className="text-xs text-slate-500">💡 Mention any medicines, herbs, or supplements you currently use.</p>
                        <textarea
                          id="case-medications"
                          value={String(answers.medications ?? "")}
                          onChange={(e) => updateAnswer("medications", e.target.value)}
                          rows={2}
                          placeholder="e.g. Metformin 500mg, Tena Adam tea, Vitamin D…"
                          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-none"
                        />
                      </div>

                      {/* Which area should shape recommendations */}
                      <div className="space-y-1.5">
                        <label htmlFor="case-interest" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                          Which area should shape the recommendations? <span className="text-amber-400">*</span>
                        </label>
                        <select
                          id="case-interest"
                          value={String(answers.selectedInterest ?? "")}
                          onChange={(e) => updateAnswer("selectedInterest", e.target.value)}
                          required
                          className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                        >
                          <option value="">Select one…</option>
                          {(questions.find((q) => q.fieldId === "selectedInterest")?.options ||
                            [
                              "Nutrition & Diet",
                              "Traditional Medicine Safety",
                              "Chronic Disease Management",
                              "Mental Wellness",
                              "Reproductive & Maternal wellbeing",
                              "Digestive wellbeing",
                              "Infectious Disease Prevention",
                              "Cardiovascular wellbeing",
                            ]
                          ).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Cultural reflection layer */}
                      <div className="space-y-2">
                        <p className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                          Would you like a cultural reflection layer included? <span className="text-amber-400">*</span>
                        </p>
                        <div className="flex gap-3">
                          {["Yes — include Domain B", "No — Scientific Domain A only"].map((opt) => {
                            const val = opt.startsWith("Yes") ? "yes" : "no";
                            const selected = String(answers.reflectionLens ?? "").toLowerCase() === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => updateAnswer("reflectionLens", val)}
                                className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${selected
                                  ? val === "yes"
                                    ? "border-amber-400 bg-amber-500/15 text-amber-200"
                                    : "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                                  : "border-white/10 bg-black/25 text-slate-400 hover:border-white/30"
                                  }`}
                              >
                                {val === "yes" ? "🌿 Yes" : "⚕️ No"} — {val === "yes" ? "include Domain B" : "Scientific only"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Non-wellbeing domains: generic question renderer */
                    renderQuestions()
                  )}

                  {/* ── Domain A / Domain B visual layer panels ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Domain A — Scientific */}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Scientific Domain A</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Biochemical · Nutritional · Ecological · Drug-Herb Safety · Mechanistic
                      </p>
                      <p className="text-[10px] text-emerald-400/70">Active — shapes Scientific report</p>
                    </div>

                    {/* Domain B — Cultural (opt-in only) */}
                    {String(answers.reflectionLens ?? "").toLowerCase() === "yes" && (
                      <div className="rounded-xl border border-amber-500/40 bg-amber-950/15 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Cultural Domain B</span>
                          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold">Firewalled</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Ge'ez calendar · Numerology · AwudeNegest · Traditional heritage
                        </p>
                        <p className="text-[10px] text-amber-400/70">
                          Opted in — enrichment layer only, never alters Scientific gaps
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Integrated client assessment ── */}
                  <section
                    className="rounded-2xl border border-emerald-500/25 bg-emerald-950/10 p-5 space-y-5"
                    aria-label="Integrated assessment tools"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="badge badge-safe mb-2">Integrated client assessment</div>
                        <h3 className="text-base font-bold text-white">Bring your wellbeing context into this case</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Profile fields from your personal, family, geographic, cultural, economic, wellbeing, and lifestyle
                          profile are sent as context. You can review and change them in Profile Edit.
                        </p>
                      </div>
                      <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                        AI Enhanced
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/8 bg-black/30 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Wellbeing Context</div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                          <div>
                            <span className="block text-slate-500">Name</span>
                            <span className="font-semibold text-white">{String(profileContext["Full name"] || profileContext.name || "Case client")}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Region</span>
                            <span className="font-semibold text-white">{String(profileContext["Region or state"] || answers.region || "Addis Ababa")}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Age</span>
                            <span className="font-semibold text-white">{String(answers.age ?? profileContext["Date of birth"] ?? "—")}</span>
                          </div>
                          <div>
                            <span className="block text-slate-500">Gender</span>
                            <span className="font-semibold text-white">{String(profileContext["Gender identity"] || "Prefer not to say")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-black/30 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Case Intake Snapshot</div>
                        <div className="mt-3 space-y-2 text-xs text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Selected challenge</span>
                            <span className="font-semibold text-white">{String(answers.challenge || "New job")}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Interest</span>
                            <span className="font-semibold text-white">{String(answers.selectedInterest || "General review")}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Care lens</span>
                            <span className="font-semibold text-white">{String(answers.reflectionLens || "Scientific only")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Scientific Attachments</div>
                        <div className="mt-3 text-xs text-sky-100 space-y-2">
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-300" /> Medications: {String(profileContext["Current medications"] || answers.medications || "None listed")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-300" /> History: {String(profileContext["Relevant medical history"] || "No known history")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-300" /> Allergies: {String(profileContext["Known allergies"] || "None reported")}</div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Lifestyle & Culture</div>
                        <div className="mt-3 text-xs text-amber-100 space-y-2">
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-300" /> Activity: {String(profileContext["Physical activity level"] || "moderate")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-300" /> Pregnancy/Lactation: {String(profileContext["Pregnancy or lactation status"] || "none")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-300" /> Altitude: {String(answers.altitudeMeters ?? "2400m")}</div>
                        </div>
                      </div>
                    </div>

                    {/* Show detail prefill from form */}
                    {String(answers.detail || "").trim() && (
                      <div className="rounded-lg bg-black/30 border border-white/8 px-4 py-2.5 text-xs text-slate-300 font-mono leading-relaxed">
                        <span className="text-slate-500">Narrative:</span> {String(answers.detail)}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void runEmbeddedDiagnostic()}
                        disabled={diagnosticLoading || isSubmitting}
                        className="btn-secondary text-sm"
                      >
                        {diagnosticLoading ? (
                          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />Analyzing...</span>
                        ) : "Run multi-strand diagnostic"}
                      </button>
                      {selectedCase?.id === "wellbeing" && (
                        <button
                          type="button"
                          onClick={() => void runEmbeddedIntake()}
                          disabled={intakeLoading || isSubmitting}
                          className="btn-secondary text-sm"
                        >
                          {intakeLoading ? (
                            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />Assessing...</span>
                          ) : "Run client intake assessment"}
                        </button>
                      )}
                    </div>

                    {diagnosticResult && (
                      <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-3 text-sm text-sky-100 flex items-start gap-2" role="status">
                        <span className="text-sky-400 mt-0.5">✓</span>
                        <span>
                          <strong>Diagnostic saved:</strong> {diagnosticResult.summary.problem} · Urgency{" "}
                          <span className={`font-semibold ${diagnosticResult.summary.urgency === "critical" ? "text-rose-300" :
                            diagnosticResult.summary.urgency === "high" ? "text-orange-300" :
                              diagnosticResult.summary.urgency === "medium" ? "text-amber-300" : "text-emerald-300"
                            }`}>{diagnosticResult.summary.urgency}</span>{" "}
                          · Confidence {Math.round(diagnosticResult.summary.confidence)}%
                        </span>
                      </div>
                    )}

                    {intakeResult && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 space-y-2" role="status">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-amber-400">✓</span>
                          <span className="text-amber-100 font-semibold">Client intake saved:</span>
                          <span className="text-amber-200/80 text-xs">{intakeResult.message || "Intake evaluated and wellbeing gap report generated successfully."}</span>
                        </div>
                        {intakeResult.reportId && (
                          <Link
                            href={`/report/${intakeResult.reportId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-100 transition-colors"
                          >
                            Open report →
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
                        <span>Live safety and completeness check</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-emerald-500/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Profile context loaded</span>
                        <span className="rounded-full border border-sky-500/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Diagnostic prepared</span>
                        <span className="rounded-full border border-amber-500/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">{String(answers.challenge ?? "New job")}</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-rose-500/30 bg-rose-950/10 p-3 text-xs text-rose-200">
                      <span className="text-rose-400">⚠️</span>
                      <span className="ml-2">Progress could not be saved yet; your step submission will retry it.</span>
                    </div>
                  </section>

                  {/* Progress save status */}
                  {answerSync !== "idle" && (
                    <p className={`text-xs flex items-center gap-1.5 ${answerSync === "error" ? "text-rose-300" :
                      answerSync === "saved" ? "text-emerald-400" : "text-slate-400"
                      }`} role="status">
                      {answerSync === "saving" && <><span className="w-2 h-2 rounded-full border border-slate-400 border-t-transparent animate-spin" />Saving your progress...</>}
                      {answerSync === "saved" && <><span>✓</span> Progress saved</>}
                      {answerSync === "error" && "Progress could not be saved yet; your step submission will retry it."}
                    </p>
                  )}

                  {/* Voice input */}
                  <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-950/10 px-4 py-3">
                    <span className="text-xs font-semibold text-sky-300">Live safety and completeness check</span>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`btn-secondary text-xs ${listening ? "border-rose-400 text-rose-200 bg-rose-950/30" : ""
                        }`}
                    >
                      {listening ? "⏹️ Stop listening" : "🎤 Use voice input"}
                    </button>
                  </div>
                  {listening && (
                    <div className="flex items-center gap-2 text-xs text-sky-300 px-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                      Listening… speak now
                      {transcript && <span className="text-slate-400 ml-2">Transcript: {transcript}</span>}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-base"
                    disabled={loading || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Preparing review…
                      </span>
                    ) : "Prepare my report for review"}
                  </button>
                </form>
              </div>
            </section>

            <div className="xl:pt-1">
              {renderAiPanel()}
            </div>
          </section>
        )}

        {/* ─── PHASE: Report, Causes, Solutions, Complete ──────────────────── */}
        {(phase === "report" || phase === "causes" || phase === "solutions" || phase === "complete") &&
          session &&
          selectedCase && (
            <section className="space-y-6">
              {/* Report Header */}
              <div className="glass-panel p-6 md:p-8 border-l-4 border-l-emerald-400">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="badge badge-safe mb-3">
                      {phase === "report" && "Report ready for review"}
                      {phase === "causes" && "Findings refinement"}
                      {phase === "solutions" && "Solution review"}
                      {phase === "complete" && "Case complete"}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedCase.name} case synthesis
                    </h2>
                    <p className="text-sm text-slate-400 mt-2">
                      Challenge: <strong className="text-white">{String(session.answers.challenge)}</strong> · Interest:{" "}
                      <strong className="text-white">{String(session.answers.selectedInterest)}</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-right text-xs text-slate-400">
                    <div>
                      <div>Domain A: {session.workflowContext?.domainA.length ?? selectedCase.knowledgeStrandFilters.length} strands</div>
                      <div>Domain B: {session.workflowContext?.domainB.length ? `${session.workflowContext.domainB.length} strands (opted in)` : "Not included"}</div>
                    </div>
                    <button
                      type="button"
                      onClick={exportSession}
                      className="btn-secondary text-xs"
                    >
                      Export JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn-secondary text-xs"
                    >
                      Print / PDF
                    </button>
                    <button
                      type="button"
                      onClick={resetWorkflow}
                      className="btn-secondary text-xs text-rose-300 border-rose-500/30 hover:border-rose-400"
                    >
                      Reset case
                    </button>
                  </div>
                </div>

                {/* Safety Note */}
                {session.workflowContext && session.workflowContext.safety.level !== "low" && (
                  <div
                    className={`mt-6 p-4 rounded-xl border text-sm ${session.workflowContext.safety.level === "critical"
                      ? "border-rose-500/40 bg-rose-950/30 text-rose-200"
                      : "border-amber-500/40 bg-amber-950/20 text-amber-200"
                      }`}
                  >
                    <strong>
                      {session.workflowContext.safety.level === "critical" ? "Urgent safety signal" : "Safety note"}:
                    </strong>{" "}
                    {session.workflowContext.safety.recommendation}
                  </div>
                )}

                <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${workflowStatus.accent}`} />
                      Case overview
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Main concern</p>
                        <p className="mt-2 text-lg font-semibold text-white">{String(session.answers.challenge ?? "Selected issue")}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/8 bg-slate-950/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Relevant interest</p>
                          <p className="mt-2 text-sm font-medium text-slate-100">{String(session.answers.selectedInterest ?? "General review")}</p>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-slate-950/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Risk level</p>
                          <p className="mt-2 text-sm font-medium text-slate-100">{workflowStatus.label}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-sky-500/25 bg-sky-950/15 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Recommended next action</div>
                    <p className="mt-4 text-sm leading-relaxed text-sky-50">{workflowStatus.action}</p>
                  </div>
                </div>

                <div className="mt-6">
                  {renderSummaryCards()}
                </div>

                {session.profileSynthesis && (
                  <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-950/10 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Identity + geographic synthesis</div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Name</div>
                        <div className="mt-2 text-sm font-semibold text-white">{session.profileSynthesis.identity.name}</div>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Mother name</div>
                        <div className="mt-2 text-sm font-semibold text-white">{session.profileSynthesis.identity.motherName || "Not provided"}</div>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Birth data</div>
                        <div className="mt-2 text-sm font-semibold text-white">{session.profileSynthesis.identity.birthDate}</div>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Birthplace</div>
                        <div className="mt-2 text-sm font-semibold text-white">{session.profileSynthesis.geography.city}</div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/30 p-4">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Narrative</div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{session.profileSynthesis.summary}</p>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {session.profileSynthesis.chart.map((point) => (
                        <div key={point.key} className="rounded-xl border border-white/8 bg-black/25 p-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{point.label}</div>
                          <div className="mt-2 text-xl font-bold text-white">{point.value}</div>
                          <div className="mt-2 text-[11px] leading-relaxed text-slate-400">{point.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Key findings</div>
                    <ul className="mt-4 space-y-3">
                      {activeFindings.length > 0 ? activeFindings.map((cause) => (
                        <li key={cause.id} className="rounded-xl border border-white/8 bg-slate-950/30 p-3">
                          <div className="text-sm font-semibold text-white">{cause.description}</div>
                          <div className="mt-2 text-xs text-slate-400">Confidence {Math.round(cause.confidence * 100)}%</div>
                          {cause.culturalContext && (
                            <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/15 p-3">
                              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Domain B cultural context</div>
                              <p className="mt-1 text-xs leading-relaxed text-amber-100/80">{cause.culturalContext.interpretation}</p>
                              <p className="mt-2 text-[11px] leading-relaxed text-amber-200/70">Reflection: {cause.culturalContext.practice}</p>
                            </div>
                          )}
                        </li>
                      )) : (
                        <li className="rounded-xl border border-white/8 bg-slate-950/30 p-3 text-sm text-slate-300">
                          Selected findings will appear here once the report is refined.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recommended actions</div>
                    <ul className="mt-4 space-y-3">
                      {activeSolutions.length > 0 ? activeSolutions.map((solution) => (
                        <li key={solution.id} className="rounded-xl border border-white/8 bg-slate-950/30 p-3">
                          <div className="text-sm font-semibold text-white">{solution.title}</div>
                          <div className="mt-2 text-xs text-slate-400">{solution.description}</div>
                        </li>
                      )) : (
                        <li className="rounded-xl border border-white/8 bg-slate-950/30 p-3 text-sm text-slate-300">
                          Tailored options will appear after the findings are confirmed.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/5 text-sm text-slate-300">
                  The report organizes possible contributing patterns and options. It is a review step,
                  not a diagnosis, legal advice, financial advice, or guaranteed outcome.
                </div>

                {phase === "report" && (
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      type="button"
                      onClick={confirmReport}
                      className="btn-primary"
                      disabled={loading}
                    >
                      Confirm report and refine the result
                    </button>
                    <button
                      type="button"
                      onClick={editReport}
                      className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:border-emerald-400 hover:text-white"
                      disabled={loading}
                    >
                      Edit case details
                    </button>
                  </div>
                )}
              </div>

              <AwudeHeritageContext compact />

              {/* Causes Refinement */}
              {(phase === "causes" || phase === "solutions" || phase === "complete") && (
                <form onSubmit={refineCase} className="glass-panel p-6 md:p-8">
                  <div className="badge badge-moderate mb-3">Refine the result</div>
                  <h2 className="text-xl font-bold text-white">Which findings should guide the next step?</h2>
                  <p className="text-sm text-slate-400 mt-1 mb-5">
                    Select the causes that resonate with your situation. Deselect any that feel unrelated.
                  </p>
                  <div className="space-y-3">
                    {session.causes.map((cause) => (
                      <label
                        key={cause.id}
                        className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedCauseIds.includes(cause.id)
                          ? "border-emerald-400 bg-emerald-500/10"
                          : "border-white/10 bg-black/25 hover:border-white/20"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCauseIds.includes(cause.id)}
                          onChange={() => toggleSelection(setSelectedCauseIds, cause.id)}
                          className="mt-1 accent-emerald-500"
                        />
                        <span>
                          <strong className="text-white text-sm">{cause.description}</strong>
                          <span className="block text-xs text-slate-500 mt-1">
                            Confidence {Math.round(cause.confidence * 100)}% ·{" "}
                            {cause.evidence.join(" · ")}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {phase === "causes" && (
                    <button
                      type="submit"
                      className="btn-primary mt-6"
                      disabled={loading || selectedCauseIds.length === 0}
                    >
                      {loading ? "Generating options..." : "Show tailored solutions"}
                    </button>
                  )}
                </form>
              )}

              {/* Solutions Selection */}
              {(phase === "solutions" || phase === "complete") && (
                <form onSubmit={finalizeSolutions} className="glass-panel p-6 md:p-8">
                  <div className="badge badge-safe mb-3">Solution review</div>
                  <h2 className="text-xl font-bold text-white">Choose what you want to take forward</h2>
                  <p className="text-sm text-slate-400 mt-1 mb-5">
                    Select the solutions that feel most actionable and aligned with your goals.
                  </p>
                  <div className="space-y-3">
                    {session.solutions.map((solution) => (
                      <label
                        key={solution.id}
                        className={`block p-4 rounded-xl border cursor-pointer transition-colors ${selectedSolutionIds.includes(solution.id)
                          ? "border-amber-400 bg-amber-500/10"
                          : "border-white/10 bg-black/25 hover:border-white/20"
                          }`}
                      >
                        <div className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSolutionIds.includes(solution.id)}
                            onChange={() => toggleSelection(setSelectedSolutionIds, solution.id)}
                            className="mt-1 accent-amber-500"
                          />
                          <span>
                            <strong className="text-white text-sm">{solution.title}</strong>
                            <span className="block text-sm text-slate-300 mt-2">
                              {solution.description}
                            </span>
                            <span className="block text-xs text-slate-500 mt-2">
                              {solution.steps.join(" · ")}
                            </span>
                            {solution.culturalContext && (
                              <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-950/15 p-3">
                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Cultural and reflective layer</div>
                                <p className="mt-1 text-xs leading-relaxed text-amber-100/80">{solution.culturalContext.interpretation}</p>
                                <p className="mt-2 text-[11px] leading-relaxed text-amber-200/70">Reflection: {solution.culturalContext.practice}</p>
                              </div>
                            )}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {phase === "solutions" && (
                    <button
                      type="submit"
                      className="btn-primary mt-6"
                      disabled={loading || selectedSolutionIds.length === 0}
                    >
                      {loading ? "Saving choices..." : "Accept selected solutions"}
                    </button>
                  )}
                  {phase === "complete" && (
                    <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-200">
                      ✅ Your selected path is saved for review. You can revisit the case and change
                      the choices as your situation changes.
                    </div>
                  )}
                </form>
              )}
            </section>
          )}

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap justify-between text-xs text-slate-500 gap-4">
          <Link href="/" className="hover:text-white inline-flex items-center gap-1">
            ← Back to overview
          </Link>
          <Link href="/diagnostic" className="hover:text-white inline-flex items-center gap-1">
            Open multi-strand diagnostic →
          </Link>
          <button
            onClick={resetWorkflow}
            className="hover:text-rose-300 transition-colors"
          >
            Reset workflow
          </button>
        </div>
      </div>
    </div>
  );
}