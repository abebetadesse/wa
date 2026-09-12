import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-container py-20">
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-700 bg-slate-950/80 p-10 text-center shadow-2xl shadow-slate-950/30">
        <p className="text-xs font-mono uppercase tracking-[0.26em] text-emerald-400">404 · page not found</p>
        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">This pathway is unavailable.</h1>
        <p className="mt-4 text-base text-slate-300">
          The route you requested does not exist or is not available in the current platform state.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
            Return home
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-500 hover:text-emerald-300">
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
