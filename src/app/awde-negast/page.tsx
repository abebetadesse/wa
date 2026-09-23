import Link from "next/link";
import AwudeNegestViewer from "@/components/profiling/AwudeNegestViewer";

export default function AwdeNegastPage() {
  return (
    <main className="app-container py-10 space-y-8">
      <header className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Domain B: Cultural Reflection
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-2">
          Awde Negest (አውደ ነገሥት)
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2">
          Explore Ge&apos;ez Fidel arithmetic, 16 circular tables, and 60 reflection categories.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-100/80 leading-relaxed">
          This is a cultural reflection tool, not a scientific diagnosis, medical advice, or guaranteed prediction.
          Its readings never affect the platform&apos;s scientific safety or nutrition calculations.
        </div>

        <div className="mt-5">
          <Link
            href="/library/awde-negast"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
          >
            Read the Original Manuscript
          </Link>
        </div>
      </header>
      <AwudeNegestViewer />
    </main>
  );
}
