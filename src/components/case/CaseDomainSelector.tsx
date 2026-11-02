"use client";

import Link from "next/link";
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
      <p className="text-sm text-muted-foreground" role="status">
        Loading case domains...
      </p>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="glass-panel p-6 space-y-4">
        <p className="text-sm text-soft">
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
        <Link
          href="/case/workflows/new/spiritual"
          className="block p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-gold-soft via-card to-background border-2 border-gold/60 shadow-raised hover:border-gold transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-l from-gold-fill to-gold-fill text-gold-foreground font-bold text-xs uppercase tracking-wider shadow-panel">
            ✨ Featured Case 1 · Dynamic Workflow
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🔮
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gold-strong font-serif group-hover:text-gold transition-colors">
                  Spiritual &amp; Life Direction (መንፈሳዊ አቅጣጫ)
                </h2>
              </div>
              <p className="text-sm text-soft leading-relaxed max-w-2xl">
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
                    className="px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-strong text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end justify-center">
              <span className="px-5 py-2.5 rounded-2xl bg-gold-fill text-gold-foreground font-bold text-xs group-hover:bg-gold-fill transition-colors shadow-panel">
                Begin Case 1 →
              </span>
            </div>
          </div>
        </Link>

        <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold pt-2">
          Additional Case Domains
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectDomain(item)}
              disabled={loading}
              className="glass-panel p-6 text-left hover:border-brand/60 transition-colors disabled:opacity-50 hover:shadow-panel group"
            >
              <span className="text-3xl text-gold group-hover:scale-110 transition-transform inline-block">
                {item.icon}
              </span>
              <h2 className="text-xl font-bold text-foreground mt-4">{item.name}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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
