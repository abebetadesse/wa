"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Landmark, Plus, Send, Smartphone, Trash2 } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, Input, Select, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useToast } from "@/features/feedback/Toaster";
import { MODE_LABELS } from "@/features/marketplace/shared";
import { BUSINESS_STATUS } from "@/features/workspace/labels";
import { cn } from "@/lib/utils";
import { EthiopianLocationInput } from "@/components/location/EthiopianLocationInput";

interface Category {
  id: string;
  name: string;
  sector: string;
}

export default function SettingsPage() {
  const { business, reload } = useWorkspace();
  const toast = useToast();
  const categories = useApi<{ categories: Category[] }>("/api/marketplace/catalogue");
  const [form, setForm] = useState({
    categoryId: business.categoryId,
    name: business.name,
    nameAm: business.nameAm ?? "",
    tagline: business.tagline ?? "",
    description: business.description ?? "",
    region: business.region ?? "",
    city: business.city ?? "",
    address: business.address ?? "",
    phone: business.phone ?? "",
    email: business.email ?? "",
    logoUrl: business.logoUrl ?? "",
    coverUrl: business.coverUrl ?? "",
  });
  const [modes, setModes] = useState<string[]>(business.deliveryModes);
  const [languages, setLanguages] = useState<string[]>(business.languages);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const optional = (value: string) => value.trim() || undefined;
      await apiFetch(`/api/workspace/businesses/${business.id}`, {
        method: "PUT",
        json: {
          categoryId: form.categoryId,
          name: form.name,
          nameAm: optional(form.nameAm),
          tagline: optional(form.tagline),
          description: optional(form.description),
          region: optional(form.region),
          city: optional(form.city),
          address: optional(form.address),
          phone: optional(form.phone),
          email: form.email.trim(),
          logoUrl: form.logoUrl.trim(),
          coverUrl: form.coverUrl.trim(),
          deliveryModes: modes,
          languages,
        },
      });
      toast({ tone: "success", title: "Business profile saved" });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Your public profile, verification and how clients pay you.</p>
      </header>

      <Verification />
      <PaymentAccounts />

      <Card>
        <CardHeader>
          <CardTitle>Public profile</CardTitle>
          <CardDescription>What clients see on your page and in the marketplace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" required>{(control) => <Input {...control} value={form.name} onChange={set("name")} />}</Field>
          <Field label="Name in Amharic">{(control) => <Input {...control} lang="am" className="font-geez" value={form.nameAm} onChange={set("nameAm")} />}</Field>
          <Field label="Category" required>
            {(control) => (
              <Select {...control} value={form.categoryId} onChange={set("categoryId")}>
                {categories.data?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            )}
          </Field>
          <Field label="One-line description">{(control) => <Input {...control} maxLength={240} value={form.tagline} onChange={set("tagline")} />}</Field>
          <Field label="About" className="sm:col-span-2">{(control) => <Textarea {...control} rows={5} value={form.description} onChange={set("description")} />}</Field>
          <EthiopianLocationInput
            label="Business location"
            value={form.city}
            regionValue={form.region}
            className="sm:col-span-2"
            placeholder="Search region, zone, district, or town..."
            onChange={(location, region, place) => setForm((current) => ({
              ...current,
              city: place ? `${place.town}, ${place.zone}` : location,
              region: place?.region ?? region,
            }))}
          />
          <Field label="Address" hint="Shown to clients with in-person bookings." className="sm:col-span-2">{(control) => <Input {...control} value={form.address} onChange={set("address")} />}</Field>
          <Field label="Phone">{(control) => <Input {...control} type="tel" value={form.phone} onChange={set("phone")} />}</Field>
          <Field label="Email">{(control) => <Input {...control} type="email" value={form.email} onChange={set("email")} />}</Field>
          <Field label="Logo image URL" hint="A square image works best.">{(control) => <Input {...control} type="url" value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://…" />}</Field>
          <Field label="Cover image URL">{(control) => <Input {...control} type="url" value={form.coverUrl} onChange={set("coverUrl")} placeholder="https://…" />}</Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">How you meet clients</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MODE_LABELS).map(([mode, meta]) => (
                <button key={mode} type="button" aria-pressed={modes.includes(mode)} onClick={() => setModes((list) => toggle(list, mode))} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", modes.includes(mode) ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground")}>
                  <meta.icon className="size-3.5" aria-hidden="true" /> {meta.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">Languages</legend>
            <div className="flex flex-wrap gap-2">
              {[["am", "Amharic"], ["om", "Afaan Oromoo"], ["ti", "Tigrinya"], ["so", "Somali"], ["en", "English"]].map(([code, label]) => (
                <button key={code} type="button" aria-pressed={languages.includes(code)} onClick={() => setLanguages((list) => toggle(list, code))} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", languages.includes(code) ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground")}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
          <div className="flex justify-end sm:col-span-2">
            <Button onClick={save} disabled={saving || form.name.trim().length < 2 || modes.length === 0}>{saving ? "Saving…" : "Save profile"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Verification() {
  const { business, reload } = useWorkspace();
  const toast = useToast();
  const [credentials, setCredentials] = useState(business.verification?.credentials ?? [{ label: "", issuer: "", reference: "" }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = BUSINESS_STATUS[business.status] ?? { label: business.status, tone: "neutral" as const };

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/verification`, {
        method: "POST",
        json: { credentials: credentials.filter((c) => c.label.trim()).map((c) => ({ label: c.label.trim(), issuer: c.issuer?.trim() || undefined, reference: c.reference?.trim() || undefined })) },
      });
      toast({ tone: "success", title: "Verification requested", body: "You'll be notified as soon as it's reviewed." });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card id="verification" className={cn(business.status === "verified" && "border-success/40")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BadgeCheck className="size-5 text-brand" aria-hidden="true" /> Verification <Badge tone={status.tone}>{status.label}</Badge></CardTitle>
        <CardDescription>
          {business.status === "verified"
            ? `Verified${business.verification?.reviewedAt ? ` on ${new Date(business.verification.reviewedAt).toLocaleDateString()}` : ""}. Your page is live in the marketplace.`
            : business.status === "pending_verification"
              ? "Our team is reviewing your details. You'll get a notification when it's done."
              : "Verified businesses appear in the marketplace and can take online bookings."}
        </CardDescription>
      </CardHeader>
      {(business.status === "draft" || business.status === "pending_verification") && (
        <CardContent className="flex flex-col gap-4">
          {business.verification?.notes && business.status === "draft" && <Alert tone="warning" title="Reviewer notes">{business.verification.notes}</Alert>}
          <p className="text-sm text-muted-foreground">List what shows your standing: training, licences, association membership or endorsement by community elders or clergy.</p>
          {credentials.map((credential, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-[2fr_1.5fr_1fr_auto] sm:items-end">
              <Field label="Credential" required>{(control) => <Input {...control} value={credential.label} onChange={(e) => setCredentials((list) => list.map((c, i) => (i === index ? { ...c, label: e.target.value } : c)))} placeholder="e.g. Trained under Memhir …" />}</Field>
              <Field label="Issued by">{(control) => <Input {...control} value={credential.issuer ?? ""} onChange={(e) => setCredentials((list) => list.map((c, i) => (i === index ? { ...c, issuer: e.target.value } : c)))} />}</Field>
              <Field label="Reference">{(control) => <Input {...control} value={credential.reference ?? ""} onChange={(e) => setCredentials((list) => list.map((c, i) => (i === index ? { ...c, reference: e.target.value } : c)))} />}</Field>
              <button type="button" onClick={() => setCredentials((list) => list.filter((_, i) => i !== index))} disabled={credentials.length === 1} className="mb-1 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-danger disabled:opacity-30" aria-label="Remove credential">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="self-start" onClick={() => setCredentials((list) => [...list, { label: "", issuer: "", reference: "" }])}><Plus className="size-4" aria-hidden="true" /> Add another</Button>
          {error && (
            <Alert tone="danger">
              {error}
              {/Telegram/.test(error) && <> <Link href="/account" className="font-semibold text-brand underline">Connect Telegram</Link></>}
            </Alert>
          )}
          <Button onClick={submit} disabled={busy || !credentials.some((c) => c.label.trim().length >= 2)} className="self-end">
            <Send className="size-4" aria-hidden="true" /> {business.status === "pending_verification" ? "Update request" : "Request verification"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

type Bank = { bank: string; accountName: string; accountNumber: string };

/** Where clients pay this business. Clients see these on their bookings and report their transaction numbers. */
function PaymentAccounts() {
  const { business, reload } = useWorkspace();
  const toast = useToast();
  const current = business.paymentAccounts ?? {};
  const [telebirrName, setTelebirrName] = useState(current.telebirr?.name ?? "");
  const [telebirrPhone, setTelebirrPhone] = useState(current.telebirr?.phone ?? "");
  const [banks, setBanks] = useState<Bank[]>(current.banks ?? []);
  const [acceptsCash, setAcceptsCash] = useState(current.acceptsCash ?? true);
  const [instructions, setInstructions] = useState(current.instructions ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBank = (index: number, key: keyof Bank, value: string) => setBanks((list) => list.map((bank, i) => (i === index ? { ...bank, [key]: value } : bank)));

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/workspace/businesses/${business.id}/payment-accounts`, {
        method: "PUT",
        json: {
          telebirr: telebirrPhone.trim() ? { name: telebirrName.trim() || business.name, phone: telebirrPhone.replace(/\s+/g, "") } : null,
          banks: banks.filter((bank) => bank.bank.trim() || bank.accountNumber.trim()).map((bank) => ({ ...bank, accountNumber: bank.accountNumber.trim() })),
          acceptsCash,
          instructions: instructions.trim() || undefined,
        },
      });
      toast({ tone: "success", title: "Payment details saved", body: "Clients now see them on their bookings." });
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card id="payments">
      <CardHeader>
        <CardTitle>How clients pay you</CardTitle>
        <CardDescription>Clients pay you directly by telebirr or bank transfer, then send you the transaction number. You confirm it under Payments. The platform never holds your money.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2">
          <p className="flex items-center gap-2 font-semibold text-foreground sm:col-span-2"><Smartphone className="size-4 text-brand" aria-hidden="true" /> telebirr</p>
          <Field label="telebirr number" hint="Leave empty if you don't take telebirr.">{(control) => <Input {...control} inputMode="tel" value={telebirrPhone} onChange={(e) => setTelebirrPhone(e.target.value)} placeholder="09…" />}</Field>
          <Field label="Name on the account">{(control) => <Input {...control} value={telebirrName} onChange={(e) => setTelebirrName(e.target.value)} />}</Field>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
          <p className="flex items-center gap-2 font-semibold text-foreground"><Landmark className="size-4 text-brand" aria-hidden="true" /> Bank accounts</p>
          {banks.map((bank, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1.2fr_1.2fr_1.2fr_auto] sm:items-end">
              <Field label="Bank">{(control) => <Input {...control} value={bank.bank} onChange={(e) => updateBank(index, "bank", e.target.value)} placeholder="e.g. Commercial Bank of Ethiopia" />}</Field>
              <Field label="Account name">{(control) => <Input {...control} value={bank.accountName} onChange={(e) => updateBank(index, "accountName", e.target.value)} />}</Field>
              <Field label="Account number">{(control) => <Input {...control} inputMode="numeric" value={bank.accountNumber} onChange={(e) => updateBank(index, "accountNumber", e.target.value)} />}</Field>
              <button type="button" onClick={() => setBanks((list) => list.filter((_, i) => i !== index))} className="mb-1 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-danger" aria-label="Remove bank account">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="self-start" onClick={() => setBanks((list) => [...list, { bank: "", accountName: business.name, accountNumber: "" }])} disabled={banks.length >= 6}>
            <Plus className="size-4" aria-hidden="true" /> Add bank account
          </Button>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={acceptsCash} onChange={(e) => setAcceptsCash(e.target.checked)} className="size-4 accent-[var(--brand-accent)]" />
          Clients can also pay in cash at the visit
        </label>
        <Field label="Payment note for clients (optional)" hint="e.g. “Please pay at least half before a home visit.”">
          {(control) => <Textarea {...control} rows={2} maxLength={500} value={instructions} onChange={(e) => setInstructions(e.target.value)} />}
        </Field>
        {error && <Alert tone="danger">{error}</Alert>}
        <Button onClick={save} disabled={busy} className="self-end">{busy ? "Saving…" : "Save payment details"}</Button>
      </CardContent>
    </Card>
  );
}
