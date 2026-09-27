import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";
import { SpiritualPillarOutput } from "./orthodox.tewahedo.v1";

const provenance: SourceRef[] = [
  {
    id: "ETH-SPIRIT-TRAD-01",
    title: "Waaqeffanna: The Traditional Monotheistic Cosmology of the Oromo",
    type: "paper",
    citation: "Bartels, L. (1983). Oromo Religion: Myths and Rites of the Western Oromo of Ethiopia. Reimer.",
    year: 1983,
  },
  {
    id: "ETH-SPIRIT-ODAA-02",
    title: "Sacred Groves (Odaa) and Natural Equilibrium Rites (Irreecha)",
    type: "oral_tradition",
    citation: "Custodians of the Sacred Odaa Trees, Bishoftu & Guji Oral Assemblies.",
    language: "both",
  },
];

export const spiritualTraditionalPillar: Pillar<{ consented?: boolean; spiritualContext?: string }, SpiritualPillarOutput> = {
  id: "spiritual.traditional.belief",
  version: "1.0.0",
  domain: "spiritual",
  audience: "both",
  requires: [],
  async query(input, _ctx: LocationContext): Promise<PillarResult<SpiritualPillarOutput>> {
    if (!input?.consented && !input?.spiritualContext) {
      return {
        pillarId: "spiritual.traditional.belief",
        version: "1.0.0",
        domain: "spiritual",
        audience: "both",
        confidence: "low",
        data: { framing: "", guidance: [] },
        provenance,
        disclaimers: ["Spiritual analysis omitted: user did not provide explicit consent."],
      };
    }

    return {
      pillarId: "spiritual.traditional.belief",
      version: "1.0.0",
      domain: "spiritual",
      audience: "both",
      confidence: "high",
      data: {
        framing: "Rooted in traditional ecological and spiritual balance (Nagaa and Safuu), honoring Creator Waaqa and the living harmony between humankind and nature.",
        prayerRhythms: [
          "Morning blessing (Eebba) seeking peace for family, cattle, and land",
          "Seasonal thanksgiving prayers by running waters or sacred groves (Irreecha / Malkaa)",
        ],
        guidance: [
          "Restore internal and community peace (Nagaa) as a prerequisite to somatic recovery",
          "Practice respectful stewardship of medicinal trees (Odaa, Weyra) when gathering traditional leaves",
          "Balance traditional clan elder counsel with timely modern clinical consultation",
        ],
      },
      provenance,
    };
  },
  provenance,
};
