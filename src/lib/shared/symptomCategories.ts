/**
 * Neutral vocabulary shared by Domain A (science, safety) and Domain B (heritage, manuscripts).
 *
 * The firewall: Domain A modules (src/lib/evaluation, src/lib/location, src/lib/case-workflow,
 * src/server/safety) never import Domain B modules (src/lib/cultural), and Domain B never imports
 * Domain A. Both may import this file, which holds only identifiers and plain labels, never claims.
 */

export const SYMPTOM_CATEGORIES = ["digestive", "febrile", "respiratory", "dermal", "headache", "joint", "stomach_acid", "blood_sugar", "heart_fatigue", "tremor", "general"] as const;
export type SymptomCategory = (typeof SYMPTOM_CATEGORIES)[number];

export const SYMPTOM_CATEGORY_LABELS: Record<SymptomCategory, { en: string; am: string }> = {
  digestive: { en: "Belly & bowel complaints", am: "የሆድና የአንጀት ቅሬታ" },
  febrile: { en: "Fever & chills", am: "ትኩሳትና ብርድ" },
  respiratory: { en: "Chest, cough & breathing", am: "ደረት፣ ሳልና ትንፋሽ" },
  dermal: { en: "Skin & wounds", am: "ቆዳና ቁስል" },
  headache: { en: "Headache", am: "የራስ ምታት" },
  joint: { en: "Joints & aches", am: "መገጣጠሚያና ቁርጥማት" },
  stomach_acid: { en: "Stomach burning", am: "የጨጓራ ማቃጠል" },
  blood_sugar: { en: "Blood sugar concerns", am: "የስኳር ጉዳይ" },
  heart_fatigue: { en: "Heart & tiredness", am: "ልብና ድካም" },
  tremor: { en: "Shaking of hands or body", am: "የእጅና የአካል መንቀጥቀጥ" },
  general: { en: "General wellbeing", am: "አጠቃላይ ደህንነት" },
};

/** Safety-matrix slugs of plants traditionally associated with each category (identifiers only). */
export const CATEGORY_PLANT_SLUGS: Record<SymptomCategory, string[]> = {
  digestive: ["tena-adam", "nech-shinkurt", "abish"],
  febrile: ["damakesse", "ariti"],
  respiratory: ["zinjibil", "bahir-zaf"],
  dermal: ["embuay", "gizawa"],
  headache: ["feto", "damakesse"],
  joint: ["senafich", "feto"],
  stomach_acid: ["telba", "tosign"],
  blood_sugar: ["tikur-azmud", "abish"],
  heart_fatigue: ["tej-sar", "woyra"],
  tremor: ["gizawa"],
  general: [],
};
