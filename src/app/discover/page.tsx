import Link from "next/link";
import DiscoverExperience from "./DiscoverExperience";

export default function DiscoverPage() {
  return (
    <main className="app-container py-10">
      <header className="mb-8 overflow-hidden rounded-[30px] border border-brand/20 bg-gradient-to-br from-gold-soft via-card to-brand-soft p-7 md:p-10 shadow-panel">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-strong">
          Knowledge map
        </div>
        <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Find relevant sample cases, local context, and practical next steps.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-strong md:text-base">
          Search illustrative cases by topic, herbs and food ingredients, diet, Ethiopian location, or Hexacore element. Examples are educational starting points, not real patient records or personalized treatment advice.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/case" className="btn-pill-primary">Start a guided case</Link>
          <Link href="/cultural" className="btn-pill-secondary">View sacred systems</Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { title: "scientific sciences", copy: "Biology, nutrition, physiology, medication safety, and risk screening remain active and evidence-guided." },
          { title: "Cultural interpretation", copy: "Astrology, numerology, ritual meaning, and tradition are treated as lived context rather than scientific fact." },
          { title: "Demographic intelligence", copy: "Age, sex, context, fasting practice, geography, and household patterning influence the guidance model." },
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] border border-border bg-card/70 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-soft">{item.copy}</p>
          </div>
        ))}
      </section>

      <DiscoverExperience />
    </main>
  );
}
