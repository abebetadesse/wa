import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface SpiritualPillarOutput {
  framing: string;
  fastingContext?: string;
  prayerRhythms?: string[];
  guidance: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-SPIRIT-TEWAHEDO-01",
    title: "Fetha Nagast (Law of the Kings) and Traditional Liturgical Fasting Codex",
    type: "manuscript",
    citation: "Ethiopian Orthodox Tewahedo Church Patriarchate, Fetha Nagast (Legal & Spiritual Codex), Part II.",
    language: "both",
  },
  {
    id: "ETH-SPIRIT-TSEBEL-02",
    title: "Holy Water (Tsebel) Healing Traditions and Integration with Primary Healthcare",
    type: "paper",
    citation: "Girma, M. (2012). The Healing Ministry of the Ethiopian Orthodox Tewahedo Church. International Bulletin of Missionary Research.",
    year: 2012,
  },
];

export const spiritualOrthodoxPillar: Pillar<{ consented?: boolean; spiritualContext?: string }, SpiritualPillarOutput> = {
  id: "spiritual.orthodox.tewahedo",
  version: "1.0.0",
  domain: "spiritual",
  audience: "both",
  requires: [],
  async query(input, _ctx: LocationContext): Promise<PillarResult<SpiritualPillarOutput>> {
    // If not consented, return empty/minimal with low confidence so caller can omit
    if (!input?.consented && !input?.spiritualContext) {
      return {
        pillarId: "spiritual.orthodox.tewahedo",
        version: "1.0.0",
        domain: "spiritual",
        audience: "both",
        confidence: "low",
        data: {
          framing: "",
          guidance: [],
        },
        provenance,
        disclaimers: ["Spiritual analysis omitted: user did not provide explicit consent for spiritual framing."],
      };
    }

    return {
      pillarId: "spiritual.orthodox.tewahedo",
      version: "1.0.0",
      domain: "spiritual",
      audience: "both",
      confidence: "high",
      data: {
        framing: "Framed within the Ethiopian Orthodox Tewahedo spiritual rhythm of contemplative prayer, fasting (ጾም), and restorative peace.",
        fastingContext: "Observes strict abstinence from animal products during fasting cycles (Hudadi / Great Lent, Wednesdays, Fridays, Filseta). Nutrition must actively supply plant proteins (shiro, lentils, broad beans).",
        prayerRhythms: [
          "Dawn prayer (የነግህ ጸሎት) and quietude before daily labors",
          "Sanctuary visitation and peaceful reflection by blessed waters (ጸበል) for spiritual calm",
          "Evening thanksgiving and psalm recitation (ዳዊት)",
        ],
        guidance: [
          "Preserve essential hydration and plant-based protein balance during fasting days, especially if experiencing bodily weakness",
          "Consult with your spiritual father (የነፍስ አባት) for formal fasting exemptions if acute clinical conditions require morning medication with meals",
          "Integrate holy water (ጸበል) prayer in harmony with prescribed medical therapies rather than as a substitute",
        ],
      },
      provenance,
    };
  },
  provenance,
};
