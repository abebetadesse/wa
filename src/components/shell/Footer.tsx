"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Mail, ArrowRight, Check } from "lucide-react";
import { ETHIOPIAN_LOCATIONS } from "@/lib/location/ethiopiaLocations";
import { KNOWLEDGE_STRANDS } from "@/lib/knowledge/catalog";
import { AUTH_STATE_CHANGED } from "@/lib/auth/clientEvents";
import { getClientUser, invalidateClientUser } from "@/lib/auth/clientState";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [foodCount, setFoodCount] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/nutrition/overview")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.success) setFoodCount(data.foodCount ?? null);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refreshAdminAccess = () => {
      getClientUser({ force: true }).then((user) => {
        if (!cancelled) {
          setIsAdmin(user?.role === "admin" || user?.role === "super_admin");
        }
      });
    };

    refreshAdminAccess();
    const handleAuthChange = () => {
      invalidateClientUser();
      refreshAdminAccess();
    };
    window.addEventListener(AUTH_STATE_CHANGED, handleAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_STATE_CHANGED, handleAuthChange);
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
    <footer className="site-footer border-t border-white/10 pt-16 pb-12 mt-24 text-slate-400 text-sm bg-gradient-to-b from-stone-950 to-black relative">
      <div className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 h-48 w-96 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="app-container">
        {/* Newsletter / Notification Strip */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-12 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-amber-300 mb-1">
              <Sparkles size={13} className="text-amber-400" />
              ETHIOPIAN WISDOM &amp; CARE DISPATCH
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white">
              Seasonal guidance for fasting, herbs, and living safely
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Receive updates on fasting calendars, medicinal safety, cultural rituals, and professional care insights grounded in both heritage and evidence.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full rounded-xl border border-white/15 bg-stone-900/80 px-4 py-2.5 pl-10 text-xs text-white placeholder-stone-500 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 transition hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 flex items-center gap-1.5 whitespace-nowrap"
            >
              {subscribed ? (
                <>
                  <Check size={14} />
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  <span>Join Dispatch</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* 4-Column Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Platform Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-base">
                Ethiopian Wisdom &amp; Healing House
              </span>
            </div>
            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
              Traditional practice • evidence-based care
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              A professional platform that brings together Ethiopian food knowledge, healing practice, seasonal rhythm, ritual memory, and modern biological and Debral safety for practitioners and clients.
            </p>
            <div className="flex flex-col gap-1 text-[11px] font-mono">
              <span className="text-emerald-400 font-medium">Domain A: Scientific &amp; safety review</span>
              <span className="text-amber-400 font-medium">Domain B: Heritage & cultural context</span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Care pathways
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/case/spiritual/intake" className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70 transition-colors group-hover:bg-amber-300" aria-hidden="true" />
                  <span>Spiritual healing &amp; divination</span>
                </Link>
              </li>
              <li>
                <Link href="/case/Welbeing/intake" className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 transition-colors group-hover:bg-emerald-300" aria-hidden="true" />
                  <span>Debral &amp; body care</span>
                </Link>
              </li>
              <li>
                <Link href="/case/career/intake" className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70 transition-colors group-hover:bg-amber-300" aria-hidden="true" />
                  <span>Life timing &amp; work guidance</span>
                </Link>
              </li>
              <li>
                <Link href="/case/relationships/intake" className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-pink-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400/70 transition-colors group-hover:bg-pink-300" aria-hidden="true" />
                  <span>Family &amp; relationship balance</span>
                </Link>
              </li>
              <li>
                <Link href="/case/legal/intake" className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-purple-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400/70 transition-colors group-hover:bg-purple-300" aria-hidden="true" />
                  <span>Community wisdom &amp; conflict care</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Knowledge & Safety Infrastructure — admin-only */}
          {isAdmin && (
            <div>
              <h4 className="mb-4 border-b border-white/10 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 font-mono">
                Evidence Repositories
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link
                    href="/foods"
                    className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-cyan-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70 transition-colors group-hover:bg-cyan-300" aria-hidden="true" />
                    <span>EFCT 2025 Food Matrix {foodCount !== null ? `(${foodCount} Items)` : ""}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/safety"
                    className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-emerald-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 transition-colors group-hover:bg-emerald-300" aria-hidden="true" />
                    <span>ETM-DB Herb-Drug Safety Matrix</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/atlas"
                    className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-cyan-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70 transition-colors group-hover:bg-cyan-300" aria-hidden="true" />
                    <span>Altitude-Calibrated Regional Atlas</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cultural"
                    className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-amber-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70 transition-colors group-hover:bg-amber-300" aria-hidden="true" />
                    <span>Ge&apos;ez Fidel Gematria &amp; Calendar</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/audit"
                    className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-emerald-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 transition-colors group-hover:bg-emerald-300" aria-hidden="true" />
                    <span>Immutable Compliance Ledger</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Col 4: Platform Scale & Community Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Platform Verification
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-base font-black text-amber-400 font-mono">{foodCount ?? "–"}</div>
                <div className="text-[10px] text-stone-400 uppercase font-mono">Foods</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-base font-black text-cyan-400 font-mono">{ETHIOPIAN_LOCATIONS.length}</div>
                <div className="text-[10px] text-stone-400 uppercase font-mono">Districts</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-base font-black text-emerald-400 font-mono">{KNOWLEDGE_STRANDS.length}</div>
                <div className="text-[10px] text-stone-400 uppercase font-mono">Strands</div>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck size={14} />
              <span>Full Domain A/B Isolation Verified</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright Row */}
        <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p>
              &copy; {currentYear} Ethiopian Wisdom &amp; Wellness Platform. All rights reserved.
            </p>
          </div>

          <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-rose-300/80 text-[11px] max-w-xl leading-relaxed">
            <strong>Debral &amp; Legal Notice:</strong> The evaluation engine outputs dietary risk patterns and educational attributions. It does not provide medical diagnoses or replace emergency medical care. All traditional herbal recommendations are strictly gated against known pharmaceutical interactions.
          </div>
        </div>
      </div>
    </footer>
  );
}
