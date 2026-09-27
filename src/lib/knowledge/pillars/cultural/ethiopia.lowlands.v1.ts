import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";
import { CulturalHighlandsOutput } from "./ethiopia.highlands.v1";

const provenance: SourceRef[] = [
  {
    id: "ETH-CULT-LOWLANDS-01",
    title: "Afar and Somali Traditional Knowledge Systems: Water Sharing and Cameline Ethnoveterinary Practice",
    type: "paper",
    citation: "Kassahun, A. et al. (2008). Traditional adaptation mechanisms in pastoral systems of eastern Ethiopia. Pastoralism Journal.",
    year: 2008,
  },
  {
    id: "ETH-CULT-XHEER-02",
    title: "Customary Pastoral Law (Xeer and Mada'a) and Community Health Mediation",
    type: "oral_tradition",
    citation: "Elder Councils of the Awash Lowlands & Ogaden Rangelands.",
    language: "both",
  },
];

export const culturalLowlandsPillar: Pillar<unknown, CulturalHighlandsOutput> = {
  id: "cultural.ethiopia.lowlands",
  version: "1.0.0",
  domain: "cultural",
  audience: "both",
  requires: ["location.agroEcological"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<CulturalHighlandsOutput>> {
    const isLowland = ctx.agroEcological === "lowland" || ctx.agroEcological === "desert";

    return {
      pillarId: "cultural.ethiopia.lowlands",
      version: "1.0.0",
      domain: "cultural",
      audience: "both",
      confidence: isLowland ? "high" : "moderate",
      data: {
        observedPatterns: [
          "Nomadic and semi-nomadic transhumance tracking dry/wet season watering points (Ella / Birka)",
          "Reverence for camel milk as food, rehydration fluid, and primary healing balm",
          "Customary dispute resolution frameworks (Xeer / Mada'a) ensuring mutual support for sick pastoralists",
        ],
        illnessModels: [
          "Extreme heat exhaustion and dry desert dust wind illness (Gahaydh)",
          "Vector-borne fevers associated with seasonal riverbed flooding (Wabi Shebelle / Awash)",
        ],
        careSeekingPatterns: [
          "Consultation with traditional pastoral herbalist / elder bone-setter, followed by mobile health outreach clinics",
        ],
        familyDynamics: "High clan solidarity; medical costs and emergency transport are shared across sub-clan (Jilib) networks.",
        guidance: [
          "Preserve hydration with clean water alongside fermented camel milk during high daytime temperatures",
          "Seek prompt clinical blood testing for acute high fever to rule out malaria or acute infectious fevers",
        ],
      },
      provenance,
    };
  },
  provenance,
};
