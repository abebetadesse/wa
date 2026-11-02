import Link from "next/link";
import AwudeNegestViewer from "@/components/profiling/AwudeNegestViewer";

export default function AwdeNegastPage() {
  return (
    <main className="app-container py-10 space-y-8">
      <header className="max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-gold">
          Domain B: Cultural Reflection
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mt-2">
          Awde Negest (አውደ ነገሥት)
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-2">
          Explore Ge&apos;ez Fidel arithmetic, 16 circular tables, and 60 reflection categories.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-gold-soft border border-gold/30 text-xs text-gold-strong leading-relaxed">
          This is a cultural reflection tool, not a scientific diagnosis, medical advice, or guaranteed prediction.
          Its readings never affect the platform&apos;s scientific safety or nutrition calculations.
        </div>

        <div className="mt-5">
          <Link
            href="/library/awde-negast"
            className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-strong transition hover:bg-gold/15"
          >
            Read the Original Manuscript
          </Link>
        </div>
      </header>
      <AwudeNegestViewer />
    </main>
  );
}
