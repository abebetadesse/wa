import Link from "next/link";
import DiscoverExperience from "./DiscoverExperience";

export default function DiscoverPage() {
  return (
    <main className="app-container py-10">
      <header className="mb-8 overflow-hidden rounded-[30px] border border-emerald-500/20 bg-gradient-to-br from-[#2d1d1a] via-[#173f33] to-[#0d1f1d] p-7 md:p-10 shadow-[0_24px_90px_rgba(10,19,18,0.5)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-200">
          Knowledge map
        </div>
        <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">
          The living map of Ethiopian wisdom, science, and daily context.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-emerald-50/85 md:text-base">
          This layer organizes each practitioner’s expertise around a single truth: Ethiopian healing traditions are living knowledge systems, and they are strongest when grounded in biology, scientific safety, nutrition, demographics, and the realities of everyday community life.
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
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-stone-900/70 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">{item.copy}</p>
          </div>
        ))}
      </section>

      <DiscoverExperience />
    </main>
  );
}
