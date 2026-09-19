import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-amber-500 text-3xl font-black text-slate-950 shadow-2xl shadow-emerald-950/40">
          ጥ
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
          Ethiopian Wisdom & Wellness
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
          A private path to informed guidance.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">
          Create a secure profile, choose the kind of help you need, and receive a careful first analysis before an appropriate expert reviews your case.
        </p>
        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          <Link href="/auth?mode=register" className="rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-300">
            Create an account
          </Link>
          <Link href="/auth?mode=login" className="rounded-2xl border border-white/15 bg-white/[0.05] px-6 py-4 text-sm font-bold text-white transition hover:bg-white/[0.1]">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
