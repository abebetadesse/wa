"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, RefreshCw, Sparkles } from "lucide-react";
import type { AlignmentReading, Core } from "@/lib/hexacore/HexacoreEngine";
import { withBasePath } from "@/lib/base-path";

type TimelineEntry = {
  recordedAt: string;
  frequencies: Record<Core, number>;
  dominantCore: Core;
  source: string;
};

type LoadState = "loading" | "ready" | "unauthenticated" | "error";

const CORE_NAMES: Record<Core, string> = {
  P: "Power",
  H: "Humanity",
  C: "Creation",
  E: "Peace",
  S: "Spirit",
  O: "Order",
};

async function readApi<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(withBasePath(url), { signal, headers: { Accept: "application/json" } });
  const payload = await response.json() as { success?: boolean; data?: T; error?: string };
  if (!response.ok || payload.success !== true || payload.data === undefined) {
    const error = new Error(payload.error || `Request failed (${response.status}).`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return payload.data;
}

function isCore(value: unknown): value is Core {
  return typeof value === "string" && value in CORE_NAMES;
}

export default function HexacoreLiveAlignment() {
  const [state, setState] = useState<LoadState>("loading");
  const [reading, setReading] = useState<AlignmentReading | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAlignment = useCallback(async (signal: AbortSignal) => {
    setState("loading");
    setErrorMessage("");
    try {
      const liveReading = await readApi<AlignmentReading>("/api/hexacore/reading", signal);
      setReading(liveReading);
      try {
        const history = await readApi<TimelineEntry[]>("/api/hexacore/timeline", signal);
        setTimeline(history.filter((entry) => isCore(entry.dominantCore)).slice(0, 7).reverse());
      } catch (error) {
        if (signal.aborted) return;
        console.error("Hexacore timeline load failed:", error);
        setTimeline([]);
        setErrorMessage("Your current reflection loaded, but its history is temporarily unavailable.");
      }
      setState("ready");
    } catch (error) {
      if (signal.aborted) return;
      const status = typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;
      if (status === 401) {
        setState("unauthenticated");
        return;
      }
      console.error("Hexacore alignment load failed:", error);
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to load your live reflection.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadAlignment(controller.signal);
    return () => controller.abort();
  }, [loadAlignment, refreshKey]);

  useEffect(() => {
    const refreshAfterJournalSave = () => setRefreshKey((key) => key + 1);
    window.addEventListener("hexacore:journal-saved", refreshAfterJournalSave);
    return () => window.removeEventListener("hexacore:journal-saved", refreshAfterJournalSave);
  }, []);

  return (
    <section aria-labelledby="hexacore-live-heading" className="space-y-5 rounded-3xl border border-info/20 bg-info-soft p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-info">
            <Activity className="size-4" aria-hidden="true" />
            Personal alignment
          </div>
          <h2 id="hexacore-live-heading" className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
            Your changing Hexacore reflection
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-soft">
            Season, day, life stage, saved reflections, and your account&apos;s optional core settings shape this symbolic reading.
          </p>
        </div>
        {state !== "unauthenticated" && (
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={state === "loading"}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-foreground/5 px-3 py-2 text-xs font-semibold text-soft transition hover:bg-foreground/10 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${state === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        )}
      </header>

      {state === "loading" && (
        <div role="status" className="rounded-2xl border border-border bg-sunken/50 p-5 text-sm text-soft">
          <span className="animate-pulse">Loading your current reflection and recent core history…</span>
        </div>
      )}

      {state === "unauthenticated" && (
        <div className="rounded-2xl border border-gold/20 bg-gold/[0.06] p-5">
          <p className="text-sm font-semibold text-gold-strong">Sign in to see an account-based Hexacore reflection.</p>
          <p className="mt-1 text-xs leading-relaxed text-soft">
            The six-core Orrery, cultural references, and local journal remain available without an account.
          </p>
          <Link
            href="/auth/login?next=%2Fhexacore"
            className="mt-3 inline-flex rounded-lg bg-gold-fill px-3 py-2 text-xs font-bold text-gold-foreground hover:bg-gold-fill"
          >
            Sign in
          </Link>
        </div>
      )}

      {state === "error" && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/10 p-5">
          <p className="text-sm font-semibold text-danger-strong">Could not load your live Hexacore reflection.</p>
          <p className="mt-1 text-xs text-soft">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-3 rounded-lg border border-danger/30 px-3 py-2 text-xs font-semibold text-danger-strong hover:bg-danger/10"
          >
            Try again
          </button>
        </div>
      )}

      {reading && state === "ready" && (
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Current season", value: reading.temporal.season, detail: reading.temporal.seasonGuidance },
                { label: "Today", value: reading.temporal.dayOfWeek, detail: `${CORE_NAMES[reading.temporal.dayOfWeekCore]} reflection` },
                { label: "Life stage", value: reading.temporal.lifeStage === "unknown" ? "Not set" : reading.temporal.lifeStage, detail: `${CORE_NAMES[reading.temporal.lifeStageCore]} lens` },
              ].map((item) => (
                <article key={item.label} className="rounded-2xl border border-border bg-sunken/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">{item.label}</p>
                  <p className="mt-1 text-lg font-bold capitalize text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-info/20 bg-info/[0.06] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-info-strong">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Your current reflection
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{reading.journalPrompt.prompt}</p>
              <p className="mt-1 text-xs text-info-strong">{reading.journalPrompt.affirmation}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-soft">Core balance · symbolic scores</h3>
              {(Object.entries(reading.frequencies) as [Core, number][])
                .sort(([, left], [, right]) => right - left)
                .map(([core, score]) => (
                  <div key={core} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3">
                    <span className="text-xs text-soft">{CORE_NAMES[core]}</span>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-foreground/10"
                      role="meter"
                      aria-label={`${CORE_NAMES[core]} symbolic score`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={score}
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-info to-plum transition-[width]" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-right font-mono text-xs text-info-strong">{score}</span>
                  </div>
                ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {reading.todaysPractices.map((practice) => (
                <article key={practice.practiceId} className="rounded-2xl border border-border bg-sunken/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-foreground">{practice.name}</h3>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{practice.durationMin} min</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-soft">{practice.instruction}</p>
                  {practice.soundHz && <p className="mt-2 font-mono text-[10px] text-info">{practice.soundHz} Hz · symbolic sound reference</p>}
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-3 rounded-2xl border border-border bg-sunken/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-soft">Recent alignment history</h3>
            {timeline.length ? (
              <ol className="space-y-2">
                {timeline.map((entry, index) => (
                  <li key={`${entry.recordedAt}-${index}`} className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{CORE_NAMES[entry.dominantCore]}</p>
                      <p className="text-[10px] text-subtle">{new Date(entry.recordedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] capitalize text-muted-foreground">{entry.source}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">A history entry will appear after the first successful reading.</p>
            )}
            {errorMessage && <p role="status" className="text-xs text-gold-strong">{errorMessage}</p>}
            {reading.notices.referralRequired && reading.notices.referralMessage && (
              <p role="status" className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs leading-relaxed text-gold-strong">
                {reading.notices.referralMessage}
              </p>
            )}
            <p className="border-t border-border pt-3 text-[10px] leading-relaxed text-subtle">
              Scores are generated by a symbolic cultural framework and are not measures of health, personality, or scientific evidence.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
