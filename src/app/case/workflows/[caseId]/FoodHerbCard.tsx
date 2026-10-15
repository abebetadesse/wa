"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Leaf, Trash2, Utensils } from "lucide-react";
import type { OwnerView } from "@/server/cases/views";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ChoiceGroup, Field, Input, Textarea } from "@/components/ui";

type Kind = "meal" | "herb";
interface Candidate {
  id: string;
  name: string;
  nameAmharic: string;
  detail: string;
  score: number;
}
interface Identified {
  kind: Kind;
  status: "recognised" | "person" | "unclear" | "typed";
  recognised: string[];
  candidates: Candidate[];
}

const MAX_SIDE = 1024;

/**
 * Redraws the photo at most 1024 px wide or high as a fresh JPEG. Only the pixels survive: the
 * camera's metadata (location, device, time) is left behind, and the upload is small.
 */
async function preparePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("The photo could not be prepared. Try another photo.");
    return blob;
  } finally {
    bitmap.close();
  }
}

const KIND_OPTIONS = [
  { value: "meal", label: "A meal or food", hint: "What you eat or drink" },
  { value: "herb", label: "A herb or plant", hint: "A remedy, spice, root or leaf you use" },
];

export function FoodHerbCard({ view, onChange }: { view: OwnerView; onChange: (view: OwnerView) => void }) {
  const { notes, open, photo: photoAvailable } = view.foodHerb;
  const [kind, setKind] = useState<Kind>("meal");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [names, setNames] = useState("");
  const [result, setResult] = useState<Identified | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // The preview lives only in this tab and is released as soon as it is replaced or the card closes.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function clearPhoto() {
    setPhoto(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function reset() {
    clearPhoto();
    setNames("");
    setResult(null);
    setChosen(new Set());
    setNote("");
  }

  async function onPhoto(file: File | undefined) {
    setError(null);
    setResult(null);
    if (!file) return clearPhoto();
    try {
      const prepared = await preparePhoto(file);
      setPhoto(prepared);
      setPreview(URL.createObjectURL(prepared));
    } catch (err) {
      clearPhoto();
      setError(errorMessage(err));
    }
  }

  async function identify(event: FormEvent) {
    event.preventDefault();
    if (photo && !consent) return setError("Agree to the photo terms first.");
    if (!photo && !names.trim()) return setError("Add a photo or type at least one name.");
    setBusy(true);
    setError(null);
    try {
      let identified: Identified;
      if (photo) {
        const form = new FormData();
        form.set("kind", kind);
        form.set("consent", "yes");
        form.set("photo", new File([photo], "photo.jpg", { type: "image/jpeg" }));
        identified = await apiFetch<Identified>(`/api/case-workflows/cases/${view.id}/food-herb/identify`, { method: "POST", body: form });
      } else {
        identified = await apiFetch<Identified>(`/api/case-workflows/cases/${view.id}/food-herb/identify`, { method: "POST", json: { kind, names: names.trim() } });
      }
      // The photo has served its purpose: it is dropped from this page as well.
      clearPhoto();
      setResult(identified);
      setChosen(new Set(identified.candidates.filter((candidate) => candidate.score >= 90).map((candidate) => candidate.id)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!result || !chosen.size) return setError("Choose at least one food or plant.");
    setBusy(true);
    setError(null);
    try {
      onChange(await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}/food-herb`, {
        method: "POST",
        json: { kind: result.kind, itemIds: [...chosen], source: result.status === "typed" ? "typed" : "photo", note: note.trim() || undefined },
      }));
      reset();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(noteId: string) {
    setBusy(true);
    setError(null);
    try {
      onChange(await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}/food-herb/${noteId}`, { method: "DELETE" }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!open && !notes.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Utensils className="size-5 text-brand" aria-hidden="true" /> Foods and plants</CardTitle>
        <CardDescription>
          Show your reviewer what you eat or which herbs and remedies you use. Take a photo or type the names, then confirm what is right. Only the names you confirm are added to your case.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {notes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {notes.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    {entry.kind === "meal" ? <Utensils className="size-4" aria-hidden="true" /> : <Leaf className="size-4" aria-hidden="true" />}
                    <span>{entry.items.map((item) => item.name).join(" · ")}</span>
                  </span>
                  {entry.note && <span className="mt-0.5 block text-muted-foreground" translate="no">{entry.note}</span>}
                  <span className="mt-0.5 block text-xs text-muted-foreground">{entry.source === "photo" ? "From a photo (not kept)" : "Typed by you"} · {new Date(entry.at).toLocaleString()}</span>
                </span>
                {open && (
                  <Button variant="ghost" size="sm" disabled={busy} onClick={() => remove(entry.id)} aria-label="Remove">
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {open && !result && (
          <form onSubmit={identify} className="flex flex-col gap-4">
            <ChoiceGroup name="food-herb-kind" legend="What would you like to show?" options={KIND_OPTIONS} value={kind} onChange={(value) => setKind(value as Kind)} />
            {photoAvailable && (
              <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Camera className="size-4" aria-hidden="true" /> Photo</p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground">
                  <li>Photograph only the food or the plant. A photo that shows a person is refused and not analysed.</li>
                  <li>The photo is shrunk on your device, its location and camera details are removed, and it is sent once to the platform&apos;s recognition service to read the names.</li>
                  <li>It is never saved: not on our server, not in your case, not in any log. Only the names you confirm are kept.</li>
                </ul>
                <label className="flex items-start gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-4 accent-[var(--brand-accent)]" />
                  <span>I agree to my photo being used once in this way.</span>
                </label>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  disabled={!consent || busy}
                  onChange={(event) => onPhoto(event.target.files?.[0])}
                  className="text-sm file:mr-3 file:rounded-lg file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:text-sm disabled:opacity-50"
                />
                {preview && (
                  <div className="flex items-end gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- a local, in-memory preview */}
                    <img src={preview} alt="Your photo, shown only on this device" className="max-h-40 rounded-lg border border-border" />
                    <Button variant="ghost" size="sm" onClick={clearPhoto}>Remove photo</Button>
                  </div>
                )}
              </div>
            )}
            {!photo && (
              <Field label={photoAvailable ? "Or type the names" : "Type the names"} hint="Separate names with commas, for example: injera, shiro wot">
                {(control) => <Input {...control} value={names} onChange={(event) => setNames(event.target.value)} maxLength={400} />}
              </Field>
            )}
            {error && <Alert tone="danger" title="Not added">{error}</Alert>}
            <Button type="submit" disabled={busy} className="self-end">{busy ? "Looking…" : "Find matches"}</Button>
          </form>
        )}

        {open && result && (
          <div className="flex flex-col gap-4">
            {result.status === "person" && <Alert tone="warning" title="This photo shows a person">It was not analysed and has been discarded. Take a photo of only the food or the plant.</Alert>}
            {result.status === "unclear" && <Alert tone="warning" title="Nothing recognised">The photo has been discarded. Try a clearer photo in good light, or type the names.</Alert>}
            {result.recognised.length > 0 && result.status === "recognised" && (
              <p className="text-sm text-muted-foreground">Recognised in your photo, which has now been discarded: <span translate="no">{result.recognised.join(", ")}</span></p>
            )}
            {result.candidates.length > 0 ? (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-semibold text-foreground">Tick what is right</legend>
                {result.candidates.map((candidate) => (
                  <label key={candidate.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm">
                    <input type="checkbox" checked={chosen.has(candidate.id)} onChange={() => toggle(candidate.id)} className="mt-0.5 size-4 accent-[var(--brand-accent)]" />
                    <span className="flex flex-col">
                      <span className="font-medium text-foreground">{candidate.name}</span>
                      <span className="text-xs text-muted-foreground">{candidate.nameAmharic} · {candidate.detail}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            ) : (
              result.status !== "person" && <p className="text-sm text-muted-foreground">No match in our food and plant references. Try another spelling, or describe it to your reviewer in a message.</p>
            )}
            {result.candidates.length > 0 && (
              <Field label="Anything your reviewer should know (optional)" hint="For example: how often you eat it, or how you use the herb">
                {(control) => <Textarea {...control} value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={300} />}
              </Field>
            )}
            {error && <Alert tone="danger" title="Not added">{error}</Alert>}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" disabled={busy} onClick={reset}>Start again</Button>
              {result.candidates.length > 0 && <Button disabled={busy || !chosen.size} onClick={confirm}>{busy ? "Adding…" : "Add to my case"}</Button>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
