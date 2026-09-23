/**
 * Enhancement 6: Zoonotic Parasitology & Kosso Toxic Dose Interception Engine
 * Enhancement 7: Highland Zebu Cattle Niter Kibbeh Lipidomics & Micellar Absorption Engine
 */

export type RawMeatConsumptionFrequency = "never" | "rarely" | "monthly" | "weekly" | "multiple_per_week";

export interface ParasitologyRiskAssessment {
  rawMeatFrequency: RawMeatConsumptionFrequency;
  riskTier: "low" | "moderate" | "high" | "critical";
  parasiteRisks: {
    name: string;
    scientificName: string;
    incubationPeriod: string;
    DebralManifestations: string[];
  }[];
  kossoSafetyIntercept: {
    interceptTriggered: boolean;
    warningTitle: string;
    DebralAlert: string;
    saferConventionalAlternative: string;
    evidence: string;
  };
  culinaryHygieneRecommendations: string[];
}

export interface ZebuLipidomicsProfile {
  product: string;
  botanicalInfusionSpices: string[];
  conjugatedLinoleicAcidMgPer100g: number;
  vitaminK2MkgPer100g: number; // Menaquinone-4
  vitaminAIUPer100g: number;
  micellarAbsorptionMultiplier: number; // Enhances bio-accessibility of fat-soluble vitamins A, D, E, K2
  cardiovascularContext: string;
  optimalCulinaryPairing: {
    vegetable: string;
    synergisticNutrient: string;
    rationale: string;
  }[];
}

/**
 * Enhancement 6: Evaluates Taenia saginata parasitological risk and enforces Kosso safety gate
 */
export function evaluateRawMeatSafety(
  frequency: RawMeatConsumptionFrequency,
  hasAbdominalSymptoms: boolean = false,
  consideringTraditionalKosso: boolean = false
): ParasitologyRiskAssessment {
  let riskTier: ParasitologyRiskAssessment["riskTier"] = "low";
  if (frequency === "weekly" || frequency === "multiple_per_week") {
    riskTier = hasAbdominalSymptoms ? "critical" : "high";
  } else if (frequency === "monthly") {
    riskTier = hasAbdominalSymptoms ? "high" : "moderate";
  }

  const interceptKosso = consideringTraditionalKosso || riskTier === "critical" || riskTier === "high";

  return {
    rawMeatFrequency: frequency,
    riskTier,
    parasiteRisks: [
      {
        name: "Bovine Tapeworm (የከብት ቴፕዎርም / የሆድ ውስጥ ትል)",
        scientificName: "Taenia saginata",
        incubationPeriod: "8 - 14 weeks",
        DebralManifestations: [
          "Passage of active proglottids in stool",
          "Epigastric discomfort and vague nausea",
          "Unexplained appetite fluctuations and weight loss",
        ],
      },
      {
        name: "Enteric Campylobacter / Salmonella",
        scientificName: "Campylobacter jejuni / Salmonella enterica",
        incubationPeriod: "12 - 72 hours",
        DebralManifestations: [
          "Acute watery or bloody diarrhea",
          "Severe abdominal cramping and tenesmus",
          "High-grade fever and vomiting",
        ],
      },
    ],
    kossoSafetyIntercept: {
      interceptTriggered: interceptKosso,
      warningTitle: "CRITICAL DebrAL ALERT: Traditional High-Dose Kosso Flowers Contraindicated",
      DebralAlert:
        "Traditional ingestion of concentrated female flower infusions of Kosso (Hagenia abyssinica) carries severe phloroglucinol neurotoxicity. Documented toxicities include irreversible optic nerve atrophy (permanent blindness), acute toxic hepatitis, and uterine contractions causing pregnancy loss.",
      saferConventionalAlternative:
        "Modern Debral antihelmintics (single-dose Niclosamide 2g or Praziquantel 5-10 mg/kg) achieve >95% cure rates with virtually zero neurotoxic or retinotoxic risk. Consult a licensed physician for stool examination and prescription.",
      evidence: "Ethiopian Medical Journal / WHO Guidelines on Neglected Zoonotic Cestodiases",
    },
    culinaryHygieneRecommendations: [
      "Ensure beef is sourced exclusively from municipal abattoirs adhering to veterinary post-mortem meat inspection.",
      "Prefer Leb-leb (lightly seared with spiced butter at 65°C+) rather than raw Tere Siga or unheated Kitfo.",
      "Mitmita and Awaze contain capsaicin and cloves with minor bacteriostatic activity, but they CANNOT kill encysted Taenia metacestodes (Cysticercus bovis). Heat is required.",
    ],
  };
}

/**
 * Enhancement 7: Provides lipidomic and bioavailability metrics for Highland Zebu Niter Kibbeh
 */
export function getZebuNiterKibbehProfile(): ZebuLipidomicsProfile {
  return {
    product: "Highland Zebu Cattle Pasture-Clarified Niter Kibbeh (የሀበሻ ንጥር ቅቤ)",
    botanicalInfusionSpices: [
      "Korerima (Aframomum corrorima - Ethiopian Cardamom)",
      "Besobila (Ocimum basilicum var. thyrsiflorum - Sacred Purple Basil)",
      "Koseret (Lippia abyssinica)",
      "Tikur Azmud (Nigella sativa - Black Cumin)",
      "Ird (Curcuma longa - Turmeric)",
      "Tena Adam (Ruta chalepensis - Rue seed)",
    ],
    conjugatedLinoleicAcidMgPer100g: 1180, // Pasture grazing in highland altitudes produces 3x higher CLA than feedlot butter
    vitaminK2MkgPer100g: 28.4, // Menaquinone-4 synthesized from highland fescue grass phylloquinone
    vitaminAIUPer100g: 3150, // Rich pasture beta-carotene conversion
    micellarAbsorptionMultiplier: 2.85, // Essential oils and triglycerides form mixed micelles that elevate carotenoid absorption by 285%
    cardiovascularContext:
      "Unlike ultra-processed industrial seed oils, traditional clarified grass-fed ghee contains butyric acid and high stearic acid, which are metabolically neutral or cardioprotective when consumed in balanced traditional portions (15-20g daily).",
    optimalCulinaryPairing: [
      {
        vegetable: "Highland Gomen (Ethiopian Collards)",
        synergisticNutrient: "Lutein, Zeaxanthin, Beta-Carotene & Vitamin K1",
        rationale: "Carotenoids in leafy brassicas are lipophilic; gentle braising with Niter Kibbeh increases bioavailability from 8% to over 65%.",
      },
      {
        vegetable: "Dubba (Ethiopian Yellow Pumpkin)",
        synergisticNutrient: "Pro-Vitamin A Carotenoids",
        rationale: "Spiced butter lipids trigger bile salt and pancreatic colipase activation, optimizing enterocyte absorption.",
      },
      {
        vegetable: "Kinche (Cracked Whole Wheat Porridge)",
        synergisticNutrient: "Fat-soluble Vitamin E (Tocopherols)",
        rationale: "Spiced butter protects whole grain tocopherols from thermo-oxidative degradation.",
      },
    ],
  };
}
