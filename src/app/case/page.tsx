"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EmergencyHelp } from "@/components/safety/EmergencyHelp";
import Link from "next/link";
import type { CaseDefinition, CaseSession, Question } from "@/lib/case-workflow/engine";
import type { DiagnosticSolution } from "@/lib/knowledge/types";
import AwudeHeritageContext from "@/components/cultural/AwudeHeritageContext";
import { HatataMenafsestViewer } from "@/components/cultural/HatataMenafsestViewer";
import { TelsemLibraryViewer } from "@/components/cultural/TelsemLibraryViewer";
import { AwdeCircleVisualizer } from "@/components/cultural/AwdeCircleVisualizer";
import { AWDE_NEGEST_CIRCLES } from "@/lib/cultural/spiritualDivinationEngine";
import { EthiopianLocationInput } from "@/components/location/EthiopianLocationInput";
import { estimateAgroEcology } from "@/lib/location/regions";
import { clearQueued, isQueued, queuePut, startOutboxSync } from "@/lib/offline/outbox";
import { withBasePath } from '@/lib/base-path';

type Answers = Record<string, unknown>;
type Phase = "domain" | "challenge" | "specific" | "endorsement" | "report" | "causes" | "solutions" | "complete";
type SummaryReviewCard = {
  id: string;
  headline: string;
  domain: string;
  subDomain: string;
  userIntention: string;
  keySymptoms: string[];
  urgencyFlag: "none" | "watch" | "urgent" | "emergency";
  suggestedStrandDetails: Array<{ strand: string; tier: "biomedical" | "evidence-informed" | "traditional" | "cultural"; rationale: string }>;
};
type VoiceRecognition = {
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

const CASE_DRAFT_KEY = "Debtera-active-case-draft";

function asText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => {
        const text = asText(nestedValue);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean)
      .join("; ");
  }
  return "";
}

function isDomainBCaseCause(cause: { category?: string; description?: string }): boolean {
  return /^(cultural|astrological|domain b)$/i.test(cause.category || "") ||
    /^(afere\b|.*d[äa]bt[äa]ra.*healing scroll)/i.test(cause.description || "");
}

function asStringList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,\n;]/) : [];
  return values
    .map((item) => String(item).trim())
    .filter((item) => item && !/^(none|none known|no known|n\/a|not applicable|prefer not to say)$/i.test(item));
}

function withoutIdentityFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutIdentityFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !/gender|religion/i.test(key))
      .map(([key, nestedValue]) => [key, withoutIdentityFields(nestedValue)]),
  );
}

function ageFromBirthDate(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  if (now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())) age--;
  return age >= 0 && age <= 120 ? age : undefined;
}

function buildCaseAnalysisQuery(caseDefinition: CaseDefinition | null, answers: Answers): string {
  const internalFields = new Set(["diagnosticAssessment", "clientIntakeAssessment"]);
  const preferredFields = [
    "challenge", "detail", "selectedInterest", "age", "location", "region",
    "medications", "allergies", "medicalHistory", "barrier", "support",
  ];
  const fields = [...new Set([...preferredFields, ...Object.keys(answers)])]
    .filter((field) => !internalFields.has(field) && answers[field] !== undefined && answers[field] !== "");
  const lines = [
    `Case domain: ${caseDefinition?.name ?? "Wellbeing"}`,
    ...fields.map((field) => `${field}: ${asText(answers[field])}`).filter((line) => !line.endsWith(": ")),
  ];
  return lines.join("\n").slice(0, 3000);
}

const PHASE_LABELS: Record<Phase, string> = {
  domain: "Choose care path",
  challenge: "Select the challenge",
  specific: "Your case story",
  endorsement: "Confirm your summary",
  report: "Review the guidance",
  causes: "Refine the findings",
  solutions: "Choose practical actions",
  complete: "Complete",
};

const PHASE_ICONS: Record<Phase, string> = {
  domain: "📋",
  challenge: "🎯",
  specific: "✍️",
  endorsement: "✓",
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
  const [answerSync, setAnswerSync] = useState<"idle" | "saving" | "saved" | "queued" | "error">("idle");
  const [profileContext, setProfileContext] = useState<Record<string, unknown>>({});
  const [includeIdentityContext, setIncludeIdentityContext] = useState(false);
  const [profileContextLoaded, setProfileContextLoaded] = useState(false);
  const [profileContextError, setProfileContextError] = useState("");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticSolution | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeResult, setIntakeResult] = useState<{ reportId?: string; message?: string } | null>(null);
  const [summaryReview, setSummaryReview] = useState<SummaryReviewCard | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftNeedsReanalysis, setDraftNeedsReanalysis] = useState(false);
  const [activeHubView, setActiveHubView] = useState<"intake" | "hatata" | "telsem" | "awde">("intake");
  const [domainFilter, setDomainFilter] = useState<"all" | "flagship" | "health" | "purpose" | "legal_social">("all");
  const recognitionRef = useRef<VoiceRecognition | null>(null);

  const isCrisisNarrative = useMemo(() => {
    const text = `${String(answers.detail || "")} ${String(answers.challenge || "")}`.toLowerCase();
    const triggers = ["suicide", "kill myself", "end my life", "harm myself", "severe abuse", "assault", "violence", "threatened to kill", "domestic violence", "immediate danger"];
    return triggers.some((t) => text.includes(t));
  }, [answers.detail, answers.challenge]);

  // ── Effects ──────────────────────────────────────────────────────────────
  async function loadCases() {
    setCasesLoading(true);
    setError("");
    try {
      const response = await fetch(withBasePath("/api/cases"), { credentials: "include", cache: "no-store" });
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
          requiresReanalysis?: boolean;
        };
        if (draft.selectedCase && draft.session && draft.phase && draft.phase !== "complete") {
          const diagnosticAssessment = draft.session.answers.diagnosticAssessment as {
            causes?: Array<{ name?: string; domain?: string }>;
          } | undefined;
          const hasLegacyCulturalFindings = draft.session.causes.some(isDomainBCaseCause) ||
            diagnosticAssessment?.causes?.some((cause) => isDomainBCaseCause({
              category: cause.domain,
              description: cause.name,
            })) === true;
          const restoredSession = hasLegacyCulturalFindings
            ? {
                ...draft.session,
                answers: { ...draft.session.answers },
                causes: [],
                solutions: [],
                reportConfirmed: false,
                selectedSolutionIds: [],
                currentStep: "specialized" as const,
                profileSynthesis: undefined,
              }
            : draft.session;
          const restoredAnswers = { ...(draft.answers || {}) };
          if (hasLegacyCulturalFindings) {
            delete restoredAnswers.diagnosticAssessment;
            delete restoredSession.answers.diagnosticAssessment;
          }
          setSelectedCase(draft.selectedCase);
          setSession(restoredSession);
          setQuestions(draft.questions || []);
          setAnswers(restoredAnswers);
          setPhase(hasLegacyCulturalFindings ? "specific" : draft.phase);
          setSelectedCauseIds(hasLegacyCulturalFindings ? [] : draft.selectedCauseIds || []);
          setSelectedSolutionIds(hasLegacyCulturalFindings ? [] : draft.selectedSolutionIds || []);
          setDraftNeedsReanalysis(hasLegacyCulturalFindings || draft.requiresReanalysis === true);
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
      JSON.stringify({ selectedCase, session, questions, answers, phase, selectedCauseIds, selectedSolutionIds, requiresReanalysis: draftNeedsReanalysis }),
    );
  }, [draftLoaded, selectedCase, session, questions, answers, phase, selectedCauseIds, selectedSolutionIds, draftNeedsReanalysis]);

  useEffect(() => {
    Promise.all([
      fetch(withBasePath("/api/profile"), { credentials: "include", cache: "no-store" }),
      fetch(withBasePath("/api/auth/me"), { credentials: "include", cache: "no-store" }),
    ])
      .then(async ([profileResponse, authResponse]) => ({
        profile: profileResponse.ok ? await profileResponse.json() : null,
        auth: authResponse.ok ? await authResponse.json() : null,
      }))
      .then(({ profile, auth }) => {
        if (!profile?.success) {
          setProfileContextError("Your saved profile could not be loaded. Analysis will use the answers in this case intake.");
          return;
        }
        const values = profile.data || {};
        const savedProfile = values.profile && typeof values.profile === "object"
          ? values.profile as Record<string, unknown>
          : {};
        const savedConsent = savedProfile.consent && typeof savedProfile.consent === "object"
          ? savedProfile.consent as Record<string, unknown>
          : {};
        const savedData = values.data && typeof values.data === "object"
          ? values.data as Record<string, unknown>
          : {};
        const labeled = (profile.fields || []).reduce((context: Record<string, unknown>, field: { id: string; label: string }) => {
          if (values[field.id] !== undefined) context[field.label] = values[field.id];
          return context;
        }, {});
        setProfileContext({
          ...labeled,
          ...values,
          ...auth?.data,
          identityContextConsent: savedConsent.identityContext === true,
          identityGender: typeof values.gender === "string" ? values.gender : "",
          identityReligion: typeof values.religion === "string"
            ? values.religion
            : typeof savedData.religion === "string"
              ? savedData.religion
              : "",
        });
      })
      .catch(() => {
        setProfileContextError("Your saved profile could not be loaded. Analysis will use the answers in this case intake.");
      })
      .finally(() => setProfileContextLoaded(true));
  }, []);

  // Persist each field shortly after it changes so progress survives navigation or refresh.
  // Without a connection the save is kept on this device and sent when the connection returns.
  useEffect(() => {
    if (!session || Object.keys(answers).length === 0) return;
    const url = `/api/session/${session.id}/answers`;
    const timer = window.setTimeout(async () => {
      setAnswerSync("saving");
      try {
        const response = await fetch(withBasePath(url), {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (response.status >= 500) throw new Error("Unable to save field changes.");
        if (!response.ok) {
          setAnswerSync("error");
          return;
        }
        clearQueued(url);
        setAnswerSync("saved");
      } catch {
        queuePut(url, { answers });
        setAnswerSync("queued");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, session]);

  // Send saves kept on this device once the connection or the tab comes back.
  useEffect(() => {
    if (!session) return;
    const url = `/api/session/${session.id}/answers`;
    return startOutboxSync(() => {
      if (!isQueued(url)) setAnswerSync((current) => (current === "queued" ? "saved" : current));
    });
  }, [session]);

  // Live assistance when typing detail
  useEffect(() => {
    const detail = String(answers.detail || "");
    if (detail.length < 10) {
      setAssist({ suggestions: [], urgencyHint: "", safetyFlags: [] });
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(withBasePath(`/api/diagnostic/assist?query=${encodeURIComponent(detail)}`));
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
        tone: "text-brand-strong border-brand/40 bg-brand-soft",
        accent: "bg-brand",
        action: "Continue with the selected findings and monitor the plan over time.",
      },
      moderate: {
        label: "Monitor closely",
        tone: "text-gold-strong border-gold/40 bg-gold-soft",
        accent: "bg-gold-fill",
        action: "Review the findings in context and consider a follow-up check-in or additional assessment.",
      },
      high: {
        label: "Watch closely",
        tone: "text-warning-strong border-warning/40 bg-warning-soft",
        accent: "bg-warning",
        action: "Prioritize a timely review and consider escalating care if symptoms worsen or become urgent.",
      },
      critical: {
        label: "Urgent attention",
        tone: "text-danger-strong border-danger/40 bg-danger-soft",
        accent: "bg-danger",
        action: "This case shows an urgent or high-risk pattern; encourage immediate Scientific attention or emergency support.",
      },
    };
    return meta[level] ?? meta.low;
  }, [session]);

  const reportCauses = useMemo(
    () => session?.causes.filter((cause) => !isDomainBCaseCause(cause)) ?? [],
    [session],
  );
  const activeFindings = useMemo(
    () => reportCauses.filter((cause) => cause.isSelected).slice(0, 3),
    [reportCauses],
  );

  const activeSolutions = useMemo(
    () => session?.solutions.filter((solution) => selectedSolutionIds.includes(solution.id) || phase === "solutions" || phase === "complete").slice(0, 3) ?? [],
    [phase, selectedSolutionIds, session],
  );
  const reportDiagnostic = session?.answers.diagnosticAssessment as DiagnosticSolution | undefined;
  const diagnosticActionGroups = reportDiagnostic?.action_plan
    ? [
        { key: "immediate_actions", label: "Now · 0–24 hours" },
        { key: "short_term", label: "Short term · 3–7 days" },
        { key: "medium_term", label: "Medium term · 1–4 weeks" },
        { key: "long_term", label: "Long term · 1–6 months" },
        { key: "ongoing", label: "Ongoing" },
      ] as const
    : [];

  async function readJson(url: string, options?: RequestInit) {
    const response = await fetch(withBasePath(url), options);
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
      setIncludeIdentityContext(false);
      // Pre‑fill challenge options if the user has already answered? No, start fresh.
      setAnswers({});
      setDiagnosticResult(null);
      setIntakeResult(null);
      setDraftNeedsReanalysis(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start this case.");
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(fieldId: string, value: unknown) {
    if (fieldId !== "diagnosticAssessment") setDiagnosticResult(null);
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  async function requestEmbeddedDiagnostic(query: string) {
    if (query.length < 2) {
      throw new Error("Describe the case before running the diagnostic assessment.");
    }
    const response = await fetch(withBasePath("/api/diagnostic/analyze"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        mode: "text",
        userProfile: {
          demographics: {
            age: Number(answers.age) || ageFromBirthDate(profileContext["Date of birth"] || profileContext.birthDate),
            region: asText(answers.region || profileContext["Region or state"]) || undefined,
          },
          medications: [...new Set([
            ...asStringList(profileContext["Current medications"]),
            ...asStringList(answers.medications),
          ])],
          wellbeing: {
            allergies: asStringList(profileContext["Known allergies"] || answers.allergies),
            conditions: asStringList(profileContext["Relevant medical history"] || answers.medicalHistory),
            pregnant: /^(yes|pregnant|lactating|breastfeeding)/i.test(asText(profileContext["Pregnancy or lactation status"])),
          },
          location: {
            region: asText(answers.region || profileContext["Region or state"]) || "Unspecified",
            city: asText(answers.location) || undefined,
            altitude: Number(answers.altitudeMeters) || undefined,
          },
          lifestyle: {
            diet: asText(profileContext["Dietary pattern"] || profileContext["Diet"]),
            activity: asText(profileContext["Physical activity level"]),
          },
          name: profileContext["Full name"] || profileContext.name,
          fullName: profileContext["Full name"] || profileContext.fullName,
          birthDate: profileContext["Date of birth"] || profileContext.birthDate,
          profileContext: withoutIdentityFields(profileContext),
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
      const result = await requestEmbeddedDiagnostic(buildCaseAnalysisQuery(selectedCase, answers));
      setDiagnosticResult(result);
      updateAnswer("diagnosticAssessment", result);
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
      const email = asText(profileContext.email);
      if (!email) {
        throw new Error("Your account email is unavailable. Reload your profile before creating a saved intake assessment.");
      }
      const pregnancyContext = asText(profileContext["Pregnancy or lactation status"]).toLowerCase();
      const pregnancyOrLactation = pregnancyContext.includes("lactat") || pregnancyContext.includes("breastfeed")
        ? "lactating"
        : pregnancyContext.includes("pregnant")
          ? pregnancyContext.includes("third") || pregnancyContext.includes("trimester 3") || pregnancyContext.includes("t3")
            ? "pregnant_t3"
            : pregnancyContext.includes("second") || pregnancyContext.includes("trimester 2") || pregnancyContext.includes("t2")
              ? "pregnant_t2"
              : "pregnant_t1"
          : pregnancyContext === "none"
            ? "none"
            : undefined;
      const activityValue = asText(profileContext["Physical activity level"]).toLowerCase();
      const culturalOptIn = String(answers.reflectionLens || "").toLowerCase().includes("yes");
      const response = await fetch(withBasePath("/api/intake"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: asText(profileContext["Full name"] || profileContext.name) || undefined,
          email,
          age: Number(answers.age) || ageFromBirthDate(profileContext["Date of birth"] || profileContext.birthDate),
          city: asText(answers.location) || undefined,
          weightKg: Number(profileContext["Weight (kg)"] || 0) || undefined,
          region: asText(answers.region || profileContext["Region or state"]) || undefined,
          altitudeMeters: Number(answers.altitudeMeters) || undefined,
          activityLevel: ["sedentary", "moderate", "active", "very_active"].includes(activityValue) ? activityValue : undefined,
          pregnancyOrLactation,
          medications: [...new Set([...asStringList(profileContext["Current medications"]), ...asStringList(answers.medications)])],
          medicalHistory: asStringList(profileContext["Relevant medical history"] || answers.medicalHistory),
          allergies: asStringList(profileContext["Known allergies"] || answers.allergies),
          lifestyleHabits: {
            activity: activityValue || undefined,
            diet: asText(profileContext["Dietary pattern"] || profileContext["Diet"]) || undefined,
            caseAnswers: answers,
          },
          includeCultural: culturalOptIn,
          cultural: culturalOptIn
            ? {
                fullName: asText(profileContext["Full name"] || profileContext.name) || undefined,
                birthDate: asText(profileContext["Date of birth"] || profileContext.birthDate) || undefined,
                birthTime: asText(profileContext["Birth time"] || profileContext.birthTime) || undefined,
                birthLocation: asText(profileContext["Birth place"] || profileContext.birthPlace) || undefined,
                culturalCalendarPreference: asText(profileContext["Preferred cultural calendar"]) || undefined,
              }
            : undefined,
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
      const narrative = [
        String(answers.challenge || ""),
        String(answers.detail || ""),
        String(answers.medications || ""),
      ].filter(Boolean).join("\n");
      const summaryResponse = await fetch(withBasePath("/api/case/summary"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          narrative,
          preferredLanguage: String(profileContext.preferredLanguage || "en").startsWith("am") ? "am" : "en",
          inputMode: "text",
        }),
      });
      const summaryPayload = await summaryResponse.json();
      if (!summaryResponse.ok || !summaryPayload.success) {
        throw new Error(summaryPayload.error || "Unable to prepare your case summary.");
      }
      if (summaryPayload.data.isCrisis) {
        window.location.assign(withBasePath(summaryPayload.data.emergencyRoute || "/emergency"));
        return;
      }
      setSummaryReview(summaryPayload.data.card as SummaryReviewCard);
      setPhase("endorsement");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to prepare the case summary.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function endorseSummaryAndContinue() {
    if (!session || !summaryReview) return;
    setIsSubmitting(true);
    setError("");
    try {
      const endorsementResponse = await fetch(withBasePath(`/api/case/summary/${summaryReview.id}/endorse`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ confirmed: true }),
      });
      const endorsementPayload = await endorsementResponse.json();
      if (!endorsementResponse.ok || !endorsementPayload.success) {
        throw new Error(endorsementPayload.error || "Please review the summary before continuing.");
      }

      const latestDiagnostic = await requestEmbeddedDiagnostic(buildCaseAnalysisQuery(selectedCase, answers));
      setDiagnosticResult(latestDiagnostic);
      const mergedAnswers = { ...answers, diagnosticAssessment: latestDiagnostic };
      const updated = await readJson(`/api/session/${session.id}/answers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: mergedAnswers }),
      }) as CaseSession;
      const report = await readJson(`/api/session/${updated.id}/process`, { method: "POST" }) as CaseSession;
      setSession(report);
      setSelectedCauseIds(report.causes.map((cause) => cause.id));
      setPhase("report");
      setDraftNeedsReanalysis(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to confirm the summary and prepare the report.");
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
    setDraftNeedsReanalysis(false);
    setError("");
    setAssist({ suggestions: [], urgencyHint: "", safetyFlags: [] });
    window.localStorage.removeItem(CASE_DRAFT_KEY);
    setDraftAvailable(false);
  }

  function discardDraft() {
    window.localStorage.removeItem(CASE_DRAFT_KEY);
    setDraftAvailable(false);
    setDraftNeedsReanalysis(false);
  }

  function renderQuestions() {
    return questions.map((question) => (
      <div key={question.id} className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          {question.text}
          {question.required && <span className="text-gold ml-1">*</span>}
        </label>
        {question.type === "textarea" ? (
          <textarea
            value={String(answers[question.fieldId] ?? "")}
            onChange={(e) => updateAnswer(question.fieldId, e.target.value)}
            rows={5}
            className="w-full rounded-xl bg-sunken/80 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors"
            placeholder="Describe your situation in detail..."
          />
        ) : question.type === "select" ? (
          <select
            value={String(answers[question.fieldId] ?? "")}
            onChange={(e) => updateAnswer(question.fieldId, e.target.value)}
            className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors"
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
            className="w-full rounded-xl bg-sunken/80 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors"
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
        label: "Signal match",
        value: `${Math.round((reportCauses.reduce((sum, cause) => sum + cause.confidence, 0) / Math.max(reportCauses.length, 1)) * 100)}%`,
        tone: "border-info/30 bg-info-soft/70 text-info-strong",
      },
      {
        label: "Findings",
        value: `${reportCauses.filter((cause) => cause.isSelected).length}`,
        tone: "border-plum/30 bg-plum-soft/70 text-plum-strong",
      },
      {
        label: "Next action",
        value: activeSolutions[0]?.title ?? "Review and refine",
        tone: "border-gold/30 bg-gold-soft/70 text-gold-strong",
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl border p-4 ${card.tone}`}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-soft">{card.label}</div>
            <div className="mt-3 text-base font-semibold text-foreground leading-snug">{card.value}</div>
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
      ? "text-danger-strong border-danger/40 bg-danger-soft"
      : currentUrgency === "high"
        ? "text-warning-strong border-warning/40 bg-warning-soft"
        : currentUrgency === "medium"
          ? "text-gold-strong border-gold/40 bg-gold-soft"
          : "text-brand-strong border-brand/40 bg-brand-soft";

    const wellbeingContextLoaded = Boolean(profileContext && Object.keys(profileContext).length > 0);
    const hasDiagnostic = Boolean(diagnosticResult);
    const aiSignals = diagnosticResult?.summary?.matchedSignals?.slice(0, 3) ??
      assist.suggestions.slice(0, 3) ??
      ["Clarify the main challenge", "Map care priorities", "Confirm the preferred care pathway"];

    return (
      <aside className="glass-panel p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">AI Case Intelligence</div>
            <div className="mt-2 text-lg font-bold text-foreground font-serif">{currentDomain}</div>
          </div>
          <span className="rounded-full border border-brand/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
            Live
          </span>
        </div>

        <div className={`rounded-2xl border p-4 ${urgencyTone}`}>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Signal</div>
          <div className="mt-2 text-sm font-bold text-foreground">{String(currentUrgency).toUpperCase()}</div>
        </div>

        <div className="rounded-2xl border border-border bg-sunken/50 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">Analysis Lens</div>
          <p className="mt-3 text-sm leading-6 text-soft">
            {currentSummary}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/30 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">AI Response Stream</div>
          <div className="mt-3 space-y-2">
            {aiSignals.map((item) => (
              <div key={String(item)} className="flex items-center gap-2 text-xs text-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-fill" />
                <span>{String(item)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand/25 bg-brand-soft/70 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Care Readiness</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-soft">
              {!profileContextLoaded ? "Loading profile" : wellbeingContextLoaded ? "Profile loaded" : "Intake only"}
            </span>
            <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-soft">
              {hasDiagnostic ? "Diagnostic" : "No diagnostic"}
            </span>
          </div>
        </div>

        {diagnosticResult && (
          <div className="rounded-2xl border border-info/30 bg-info-soft/70 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-info">Scientific Fit</div>
            <div className="mt-2 text-sm font-bold text-foreground">
              {diagnosticResult.summary.confidence > 0
                ? `Signal strength ${Math.round(diagnosticResult.summary.confidence)}%`
                : "Not enough relevant evidence for a match"}
            </div>
            <div className="mt-2 text-[11px] text-info-strong">
              {diagnosticResult.summary.intent || "Scientific reasoning loaded"}
            </div>
          </div>
        )}

        {assist.safetyFlags.length > 0 && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft/70 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-danger">Safety Signals</div>
            <div className="mt-2 space-y-1">
              {assist.safetyFlags.slice(0, 3).map((flag) => (
                <div key={flag} className="text-[11px] text-danger-strong">• {String(flag)}</div>
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

        {/* Hub View Switcher & Companion Heritage Tools */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-2 rounded-2xl bg-card/60 border border-border ">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveHubView("intake")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeHubView === "intake"
                  ? "bg-brand/20 text-brand-strong border border-brand/40 shadow-panel"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
              }`}
            >
              <span>🏛️</span>
              <span>Case Intake Hub</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHubView("hatata")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeHubView === "hatata"
                  ? "bg-gold/20 text-gold-strong border border-gold/40 shadow-panel"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
              }`}
            >
              <span>📜</span>
              <span>ሃተታ መናፍስት ወ አውደ ነገሥት</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHubView("telsem")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeHubView === "telsem"
                  ? "bg-plum/20 text-plum-strong border border-plum/40 shadow-panel"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
              }`}
            >
              <span>🛡️</span>
              <span>የጠልሰም ቤተ-መጻሕፍት (Telsem)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHubView("awde")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeHubView === "awde"
                  ? "bg-info/20 text-info-strong border border-info/40 shadow-panel"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
              }`}
            >
              <span>🧭</span>
              <span>አውደ ነገሥት (16 Circles)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gold px-3 font-mono">
            <span>✨ ዓውደ መድረክ · Planetary Sanctuary</span>
          </div>
        </div>

        {/* Companion Tab View Overlays */}
        {activeHubView === "hatata" && (
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-xl font-bold text-gold-strong">ሃተታ መናፍስት ወ አውደ ነገሥት ከነትርጉሙ</h2>
              <button
                type="button"
                onClick={() => setActiveHubView("intake")}
                className="btn-secondary text-xs"
              >
                ← Return to Case Intake
              </button>
            </div>
            <HatataMenafsestViewer />
          </div>
        )}

        {activeHubView === "telsem" && (
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-xl font-bold text-gold-strong">የጠልሰም ቤተ-መጻሕፍት (Sacred Telsem Manuscript Library)</h2>
              <button
                type="button"
                onClick={() => setActiveHubView("intake")}
                className="btn-secondary text-xs"
              >
                ← Return to Case Intake
              </button>
            </div>
            <TelsemLibraryViewer />
          </div>
        )}

        {activeHubView === "awde" && (
          <div className="space-y-6 mb-10">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-xl font-bold text-gold-strong">Awde Negest 16 Circles & Celestial Divination</h2>
              <button
                type="button"
                onClick={() => setActiveHubView("intake")}
                className="btn-secondary text-xs"
              >
                ← Return to Case Intake
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AwudeHeritageContext />
              <AwdeCircleVisualizer circle={AWDE_NEGEST_CIRCLES[7]} />
            </div>
          </div>
        )}

        {/* Crisis Emergency Banner */}
        {isCrisisNarrative && (
          <div className="mb-8 p-6 rounded-3xl bg-danger-soft border-2 border-danger/80 shadow-raised  text-foreground animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-danger flex items-center justify-center text-2xl flex-shrink-0 shadow-panel">
                🛡️
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-danger/30 text-danger-strong text-xs font-bold uppercase tracking-wider">
                  Emergency Support Notice · Non-Gated Safety Protocol
                </div>
                <h3 className="text-xl font-extrabold text-foreground">Immediate Care & Emergency Assistance</h3>
                <p className="text-sm text-danger-strong leading-relaxed">
                  Your entry indicates urgent distress or safety risk. You do not need to navigate this alone — free, confidential professional support is available right now.
                </p>
              </div>
            </div>
            <EmergencyHelp tone="dark" className="mt-4" />
          </div>
        )}

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
                        ? "bg-brand/20 border-brand/60 text-brand-strong"
                        : isCurrent
                          ? "bg-brand/30 border-brand text-brand-strong ring-2 ring-brand/40"
                          : "bg-foreground/5 border-border text-subtle"
                        }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </span>
                    <span
                      className={`text-[11px] font-medium transition-colors ${isCompleted
                        ? "text-brand"
                        : isCurrent
                          ? "text-foreground"
                          : "text-subtle"
                        }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < Object.keys(PHASE_LABELS).length - 1 && (
                    <span className="mx-2 text-subtle text-xs">/</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {draftAvailable && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-info/30 bg-info-soft p-4 text-sm text-info-strong" role="status">
            <span className="text-info">↻</span>
            <span className="flex-1">
              {draftNeedsReanalysis
                ? "This saved report contained cultural or astrological material presented as a finding. Your case answers were preserved; generate a fresh report to continue."
                : "Your active case was restored from this browser."}
            </span>
            <button type="button" onClick={discardDraft} className="text-xs text-info underline underline-offset-2 hover:text-foreground">
              Discard draft
            </button>
          </div>
        )}

        {session && renderSummaryCards() && (
          <div className="mb-8">{renderSummaryCards()}</div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-xl border border-danger/40 bg-danger-soft p-4 text-sm text-danger-strong flex items-start gap-3">
            <span className="text-danger">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-danger hover:text-danger-strong"
            >
              ✕
            </button>
          </div>
        )}

        {/* ─── PHASE: Domain ──────────────────────────────────────────────── */}
        {phase === "domain" && activeHubView === "intake" && (
          <section aria-label="Choose a case domain">
            {casesLoading ? (
              <p className="text-sm text-muted-foreground" role="status">Loading case domains...</p>
            ) : cases.length === 0 ? (
              <div className="glass-panel p-6 space-y-4">
                <p className="text-sm text-soft">No case domains are available right now.</p>
                <button type="button" onClick={() => void loadCases()} className="btn-secondary">Retry loading domains</button>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(620px,2fr)_minmax(280px,0.8fr)]">
                <div className="space-y-6">
                  {/* Category Filter Chips */}
                  <div className="flex flex-wrap items-center gap-2 pb-1">
                    {[
                      { id: "all", label: "All Pathways (9)" },
                      { id: "flagship", label: "✨ Premier Engines (4)" },
                      { id: "health", label: "✚ Health & Restoration" },
                      { id: "purpose", label: "✦ Vocation & Spirit" },
                      { id: "legal_social", label: "⚖️ Legal & Society" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDomainFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          domainFilter === tab.id
                            ? "bg-brand text-brand-foreground shadow-md"
                            : "bg-foreground/5 border border-border text-muted-foreground hover:text-brand-foreground hover:bg-foreground/10"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ══════════════════════════════════════════════════════════
                      QUAD-FLAGSHIP PREMIER INTAKE ENGINES
                     ══════════════════════════════════════════════════════════ */}
                  {(domainFilter === "all" || domainFilter === "flagship" || domainFilter === "purpose") && (
                    <div className="space-y-4">
                      {/* FLAGSHIP 1: SPIRITUAL & LIFE DIRECTION */}
                      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-gold-soft via-card/90 to-background border-2 border-gold/60 shadow-raised relative overflow-hidden group">
                        <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-l from-gold-fill to-gold-fill text-gold-foreground font-bold text-xs uppercase tracking-wider shadow-panel">
                          ✨ Flagship 1 · Adaptive Divination
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            🔮
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h2 className="text-2xl font-bold text-gold-strong font-serif group-hover:text-gold transition-colors">
                              Spiritual & Life Direction (መንፈሳዊ አቅጣጫ)
                            </h2>
                            <p className="text-xs text-soft leading-relaxed max-w-2xl">
                              Live Ge&apos;ez Fidel gematria calculation as you type, 16 Circles of Awde Negest, personalized talismanic lineages, AI follow-ups, and verified debtera review.
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold-strong text-[11px] font-mono">
                                Live Gematria (የፊደል ሂሳብ)
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold-strong text-[11px] font-mono">
                                Awde Negest (አውደ ነገሥት)
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold-strong text-[11px] font-mono">
                                Verified Debtera Review
                              </span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                            <Link
                              href="/case/workflows/new/spiritual"
                              className="flex-1 sm:flex-initial text-center px-5 py-2.5 rounded-2xl bg-gold-fill text-gold-foreground font-bold text-xs hover:bg-gold-fill transition-colors shadow-panel"
                            >
                              Launch Engine →
                            </Link>
                            {cases.find((c) => c.id === "spiritual") && (
                              <button
                                type="button"
                                onClick={() => void chooseDomain(cases.find((c) => c.id === "spiritual")!)}
                                className="px-4 py-2 rounded-xl bg-foreground/5 border border-border text-soft text-xs hover:text-foreground hover:bg-foreground/10"
                              >
                                Quick In-Hub
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* FLAGSHIP 2: CAREER TIMING & VOCATIONAL DESTINY */}
                      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-info-soft via-card/90 to-background border-2 border-info/60 shadow-raised relative overflow-hidden group">
                        <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-l from-info to-info text-info-foreground font-bold text-xs uppercase tracking-wider shadow-panel">
                          ✨ Flagship 2 · Livelihood Reflection
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-info/20 border border-info/40 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            💼
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h2 className="text-2xl font-bold text-info-strong font-serif group-hover:text-info transition-colors">
                              Money & Business Reflection
                            </h2>
                            <p className="text-xs text-soft leading-relaxed max-w-2xl">
                              Reflect on work, livelihood, and enterprise through cultural values. This is not financial, business, or career advice.
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-info/10 border border-info/30 text-info-strong text-[11px] font-mono">
                                Work & Livelihood Values
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-info/10 border border-info/30 text-info-strong text-[11px] font-mono">
                                Ge&apos;ez Voice Input
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-info/10 border border-info/30 text-info-strong text-[11px] font-mono">
                                Cultural Reflection
                              </span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                            <Link
                              href="/case/workflows/new/career"
                              className="flex-1 sm:flex-initial text-center px-5 py-2.5 rounded-2xl bg-info text-info-foreground font-bold text-xs hover:bg-info transition-colors shadow-panel"
                            >
                              Launch Engine →
                            </Link>
                            {cases.find((c) => c.id === "career") && (
                              <button
                                type="button"
                                onClick={() => void chooseDomain(cases.find((c) => c.id === "career")!)}
                                className="px-4 py-2 rounded-xl bg-foreground/5 border border-border text-soft text-xs hover:text-foreground hover:bg-foreground/10"
                              >
                                Quick In-Hub
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(domainFilter === "all" || domainFilter === "flagship" || domainFilter === "legal_social") && (
                    <div className="space-y-4">
                      {/* FLAGSHIP 3: PEACE & HARMONY */}
                      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-plum-soft via-card/90 to-background border-2 border-plum/60 shadow-raised relative overflow-hidden group">
                        <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-l from-plum to-plum text-plum-foreground font-bold text-xs uppercase tracking-wider shadow-panel">
                          ✨ Flagship 3 · Customary Peacemaking & Shimgelna
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-plum/20 border border-plum/40 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            🕊️
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h2 className="text-2xl font-bold text-plum-strong font-serif group-hover:text-plum transition-colors">
                              Peace & Harmony
                            </h2>
                            <p className="text-xs text-soft leading-relaxed max-w-2xl">
                              Rooted entirely in Ethiopian customary reconciliation (ሽምግልና / Shemgelna), spiritual peacemaking, and traditional restorative justice. Provides cultural and spiritual wisdom for dispute resolution, family harmony, and conscience guidance — with no scientific or statutory advice.
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-plum/10 border border-plum/30 text-plum-strong text-[11px] font-mono">
                                Customary Peacemaking (ሽምግልና)
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-plum/10 border border-plum/30 text-plum-strong text-[11px] font-mono">
                                Spiritual Conscience & Ethics
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-plum/10 border border-plum/30 text-plum-strong text-[11px] font-mono">
                                Restorative Community Wisdom
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-plum/10 border border-plum/30 text-plum-strong text-[11px] font-mono">
                                Cultural & Spiritual Only · No Scientific Advice
                              </span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                            <Link
                              href="/case/workflows/new/legal"
                              className="flex-1 sm:flex-initial text-center px-5 py-2.5 rounded-2xl bg-plum text-plum-foreground font-bold text-xs hover:bg-plum transition-colors shadow-panel"
                            >
                              Launch Engine →
                            </Link>
                            {cases.find((c) => c.id === "legal") && (
                              <button
                                type="button"
                                onClick={() => void chooseDomain(cases.find((c) => c.id === "legal")!)}
                                className="px-4 py-2 rounded-xl bg-foreground/5 border border-border text-soft text-xs hover:text-foreground hover:bg-foreground/10"
                              >
                                Quick In-Hub
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ══════════════════════════════════════════════════════════
                      ADDITIONAL CASE DOMAINS
                     ══════════════════════════════════════════════════════════ */}
                  <div className="pt-2">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 flex items-center justify-between">
                      <span>Standard & Specialized Care Domains</span>
                      <span className="text-brand text-[10px]">Dual Domain A & B Analysis</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cases
                        .filter((item) => {
                          if (domainFilter === "health") return ["wellbeing", "peace"].includes(item.id);
                          if (domainFilter === "purpose") return ["spiritual", "career", "power"].includes(item.id);
                          if (domainFilter === "legal_social") return ["legal", "money", "relationships", "social"].includes(item.id);
                          if (domainFilter === "flagship") return ["wellbeing", "spiritual", "career", "legal"].includes(item.id);
                          return true;
                        })
                        .map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => void chooseDomain(item)}
                            disabled={loading}
                            className={`glass-panel p-6 text-left transition-all disabled:opacity-50 hover:shadow-panel group relative ${
                              item.id === "wellbeing"
                                ? "border-brand/60 bg-brand-soft hover:border-brand"
                                : "hover:border-brand/60"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-3xl text-gold group-hover:scale-110 transition-transform inline-block">
                                {item.icon}
                              </span>
                              {item.id === "wellbeing" && (
                                <span className="px-2 py-0.5 rounded-full bg-brand/20 text-brand-strong text-[10px] font-mono border border-brand/40">
                                  Clinical Engine
                                </span>
                              )}
                            </div>
                            <h2 className="text-xl font-bold text-foreground mt-4">{item.name}</h2>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
                            <div className="flex flex-wrap gap-2 mt-5">
                              {item.interests.slice(0, 3).map((interest) => (
                                <span key={interest} className="badge badge-safe normal-case tracking-normal text-xs">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </button>
                        ))}
                    </div>
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
              <h2 className="text-2xl font-bold text-foreground">Which pattern sounds closest?</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                This second step is tailored to the domain you selected.
              </p>
              <form onSubmit={submitChallenge} className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      {question.text}
                      {question.required && <span className="text-gold ml-1">*</span>}
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
                            ? "border-brand bg-brand/15 text-foreground"
                            : "border-border bg-sunken/50 text-soft hover:border-border-strong"
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
                <h2 className="text-2xl font-bold text-foreground">Tell us what you want to work on</h2>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  Your chosen interest will refine the report and recommendations.
                </p>

                <form onSubmit={submitSpecific} className="space-y-5" id="specific-case-form">
                  {/* ── wellbeing-domain purpose-built fields ── */}
                  {selectedCase.id === "wellbeing" ? (
                    <>
                      {/* Row 1: Age + Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="case-age" className="block text-xs font-semibold text-soft uppercase tracking-wide">
                            How old are you? <span className="text-gold">*</span>
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
                            className="w-full rounded-xl bg-sunken/80 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-subtle"
                          />
                        </div>
                        <EthiopianLocationInput
                          value={String(answers.location ?? "")}
                          regionValue={String(answers.region ?? profileContext["Region or state"] ?? "")}
                          onChange={(loc, reg, place) => {
                            updateAnswer("location", loc);
                            updateAnswer("region", reg);
                            if (place) {
                              updateAnswer("administrativePlace", place as unknown as Record<string, unknown>);
                              const agro = estimateAgroEcology(reg, place.zone);
                              updateAnswer("altitudeMeters", agro.altitudeMeters);
                              updateAnswer("agroEcologyZone", agro.zoneName);
                            }
                          }}
                          required
                        />
                      </div>

                      {/* Describe concern */}
                      <div className="space-y-1.5">
                        <label htmlFor="case-detail" className="block text-xs font-semibold text-soft uppercase tracking-wide">
                          Describe the concern, including timing and what makes it better or worse <span className="text-gold">*</span>
                        </label>
                        <textarea
                          id="case-detail"
                          value={String(answers.detail ?? "")}
                          onChange={(e) => updateAnswer("detail", e.target.value)}
                          rows={4}
                          required
                          placeholder="e.g. head ache, repeatedly happen at mid day worsen by thirst…"
                          className="w-full rounded-xl bg-sunken/80 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-subtle resize-none"
                        />
                        {/* Live safety hints */}
                        {(assist.urgencyHint || assist.safetyFlags.length > 0 || assist.suggestions.length > 0) && (
                          <div className="mt-2 rounded-lg border border-info/30 bg-info-soft p-3 space-y-1.5">
                            {assist.urgencyHint && (
                              <p className="text-xs text-danger flex items-center gap-1.5"><span>⚠️</span>{assist.urgencyHint}</p>
                            )}
                            {assist.safetyFlags.map((flag) => (
                              <p key={flag} className="text-xs text-gold-strong flex items-center gap-1.5"><span>⚠️</span>{flag}</p>
                            ))}
                            {assist.suggestions.map((suggestion) => (
                              <button
                                type="button"
                                key={suggestion}
                                onClick={() => updateAnswer("detail", `${String(answers.detail || "").trim()} ${suggestion}`.trim())}
                                className="block text-left text-xs text-info hover:text-info-strong underline"
                              >
                                💡 {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Medicines */}
                      <div className="space-y-1.5">
                        <label htmlFor="case-medications" className="block text-xs font-semibold text-soft uppercase tracking-wide">
                          List medicines, supplements, or herbs currently in use
                        </label>
                        <p className="text-xs text-subtle">💡 Mention any medicines, herbs, or supplements you currently use.</p>
                        <textarea
                          id="case-medications"
                          value={String(answers.medications ?? "")}
                          onChange={(e) => updateAnswer("medications", e.target.value)}
                          rows={2}
                          placeholder="e.g. Metformin 500mg, Tena Adam tea, Vitamin D…"
                          className="w-full rounded-xl bg-sunken/80 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors placeholder:text-subtle resize-none"
                        />
                      </div>

                      {/* Which area should shape recommendations */}
                      <div className="space-y-1.5">
                        <label htmlFor="case-interest" className="block text-xs font-semibold text-soft uppercase tracking-wide">
                          Which area should shape the recommendations? <span className="text-gold">*</span>
                        </label>
                        <select
                          id="case-interest"
                          value={String(answers.selectedInterest ?? "")}
                          onChange={(e) => updateAnswer("selectedInterest", e.target.value)}
                          required
                          className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-brand transition-colors"
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
                        <p className="block text-xs font-semibold text-soft uppercase tracking-wide">
                          Would you like a cultural reflection layer included? <span className="text-gold">*</span>
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
                                    ? "border-gold bg-gold/15 text-gold-strong"
                                    : "border-brand bg-brand/15 text-brand-strong"
                                  : "border-border bg-sunken/50 text-muted-foreground hover:border-border-strong"
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
                    <div className="rounded-xl border border-brand/30 bg-brand-soft/70 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
                        <span className="text-xs font-bold text-brand uppercase tracking-wide">Scientific Domain A</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Biochemical · Nutritional · Ecological · Drug-Herb Safety · Mechanistic
                      </p>
                      <p className="text-[10px] text-brand">Active — shapes Scientific report</p>
                    </div>

                    {/* Domain B — Cultural (opt-in only) */}
                    {String(answers.reflectionLens ?? "").toLowerCase() === "yes" && (
                      <div className="rounded-xl border border-gold/40 bg-gold-soft/70 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gold-fill flex-shrink-0" />
                          <span className="text-xs font-bold text-gold uppercase tracking-wide">Cultural Domain B</span>
                          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-gold/20 text-gold-strong font-semibold">Firewalled</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Ge'ez calendar · Numerology · AwudeNegest · Traditional heritage
                        </p>
                        <p className="text-[10px] text-gold">
                          Opted in — enrichment layer only, never alters Scientific gaps
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Integrated client assessment ── */}
                  <section
                    className="rounded-2xl border border-brand/25 bg-brand-soft/70 p-5 space-y-5"
                    aria-label="Integrated assessment tools"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="badge badge-safe mb-2">Integrated client assessment</div>
                        <h3 className="text-base font-bold text-foreground">Bring your wellbeing context into this case</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Profile fields from your personal, family, geographic, cultural, economic, wellbeing, and lifestyle
                          profile are sent as context. You can review and change them in Profile Edit.
                        </p>
                      </div>
                      <div className="rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-strong">
                        AI Enhanced
                      </div>
                    </div>

                    <div className="rounded-xl border border-plum/20 bg-plum-soft/70 p-4">
                      <p className="text-sm font-semibold text-foreground">Identity context (optional)</p>
                      <p className="mt-1 text-xs leading-relaxed text-soft">
                        Religion and gender identity are never sent with scientific diagnostic analysis.
                        If you allow them in your profile and select them for this case, they are displayed here
                        as personal cultural context only.
                      </p>
                      {profileContext.identityContextConsent === true ? (
                        <label className="mt-3 flex items-start gap-3 text-xs text-soft">
                          <input
                            type="checkbox"
                            checked={includeIdentityContext}
                            onChange={(event) => setIncludeIdentityContext(event.target.checked)}
                            className="mt-0.5 accent-plum"
                          />
                          <span>Show my saved religion and gender identity in this case&apos;s personal cultural context.</span>
                        </label>
                      ) : (
                        <p className="mt-3 text-xs text-soft">
                          Not enabled. You can manage optional details and permissions in your{" "}
                          <Link href="/profile" className="font-semibold text-plum-strong underline underline-offset-2">
                            profile settings
                          </Link>.
                        </p>
                      )}
                      {includeIdentityContext && profileContext.identityContextConsent === true && (
                        <p className="mt-2 text-xs text-plum-strong" aria-live="polite">
                          This case view will display: {[
                            asText(profileContext.identityGender),
                            asText(profileContext.identityReligion),
                          ].filter(Boolean).join(" · ") || "no saved identity details"}.
                          {" "}No cultural or clinical assumptions are inferred from these details.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profileContextError && (
                        <p className="md:col-span-2 rounded-lg border border-gold/30 bg-gold-soft p-3 text-xs text-gold-strong" role="status">
                          {profileContextError}
                        </p>
                      )}
                      <div className="rounded-xl border border-border bg-sunken/50 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-subtle">Wellbeing Context</div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-soft">
                          <div>
                            <span className="block text-subtle">Name</span>
                            <span className="font-semibold text-foreground">{String(profileContext["Full name"] || profileContext.name || "Case client")}</span>
                          </div>
                          <div>
                            <span className="block text-subtle">Region</span>
                            <span className="font-semibold text-foreground">{String(profileContext["Region or state"] || answers.region || "Addis Ababa")}</span>
                          </div>
                          <div>
                            <span className="block text-subtle">Age</span>
                            <span className="font-semibold text-foreground">{String(answers.age ?? profileContext["Date of birth"] ?? "—")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-sunken/50 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-subtle">Case Intake Snapshot</div>
                        <div className="mt-3 space-y-2 text-xs text-soft">
                          <div className="flex items-center justify-between">
                            <span className="text-subtle">Selected challenge</span>
                            <span className="font-semibold text-foreground">{String(answers.challenge || "New job")}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-subtle">Interest</span>
                            <span className="font-semibold text-foreground">{String(answers.selectedInterest || "General review")}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-subtle">Care lens</span>
                            <span className="font-semibold text-foreground">{String(answers.reflectionLens || "Scientific only")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-info/30 bg-info-soft p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-info">Scientific Attachments</div>
                        <div className="mt-3 text-xs text-info-strong space-y-2">
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-info" /> Medications: {String(profileContext["Current medications"] || answers.medications || "None listed")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-info" /> History: {String(profileContext["Relevant medical history"] || "No known history")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-info" /> Allergies: {String(profileContext["Known allergies"] || "None reported")}</div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gold/30 bg-gold-soft/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Lifestyle & Culture</div>
                        <div className="mt-3 text-xs text-gold-strong space-y-2">
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gold-fill" /> Activity: {String(profileContext["Physical activity level"] || "moderate")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gold-fill" /> Pregnancy/Lactation: {String(profileContext["Pregnancy or lactation status"] || "none")}</div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gold-fill" /> Altitude: {String(answers.altitudeMeters ?? "2400m")}</div>
                        </div>
                      </div>
                    </div>

                    {/* Show detail prefill from form */}
                    {String(answers.detail || "").trim() && (
                      <div className="rounded-lg bg-sunken/50 border border-border px-4 py-2.5 text-xs text-soft font-mono leading-relaxed">
                        <span className="text-subtle">Narrative:</span> {String(answers.detail)}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void runEmbeddedDiagnostic()}
                        disabled={diagnosticLoading || isSubmitting || !profileContextLoaded}
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
                          disabled={intakeLoading || isSubmitting || !profileContextLoaded}
                          className="btn-secondary text-sm"
                        >
                          {intakeLoading ? (
                            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />Assessing...</span>
                          ) : "Run client intake assessment"}
                        </button>
                      )}
                    </div>

                    {diagnosticResult && (
                      <div className="rounded-lg border border-info/30 bg-info-soft p-3 text-sm text-info-strong flex items-start gap-2" role="status">
                        <span className="text-info mt-0.5">✓</span>
                        <span>
                          <strong>Diagnostic saved:</strong> {diagnosticResult.summary.problem} · Urgency{" "}
                          <span className={`font-semibold ${diagnosticResult.summary.urgency === "critical" ? "text-danger" :
                            diagnosticResult.summary.urgency === "high" ? "text-warning" :
                              diagnosticResult.summary.urgency === "medium" ? "text-gold" : "text-brand"
                            }`}>{diagnosticResult.summary.urgency}</span>{" "}
                          {diagnosticResult.summary.confidence > 0 &&
                            ` · Signal strength ${Math.round(diagnosticResult.summary.confidence)}%`}
                        </span>
                      </div>
                    )}

                    {intakeResult && (
                      <div className="rounded-lg border border-gold/30 bg-gold-soft p-4 space-y-2" role="status">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gold">✓</span>
                          <span className="text-gold-strong font-semibold">Client intake saved:</span>
                          <span className="text-gold-strong text-xs">{intakeResult.message || "Intake evaluated and wellbeing gap report generated successfully."}</span>
                        </div>
                        {intakeResult.reportId && (
                          <Link
                            href={`/report/${intakeResult.reportId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold underline underline-offset-2 hover:text-gold-strong transition-colors"
                          >
                            Open report →
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="rounded-lg border border-gold/30 bg-gold-soft/70 p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-gold-strong">
                        <span>Live safety and completeness check</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-brand/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Profile context loaded</span>
                        <span className="rounded-full border border-info/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-info">Diagnostic prepared</span>
                        <span className="rounded-full border border-gold/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{String(answers.challenge ?? "New job")}</span>
                      </div>
                    </div>

                    {answerSync === "error" && (
                      <div className="rounded-lg border border-danger/30 bg-danger-soft/70 p-3 text-xs text-danger-strong">
                        <span className="text-danger">⚠️</span>
                        <span className="ml-2">Progress could not be saved yet; your step submission will retry it.</span>
                      </div>
                    )}
                  </section>

                  {/* Progress save status */}
                  {answerSync !== "idle" && (
                    <p className={`text-xs flex items-center gap-1.5 ${answerSync === "error" ? "text-danger" :
                      answerSync === "saved" ? "text-brand" : "text-muted-foreground"
                      }`} role="status">
                      {answerSync === "saving" && <><span className="w-2 h-2 rounded-full border border-border-strong border-t-transparent animate-spin" />Saving your progress...</>}
                      {answerSync === "saved" && <><span>✓</span> Progress saved</>}
                      {answerSync === "queued" && "Saved on this device. It will be sent when you are back online."}
                      {answerSync === "error" && "Progress could not be saved. Your answers stay in this browser; try the next step again."}
                    </p>
                  )}

                  {/* Voice input */}
                  <div className="flex items-center justify-between rounded-xl border border-info/20 bg-info-soft/70 px-4 py-3">
                    <span className="text-xs font-semibold text-info">Live safety and completeness check</span>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`btn-secondary text-xs ${listening ? "border-danger text-danger-strong bg-danger-soft" : ""
                        }`}
                    >
                      {listening ? "⏹️ Stop listening" : "🎤 Use voice input"}
                    </button>
                  </div>
                  {listening && (
                    <div className="flex items-center gap-2 text-xs text-info px-1">
                      <span className="w-2 h-2 rounded-full bg-danger animate-ping" />
                      Listening… speak now
                      {transcript && <span className="text-muted-foreground ml-2">Transcript: {transcript}</span>}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-base"
                    disabled={loading || isSubmitting || !profileContextLoaded}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-border-strong border-t-border-strong animate-spin" />
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

        {phase === "endorsement" && summaryReview && (
          <section className="mx-auto max-w-4xl space-y-5" aria-labelledby="case-summary-review-heading">
            <div className="glass-panel border border-brand/25 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">Review before analysis</p>
              <h2 id="case-summary-review-heading" className="mt-2 text-2xl font-bold text-foreground">{summaryReview.headline}</h2>
              <p className="mt-2 text-sm text-soft">
                {summaryReview.userIntention} · {summaryReview.domain}{summaryReview.subDomain !== "general" ? ` / ${summaryReview.subDomain.replaceAll("_", " ")}` : ""}
              </p>
              {summaryReview.keySymptoms.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key points recognized</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {summaryReview.keySymptoms.map((item) => (
                      <li key={item} className="rounded-md border border-border bg-sunken/50 px-3 py-1.5 text-xs text-soft">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {summaryReview.urgencyFlag !== "none" && (
                <p className={`mt-4 rounded-md border p-3 text-sm ${summaryReview.urgencyFlag === "emergency" ? "border-danger/40 bg-danger-soft text-danger-strong" : "border-gold/30 bg-gold-soft text-gold-strong"}`} role="status">
                  Priority detected: {summaryReview.urgencyFlag}. This flag is a routing signal, not a diagnosis.
                </p>
              )}
            </div>

            <div className="glass-panel border border-info/20 p-6">
              <h3 className="text-sm font-semibold text-foreground">Knowledge types considered</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                These sources are not equivalent. Biomedical evidence has the strongest clinical grounding; cultural and spiritual material is reflective and does not establish medical facts.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["biomedical", "evidence-informed", "traditional", "cultural"] as const).map((tier) => {
                  const items = summaryReview.suggestedStrandDetails.filter((item) => item.tier === tier);
                  if (items.length === 0) return null;
                  const title = tier === "biomedical"
                    ? "Biomedical and clinical evidence"
                    : tier === "evidence-informed"
                      ? "Evidence-informed context"
                      : tier === "traditional"
                        ? "Traditional knowledge"
                        : "Cultural and spiritual reflection";
                  const tone = tier === "biomedical" ? "border-brand/30" : tier === "evidence-informed" ? "border-info/30" : tier === "traditional" ? "border-gold/30" : "border-danger/25";
                  return (
                    <section key={tier} className={`rounded-lg border ${tone} bg-sunken/50 p-4`}>
                      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-soft">
                        {items.map((item) => <li key={item.strand}>{item.rationale}</li>)}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={() => void endorseSummaryAndContinue()} disabled={isSubmitting}>
                {isSubmitting ? "Preparing report…" : "Confirm summary and continue"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { setSummaryReview(null); setPhase("specific"); }} disabled={isSubmitting}>
                Edit case details
              </button>
            </div>
          </section>
        )}

        {/* ─── PHASE: Report, Causes, Solutions, Complete ──────────────────── */}
        {(phase === "report" || phase === "causes" || phase === "solutions" || phase === "complete") &&
          session &&
          selectedCase && (
            <section className="space-y-6">
              {/* Report Header */}
              <div className="glass-panel p-6 md:p-8 border-l-4 border-l-brand">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="badge badge-safe mb-3">
                      {phase === "report" && "Report ready for review"}
                      {phase === "causes" && "Findings refinement"}
                      {phase === "solutions" && "Solution review"}
                      {phase === "complete" && "Case complete"}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedCase.name} case synthesis
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Challenge: <strong className="text-foreground">{String(session.answers.challenge)}</strong> · Interest:{" "}
                      <strong className="text-foreground">{String(session.answers.selectedInterest)}</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-right text-xs text-muted-foreground">
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
                      className="btn-secondary text-xs text-danger border-danger/30 hover:border-danger"
                    >
                      Reset case
                    </button>
                  </div>
                </div>

                {/* Safety Note */}
                {session.workflowContext && session.workflowContext.safety.level !== "low" && (
                  <div
                    className={`mt-6 p-4 rounded-xl border text-sm ${session.workflowContext.safety.level === "critical"
                      ? "border-danger/40 bg-danger-soft text-danger-strong"
                      : "border-gold/40 bg-gold-soft text-gold-strong"
                      }`}
                  >
                    <strong>
                      {session.workflowContext.safety.level === "critical" ? "Urgent safety signal" : "Safety note"}:
                    </strong>{" "}
                    {session.workflowContext.safety.recommendation}
                  </div>
                )}

                <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-2xl border border-border bg-sunken/50 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${workflowStatus.accent}`} />
                      Case overview
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-subtle">Main concern</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{String(session.answers.challenge ?? "Selected issue")}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border bg-background/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Relevant interest</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{String(session.answers.selectedInterest ?? "General review")}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-background/40 p-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Risk level</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{workflowStatus.label}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-info/25 bg-info-soft/70 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-info">Recommended next action</div>
                    <p className="mt-4 text-sm leading-relaxed text-info-strong">{workflowStatus.action}</p>
                  </div>
                </div>

                <div className="mt-6">
                  {renderSummaryCards()}
                </div>

                {reportDiagnostic?.summary && (
                  <section className="mt-6 rounded-2xl border border-info/25 bg-info-soft/70 p-5" aria-labelledby="case-analysis-heading">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-info">Personalized case analysis</div>
                        <h3 id="case-analysis-heading" className="mt-2 text-lg font-bold text-foreground">{reportDiagnostic.summary.problem}</h3>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full border border-info/30 px-3 py-1 text-xs text-info-strong">
                          Synthesis confidence {Math.round(reportDiagnostic.summary.confidence)}%
                        </span>
                        <span className="rounded-full border border-gold/30 px-3 py-1 text-xs capitalize text-gold-strong">
                          {reportDiagnostic.summary.urgency} priority
                        </span>
                      </div>
                    </div>
                    {reportDiagnostic.reasoning?.summaryReasoning && (
                      <p className="mt-3 text-sm leading-6 text-soft">{reportDiagnostic.reasoning.summaryReasoning}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Based on this intake&apos;s answers and available profile context. This synthesis is not a diagnosis.
                    </p>
                    {reportDiagnostic.summary.matchedSignals.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Signals considered</div>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {reportDiagnostic.summary.matchedSignals.map((signal) => (
                            <li key={signal} className="rounded-full border border-border bg-sunken/50 px-3 py-1 text-xs text-soft">{signal}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {diagnosticActionGroups.some(({ key }) => reportDiagnostic.action_plan[key]?.length > 0) && (
                      <div className="mt-5">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Personalized action plan</h4>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {diagnosticActionGroups.map(({ key, label }) => {
                            const actions = reportDiagnostic.action_plan[key] || [];
                            if (!actions.length) return null;
                            return (
                              <div key={key} className="rounded-xl border border-border bg-sunken/50 p-4">
                                <h5 className="text-sm font-semibold text-foreground">{label}</h5>
                                <ul className="mt-3 space-y-3">
                                  {actions.map((action) => (
                                    <li key={action.id} className="text-sm text-soft">
                                      <div className="font-medium">{action.title}</div>
                                      <p className="mt-1 text-xs leading-5 text-soft">{action.action}</p>
                                      <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-subtle">
                                        {action.priority} · {action.category}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(reportDiagnostic.safety?.warnings.length > 0 || reportDiagnostic.safety?.herbDrugInteractions.length > 0) && (
                      <div className="mt-5 rounded-xl border border-gold/30 bg-gold-soft p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-strong">Safety considerations</h4>
                        {reportDiagnostic.safety.warnings.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gold-strong">
                            {reportDiagnostic.safety.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                          </ul>
                        )}
                        {reportDiagnostic.safety.herbDrugInteractions.length > 0 && (
                          <ul className="mt-3 space-y-2 text-xs text-gold-strong">
                            {reportDiagnostic.safety.herbDrugInteractions.map((interaction, index) => (
                              <li key={`${interaction.herb}-${interaction.drug}-${index}`}>
                                <strong>{interaction.herb} + {interaction.drug} ({interaction.severity}):</strong>{" "}
                                {interaction.recommendation}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </section>
                )}

                {session.profileSynthesis && String(answers.reflectionLens || "").toLowerCase().includes("yes") && (
                  <div className="mt-6 rounded-2xl border border-gold/25 bg-gold-soft/70 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Identity + geographic synthesis</div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-border bg-sunken/50 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-subtle">Name</div>
                        <div className="mt-2 text-sm font-semibold text-foreground">{session.profileSynthesis.identity.name}</div>
                      </div>
                      <div className="rounded-xl border border-border bg-sunken/50 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-subtle">Mother name</div>
                        <div className="mt-2 text-sm font-semibold text-foreground">{session.profileSynthesis.identity.motherName || "Not provided"}</div>
                      </div>
                      <div className="rounded-xl border border-border bg-sunken/50 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-subtle">Birth data</div>
                        <div className="mt-2 text-sm font-semibold text-foreground">{session.profileSynthesis.identity.birthDate}</div>
                      </div>
                      <div className="rounded-xl border border-border bg-sunken/50 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-subtle">Birthplace</div>
                        <div className="mt-2 text-sm font-semibold text-foreground">{session.profileSynthesis.geography.city}</div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-border bg-background/30 p-4">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-subtle">Narrative</div>
                      <p className="mt-2 text-sm leading-6 text-soft">{session.profileSynthesis.summary}</p>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {session.profileSynthesis.chart.map((point) => (
                        <div key={point.key} className="rounded-xl border border-border bg-sunken/50 p-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-subtle">{point.label}</div>
                          <div className="mt-2 text-xl font-bold text-foreground">{point.value}</div>
                          <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{point.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-sunken/50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Key findings</div>
                    <ul className="mt-4 space-y-3">
                      {activeFindings.length > 0 ? activeFindings.map((cause) => (
                        <li key={cause.id} className="rounded-xl border border-border bg-background/30 p-3">
                          <div className="text-sm font-semibold text-foreground">{cause.description}</div>
                          <div className="mt-2 text-xs text-muted-foreground">Signal match {Math.round(cause.confidence * 100)}%</div>
                          {cause.culturalContext && (
                            <div className="mt-3 rounded-lg border border-gold/25 bg-gold-soft/70 p-3">
                              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">Domain B cultural context</div>
                              <p className="mt-1 text-xs leading-relaxed text-gold-strong">{cause.culturalContext.interpretation}</p>
                              <p className="mt-2 text-[11px] leading-relaxed text-gold-strong">Reflection: {cause.culturalContext.practice}</p>
                            </div>
                          )}
                        </li>
                      )) : (
                        <li className="rounded-xl border border-border bg-background/30 p-3 text-sm text-soft">
                          Selected findings will appear here once the report is refined.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border bg-sunken/50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recommended actions</div>
                    <ul className="mt-4 space-y-3">
                      {activeSolutions.length > 0 ? activeSolutions.map((solution) => (
                        <li key={solution.id} className="rounded-xl border border-border bg-background/30 p-3">
                          <div className="text-sm font-semibold text-foreground">{solution.title}</div>
                          <div className="mt-2 text-xs text-muted-foreground">{solution.description}</div>
                        </li>
                      )) : (
                        <li className="rounded-xl border border-border bg-background/30 p-3 text-sm text-soft">
                          Tailored options will appear after the findings are confirmed.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-sunken/50 border border-border text-sm text-soft">
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
                      className="rounded-xl border border-border px-4 py-2 text-sm text-soft hover:border-brand hover:text-foreground"
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
                  <h2 className="text-xl font-bold text-foreground">Which findings should guide the next step?</h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-5">
                    Select the causes that resonate with your situation. Deselect any that feel unrelated.
                  </p>
                  <div className="space-y-3">
                    {reportCauses.map((cause) => (
                      <label
                        key={cause.id}
                        className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedCauseIds.includes(cause.id)
                          ? "border-brand bg-brand/10"
                          : "border-border bg-sunken/50 hover:border-border-strong"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCauseIds.includes(cause.id)}
                          onChange={() => toggleSelection(setSelectedCauseIds, cause.id)}
                          className="mt-1 accent-brand"
                        />
                        <span>
                          <strong className="text-foreground text-sm">{cause.description}</strong>
                          <span className="block text-xs text-subtle mt-1">
                            Signal match {Math.round(cause.confidence * 100)}% ·{" "}
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
                  <h2 className="text-xl font-bold text-foreground">Choose what you want to take forward</h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-5">
                    Select the solutions that feel most actionable and aligned with your goals.
                  </p>
                  <div className="space-y-3">
                    {session.solutions.map((solution) => (
                      <label
                        key={solution.id}
                        className={`block p-4 rounded-xl border cursor-pointer transition-colors ${selectedSolutionIds.includes(solution.id)
                          ? "border-gold bg-gold/10"
                          : "border-border bg-sunken/50 hover:border-border-strong"
                          }`}
                      >
                        <div className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSolutionIds.includes(solution.id)}
                            onChange={() => toggleSelection(setSelectedSolutionIds, solution.id)}
                            className="mt-1 accent-gold"
                          />
                          <span>
                            <strong className="text-foreground text-sm">{solution.title}</strong>
                            <span className="block text-sm text-soft mt-2">
                              {solution.description}
                            </span>
                            <span className="block text-xs text-subtle mt-2">
                              {solution.steps.join(" · ")}
                            </span>
                            {solution.culturalContext && (
                              <div className="mt-3 rounded-lg border border-gold/25 bg-gold-soft/70 p-3">
                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">Cultural and reflective layer</div>
                                <p className="mt-1 text-xs leading-relaxed text-gold-strong">{solution.culturalContext.interpretation}</p>
                                <p className="mt-2 text-[11px] leading-relaxed text-gold-strong">Reflection: {solution.culturalContext.practice}</p>
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
                    <div className="mt-6 rounded-xl border border-brand/30 bg-brand-soft p-4 text-sm text-brand-strong">
                      ✅ Your selected path is saved for review. You can revisit the case and change
                      the choices as your situation changes.
                    </div>
                  )}
                </form>
              )}
            </section>
          )}

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-wrap justify-between text-xs text-subtle gap-4">
          <Link href="/" className="hover:text-foreground inline-flex items-center gap-1">
            ← Back to overview
          </Link>
          <Link href="/diagnostic" className="hover:text-foreground inline-flex items-center gap-1">
            Open multi-strand diagnostic →
          </Link>
          <button
            onClick={resetWorkflow}
            className="hover:text-danger transition-colors"
          >
            Reset workflow
          </button>
        </div>
      </div>
    </div>
  );
}