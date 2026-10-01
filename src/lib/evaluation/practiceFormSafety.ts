/**
 * Physical-safety cautions for the way a traditional practice is carried out. DOMAIN A.
 * Input is the neutral practice-form vocabulary (src/lib/shared/practiceForms.ts); this module
 * knows nothing about manuscripts, prayers or their meaning. It speaks only to physical risks:
 * smoke, latex near the eyes, things swallowed or sniffed, and things given to someone else.
 */
import { PRACTICE_FORM_LABELS, type PracticeForm } from "@/lib/shared/practiceForms";

export type CautionLevel = "danger" | "caution" | "info";

export interface PracticeCaution {
  form: PracticeForm;
  level: CautionLevel;
  label: string;
  en: string;
  am: string;
}

const CAUTIONS: Record<PracticeForm, { level: CautionLevel; en: string; am: string }> = {
  recited_prayer: { level: "info", en: "No physical risk. Keep it alongside, not instead of, care for any illness.", am: "አካላዊ ጉዳት የለውም። ለሕመም የሚያስፈልገውን ሕክምና አይተካም።" },
  written_scroll: { level: "info", en: "No physical risk from the writing itself. Inks and dyes stay on paper or parchment, not on skin or in drinks.", am: "ጽሑፉ ራሱ ጉዳት የለውም። ቀለሙ በወረቀት ወይም በብራና ላይ ይቆይ፤ በቆዳ ወይም በመጠጥ ውስጥ አይግባ።" },
  worn_amulet: { level: "info", en: "No physical risk if the cord is not tight. Never on a baby's neck while sleeping (strangling risk).", am: "ማሰሪያው ካልጠበቀ ጉዳት የለውም። በሚተኛ ሕፃን አንገት ላይ አይታሰር (የመታነቅ አደጋ)።" },
  fumigation: {
    level: "danger",
    en: "Smoke irritates the airways. Burning sulfur (ድኝ) releases sulfur dioxide, which can trigger severe breathing attacks. Never with asthma or chest illness, babies or pregnancy; burn outdoors or with windows open and keep the person out of the smoke.",
    am: "ጭስ የመተንፈሻ አካልን ያቆስላል። ድኝ ሲቃጠል የሚወጣው ጋዝ ከባድ የትንፋሽ ችግር ያስከትላል። አስም ወይም የደረት ሕመም ላለበት፣ ለሕፃናትና ለነፍሰ ጡር አይሆንም፤ በውጭ ወይም መስኮት ከፍቶ ያድርጉ፣ ሰውየውም ከጭሱ ይራቅ።",
  },
  taken_by_mouth: { level: "caution", en: "Anything swallowed is checked against the client's medicines, pregnancy and age below. Give amounts you can stand behind, and stop if vomiting, rash or dizziness follow.", am: "የሚጠጣ ወይም የሚበላ ነገር ከታች ከሚወስዷቸው መድኃኒቶች፣ ከእርግዝናና ከዕድሜ ጋር ይፈተሻል። ማስመለስ፣ ሽፍታ ወይም ማዞር ካለ ያቁሙ።" },
  snuffed_into_nose: { level: "caution", en: "Pastes or juices sniffed into the nose (garlic, rue, pepper) burn the lining and can cause nosebleeds. Not for children; never anything that has not been strained.", am: "በአፍንጫ የሚማግ ነገር (ነጭ ሽንኩርት፣ ጤና አዳም፣ በርበሬ) የአፍንጫን ውስጥ ያቃጥላል፣ ነስር ሊያስከትል ይችላል። ለሕፃናት አይሆንም።" },
  applied_to_skin: { level: "info", en: "Try a small patch of skin first and wash off if it stings or reddens.", am: "መጀመሪያ በትንሽ ቆዳ ላይ ይሞክሩ፤ ቢያቃጥል ወይም ቢቀላ ይጠቡ።" },
  applied_near_eyes: {
    level: "danger",
    en: "Nothing should go in or around the eyes. Plant latex, especially euphorbia (ቁልቋል) milk, causes severe eye burns and can blind. If any reaches the eye, rinse with clean water for 15 minutes and go to a health centre.",
    am: "በዓይን ውስጥም ሆነ ዙሪያ ምንም አይኳል። የእፅዋት ወተት በተለይ የቁልቋል ወተት ዓይንን ያቃጥላል፣ ሊያሳውርም ይችላል። ዓይን ውስጥ ከገባ በንጹሕ ውሃ ለ15 ደቂቃ አጥበው ወደ ጤና ተቋም ይሂዱ።",
  },
  given_to_another_person: {
    level: "danger",
    en: "Nothing may be given to another person to eat, drink or wear without their knowledge and agreement. Offer this only for the client's own use.",
    am: "ለሌላ ሰው ሳያውቅና ሳይስማማ የሚበላ፣ የሚጠጣ ወይም የሚለበስ ምንም ነገር አይሰጥም። ለደንበኛው ራሱ ብቻ ይሁን።",
  },
};

const ORDER: Record<CautionLevel, number> = { danger: 0, caution: 1, info: 2 };

/** Cautions for the forms a practice uses, most serious first. */
export function practiceFormCautions(forms: readonly PracticeForm[]): PracticeCaution[] {
  return [...new Set(forms)]
    .map((form) => ({ form, label: PRACTICE_FORM_LABELS[form].en, ...CAUTIONS[form] }))
    .sort((a, b) => ORDER[a.level] - ORDER[b.level]);
}
