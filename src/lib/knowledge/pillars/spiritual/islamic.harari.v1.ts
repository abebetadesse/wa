import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";
import { SpiritualPillarOutput } from "./orthodox.tewahedo.v1";

const provenance: SourceRef[] = [
  {
    id: "ETH-SPIRIT-HARARI-01",
    title: "Tibb Nabawi (Prophetic Medicine) and Harari Botanical Healing Manuscripts",
    type: "manuscript",
    citation: "Harar Jugol Manuscript Archives, Collection of Traditional Botanical & Spiritual Guidance, Harar, Ethiopia.",
    year: 1984,
  },
  {
    id: "ETH-SPIRIT-ISLAMIC-02",
    title: "Black Seed (Habbat al-Barakah / Tikur Azmud) in Ethiopian Muslim Ethnomedicine",
    type: "paper",
    citation: "Ahmed, H. (2001). Islam in Nineteenth-Century Wallo, Ethiopia. Brill.",
    year: 2001,
  },
];

export const spiritualIslamicPillar: Pillar<{ consented?: boolean; spiritualContext?: string }, SpiritualPillarOutput> = {
  id: "spiritual.islamic.harari",
  version: "1.0.0",
  domain: "spiritual",
  audience: "both",
  requires: [],
  async query(input, _ctx: LocationContext): Promise<PillarResult<SpiritualPillarOutput>> {
    if (!input?.consented && !input?.spiritualContext) {
      return {
        pillarId: "spiritual.islamic.harari",
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
      pillarId: "spiritual.islamic.harari",
      version: "1.0.0",
      domain: "spiritual",
      audience: "both",
      confidence: "high",
      data: {
        framing: "Grounded in Islamic ethical care and Prophetic Medicine (Tibb Nabawi), emphasizing moderation, clean nutrition, and spiritual remembrance (Dhikr).",
        fastingContext: "Ramadan fasting requires balanced suhoor and iftar hydration. Medical dispensations (Rukhsa) apply for pregnancy, acute illness, or chronic disease management.",
        prayerRhythms: [
          "Five daily prayers structured as physical and spiritual grounding intervals",
          "Recitation of Surah Al-Fatiha and Ayat al-Kursi for tranquility (Shifa)",
          "Morning and evening supplications (Adhkar)",
        ],
        guidance: [
          "Incorporate honey and black seed (Nigella sativa / Tikur Azmud) in dietary moderation, ensuring blood glucose is monitored if taking diabetes medications",
          "Utilize Islamic medical dispensation (Rukhsa) when fasting presents documented health hazards",
          "Seek professional clinical diagnosis as a religious duty of bodily stewardship (Amanah)",
        ],
      },
      provenance,
    };
  },
  provenance,
};
