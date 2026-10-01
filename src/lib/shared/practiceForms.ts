/**
 * Neutral vocabulary for how a traditional practice is carried out, shared by Domain A (safety)
 * and Domain B (manuscripts). Identifiers and plain labels only, never claims: Domain B tags a
 * manuscript chapter with the forms its procedure uses, Domain A attaches the cautions, and the
 * server joins the two. See ./symptomCategories.ts for the firewall rule.
 */

export const PRACTICE_FORMS = [
  "recited_prayer",
  "written_scroll",
  "worn_amulet",
  "fumigation",
  "taken_by_mouth",
  "snuffed_into_nose",
  "applied_to_skin",
  "applied_near_eyes",
  "given_to_another_person",
] as const;
export type PracticeForm = (typeof PRACTICE_FORMS)[number];

export const PRACTICE_FORM_LABELS: Record<PracticeForm, { en: string; am: string }> = {
  recited_prayer: { en: "Prayer recited", am: "የሚደገም ጸሎት" },
  written_scroll: { en: "Written scroll or seal (ጠልሰም)", am: "የሚጻፍ ክታብ ወይም ጠልሰም" },
  worn_amulet: { en: "Carried or worn", am: "የሚታሰር ወይም የሚያዝ" },
  fumigation: { en: "Smoke or burning", am: "ማጨስ ወይም ማቃጠል" },
  taken_by_mouth: { en: "Taken by mouth", am: "የሚጠጣ ወይም የሚበላ" },
  snuffed_into_nose: { en: "Sniffed into the nose", am: "በአፍንጫ የሚማግ" },
  applied_to_skin: { en: "Washed or applied on the body", am: "በሰውነት የሚቀባ ወይም የሚታጠብ" },
  applied_near_eyes: { en: "Applied around the eyes", am: "በዓይን ዙሪያ የሚኳል" },
  given_to_another_person: { en: "Given to another person", am: "ለሌላ ሰው የሚሰጥ" },
};
