"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Briefcase, Store } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Field, Input, LoadingState, PageHeader, PageShell, Select, Textarea } from "@/components/ui";
import { useSession } from "@/features/session/SessionProvider";
import { useApi } from "@/features/workspace/useApi";
import { MODE_LABELS, Monogram } from "@/features/marketplace/shared";
import { BUSINESS_STATUS } from "@/features/workspace/labels";
import { cn } from "@/lib/utils";
import { EthiopianLocationInput } from "@/components/location/EthiopianLocationInput";
import { useLanguage } from "@/lib/i18n/context";

interface MyBusiness {
  id: string;
  slug: string;
  name: string;
  status: string;
  logoUrl: string | null;
  role: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  nameAm: string | null;
  sector: string;
}

export default function BusinessHome() {
  const { t } = useLanguage();
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  const mine = useApi<MyBusiness[]>(user ? "/api/workspace/businesses" : null, { liveTypes: ["business.status"] });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !user) router.replace(`/auth?next=${encodeURIComponent("/business")}`);
  }, [sessionLoading, user, router]);

  if (sessionLoading || !user || (!mine.data && !mine.error)) return <PageShell><LoadingState /></PageShell>;
  if (mine.error) return <PageShell><ErrorState message={mine.error} onRetry={mine.reload} /></PageShell>;

  const businesses = mine.data ?? [];
  const showForm = creating || businesses.length === 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t.business.forHealers}
        title={businesses.length ? t.business.yourBusinesses : t.business.listYourBusiness}
        description={businesses.length ? t.business.openWorkspace : t.business.createListing}
        actions={businesses.length > 0 && !creating ? <Button onClick={() => setCreating(true)}>{t.business.addAnotherBusiness}</Button> : undefined}
      />

      {businesses.length > 0 && (
        <ul className="mb-10 grid gap-4 sm:grid-cols-2">
          {businesses.map((business) => {
            const status = BUSINESS_STATUS[business.status] ?? { label: business.status, tone: "neutral" as const };
            return (
              <li key={business.id}>
                <Link href={`/business/${business.id}`} className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-input hover:shadow-lg">
                  {business.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={business.logoUrl} alt="" className="size-14 rounded-2xl object-cover" />
                  ) : (
                    <Monogram name={business.name} className="size-14 text-xl" />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate font-display text-lg font-bold text-foreground">{business.name}</span>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {business.category} · <span className="capitalize">{business.role}</span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </span>
                  </span>
                  <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {showForm && <CreateBusinessForm onCancel={businesses.length ? () => setCreating(false) : undefined} />}
    </PageShell>
  );
}

function CreateBusinessForm({ onCancel }: { onCancel?: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const categories = useApi<{ categories: Category[] }>("/api/marketplace/catalogue");
  const [form, setForm] = useState({ categoryId: "", name: "", nameAm: "", tagline: "", region: "", city: "", phone: "", description: "" });
  const [modes, setModes] = useState<string[]>(["in_person"]);
  const [languages, setLanguages] = useState<string[]>(["am"]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await apiFetch<{ id: string }>("/api/workspace/businesses", {
        method: "POST",
        json: { ...form, nameAm: form.nameAm || undefined, tagline: form.tagline || undefined, region: form.region || undefined, city: form.city || undefined, phone: form.phone || undefined, description: form.description || undefined, deliveryModes: modes, languages },
      });
      router.push(`/business/${created.id}?welcome=1`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const grouped = (sector: string) => categories.data?.categories.filter((category) => category.sector === sector) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Store className="size-5 text-brand" aria-hidden="true" /> {t.business.createYourBusiness}</CardTitle>
        <CardDescription>{t.business.changeLater}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
          <Field label={t.business.businessName} required className="sm:col-span-2">
            {(control) => <Input {...control} value={form.name} onChange={set("name")} />}
          </Field>
          <Field label={t.business.nameInAmharic}>
            {(control) => <Input {...control} lang="am" className="font-geez" value={form.nameAm} onChange={set("nameAm")} />}
          </Field>
          <Field label={t.business.whatDoYouPractice} required>
            {(control) => (
              <Select {...control} value={form.categoryId} onChange={set("categoryId")}>
                <option value="">{t.business.chooseCategory}</option>
                {["healing", "cultural"].map((sector) => (
                  <optgroup key={sector} label={sector === "healing" ? t.business.healingTraditions : t.business.culturalServices}>
                    {grouped(sector).map((category) => (
                      <option key={category.id} value={category.id}>{category.name}{category.nameAm ? ` · ${category.nameAm}` : ""}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t.business.oneLineDescription} hint={t.business.oneLineDescriptionHint} className="sm:col-span-2">
            {(control) => <Input {...control} maxLength={240} value={form.tagline} onChange={set("tagline")} />}
          </Field>
          <EthiopianLocationInput
            label={t.business.businessLocation}
            value={form.city}
            regionValue={form.region}
            className="sm:col-span-2"
            placeholder={t.business.locationPlaceholder}
            onChange={(location, region, place) => setForm((current) => ({
              ...current,
              city: place ? `${place.town}, ${place.zone}` : location,
              region: place?.region ?? region,
            }))}
          />
          <Field label={t.business.businessPhone}>
            {(control) => <Input {...control} type="tel" value={form.phone} onChange={set("phone")} placeholder="+251 9…" />}
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-foreground">{t.business.languagesYouServe}</legend>
            <div className="flex flex-wrap gap-2">
              {[["am", "Amharic"], ["om", "Afaan Oromoo"], ["ti", "Tigrinya"], ["so", "Somali"], ["en", "English"]].map(([code, label]) => (
                <button key={code} type="button" aria-pressed={languages.includes(code)} onClick={() => setLanguages((list) => toggle(list, code))} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", languages.includes(code) ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground")}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2 sm:col-span-2">
            <legend className="mb-1 text-sm font-semibold text-foreground">{t.business.howMeetClients}</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MODE_LABELS).map(([mode, meta]) => (
                <button key={mode} type="button" aria-pressed={modes.includes(mode)} onClick={() => setModes((list) => toggle(list, mode))} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", modes.includes(mode) ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground")}>
                  <meta.icon className="size-3.5" aria-hidden="true" /> {meta.label}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label={t.business.aboutPractice} className="sm:col-span-2">
            {(control) => <Textarea {...control} rows={4} value={form.description} onChange={set("description")} placeholder={t.business.aboutPracticePlaceholder} />}
          </Field>
          {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
          <div className="flex justify-end gap-3 sm:col-span-2">
            {onCancel && <Button variant="ghost" onClick={onCancel}>{t.business.cancel}</Button>}
            <Button type="submit" size="lg" disabled={busy || !form.name.trim() || !form.categoryId || modes.length === 0}>
              <Briefcase className="size-4" aria-hidden="true" /> {busy ? t.business.creating : t.business.createBusiness}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
