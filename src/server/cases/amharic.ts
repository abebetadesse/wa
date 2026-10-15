/**
 * Amharic for the person-facing text of case reports.
 *
 * `amharicPhrases.json` maps each English line the report can draw from the case vocabularies
 * (themes, guidance, steps, questions, warning signs, checks, strand readings, referrals, profile
 * context) to Amharic. The same pairs are registered with the in-page translator (_extra.json), so
 * the reviewer desk reads in Amharic too. A line with no entry is kept in English and reported, so
 * the reviewer can see exactly what still needs a translator; `case-analysis.test.mjs` checks that
 * every vocabulary line has one.
 */
import PHRASES from "./amharicPhrases.json";

export type ReportLanguage = "en" | "am";

export const REPORT_LANGUAGES: Record<ReportLanguage, string> = { en: "English", am: "አማርኛ (Amharic)" };

const TABLE = PHRASES as Record<string, string>;

/** The Amharic for a vocabulary line, or undefined. */
export function amharicFor(text: string): string | undefined {
  return TABLE[text] ?? TABLE[text.trim()];
}

/**
 * A translator for one report: in Amharic mode it returns the table's line and remembers every
 * English line it could not translate; in English mode it returns the text unchanged.
 */
export function createTranslator(language: ReportLanguage) {
  const untranslated = new Set<string>();
  const t = (text: string | undefined): string => {
    if (!text || language === "en") return text ?? "";
    const hit = amharicFor(text);
    if (hit) return hit;
    if (/[A-Za-z]{3}/.test(text)) untranslated.add(text);
    return text;
  };
  return { t, untranslated };
}

/** Pairs for the in-page translator's hand-added catalogue (`node scripts/i18n.mjs add`). */
export function amharicPairs(): Record<string, string> {
  return { ...TABLE };
}
