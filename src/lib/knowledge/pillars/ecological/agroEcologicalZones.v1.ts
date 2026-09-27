import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface AgroEcologicalOutput {
  zoneName: string;
  altitudeBand: string;
  temperatureRange: string;
  environmentalPressures: string[];
  recommendations: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-ECOL-ZONES-01",
    title: "Agro-ecological Zonation of Ethiopia and its Health/Agricultural Implications",
    type: "paper",
    citation: "Hurni, H. (1998). Agroecological Belts of Ethiopia. Centre for Development and Environment, Bern.",
    year: 1998,
  },
];

export const ecologicalZonesPillar: Pillar<unknown, AgroEcologicalOutput> = {
  id: "ecological.agroEcologicalZones",
  version: "1.0.0",
  domain: "ecological",
  audience: "both",
  requires: ["location.agroEcological", "location.altitudeBand"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<AgroEcologicalOutput>> {
    let zoneName = "Highland (Dega)";
    let temperatureRange = "10°C – 16°C";
    let pressures = [
      "Cold wind exposure promoting upper respiratory irritation",
      "Lower oxygen partial pressure requiring cardiovascular adaptation",
      "Intense solar UV radiation at high altitude",
    ];
    let recommendations = [
      "Wear layered thermal clothing during dawn and dusk hours",
      "Maintain adequate iron-rich dietary intake for oxygen transport at elevation",
      "Stay hydrated despite diminished highland thirst sensation",
    ];

    if (ctx.agroEcological === "desert" || ctx.agroEcological === "lowland") {
      zoneName = ctx.agroEcological === "desert" ? "Hyper-Arid Lowland (Bereha)" : "Semi-Arid Lowland (Kolla)";
      temperatureRange = "28°C – 42°C";
      pressures = [
        "Extreme heat stress and perspiration fluid/electrolyte depletion",
        "Dust storm respiratory particle inhalation",
        "Vector proliferation near seasonal water pools",
      ];
      recommendations = [
        "Avoid strenuous outdoor activities between 11:00 AM and 3:30 PM",
        "Drink small, continuous volumes of fluid enriched with electrolytes (salt/lemon)",
        "Sleep under long-lasting insecticidal mosquito bed nets",
      ];
    } else if (ctx.agroEcological === "midland" || ctx.agroEcological === "rift-valley") {
      zoneName = ctx.agroEcological === "rift-valley" ? "Rift Valley Basin" : "Midland Temperate (Weyna Dega)";
      temperatureRange = "16°C – 24°C";
      pressures = [
        "Moderate seasonal malaria transmission during Belg and Kiremt rains",
        "Seasonal humidity shifts triggering mold and allergen surges",
      ];
      recommendations = [
        "Eliminate standing water around residence after rain events",
        "Ensure ventilation in indoor cooking spaces to minimize biomass smoke exposure",
      ];
    }

    return {
      pillarId: "ecological.agroEcologicalZones",
      version: "1.0.0",
      domain: "ecological",
      audience: "both",
      confidence: "high",
      data: {
        zoneName,
        altitudeBand: ctx.altitudeBand,
        temperatureRange,
        environmentalPressures: pressures,
        recommendations,
      },
      provenance,
    };
  },
  provenance,
};
