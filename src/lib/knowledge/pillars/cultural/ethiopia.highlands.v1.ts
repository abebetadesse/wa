import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface CulturalHighlandsOutput {
  observedPatterns: string[];
  illnessModels: string[];
  careSeekingPatterns: string[];
  familyDynamics: string;
  guidance: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-CULT-HIGHLANDS-01",
    title: "Postpartum Care and Seclusion (Aras/Rab) in Northern Ethiopian Highlands",
    type: "paper",
    citation: "Pankhurst, R. (1990). An Introduction to the Medical History of Ethiopia. Red Sea Press.",
    year: 1990,
  },
  {
    id: "ETH-CULT-IDDIR-02",
    title: "Iddir and Mahber Mutual Aid Health Safety Nets in Amhara and Shewa Communities",
    type: "oral_tradition",
    citation: "Council of Highland Elders & Community Kebele Health Workers, Gondar/Debre Birhan Oral Annals.",
    language: "both",
  },
];

export const culturalHighlandsPillar: Pillar<unknown, CulturalHighlandsOutput> = {
  id: "cultural.ethiopia.highlands",
  version: "1.0.0",
  domain: "cultural",
  audience: "both",
  requires: ["location.agroEcological"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<CulturalHighlandsOutput>> {
    const isHighland = ctx.agroEcological === "highland" || ctx.altitudeBand === "2300-3200" || ctx.altitudeBand === ">3200";

    const patterns = [
      "Postpartum seclusion period (አራስ ቤት / ራብ) requiring warm foods and herbal broth support",
      "Community health and mourning solidarity network (ዕድር / እቁብ) acting as collective resource",
      "Hot-cold humoral concept (ብርድ / ሙቀት): ailments often attributed to sudden cold exposure (ብርድ የገባው)",
    ];

    const guidance = [
      "Respect highland warming dietary regimens (የአራስ ገንፎ, የኑግ ወጥ, አጃ ሾርባ) during periods of bodily fatigue",
      "Engage family decision-makers early when seeking escalation or clinical visits",
      "Avoid direct cold drafts (ንፋስ) after warm herbal steam (ዳማከሴ) inhalations",
    ];

    return {
      pillarId: "cultural.ethiopia.highlands",
      version: "1.0.0",
      domain: "cultural",
      audience: "both",
      confidence: isHighland ? "high" : "moderate",
      data: {
        observedPatterns: patterns,
        illnessModels: [
          "Humoral balance: Wind/Cold intrusion (ብርድ / ንፋስ) causing somatic ache",
          "Evil eye or spirit attribution (ዓይነ ጥላ / ቡዳ) often considered when chronic fatigue resists quick recovery",
        ],
        careSeekingPatterns: [
          "Sequential care-seeking: home herb infusion → holy water/tsebel → health post / clinic if unresolved",
        ],
        familyDynamics: "Multigenerational consultation where elder women advise on nutrition while family head handles clinical transportation costs.",
        guidance,
      },
      provenance,
    };
  },
  provenance,
};
