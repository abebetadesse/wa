/**
 * Enhancement 8: Tazma Mar (የታዝማ ማር) Subterranean Stingless Bee Apitherapy Engine
 *
 * Distinct from European or African honeybee (Apis mellifera) honey, Ethiopian Tazma Mar is produced by
 * subterranean stingless bees (Meliponula spp.) that nest inside underground cavities and termite mounds.
 * It features a high trehalulose content, low glycemic response, high natural acidity (pH 3.2),
 * and potent broad-spectrum inhibine antimicrobial activity.
 */

export interface TazmaBiochemicalProfile {
  productNameAmharic: string;
  beeSpecies: string;
  nestingHabitat: string;
  glycemicIndex: number; // ~35 (versus 60-80 for standard honey)
  predominantBioactiveDisaccharide: string; // Trehalulose
  trehaluloseContentPct: number; // 35 - 55% of total sugars
  pH: number; // Highly acidic (3.1 - 3.6), suppressing bacterial proliferation
  moistureContentPct: number; // Naturally higher fluidity (24-28%)
  antimicrobialMechanism: string;
  phenolicAntioxidantScoreUmomTEPerG: number;
  therapeuticApplications: {
    indication: string;
    indicationAmharic: string;
    suggestedRegimen: string;
    mechanismOfAction: string;
  }[];
  precautions: string[];
}

export function getTazmaApitherapyProfile(): TazmaBiochemicalProfile {
  return {
    productNameAmharic: "የታዝማ ማር (Tazma Subterranean Stingless Bee Honey)",
    beeSpecies: "Meliponula erythra / Meliponula bocandei (Indigenous subterranean stingless bees)",
    nestingHabitat: "Subterranean clay burrows, decaying tree root vaults, and abandoned macrotermes mounds (Gojjam, Keffa, Wollega)",
    glycemicIndex: 35,
    predominantBioactiveDisaccharide: "Trehalulose (alpha-D-glucopyranosyl-1,1-D-fructose)",
    trehaluloseContentPct: 42.5,
    pH: 3.3,
    moistureContentPct: 26.2,
    antimicrobialMechanism:
      "Sustained generation of inhibine (enzymatic hydrogen peroxide via glucose oxidase) paired with plant-derived flavonoids from forest propolis and hyper-osmotic antibacterial acidity.",
    phenolicAntioxidantScoreUmomTEPerG: 840,
    therapeuticApplications: [
      {
        indication: "Chronic Bronchitis, Asthma & Persistent Spasmodic Cough",
        indicationAmharic: "ለአስም፣ ለስርዓተ ትንፋሽ መታወክ እና ለደረቅ ሳል ማስታገሻ",
        suggestedRegimen: "1 teaspoon (5ml) taken undiluted sublingually 3 times daily; allow slow mucosal coating before swallowing.",
        mechanismOfAction:
          "High osmolarity draws mucosal exudate while trehalulose and propolis flavonoids down-regulate pro-inflammatory cytokines (IL-6, TNF-alpha) in bronchial tissue.",
      },
      {
        indication: "Peptic Ulcer Disease & Helicobacter pylori Adjuvant Support",
        indicationAmharic: "የጨጓራ ቁስለትና ባክቴሪያ (H. pylori) መከላከል",
        suggestedRegimen: "1 teaspoon (5ml) dissolved in 50ml lukewarm water 30 minutes before breakfast on an empty stomach.",
        mechanismOfAction:
          "Demonstrates direct bactericidal activity against H. pylori strains while stimulating gastric mucosal microcirculation and endogenous prostaglandin E2 synthesis.",
      },
      {
        indication: "Diabetic-Friendly Glycemic Sustenance (Low GI)",
        indicationAmharic: "ዝቅተኛ የስኳር መጠን ላላቸውና የስኳር ታማሚዎች ተስማሚ የተፈጥሮ ማጣፈጫ",
        suggestedRegimen: "Use as sole sweetener (maximum 10-15g daily) within prescribed carbohydrate allowance.",
        mechanismOfAction:
          "Trehalulose is digested up to 3 times slower in the small intestine than sucrose or maltose, attenuating rapid post-prandial blood glucose and insulin spikes.",
      },
    ],
    precautions: [
      "Contraindicated in infants under 12 months of age due to universal infant botulism risks associated with raw apiculture products.",
      "Individuals with severe known hymenoptera venom or propolis allergies should perform an epidermal patch test before oral administration.",
      "Store in opaque glass containers at room temperature; boiling or heating above 40°C denatures delicate glucose oxidase and diastase enzymes.",
    ],
  };
}
