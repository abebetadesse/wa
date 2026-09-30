"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Mic, Square, Trash2, Video } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { GeezKeyboard, GeezNamePreview } from "@/features/cases/GeezNameTools";
import { cn } from "@/lib/utils";

export interface IntakeConfig {
  allowText: boolean;
  allowImage: boolean;
  allowAudio: boolean;
  allowVideo: boolean;
  dropdownType: "none" | "custom" | "metsehafe_fewus" | "awde_negest";
  dropdownLabel: string | null;
  textPrompt: string | null;
  options: { value: string; label: string }[];
  asksGeezName: boolean;
}

export interface IntakeAttachment {
  id: string;
  kind: "image" | "audio" | "video";
  name: string;
  previewUrl: string;
}

export interface IntakeValue {
  dropdownValue: string;
  text: string;
  nameGeez: string;
  motherNameGeez: string;
  attachments: IntakeAttachment[];
}

export const EMPTY_INTAKE: IntakeValue = { dropdownValue: "", text: "", nameGeez: "", motherNameGeez: "", attachments: [] };

export function hasIntake(config: IntakeConfig | undefined) {
  return Boolean(config && (config.allowText || config.allowImage || config.allowAudio || config.allowVideo || config.dropdownType !== "none"));
}

/** What the booking API expects. */
export function intakePayload(value: IntakeValue) {
  return {
    dropdownValue: value.dropdownValue || undefined,
    text: value.text.trim() || undefined,
    nameGeez: value.nameGeez.trim() || undefined,
    motherNameGeez: value.motherNameGeez.trim() || undefined,
    attachmentIds: value.attachments.map((a) => a.id),
  };
}

const MAX_ATTACHMENTS = 10;

export function IntakeStep({ serviceId, config, value, onChange, signedIn }: { serviceId: string; config: IntakeConfig; value: IntakeValue; onChange: (next: IntakeValue) => void; signedIn: boolean }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typingInto, setTypingInto] = useState<"nameGeez" | "motherNameGeez" | null>(null);
  const set = (patch: Partial<IntakeValue>) => onChange({ ...value, ...patch });

  async function upload(file: File | Blob, kind: IntakeAttachment["kind"], name: string) {
    if (value.attachments.length >= MAX_ATTACHMENTS) return setError(`Up to ${MAX_ATTACHMENTS} attachments.`);
    setUploading(kind);
    setError(null);
    try {
      const form = new FormData();
      form.set("serviceId", serviceId);
      form.set("kind", kind);
      form.set("file", file instanceof File ? file : new File([file], name, { type: file.type }));
      const result = await apiFetch<{ id: string }>("/api/intake/uploads", { method: "POST", body: form });
      onChange({ ...value, attachments: [...value.attachments, { id: result.id, kind, name, previewUrl: URL.createObjectURL(file) }] });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(null);
    }
  }

  const media = [config.allowImage && "image", config.allowAudio && "audio", config.allowVideo && "video"].filter(Boolean) as IntakeAttachment["kind"][];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-xl font-bold text-foreground">Tell the healer about your situation</h2>

      {config.dropdownType !== "none" && config.options.length > 0 && (
        <Field label={config.dropdownLabel ?? "Choose one"} required>
          {(control) => (
            <Select {...control} value={value.dropdownValue} onChange={(e) => set({ dropdownValue: e.target.value })}>
              <option value="">Choose…</option>
              {config.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          )}
        </Field>
      )}

      {config.asksGeezName && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name in Ge'ez letters" required hint="For example ሰላማዊት">{(control) => <Input {...control} lang="am" className="font-geez" value={value.nameGeez} onChange={(e) => set({ nameGeez: e.target.value })} />}</Field>
            <Field label="Your mother's name (optional)">{(control) => <Input {...control} lang="am" className="font-geez" value={value.motherNameGeez} onChange={(e) => set({ motherNameGeez: e.target.value })} />}</Field>
          </div>
          <div className="flex flex-wrap gap-2">
            {([["nameGeez", "Type my name with Ge'ez letters"], ["motherNameGeez", "Type my mother's name"]] as const).map(([key, label]) => (
              <Button key={key} type="button" size="sm" variant={typingInto === key ? "primary" : "outline"} onClick={() => setTypingInto(typingInto === key ? null : key)}>{label}</Button>
            ))}
          </div>
          {typingInto && (
            <GeezKeyboard
              onInsert={(char) => set({ [typingInto]: `${value[typingInto]}${char}` } as Partial<IntakeValue>)}
              onBackspace={() => set({ [typingInto]: [...value[typingInto]].slice(0, -1).join("") } as Partial<IntakeValue>)}
            />
          )}
          <GeezNamePreview name={value.nameGeez} motherName={value.motherNameGeez} />
        </div>
      )}

      {config.allowText && (
        <Field label={config.textPrompt ?? "Describe what is happening, in your own words"} hint="Any language. Only the healer's team sees this.">
          {(control) => <Textarea {...control} rows={5} maxLength={4000} value={value.text} onChange={(e) => set({ text: e.target.value })} />}
        </Field>
      )}

      {media.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Add a photo, voice note or video (optional)</p>
          {!signedIn ? (
            <Alert tone="info">Sign in to attach photos or recordings. You can still describe things in writing.</Alert>
          ) : (
            <div className="flex flex-wrap gap-2">
              {config.allowImage && <FilePick kind="image" accept="image/*" capture="environment" label="Photo" icon={Camera} busy={uploading === "image"} onPick={(file) => upload(file, "image", file.name)} />}
              {config.allowAudio && <VoiceRecorder busy={uploading === "audio"} onRecorded={(blob) => upload(blob, "audio", `voice-note.${blob.type.includes("mp4") ? "m4a" : "webm"}`)} />}
              {config.allowVideo && <FilePick kind="video" accept="video/*" capture="environment" label="Video" icon={Video} busy={uploading === "video"} onPick={(file) => upload(file, "video", file.name)} />}
            </div>
          )}
          {error && <Alert tone="danger">{error}</Alert>}
          {value.attachments.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {value.attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center gap-3 rounded-2xl border border-border p-2">
                  {attachment.kind === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={attachment.previewUrl} alt="" className="size-14 rounded-xl object-cover" />
                  )}
                  {attachment.kind === "audio" && <audio controls src={attachment.previewUrl} className="h-10 min-w-0 flex-1" />}
                  {attachment.kind === "video" && <video controls src={attachment.previewUrl} className="h-20 min-w-0 flex-1 rounded-xl" />}
                  {attachment.kind === "image" && <span className="min-w-0 flex-1 truncate text-sm text-foreground">{attachment.name}</span>}
                  <Button type="button" size="sm" variant="ghost" aria-label={`Remove ${attachment.name}`} onClick={() => set({ attachments: value.attachments.filter((a) => a.id !== attachment.id) })}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function FilePick({ kind, accept, capture, label, icon: Icon, busy, onPick }: { kind: string; accept: string; capture?: "environment" | "user"; label: string; icon: typeof Camera; busy: boolean; onPick: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        capture={capture}
        className="sr-only"
        aria-label={`Add a ${kind}`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />} {busy ? "Uploading…" : label}
      </Button>
    </>
  );
}

/** Records a voice note in the browser (MediaRecorder); up to three minutes. */
function VoiceRecorder({ busy, onRecorded }: { busy: boolean; onRecorded: (blob: Blob) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
    recorder.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  async function start() {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) return setError("Voice recording is not supported in this browser.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((type) => MediaRecorder.isTypeSupported(type));
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timer.current) clearInterval(timer.current);
        setRecording(false);
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        if (blob.size) onRecorded(blob);
      };
      recorder.current = rec;
      rec.start();
      setSeconds(0);
      setRecording(true);
      timer.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= 180) rec.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access was not allowed.");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {recording ? (
        <Button type="button" variant="destructive" onClick={() => recorder.current?.stop()}>
          <Square className="size-4" aria-hidden="true" /> Stop ({Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")})
        </Button>
      ) : (
        <Button type="button" variant="outline" disabled={busy} onClick={start}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />} {busy ? "Uploading…" : "Voice note"}
        </Button>
      )}
      {recording && <span className={cn("size-2.5 animate-pulse rounded-full bg-danger")} aria-label="Recording" />}
      {error && <span className="text-xs text-danger">{error}</span>}
    </span>
  );
}
