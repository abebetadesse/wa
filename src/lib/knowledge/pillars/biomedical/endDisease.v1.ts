import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface EndemicDiseaseOutput {
  endemicProfile: string[];
  geospatialEtiology: Array<{
    disease: string;
    prevalenceContext: string;
    biomedicalMechanism: string;
    screeningRecommendations: string;
  }>;
}

const provenance: SourceRef[] = [
  {
    id: "ETH-BIOMED-ENDEMIC-01",
    title: "Mapping and Surveillance of Neglected Tropical Diseases in Ethiopia",
    type: "paper",
    citation: "Deribe, K. et al. (2018). Mapping the geographic distribution of podoconiosis in Ethiopia. Lancet Global Health.",
    year: 2018,
  },
  {
    id: "ETH-BIOMED-MALARIA-02",
    title: "Malaria Stratification and Transmission Dynamics across Altitude Gradients in Ethiopia",
    type: "dataset",
    citation: "Ethiopian Ministry of Health, National Malaria Strategic Plan & Transmission Maps.",
    year: 2021,
  },
];

export const endemicDiseasePillar: Pillar<unknown, EndemicDiseaseOutput> = {
  id: "biomedical.endemicDisease",
  version: "1.0.0",
  domain: "biomedical",
  audience: "both",
  requires: ["location.endemicDiseases", "location.altitudeBand"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<EndemicDiseaseOutput>> {
    const diseases = ctx.endemicDiseases || [];
    const etiology: EndemicDiseaseOutput["geospatialEtiology"] = [];

    if (diseases.includes("podoconiosis") || ctx.agroEcological === "highland") {
      etiology.push({
        disease: "Podoconiosis (Non-filarial endemic elephantiasis)",
        prevalenceContext: "Highland volcanic red clay soil areas (>1500m elevation with >1000mm annual rainfall).",
        biomedicalMechanism: "Sub-micron mineral particles (silicon, aluminum, iron, titanium) penetrate bare foot epidermis, are engulfed by subcapsular macrophages in regional lymphatics, causing progressive obliterative endolymphangitis and irreversible lymphedema.",
        screeningRecommendations: "Annual lower-limb dermatological examination; hygiene education with 1% dilute bleach foot soaks, emollient application, and consistent protective footwear.",
      });
    }

    if (diseases.includes("malaria") || ctx.altitudeBand === "<1500" || ctx.altitudeBand === "1500-2300") {
      etiology.push({
        disease: "Plasmodium falciparum & P. vivax Malaria",
        prevalenceContext: "Midland and Lowland elevations (<2000m) following seasonal Belg and Kiremt rain pooling.",
        biomedicalMechanism: "Anopheles arabiensis vector bites; intraerythrocytic schizogony inducing pyrogenic cytokine cascade (TNF-alpha, IL-1, IL-6), hemolysis, microvascular sequestration, and organ hypoxia.",
        screeningRecommendations: "Immediate rapid diagnostic test (RDT) or Giemsa-stained peripheral blood smear for any acute fever above 38.0°C in an endemic zone.",
      });
    }

    if (diseases.includes("dental_fluorosis") || ctx.agroEcological === "rift-valley") {
      etiology.push({
        disease: "Endemic Fluorosis (Dental & Skeletal)",
        prevalenceContext: "Central Ethiopian Rift Valley lake basin volcanic aquifer wells (fluoride > 1.5 mg/L, frequently exceeding 8.0 mg/L).",
        biomedicalMechanism: "Excessive systemic fluoride ion incorporates into developing hydroxyapatite crystalline lattice to form friable fluorapatite, causing severe enamel mottling, subchondral sclerosis, and spinal ligamentous calcification.",
        screeningRecommendations: "Direct screening of community borehole water fluoride concentrations; clinical assessment of joint rigidity, kyphosis, and bilateral enamel pitting.",
      });
    }

    return {
      pillarId: "biomedical.endemicDisease",
      version: "1.0.0",
      domain: "biomedical",
      audience: "both",
      confidence: "high",
      data: {
        endemicProfile: diseases,
        geospatialEtiology: etiology,
      },
      provenance,
    };
  },
  provenance,
};
