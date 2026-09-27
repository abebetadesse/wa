import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";
import { CulturalHighlandsOutput } from "./ethiopia.highlands.v1";

const provenance: SourceRef[] = [
  {
    id: "ETH-CULT-RIFT-01",
    title: "Oromo Gadaa System, Pastoralist Ethnomedicine and Family Welfare",
    type: "paper",
    citation: "Asmarom Legesse (1973). Gada: Three Approaches to the Study of African Society. Free Press.",
    year: 1973,
  },
  {
    id: "ETH-CULT-RIFT-02",
    title: "Herbal Milk Infusions and Thermal Spring Bathing around Lake Ziway and Hawassa",
    type: "informant",
    citation: "Traditional Healers Guild of the Central Rift Lakes Basin, Hawassa/Batu field transcripts.",
    language: "both",
  },
];

export const culturalRiftValleyPillar: Pillar<unknown, CulturalHighlandsOutput> = {
  id: "cultural.ethiopia.riftvalley",
  version: "1.0.0",
  domain: "cultural",
  audience: "both",
  requires: ["location.agroEcological"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<CulturalHighlandsOutput>> {
    const isRiftValley = ctx.agroEcological === "rift-valley" || ctx.agroEcological === "midland";

    return {
      pillarId: "cultural.ethiopia.riftvalley",
      version: "1.0.0",
      domain: "cultural",
      audience: "both",
      confidence: isRiftValley ? "high" : "moderate",
      data: {
        observedPatterns: [
          "Pastoralist seasonal herd movement (godana) and strong social herd-sharing bonds",
          "Frequent utilization of natural geothermal hot springs (ሆራ / ፍልውሃ) for joint stiffness and skin conditions",
          "Inter-generational clan councils (Jaarsummaa) mediating health seeking, family resource pooling, and crisis decisions",
        ],
        illnessModels: [
          "Heat imbalances and water mineral toxicity (known locally as water-heavy bone complaints, aligning with endemic dental/skeletal fluorosis)",
          "Spirit disharmony (Ayyaana disturbance) prompted by neglect of ancestral harmony or community discord",
        ],
        careSeekingPatterns: [
          "Immediate recourse to natural thermal waters (Hora), followed by local medicinal root decoctions, then woreda health center",
        ],
        familyDynamics: "Decisions guided by patriarchal clan assemblies with maternal matriarchs directing postpartum nutritional preparation.",
        guidance: [
          "Complement hot spring therapies with adequate potable spring water to avoid dehydration and mineral overburden",
          "Coordinate health appointments with local market day cycles (Senbete / Robi) when transit into town centers is feasible",
        ],
      },
      provenance,
    };
  },
  provenance,
};
