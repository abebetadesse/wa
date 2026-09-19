import HexacoreOrrery from "@/components/cultural/HexacoreOrrery";

export default function HexacorePage() {
  return (
    <main className="app-container py-10 space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">Domain B · Cultural reflection</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-6xl">Hexacore Arcana</h1>
        <p className="mt-3 text-slate-400">Explore six cores, their creation-day relationships, aspects, frequencies, and reflective correspondences.</p>
        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4 text-sm leading-relaxed text-amber-100/80">This experience is for cultural reflection and journaling only. Body signs are not diagnoses, sounds are not treatments, and herbs/correspondences are not medical recommendations. You can hide or leave this layer at any time.</div>
      </header>
      <HexacoreOrrery />
    </main>
  );
}
