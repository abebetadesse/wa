import Link from "next/link";
import CulturalExperience from "./CulturalExperience";

export default function CulturalPage() {
  return (
    <main className="app-container py-10">
      <header className="mb-8 rounded-[30px] border border-amber-500/20 bg-gradient-to-br from-[#2b1e1a] via-[#4d3322] to-[#201b18] p-7 md:p-10 shadow-[0_22px_80px_rgba(23,15,11,0.46)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200">
          Sacred heritage layer
        </div>
        <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">
          Sacred heritage, ritual memory, and contextual wisdom.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-200 md:text-base">
          This domain honors the living heritage of Ethiopian wisdom—Awde Negest signs, Ge&apos;ez numerology, fasting cadence, and seasonal practice—while keeping ritual meaning clearly separated from Debral diagnosis and medication safety. Heritage is respected without abandoning evidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/discover" className="btn-pill-primary">Explore knowledge map</Link>
          <Link href="/case" className="btn-pill-secondary">Continue with a case</Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          { title: "Astrology", copy: "Celestial interpretation and temperament mapping from the Awde Negest tradition." },
          { title: "Gematria", copy: "Ge&apos;ez word value and lineage interpretation for naming and spiritual reflection." },
          { title: "Fasting seasons", copy: "Lunar and ecclesiastical timing connected to food, rest, and practice cycles." },
          { title: "Community ritual", copy: "Coffee ceremony, healing context, and social meaning as part of care design." },
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-stone-900/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">{item.copy}</p>
          </div>
        ))}
      </section>

      <CulturalExperience />
    </main>
  );
}
