import Link from "next/link";
import CulturalExperience from "./CulturalExperience";

export default function CulturalPage() {
  return (
    <main className="app-container py-10">
      <header className="mb-8 rounded-[30px] border border-gold/20 bg-gradient-to-br from-gold-soft via-card to-brand-soft p-7 md:p-10 shadow-panel">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-strong">
          Sacred heritage layer
        </div>
        <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Explore living traditions across Ethiopia and the world.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-soft md:text-base">
          Explore Ethiopian heritage alongside traditions from China, India, Japan, Latin America, and beyond. Learn through curated cultural and public-health resources, with respect for local context and a clear boundary between cultural practice and medical evidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/discover" className="btn-pill-primary">Explore knowledge map</Link>
          <Link href="/case" className="btn-pill-secondary">Continue with a case</Link>
        </div>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          { title: "Astrology", copy: "Celestial interpretation and temperament mapping from the Awde Negest tradition." },
          { title: "Gematria", copy: "Ge'ez word value and lineage interpretation for naming and spiritual reflection." },
          { title: "Fasting seasons", copy: "Lunar and ecclesiastical timing connected to food, rest, and practice cycles." },
          { title: "Ceremonies & sacred places", copy: "Explore Ethiopian festivals, churches, holy-water traditions, thermal springs, and historic landscapes." },
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] border border-border bg-card/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-soft">{item.copy}</p>
          </div>
        ))}
      </section>

      <CulturalExperience />
    </main>
  );
}
