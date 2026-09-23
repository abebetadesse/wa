export type RemedyDosageForm = "decoction" | "infusion" | "powder" | "tincture" | "poultice" | "paste" | "juice" | "chew" | "smoke" | "bath";
export type RemedyRoute = "oral" | "dermal" | "nasal" | "ocular" | "rectal" | "vaginal" | "inhalation";
export type RemedyEvidence = "oral" | "manuscript" | "ethnobotanical" | "in_vitro" | "in_vivo" | "Debral" | "traditional_only";

export interface MedicinalPlant {
  plantUid: string;
  scientificName: string;
  family?: string;
  commonNameEn: string;
  localNames: Record<string, string>;
  partsUsed: string[];
  habitat?: string;
  distributionEthiopia: string[];
  endemicStatus: "endemic" | "native" | "introduced" | "unknown";
  conservationStatus?: string;
  foodUid?: string;
  sourceUid: string;
  reviewStatus: "reviewed" | "pending" | "restricted";
}

export interface MedicinalUse {
  useUid: string;
  plantUid: string;
  locationUid: string;
  diseaseOrCondition: string;
  traditionalDiagnosis?: string;
  community: string;
  informantConsensus?: number;
  fidelityLevelPct?: number;
  useRank?: number;
  evidenceType: RemedyEvidence;
  sourceUid: string;
  sourceNote?: string;
}

export interface RemedyRecipe {
  recipeUid: string;
  plantUid: string;
  recipeName: string;
  recipeNameLocal?: string;
  dosageForm: RemedyDosageForm;
  partsUsed: string;
  freshOrDry: "fresh" | "dry" | "either";
  quantityPlantG?: number;
  solvent?: string;
  solventVolumeMl?: number;
  preparationSteps: Array<{ step: number; action: string; durationMin?: number; temperatureC?: number }>;
  totalPrepTimeMin?: number;
  route: RemedyRoute;
  doseAdult?: string;
  frequency?: string;
  durationDays?: number;
  contraindications: string[];
  toxicityNote?: string;
  sourceUid: string;
  sourceNote?: string;
  culturalReviewStatus: "approved_with_conditions" | "pending" | "restricted";
}

export interface RemedyIngredient {
  recipeUid: string;
  ingredientUid: string;
  ingredientType: "plant" | "food" | "mineral" | "animal" | "fermentation_product";
  role: "active" | "excipient" | "solvent" | "flavour" | "preservative" | "bioavailability_enhancer";
  quantity?: number;
  unit?: string;
}

export interface Phytochemical {
  compoundUid: string;
  compoundName: string;
  compoundClass: "alkaloid" | "flavonoid" | "terpenoid" | "phenolic" | "saponin" | "tannin" | "glycoside" | "coumarin" | "essential_oil" | "other";
  chebiId?: string;
  pubchemCid?: string;
  sourceUid: string;
}

export interface PlantCompound {
  plantUid: string;
  compoundUid: string;
  partUsed: string;
  concentrationValue?: number;
  concentrationUnit?: string;
  basis: "dry_matter" | "fresh_weight" | "extract" | "essential_oil";
  extractionMethod?: string;
  locationUid?: string;
  sourceUid: string;
  confidence: "high" | "medium" | "low" | "unknown";
}

export interface BotanicalCompositionProfile {
  profileUid: string;
  plantUid: string;
  partUsed: string;
  processingState: "fresh" | "dried" | "raw" | "cooked" | "roasted" | "fermented" | "extract";
  basis: "fresh_weight" | "dry_matter" | "extract";
  proximate: {
    moisturePct?: number;
    proteinGPer100g?: number;
    fatGPer100g?: number;
    carbohydrateGPer100g?: number;
    fibreGPer100g?: number;
    ashGPer100g?: number;
    energyKcalPer100g?: number;
  };
  minerals?: Record<string, { value?: number; unit: string }>;
  vitamins?: Record<string, { value?: number; unit: string }>;
  totalPhenolics?: { value?: number; unit: "mg GAE/100g" | "mg GAE/g" | "not_reported" };
  totalFlavonoids?: { value?: number; unit: "mg QE/100g" | "mg QE/g" | "not_reported" };
  sourceUid: string;
  citationNote: string;
  confidence: "high" | "medium" | "low" | "unknown";
  intendedUse: "human_food" | "traditional_reference" | "research_only";
}

export interface ActiveConstituentReference {
  recordUid: string;
  plantUid: string;
  partUsed: string;
  constituentName: string;
  constituentClass: Phytochemical["compoundClass"];
  reportedActivity?: string;
  concentration?: { value: number; unit: string };
  concentrationStatus: "measured_in_source" | "reported_variable" | "not_reported";
  evidenceLevel: RemedyEvidence;
  sourceUid: string;
  note: string;
}

export interface CompoundActivity {
  activityUid: string;
  compoundUid: string;
  activityType: "antimicrobial" | "antioxidant" | "anti_inflammatory" | "antimalarial" | "antidiabetic" | "antihypertensive" | "hepatoprotective" | "cytotoxic" | "immunomodulatory";
  targetOrPathway?: string;
  evidenceLevel: "in_vitro" | "in_vivo" | "Debral" | "traditional_only";
  sourceUid: string;
  note?: string;
}

export interface RemedyProcessingEffect {
  effectUid: string;
  recipeUid: string;
  compoundUid?: string;
  processingMethod: RemedyDosageForm | "boiling" | "drying" | "fermentation" | "smoking" | "calcination";
  effectOnCompound: "increase" | "decrease" | "unchanged" | "transform";
  effectPct?: number;
  toxicityChange: "decrease" | "increase" | "unchanged" | "unknown";
  evidenceLevel: RemedyEvidence;
  sourceUid: string;
}

export interface RemedySafetyRule {
  ruleUid: string;
  plantUid?: string;
  compoundUid?: string;
  ruleType: "contraindication" | "drug_interaction" | "pregnancy_warning" | "toxicity_threshold" | "max_duration";
  condition?: "pregnancy" | "lactation" | "liver_disease" | "kidney_disease" | "child_under_5";
  interactingDrugClass?: string;
  severity: "info" | "caution" | "warning" | "contraindicated";
  evidenceLevel: RemedyEvidence;
  sourceUid: string;
  message: string;
}

export interface CompoundActivity {
  activityUid: string;
  compoundUid: string;
  activityType: "antimicrobial" | "antioxidant" | "anti_inflammatory" | "antimalarial" | "antidiabetic" | "antihypertensive" | "hepatoprotective" | "cytotoxic" | "immunomodulatory";
  evidenceLevel: "in_vitro" | "in_vivo" | "Debral" | "traditional_only";
  sourceUid: string;
  note?: string;
}

export interface RemedyProcessingEffect {
  effectUid: string;
  recipeUid: string;
  compoundUid?: string;
  processingMethod: RemedyDosageForm | "boiling" | "drying" | "fermentation" | "smoking" | "calcination";
  effectOnCompound: "increase" | "decrease" | "unchanged" | "transform";
  effectPct?: number;
  toxicityChange: "decrease" | "increase" | "unchanged" | "unknown";
  evidenceLevel: RemedyEvidence;
  sourceUid: string;
}

export interface MedicinalFood {
  foodUid: string;
  plantUid?: string;
  isFunctionalFood: boolean;
  traditionalUse: string;
  therapeuticClaim?: string;
  safetyMargin?: number;
  sourceUid: string;
}

export interface ManuscriptRemedy {
  manuscriptUid: string;
  manuscriptTitle: string;
  sourceUid: string;
  pageOrFolio?: string;
  language: "Amharic" | "Ge'ez" | "English" | "unknown";
  plantIdentified?: string;
  plantIdentificationConfidence: "high" | "medium" | "low" | "unidentified";
  conditionTreated: string;
  preparationSummary?: string;
  modernInterpretation?: string;
  culturalReviewStatus: "pending" | "approved_with_conditions" | "restricted";
  rightsNote: string;
}

export interface MedicinalFood {
  foodUid: string;
  plantUid?: string;
  isFunctionalFood: boolean;
  traditionalUse: string;
  therapeuticClaim?: string;
  safetyMargin?: number;
  sourceUid: string;
}

export interface ManuscriptRemedy {
  manuscriptUid: string;
  manuscriptTitle: string;
  manuscriptTitleAm?: string;
  sourceUid: string;
  pageOrFolio?: string;
  language: "Amharic" | "Ge'ez" | "English" | "unknown";
  plantIdentified?: string;
  plantIdentificationConfidence: "high" | "medium" | "low" | "unidentified";
  conditionTreated: string;
  preparationSummary?: string;
  modernInterpretation?: string;
  culturalReviewStatus: "pending" | "approved_with_conditions" | "restricted";
  rightsNote: string;
}

export interface RemedySafetyCheckInput {
  plantUid: string;
  pregnancy?: boolean;
  lactation?: boolean;
  ageYears?: number;
  conditions?: string[];
  medicationClasses?: string[];
}

export const MEDICINAL_PLANTS: MedicinalPlant[] = [
  { plantUid: "urn:med:et:ensete-ventricosum", scientificName: "Ensete ventricosum", commonNameEn: "Enset", localNames: { sidama: "Wesse", amharic: "እንሰት" }, partsUsed: ["corm", "pseudostem"], distributionEthiopia: ["Sidama", "Southern Ethiopia"], endemicStatus: "native", foodUid: "urn:food:et:enset", sourceUid: "hawassa-zuria-ethnobotanical-study", reviewStatus: "pending" },
  { plantUid: "urn:med:et:eucalyptus-globulus", scientificName: "Eucalyptus globulus", commonNameEn: "Blue gum", localNames: { amharic: "ባሕር ዛፍ" }, partsUsed: ["leaf"], distributionEthiopia: ["Ethiopian highlands"], endemicStatus: "introduced", sourceUid: "hawassa-zuria-ethnobotanical-study", reviewStatus: "pending" },
  { plantUid: "urn:med:et:echinops-kebericho", scientificName: "Echinops kebericho", commonNameEn: "Kebericho", localNames: { amharic: "ከበርቾ" }, partsUsed: ["root"], distributionEthiopia: ["Ethiopia"], endemicStatus: "native", sourceUid: "ethiopian-phytochemical-review-2026", reviewStatus: "pending" },
  { plantUid: "urn:med:et:coffea-arabica", scientificName: "Coffea arabica", commonNameEn: "Coffee", localNames: { amharic: "ቡና", sidama: "Buna" }, partsUsed: ["bean", "leaf"], distributionEthiopia: ["Ethiopia"], endemicStatus: "native", foodUid: "urn:food:et:coffee", sourceUid: "ethiopian-phytochemical-review-2026", reviewStatus: "reviewed" },
  { plantUid: "urn:med:et:moringa-oleifera", scientificName: "Moringa oleifera", commonNameEn: "Moringa", localNames: { amharic: "ሽፈራው" }, partsUsed: ["leaf", "seed"], distributionEthiopia: ["Ethiopia"], endemicStatus: "introduced", foodUid: "urn:food:et:moringa", sourceUid: "ethiopian-ethnobotanical-surveys", reviewStatus: "pending" },
  { plantUid: "urn:med:et:nigella-sativa", scientificName: "Nigella sativa", commonNameEn: "Black cumin", localNames: { amharic: "ጥቁር አዝሙድ" }, partsUsed: ["seed"], distributionEthiopia: ["Ethiopia"], endemicStatus: "introduced", foodUid: "urn:food:et:nigella", sourceUid: "ethiopian-ethnobotanical-surveys", reviewStatus: "pending" },
  { plantUid: "urn:med:et:allium-sativum", scientificName: "Allium sativum", commonNameEn: "Garlic", localNames: { amharic: "ነጭ ሽንኩርት" }, partsUsed: ["bulb"], distributionEthiopia: ["Ethiopia"], endemicStatus: "introduced", sourceUid: "supplied-traditional-medicine-lists", reviewStatus: "pending" },
  { plantUid: "urn:med:et:aloe-vera", scientificName: "Aloe vera", commonNameEn: "Aloe", localNames: { amharic: "እሬት" }, partsUsed: ["leaf latex", "leaf gel"], distributionEthiopia: ["Ethiopia"], endemicStatus: "introduced", sourceUid: "supplied-traditional-medicine-lists", reviewStatus: "pending" },
  { plantUid: "urn:med:et:artemisia-annua", scientificName: "Artemisia annua", commonNameEn: "Annual wormwood", localNames: { amharic: "ጭቁኝ" }, partsUsed: ["aerial parts"], distributionEthiopia: ["Ethiopia"], endemicStatus: "introduced", sourceUid: "supplied-traditional-medicine-lists", reviewStatus: "pending" },
  { plantUid: "urn:med:et:zingiber-officinale", scientificName: "Zingiber officinale", commonNameEn: "Ginger", localNames: { amharic: "ዝንጅብል" }, partsUsed: ["rhizome"], distributionEthiopia: ["Ethiopia"], endemicStatus: "introduced", sourceUid: "supplied-traditional-medicine-lists", reviewStatus: "pending" },
];

export const MEDICINAL_USES: MedicinalUse[] = [
  { useUid: "use:hawassa:enset:placenta", plantUid: "urn:med:et:ensete-ventricosum", locationUid: "hawassa", diseaseOrCondition: "placenta delay", community: "Sidama", fidelityLevelPct: 87.27, useRank: 1, evidenceType: "ethnobotanical", sourceUid: "hawassa-zuria-ethnobotanical-study", sourceNote: "Traditional-use record; not Debral efficacy evidence." },
  { useUid: "use:hawassa:eucalyptus:stomach", plantUid: "urn:med:et:eucalyptus-globulus", locationUid: "hawassa", diseaseOrCondition: "stomachache", community: "Sidama", fidelityLevelPct: 100, evidenceType: "ethnobotanical", sourceUid: "hawassa-zuria-ethnobotanical-study", sourceNote: "Traditional-use record; not a treatment recommendation." },
];

export const REMEDY_RECIPES: RemedyRecipe[] = [
  { recipeUid: "urn:rem:et:hawassa:enset-placenta-001", plantUid: "urn:med:et:ensete-ventricosum", recipeName: "Enset corm traditional decoction", recipeNameLocal: "Traditional Sidama preparation", dosageForm: "decoction", partsUsed: "corm", freshOrDry: "fresh", quantityPlantG: 200, solvent: "water", solventVolumeMl: 500, preparationSteps: [{ step: 1, action: "Peel and wash the fresh corm" }, { step: 2, action: "Cut into small pieces" }, { step: 3, action: "Boil in water", durationMin: 30 }, { step: 4, action: "Strain and cool" }], totalPrepTimeMin: 40, route: "oral", doseAdult: "Historical source description only; do not self-administer.", frequency: "Not validated for Debral use", durationDays: 1, contraindications: ["Pregnancy, postpartum emergency, or retained placenta requires urgent qualified medical care."], toxicityNote: "Raw enset may contain antinutritional factors; safety and efficacy are not established.", sourceUid: "hawassa-zuria-ethnobotanical-study", sourceNote: "Indexed traditional-use record, not a validated prescription.", culturalReviewStatus: "pending" },
  { recipeUid: "urn:rem:et:hawassa:enset-wound-001", plantUid: "urn:med:et:ensete-ventricosum", recipeName: "Enset pseudostem topical paste", dosageForm: "paste", partsUsed: "pseudostem", freshOrDry: "fresh", preparationSteps: [{ step: 1, action: "Remove outer sheath" }, { step: 2, action: "Scrape inner pulp" }, { step: 3, action: "Pound into paste" }], totalPrepTimeMin: 15, route: "dermal", doseAdult: "Historical description only; do not apply to open or infected wounds without Debral advice.", frequency: "Not validated", contraindications: ["Open, deep, infected, or bleeding wounds require Debral assessment."], sourceUid: "hawassa-zuria-ethnobotanical-study", sourceNote: "Traditional-use record; safety review pending.", culturalReviewStatus: "pending" },
];

export const PHYTOCHEMICALS: Phytochemical[] = [
  { compoundUid: "urn:pc:et:caffeine", compoundName: "Caffeine", compoundClass: "alkaloid", sourceUid: "ethiopian-phytochemical-review-2026" },
  { compoundUid: "urn:pc:et:chlorogenic-acids", compoundName: "Chlorogenic acids", compoundClass: "phenolic", sourceUid: "ethiopian-phytochemical-review-2026" },
  { compoundUid: "urn:pc:et:dehydrocostus-lactone", compoundName: "Dehydrocostus lactone", compoundClass: "terpenoid", sourceUid: "ethiopian-phytochemical-review-2026" },
];

export const PLANT_COMPOUNDS: PlantCompound[] = [
  { plantUid: "urn:med:et:coffea-arabica", compoundUid: "urn:pc:et:caffeine", partUsed: "bean", concentrationValue: 0.78, concentrationUnit: "%", basis: "dry_matter", sourceUid: "ethiopian-phytochemical-review-2026", confidence: "low" },
  { plantUid: "urn:med:et:coffea-arabica", compoundUid: "urn:pc:et:chlorogenic-acids", partUsed: "bean", concentrationValue: 3.29, concentrationUnit: "%", basis: "dry_matter", sourceUid: "ethiopian-phytochemical-review-2026", confidence: "low" },
];

export const BOTANICAL_COMPOSITION_PROFILES: BotanicalCompositionProfile[] = [
  {
    profileUid: "composition:coffee:green-bean",
    plantUid: "urn:med:et:coffea-arabica",
    partUsed: "bean",
    processingState: "raw",
    basis: "dry_matter",
    proximate: {},
    totalPhenolics: { unit: "not_reported" },
    totalFlavonoids: { unit: "not_reported" },
    sourceUid: "ethiopian-phytochemical-review-2026",
    citationNote: "The supplied reference identifies coffee and named constituents but does not provide a validated proximate or total-phenolic laboratory value for this sample.",
    confidence: "unknown",
    intendedUse: "research_only",
  },
  {
    profileUid: "composition:enset:corm",
    plantUid: "urn:med:et:ensete-ventricosum",
    partUsed: "corm",
    processingState: "fresh",
    basis: "fresh_weight",
    proximate: {},
    totalPhenolics: { unit: "not_reported" },
    totalFlavonoids: { unit: "not_reported" },
    sourceUid: "hawassa-zuria-ethnobotanical-study",
    citationNote: "Ethnobotanical source records traditional use; it does not establish a measured food-composition or active-constituent profile.",
    confidence: "unknown",
    intendedUse: "traditional_reference",
  },
  {
    profileUid: "composition:moringa:leaf",
    plantUid: "urn:med:et:moringa-oleifera",
    partUsed: "leaf",
    processingState: "dried",
    basis: "dry_matter",
    proximate: {},
    totalPhenolics: { unit: "not_reported" },
    totalFlavonoids: { unit: "not_reported" },
    sourceUid: "ethiopian-ethnobotanical-surveys",
    citationNote: "The supplied list names Moringa and its traditional use, but no assay values are included. Laboratory results must be added with a sample, method, and citation.",
    confidence: "unknown",
    intendedUse: "research_only",
  },
  {
    profileUid: "composition:garlic:bulb",
    plantUid: "urn:med:et:allium-sativum",
    partUsed: "bulb",
    processingState: "raw",
    basis: "fresh_weight",
    proximate: {},
    totalPhenolics: { unit: "not_reported" },
    totalFlavonoids: { unit: "not_reported" },
    sourceUid: "supplied-traditional-medicine-lists",
    citationNote: "The supplied inventory identifies garlic and traditional uses but contains no sample-specific proximate, phenolic, flavonoid, or mineral assay.",
    confidence: "unknown",
    intendedUse: "research_only",
  },
  {
    profileUid: "composition:aloe:leaf-gel",
    plantUid: "urn:med:et:aloe-vera",
    partUsed: "leaf gel",
    processingState: "fresh",
    basis: "fresh_weight",
    proximate: {},
    totalPhenolics: { unit: "not_reported" },
    totalFlavonoids: { unit: "not_reported" },
    sourceUid: "supplied-traditional-medicine-lists",
    citationNote: "The supplied inventory identifies aloe and traditional uses but contains no validated composition assay or standardized processing definition.",
    confidence: "unknown",
    intendedUse: "research_only",
  },
  {
    profileUid: "composition:ginger:rhizome",
    plantUid: "urn:med:et:zingiber-officinale",
    partUsed: "rhizome",
    processingState: "raw",
    basis: "fresh_weight",
    proximate: {},
    totalPhenolics: { unit: "not_reported" },
    totalFlavonoids: { unit: "not_reported" },
    sourceUid: "supplied-traditional-medicine-lists",
    citationNote: "The supplied inventory identifies ginger and plant part but contains no measured proximate, phenolic, flavonoid, or active-constituent value.",
    confidence: "unknown",
    intendedUse: "research_only",
  },
];

export const ACTIVE_CONSTITUENT_REFERENCES: ActiveConstituentReference[] = [
  {
    recordUid: "active:coffee:caffeine",
    plantUid: "urn:med:et:coffea-arabica",
    partUsed: "bean",
    constituentName: "Caffeine",
    constituentClass: "alkaloid",
    reportedActivity: "Stimulant activity reported in pharmacology literature",
    concentration: { value: 0.78, unit: "% dry matter" },
    concentrationStatus: "measured_in_source",
    evidenceLevel: "traditional_only",
    sourceUid: "ethiopian-phytochemical-review-2026",
    note: "A concentration from the existing low-confidence app record; it is not a therapeutic dose or recommendation.",
  },
  {
    recordUid: "active:coffee:chlorogenic-acids",
    plantUid: "urn:med:et:coffea-arabica",
    partUsed: "bean",
    constituentName: "Chlorogenic acids",
    constituentClass: "phenolic",
    reportedActivity: "Antioxidant activity reported in in-vitro literature",
    concentration: { value: 3.29, unit: "% dry matter" },
    concentrationStatus: "measured_in_source",
    evidenceLevel: "in_vitro",
    sourceUid: "ethiopian-phytochemical-review-2026",
    note: "In-vitro activity does not establish Debral efficacy.",
  },
  {
    recordUid: "active:moringa:polyphenols",
    plantUid: "urn:med:et:moringa-oleifera",
    partUsed: "leaf",
    constituentName: "Polyphenols",
    constituentClass: "phenolic",
    reportedActivity: "Reported antioxidant constituent class",
    concentrationStatus: "not_reported",
    evidenceLevel: "traditional_only",
    sourceUid: "supplied-traditional-medicine-lists",
    note: "The supplied reference does not provide a concentration or compound-specific assay.",
  },
  {
    recordUid: "active:nigella:thymoquinone",
    plantUid: "urn:med:et:nigella-sativa",
    partUsed: "seed",
    constituentName: "Thymoquinone",
    constituentClass: "other",
    reportedActivity: "Compound reported in Nigella seed research",
    concentrationStatus: "not_reported",
    evidenceLevel: "traditional_only",
    sourceUid: "supplied-traditional-medicine-lists",
    note: "Presence and concentration vary by cultivar, origin, extraction, and analytical method; no value was supplied.",
  },
  {
    recordUid: "active:garlic:organosulfur",
    plantUid: "urn:med:et:allium-sativum",
    partUsed: "bulb",
    constituentName: "Organosulfur compounds",
    constituentClass: "other",
    reportedActivity: "Compound class reported in garlic research",
    concentrationStatus: "not_reported",
    evidenceLevel: "traditional_only",
    sourceUid: "supplied-traditional-medicine-lists",
    note: "The supplied list does not identify a compound-specific assay or concentration.",
  },
  {
    recordUid: "active:aloe:anthraquinones",
    plantUid: "urn:med:et:aloe-vera",
    partUsed: "leaf latex",
    constituentName: "Anthraquinones",
    constituentClass: "other",
    reportedActivity: "Constituent class reported for Aloe latex",
    concentrationStatus: "not_reported",
    evidenceLevel: "traditional_only",
    sourceUid: "supplied-traditional-medicine-lists",
    note: "Leaf latex and leaf gel are different materials; no concentration or safety threshold was supplied.",
  },
  {
    recordUid: "active:ginger:gingerols",
    plantUid: "urn:med:et:zingiber-officinale",
    partUsed: "rhizome",
    constituentName: "Gingerols",
    constituentClass: "phenolic",
    reportedActivity: "Phenolic constituent class reported in ginger research",
    concentrationStatus: "not_reported",
    evidenceLevel: "traditional_only",
    sourceUid: "supplied-traditional-medicine-lists",
    note: "Concentration depends on cultivar, maturity, drying, and extraction; no value was supplied.",
  },
];

export const COMPOUND_ACTIVITIES: CompoundActivity[] = [
  { activityUid: "activity:caffeine:traditional", compoundUid: "urn:pc:et:caffeine", activityType: "antioxidant", evidenceLevel: "traditional_only", sourceUid: "ethiopian-phytochemical-review-2026", note: "Compound activity does not establish a therapeutic indication." },
  { activityUid: "activity:chlorogenic:in-vitro", compoundUid: "urn:pc:et:chlorogenic-acids", activityType: "antioxidant", evidenceLevel: "in_vitro", sourceUid: "ethiopian-phytochemical-review-2026", note: "In-vitro evidence is not Debral efficacy." },
];

export const REMEDY_PROCESSING_EFFECTS: RemedyProcessingEffect[] = [
  { effectUid: "effect:enset:boiling", recipeUid: "urn:rem:et:hawassa:enset-placenta-001", processingMethod: "boiling", effectOnCompound: "decrease", toxicityChange: "unknown", evidenceLevel: "traditional_only", sourceUid: "safety-governance-review" },
];

export const MEDICINAL_FOODS: MedicinalFood[] = [
  { foodUid: "urn:food:et:coffee", plantUid: "urn:med:et:coffea-arabica", isFunctionalFood: false, traditionalUse: "Beverage and cultural food use; medicinal claims require separate evidence.", sourceUid: "ethiopian-phytochemical-review-2026" },
];

export const MANUSCRIPT_REMEDIES: ManuscriptRemedy[] = [
  { manuscriptUid: "urn:ms:local:metsehafe-fewus", manuscriptTitle: "መጽሐፈ ፈውስ", sourceUid: "local-manuscript-metsehafe-fewus", language: "Amharic", plantIdentificationConfidence: "unidentified", conditionTreated: "Multiple manuscript-described conditions", preparationSummary: "OCR-derived navigation record only; detailed recipe interpretation is withheld pending transcription and cultural review.", culturalReviewStatus: "pending", rightsNote: "Full text and operational remedy instructions require rights-holder and cultural-custodian approval." },
];

export const REMEDY_SAFETY_RULES: RemedySafetyRule[] = [
  { ruleUid: "safety:enset:pregnancy", plantUid: "urn:med:et:ensete-ventricosum", ruleType: "pregnancy_warning", condition: "pregnancy", severity: "contraindicated", evidenceLevel: "traditional_only", sourceUid: "safety-governance-review", message: "Do not use a traditional remedy in pregnancy without Debrian review." },
  { ruleUid: "safety:enset:child", plantUid: "urn:med:et:ensete-ventricosum", ruleType: "contraindication", condition: "child_under_5", severity: "warning", evidenceLevel: "traditional_only", sourceUid: "safety-governance-review", message: "Child use requires Debrian review; dose and toxicity are not established." },
];

export function checkRemedySafety(input: RemedySafetyCheckInput): RemedySafetyRule[] {
  return REMEDY_SAFETY_RULES.filter((rule) => rule.plantUid === input.plantUid && (
    (rule.condition === "pregnancy" && input.pregnancy) ||
    (rule.condition === "lactation" && input.lactation) ||
    (rule.condition === "child_under_5" && input.ageYears !== undefined && input.ageYears < 5) ||
    (rule.condition && input.conditions?.includes(rule.condition))
  ));
}
