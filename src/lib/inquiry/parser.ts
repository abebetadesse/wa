export type InquiryLanguage = "en" | "am" | "om";
export type InquiryIntent = "emergency" | "symptom" | "treatment" | "dietary" | "herbal" | "lifestyle" | "general";
export type InquiryUrgency = "critical" | "high" | "medium" | "low";

export interface InquiryEntity {
  value: string;
  label: string;
  confidence: number;
}

export interface ParsedhealthInquiry {
  raw: string;
  language: InquiryLanguage;
  intent: InquiryIntent;
  symptoms: InquiryEntity[];
  bodyParts: InquiryEntity[];
  duration: InquiryEntity | null;
  severity: InquiryUrgency;
  urgency: {
    level: InquiryUrgency;
    score: number;
    action: string;
    recommendation: string;
    matchedSignals: string[];
  };
  nextSteps: string[];
  disclaimer: string;
}

const symptomAliases: Record<string, string[]> = {
  headache: ["headache", "head pain", "migraine", "ራስ ምታት"],
  fever: ["fever", "high temperature", "ትኩሳት"],
  cough: ["cough", "coughing", "ሳል"],
  vomiting: ["vomit", "vomiting", "nausea", "ማስወጣት"],
  diarrhea: ["diarrhea", "diarrhoea", "loose stool", "ተቅማጥ"],
  stomach_pain: ["stomach pain", "abdominal pain", "belly ache", "የሆድ ህመም"],
  fatigue: ["fatigue", "tired", "exhausted", "weak", "low energy", "ድካም"],
  rash: ["rash", "hives", "itching", "itchy", "አለርጂ"],
  breathing_difficulty: ["difficulty breathing", "shortness of breath", "cannot breathe", "gasping"],
  bleeding: ["bleeding", "blood loss", "vomiting blood", "ደም"],
};

const bodyPartAliases: Record<string, string[]> = {
  head: ["head", "ራስ"],
  chest: ["chest", "heart area", "ደረት"],
  stomach: ["stomach", "belly", "abdomen", "gut", "ሆድ"],
  back: ["back", "spine", "ጀርባ"],
  skin: ["skin", "ሆዳ"],
};

const emergencySignals = [
  "unconscious", "unresponsive", "cannot breathe", "gasping", "chest pain",
  "stroke", "seizure", "heavy bleeding", "vomiting blood", "anaphylaxis",
  "life-threatening", "አልተነቃም",
];

const highUrgencySignals = ["severe pain", "faint", "collapse", "worsening", "allergic reaction", "difficulty breathing"];
const mediumUrgencySignals = ["persistent", "recurrent", "for weeks", "for months", "affecting daily life"];

function detectLanguage(text: string): InquiryLanguage {
  if (/[\u1200-\u137F]/.test(text)) return "am";
  return "en";
}

function findEntities(text: string, aliases: Record<string, string[]>) {
  const normalized = text.toLowerCase();
  return Object.entries(aliases)
    .filter(([, terms]) => terms.some((term) => normalized.includes(term.toLowerCase())))
    .map(([value, terms]) => ({
      value,
      label: terms.find((term) => normalized.includes(term.toLowerCase())) || value,
      confidence: 0.9,
    }));
}

function findDuration(text: string): InquiryEntity | null {
  const match = text.match(/(?:for|since|past|last)\s+(\d+)\s+(days?|weeks?|months?|years?)/i);
  if (!match) return null;
  return { value: `${match[1]} ${match[2]}`, label: "duration", confidence: 0.85 };
}

function detectIntent(text: string, hasSymptoms: boolean): InquiryIntent {
  const normalized = text.toLowerCase();
  if (emergencySignals.some((signal) => normalized.includes(signal))) return "emergency";
  if (hasSymptoms || /pain|ache|hurt|symptom|feel sick|ህመም/.test(normalized)) return "symptom";
  if (/herb|plant|root|leaf|traditional|natural|ዕፅዋት|ተና|ኮሶ/.test(normalized)) return "herbal";
  if (/food|eat|diet|meal|nutrition|ምግብ/.test(normalized)) return "dietary";
  if (/sleep|exercise|stress|routine|habit/.test(normalized)) return "lifestyle";
  if (/medicine|treatment|remedy|cure|relief|help/.test(normalized)) return "treatment";
  return "general";
}

function detectUrgency(text: string, symptoms: InquiryEntity[], duration: InquiryEntity | null) {
  const normalized = text.toLowerCase();
  const matchedSignals = [...emergencySignals, ...highUrgencySignals, ...mediumUrgencySignals].filter((signal) => normalized.includes(signal));
  const hasCritical = emergencySignals.some((signal) => normalized.includes(signal)) || symptoms.some((symptom) => symptom.value === "breathing_difficulty" || symptom.value === "bleeding");
  const hasHigh = highUrgencySignals.some((signal) => normalized.includes(signal));
  const hasMedium = mediumUrgencySignals.some((signal) => normalized.includes(signal)) || Boolean(duration && /month|year/i.test(duration.value));

  if (hasCritical) return { level: "critical" as const, score: 100, action: "EMERGENCY_CARE", recommendation: "Call local emergency services or go to the nearest emergency department now.", matchedSignals };
  if (hasHigh) return { level: "high" as const, score: 80, action: "URGENT_REVIEW", recommendation: "Arrange urgent review by a qualified healthcare professional, ideally today.", matchedSignals };
  if (hasMedium) return { level: "medium" as const, score: 55, action: "SCHEDULE_REVIEW", recommendation: "Schedule a healthcare visit soon, especially if symptoms persist or worsen.", matchedSignals };
  return { level: "low" as const, score: 20, action: "MONITOR", recommendation: "Monitor the pattern, use the educational tools below, and seek care if it persists or worsens.", matchedSignals };
}

export function parsehealthInquiry(raw: string): ParsedhealthInquiry {
  const text = raw.trim();
  const symptoms = findEntities(text, symptomAliases);
  const bodyParts = findEntities(text, bodyPartAliases);
  const duration = findDuration(text);
  const urgency = detectUrgency(text, symptoms, duration);

  return {
    raw: text,
    language: detectLanguage(text),
    intent: detectIntent(text, symptoms.length > 0),
    symptoms,
    bodyParts,
    duration,
    severity: urgency.level,
    urgency,
    nextSteps: [
      urgency.recommendation,
      "Do not start, stop, or change medication based on this educational result.",
      "Use the Safety Gate before considering any traditional herb or remedy.",
    ],
    disclaimer: "This portal organizes your concern and provides educational routing. It does not diagnose conditions, prescribe treatment, or replace professional medical care.",
  };
}
