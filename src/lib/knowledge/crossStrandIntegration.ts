import { IntersectionFinding, KnowledgeStrandType, StrandFinding, UserProfile } from "./types";

export class CrossStrandIntegrationEngine {
  findIntersections(
    strandResults: Record<KnowledgeStrandType, StrandFinding[]>,
    userProfile: UserProfile
  ): IntersectionFinding[] {
    const intersections: IntersectionFinding[] = [];

    const bio = strandResults.biochemical || [];
    const med = strandResults.medication || [];
    const eco = strandResults.ecological || [];
    const epi = strandResults.epidemiological || [];
    const psych = strandResults.psychological || [];
    const add = strandResults.addiction || [];
    const socio = strandResults.socioeconomic || [];
    const diet = strandResults.dietary || [];
    const cult = strandResults.cultural || [];
    const astro = strandResults.astrological || [];

    // 1. Biochemical + Medication Intersection
    const cypBio = bio.find((f) => f.name.includes("CYTOCHROME") || f.name.includes("DETOXIFICATION"));
    const activeMed = med.find((f) => f.type === "herb_drug_interaction_critical" || f.type === "medication_class");
    if (cypBio && activeMed) {
      intersections.push({
        type: "biochemical_medication",
        strands: ["biochemical", "medication"],
        description: `Hepatic Cytochrome P450 pathway alters or competes with active pharmaceutical clearance for ${activeMed.name}.`,
        evidence: "Biochemical xenobiotic Phase I hemoprotein clearance rules and verified ETM-DB drug interaction registries.",
        recommendation: "Avoid co-administering traditional botanical extracts without consulting a clinical pharmacist or prescribing physician.",
        severity: activeMed.severity || "high",
        priority: 1,
        confidence: 0.95,
        causal_pathway: ["Hepatic CYP450 Substrate", "Botanical Competitive Inhibition", "Elevated Drug Serum Concentration", "Adverse Toxicity Risk"],
      });
    }

    // 2. Ecological + Epidemiological Intersection
    const lowlandEco = eco.find((f) => f.name.includes("LOWLAND") || f.name.includes("RIFT VALLEY") || f.name.includes("KIREMT"));
    const malariaEpi = epi.find((f) => f.name.includes("MALARIA") || f.name.includes("PODOCONIOSIS"));
    if (lowlandEco && malariaEpi) {
      intersections.push({
        type: "ecological_epidemiological",
        strands: ["ecological", "epidemiological"],
        description: `Environmental conditions in ${lowlandEco.name} directly drive transmission dynamics of ${malariaEpi.name}.`,
        evidence: "Ecological vector proliferation in warm lowland stagnant water pools following rainy season.",
        recommendation: "Combine immediate medical parasitological diagnostics with environmental vector reduction (LLINs, clearing domestic stagnant water).",
        severity: malariaEpi.severity || "high",
        priority: 1,
        confidence: 0.94,
        causal_pathway: ["Warm Lowland Climate", "Stagnant Water Pools", "Anopheles Vector Proliferation", "Plasmodium Parasite Inoculation", "Acute Febrile Paroxysms"],
      });
    }

    // 3. Highland Ecological + Dietary/Biochemical Iron Intersection
    const highlandEco = eco.find((f) => f.name.includes("HIGHLAND"));
    const ironBio = bio.find((f) => f.name.includes("IRON") || f.name.includes("KREBS"));
    const teffDiet = diet.find((f) => f.name.includes("TEFF"));
    if (highlandEco && (ironBio || teffDiet)) {
      intersections.push({
        type: "ecological_dietary_biochemical",
        strands: ["ecological", "dietary", "biochemical"],
        description: "Highland altitude hypoxia increases basal hemoglobin synthesis requirements, requiring optimized bioavailability from teff staples.",
        evidence: "Elevated erythropoiesis at 2,400m+ demands 15-25% more bioavailable iron; traditional 4-day Ersho fermentation degrades phytates to fulfill this target.",
        recommendation: "Consume well-fermented teff injera paired with vitamin C enhancers; avoid drinking tea or coffee within 90 minutes of meals.",
        severity: "moderate",
        priority: 2,
        confidence: 0.92,
        causal_pathway: ["Highland Ambient Hypoxia (2,400m+)", "Erythropoietin (EPO) Activation", "Elevated Iron Demand", "Ersho Phytate Breakdown", "Sufficient Oxygen Delivery"],
      });
    }

    // 4. Psychological + Addiction Intersection
    const psychDistress = psych.find((f) => f.type === "psychological_condition");
    const addictionUse = add.find((f) => f.type === "substance_health_impact");
    if (psychDistress && addictionUse) {
      intersections.push({
        type: "psychological_addiction",
        strands: ["psychological", "addiction"],
        description: `Symptom overlap: ${psychDistress.name} is closely linked with the use patterns and post-use withdrawal crashes of ${addictionUse.name}.`,
        evidence: "Sympathomimetic stimulant crash and chronic dopamine receptor downregulation intensify secondary anxiety and depressive anhedonia.",
        recommendation: "Address substance cessation alongside mental health support. Tapering substance use is necessary to stabilize mood and sleep.",
        severity: "high",
        priority: 2,
        confidence: 0.91,
        causal_pathway: ["Underlying Emotional Stress / Boredom", "Substance Self-Medication (Khat/Alcohol)", "Transient Euphoric Relief", "Neurochemical Depletion Crash", "Exacerbated Anxiety & Insomnia"],
      });
    }

    // 5. Socioeconomic + Epidemiological Intersection
    const ruralAccess = socio.find((f) => f.name.includes("RURAL") || f.name.includes("ENERGY"));
    const severeEpi = epi.find((f) => f.severity === "critical" || f.severity === "high");
    if (ruralAccess && severeEpi) {
      intersections.push({
        type: "socioeconomic_epidemiological",
        strands: ["socioeconomic", "epidemiological"],
        description: `healthcare transit and resource constraints in ${ruralAccess.name} heighten the urgency of early intervention for ${severeEpi.name}.`,
        evidence: "Geographic distance to tertiary centers and limited primary post diagnostics can delay life-saving treatment.",
        recommendation: "Do not wait for symptoms to worsen; utilize community transport and present to the nearest health Center immediately.",
        severity: "high",
        priority: 1,
        confidence: 0.9,
        causal_pathway: ["Remote Geographic Location", "Limited Local Diagnostic Equipment", "Delayed Clinical Presentation", "Elevated Complication Risk"],
      });
    }

    // 6. Dietary + Biochemical Intersection (Fasting / Phytates)
    const fastingDiet = diet.find((f) => f.type === "fasting_metabolic_nutrition");
    const b12Bio = bio.find((f) => f.name.includes("B12") || f.name.includes("AMINO ACID"));
    if (fastingDiet && b12Bio) {
      intersections.push({
        type: "dietary_biochemical_fasting",
        strands: ["dietary", "biochemical"],
        description: "Prolonged vegan religious fasting intersects with endogenous hepatic Vitamin B12 stores and essential amino acid balance.",
        evidence: "Exclusion of animal source foods during fasting periods produces zero cobalamin intake and shifts reliance to plant protein combinations.",
        recommendation: "Ensure complementary legume combinations (Shiro + Teff) and consider fortified nutritional yeast or B12 supplementation during long fasts.",
        severity: "moderate",
        priority: 3,
        confidence: 0.93,
        causal_pathway: ["Orthodox Vegan Fasting (Tsome)", "Zero Dietary Cobalamin / Heme Iron", "Hepatic Store Mobilization", "Subclinical Nutrient Dip", "Need for Plant-Based Complementarity"],
      });
    }

    // 7. Cultural + Astrological Intersection (Domain B Reflection)
    if (cult.length > 0 && astro.length > 0) {
      intersections.push({
        type: "cultural_astrological_domain_b",
        strands: ["cultural", "astrological"],
        description: "Traditional Awde Negest constitutional balance complements cultural rhythms of communal coffee ceremonies and seasonal rest.",
        evidence: "Domain B Cultural Heritage Layer: Personal reflection on constitutional temperaments and community containment.",
        recommendation: "Reflect on traditional seasonal pacing and family/community support while following all modern clinical advice.",
        severity: "low",
        priority: 4,
        confidence: 0.85,
        causal_pathway: ["Awde Negest Elemental Lens", "Seasonal Climate Awareness", "Communal Coffee Gathering", "Holistic Emotional Peace"],
      });
    }

    return intersections.sort((a, b) => a.priority - b.priority);
  }
}
