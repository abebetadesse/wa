/** Healer-facing wording for toolkit groups, audiences and knowledge strands. */

export const GROUP_LABELS: Record<string, string> = {
  care_pathway: "Care pathway",
  evidence: "Evidence",
  practice: "Practice knowledge",
  support: "Safety & support",
  governance: "Governance",
};

export const AUDIENCE_LABELS: Record<string, string> = {
  public: "Everyone",
  practitioner: "Healers & business teams",
  admin: "Administrators",
};

/** Keys match KnowledgeStrandType (src/lib/knowledge/types.ts). */
export const STRAND_LABELS: Record<string, string> = {
  biochemical: "Plant chemistry",
  biological: "Body & plants",
  medication: "Medicines & interactions",
  addiction: "Dependence",
  ecological: "Ecology & seasons",
  epidemiological: "Community patterns",
  psychological: "Mind & wellbeing",
  socioeconomic: "Livelihood & household",
  dietary: "Food & fasting",
  cultural: "Culture & tradition",
  astrological: "Calendar & stars",
};
