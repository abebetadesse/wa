"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Check, Clock, ShieldCheck } from "lucide-react";
import { apiFetch, ApiClientError, errorMessage } from "@/lib/api/client";
import { Alert, Button, ChoiceGroup, ErrorState, Field, LoadingState, Textarea } from "@/components/ui";
import { MODE_LABELS, formatEtb } from "@/features/marketplace/shared";
import { useSession } from "@/features/session/SessionProvider";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceEtb: string;
  deliveryModes: string[];
  kind: string;
  requiresSafetyScreen: boolean;
  /** Set for services that open an expert-reviewed case (e.g. readings). */
  caseDomain: string | null;
}

interface Business {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  services: Service[];
  team: { id: string; name: string | null; title: string | null }[];
}

type Step = "service" | "how" | "time" | "safety" | "confirm";

const DAYS_SHOWN = 14;

function dateInZone(offsetDays: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() + offsetDays * 86_400_000));
}

export function BookingWizard({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: sessionLoading } = useSession();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState<string | null>(params.get("service"));
  const [mode, setMode] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [safety, setSafety] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [step, setStep] = useState<Step>("service");

  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Business>(`/api/marketplace/businesses/${slug}`)
      .then((data) => {
        setBusiness(data);
        setDate(dateInZone(0, data.timezone));
        if (params.get("service") && data.services.some((s) => s.id === params.get("service"))) setStep("how");
      })
      .catch((error) => setLoadError(errorMessage(error)));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const service = business?.services.find((s) => s.id === serviceId) ?? null;
  useEffect(() => {
    if (service && (!mode || !service.deliveryModes.includes(mode))) setMode(service.deliveryModes[0] ?? null);
  }, [service, mode]);

  const loadSlots = useCallback(async () => {
    if (!serviceId || !date) return;
    setSlots(null);
    setSlotsError(null);
    try {
      const query = new URLSearchParams({ serviceId, date, ...(memberId ? { memberId } : {}) });
      const data = await apiFetch<{ slots: string[] }>(`/api/marketplace/businesses/${slug}/slots?${query}`);
      setSlots(data.slots);
      setSlot((current) => (current && data.slots.includes(current) ? current : null));
    } catch (error) {
      setSlotsError(errorMessage(error));
    }
  }, [slug, serviceId, date, memberId]);

  useEffect(() => {
    if (step === "time") loadSlots();
  }, [step, loadSlots]);

  // Availability changes as others book: refresh when the tab regains focus.
  useEffect(() => {
    if (step !== "time") return;
    const onFocus = () => loadSlots();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [step, loadSlots]);

  const days = useMemo(() => (business ? Array.from({ length: DAYS_SHOWN }, (_, i) => dateInZone(i, business.timezone)) : []), [business]);
  const tz = business?.timezone ?? "Africa/Addis_Ababa";
  const timeLabel = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const dayLabel = (d: string, style: "short" | "long" = "short") =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: style, day: "numeric", month: style === "long" ? "long" : "short" }).format(new Date(`${d}T12:00:00Z`));

  const steps: { id: Step; label: string }[] = [
    { id: "service", label: "Service" },
    { id: "how", label: "How & who" },
    { id: "time", label: "Time" },
    ...(service?.requiresSafetyScreen ? [{ id: "safety" as Step, label: "Safety" }] : []),
    { id: "confirm", label: "Confirm" },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);
  const next = () => setStep(steps[Math.min(stepIndex + 1, steps.length - 1)].id);
  const back = () => setStep(steps[Math.max(stepIndex - 1, 0)].id);

  const safetyComplete = !service?.requiresSafetyScreen || (safety.takingMedicines && safety.pregnantOrBreastfeeding && (safety.takingMedicines !== "yes" || safety.medicines?.trim()));

  async function confirm() {
    if (!user) {
      router.push(`/auth?next=${encodeURIComponent(`/b/${slug}/book?service=${serviceId}`)}`);
      return;
    }
    if (!service || !slot || !mode) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await apiFetch<{ id: string }>(`/api/marketplace/businesses/${slug}/bookings`, {
        method: "POST",
        json: {
          serviceId: service.id,
          startsAt: slot,
          deliveryMode: mode,
          memberId: memberId || undefined,
          note: note.trim() || undefined,
          safety: service.requiresSafetyScreen
            ? { takingMedicines: safety.takingMedicines, medicines: safety.medicines?.trim() || undefined, pregnantOrBreastfeeding: safety.pregnantOrBreastfeeding, conditions: safety.conditions?.trim() || undefined }
            : undefined,
        },
      });
      // Readings and reviews continue straight into the case intake the practitioner will review.
      router.push(service.caseDomain ? `/case/workflows/new/${service.caseDomain}?booking=${booking.id}` : `/account/bookings/${booking.id}?new=1`);
    } catch (error) {
      setSubmitError(errorMessage(error));
      if (error instanceof ApiClientError && error.status === 409) {
        setSlot(null);
        setStep("time");
        loadSlots();
      }
      setSubmitting(false);
    }
  }

  if (loadError) return <ErrorState message={loadError} onRetry={() => location.reload()} />;
  if (!business) return <LoadingState label="Loading services…" />;

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/b/${slug}`} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> {business.name}
      </Link>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Book with {business.name}</h1>

      <ol className="flex gap-2" aria-label="Booking steps">
        {steps.map((s, index) => (
          <li key={s.id} className="flex flex-1 flex-col gap-1.5" aria-current={s.id === step ? "step" : undefined}>
            <span className={cn("h-1.5 rounded-full transition-colors", index <= stepIndex ? "bg-brand" : "bg-border")} />
            <span className={cn("hidden text-xs font-semibold sm:block", index === stepIndex ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.section key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }} className="flex flex-col gap-5">
          {step === "service" && (
            <>
              <h2 className="font-display text-xl font-bold text-foreground">Choose a service</h2>
              <ul className="flex flex-col gap-3">
                {business.services.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceId(s.id);
                        setSlot(null);
                        setStep("how");
                      }}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                        serviceId === s.id ? "border-brand bg-brand/10" : "border-border bg-card hover:border-input",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">{s.name}</span>
                        <span className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" /> {s.durationMinutes} min</span>
                          <span>{s.kind}</span>
                          {s.requiresSafetyScreen && <span className="inline-flex items-center gap-1 text-warning"><ShieldCheck className="size-3.5" aria-hidden="true" /> Safety check</span>}
                        </span>
                      </span>
                      <span className="font-display font-bold text-foreground">{formatEtb(s.priceEtb)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === "how" && service && (
            <>
              <ChoiceGroup
                name="mode"
                legend="How would you like to meet?"
                value={mode ?? undefined}
                onChange={setMode}
                options={service.deliveryModes.map((m) => ({ value: m, label: MODE_LABELS[m]?.label ?? m }))}
              />
              {business.team.length > 1 && (
                <ChoiceGroup
                  name="member"
                  legend="Practitioner"
                  value={memberId}
                  onChange={(value) => {
                    setMemberId(value);
                    setSlot(null);
                  }}
                  options={[{ value: "", label: "Anyone available" }, ...business.team.map((m) => ({ value: m.id, label: m.name ?? "Practitioner", hint: m.title ?? undefined }))]}
                />
              )}
            </>
          )}

          {step === "time" && (
            <>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                <CalendarDays className="size-5 text-brand" aria-hidden="true" /> Pick a day and time
              </h2>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="listbox" aria-label="Day">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="option"
                    aria-selected={date === d}
                    onClick={() => {
                      setDate(d);
                      setSlot(null);
                    }}
                    className={cn(
                      "flex min-w-[4.5rem] flex-col items-center rounded-2xl border px-3 py-2 text-sm transition-colors",
                      date === d ? "border-brand bg-brand text-primary-foreground" : "border-border bg-card text-foreground hover:border-input",
                    )}
                  >
                    <span className="text-xs font-semibold opacity-80">{dayLabel(d).split(" ")[0]}</span>
                    <span className="font-display text-lg font-bold">{Number(d.slice(8))}</span>
                  </button>
                ))}
              </div>
              {slotsError && <Alert tone="danger">{slotsError}</Alert>}
              {!slots && !slotsError && <LoadingState label="Checking availability…" className="min-h-24" />}
              {slots && slots.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No free times on {date && dayLabel(date, "long")}. Try another day.</p>
              )}
              {slots && slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="listbox" aria-label="Time">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="option"
                      aria-selected={slot === s}
                      onClick={() => setSlot(s)}
                      className={cn("rounded-xl border py-2.5 text-sm font-semibold transition-colors", slot === s ? "border-brand bg-brand text-primary-foreground" : "border-border bg-card text-foreground hover:border-brand")}
                    >
                      {timeLabel(s)}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Times are shown in the business&apos;s local time ({tz.replace("_", " ")}).</p>
            </>
          )}

          {step === "safety" && (
            <>
              <Alert tone="info" title="A few safety questions">
                This service may involve a remedy or hands-on practice. Your answers go only to the practitioner so they can prepare safely.
              </Alert>
              <ChoiceGroup
                name="takingMedicines"
                legend="Are you taking any medicines right now?"
                required
                value={safety.takingMedicines}
                onChange={(value) => setSafety((current) => ({ ...current, takingMedicines: value }))}
                options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }, { value: "prefer_not", label: "I prefer not to say" }]}
              />
              {safety.takingMedicines === "yes" && (
                <Field label="Which medicines?" required hint="For example: metformin, warfarin, blood pressure tablets.">
                  {(control) => <Textarea {...control} rows={2} value={safety.medicines ?? ""} onChange={(e) => setSafety((c) => ({ ...c, medicines: e.target.value }))} />}
                </Field>
              )}
              <ChoiceGroup
                name="pregnant"
                legend="Are you pregnant or breastfeeding?"
                required
                value={safety.pregnantOrBreastfeeding}
                onChange={(value) => setSafety((current) => ({ ...current, pregnantOrBreastfeeding: value }))}
                options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }, { value: "not_applicable", label: "Not applicable" }, { value: "prefer_not", label: "I prefer not to say" }]}
              />
              <Field label="Any conditions or injuries the practitioner should know about? (optional)">
                {(control) => <Textarea {...control} rows={2} value={safety.conditions ?? ""} onChange={(e) => setSafety((c) => ({ ...c, conditions: e.target.value }))} />}
              </Field>
            </>
          )}

          {step === "confirm" && service && slot && (
            <>
              <div className="rounded-3xl border border-border bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your booking</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{service.name}</p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-muted-foreground">When</dt><dd className="font-semibold text-foreground">{date && dayLabel(date, "long")}, {timeLabel(slot)}</dd></div>
                  <div><dt className="text-muted-foreground">Length</dt><dd className="font-semibold text-foreground">{service.durationMinutes} minutes</dd></div>
                  <div><dt className="text-muted-foreground">How</dt><dd className="font-semibold text-foreground">{mode && (MODE_LABELS[mode]?.label ?? mode)}</dd></div>
                  <div><dt className="text-muted-foreground">Price</dt><dd className="font-semibold text-foreground">{formatEtb(service.priceEtb)} · pay the business directly</dd></div>
                </dl>
              </div>
              {service.caseDomain && (
                <Alert tone="info" title="A short intake follows">
                  After you request this booking you&apos;ll answer a few questions. {business.name} reviews your answers and prepares your written reading before you meet.
                </Alert>
              )}
              <Field label="Message for the business (optional)">
                {(control) => <Textarea {...control} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything they should prepare or know?" />}
              </Field>
              {!sessionLoading && !user && <Alert tone="info">Sign in or create an account to send the request. You&apos;ll come straight back here with this service selected.</Alert>}
              {submitError && <Alert tone="danger" title="Could not book">{submitError}</Alert>}
            </>
          )}
        </motion.section>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || submitting}>
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Button>
        {step === "confirm" ? (
          <Button size="lg" onClick={confirm} disabled={submitting || !slot}>
            <Check className="size-4" aria-hidden="true" /> {submitting ? "Sending request…" : user ? "Request booking" : "Sign in to book"}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={next}
            disabled={(step === "service" && !service) || (step === "how" && !mode) || (step === "time" && !slot) || (step === "safety" && !safetyComplete)}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
