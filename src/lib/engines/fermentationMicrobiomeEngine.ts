/**
 * Enhancement 10: Ersho (እርሾ) Teff Sourdough Fermentation Kinetics Engine
 * Enhancement 12: Enset (Kocho/Bulla) Prebiotic Resistant Starch & Butyrate Engine
 */

export interface ErshoFermentationStage {
  hoursFermented: number;
  doughPH: number;
  phytateDegradationPct: number;
  ironBioavailabilityMultiplier: number;
  zincBioavailabilityMultiplier: number;
  dominantMicroorganisms: string[];
  sensoryAndTexturalStage: string;
}

export const ERSHO_KINETIC_TIMELINE: ErshoFermentationStage[] = [
  {
    hoursFermented: 0,
    doughPH: 6.2,
    phytateDegradationPct: 0,
    ironBioavailabilityMultiplier: 1.0,
    zincBioavailabilityMultiplier: 1.0,
    dominantMicroorganisms: ["Native epiphytic grain bacteria (Enterobacteriaceae)"],
    sensoryAndTexturalStage: "Initial unfermented slurry (ሊጥ); dense, flat, lacking aeration.",
  },
  {
    hoursFermented: 24,
    doughPH: 5.1,
    phytateDegradationPct: 35.0,
    ironBioavailabilityMultiplier: 1.15,
    zincBioavailabilityMultiplier: 1.10,
    dominantMicroorganisms: ["Heterofermentative Leuconostoc mesenteroides", "Pediococcus pentosaceus"],
    sensoryAndTexturalStage: "Mild souring begins; slight CO2 bubble formation; yellow surface liquid (Ersho water) emerges.",
  },
  {
    hoursFermented: 48,
    doughPH: 4.4,
    phytateDegradationPct: 68.0,
    ironBioavailabilityMultiplier: 1.30,
    zincBioavailabilityMultiplier: 1.25,
    dominantMicroorganisms: ["Lactobacillus plantarum (L. plantarum)", "Lactobacillus fermentum"],
    sensoryAndTexturalStage: "Active phytase hydrolysis window; distinct sourdough aroma; dough expands with micro-cavities.",
  },
  {
    hoursFermented: 72,
    doughPH: 3.9,
    phytateDegradationPct: 86.0,
    ironBioavailabilityMultiplier: 1.45,
    zincBioavailabilityMultiplier: 1.40,
    dominantMicroorganisms: ["Lactobacillus acidophilus", "Saccharomyces cerevisiae", "Candida humilis"],
    sensoryAndTexturalStage: "Optimal traditional stage for Absit cooking; fine spongy crumb with hundreds of uniform 'eyes' (አይን).",
  },
  {
    hoursFermented: 96,
    doughPH: 3.7,
    phytateDegradationPct: 94.0,
    ironBioavailabilityMultiplier: 1.55,
    zincBioavailabilityMultiplier: 1.48,
    dominantMicroorganisms: ["Acid-tolerant Lactobacillus species", "Symbiotic wild yeasts"],
    sensoryAndTexturalStage: "Maximum phytate breakdown; pronounced tangy acidity; maximum mineral liberation.",
  },
];

export interface EnsetMicrobiomeProfile {
  product: "kocho" | "bulla";
  nameAmharic: string;
  botanicalOrigin: string;
  resistantStarchGramsPer100g: number;
  totalDietaryFiberGramsPer100g: number;
  simulatedSCFAYieldMmolPerKg: {
    butyrate: number;
    propionate: number;
    acetate: number;
  };
  gastrointestinalBenefits: string[];
  suggestedPreparation: string;
}

/**
 * Enhancement 10: Calculates phytate degradation and bioavailability based on fermentation hours
 */
export function calculateErshoKinetics(hours: number): ErshoFermentationStage {
  const clampedHours = Math.max(0, Math.min(96, hours));

  // Find surrounding bracket
  for (let i = 0; i < ERSHO_KINETIC_TIMELINE.length - 1; i++) {
    const curr = ERSHO_KINETIC_TIMELINE[i];
    const next = ERSHO_KINETIC_TIMELINE[i + 1];

    if (clampedHours >= curr.hoursFermented && clampedHours <= next.hoursFermented) {
      const ratio = (clampedHours - curr.hoursFermented) / (next.hoursFermented - curr.hoursFermented);
      const pH = Number((curr.doughPH + ratio * (next.doughPH - curr.doughPH)).toFixed(2));
      const phytate = Number((curr.phytateDegradationPct + ratio * (next.phytateDegradationPct - curr.phytateDegradationPct)).toFixed(1));
      const ironMult = Number((curr.ironBioavailabilityMultiplier + ratio * (next.ironBioavailabilityMultiplier - curr.ironBioavailabilityMultiplier)).toFixed(2));
      const zincMult = Number((curr.zincBioavailabilityMultiplier + ratio * (next.zincBioavailabilityMultiplier - curr.zincBioavailabilityMultiplier)).toFixed(2));

      return {
        hoursFermented: clampedHours,
        doughPH: pH,
        phytateDegradationPct: phytate,
        ironBioavailabilityMultiplier: ironMult,
        zincBioavailabilityMultiplier: zincMult,
        dominantMicroorganisms: next.dominantMicroorganisms,
        sensoryAndTexturalStage: next.sensoryAndTexturalStage,
      };
    }
  }

  return ERSHO_KINETIC_TIMELINE[ERSHO_KINETIC_TIMELINE.length - 1];
}

/**
 * Enhancement 12: Simulates Enset prebiotic resistant starch fermentation and butyrate production
 */
export function getEnsetMicrobiomeProfile(product: "kocho" | "bulla"): EnsetMicrobiomeProfile {
  if (product === "kocho") {
    return {
      product: "kocho",
      nameAmharic: "የተብላላ ቆጮ (Fermented Kocho)",
      botanicalOrigin: "Ensete ventricosum (Pseudostem and corm pulp pit-fermented with ancestral starters for 3 to 12 months)",
      resistantStarchGramsPer100g: 14.8,
      totalDietaryFiberGramsPer100g: 6.2,
      simulatedSCFAYieldMmolPerKg: {
        butyrate: 42.0, // Exceptionally high butyrate precursor
        propionate: 28.5,
        acetate: 65.0,
      },
      gastrointestinalBenefits: [
        "Butyrate provides >70% of the daily energy requirements of human colonocytes, reinforcing mucosal barrier integrity.",
        "Down-regulates pro-inflammatory cytokines (IL-1beta, TNF-alpha) via histone deacetylase (HDAC) inhibition.",
        "Pit fermentation enriches functional lactic acid cultures and natural fibers that alleviate chronic constipation and IBS.",
      ],
      suggestedPreparation:
        "Bake as flatbread (Wosla) wrapped in enset leaves over a clay mittad, seasoned with spiced butter (Niter Kibbeh) and paired with collard greens (Gomen) and Ayib.",
    };
  }

  return {
    product: "bulla",
    nameAmharic: "ንፁህ ቡላ (Dehydrated Bulla Flour)",
    botanicalOrigin: "Ensete ventricosum (Fine dehydrated starch decanted from scraped pseudostem juice)",
    resistantStarchGramsPer100g: 18.5,
    totalDietaryFiberGramsPer100g: 2.1,
    simulatedSCFAYieldMmolPerKg: {
      butyrate: 51.0,
      propionate: 31.0,
      acetate: 72.0,
    },
    gastrointestinalBenefits: [
      "Ultra-gentle, non-irritating mucilaginous carbohydrate matrix that coats irritated gastric mucosa during gastritis flare-ups.",
      "Produces dense short-chain fatty acids upon reaching the cecum and ascending colon without causing excessive upper bloating.",
      "Traditional restorative staple for postpartum mothers and convalescing elders.",
    ],
    suggestedPreparation:
      "Whisk with cold water, simmer into a thick silky porridge (Muk), and serve with warm grass-fed spiced butter and a pinch of black cumin (Tikur Azmud).",
    };
}
