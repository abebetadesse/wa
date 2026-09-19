"use client";

import type { CaseDefinition } from "@/lib/case-workflow/engine";
import type { Answers } from "./types";

interface CaseDomainSelectorProps {
  cases: CaseDefinition[];
  casesLoading: boolean;
  loading: boolean;
  onSelectDomain: (caseDefinition: CaseDefinition) => void;
  onRetry: () => void;
  aiPanel: React.ReactNode;
}

/**
 * Renders the "Choose Domain" phase of the case intake wizard.
 * Shows a hero card for the Spiritual case and a grid of other available case domains.
 * Delegates AI panel rendering to the parent via the `aiPanel` prop.
 */
export function CaseDomainSelector({
  cases,
  casesLoading,
  loading,
  onSelectDomain,
  onRetry,
  aiPanel,
}: CaseDomainSelectorProps) {
  if (casesLoading) {
    return (
      <p className="text-sm text-slate-400" role="status">
        Loading case domains...
      </p>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="glass-panel p-6 space-y-4">
        <p className="text-sm text-slate-300">
          No case domains are available right now.
        </p>
        <button type="button" onClick={onRetry} className="btn-secondary">
          Retry loading domains
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(620px,2fr)_minmax(280px,0.8fr)]">
      <div className="space-y-6">
        {/* CASE 1: SPIRITUAL & LIFE DIRECTION HERO BANNER */}
        <a
          href="/case/spiritual/intake/step-1"
          className="block p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-black border-2 border-amber-500/60 shadow-2xl hover:border-amber-400 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-l from-amber-500 to-amber-600 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg">
            ✨ Featured Case 1 · Dynamic Workflow
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🔮
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-amber-100 font-serif group-hover:text-amber-300 transition-colors">
                  Spiritual &amp; Life Direction (መንፈሳዊ አቅጣጫ)
                </h2>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed max-w-2xl">
                Full-functioning, real-time, adaptive divination workflow. Live
                Ge&apos;ez Fidel gematria calculation as you type, 16 Circles of
                Awde Negest, personalized talismanic lineages, AI follow-ups,
                and verified debtera review.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Live Gematria (የፊደል ሂሳብ)",
                  "Awde Negest (አውደ ነገሥት)",
                  "Verified Debtera Review",
                  "Custom Healing Scroll PDF",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end justify-center">
              <span className="px-5 py-2.5 rounded-2xl bg-amber-500 text-black font-bold text-xs group-hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                Begin Case 1 →
              </span>
            </div>
          </div>
        </a>

        <div className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold pt-2">
          Additional Case Domains
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectDomain(item)}
              disabled={loading}
              className="glass-panel p-6 text-left hover:border-emerald-400/60 transition-colors disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-950/20 group"
            >
              <span className="text-3xl text-amber-300 group-hover:scale-110 transition-transform inline-block">
                {item.icon}
              </span>
              <h2 className="text-xl font-bold text-white mt-4">{item.name}</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {item.interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="badge badge-safe normal-case tracking-normal"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="xl:pt-1">{aiPanel}</div>
    </div>
  );
}
