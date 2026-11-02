import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-container py-20">
      <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-background/80 p-10 text-center shadow-raised shadow-black/30">
        <p className="text-xs uppercase tracking-wider text-brand">404 · page not found</p>
        <h1 className="mt-5 text-4xl font-bold text-foreground md:text-5xl">This pathway is unavailable.</h1>
        <p className="mt-4 text-base text-soft">
          The route you requested does not exist or is not available in the current platform state.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand">
            Return home
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand">
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
