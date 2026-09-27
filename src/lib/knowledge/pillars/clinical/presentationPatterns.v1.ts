import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface PresentationPatternOutput {
  syndromicCrosswalks: Array<{
    somaticComplaint: string;
    amharicTerm: string;
    culturalAttribution: string;
    biomedicalDifferentials: string[];
    investigationStrategy: string;
  }>;
}

const provenance: SourceRef[] = [
  {
    id: "ETH-CLIN-PATTERNS-01",
    title: "Idioms of Distress and Somatization in Ethiopian Primary Healthcare Settings",
    type: "paper",
    citation: "Alem, A. et al. (1999). Somatization and common mental disorders in rural Ethiopia. British Journal of Psychiatry.",
    year: 1999,
  },
];

export const presentationPatternsPillar: Pillar<unknown, PresentationPatternOutput> = {
  id: "clinical.presentationPatterns",
  version: "1.0.0",
  domain: "clinical",
  audience: "both",
  requires: ["location.agroEcological"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<PresentationPatternOutput>> {
    const crosswalks = [
      {
        somaticComplaint: "Severe visceral burning sensation / Epigastric distress",
        amharicTerm: "ጨጓራዬን አቃጠለኝ (Chegwara)",
        culturalAttribution: "Attributed to sour injera yeast, missed fasting schedule, or spicy berbere irritation.",
        biomedicalDifferentials: [
          "Helicobacter pylori gastritis / Peptic ulcer disease",
          "Gastroesophageal reflux disease (GERD)",
          "Somatic expression of generalized anxiety / stress disorder",
        ],
        investigationStrategy: "H. pylori stool antigen or urea breath test; trial of proton-pump inhibitor (PPI) alongside meal-timing regularization.",
      },
      {
        somaticComplaint: "Generalized internal coldness, diffuse joint and muscle ache",
        amharicTerm: "ብርድ ገብቶኛል (Bird Gebtognal)",
        culturalAttribution: "Sudden exposure to cold winds, washing in icy morning water, or damp living quarters.",
        biomedicalDifferentials: [
          "Post-viral asthenia / Upper respiratory prodrome",
          ctx.endemicDiseases.includes("malaria") ? "Subacute Plasmodium malaria infection" : "Rheumatoid arthritis / Osteoarthritis",
          "Fibromyalgia / Chronic myofascial pain syndrome",
        ],
        investigationStrategy: "Complete blood count (CBC), erythrocyte sedimentation rate (ESR), and malaria rapid diagnostic test if febrile.",
      },
      {
        somaticComplaint: "Heaviness of the heart, inner constriction, palpitations",
        amharicTerm: "ልቤን አፈነው (Liben Afenew)",
        culturalAttribution: "Emotional sorrow, grief, evil eye interference, or family conflict.",
        biomedicalDifferentials: [
          "Panic attack / Depressive somatization disorder",
          "Cardiac arrhythmia / Mitral valve pathology (endemic rheumatic heart disease)",
          "Severe microcytic iron deficiency anemia",
        ],
        investigationStrategy: "12-lead Electrocardiogram (ECG), hemoglobin check, and culturally sensitive PHQ-9 depression screening.",
      },
    ];

    return {
      pillarId: "clinical.presentationPatterns",
      version: "1.0.0",
      domain: "clinical",
      audience: "both",
      confidence: "high",
      data: {
        syndromicCrosswalks: crosswalks,
      },
      provenance,
    };
  },
  provenance,
};
