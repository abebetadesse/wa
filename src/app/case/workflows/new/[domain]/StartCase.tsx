"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileAudio,
  FileVideo,
  HeartPulse,
  Lock,
  Mic,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { OwnerView } from "@/server/cases/views";
import type { WorkflowDomain, WorkflowQuestion } from "@/server/cases/types";
import { ApiClientError, apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, ButtonLink, Card, CardContent, CardHeader, CardTitle, CardDescription, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { QuestionField } from "@/features/cases/components";
import { GeezKeyboard, GeezNamePreview } from "@/features/cases/GeezNameTools";
import { PathwayPractitioners } from "@/features/cases/PathwayPractitioners";
import { useGeezVoiceInput } from "@/hooks/useGeezVoiceInput";

interface DomainSummary {
  domain: WorkflowDomain;
  label: string;
  description: string;
  safetyQuestions: WorkflowQuestion[];
  startQuestions: WorkflowQuestion[];
}

const STEPS = ["Questions", "Consent", "Submit"] as const;
type Step = (typeof STEPS)[number];

/** localStorage key for draft autosave. */
const draftKey = (domain: string) => `start-case-draft-${domain}`;

export function StartCase({ domain }: { domain: WorkflowDomain }) {
  const router = useRouter();
  // Set when the case is opened from a marketplace booking (a reading or review).
  const bookingId = useSearchParams().get("booking") ?? undefined;
  const [config, setConfig] = useState<DomainSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [safety, setSafety] = useState<Record<string, unknown>>({});
  const [consent, setConsent] = useState({
    dataUsage: true,
    emergencySupport: true,
    thirdPartySharing: false,
    retention: "90_days" as "30_days" | "90_days" | "1_year" | "until_closed",
    consentTextVersion: "v1",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ kind: "audio" | "video"; url: string; name?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voice = useGeezVoiceInput();

  // Spiritual pathway: which name field the Ge'ez letter picker types into.
  const [typingInto, setTypingInto] = useState<"nameGeez" | "motherNameGeez" | null>(null);
  const nameText = (id: string) => String(answers[id] ?? "");

  // Active UI step: Questions -> Consent -> Submit
  const [step, setStep] = useState<Step>("Questions");
  const draftRestored = useRef(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load domain workflow configuration
  useEffect(() => {
    apiFetch<{ domains: DomainSummary[] }>("/api/case-workflows")
      .then(({ domains }) => {
        const match = domains.find((item) => item.domain === domain);
        if (!match) setLoadError("This case type is not available.");
        setConfig(match ?? null);
      })
      .catch((error) => setLoadError(errorMessage(error)));
  }, [domain]);

  // Restore draft from localStorage on mount.
  useEffect(() => {
    if (draftRestored.current) return;
    draftRestored.current = true;
    try {
      const saved = window.localStorage.getItem(draftKey(domain));
      if (saved) {
        const parsed = JSON.parse(saved) as { answers?: Record<string, unknown>; consent?: typeof consent };
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.consent) setConsent((prev) => ({ ...prev, ...parsed.consent }));
      }
    } catch { /* ignore */ }
  }, [domain]);

  // Autosave answers & consent to localStorage on every change.
  useEffect(() => {
    if (!draftRestored.current || Object.keys(answers).length === 0) return;
    try {
      window.localStorage.setItem(draftKey(domain), JSON.stringify({ answers, consent }));
      setDraftSaved(true);
      const timer = setTimeout(() => setDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    } catch { /* ignore */ }
  }, [answers, consent, domain]);

  // Clear draft after successful submit.
  function clearDraft() {
    try { window.localStorage.removeItem(draftKey(domain)); } catch { /* ignore */ }
  }

  // Required-question completion metrics.
  const requiredQuestions = useMemo(() => config?.startQuestions?.filter((q) => q.required) ?? [], [config]);
  const answeredCount = useMemo(
    () => requiredQuestions.filter((q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== "").length,
    [requiredQuestions, answers]
  );
  const completionPct = requiredQuestions.length > 0 ? Math.round((answeredCount / requiredQuestions.length) * 100) : 100;

  function validateQuestions(): boolean {
    const next: Record<string, string> = {};
    for (const question of config?.startQuestions ?? []) {
      if (question.required && !String(answers[question.id] ?? "").trim()) {
        next[question.id] = "This answer is required.";
      }
    }
    if (domain === "biological" && answers.urgentSymptoms !== "yes" && !String(answers.caseNarrative ?? "").trim() && !answers.mediaId) {
      next.caseNarrative = "Write a detailed note or attach an audio/video recording.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstId = Object.keys(next)[0];
      const el = document.getElementById(`question-${firstId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function validateConsent(): boolean {
    const next: Record<string, string> = {};
    if (!consent.dataUsage) {
      next.consent = "Consent is needed to analyze this case and prepare a report.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onMediaSelected(file: File | undefined) {
    if (!file) return;
    const kind = file.type.startsWith("audio/") ? "audio" : file.type.startsWith("video/") ? "video" : null;
    if (!kind) {
      setSubmitError("Choose an audio or video file.");
      return;
    }
    setUploading(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.set("kind", kind);
      form.set("file", file);
      const result = await apiFetch<{ id: string; kind: "audio" | "video" }>("/api/case-workflows/uploads", { method: "POST", body: form });
      setAnswers((current) => ({ ...current, mediaId: result.id, mediaKind: result.kind }));
      setMediaPreview({ kind, url: URL.createObjectURL(file), name: file.name });
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  function removeMedia() {
    setAnswers((current) => {
      const next = { ...current };
      delete next.mediaId;
      delete next.mediaKind;
      return next;
    });
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(event?: FormEvent) {
    if (event) event.preventDefault();
    setSubmitError(null);
    if (uploading) return;
    if (!validateQuestions()) {
      setStep("Questions");
      return;
    }
    if (!validateConsent()) {
      setStep("Consent");
      return;
    }
    setSubmitting(true);
    try {
      const safetyAnswers: Record<string, unknown> = {};
      for (const q of config?.safetyQuestions ?? []) {
        const answer = answers[q.id];
        const safeOption = q.options?.find((o) => ["no", "yes_comfortable", "no_children", "low", "yes", "safe"].includes(o.value))?.value;
        safetyAnswers[q.id] = answer ?? safeOption ?? q.options?.[0]?.value ?? "no";
      }
      const view = await apiFetch<OwnerView>(`/api/case-workflows/${domain}`, {
        method: "POST",
        json: { safetyAnswers, answers, consent, bookingId },
      });
      clearDraft();
      router.push(`/case/workflows/${view.id}`);
    } catch (error) {
      // Visitors can read and fill the pathway; they sign in (or register) to submit it.
      if (error instanceof ApiClientError && error.status === 401) {
        router.push(`/auth?mode=register&next=${encodeURIComponent(`/case/workflows/new/${domain}`)}`);
        return;
      }
      setSubmitError(errorMessage(error));
      setSubmitting(false);
    }
  }

  if (loadError) return <ErrorState message={loadError} onRetry={() => location.reload()} />;
  if (!config) return <LoadingState label="Loading intake workflow…" />;

  const stepIndex = STEPS.indexOf(step);

  function goToStep(targetStep: Step) {
    const targetIdx = STEPS.indexOf(targetStep);
    if (targetIdx > 0 && !validateQuestions()) return;
    if (targetIdx > 1 && !validateConsent()) return;
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <ButtonLink href="/case/workflows" variant="ghost" size="sm" className="-ml-3">
          <ArrowLeft className="size-4" aria-hidden="true" /> All case types
        </ButtonLink>
        {draftSaved && (
          <span className="flex items-center gap-1.5 text-xs text-brand font-medium">
            <Check className="size-3.5" aria-hidden="true" /> Draft saved
          </span>
        )}
      </div>

      <PageHeader eyebrow="New case" title={config.label} description={config.description} className="mb-0" />

      {/* Interactive 3-step progress indicator */}
      <nav aria-label="Case intake steps" className="rounded-2xl border border-border bg-card p-4">
        <ol className="flex items-center gap-3">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <li key={s} className="flex-1">
                <button
                  type="button"
                  onClick={() => goToStep(s)}
                  className="flex w-full flex-col gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 transition-all"
                  aria-current={active ? "step" : undefined}
                >
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                      done ? "bg-brand" : active ? "bg-brand/60" : "bg-border"
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${active ? "text-foreground" : done ? "text-brand" : "text-muted-foreground"}`}>
                      {done ? <Check className="inline size-3.5 mr-1" aria-hidden="true" /> : null}
                      {i + 1}. {s}
                    </span>
                    {active && s === "Questions" && requiredQuestions.length > 0 && (
                      <span className="hidden sm:inline text-[11px] text-muted-foreground tabular-nums">
                        {completionPct}% complete
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {bookingId && (
        <Alert tone="success" title="Booking requested — one more step">
          Your practitioner reviews these answers and prepares a written report before you meet. It takes about five minutes.
        </Alert>
      )}

      {!bookingId && <PathwayPractitioners domain={domain} />}

      {/* ── STEP 1: QUESTIONS ────────────────────────────────────────── */}
      {step === "Questions" && (
        <div className="flex flex-col gap-6">
          {config.startQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Case intake details</CardTitle>
                <CardDescription>
                  For a more specific report, include what happened, when it began, what you have already tried, and what outcome you hope for.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* Inline required-question completion tracker */}
                {requiredQuestions.length > 0 && (
                  <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Required questions</span>
                      <span className="tabular-nums font-semibold text-foreground">
                        {answeredCount} of {requiredQuestions.length} answered ({completionPct}%)
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {config.startQuestions.map((question) => (
                  <div key={question.id} id={`question-${question.id}`}>
                    <QuestionField
                      question={question}
                      value={answers[question.id]}
                      error={errors[question.id]}
                      onChange={(value) => {
                        setAnswers((current) => ({ ...current, [question.id]: value }));
                        setErrors((prev) => ({ ...prev, [question.id]: "" }));
                      }}
                    />
                  </div>
                ))}

                {domain === "spiritual" && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">Ge&apos;ez Traditional Name Input</p>
                    <div className="flex flex-wrap gap-2">
                      {([["nameGeez", "Type my name with Ge'ez letters"], ["motherNameGeez", "Type my mother's name"]] as const).map(([id, label]) => (
                        <Button
                          key={id}
                          type="button"
                          size="sm"
                          variant={typingInto === id ? "primary" : "outline"}
                          onClick={() => setTypingInto(typingInto === id ? null : id)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                    {typingInto && (
                      <GeezKeyboard
                        onInsert={(char) => setAnswers((current) => ({ ...current, [typingInto]: `${String(current[typingInto] ?? "")}${char}` }))}
                        onBackspace={() => setAnswers((current) => ({ ...current, [typingInto]: [...String(current[typingInto] ?? "")].slice(0, -1).join("") }))}
                      />
                    )}
                    <GeezNamePreview name={nameText("nameGeez")} motherName={nameText("motherNameGeez")} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {domain === "biological" && (
            <Card>
              <CardHeader>
                <CardTitle>Voice dictation &amp; recording</CardTitle>
                <CardDescription>
                  You can dictate in Amharic or attach an optional audio/video recording for your assigned expert reviewer.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {/* Voice dictation tool */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Amharic Voice Dictation</span>
                    {voice.isListening && (
                      <Badge tone="danger">
                        <span className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-danger-foreground" />
                        Listening…
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Browser speech recognition generates an Amharic transcript for automated text analysis. Recording is opt-in.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={voice.isListening ? voice.stopListening : voice.startListening}>
                      {voice.isListening ? <Square className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
                      {voice.isListening ? "Stop dictation" : "Start Amharic dictation"}
                    </Button>
                    {voice.transcript && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = String(answers.caseNarrative ?? "").trim();
                          setAnswers((previous) => ({ ...previous, caseNarrative: [current, voice.transcript.trim()].filter(Boolean).join("\n") }));
                          voice.clearTranscript();
                        }}
                      >
                        <Plus className="size-4" aria-hidden="true" /> Add transcript to note
                      </Button>
                    )}
                  </div>
                  {voice.consentPending && (
                    <Alert tone="warning" title="Voice transcription consent">
                      <div className="flex flex-col gap-2">
                        <span>Allow your browser&apos;s speech-recognition provider to process live audio and return an Amharic transcript?</span>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={voice.acceptVoiceConsent}>Allow and start</Button>
                          <Button type="button" size="sm" variant="outline" onClick={voice.declineVoiceConsent}>Cancel</Button>
                        </div>
                      </div>
                    </Alert>
                  )}
                  {voice.error && <Alert tone="danger">{voice.error}</Alert>}
                  {voice.transcript && (
                    <p className="rounded-xl border border-border bg-background p-3 text-sm text-foreground" lang="am">
                      {voice.transcript}
                    </p>
                  )}
                </div>

                {/* Media upload dropzone */}
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border p-5 text-center transition-colors hover:border-brand/50">
                  {!mediaPreview && !answers.mediaId ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                        <UploadCloud className="size-6" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Attach an audio or video recording</p>
                      <p className="text-xs text-muted-foreground max-w-md">
                        Upload an audio note or short video clip for your reviewer. Automated analysis uses your written note; media is reviewed directly by your practitioner.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,video/*"
                        disabled={uploading}
                        onChange={(event) => void onMediaSelected(event.target.files?.[0])}
                        className="sr-only"
                        id="media-file-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2"
                      >
                        {uploading ? "Uploading recording…" : "Choose recording file"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          {mediaPreview?.kind === "audio" ? <FileAudio className="size-4 text-brand" /> : <FileVideo className="size-4 text-brand" />}
                          Attached recording {mediaPreview?.name ? `(${mediaPreview.name})` : ""}
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={removeMedia} className="text-danger hover:text-danger">
                          <Trash2 className="size-4" aria-hidden="true" /> Remove
                        </Button>
                      </div>
                      {mediaPreview?.kind === "audio" && <audio controls src={mediaPreview.url} className="w-full" />}
                      {mediaPreview?.kind === "video" && <video controls src={mediaPreview.url} className="max-h-64 w-full rounded-xl" />}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              size="lg"
              onClick={() => {
                if (validateQuestions()) {
                  setStep("Consent");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              Next: Consent &amp; Retention <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: CONSENT ──────────────────────────────────────────── */}
      {step === "Consent" && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent and privacy governance</CardTitle>
              <CardDescription>
                You are in complete control of your data. We adhere strictly to Ethiopian Data Protection Proclamations and customary privacy ethics.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Option 1: Data Usage Consent */}
              <div
                onClick={() => setConsent((c) => ({ ...c, dataUsage: !c.dataUsage }))}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  consent.dataUsage ? "border-brand/50 bg-brand/5" : "border-border bg-card"
                }`}
              >
                <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  consent.dataUsage ? "border-brand bg-brand text-background" : "border-muted-foreground/40 bg-background"
                }`}>
                  {consent.dataUsage && <Check className="size-3.5" aria-hidden="true" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
                    <span className="font-semibold text-foreground text-sm">Case analysis &amp; report preparation (Mandatory)</span>
                    <Badge tone={consent.dataUsage ? "brand" : "neutral"}>{consent.dataUsage ? "Consented" : "Required"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    I consent to processing my submitted answers to synthesize scientific and cultural insights and prepare my personalized care report.
                  </p>
                  {errors.consent && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.consent}</p>}
                </div>
              </div>

              {/* Option 2: Emergency Support Contact */}
              <div
                onClick={() => setConsent((c) => ({ ...c, emergencySupport: !c.emergencySupport }))}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  consent.emergencySupport ? "border-gold/50 bg-gold/5" : "border-border bg-card"
                }`}
              >
                <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  consent.emergencySupport ? "border-gold bg-gold text-background" : "border-muted-foreground/40 bg-background"
                }`}>
                  {consent.emergencySupport && <Check className="size-3.5" aria-hidden="true" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="size-4 text-gold" aria-hidden="true" />
                    <span className="font-semibold text-foreground text-sm">Emergency safety &amp; crisis routing</span>
                    <Badge tone={consent.emergencySupport ? "gold" : "neutral"}>{consent.emergencySupport ? "Enabled" : "Off"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    If severe clinical red-flags or imminent crisis patterns are detected, immediately provide verified emergency support hotlines and route to safety resources.
                  </p>
                </div>
              </div>

              {/* Option 3: Third-party Sharing */}
              <div
                onClick={() => setConsent((c) => ({ ...c, thirdPartySharing: !c.thirdPartySharing }))}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                  consent.thirdPartySharing ? "border-brand/50 bg-brand/5" : "border-border bg-card"
                }`}
              >
                <div className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  consent.thirdPartySharing ? "border-brand bg-brand text-background" : "border-muted-foreground/40 bg-background"
                }`}>
                  {consent.thirdPartySharing && <Check className="size-3.5" aria-hidden="true" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Share2 className="size-4 text-brand" aria-hidden="true" />
                    <span className="font-semibold text-foreground text-sm">Verified practitioner consultation sharing</span>
                    <Badge tone={consent.thirdPartySharing ? "brand" : "neutral"}>{consent.thirdPartySharing ? "Allowed" : "Restricted"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Allow secure, encrypted sharing strictly with verified secondary specialists or herbalists if a referral consultation is booked.
                  </p>
                </div>
              </div>

              {/* Retention Policy */}
              <div className="rounded-2xl border border-border p-4 bg-muted/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
                  <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>Data retention period</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Choose how long your raw intake answers and case drafts remain stored on the platform before automatic scheduled purging.
                </p>
                <select
                  value={consent.retention}
                  onChange={(e) => setConsent((c) => ({ ...c, retention: e.target.value as typeof c.retention }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="30_days">30 days — Standard temporary retention</option>
                  <option value="90_days">90 days — Recommended for follow-up review cycle</option>
                  <option value="1_year">1 year — Extended reference for recurring conditions</option>
                  <option value="until_closed">Until the case is closed — User managed purge</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setStep("Questions");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ChevronLeft className="size-4" aria-hidden="true" /> Back to Questions
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => {
                if (validateConsent()) {
                  setStep("Submit");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              Next: Review &amp; Submit <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SUBMIT ───────────────────────────────────────────── */}
      {step === "Submit" && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Review your case submission</CardTitle>
              <CardDescription>
                Check your intake answers and consent preferences before locking and submitting for verified expert review.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {submitError && <Alert tone="danger" title="Could not submit case">{submitError}</Alert>}

              {/* Case Summary Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domain Pathway</span>
                  <p className="font-display font-bold text-foreground text-base">{config.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="brand">{answeredCount} of {requiredQuestions.length} required answered</Badge>
                  {Boolean(answers.mediaId) && <Badge tone="success">Recording attached</Badge>}
                </div>
              </div>

              {/* Answers preview */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Answered Questions</span>
                <dl className="grid gap-3 rounded-2xl border border-border p-4 text-sm">
                  {config.startQuestions.map((q) => {
                    const ans = answers[q.id];
                    if (ans === undefined || ans === null || String(ans).trim() === "") return null;
                    const optLabel = q.options?.find((o) => o.value === String(ans))?.label ?? String(ans);
                    return (
                      <div key={q.id} className="grid gap-0.5 border-b border-border/50 pb-2.5 last:border-b-0 last:pb-0">
                        <dt className="text-xs font-medium text-muted-foreground">{q.text}</dt>
                        <dd className="font-semibold text-foreground text-sm">{optLabel}</dd>
                      </div>
                    );
                  })}
                  {domain === "spiritual" && nameText("nameGeez") && (
                    <div className="grid gap-0.5 border-b border-border/50 pb-2.5">
                      <dt className="text-xs font-medium text-muted-foreground">Traditional Ge&apos;ez Name</dt>
                      <dd className="font-geez font-semibold text-foreground text-sm">{nameText("nameGeez")}</dd>
                    </div>
                  )}
                  {domain === "spiritual" && nameText("motherNameGeez") && (
                    <div className="grid gap-0.5">
                      <dt className="text-xs font-medium text-muted-foreground">Mother&apos;s Ge&apos;ez Name</dt>
                      <dd className="font-geez font-semibold text-foreground text-sm">{nameText("motherNameGeez")}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Media preview in summary */}
              {mediaPreview && (
                <div className="flex flex-col gap-2 rounded-2xl border border-border p-4 bg-muted/20">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attached Recording</span>
                  {mediaPreview.kind === "audio" ? (
                    <audio controls src={mediaPreview.url} className="w-full mt-1" />
                  ) : (
                    <video controls src={mediaPreview.url} className="max-h-56 w-full rounded-xl mt-1" />
                  )}
                </div>
              )}

              {/* Consent overview badge row */}
              <div className="flex flex-col gap-2 rounded-2xl border border-border p-4 bg-muted/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Governance &amp; Consent</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="success"><ShieldCheck className="size-3 mr-1" /> Data usage consented</Badge>
                  {consent.emergencySupport && <Badge tone="gold"><HeartPulse className="size-3 mr-1" /> Emergency safety active</Badge>}
                  {consent.thirdPartySharing && <Badge tone="brand"><Share2 className="size-3 mr-1" /> Specialist sharing allowed</Badge>}
                  <Badge tone="neutral"><Clock className="size-3 mr-1" /> Retention: {consent.retention.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={() => {
                setStep("Consent");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ChevronLeft className="size-4" aria-hidden="true" /> Back to Consent
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={submitting}
              onClick={() => void onSubmit()}
            >
              {submitting ? "Submitting Case…" : "Submit for Expert Review"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
