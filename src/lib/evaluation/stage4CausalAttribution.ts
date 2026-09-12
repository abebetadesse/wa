import { NormalizedProfile, Gap, Cause, FoodEntry } from "./types";

export function stage4CausalAttribution(
  gaps: Gap[],
  profile: NormalizedProfile,
  dietLog: FoodEntry[]
): Cause[] {
  const causes: Cause[] = [];

  for (const gap of gaps) {
    if (gap.gapType === "deficiency") {
      // 1. Dietary Pattern Checks
      if (gap.nutrientName === "Iron") {
        const hasHemeMeat = dietLog.some((e) =>
          e.foodName.toLowerCase().includes("meat") ||
          e.foodName.toLowerCase().includes("tibs") ||
          e.foodName.toLowerCase().includes("doro")
        );
        if (!hasHemeMeat) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "dietary",
            title: "Plant-Dominant Non-Heme Iron Profile",
            description:
              "Dietary intake relies predominantly on non-heme plant iron (teff, lentils, pulses). Non-heme iron has a baseline absorption rate of 5–15%, compared to 25–35% for animal heme iron.",
            evidenceStrength: "established",
            sourceRef: "EFCT2025-CAUS-FE01",
          });
        }
      }

      if (gap.nutrientName === "Vitamin B12") {
        const hasAnimalSource = dietLog.some((e) =>
          e.foodName.toLowerCase().includes("meat") ||
          e.foodName.toLowerCase().includes("doro") ||
          e.foodName.toLowerCase().includes("aib") ||
          e.foodName.toLowerCase().includes("egg")
        );
        if (!hasAnimalSource) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "dietary",
            title: "Absent Cobalamin Animal-Source Intake",
            description:
              "Vitamin B12 (cobalamin) is absent in unfortified plant foods. Fasting (Tsom) or plant-exclusive diets without dairy or egg intake directly precipitate progressive depletion of hepatic stores.",
            evidenceStrength: "established",
            sourceRef: "EFCT2025-CAUS-B12-DIET",
          });
        }
      }

      if (gap.nutrientName === "Calcium") {
        const hasRichCalcium = dietLog.some((e) =>
          e.foodName.toLowerCase().includes("gomen") ||
          e.foodName.toLowerCase().includes("aib") ||
          e.foodName.toLowerCase().includes("moringa") ||
          e.foodName.toLowerCase().includes("kocho")
        );
        if (!hasRichCalcium) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "dietary",
            title: "Low Dietary Calcium Density",
            description:
              "Diet lacks regular inclusion of bioavailable calcium staples such as braised gomen, traditional dairy (aib), enset products (kocho/bulla), or moringa leaf.",
            evidenceStrength: "probable",
            sourceRef: "EFCT2025-CAUS-CA01",
          });
        }
      }

      // 2. Absorption Inhibitors (Crucial in Ethiopian food traditions)
      if (gap.nutrientName === "Iron" || gap.nutrientName === "Zinc") {
        if (profile.lifestyleHabits.teaWithMeals || profile.lifestyleHabits.coffeeRitualTwiceDaily) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "absorption_inhibitor",
            title: "Post-Meal Polyphenol & Tannin Chelation",
            description:
              "Consuming traditional Ethiopian coffee (Bunna) or tea immediately alongside or within 45 minutes of meals introduces high concentrations of chlorogenic acids and tannins, forming insoluble complexes that reduce non-heme iron absorption by up to 60–80%.",
            evidenceStrength: "established",
            sourceRef: "ETM-CLIN-ABS-01",
          });
        }

        if (profile.lifestyleHabits.unfermentedGrainsHabit) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "absorption_inhibitor",
            title: "Unfermented Grain Phytate Binding",
            description:
              "Consuming unfermented or inadequately fermented grains maintains high phytic acid levels (myo-inositol hexakisphosphate), which binds divalent cations (Fe²⁺, Zn²⁺, Ca²⁺) in the duodenum.",
            evidenceStrength: "established",
            sourceRef: "EFCT2025-CAUS-PHYT",
          });
        }
      }

      // 3. Medication-Induced Depletion Checks
      for (const med of profile.medications) {
        const medClass = med.drugClass.toLowerCase();
        const medName = med.name.toLowerCase();

        // Metformin depletes Vitamin B12
        if (gap.nutrientName === "Vitamin B12" && (medClass.includes("hypoglycemic") || medName.includes("metformin"))) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "medication",
            title: `Medication-Induced B12 Depletion (${med.name})`,
            description:
              "Biguanides (Metformin) interfere with the calcium-dependent binding of the intrinsic factor-vitamin B12 complex to cubilin receptors in the terminal ileum, commonly reducing serum B12 levels by 10–30% during sustained therapy.",
            evidenceStrength: "established",
            sourceRef: "ETM-MED-DEP-MET01",
          });
        }

        // PPIs deplete Magnesium, Iron, B12
        if (
          (gap.nutrientName === "Magnesium" || gap.nutrientName === "Iron" || gap.nutrientName === "Vitamin B12") &&
          (medClass.includes("proton pump") || medName.includes("prazole"))
        ) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "medication",
            title: `Gastric Acid Suppression Depletion (${med.name})`,
            description:
              "Proton pump inhibitor therapy induces hypochlorhydria, suppressing the gastric acidity needed to cleave protein-bound B12 and reduce ferric (Fe³⁺) to absorbable ferrous (Fe²⁺) iron.",
            evidenceStrength: "established",
            sourceRef: "ETM-MED-DEP-PPI01",
          });
        }

        // Diuretics deplete Potassium, Magnesium, Zinc
        if (
          (gap.nutrientName === "Potassium" || gap.nutrientName === "Magnesium" || gap.nutrientName === "Zinc") &&
          (medClass.includes("diuretic") || medName.includes("furosemide") || medName.includes("hydrochlorothiazide"))
        ) {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "medication",
            title: `Renal Electrolyte Clearance (${med.name})`,
            description:
              "Loop and thiazide diuretics accelerate renal tubular excretion of key electrolytes and trace minerals, predisposing to subclinical hypomagnesemia and hypokalemia.",
            evidenceStrength: "established",
            sourceRef: "ETM-MED-DEP-DIU01",
          });
        }
      }

      // 4. Age-Related Absorption Decline
      if (profile.age >= 55) {
        if (gap.nutrientName === "Vitamin B12" || gap.nutrientName === "Calcium") {
          causes.push({
            gapNutrientId: gap.nutrientId,
            causeType: "age_related",
            title: "Age-Associated Gastric Mucosal Changes",
            description:
              "Adults over age 50 experience higher prevalence of atrophic gastritis and decreased parietal cell intrinsic factor secretion, diminishing gastrointestinal bioavailability.",
            evidenceStrength: "probable",
            sourceRef: "EFCT2025-CAUS-AGE50",
          });
        }
      }

      // 5. Highland Physiological Oxygen Transport Demand
      if (gap.nutrientName === "Iron" && profile.altitudeMeters >= 2000) {
        causes.push({
          gapNutrientId: gap.nutrientId,
          causeType: "lifestyle",
          title: `Highland Erythropoietic Adaptation Demand (${profile.altitudeMeters}m)`,
          description:
            `Living at high Ethiopian altitudes (${profile.region}, ${profile.altitudeMeters}m) chronically stimulates hypoxia-inducible factor (HIF) and erythropoietin secretion, demanding a significantly larger circulating iron pool for hemoglobin synthesis than sea-level baselines.`,
          evidenceStrength: "established",
          sourceRef: "WHO-ALT-FE-2024",
        });
      }
    }
  }

  return causes;
}
