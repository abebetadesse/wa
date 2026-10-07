"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, RefreshCw, Sparkles } from "lucide-react";
import type { AlignmentReading, Core } from "@/lib/hexacore/HexacoreEngine";

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
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
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
    <section aria-labelledby="hexacore-live-heading" className="space-y-5 rounded-3xl border border-indigo-400/20 bg-indigo-950/20 p-5 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            <Activity className="size-4" aria-hidden="true" />
            Personal alignment
          </div>
          <h2 id="hexacore-live-heading" className="mt-2 text-xl font-black text-white sm:text-2xl">
            Your changing Hexacore reflection
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
            Season, day, life stage, saved reflections, and your account&apos;s optional core settings shape this symbolic reading.
          </p>
        </div>
        {state !== "unauthenticated" && (
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={state === "loading"}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${state === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        )}
      </header>

      {state === "loading" && (
        <div role="status" className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
          <span className="animate-pulse">Loading your current reflection and recent core history…</span>
        </div>
      )}

      {state === "unauthenticated" && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-5">
          <p className="text-sm font-semibold text-amber-100">Sign in to see an account-based Hexacore reflection.</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            The six-core Orrery, cultural references, and local journal remain available without an account.
          </p>
          <Link
            href="/auth/login?next=%2Fhexacore"
            className="mt-3 inline-flex rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-black hover:bg-amber-300"
          >
            Sign in
          </Link>
        </div>
      )}

      {state === "error" && (
        <div role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5">
          <p className="text-sm font-semibold text-rose-200">Could not load your live Hexacore reflection.</p>
          <p className="mt-1 text-xs text-slate-300">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-3 rounded-lg border border-rose-300/30 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-300/10"
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
                <article key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-bold capitalize text-white">{item.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-indigo-300/20 bg-indigo-400/[0.06] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Your current reflection
              </div>
              <p className="mt-2 text-sm font-semibold text-white">{reading.journalPrompt.prompt}</p>
              <p className="mt-1 text-xs text-indigo-100/80">{reading.journalPrompt.affirmation}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Core balance · symbolic scores</h3>
              {(Object.entries(reading.frequencies) as [Core, number][])
                .sort(([, left], [, right]) => right - left)
                .map(([core, score]) => (
                  <div key={core} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3">
                    <span className="text-xs text-slate-300">{CORE_NAMES[core]}</span>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-white/10"
                      role="meter"
                      aria-label={`${CORE_NAMES[core]} symbolic score`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={score}
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-[width]" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-right font-mono text-xs text-indigo-200">{score}</span>
                  </div>
                ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {reading.todaysPractices.map((practice) => (
                <article key={practice.practiceId} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-white">{practice.name}</h3>
                    <span className="shrink-0 text-[10px] text-slate-400">{practice.durationMin} min</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{practice.instruction}</p>
                  {practice.soundHz && <p className="mt-2 font-mono text-[10px] text-indigo-300">{practice.soundHz} Hz · symbolic sound reference</p>}
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent alignment history</h3>
            {timeline.length ? (
              <ol className="space-y-2">
                {timeline.map((entry, index) => (
                  <li key={`${entry.recordedAt}-${index}`} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-white">{CORE_NAMES[entry.dominantCore]}</p>
                      <p className="text-[10px] text-slate-500">{new Date(entry.recordedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] capitalize text-slate-400">{entry.source}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs leading-relaxed text-slate-400">A history entry will appear after the first successful reading.</p>
            )}
            {errorMessage && <p role="status" className="text-xs text-amber-200">{errorMessage}</p>}
            {reading.notices.referralRequired && reading.notices.referralMessage && (
              <p role="status" className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
                {reading.notices.referralMessage}
              </p>
            )}
            <p className="border-t border-white/5 pt-3 text-[10px] leading-relaxed text-slate-500">
              Scores are generated by a symbolic cultural framework and are not measures of health, personality, or scientific evidence.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
