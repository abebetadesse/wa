import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface EndemicFloraOutput {
  regionFlora: Array<{
    name: string;
    amharic: string;
    scientificName: string;
    traditionalUse: string;
    ecologicalNiche: string;
    safetyPrecaution: string;
  }>;
  conservationStatus: string;
}

const provenance: SourceRef[] = [
  {
    id: "ETH-FLORA-HERBARIUM-01",
    title: "Flora of Ethiopia and Eritrea, Volumes 1-8",
    type: "paper",
    citation: "Hedberg, I. & Edwards, S. (eds.) (1989-2009). The National Herbarium, Addis Ababa University.",
    year: 2009,
  },
  {
    id: "ETH-FLORA-TRADMED-02",
    title: "Medicinal Plants of the Ethiopian Flora: Bioactivity and Safety Profiles",
    type: "paper",
    citation: "Dagne, E. (2011). Natural Database for Africa (NDA). Department of Chemistry, Addis Ababa University.",
    year: 2011,
  },
];

export const endemicFloraPillar: Pillar<unknown, EndemicFloraOutput> = {
  id: "ecological.endemicFlora",
  version: "1.0.0",
  domain: "ecological",
  audience: "both",
  requires: ["location.agroEcological"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<EndemicFloraOutput>> {
    const isHighland = ctx.agroEcological === "highland";
    const isLowland = ctx.agroEcological === "lowland" || ctx.agroEcological === "desert";

    const flora = [
      {
        name: "Tena Adam",
        amharic: "ጤና አዳም",
        scientificName: "Ruta chalepensis",
        traditionalUse: "Infusion in coffee for digestive colic, tension headaches, and soothing common cold chills",
        ecologicalNiche: "Grown abundantly in homegardens across 1800m - 2800m altitude",
        safetyPrecaution: "Uterotonic; strictly contraindicated during pregnancy and when taking prescription anticoagulants",
      },
      {
        name: "Damakesse",
        amharic: "ዳማከሴ",
        scientificName: "Ocimum lamiifolium",
        traditionalUse: "Crushed fresh leaf steam inhalation for febrile colds, sinus congestion, and tension headaches",
        ecologicalNiche: "Abundant perennial sub-shrub in midland and highland home borders",
        safetyPrecaution: "Causes additive hypotensive relaxation; caution with blood pressure medications",
      },
      {
        name: "Tikur Azmud",
        amharic: "ጥቁር አዝሙድ",
        scientificName: "Nigella sativa",
        traditionalUse: "Powdered seeds blended with honey for digestive warmth, respiratory relief, and immune support",
        ecologicalNiche: "Cultivated in highland and midland agricultural parcels",
        safetyPrecaution: "Hypoglycemic additive effect; monitor blood sugar if diabetic",
      },
    ];

    if (isHighland) {
      flora.push({
        name: "Kosso",
        amharic: "ኮሶ",
        scientificName: "Hagenia abyssinica",
        traditionalUse: "Female flower decoction historically taken as an anthelmintic for tapeworm",
        ecologicalNiche: "Native highland Afromontane canopy tree above 2400m",
        safetyPrecaution: "High toxicity risk: severe gastrointestinal mucosal irritation, hepatotoxicity, and pregnancy contraindication",
      });
    }

    if (isLowland) {
      flora.push({
        name: "Etse-Menahe (Frankincense tree)",
        amharic: "ዕጣን ዛፍ",
        scientificName: "Boswellia papyrifera",
        traditionalUse: "Aromatic gum resin burned for air purification, calming meditation, and soothing respiratory irritation",
        ecologicalNiche: "Dry deciduous woodland on rocky lowland slopes",
        safetyPrecaution: "Use natural unadulterated gum; avoid inhaling synthetic perfumed blends",
      });
    }

    return {
      pillarId: "ecological.endemicFlora",
      version: "1.0.0",
      domain: "ecological",
      audience: "both",
      confidence: "high",
      data: {
        regionFlora: flora,
        conservationStatus: "Kosso (Hagenia abyssinica) and Frankincense (Boswellia papyrifera) are protected highland/lowland species requiring sustainable wildcrafting practices.",
      },
      provenance,
    };
  },
  provenance,
};
