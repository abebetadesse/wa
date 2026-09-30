import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, Compass, HeartHandshake, Leaf, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/auth";
import { ETHIOPIAN_MEDICINAL_PLANTS } from "@/lib/knowledge/ethiopianMedicinalPlants";
import { ETHIOPIAN_MONTHS_GEez, toEthiopianDate } from "@/lib/profiling/astrology/ethiopianTraditions";
import { directoryFacets } from "@/server/marketplace/businesses";
import { exploreFor } from "@/server/toolkit";
import { listSubstances, substanceDetail } from "@/server/safety";
import { CONDITION_LABELS, PROPERTIES, type Condition } from "@/server/safety/rules";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Heritage & ritual memory | Ethiopian Wisdom",
  description: "A living map of Ethiopian healing traditions: care pathways, practice knowledge, seasonal rhythm and the healers who keep them.",
};

/** Ethiopian seasons by month (Meskerem = 1): Kiremt main rains, Bega dry season, Belg short rains. */
function seasonFor(month: number) {
  if (month >= 2 && month <= 5) return { name: "Bega", nameAm: "በጋ", note: "The dry season: harvest, drying and storing of seeds, roots and bark." };
  if (month >= 6 && month <= 9) return { name: "Belg", nameAm: "በልግ", note: "The short rains: new growth; many leaves are gathered fresh." };
  return { name: "Kiremt", nameAm: "ክረምት", note: "The main rains: damp and cold in the highlands; steam, fumigation and warming remedies are common." };
}

const GROUP_ICONS = { evidence: ShieldCheck, practice: BookOpenText, support: HeartHandshake } as const;

async function load() {
  const viewer = await getAuthenticatedUser().catch(() => null);
  const [explore, facets, reference] = await Promise.all([
    exploreFor(viewer).catch(() => null),
    directoryFacets(viewer).catch(() => null),
    listSubstances().catch(() => null),
  ]);
  // A different traditional remedy each day, drawn from the safety reference.
  const traditional = reference?.substances.filter((s) => s.kind === "traditional" && !s.properties.includes("toxic_internal")) ?? [];
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const spotlight = traditional.length ? await substanceDetail(traditional[dayIndex % traditional.length].slug).catch(() => null) : null;
  return { explore, facets, reference, spotlight };
}

export default async function HeritagePage() {
  const { explore, facets, reference, spotlight } = await load();
  const today = toEthiopianDate(new Date());
  const season = seasonFor(today.month);
  const pathways = explore?.groups.find((g) => g.group === "care_pathway")?.tools ?? [];
  const pillars = explore?.groups.filter((g) => g.group === "evidence" || g.group === "practice" || g.group === "support") ?? [];
  const traditions = facets?.categories.filter((c) => c.sector === "healing") ?? [];
  const healers = traditions.reduce((sum, c) => sum + c.count, 0);

  const stats = [
    { value: ETHIOPIAN_MEDICINAL_PLANTS.length, label: "medicinal plants documented" },
    { value: reference?.counts.traditional ?? 0, label: "remedies, foods & drinks in the safety matrix" },
    { value: reference?.counts.modern ?? 0, label: "modern medicines cross-checked" },
    { value: healers, label: "verified healers" },
  ];

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 lg:py-14">
      {/* Hero */}
      <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <Badge tone="gold" className="mb-4"><Sparkles className="size-3.5" aria-hidden="true" /> Heritage & ritual memory</Badge>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Where healing traditions, seasons and everyday wisdom meet.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A living map of Ethiopian care: the pathways people walk with their healers, the knowledge healers draw on, and the rhythm of the year that shapes both.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/marketplace" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-brand-strong">Find a healer <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/safety" className="inline-flex h-11 items-center gap-2 rounded-full border border-input px-5 text-sm font-semibold text-foreground hover:bg-accent">Check remedies with medicines</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 via-card to-brand/10 p-6 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold"><CalendarDays className="size-4" aria-hidden="true" /> Today</p>
          <p lang="am" className="mt-2 font-geez text-3xl font-bold text-foreground">{ETHIOPIAN_MONTHS_GEez[today.month - 1]} {today.day}, {today.year}</p>
          <p className="text-sm text-muted-foreground">{today.monthName} {today.day}, {today.year} (Ethiopian calendar)</p>
          <div className="mt-5 rounded-2xl bg-card/80 p-4">
            <p className="flex items-center gap-2 font-semibold text-foreground"><Sprout className="size-4 text-success" aria-hidden="true" /> {season.name} <span lang="am" className="font-geez text-muted-foreground">{season.nameAm}</span></p>
            <p className="mt-1 text-sm text-muted-foreground">{season.note}</p>
          </div>
          <Link href="/fasting" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">Fasting & lunar rhythm <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </section>

      {/* Live figures */}
      <section aria-label="The living knowledge base" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-border bg-card p-5">
            <p className="font-display text-3xl font-extrabold tabular-nums text-foreground">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Care pathways */}
      {pathways.length > 0 && (
        <section aria-labelledby="pathways-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Care pathways</p>
              <h2 id="pathways-heading" className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Walk a pathway with a healer</h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">Each pathway gathers your situation in your own words; a practitioner reviews it and writes you a reflection.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway, index) => (
              <Link key={pathway.key} href={pathway.href} className="group flex flex-col rounded-3xl border border-border bg-card p-5 transition-colors hover:border-brand/40">
                <span className="text-xs font-bold text-gold">Pathway {index + 1}</span>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground group-hover:text-brand">{pathway.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{pathway.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">Begin <ArrowRight className="size-4" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Knowledge pillars */}
      {pillars.length > 0 && (
        <section aria-labelledby="pillars-heading">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Knowledge pillars</p>
          <h2 id="pillars-heading" className="mb-5 font-display text-2xl font-extrabold text-foreground sm:text-3xl">What healers draw on</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {pillars.map((group) => {
              const Icon = GROUP_ICONS[group.group as keyof typeof GROUP_ICONS] ?? Compass;
              return (
                <div key={group.group} className="rounded-3xl border border-border bg-card p-5">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground"><Icon className="size-5 text-brand" aria-hidden="true" /> {group.label}</h3>
                  <ul className="mt-3 flex flex-col gap-2">
                    {group.tools.map((tool) => (
                      <li key={tool.key}>
                        <Link href={tool.href} className="group block rounded-2xl px-3 py-2 hover:bg-accent">
                          <span className="block font-semibold text-foreground group-hover:text-brand">{tool.name}</span>
                          <span className="block text-xs text-muted-foreground">{tool.description}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Remedy of the day */}
        {spotlight && (
          <section aria-labelledby="spotlight-heading" className="rounded-3xl border border-success/30 bg-gradient-to-br from-success/10 via-card to-card p-6">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-success"><Leaf className="size-4" aria-hidden="true" /> Remedy of the day</p>
            <h2 id="spotlight-heading" className="mt-2 font-display text-2xl font-extrabold text-foreground">{spotlight.name}</h2>
            <p className="text-sm text-muted-foreground">
              {spotlight.amharicName && <span lang="am" className="font-geez">{spotlight.amharicName} · </span>}
              <span className="italic">{spotlight.scientificName}</span>
            </p>
            {spotlight.notes && <p className="mt-3 text-foreground">{spotlight.notes}</p>}
            {spotlight.properties.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {spotlight.properties.map((p) => <Badge key={p} tone="neutral">{(PROPERTIES as Record<string, string>)[p] ?? p}</Badge>)}
              </div>
            )}
            {Object.keys(spotlight.cautions).length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Take care: {(Object.entries(spotlight.cautions) as [Condition, { level: string }][]).map(([c, v]) => `${CONDITION_LABELS[c]} (${v.level})`).join(", ")}.
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {spotlight.interactions.length ? `${spotlight.interactions.length} known or predicted interactions with medicines and other remedies.` : "No interactions recorded in the reference."}
            </p>
            <Link href={`/safety?items=${spotlight.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">Check it against medicines <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </section>
        )}

        {/* Healing traditions */}
        {traditions.length > 0 && (
          <section aria-labelledby="traditions-heading" className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Living traditions</p>
            <h2 id="traditions-heading" className="mt-1 font-display text-2xl font-extrabold text-foreground">Healers keeping them alive</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {traditions.map((category) => (
                <li key={category.slug}>
                  <Link href={`/marketplace?category=${category.slug}`} className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm hover:bg-accent">
                    <span>
                      <span className="block font-semibold text-foreground">{category.name}</span>
                      {category.nameAm && <span lang="am" className="font-geez text-xs text-muted-foreground">{category.nameAm}</span>}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{category.count > 0 ? `${category.count} verified` : "Be the first"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section className="flex flex-wrap items-center gap-4 rounded-3xl border border-brand/30 bg-brand/5 p-6">
        <ShieldCheck className="size-8 shrink-0 text-brand" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-foreground">Tradition honoured, safety kept clear</h2>
          <p className="text-sm text-muted-foreground">Traditional practice is shown in its own context, and every remedy can be checked against modern medicines before it is prepared.</p>
        </div>
        <Link href="/safety" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">Open the safety matrix <ArrowRight className="size-4" aria-hidden="true" /></Link>
      </section>
    </main>
  );
}
