"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, HeartHandshake, Leaf, MessageCircle, Search, ShieldCheck, Sparkles, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/context";
import { BusinessCard } from "@/features/marketplace/shared";

type HomeData = {
  facets?: {
    categories?: Array<{ sector?: string; slug?: string; name?: string; nameAm?: string | null; count?: number }>;
    searchVisible?: boolean;
  };
  featured?: {
    total?: number;
    businesses?: any[];
  };
} | null;

export function HomePageContent({ data }: { data: HomeData }) {
  const { t } = useLanguage();

  const healing = data?.facets?.categories?.filter((category) => category.sector === "healing") ?? [];
  const cultural = data?.facets?.categories?.filter((category) => category.sector === "cultural") ?? [];
  const verifiedCount = data?.featured?.total ?? 0;

  return (
    <div className="relative overflow-hidden">
      <section className="relative isolate">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_10%_-10%,color-mix(in_srgb,var(--cultural-gold)_28%,transparent),transparent),radial-gradient(50rem_30rem_at_95%_10%,color-mix(in_srgb,var(--brand-accent)_25%,transparent),transparent)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(45deg,currentColor_1px,transparent_1px),linear-gradient(-45deg,currentColor_1px,transparent_1px)] [background-size:28px_28px] text-foreground" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24 lg:pt-20">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold">
              <Sparkles className="size-3.5" aria-hidden="true" /> {t.home.badge}
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              {t.home.headline}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{t.home.description}</p>

            {data?.facets?.searchVisible && (
              <>
                <form action="/marketplace" className="flex w-full max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-xl shadow-brand/5 focus-within:ring-2 focus-within:ring-ring">
                  <Search className="ml-3 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <label htmlFor="home-search" className="sr-only">{t.home.search}</label>
                  <input
                    id="home-search"
                    name="q"
                    placeholder={t.home.searchPlaceholder}
                    className="h-11 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button type="submit" className="h-11 shrink-0 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-brand-strong">
                    {t.home.search}
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <span>{t.home.popular}</span>
                  <Link href="/marketplace?q=herbal" className="rounded-full border border-border bg-card/80 px-2.5 py-0.5 font-medium text-foreground hover:border-brand hover:text-brand-strong">🌿 {t.home.herbal}</Link>
                  <Link href="/marketplace?q=Awde+Negest" className="rounded-full border border-border bg-card/80 px-2.5 py-0.5 font-medium text-foreground hover:border-brand hover:text-brand-strong">📜 {t.home.awdeNegest}</Link>
                  <Link href="/marketplace?q=bone+setting" className="rounded-full border border-border bg-card/80 px-2.5 py-0.5 font-medium text-foreground hover:border-brand hover:text-brand-strong">🦴 {t.home.boneSetting}</Link>
                  <Link href="/marketplace?q=ceremony" className="rounded-full border border-border bg-card/80 px-2.5 py-0.5 font-medium text-foreground hover:border-brand hover:text-brand-strong">☕ {t.home.ceremony}</Link>
                  <Link href="/marketplace?region=Addis+Ababa" className="rounded-full border border-border bg-card/80 px-2.5 py-0.5 font-medium text-foreground hover:border-brand hover:text-brand-strong">📍 {t.home.addis}</Link>
                </div>
              </>
            )}

            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4 text-brand" aria-hidden="true" /> {t.home.everyBusinessVerified}</li>
              <li className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-brand" aria-hidden="true" /> {t.home.verifiedHeritage}</li>
              <li className="inline-flex items-center gap-1.5"><CalendarCheck className="size-4 text-brand" aria-hidden="true" /> {t.home.liveAvailability}</li>
            </ul>
          </div>

          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-inverse to-brand-strong shadow-2xl" />
            <div className="absolute inset-4 rounded-[2rem] border border-gold/40" />
            <div className="relative flex h-full flex-col justify-between p-10 text-inverse-foreground">
              <p lang="am" className="font-geez text-7xl font-bold text-gold/90">ጥበብ</p>
              <div className="space-y-4">
                <p className="font-display text-3xl font-extrabold leading-tight">{t.home.knowledgeCarried}</p>
                <p className="text-sm text-inverse-foreground/75">
                  {verifiedCount > 0 ? `${verifiedCount} ${t.home.verifiedBusinesses}` : t.home.beFirstVerified}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {data && (healing.length > 0 || cultural.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{t.home.browseByTradition}</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {[
              { title: t.home.healingTraditions, icon: Leaf, items: healing, sector: "healing" },
              { title: t.home.culturalServices, icon: HeartHandshake, items: cultural, sector: "cultural" },
            ].filter((group) => group.items.length > 0).map((group) => (
              <div key={group.title} className="rounded-3xl border border-border bg-card/70 p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <group.icon className={group.sector === "cultural" ? "size-5 text-gold" : "size-5 text-brand"} aria-hidden="true" /> {group.title}
                </h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {group.items.map((category: any) => (
                    <li key={category.slug}>
                      <Link href={`/marketplace?category=${category.slug}`} className="flex items-center justify-between rounded-2xl border border-transparent bg-muted/60 px-4 py-3 text-sm transition-colors hover:border-input hover:bg-card">
                        <span className="flex flex-col">
                          <span className="font-semibold text-foreground">{category.name}</span>
                          {category.nameAm && <span lang="am" className="font-geez text-xs text-muted-foreground">{category.nameAm}</span>}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">{category.count > 0 ? category.count : ""}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured-heading" className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{t.home.highlyRatedNearYou}</h2>
          <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            {t.home.seeAll} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {data && data.featured?.businesses?.length ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.featured.businesses.map((business: any) => (
              <li key={business.id}>
                <BusinessCard business={business} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
            <Store className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-display text-lg font-bold text-foreground">
              {data ? t.home.firstBusinessesJoining : t.home.marketplaceUnavailable}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">{t.home.forHealersBody}</p>
            <ButtonLink href="/business" variant="gold">{t.home.listYourBusiness}</ButtonLink>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{t.home.howItWorks}</h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { icon: Search, title: t.home.findRightPerson, body: t.home.findRightPersonBody },
            { icon: CalendarCheck, title: t.home.bookRealTime, body: t.home.bookRealTimeBody },
            { icon: MessageCircle, title: t.home.stayInTouch, body: t.home.stayInTouchBody },
          ].map((step, index) => (
            <li key={step.title} className="relative rounded-3xl border border-border bg-card p-6">
              <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-muted-foreground/15">{index + 1}</span>
              <step.icon className="size-7 text-brand" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-inverse via-brand-strong to-inverse p-8 text-inverse-foreground shadow-2xl sm:p-12">
          <div aria-hidden="true" className="absolute -right-10 -top-10 size-64 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{t.home.forHealers}</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{t.home.forHealersTitle}</h2>
              <p className="mt-3 max-w-xl text-inverse-foreground/80">{t.home.forHealersBody}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <ButtonLink href="/business" variant="gold" size="lg">{t.home.startForFree}</ButtonLink>
              <ButtonLink href="/marketplace" size="lg" className="bg-inverse-foreground/10 text-inverse-foreground hover:bg-inverse-foreground/20">{t.home.browseMarketplace}</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
