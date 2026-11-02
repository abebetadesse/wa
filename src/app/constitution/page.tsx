import Link from "next/link";
import ConstitutionExperience from "./ConstitutionExperience";

export default function ConstitutionPage() {
  return (
    <main className="app-container py-10">
      <header className="mb-8 overflow-hidden rounded-[30px] border border-brand/20 bg-gradient-to-br from-brand-soft via-card to-gold-soft p-7 md:p-10 shadow-panel">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-strong">
          Constitution & rhythm
        </div>
        <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Wellbeing, temperament, and daily resilience through a rooted Ethiopian lens.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-strong md:text-base">
          Each expert can use a constitution-style assessment to understand energy, digestion, sleep, stress, movement, and environmental comfort. The underlying logic is evidence-aware, but the presentation remains respectful of traditional body knowledge, practical daily living, and cultural rhythm.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/diagnostic" className="btn-pill-primary">Open diagnostic portal</Link>
          <Link href="/case" className="btn-pill-secondary">Continue to care pathway</Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { title: "Energy pattern", copy: "How resilience, fatigue, and recovery interplay with labor, food, and seasonal cycles." },
          { title: "Digestive rhythm", copy: "A practical read on heaviness, hunger, and how the body handles meals and fasting." },
          { title: "Stress + rest", copy: "Sleep, nervous-system regulation, and environmental adaptation are treated as core assessment inputs." },
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] border border-border bg-card/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-soft">{item.copy}</p>
          </div>
        ))}
      </section>

      <ConstitutionExperience />
    </main>
  );
}
