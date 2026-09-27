import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface NutritionBiochemistryOutput {
  cerealGlycemicDynamics: string;
  fermentationBiochemistry: string;
  lipidMetabolismNotes: string;
  micronutrientInteractions: string;
  clinicalBiomarkers: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-BIOMED-BIOCHEM-01",
    title: "Starch Hydrolysis Rate and Glycemic Index of Ethiopian Teff Varieties",
    type: "paper",
    citation: "Abebe, Y. et al. (2007). Glycemic index and insulin response to traditional Ethiopian foods. European Journal of Clinical Nutrition.",
    year: 2007,
  },
  {
    id: "ETH-BIOMED-PHYTATE-02",
    title: "Phytate Degradation during Sourdough Fermentation of Teff (Eragrostis tef)",
    type: "paper",
    citation: "Boka, B. et al. (2013). Degradation of phytate in teff flour by lactic acid bacteria. International Journal of Food Microbiology.",
    year: 2013,
  },
];

export const nutritionBiochemistryPillar: Pillar<unknown, NutritionBiochemistryOutput> = {
  id: "biomedical.nutritionBiochemistry",
  version: "1.0.0",
  domain: "biomedical",
  audience: "professional",
  requires: ["location.agroEcological"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<NutritionBiochemistryOutput>> {
    return {
      pillarId: "biomedical.nutritionBiochemistry",
      version: "1.0.0",
      domain: "biomedical",
      audience: "professional",
      confidence: "high",
      data: {
        cerealGlycemicDynamics: "Eragrostis tef contains a high amylose-to-amylopectin ratio and slowly digestible starch (SDS), producing an attenuated postprandial glucose spike compared to refined wheat/rice. Fermentation lowers glycemic index from 68 to approximately 52.",
        fermentationBiochemistry: "Natural microbial succession (Lactobacillus fermentum, L. plantarum, and yeasts) drops dough pH from 6.2 to 3.8 within 48h. This acidic microenvironment provides optimal kinetic conditions for endogenous phytase (optimum pH 4.5-5.0), degrading myo-inositol hexakisphosphate (IP6) into lower inositol phosphates (IP1-IP3), which do not chelate divalent cations.",
        lipidMetabolismNotes: "Niter kibbeh clarified butter provides short- and medium-chain fatty acids (butyrate, caprylate), but excessive consumption in sedentary urban clients elevates LDL-C and ApoB. High-altitude pastoralists demonstrate higher lipolytic clearance.",
        micronutrientInteractions: "High polyphenol and tannin concentration in dark teff varieties can inhibit non-heme iron absorption if consumed concurrently with unfermented tannin-rich beverages (strong highland coffee/tea). Ascorbic acid co-ingestion counteracts this inhibition.",
        clinicalBiomarkers: [
          "Serum Ferritin & Total Iron Binding Capacity (TIBC)",
          "Serum Zinc (fasting morning plasma zinc)",
          "HbA1c & Fasting Plasma Glucose (FPG)",
          "Lipid Panel (TC, HDL-C, LDL-C, Triglycerides)",
        ],
      },
      provenance,
    };
  },
  provenance,
};
