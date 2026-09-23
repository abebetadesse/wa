"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ETHIOPIAN_REGION_ALTITUDES } from "@/lib/evaluation/stage1Normalize";
import { ETHIOPIAN_LOCATIONS, resolveEthiopianLocation } from "@/lib/location/ethiopiaLocations";
import { useLanguage } from "@/lib/i18n/context";

const SAMPLE_FOODS = [
  { id: "injera-brown", name: "Fermented Brown Teff Injera", nameAmh: "የቡናማ ጤፍ እንጀራ", defaultGrams: 200, category: "Grains" },
  { id: "shiro", name: "Shiro Wot (Chickpea Stew)", nameAmh: "ሽሮ ወጥ", defaultGrams: 150, category: "Legumes" },
  { id: "misir", name: "Misir Wot (Red Lentil Stew)", nameAmh: "ምስር ወጥ", defaultGrams: 120, category: "Legumes" },
  { id: "gomen", name: "Braised Gomen (Collard Greens)", nameAmh: "ጎመን", defaultGrams: 100, category: "Vegetables" },
  { id: "kocho", name: "Fermented Kocho (Enset)", nameAmh: "ቆጮ", defaultGrams: 150, category: "Roots" },
  { id: "moringa", name: "Moringa Stenopetala Leaf Powder", nameAmh: "የሽፈራው ዱቄት", defaultGrams: 10, category: "Superfoods" },
  { id: "doro", name: "Doro Wot with Egg", nameAmh: "ዶሮ ወጥ ከእንቁላል ጋር", defaultGrams: 150, category: "Meat" },
  { id: "aib", name: "Fresh Ethiopian Cheese (Aib)", nameAmh: "አይብ", defaultGrams: 80, category: "Dairy" },
  { id: "telba", name: "Roasted Telba (Flaxseed) Drink", nameAmh: "የተልባ ውሀ", defaultGrams: 200, category: "Seeds" },
];

const COMMON_MEDICATIONS = [
  { name: "Metformin", drugClass: "Hypoglycemics", note: "Commonly prescribed for glycemic regulation; known to reduce B12 absorption" },
  { name: "Aspirin (81mg)", drugClass: "Anticoagulants / Antiplatelets", note: "Cardiovascular prophylaxis; strong contraindication with Ruta chalepensis (Tena Adam)" },
  { name: "Warfarin", drugClass: "Anticoagulants / Antiplatelets", note: "Anticoagulant; strict contraindication with Kosso and Tena Adam" },
  { name: "Lisinopril", drugClass: "Antihypertensives", note: "ACE inhibitor; potential additive hypotension with Damakesse" },
  { name: "Furosemide (Lasix)", drugClass: "Diuretics", note: "Loop diuretic; additive potassium/electrolyte loss with Feto" },
  { name: "Omeprazole", drugClass: "Proton Pump Inhibitors", note: "Gastric acid suppressor; reduces iron and B12 cleavage" },
];

const PROGRESS_STEPS = [
  "Normalizing client demographic parameters & resolving Ethiopian regional altitude...",
  "Calibrating WHO altitude physiological targets (+15-25% Iron adaptation)...",
  "Computing EFCT 2025 intake factoring fermentation bioavailability uplifts...",
  "Running deterministic causal rules engine (coffee tannin chelation & medication depletions)...",
  "Executing Mandatory Herb-Drug Safety Gate against active pharmaceuticals...",
  "Report generated, certified, and immutable audit log created.",
];

export default function IntakePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [progressStageIdx, setProgressStageIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "Almaz Bekele",
    email: "almaz.bekele@ethio-wellness.org",
    age: 34,
    gender: "female",
    weightKg: 58,
    region: "Addis Ababa",
    altitudeMeters: 2400,
    activityLevel: "moderate",
    pregnancyOrLactation: "none",
    teaWithMeals: true,
    coffeeRitualTwiceDaily: true,
    unfermentedGrainsHabit: false,
    fastingSchedule: "Wednesdays and Fridays (Tsom)",
    selectedFoods: [
      { foodId: "food-injera", foodName: "Fermented Brown Teff Injera", gramsConsumed: 200 },
      { foodId: "food-shiro", foodName: "Shiro Wot (Chickpea Stew)", gramsConsumed: 150 },
    ],
    selectedMeds: [
      { name: "Metformin", drugClass: "Hypoglycemics" },
      { name: "Aspirin", drugClass: "Anticoagulants / Antiplatelets" },
    ],
    medicalHistory: ["Occasional mild fatigue", "Mild dyspepsia after fasting"],
    allergies: ["Peanuts"],
    // Domain B
    includeCultural: true,
    cultural: {
      fullName: "Almaz Bekele Worku",
      birthDate: "1992-04-18",
      birthTime: "08:30",
      birthLocation: "Addis Ababa",
      geezZodiacSign: "Hamle / Leo",
      traditionalNameMeaning: "Diamond - indestructible inner purity and perseverance",
      culturalCalendarPreference: "geez",
    },
    disclaimerAccepted: true,
  });

  const handleRegionChange = (newRegion: string) => {
    const location = resolveEthiopianLocation(newRegion);
    const alt = location.altitudeMeters || ETHIOPIAN_REGION_ALTITUDES[newRegion] || 2000;
    setFormData((prev) => ({
      ...prev,
      region: newRegion,
      altitudeMeters: alt,
      cultural: { ...prev.cultural, birthLocation: location.name },
    }));
  };

  const toggleFood = (foodName: string, grams: number) => {
    setFormData((prev) => {
      const exists = prev.selectedFoods.some((f) => f.foodName === foodName);
      if (exists) {
        return {
          ...prev,
          selectedFoods: prev.selectedFoods.filter((f) => f.foodName !== foodName),
        };
      } else {
        return {
          ...prev,
          selectedFoods: [...prev.selectedFoods, { foodId: `food-${Date.now()}`, foodName, gramsConsumed: grams }],
        };
      }
    });
  };

  const updateFoodGrams = (foodName: string, grams: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedFoods: prev.selectedFoods.map((f) => (f.foodName === foodName ? { ...f, gramsConsumed: grams } : f)),
    }));
  };

  const toggleMed = (medName: string, drugClass: string) => {
    setFormData((prev) => {
      const exists = prev.selectedMeds.some((m) => m.name.toLowerCase().includes(medName.toLowerCase()));
      if (exists) {
        return {
          ...prev,
          selectedMeds: prev.selectedMeds.filter((m) => !m.name.toLowerCase().includes(medName.toLowerCase())),
        };
      } else {
        return {
          ...prev,
          selectedMeds: [...prev.selectedMeds, { name: medName, drugClass }],
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.disclaimerAccepted) {
      setErrorMsg("You must accept the Debral and data governance acknowledgment before proceeding.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setProgressStageIdx(0);

    // Animate stages for realistic enterprise progress
    const timer = setInterval(() => {
      setProgressStageIdx((prev) => {
        if (prev < PROGRESS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        weightKg: formData.weightKg,
        region: formData.region,
        altitudeMeters: formData.altitudeMeters,
        activityLevel: formData.activityLevel,
        pregnancyOrLactation: formData.pregnancyOrLactation,
        dietLog: formData.selectedFoods,
        medications: formData.selectedMeds,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        lifestyleHabits: {
          teaWithMeals: formData.teaWithMeals,
          coffeeRitualTwiceDaily: formData.coffeeRitualTwiceDaily,
          unfermentedGrainsHabit: formData.unfermentedGrainsHabit,
          fastingDays: formData.fastingSchedule,
        },
        includeCultural: formData.includeCultural,
        cultural: formData.cultural,
      };

      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      clearInterval(timer);

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Evaluation failed to execute.");
      }

      setProgressStageIdx(PROGRESS_STEPS.length - 1);
      setTimeout(() => {
        router.push(`/report/${data.reportId}`);
      }, 600);
    } catch (err: any) {
      clearInterval(timer);
      console.error("Intake submission failed:", err);
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10">
      <div className="app-container max-w-4xl">
        {/* Progress Bar & Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
            <span>STEP {step} OF 5</span>
            <span>
              {step === 1 && t.intake.step1}
              {step === 2 && t.intake.step2}
              {step === 3 && t.intake.step3}
              {step === 4 && t.intake.step4}
              {step === 5 && t.intake.step5}
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Demographics & Altitude */}
        {step === 1 && (
          <div className="glass-panel p-8">
            <div className="badge badge-safe mb-3">Stage 1 Normalization</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t.intake.title}</h2>
            <p className="text-sm text-slate-400 mb-6">
              Altitude directly alters human oxygen transport physiology. Highland elevations stimulate erythropoiesis, calibrating baseline micronutrient requirements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Age</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Biological Sex</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="female">Female (Premenopausal Turnover Baseline)</option>
                  <option value="male">Male (Standard Iron Turnover)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Ethiopian Region / Elevation Zone</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                  value={formData.region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                >
                  {ETHIOPIAN_LOCATIONS.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name} · {location.region} (~{location.altitudeMeters}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Altitude (Meters Above Sea Level)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                    value={formData.altitudeMeters}
                    onChange={(e) => setFormData({ ...formData, altitudeMeters: Number(e.target.value) })}
                  />
                  <span className="text-xs text-emerald-400 font-mono whitespace-nowrap">
                    {formData.altitudeMeters >= 2000 ? "+15–25% Iron Target" : "Standard Target"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Physical Activity Level</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                >
                  <option value="sedentary">Sedentary (Desk-based, low exertion)</option>
                  <option value="moderate">Moderate (Standard daily walking &amp; errands)</option>
                  <option value="active">Active (Rigorous daily physical labor / exercise)</option>
                  <option value="very_active">Very Active (Heavy manual agricultural or endurance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Maternal / Reproductive Stage</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-emerald-500 outline-none"
                  value={formData.pregnancyOrLactation}
                  onChange={(e) => setFormData({ ...formData, pregnancyOrLactation: e.target.value as any })}
                >
                  <option value="none">Not Pregnant or Lactating</option>
                  <option value="pregnant_t1">Pregnant (Trimester 1)</option>
                  <option value="pregnant_t2">Pregnant (Trimester 2 - Blood volume expansion)</option>
                  <option value="pregnant_t3">Pregnant (Trimester 3 - Maximum fetal demand)</option>
                  <option value="lactating">Lactating (High protein &amp; mineral turnover)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={() => setStep(2)} className="btn-primary">
                Proceed to Diet Log &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Diet Log & Lifestyle */}
        {step === 2 && (
          <div className="glass-panel p-8">
            <div className="badge badge-safe mb-3">Stage 3 Gap Detection Inputs</div>
            <h2 className="text-2xl font-bold text-white mb-2">Daily Dietary Intake &amp; Habits (EFCT 2025)</h2>
            <p className="text-sm text-slate-400 mb-6">
              Select your typical daily staple foods and consumption habits. The engine adjusts for traditional food preparation methods (such as Ersho yeast fermentation).
            </p>

            {/* Food Selector Cards */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Ethiopian Staple Foods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_FOODS.map((food) => {
                  const selected = formData.selectedFoods.find((f) => f.foodName === food.name);
                  return (
                    <div
                      key={food.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${selected
                        ? "bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/20"
                        : "bg-black/30 border-white/5 hover:border-white/20"
                        }`}
                      onClick={() => toggleFood(food.name, food.defaultGrams)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white text-sm">{food.name}</span>
                        <span className="text-xs text-amber-400 font-medium">{food.nameAmh}</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-3">{food.category}</div>

                      {selected && (
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-slate-300">Portion (Grams):</span>
                          <input
                            type="number"
                            className="w-24 px-2 py-1 rounded bg-black/60 border border-white/20 text-white text-xs text-right"
                            value={selected.gramsConsumed}
                            onChange={(e) => updateFoodGrams(food.name, Number(e.target.value))}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lifestyle & Habit Factors */}
            <div className="p-5 rounded-xl bg-black/40 border border-white/10 mb-8">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                Nutrient Absorption Lifestyle Inhibitors
              </h3>
              <div className="space-y-4 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={formData.coffeeRitualTwiceDaily}
                    onChange={(e) => setFormData({ ...formData, coffeeRitualTwiceDaily: e.target.checked })}
                  />
                  <div>
                    <span className="font-medium text-white block">Traditional Ethiopian Coffee Ceremony (Bunna 2+ times daily)</span>
                    <span className="text-slate-400">Regular consumption of freshly roasted bunna rich in polyphenols and chlorogenic acids.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={formData.teaWithMeals}
                    onChange={(e) => setFormData({ ...formData, teaWithMeals: e.target.checked })}
                  />
                  <div>
                    <span className="font-medium text-white block">Spiced Tea or Coffee immediately alongside or after meals (&lt;45 min)</span>
                    <span className="text-rose-400/90 font-medium">Important:</span>{" "}
                    <span className="text-slate-400">Tannins directly chelate non-heme iron and zinc, inhibiting mineral absorption by up to 70%.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={formData.unfermentedGrainsHabit}
                    onChange={(e) => setFormData({ ...formData, unfermentedGrainsHabit: e.target.checked })}
                  />
                  <div>
                    <span className="font-medium text-white block">Frequent unfermented grain consumption (unfermented porridge / bread)</span>
                    <span className="text-slate-400">Higher intact phytic acid content binding dietary calcium and iron.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary">
                &larr; Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Next: Medications &amp; Safety &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Medications & Safety Gate Context */}
        {step === 3 && (
          <div className="glass-panel p-8">
            <div className="badge badge-flagged mb-3">Stage 5 Safety Gate Auditing</div>
            <h2 className="text-2xl font-bold text-white mb-2">Active Medications &amp; Debral Safety</h2>
            <p className="text-sm text-slate-400 mb-6">
              Certain prescription medications deplete specific nutrients (e.g. Metformin depletes B12) or produce severe adverse reactions when combined with traditional Ethiopian herbs (e.g. Warfarin + Tena Adam).
            </p>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Select Active Prescription Medications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMMON_MEDICATIONS.map((med) => {
                  const isSelected = formData.selectedMeds.some((m) => m.name.toLowerCase().includes(med.name.toLowerCase()));
                  return (
                    <div
                      key={med.name}
                      onClick={() => toggleMed(med.name, med.drugClass)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                        ? "bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/20"
                        : "bg-black/30 border-white/5 hover:border-white/20"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{med.name}</span>
                        <span className="badge badge-high text-[10px]">{med.drugClass}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{med.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 mb-8">
              <strong className="text-emerald-400">Zero-Interaction Guarantee:</strong> The platform will verify every traditional remedy candidate against your selections. Any herb presenting bleeding risks, hypoglycemia amplification, or additive hypotension will be systematically blocked from your recommendations.
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="btn-secondary">
                &larr; Back
              </button>
              <button onClick={() => setStep(4)} className="btn-primary">
                Next: Cultural Layer (Domain B) &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Domain B Cultural Personalization */}
        {step === 4 && (
          <div className="glass-panel p-8 glass-panel-gold">
            <div className="badge bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3">
              Domain B: Structurally Firewalled
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cultural &amp; Heritage Personalization</h2>

            {/* Architectural Firewall Alert */}
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed mb-6">
              <strong>Architectural Firewall Notice:</strong> Domain B data (astrology, traditional naming numerology, Ge&apos;ez calendar) is strictly stored in a separate table and excluded from evaluation query pipelines. Cultural reflections are provided solely for personal holistic enrichment and never influence Debral gap calculations.
            </div>

            <div className="space-y-4 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeCultural}
                  onChange={(e) => setFormData({ ...formData, includeCultural: e.target.checked })}
                />
                <span className="text-sm font-semibold text-white">
                  Enable Ge&apos;ez Calendar and Cultural Heritage Reflection
                </span>
              </label>

              {formData.includeCultural && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Full Traditional Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-amber-500 outline-none"
                      value={formData.cultural.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cultural: { ...formData.cultural, fullName: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-amber-500 outline-none"
                      value={formData.cultural.birthDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cultural: { ...formData.cultural, birthDate: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Calendar Preference</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-amber-500 outline-none"
                      value={formData.cultural.culturalCalendarPreference}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cultural: { ...formData.cultural, culturalCalendarPreference: e.target.value },
                        })
                      }
                    >
                      <option value="geez">Ethiopian Ge&apos;ez Calendar (13 Months of Sunshine)</option>
                      <option value="gregorian">Gregorian Calendar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Ge&apos;ez Season / Astrological Alignment</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:border-amber-500 outline-none"
                      value={formData.cultural.geezZodiacSign}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cultural: { ...formData.cultural, geezZodiacSign: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(3)} className="btn-secondary">
                &larr; Back
              </button>
              <button onClick={() => setStep(5)} className="btn-primary">
                Next: Review &amp; Evaluate &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Background Job Execution */}
        {step === 5 && (
          <div className="glass-panel p-8">
            <div className="badge badge-safe mb-3">Pre-Flight Audit</div>
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Review &amp; Consent</h2>
            <p className="text-sm text-slate-400 mb-6">
              Review your demographic profile, active medications, and food log before the deterministic evaluation engine executes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-slate-400 font-semibold block mb-1">PROFILE &amp; ELEVATION</span>
                <p className="text-white font-medium">{formData.name} ({formData.age} yo, {formData.gender})</p>
                <p className="text-emerald-400">{formData.region} &bull; {formData.altitudeMeters}m elevation</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-slate-400 font-semibold block mb-1">REPORTED DIET LOG</span>
                <p className="text-white font-medium">{formData.selectedFoods.length} staple foods logged</p>
                <p className="text-slate-400">{formData.selectedFoods.map((f) => f.foodName).join(", ")}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-slate-400 font-semibold block mb-1">ACTIVE PHARMACEUTICALS</span>
                <p className="text-rose-300 font-medium">
                  {formData.selectedMeds.length > 0
                    ? formData.selectedMeds.map((m) => m.name).join(", ")
                    : "None reported"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                <span className="text-slate-400 font-semibold block mb-1">DOMAIN B CULTURAL LAYER</span>
                <p className="text-amber-300 font-medium">
                  {formData.includeCultural ? "Firewalled Cultural Reflection Active" : "Opted Out"}
                </p>
              </div>
            </div>

            {/* Mandatory Regulatory Acknowledgment */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/15 mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={formData.disclaimerAccepted}
                  onChange={(e) => setFormData({ ...formData, disclaimerAccepted: e.target.checked })}
                />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong>Mandatory Debral &amp; Privacy Consent:</strong> I understand that this evaluation engine outputs biochemical dietary patterns based on the Ethiopian Food Composition Table (EFCT 2025) and screens traditional remedies via ETM-DB. It does not provide medical diagnoses. All personal Welbeing data is processed in compliance with Ethiopian Data Protection Proclamations.
                </div>
              </label>
            </div>

            {/* Live Progress Stage Tracker when Submitting */}
            {submitting && (
              <div className="p-6 rounded-2xl bg-black/60 border border-emerald-500/40 mb-8 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Evaluation Engine Active (Inngest Worker Pipeline)
                  </span>
                  <span>{Math.round(((progressStageIdx + 1) / PROGRESS_STEPS.length) * 100)}%</span>
                </div>

                <div className="progress-container">
                  <div
                    className="progress-fill-adequate"
                    style={{ width: `${((progressStageIdx + 1) / PROGRESS_STEPS.length) * 100}%` }}
                  ></div>
                </div>

                <div className="text-xs font-mono text-slate-300 bg-white/[0.02] p-3 rounded border border-white/5">
                  &gt; {PROGRESS_STEPS[progressStageIdx]}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(4)} className="btn-secondary" disabled={submitting}>
                &larr; Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary text-base py-3 px-8 shadow-xl"
              >
                {submitting ? "Processing Pipeline..." : "Generate Welbeing Gap Report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
