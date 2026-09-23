import type { WorkflowQuestion } from "../types";

const q = (id: string, text: string, textAmharic: string, options: [string, string][]): WorkflowQuestion => ({
  id,
  text,
  textAmharic,
  type: "radio",
  required: true,
  options: options.map(([value, label]) => ({ value, label })),
});

const preferNot: [string, string] = ["prefer_not", "I prefer not to say"];

export const SELF_HARM_QUESTION = q(
  "self_harm",
  "In the past two weeks, have you had thoughts of harming yourself?",
  "ባለፉት ሁለት ሳምንታት ራስዎን የመጉዳት ሀሳብ ነበረዎት?",
  [["no", "No"], ["occasionally", "Occasionally"], ["frequently", "Frequently"], preferNot],
);

export const IMMEDIATE_RISK_QUESTION = q(
  "immediateRisk",
  "Are you in immediate danger right now?",
  "አሁን አስቸኳይ አደጋ ላይ ነዎት?",
  [["no", "No"], ["yes", "Yes"], preferNot],
);

export const CAREER_SAFETY: WorkflowQuestion[] = [
  q("basic_needs", "Are you currently able to meet basic needs (food, shelter, rent)?", "መሠረታዊ ፍላጎቶችዎን (ምግብ፣ መጠለያ፣ ኪራይ) ማሟላት ይችላሉ?", [
    ["yes_comfortable", "Yes, comfortably"],
    ["yes_difficult", "Yes, but with difficulty"],
    ["no", "No"],
    preferNot,
  ]),
  SELF_HARM_QUESTION,
  q("financial_pressure", "Is someone pressuring you to make a financial decision?", "የገንዘብ ውሳኔ እንዲወስኑ የሚያስገድድዎ ሰው አለ?", [["no", "No"], ["yes", "Yes"], preferNot]),
];

export const LEGAL_SAFETY: WorkflowQuestion[] = [
  q("immediateHarm", "Is anyone threatening or physically endangering you?", "አንድ ሰው እያስፈራራዎት ወይም አካላዊ አደጋ እያደረሰብዎ ነው?", [
    ["no", "No"],
    ["threats", "I am receiving threats"],
    ["physical_danger", "I am in physical danger"],
    preferNot,
  ]),
  q("criminalMatter", "Does this involve a criminal charge or police case?", "ይህ የወንጀል ክስ ወይም የፖሊስ ጉዳይን ያካትታል?", [["no", "No"], ["yes", "Yes"], ["unsure", "I am not sure"], preferNot]),
  q("evictionRisk", "Are you at risk of losing your home?", "ቤትዎን የማጣት አደጋ አለ?", [["no", "No"], ["within_30", "Within 30 days"], ["within_7", "Within 7 days"], preferNot]),
  q("childWelfare", "Are any children involved, and are they safe?", "ልጆች ይሳተፋሉ? ደህና ናቸው?", [["no_children", "No children involved"], ["safe", "Yes, they are safe"], ["concerned", "I am worried about a child's safety"], preferNot]),
];

export const RELATIONSHIP_SAFETY: WorkflowQuestion[] = [
  q("feelsSafe", "Do you feel safe in this relationship?", "በዚህ ግንኙነት ውስጥ ደህንነት ይሰማዎታል?", [["yes", "Yes"], ["unsafe", "No, I feel unsafe"], preferNot]),
  q("domesticViolence", "Has there been physical, sexual or emotional abuse?", "አካላዊ፣ ወሲባዊ ወይም ስሜታዊ ጥቃት ደርሶ ያውቃል?", [["no", "No"], ["possible", "Possibly"], ["active", "Yes, it is happening"], preferNot]),
  q("childSafety", "Are any children in the household safe?", "በቤቱ ውስጥ ያሉ ልጆች ደህና ናቸው?", [["no_children", "No children"], ["safe", "Yes"], ["concerned", "I am worried"], preferNot]),
  IMMEDIATE_RISK_QUESTION,
];

export const SOCIAL_SAFETY: WorkflowQuestion[] = [
  q("loneliness", "How lonely or disconnected have you felt recently?", "በቅርቡ ምን ያህል ብቸኝነት ተሰምቶዎታል?", [["low", "A little"], ["moderate", "Moderately"], ["high", "Very"], preferNot]),
  SELF_HARM_QUESTION,
  IMMEDIATE_RISK_QUESTION,
  q("supportAvailable", "Is there someone you can turn to for support?", "ድጋፍ የሚጠይቁት ሰው አለ?", [["yes", "Yes"], ["limited", "Only a little"], ["none", "No one"], preferNot]),
];

export const SPIRITUAL_SAFETY: WorkflowQuestion[] = [SELF_HARM_QUESTION, IMMEDIATE_RISK_QUESTION];
