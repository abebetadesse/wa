import { NormalizedProfile, Gap, Solution, SafetyCheckResult } from "./types";
import { checkHerbDrugSafety } from "./stage5SafetyGate";

export interface SolutionCandidatePool {
  gapNutrientId: string;
  nutrientName: string;
  dietary: { title: string; description: string; rank: number; sourceRef: string }[];
  traditional: { herbName: string; title: string; description: string; rank: number; sourceRef: string }[];
  lifestyle: { title: string; description: string; rank: number; sourceRef: string }[];
}

export const CANDIDATE_SOLUTIONS_CATALOG: Record<string, SolutionCandidatePool> = {
  Iron: {
    gapNutrientId: "iron",
    nutrientName: "Iron",
    dietary: [
      {
        title: "Transition to 100% Fermented Brown Teff Injera",
        description:
          "Brown teff contains 11.5mg iron per 100g. Ensure authentic 3-4 day Ersho yeast/lactic fermentation, which reduces phytic acid inhibitors and enhances non-heme iron absorption by 45%.",
        rank: 0.95,
        sourceRef: "EFCT2025-SOL-TEFF",
      },
      {
        title: "Incorporate Moringa Stenopetala (Shiferaw) Leaf Powder",
        description:
          "Add 1–2 teaspoons (5–10g) of dried indigenous Moringa leaf powder to soups or stews, delivering 1.4–2.8mg of bioavailable iron alongside synergistic Vitamin C.",
        rank: 0.88,
        sourceRef: "EFCT2025-SOL-MORINGA",
      },
      {
        title: "Strategic Inclusion of Heme Iron (Doro Wot / Lean Beef)",
        description:
          "Include 100–150g portion of slow-simmered poultry or lean meat twice weekly. Meat protein factor (MPF) enhances concurrent absorption of non-heme iron from teff and pulses.",
        rank: 0.90,
        sourceRef: "EFCT2025-SOL-HEME",
      },
    ],
    traditional: [
      {
        herbName: "Feto",
        title: "Traditional Lepidium Sativum (Feto) Seed Tonic",
        description:
          "Ground Lepidium sativum seeds steeped in warm water with a teaspoon of pure Ethiopian honey, traditionally utilized as a hematinic restorative.",
        rank: 0.75,
        sourceRef: "ETM-DB-FET-05",
      },
      {
        herbName: "Tena Adam",
        title: "Ruta Chalepensis (Tena Adam) Infusion",
        description:
          "Traditional digestive and systemic tonic using Ruta chalepensis leaves steeped in warm water.",
        rank: 0.70,
        sourceRef: "ETM-DB-TEN-02",
      },
      {
        herbName: "Kosso",
        title: "Hagenia Abyssinica (Kosso) Restorative Extract",
        description:
          "Traditional herbal preparation historically used in intestinal cleansing.",
        rank: 0.40,
        sourceRef: "ETM-DB-KOS-03",
      },
    ],
    lifestyle: [
      {
        title: "Institute 60–90 Minute Coffee/Tea Buffer After Meals",
        description:
          "Delay the traditional Ethiopian coffee ceremony (Bunna) or spiced black tea until at least 60–90 minutes post-meal to prevent chlorogenic acid and tannin chelation of dietary iron.",
        rank: 0.98,
        sourceRef: "ETM-CLIN-LIF-01",
      },
    ],
  },
  Calcium: {
    gapNutrientId: "calcium",
    nutrientName: "Calcium",
    dietary: [
      {
        title: "Daily Sautéed Ethiopian Collard Greens (Gomen)",
        description:
          "Braised leafy Gomen contains 210mg calcium per 100g. Unlike spinach, Ethiopian Brassica greens are exceptionally low in oxalic acid, yielding a high fractional calcium absorption rate (>50%).",
        rank: 0.94,
        sourceRef: "EFCT2025-SOL-GOMEN",
      },
      {
        title: "Traditional Fresh Cottage Cheese (Aib)",
        description:
          "Consume 80–120g of fresh traditional Aib alongside meals, supplying ~200–290mg of readily absorbable dairy calcium without excessive fat.",
        rank: 0.91,
        sourceRef: "EFCT2025-SOL-AIB",
      },
      {
        title: "Fermented Enset Delicacies (Kocho & Bulla)",
        description:
          "Enset corm and stem products fermented in earthen pits concentrate mineral calcium (160–185mg/100g) while providing easily digestible prebiotic starches.",
        rank: 0.85,
        sourceRef: "EFCT2025-SOL-ENSET",
      },
    ],
    traditional: [
      {
        herbName: "Tosign",
        title: "Thymus Serrulatus (Tosign) Mineral Tea",
        description:
          "Aromatic Ethiopian highland thyme tea consumed warm as a calming, mineral-supportive beverage.",
        rank: 0.80,
        sourceRef: "ETM-DB-TOS-07",
      },
    ],
    lifestyle: [
      {
        title: "Pair Calcium-Rich Meals with Midday Sunlight Exposure",
        description:
          "Obtain 15–25 minutes of morning or midday sun exposure to sustain active 1,25-dihydroxyvitamin D synthesis, which is required for duodenal active calcium transport.",
        rank: 0.92,
        sourceRef: "WHO-VITD-2024",
      },
    ],
  },
  "Vitamin B12": {
    gapNutrientId: "b12",
    nutrientName: "Vitamin B12",
    dietary: [
      {
        title: "Scheduled Animal-Source Foods Outside Fasting Cycles",
        description:
          "On non-fasting days, prioritize nutrient-dense eggs, Aib, or poultry (Doro Wot) to replenish liver cobalamin stores depleted during prolonged fasting periods.",
        rank: 0.92,
        sourceRef: "EFCT2025-SOL-B12A",
      },
      {
        title: "Fortified Nutritional Yeast or Oral B12 Supplementation",
        description:
          "For individuals adhering to strict year-round vegan fasting or with medication-induced malabsorption (e.g. Metformin), oral cyanocobalamin/methylcobalamin (500–1000mcg weekly) is essential.",
        rank: 0.96,
        sourceRef: "ETM-CLIN-B12SUP",
      },
    ],
    traditional: [],
    lifestyle: [
      {
        title: "Coordinate Metformin Schedule with Cobalamin Intake",
        description:
          "If prescribed Metformin, schedule B12 intake or calcium-rich meals at distinct intervals or request annual serum cobalamin screening from your healthcare physician.",
        rank: 0.89,
        sourceRef: "ETM-MED-B12SCHED",
      },
    ],
  },
};

/**
 * Stage 5: Solution Generation with MANDATORY Herb-Drug Safety Gate.
 * Traditional remedies are strictly audited against the patient's medications.
 * Any flagged remedy is omitted from user recommendations and placed in culled list.
 */
export function stage5GenerateSolutions(
  gaps: Gap[],
  profile: NormalizedProfile
): { solutions: Solution[]; culledUnsafeRemedies: SafetyCheckResult[] } {
  const solutions: Solution[] = [];
  const culledUnsafeRemedies: SafetyCheckResult[] = [];

  for (const gap of gaps) {
    const catalog = CANDIDATE_SOLUTIONS_CATALOG[gap.nutrientName];
    if (!catalog) continue;

    // 1. Dietary Solutions
    for (const d of catalog.dietary) {
      solutions.push({
        gapNutrientId: gap.nutrientId,
        solutionType: "dietary_change",
        title: d.title,
        description: d.description,
        interactionChecked: "n_a",
        rankScore: d.rank,
        sourceRef: d.sourceRef,
      });
    }

    // 2. Traditional Remedies - SUBJECT TO MANDATORY SAFETY GATE
    for (const t of catalog.traditional) {
      const safetyResult = checkHerbDrugSafety(t.herbName, profile.medications);

      if (safetyResult.status === "flagged") {
        // STRICTLY EXCLUDED: Never surface an interacting herb to the user!
        culledUnsafeRemedies.push(safetyResult);
      } else {
        // PASSED: Safe to display with verification seal
        solutions.push({
          gapNutrientId: gap.nutrientId,
          solutionType: "traditional_remedy",
          title: t.title,
          description: t.description,
          herbName: t.herbName,
          interactionChecked: "pass",
          interactionNotes: "Safety Gate Checked: Zero contraindications with active prescription medications.",
          rankScore: t.rank,
          sourceRef: t.sourceRef,
        });
      }
    }

    // 3. Lifestyle Solutions
    for (const l of catalog.lifestyle) {
      solutions.push({
        gapNutrientId: gap.nutrientId,
        solutionType: "lifestyle",
        title: l.title,
        description: l.description,
        interactionChecked: "n_a",
        rankScore: l.rank,
        sourceRef: l.sourceRef,
      });
    }

    // 4. Clinical Referral for High-Severity Gaps
    if (gap.severity === "high") {
      solutions.push({
        gapNutrientId: gap.nutrientId,
        solutionType: "referral",
        title: `Clinical Provider Consultation (${gap.nutrientName} Evaluation)`,
        description:
          `Because your estimated intake is substantially below physiological requirements (<40% of target), please share this report with a licensed physician or clinical dietitian for diagnostic laboratory testing (e.g. serum ferritin, CBC, or B12 level).`,
        interactionChecked: "n_a",
        rankScore: 0.99,
        sourceRef: "ETM-CLIN-REF-01",
      });
    }
  }

  // Sort by rankScore descending
  solutions.sort((a, b) => b.rankScore - a.rankScore);

  return { solutions, culledUnsafeRemedies };
}
