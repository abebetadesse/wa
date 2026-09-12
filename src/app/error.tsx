"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error boundary triggered:", error);
  }, [error]);

  return (
    <main className="app-container py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/30 bg-slate-950/80 p-10 text-center shadow-2xl shadow-red-950/20">
        <p className="text-xs font-mono uppercase tracking-[0.26em] text-red-400">System error</p>
        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">Something went wrong.</h1>
        <p className="mt-4 text-base text-slate-300">
          The platform encountered an unexpected error while loading this section. Please retry the action.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
