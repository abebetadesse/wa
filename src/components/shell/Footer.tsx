"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Mail, ArrowRight, Check } from "lucide-react";
import { ETHIOPIAN_PROFILED_LOCATION_COUNT } from "@/lib/location/regions";
import { KNOWLEDGE_STRANDS } from "@/lib/knowledge/catalog";
import { useExplore } from "@/features/toolkit/useExplore";
import { useLanguage } from "@/lib/i18n/context";
import { withBasePath } from '@/lib/base-path';

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [foodCount, setFoodCount] = useState<number | null>(null);
  const explore = useExplore();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath("/api/nutrition/overview"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.success) setFoodCount(data.foodCount ?? null);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="site-footer relative mt-24 pb-12 text-sm text-inverse-muted print:hidden">
      <div className="tibeb-band" aria-hidden="true" />
      <div className="app-container pt-14">
        {/* Newsletter strip */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-inverse-muted/20 bg-inverse-foreground/5 p-6 md:flex-row md:p-8">
          <div className="max-w-xl">
            <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-fill">
              <Sparkles size={13} aria-hidden="true" />
              {t.footer.dispatchLabel}
            </div>
            <h3 className="font-display text-lg font-semibold text-inverse-foreground md:text-xl">
              {t.footer.dispatchTitle}
            </h3>
            <p className="mt-1 text-xs text-inverse-muted">
              {t.footer.dispatchBody}
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.emailPlaceholder}
                aria-label={t.footer.emailPlaceholder}
                className="w-full rounded-xl border border-inverse-muted/30 bg-inverse-strong px-4 py-2.5 pl-10 text-xs text-inverse-foreground outline-none transition placeholder:text-inverse-muted/70 focus:border-gold-fill focus:ring-1 focus:ring-gold-fill"
              />
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inverse-muted" aria-hidden="true" />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gold-fill px-4 py-2.5 text-xs font-bold text-gold-foreground transition hover:bg-gold-fill/85"
            >
              {subscribed ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  <span>{t.footer.subscribed}</span>
                </>
              ) : (
                <>
                  <span>{t.footer.joinDispatch}</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Four columns */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <span className="font-display text-lg font-semibold text-inverse-foreground">
              {t.footer.platformLabel}
            </span>
            <span className="block w-fit rounded-full border border-gold-fill/40 bg-gold-fill/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold-fill">
              {t.footer.platformTagline}
            </span>
            <p className="text-xs leading-relaxed text-inverse-muted">
              {t.footer.platformDescription}
            </p>
            <div className="flex flex-col gap-1 text-xs font-medium">
              <span className="text-brand-inverse">{t.footer.domainAStrong}</span>
              <span className="text-gold-fill">{t.footer.domainBStrong}</span>
            </div>
          </div>

          {/* Care pathways and evidence repositories, managed in Admin → Healer toolkit. */}
          {(["care_pathway", "evidence"] as const).map((groupKey) => {
            const group = explore?.groups.find((entry) => entry.group === groupKey);
            if (!group) return null;
            const accent = groupKey === "care_pathway" ? "bg-gold-fill" : "bg-brand-inverse";
            return (
              <div key={groupKey}>
                <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-inverse-foreground">{group.label}</h4>
                <ul className="space-y-2.5 text-xs">
                  {group.tools.slice(0, 7).map((tool) => (
                    <li key={tool.key}>
                      <Link href={tool.href} title={tool.description} className="group inline-flex items-center gap-2 text-inverse-muted transition-colors hover:text-inverse-foreground">
                        <span className={`h-1.5 w-1.5 rounded-full opacity-70 transition-opacity group-hover:opacity-100 ${accent}`} aria-hidden="true" />
                        <span>{tool.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="space-y-3">
            <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-inverse-foreground">
              {t.footer.verification}
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: foodCount ?? "–", label: t.footer.foods },
                { value: ETHIOPIAN_PROFILED_LOCATION_COUNT, label: t.footer.districts },
                { value: KNOWLEDGE_STRANDS.length, label: t.footer.strands },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-inverse-muted/20 bg-inverse-foreground/5 p-3 text-center">
                  <div className="font-display text-lg font-semibold text-gold-fill">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wide text-inverse-muted">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-brand-inverse">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>{t.footer.verificationStatus}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer and copyright */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-inverse-muted/15 pt-8 text-xs text-inverse-muted lg:flex-row">
          <p>
            &copy; {currentYear} {t.nav.brand}. {t.footer.rights}
          </p>
          <div className="max-w-xl rounded-xl border border-inverse-muted/20 p-3 text-[11px] leading-relaxed text-inverse-muted">
            <strong className="text-inverse-foreground">{t.footer.legalNoticeTitle}</strong> {t.footer.legalNoticeBody}
          </div>
        </div>
      </div>
    </footer>
  );
}
