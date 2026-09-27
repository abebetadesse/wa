import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface WatershedOutput {
  basin: string;
  waterQualityRisks: string[];
  sanitationVectorRisks: string[];
  guidance: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-ECOL-WATER-01",
    title: "Groundwater Fluoride and Salinity in the Ethiopian Rift Valley",
    type: "paper",
    citation: "Tekle-Haimanot, R. et al. (2006). Fluoride levels in drinking water in the Ethiopian Rift Valley. Journal of Water and Health.",
    year: 2006,
  },
  {
    id: "ETH-ECOL-BASINS-02",
    title: "Hydrological Basins of Ethiopia and Water-Related Disease Epidemiology",
    type: "dataset",
    citation: "Ethiopian Ministry of Water and Energy, River Basin Master Plans & Health Surveys.",
    year: 2018,
  },
];

export const watershedsPillar: Pillar<unknown, WatershedOutput> = {
  id: "ecological.watersheds",
  version: "1.0.0",
  domain: "ecological",
  audience: "both",
  requires: ["location.watershed"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<WatershedOutput>> {
    const isRift = ctx.watershed?.toLowerCase().includes("rift") || ctx.agroEcological === "rift-valley";

    const risks = [
      isRift
        ? "Elevated geochemical fluoride concentration causing dental/skeletal fluorosis in deep wells"
        : "Surface runoff microbial turbidity following heavy rainfall events",
    ];

    if (isRift) {
      risks.push("High alkaline mineral salinity in unmonitored boreholes");
    } else {
      risks.push("Prone to fecal-oral bacterial contamination in unprotected shallow community springs (ምንጭ)");
    }

    const vectorRisks = [
      "Slow-moving irrigation canals and stream banks harboring Biomphalaria snails (Schistosomiasis vector)",
      "Seasonal stagnant water collection points fostering Anopheles mosquito breeding",
    ];

    const guidance = [
      "Always boil or filter drinking water harvested from open springs, rivers, or rain collection drums",
      isRift
        ? "Utilize rainwater or defluoridated community water sources for pregnant mothers and growing children to protect skeletal development"
        : "Store treated drinking water in clean, narrow-neck clay vessels (እንስራ) with dedicated clean ladles",
      "Avoid wading barefoot in slow-moving lowland canals or warm marshlands to prevent Bilharzia penetration",
    ];

    return {
      pillarId: "ecological.watersheds",
      version: "1.0.0",
      domain: "ecological",
      audience: "both",
      confidence: "high",
      data: {
        basin: ctx.watershed || "Ethiopian Highland Watershed",
        waterQualityRisks: risks,
        sanitationVectorRisks: vectorRisks,
        guidance,
      },
      provenance,
    };
  },
  provenance,
};
