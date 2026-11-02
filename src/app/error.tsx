"use client";

import { useEffect } from "react";
import { withBasePath } from '@/lib/base-path';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error boundary triggered:", error);
    // Report it so the crash shows up in the server log; failures here are ignored.
    void fetch(withBasePath("/api/client-errors"), {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: String(error?.message || "Unknown error").slice(0, 500),
        digest: error?.digest,
        path: window.location.pathname,
        stack: error?.stack?.slice(0, 2000),
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <main className="app-container py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-danger/30 bg-background/80 p-10 text-center shadow-raised">
        <p className="text-xs uppercase tracking-wider text-danger">System error</p>
        <h1 className="mt-5 text-4xl font-bold text-foreground md:text-5xl">Something went wrong.</h1>
        <p className="mt-4 text-base text-soft">
          The platform encountered an unexpected error while loading this section. Please retry the action.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-xl bg-danger px-5 py-3 text-sm font-semibold text-danger-foreground transition hover:bg-danger"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
