import { db } from "@/lib/db";
import { foods, foodNutrients, nutrients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function FoodsPage() {
  const allFoods = await db.select().from(foods);
  const allFoodNutrients = await db
    .select({
      fn: foodNutrients,
      n: nutrients,
    })
    .from(foodNutrients)
    .innerJoin(nutrients, eq(foodNutrients.nutrientId, nutrients.id));

  const foodsWithNutrients = allFoods.map((f) => {
    const matched = allFoodNutrients.filter((item) => item.fn.foodId === f.id);
    return {
      ...f,
      nutrients: matched.map((m) => ({
        name: m.n.name,
        symbol: m.n.symbol,
        unit: m.n.unit,
        amount: m.fn.amountPer100g,
        bioavailabilityFactor: m.fn.bioavailabilityFactor,
        note: m.fn.fermentationImpactNote,
      })),
    };
  });

  return (
    <main className="app-container py-10">
      <header className="mb-8 overflow-hidden rounded-[30px] border border-emerald-500/20 bg-gradient-to-br from-[#2a1d1a] via-[#2f4026] to-[#101d1b] p-7 md:p-10 shadow-[0_24px_90px_rgba(12,18,14,0.45)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-200">
          Food wisdom & living evidence
        </div>
        <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">
          Food as memory, medicine, and daily practice.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-emerald-50/85 md:text-base">
          The platform gathers the practical wisdom of teff, enset, grains, greens, and fermentation, then cross-checks each food against measured nutrient data. This gives traditional healers, nutrition guides, and modern care professionals a shared evidence base while preserving the cultural story of how food is prepared, remembered, and lived.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { title: "Traditional processing", copy: "Fermentation, soaking, and preparation methods are treated as meaningful cultural knowledge and as part of nutritional biochemistry." },
          { title: "Scientific baseline", copy: "EFCT data provides objective nutrient values so human assessment remains grounded in measurable evidence." },
          { title: "Debral relevance", copy: "Food choices are considered alongside anemia risk, fasting cycles, demographic needs, and more sustainable healing patterns." },
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-stone-900/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">{item.copy}</p>
          </div>
        ))}
      </section>

      <div className="py-6">
        <div className="app-container">
          <div className="max-w-3xl mb-10">
            <div className="badge badge-safe mb-3">EFCT 2025 Official Baseline</div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Ethiopian Food Composition Explorer</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              The evaluation engine derives its deterministic nutritional benchmarks directly from the Ethiopian Food Composition Table (EFCT 2025). Traditional indigenous processing—such as 4-day lactic fermentation of teff or underground pit fermentation of enset—profoundly elevates mineral bioavailability by degrading phytates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodsWithNutrients.map((food) => (
              <div key={food.id} className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{food.name}</h3>
                      <div className="text-xs text-amber-400 font-medium mt-0.5">{food.nameAmharic}</div>
                    </div>
                    <span className="badge badge-safe text-[10px] whitespace-nowrap">{food.category}</span>
                  </div>

                  {food.traditionalPreparation && (
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-300 leading-relaxed mb-4">
                      <strong className="text-emerald-400 block mb-0.5">Traditional Preparation &amp; Fermentation:</strong>
                      {food.traditionalPreparation}
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Key Nutrients per 100g:
                    </h4>
                    <div className="space-y-1.5">
                      {food.nutrients.map((nut, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/[0.02]"
                        >
                          <span className="text-slate-300">
                            {nut.name} {nut.symbol && <span className="text-slate-500 font-mono">({nut.symbol})</span>}
                          </span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-semibold text-white">
                              {nut.amount} {nut.unit}
                            </span>
                            {Number(nut.bioavailabilityFactor) > 1.0 && (
                              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                &times;{nut.bioavailabilityFactor} bio
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Lineage: {food.sourceRef}</span>
                  <span>Verified EFCT Data</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
