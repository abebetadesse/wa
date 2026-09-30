"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle2, ExternalLink, FlaskConical, Leaf, Map as MapIcon, Pencil, Send, Sparkles, X } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, EmptyState, ErrorState, Field, Input, LoadingState, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { cn } from "@/lib/utils";

// ── API shapes ───────────────────────────────────────────────────────────────

interface Draft {
  id: string;
  source: string;
  title: string;
  body: string;
  remedies: { name: string; note?: string }[];
  status: "draft" | "sent" | "dismissed";
  heldReason: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface Review {
  booking: { id: string; reference: string; status: string; startsAt: string; deliveryMode: string; serviceName: string; clientNote: string | null; caseId: string | null };
  client: { name: string; phone: string | null; region: string | null; city: string | null; age: number | null };
  intake: { dropdownType: string; dropdownValue: string | null; dropdownLabel: string | null; text: string | null; nameGeez: string | null; motherNameGeez: string | null } | null;
  attachments: { id: string; kind: "image" | "audio" | "video"; mimeType: string; originalName: string | null; url: string }[];
  safety: { answers: Record<string, string> | null; flags: string[] };
  fewus: {
    heading: { key: string; titleAm: string; titleEn: string; bookMatch: string; orientationAm: string };
    bookReferences: { number: number; titleGeez: string; gloss: string; page: number }[];
    sourceNotes: { title: string; pages: string; safeUse: string }[];
    text: { geezText: string | null; amharicText: string | null; guidance: string | null } | null;
    plants: {
      items: { slug: string; name: string; amharicName: string | null; scientificName: string | null; toxic: boolean; alerts: { condition: string; level: string; note?: string }[]; notes: string | null }[];
      pairs: { a: string; b: string; severity: string | null; findings: { effect: string; management: string }[] }[];
      verdict: { tone: "danger" | "warning" | "info" | "success"; title: string; body: string };
      unmatched: string[];
    } | null;
  } | null;
  profile: {
    gematria: { letters: { letter: string; value: number }[]; nameTotal: number; motherTotal: number; combinedTotal: number; digitalRoot: number; virtue: string; resonance: string };
    awdeNegest: { circleNumber: number; circleName: string; circleGeez: string; guardian: string; symbol: string; temperament: string; section: number; sectionTime: string; category: { en: string; am: string }; reflection: string; proverb: string };
    humor: { key: string; am: string; en: string; quality: string };
    sacredNames: { name: string; nameGeez: string; gender: string; meaning: string; patron: string; monthlyCommemoration: number | null }[];
    boundary: string;
    text: string;
  } | null;
  drafts: Draft[];
  regions: string[];
}

interface Analysis {
  region: string;
  age: number | null;
  ecology: {
    ecology: { am: string; en: string; note: string; altitudeBand: string; ecosystem: string; climate: string };
    altitudeRisks: { risk: string; level: string; note: string }[];
    endemic: { key: string; label: string; level: string; note: string; prevention: string }[];
    food: { staples: string[]; leanNote: string; currentlyLean: boolean };
    minerals: { food: string; foodAm: string; raw: { phytateFe: number; phytateZn: number }; fermented: { phytateFe: number; phytateZn: number }; ironOk: boolean; zincOk: boolean }[];
    deficiencies: { nutrient: string; why: string; traditionalSolution: string }[];
    fermentationSolutions: string[];
    summary: string;
  };
  remedies: {
    urgency: { score: number; level: string; signs: { label: string }[]; advice: string };
    categories: string[];
    referFirst: boolean;
    candidates: { slug: string; name: string; scientificName: string | null; status: "consider" | "caution" | "excluded"; reasons: string[]; route: string; literature: { pmid: string; title: string; journal: string; year: string; url: string }[] }[];
    medicineInteractions: { a: string; b: string; severity: string; effect: string; management: string }[];
    unmatchedMedicines: string[];
    biochemistry: { levels: { level: string; label: string; causes: string[]; solutions: { mechanism: string; sources: { plant: string; compound: string; topicalOnly: boolean }[] }[] }[]; correlations: { symptom: string; cellularEvent: string; phytochemicals: string[] }[]; evidenceNote: string };
    culturalContext: { humor: string | null; note: string };
    literatureNote: string;
  };
}

const URGENCY_TONE: Record<string, "danger" | "warning" | "info" | "success"> = { emergency: "danger", urgent: "danger", soon: "warning", routine: "info" };
const STATUS_TONE = { consider: "success", caution: "warning", excluded: "danger" } as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BookingReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { business, base } = useWorkspace();
  const toast = useToast();
  const api = `/api/workspace/businesses/${business.id}`;
  const { data, error, reload } = useApi<Review>(`${api}/bookings/${bookingId}/review`, { liveTypes: ["intake.", "message.", "booking."] });

  async function insert(title: string, body: string, sendNow = false) {
    try {
      await apiFetch(`${api}/bookings/${bookingId}/drafts`, { method: "POST", json: { title, body, remedies: [], sendNow } });
      toast({ tone: "success", title: sendNow ? "Sent to the client" : "Added to your review drafts" });
      reload();
    } catch (err) {
      toast({ tone: "error", title: "Could not save", body: errorMessage(err) });
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState label="Opening the review…" />;
  const { booking, client, intake } = data;

  return (
    <div className="flex flex-col gap-6">
      <Link href={`${base}/bookings`} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Bookings
      </Link>
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-muted-foreground">{booking.reference}</p>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{booking.serviceName}</h1>
          <p className="text-muted-foreground">
            {client.name}
            {client.age != null && ` · ${client.age} years`}
            {client.region && ` · ${client.city ? `${client.city}, ` : ""}${client.region}`} · {new Date(booking.startsAt).toLocaleString()}
          </p>
        </div>
        <Badge tone="neutral" className="capitalize">{booking.status}</Badge>
        {booking.caseId && <Link href={`${base}/cases/${booking.caseId}`} className="text-sm font-semibold text-brand hover:underline">Open the linked case</Link>}
      </header>

      <DraftsPanel drafts={data.drafts} api={api} onChanged={reload} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <IntakePanel review={data} />
          {data.fewus && <FewusPanel fewus={data.fewus} api={api} onInsert={insert} onSaved={reload} />}
        </div>
        <div className="flex flex-col gap-6">
          {data.profile && <ProfileCard profile={data.profile} onInsert={insert} />}
          <SafetyPanel safety={data.safety} />
        </div>
      </div>

      <AnalysisPanel api={api} bookingId={bookingId} regions={data.regions} defaultRegion={client.region} defaultAge={client.age} onInsert={insert} />
    </div>
  );
}

// ── Drafts (one-click approval) ──────────────────────────────────────────────

function DraftsPanel({ drafts, api, onChanged }: { drafts: Draft[]; api: string; onChanged: () => void }) {
  const toast = useToast();
  const [editing, setEditing] = useState<Draft | null>(null);
  const pending = drafts.filter((d) => d.status === "draft");
  const history = drafts.filter((d) => d.status !== "draft");

  async function act(draft: Draft, action: "send" | "dismiss") {
    try {
      await apiFetch(`${api}/drafts/${draft.id}`, { method: "POST", json: { action } });
      toast({ tone: "success", title: action === "send" ? "Sent to the client" : "Draft dismissed" });
      onChanged();
    } catch (err) {
      toast({ tone: "error", title: "Could not update the draft", body: errorMessage(err) });
    }
  }

  return (
    <Card className={cn(pending.length > 0 && "border-gold/50")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Send className="size-5 text-gold" aria-hidden="true" /> Responses {pending.length > 0 && <Badge tone="gold">{pending.length} to review</Badge>}</CardTitle>
        <CardDescription>Prepared by your auto-response rules or inserted from this page. Edit, then send with one click.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting. Use &ldquo;Insert into review&rdquo; below to prepare a response.</p>}
        {pending.map((draft) => (
          <div key={draft.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex-1 font-semibold text-foreground">{draft.title}</p>
              <Badge tone="neutral">{draft.source === "rule" ? "From a rule" : draft.source === "manual" ? "Inserted" : "System"}</Badge>
            </div>
            {draft.heldReason && <p className="mt-1 flex items-center gap-1.5 text-xs text-warning"><AlertTriangle className="size-3.5" aria-hidden="true" /> {draft.heldReason}</p>}
            <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">{draft.body}</p>
            {draft.remedies.length > 0 && <p className="mt-2 text-sm text-foreground">Remedies: {draft.remedies.map((r) => r.name).join(", ")}</p>}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => act(draft, "dismiss")}><X className="size-4" aria-hidden="true" /> Dismiss</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(draft)}><Pencil className="size-4" aria-hidden="true" /> Edit</Button>
              <Button size="sm" onClick={() => act(draft, "send")}><CheckCircle2 className="size-4" aria-hidden="true" /> Approve & send</Button>
            </div>
          </div>
        ))}
        {history.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-muted-foreground">Sent and dismissed ({history.length})</summary>
            <ul className="mt-2 flex flex-col gap-2">
              {history.map((d) => (
                <li key={d.id} className="rounded-xl bg-muted/50 p-3">
                  <span className="font-semibold text-foreground">{d.title}</span> <Badge tone={d.status === "sent" ? "success" : "neutral"}>{d.status}</Badge>
                  {d.sentAt && <span className="ml-2 text-xs text-muted-foreground">{new Date(d.sentAt).toLocaleString()}</span>}
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
      {editing && <DraftEditor draft={editing} api={api} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />}
    </Card>
  );
}

function DraftEditor({ draft, api, onClose, onSaved }: { draft: Draft; api: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [error, setError] = useState<string | null>(null);
  async function save() {
    try {
      await apiFetch(`${api}/drafts/${draft.id}`, { method: "PATCH", json: { title, body, remedies: draft.remedies } });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  return (
    <Dialog open onClose={onClose} size="lg" title="Edit response" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save</Button></>}>
      <div className="flex flex-col gap-4">
        <Field label="Title">{(c) => <Input {...c} value={title} onChange={(e) => setTitle(e.target.value)} />}</Field>
        <Field label="Message">{(c) => <Textarea {...c} rows={12} value={body} onChange={(e) => setBody(e.target.value)} />}</Field>
        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </Dialog>
  );
}

// ── Intake and safety ────────────────────────────────────────────────────────

function IntakePanel({ review }: { review: Review }) {
  const { intake, attachments, booking } = review;
  return (
    <Card>
      <CardHeader><CardTitle>What the client shared</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {!intake && !booking.clientNote && attachments.length === 0 && <p className="text-muted-foreground">No intake details were given.</p>}
        {intake?.dropdownLabel && <p><span className="text-muted-foreground">Chose: </span><span className="font-semibold text-foreground">{intake.dropdownLabel}</span></p>}
        {intake?.nameGeez && <p><span className="text-muted-foreground">Name: </span><span lang="am" className="font-geez text-lg text-foreground">{intake.nameGeez}</span>{intake.motherNameGeez && <span lang="am" className="font-geez text-foreground"> · mother {intake.motherNameGeez}</span>}</p>}
        {intake?.text && <p className="whitespace-pre-wrap rounded-2xl bg-muted/50 p-3 text-foreground">{intake.text}</p>}
        {booking.clientNote && <p className="whitespace-pre-wrap text-muted-foreground">Note: {booking.clientNote}</p>}
        {attachments.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {attachments.map((a) => (
              <figure key={a.id} className="overflow-hidden rounded-2xl border border-border">
                {a.kind === "image" && (
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.url} alt={a.originalName ?? "Client photo"} className="max-h-72 w-full object-contain bg-muted" />
                  </a>
                )}
                {a.kind === "audio" && <audio controls preload="metadata" src={a.url} className="w-full" />}
                {a.kind === "video" && <video controls preload="metadata" src={a.url} className="max-h-72 w-full bg-black" />}
                <figcaption className="px-3 py-1.5 text-xs text-muted-foreground">{a.kind === "audio" ? "Voice note" : a.originalName ?? a.kind}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SafetyPanel({ safety }: { safety: Review["safety"] }) {
  if (!safety.answers && !safety.flags.length) return null;
  return (
    <Card className="border-warning/40">
      <CardHeader><CardTitle className="text-base">Safety answers</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        {safety.answers?.medicines && <p><span className="text-muted-foreground">Medicines: </span>{safety.answers.medicines}</p>}
        {safety.answers?.pregnantOrBreastfeeding && <p><span className="text-muted-foreground">Pregnant or breastfeeding: </span>{safety.answers.pregnantOrBreastfeeding}</p>}
        {safety.flags.map((flag) => <p key={flag} className="rounded-xl bg-warning/10 p-2 text-foreground">{flag}</p>)}
      </CardContent>
    </Card>
  );
}

// ── Metsehafe Fewus (Domain B text, Domain A plant safety) ───────────────────

function FewusPanel({ fewus, api, onInsert, onSaved }: { fewus: NonNullable<Review["fewus"]>; api: string; onInsert: (title: string, body: string, sendNow?: boolean) => void; onSaved: () => void }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [geez, setGeez] = useState(fewus.text?.geezText ?? "");
  const [amharic, setAmharic] = useState(fewus.text?.amharicText ?? "");
  const [guidance, setGuidance] = useState(fewus.text?.guidance ?? "");
  const refs = fewus.bookReferences.map((r) => `${r.titleGeez} (ገጽ ${r.page})`).join("; ");
  const safetyLines = fewus.plants?.items.map((p) => `• ${p.amharicName ?? ""} ${p.name}${p.toxic ? ": on the skin only, poisonous if swallowed" : ""}${p.alerts.length ? `: ${p.alerts.map((a) => `${a.level} (${a.condition})`).join(", ")}` : ""}`).join("\n");
  const block = [`መጽሐፈ ፈውስ · ${fewus.heading.titleAm}${refs ? ` — ${refs}` : ""}`, fewus.text?.geezText, fewus.text?.amharicText, fewus.text?.guidance, safetyLines ? `Safety notes:\n${safetyLines}` : ""].filter(Boolean).join("\n\n");

  async function save() {
    try {
      await apiFetch(`${api}/fewus/${fewus.heading.key}`, { method: "PUT", json: { geezText: geez, amharicText: amharic, guidance } });
      toast({ tone: "success", title: "Saved to your Fewus library", body: "It fills this heading automatically next time." });
      setEditing(false);
      onSaved();
    } catch (err) {
      toast({ tone: "error", title: "Could not save", body: errorMessage(err) });
    }
  }

  return (
    <Card className="border-gold/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BookOpen className="size-5 text-gold" aria-hidden="true" /> <span lang="am" className="font-geez">መጽሐፈ ፈውስ</span> · {fewus.heading.titleAm}</CardTitle>
        <CardDescription>{fewus.heading.titleEn}. {fewus.heading.orientationAm}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {fewus.bookReferences.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {fewus.bookReferences.map((r) => <li key={r.number} className="text-foreground"><span lang="am" className="font-geez">{r.titleGeez}</span> <span className="text-muted-foreground">({r.gloss}, page {r.page})</span></li>)}
          </ul>
        ) : (
          <p className="text-muted-foreground">The book&apos;s table of contents has no dedicated heading for this; see its condition sections.</p>
        )}

        {editing ? (
          <div className="flex flex-col gap-3">
            <Field label="Ge'ez prayer or formula (from your copy)">{(c) => <Textarea {...c} lang="am" className="font-geez" rows={4} value={geez} onChange={(e) => setGeez(e.target.value)} />}</Field>
            <Field label="Amharic remedy text">{(c) => <Textarea {...c} lang="am" rows={4} value={amharic} onChange={(e) => setAmharic(e.target.value)} />}</Field>
            <Field label="Your guidance and cautions">{(c) => <Textarea {...c} rows={3} value={guidance} onChange={(e) => setGuidance(e.target.value)} />}</Field>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={save}>Save to my library</Button></div>
          </div>
        ) : fewus.text?.geezText || fewus.text?.amharicText ? (
          <div className="flex flex-col gap-2 rounded-2xl bg-gold/5 p-3">
            {fewus.text.geezText && <p lang="am" className="whitespace-pre-wrap font-geez text-foreground">{fewus.text.geezText}</p>}
            {fewus.text.amharicText && <p lang="am" className="whitespace-pre-wrap text-foreground">{fewus.text.amharicText}</p>}
            {fewus.text.guidance && <p className="whitespace-pre-wrap text-muted-foreground">{fewus.text.guidance}</p>}
            <Button size="sm" variant="ghost" className="self-end" onClick={() => setEditing(true)}><Pencil className="size-4" aria-hidden="true" /> Edit my text</Button>
          </div>
        ) : (
          <Alert tone="info" title="Add your text for this heading">
            The platform does not reproduce the book&apos;s prayers or remedies. Write the text you use once; it then fills this heading and any rule that includes it.{" "}
            <button type="button" className="font-semibold text-brand underline" onClick={() => setEditing(true)}>Write it now</button>
          </Alert>
        )}

        {fewus.plants && (
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 font-semibold text-foreground"><Leaf className="size-4 text-success" aria-hidden="true" /> Plants, checked against this client</p>
            <Alert tone={fewus.plants.verdict.tone} title={fewus.plants.verdict.title}>{fewus.plants.verdict.body}</Alert>
            {fewus.plants.items.map((p) => (
              <div key={p.slug} className="rounded-xl border border-border p-2.5">
                <p className="font-semibold text-foreground"><span lang="am" className="font-geez">{p.amharicName}</span> {p.name} <span className="italic text-muted-foreground">{p.scientificName}</span></p>
                {p.toxic && <p className="text-xs text-danger">Poisonous if swallowed: skin use only.</p>}
                {p.alerts.map((a) => <p key={a.condition} className="text-xs text-warning">{a.level === "avoid" ? "Avoid" : "Caution"}: {a.condition}{a.note ? `. ${a.note}` : ""}</p>)}
              </div>
            ))}
            {fewus.plants.pairs.filter((pair) => pair.severity).map((pair) => (
              <p key={`${pair.a}-${pair.b}`} className="rounded-xl bg-danger/10 p-2 text-xs text-foreground">{pair.a} + {pair.b} ({pair.severity}): {pair.findings[0]?.effect} {pair.findings[0]?.management}</p>
            ))}
            <Link href={`/safety?items=${fewus.plants.items.map((p) => p.slug).join(",")}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">Open in the safety matrix <ExternalLink className="size-3" aria-hidden="true" /></Link>
          </div>
        )}

        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">About this source</summary>
          {fewus.sourceNotes.map((note) => <p key={note.title} className="mt-1">{note.title} (pp. {note.pages}): {note.safeUse}</p>)}
        </details>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => onInsert(`መጽሐፈ ፈውስ · ${fewus.heading.titleAm}`, block)}>Insert into review</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Name reckoning & Awde Negest (Domain B) ──────────────────────────────────

function ProfileCard({ profile, onInsert }: { profile: NonNullable<Review["profile"]>; onInsert: (title: string, body: string, sendNow?: boolean) => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <Card className="border-brand/30 bg-gradient-to-br from-gold/10 via-card to-brand/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-gold" aria-hidden="true" /> Name reckoning & Awde Negest</CardTitle>
        <CardDescription>{profile.boundary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="flex flex-wrap gap-1" lang="am">
          {profile.gematria.letters.map((l, i) => (
            <span key={i} className="flex flex-col items-center rounded-lg border border-gold/40 px-1.5 py-0.5"><span className="font-geez text-base">{l.letter}</span><span className="text-[10px] text-muted-foreground">{l.value}</span></span>
          ))}
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div><dt className="text-xs text-muted-foreground">Total</dt><dd className="font-semibold tabular-nums">{profile.gematria.combinedTotal}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Digital root</dt><dd className="font-display text-2xl font-extrabold text-gold">{profile.gematria.digitalRoot}</dd></div>
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Virtue</dt><dd className="text-foreground">{profile.gematria.virtue}</dd></div>
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Ruling circle</dt><dd className="text-foreground">{profile.awdeNegest.symbol} <span lang="am" className="font-geez">{profile.awdeNegest.circleGeez}</span> · {profile.awdeNegest.circleName}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Section</dt><dd className="text-foreground">{profile.awdeNegest.sectionTime === "day" ? "መዓልት (day)" : "ሌሊት (night)"} {profile.awdeNegest.section}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Humour</dt><dd className="text-foreground"><span lang="am" className="font-geez">{profile.humor.am}</span> · {profile.humor.en}</dd></div>
        </dl>
        <p className="italic text-muted-foreground">{profile.awdeNegest.proverb}</p>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sacred names to consider</p>
          <ul className="flex flex-col gap-2">
            {profile.sacredNames.map((n) => (
              <li key={n.name} className="rounded-xl bg-card/80 p-2.5">
                <p className="font-semibold text-foreground"><span lang="am" className="font-geez">{n.nameGeez}</span> · {n.name}</p>
                <p className="text-xs text-muted-foreground">{n.meaning} · {n.patron}{n.monthlyCommemoration ? ` · remembered on day ${n.monthlyCommemoration} of each month` : ""}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => onInsert("Name reckoning & Awde Negest", profile.text)}>Insert into review</Button>
          <Button onClick={() => setConfirming(true)}><Send className="size-4" aria-hidden="true" /> Auto-communicate to client</Button>
        </div>
      </CardContent>
      <Dialog open={confirming} onClose={() => setConfirming(false)} title="Send this reading to the client now?" description="It goes to their messages straight away, without a draft." footer={<><Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button><Button onClick={() => { setConfirming(false); onInsert("Name reckoning & Awde Negest", profile.text, true); }}>Send now</Button></>}>
        <p className="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">{profile.text}</p>
      </Dialog>
    </Card>
  );
}

// ── Analysis (Domain A) ──────────────────────────────────────────────────────

function AnalysisPanel({ api, bookingId, regions, defaultRegion, defaultAge, onInsert }: { api: string; bookingId: string; regions: string[]; defaultRegion: string | null; defaultAge: number | null; onInsert: (title: string, body: string) => void }) {
  const [region, setRegion] = useState(defaultRegion && regions.includes(defaultRegion) ? defaultRegion : regions[0]);
  const [age, setAge] = useState(defaultAge != null ? String(defaultAge) : "");
  const [literature, setLiterature] = useState(true);
  const [result, setResult] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      setResult(await apiFetch<Analysis>(`${api}/bookings/${bookingId}/analysis`, { method: "POST", json: { region, age: age ? Number(age) : null, includeLiterature: literature } }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const summaryText = result
    ? [
        `Remedy screening (${result.remedies.categories.join(", ") || "general"}):`,
        ...result.remedies.candidates.map((c) => `• ${c.name} (${c.status}${c.route === "topical_only" ? ", skin only" : ""})${c.reasons.length ? `: ${c.reasons.join(" ")}` : ""}`),
        "",
        `Place & diet: ${result.ecology.summary}`,
        ...result.ecology.deficiencies.map((d) => `• ${d.nutrient}: ${d.traditionalSolution}`),
      ].join("\n")
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FlaskConical className="size-5 text-brand" aria-hidden="true" /> Scientific analysis</CardTitle>
        <CardDescription>Remedy screening against this client, live PubMed literature, where they live and eat, and the biochemistry behind the complaint. Scientific side only: the reading above is never used here.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Region">{(c) => <Select {...c} value={region} onChange={(e) => setRegion(e.target.value)} className="w-48">{regions.map((r) => <option key={r} value={r}>{r}</option>)}</Select>}</Field>
          <Field label="Age">{(c) => <Input {...c} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} className="w-24" />}</Field>
          <label className="flex items-center gap-2 pb-3 text-sm text-muted-foreground"><input type="checkbox" checked={literature} onChange={(e) => setLiterature(e.target.checked)} className="size-4 accent-[var(--brand-accent)]" /> Search PubMed</label>
          <Button onClick={run} disabled={busy} className="mb-1">{busy ? "Analysing…" : result ? "Run again" : "Run analysis"}</Button>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        {!result && !busy && <EmptyState title="Not run yet" description="Takes a few seconds; PubMed lookups need an internet connection." />}
        {busy && <LoadingState label="Screening remedies and searching the literature…" />}
        {result && (
          <>
            <Alert tone={URGENCY_TONE[result.remedies.urgency.level]} title={`Urgency: ${result.remedies.urgency.level}`}>
              {result.remedies.urgency.signs.length > 0 && <>{result.remedies.urgency.signs.map((s) => s.label).join(", ")}. </>}
              {result.remedies.urgency.advice}
            </Alert>

            <section>
              <h3 className="mb-2 font-semibold text-foreground">Remedy candidates</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {result.remedies.candidates.map((c) => (
                  <div key={c.slug} className="rounded-2xl border border-border p-3 text-sm">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">{c.name} <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>{c.route === "topical_only" && <Badge tone="neutral">skin only</Badge>}</p>
                    <p className="text-xs italic text-muted-foreground">{c.scientificName}</p>
                    {c.reasons.map((r) => <p key={r} className="mt-1 text-xs text-muted-foreground">{r}</p>)}
                    {c.literature.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1">
                        {c.literature.map((a) => <li key={a.pmid}><a href={a.url} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline">PMID {a.pmid}: {a.title} ({a.journal} {a.year})</a></li>)}
                      </ul>
                    )}
                  </div>
                ))}
                {result.remedies.candidates.length === 0 && <p className="text-sm text-muted-foreground">No plants matched these complaints.</p>}
              </div>
              {result.remedies.medicineInteractions.map((m) => <p key={`${m.a}-${m.b}`} className="mt-2 rounded-xl bg-danger/10 p-2 text-xs">Between the client&apos;s medicines: {m.a} + {m.b} ({m.severity}): {m.effect}</p>)}
              {result.remedies.unmatchedMedicines.length > 0 && <p className="mt-2 text-xs text-warning">Not recognised, check by hand: {result.remedies.unmatchedMedicines.join(", ")}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{result.remedies.literatureNote}</p>
            </section>

            <section className="rounded-2xl border border-border p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground"><MapIcon className="size-4 text-brand" aria-hidden="true" /> Place, altitude & food: {result.region}</h3>
              <p className="text-sm text-foreground"><span lang="am" className="font-geez">{result.ecology.ecology.am}</span> · {result.ecology.ecology.en}. {result.ecology.ecology.note}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Common in the area</p>
                  {result.ecology.endemic.map((e) => <p key={e.key} className="mt-1 text-sm"><Badge tone={e.level === "high" ? "danger" : "warning"}>{e.level}</Badge> <span className="font-semibold">{e.label}</span>: <span className="text-muted-foreground">{e.note} {e.prevention}</span></p>)}
                  {result.ecology.altitudeRisks.map((r) => <p key={r.risk} className="mt-1 text-sm"><span className="font-semibold">{r.risk}</span>: <span className="text-muted-foreground">{r.note}</span></p>)}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Food & minerals</p>
                  <p className="text-sm text-muted-foreground">Staples: {result.ecology.food.staples.join(", ")}. {result.ecology.food.leanNote}</p>
                  {result.ecology.minerals.length > 0 && (
                    <table className="mt-2 w-full text-xs">
                      <thead className="text-muted-foreground"><tr><th className="text-left">Food</th><th>Phytate:Fe raw → fermented</th><th>Phytate:Zn raw → fermented</th></tr></thead>
                      <tbody>
                        {result.ecology.minerals.map((m) => (
                          <tr key={m.food}>
                            <td className="py-1">{m.food}</td>
                            <td className={cn("text-center tabular-nums", m.ironOk ? "text-success" : "text-warning")}>{m.raw.phytateFe} → {m.fermented.phytateFe}</td>
                            <td className={cn("text-center tabular-nums", m.zincOk ? "text-success" : "text-warning")}>{m.raw.phytateZn} → {m.fermented.phytateZn}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {result.ecology.deficiencies.map((d) => <p key={d.nutrient} className="mt-2 text-sm"><span className="font-semibold">{d.nutrient}:</span> <span className="text-muted-foreground">{d.why} {d.traditionalSolution}</span></p>)}
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-foreground">From molecule to symptom</h3>
              <div className="grid gap-3 lg:grid-cols-2">
                {result.remedies.biochemistry.levels.map((level) => (
                  <div key={level.level} className="rounded-2xl border border-border p-3 text-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand">{level.label}</p>
                    {level.causes.map((cause) => <p key={cause} className="mt-1 text-muted-foreground">• {cause}</p>)}
                    {level.solutions.map((s) => (
                      <p key={s.mechanism} className="mt-2 text-foreground">↳ {s.mechanism}{s.sources.length > 0 && <span className="text-muted-foreground"> ({s.sources.map((src) => `${src.compound}, ${src.plant}${src.topicalOnly ? " (skin only)" : ""}`).join("; ")})</span>}</p>
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{result.remedies.biochemistry.evidenceNote}</p>
            </section>

            {result.remedies.culturalContext.humor && <p className="text-xs text-muted-foreground">{result.remedies.culturalContext.note}</p>}
            <div className="flex justify-end"><Button variant="outline" onClick={() => onInsert("Remedy screening & diet", summaryText)}>Insert summary into review</Button></div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
