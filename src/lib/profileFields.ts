import { profileFieldDefinitions } from "@/lib/db/schema";

export const PROFILE_FIELD_TYPES = ["text", "textarea", "select", "radio", "checkbox", "number", "date", "email", "phone", "file", "section_header"] as const;
export type ProfileFieldType = (typeof PROFILE_FIELD_TYPES)[number];

export const PROFILE_FIELD_CATALOG: ProfileFieldInput[] = [
  { section: "Personal", label: "Full name", fieldType: "text", placeholder: "Your full name", helpText: "The name you use in daily life.", displayOrder: 1 },
  { section: "Personal", label: "Date of birth", fieldType: "date", displayOrder: 2 },
  { section: "Personal", label: "Gender identity", fieldType: "select", options: ["Female", "Male", "Non-binary", "Prefer not to say", "Self-describe"], displayOrder: 3 },
  { section: "Personal", label: "Preferred language", fieldType: "select", options: ["English", "Amharic", "Afaan Oromo", "Tigrinya", "Somali", "Other"], displayOrder: 4 },
  { section: "Personal", label: "Phone number", fieldType: "phone", placeholder: "+251 9...", displayOrder: 5 },
  { section: "Personal", label: "Emergency contact name", fieldType: "text", displayOrder: 6 },
  { section: "Personal", label: "Emergency contact phone", fieldType: "phone", displayOrder: 7 },
  { section: "Personal", label: "Household size", fieldType: "number", validation: { min: 1, max: 100 }, displayOrder: 8 },
  { section: "Geography", label: "Country of residence", fieldType: "text", defaultValue: "Ethiopia", displayOrder: 10 },
  { section: "Geography", label: "Region or state", fieldType: "text", placeholder: "e.g. Oromia, Amhara, Addis Ababa", displayOrder: 11 },
  { section: "Geography", label: "City or town", fieldType: "text", displayOrder: 12 },
  { section: "Geography", label: "Sub-city or district", fieldType: "text", displayOrder: 13 },
  { section: "Geography", label: "Kebele", fieldType: "text", displayOrder: 14 },
  { section: "Geography", label: "Urban or rural setting", fieldType: "select", options: ["Urban", "Peri-urban", "Rural", "Prefer not to say"], displayOrder: 15 },
  { section: "Geography", label: "Living arrangement", fieldType: "select", options: ["Own home", "Renting", "Living with family", "Temporary accommodation", "Other", "Prefer not to say"], displayOrder: 16 },
  { section: "Geography", label: "Usual birthplace or hometown", fieldType: "text", displayOrder: 17 },
  { section: "Cultural", label: "Ethnic or cultural identity", fieldType: "text", helpText: "Share only what you are comfortable sharing.", displayOrder: 20 },
  { section: "Cultural", label: "Mother tongue", fieldType: "text", displayOrder: 21 },
  { section: "Cultural", label: "Religious or spiritual affiliation", fieldType: "select", options: ["Christian", "Muslim", "Traditional belief", "Other", "None", "Prefer not to say"], displayOrder: 22 },
  { section: "Cultural", label: "Cultural practices important to you", fieldType: "textarea", placeholder: "Family, community, food, healing, or seasonal practices", displayOrder: 23 },
  { section: "Cultural", label: "Dietary or fasting tradition", fieldType: "textarea", placeholder: "For example, fasting days or foods avoided for cultural reasons", displayOrder: 24 },
  { section: "Cultural", label: "Preferred cultural calendar", fieldType: "select", options: ["Gregorian", "Ethiopian calendar", "Islamic calendar", "Other", "No preference"], defaultValue: "Gregorian", displayOrder: 25 },
  { section: "Cultural", label: "Community or social support", fieldType: "textarea", displayOrder: 26 },
  { section: "Economic", label: "Employment status", fieldType: "select", options: ["Employed", "Self-employed", "Seeking work", "Student", "Retired", "Caregiver", "Unable to work", "Prefer not to say"], displayOrder: 30 },
  { section: "Economic", label: "Occupation or main activity", fieldType: "text", displayOrder: 31 },
  { section: "Economic", label: "Industry or livelihood", fieldType: "text", displayOrder: 32 },
  { section: "Economic", label: "Education level", fieldType: "select", options: ["No formal education", "Primary", "Secondary", "Technical or vocational", "University", "Postgraduate", "Prefer not to say"], displayOrder: 33 },
  { section: "Economic", label: "Household income range", fieldType: "select", options: ["Prefer not to say", "Below 5,000 ETB/month", "5,000-15,000 ETB/month", "15,000-30,000 ETB/month", "Above 30,000 ETB/month"], defaultValue: "Prefer not to say", displayOrder: 34 },
  { section: "Economic", label: "Financial priorities or concerns", fieldType: "textarea", placeholder: "Optional: access, debt, food security, work, or other concerns", displayOrder: 35 },
  { section: "Economic", label: "health or wellness access barriers", fieldType: "textarea", placeholder: "Cost, distance, transport, time, or other barriers", displayOrder: 36 },
  { section: "Economic", label: "Access to reliable internet", fieldType: "select", options: ["Reliable", "Sometimes available", "Rarely available", "No access", "Prefer not to say"], displayOrder: 37 },
  { section: "Family", label: "Relationship status", fieldType: "select", options: ["Single", "Married", "Partnered", "Separated", "Divorced", "Widowed", "Prefer not to say"], displayOrder: 40 },
  { section: "Family", label: "Number of children", fieldType: "number", validation: { min: 0, max: 30 }, displayOrder: 41 },
  { section: "Family", label: "Number of dependents", fieldType: "number", validation: { min: 0, max: 50 }, displayOrder: 42 },
  { section: "Family", label: "Children or dependents living with you", fieldType: "select", options: ["All", "Some", "None", "Not applicable", "Prefer not to say"], displayOrder: 43 },
  { section: "Family", label: "Primary caregiver responsibilities", fieldType: "textarea", placeholder: "People you care for and the kind of support they need", displayOrder: 44 },
  { section: "Family", label: "Family health history", fieldType: "textarea", placeholder: "Relevant conditions that run in your family", displayOrder: 45 },
  { section: "Family", label: "Family or household support", fieldType: "textarea", placeholder: "People, groups, or services you can rely on", displayOrder: 46 },
  { section: "Family", label: "Family traditions or important occasions", fieldType: "textarea", placeholder: "Optional cultural or family events that matter to you", displayOrder: 47 },
  { section: "health", label: "Height (cm)", fieldType: "number", validation: { min: 30, max: 250 }, displayOrder: 50 },
  { section: "health", label: "Weight (kg)", fieldType: "number", validation: { min: 1, max: 400 }, displayOrder: 51 },
  { section: "health", label: "Known allergies", fieldType: "textarea", placeholder: "Foods, medicines, or environmental allergies", displayOrder: 52 },
  { section: "health", label: "Current medications", fieldType: "textarea", placeholder: "Include names and doses if relevant", displayOrder: 53 },
  { section: "health", label: "Relevant medical history", fieldType: "textarea", displayOrder: 54 },
  { section: "health", label: "Pregnancy or lactation status", fieldType: "select", options: ["Not applicable", "Pregnant", "Postpartum", "Breastfeeding", "Prefer not to say"], displayOrder: 55 },
  { section: "Lifestyle", label: "Physical activity level", fieldType: "select", options: ["Mostly sedentary", "Light", "Moderate", "Very active", "Prefer not to say"], displayOrder: 60 },
  { section: "Lifestyle", label: "Sleep duration (hours)", fieldType: "number", validation: { min: 0, max: 24 }, displayOrder: 61 },
  { section: "Lifestyle", label: "Typical diet and food preferences", fieldType: "textarea", displayOrder: 62 },
  { section: "Lifestyle", label: "Stressors and support needs", fieldType: "textarea", displayOrder: 63 },
];

export interface ProfileFieldInput {
  section: string;
  label: string;
  fieldType: ProfileFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: string[];
  validation?: Record<string, unknown>;
  conditional?: Record<string, unknown> | null;
  displayOrder?: number;
  isActive?: boolean;
  isUserVisible?: boolean;
  isAdminOnly?: boolean;
}

export function validateFieldInput(value: unknown): ProfileFieldInput {
  if (!value || typeof value !== "object") throw new Error("Field definition must be an object.");
  const field = value as Record<string, unknown>;
  const section = typeof field.section === "string" ? field.section.trim() : "";
  const label = typeof field.label === "string" ? field.label.trim() : "";
  const fieldType = field.fieldType;
  if (!section || !label) throw new Error("Section and label are required.");
  if (typeof fieldType !== "string" || !PROFILE_FIELD_TYPES.includes(fieldType as ProfileFieldType)) throw new Error("Unsupported profile field type.");
  return {
    section,
    label,
    fieldType: fieldType as ProfileFieldType,
    required: field.required === true,
    placeholder: typeof field.placeholder === "string" ? field.placeholder : undefined,
    helpText: typeof field.helpText === "string" ? field.helpText : undefined,
    defaultValue: field.defaultValue,
    options: Array.isArray(field.options) ? field.options.filter((option): option is string => typeof option === "string") : [],
    validation: field.validation && typeof field.validation === "object" ? field.validation as Record<string, unknown> : {},
    conditional: field.conditional && typeof field.conditional === "object" ? field.conditional as Record<string, unknown> : null,
    displayOrder: typeof field.displayOrder === "number" ? field.displayOrder : 0,
    isActive: field.isActive !== false,
    isUserVisible: field.isUserVisible !== false,
    isAdminOnly: field.isAdminOnly === true,
  };
}

export function isVisible(field: { conditional: Record<string, unknown> | null }, data: Record<string, unknown>) {
  if (!field.conditional) return true;
  const condition = field.conditional;
  const actual = data[String(condition.fieldId)];
  const expected = condition.value;
  const actualNumber = typeof actual === "number" ? actual : Number(actual);
  const expectedNumber = typeof expected === "number" ? expected : Number(expected);
  switch (condition.operator) {
    case "equals": return actual === expected || (actual !== undefined && actual !== null && expected !== undefined && String(actual) === String(expected));
    case "contains": return Array.isArray(actual) ? actual.some((item) => String(item) === String(expected)) : typeof actual === "string" && actual.includes(String(expected));
    case "greaterThan": return Number.isFinite(actualNumber) && Number.isFinite(expectedNumber) && actualNumber > expectedNumber;
    case "lessThan": return Number.isFinite(actualNumber) && Number.isFinite(expectedNumber) && actualNumber < expectedNumber;
    case "notEmpty": return actual !== undefined && actual !== null && actual !== "";
    default: return false;
  }
}
