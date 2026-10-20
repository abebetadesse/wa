/**
 * Server messages (case updates, chat-bot replies) in the recipient's preferred language, from the
 * same local phrase catalogues the in-page translator uses. Nothing is sent to a translation service.
 *
 * Write each message as tr("English with {} holes", ...values); `node scripts/i18n.mjs sync` collects
 * the first argument of tr() into the catalogue. Values are translated too when the catalogue has
 * them (domain labels, stage names). Anything without a translation stays in English.
 */
import { COMMON_PHRASES, ROUTE_PHRASES, type CatalogueLanguage } from "@/lib/i18n/phrases/sections";

export type ServerLanguage = "en" | CatalogueLanguage;
export type Translate = (phrase: string, ...values: Array<string | number>) => string;

const SERVER_LANGUAGES: readonly ServerLanguage[] = ["en", "am", "om", "ti", "so"];

/** users.preferredLanguage, or anything else, as a language the server can write in; English otherwise. */
export function toServerLanguage(value: unknown): ServerLanguage {
  return typeof value === "string" && (SERVER_LANGUAGES as readonly string[]).includes(value) ? (value as ServerLanguage) : "en";
}

/** Must match normalize() in scripts/i18n.mjs. */
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

/** Builds tr() over a catalogue (English phrase -> translation with {0}, {1} holes). */
export function translatorFrom(catalogue: ReadonlyMap<string, string> | null): Translate {
  return (phrase, ...values) => {
    const translated = catalogue?.get(normalize(phrase));
    if (translated === undefined) {
      let index = 0;
      return phrase.replace(/\{\}/g, () => String(values[index++] ?? ""));
    }
    return translated.replace(/\{(\d+)\}/g, (whole, position: string) => {
      const value = values[Number(position)];
      if (value === undefined) return whole;
      const text = String(value);
      return catalogue?.get(normalize(text)) ?? text;
    });
  };
}

/** English: the source text with its holes filled. */
export const englishText: Translate = translatorFrom(null);

const catalogues = new Map<CatalogueLanguage, Promise<Map<string, string>>>();

async function loadCatalogue(language: CatalogueLanguage): Promise<Map<string, string>> {
  // Shared phrases last, so they win over a route's copy of the same phrase.
  const loaders = [...Object.values(ROUTE_PHRASES[language]), ...COMMON_PHRASES[language]];
  const modules = await Promise.all(loaders.map((loader) => loader()));
  const catalogue = new Map<string, string>();
  for (const loaded of modules) {
    for (const [phrase, translated] of Object.entries(loaded.default)) {
      if (!phrase.startsWith("_") && typeof translated === "string" && translated) catalogue.set(phrase, translated);
    }
  }
  return catalogue;
}

/** tr() for a language; English when the language is unknown or its catalogue cannot be read. */
export async function serverText(language: unknown): Promise<Translate> {
  const resolved = toServerLanguage(language);
  if (resolved === "en") return englishText;
  let pending = catalogues.get(resolved);
  if (!pending) {
    pending = loadCatalogue(resolved);
    catalogues.set(resolved, pending);
    pending.catch(() => catalogues.delete(resolved));
  }
  try {
    return translatorFrom(await pending);
  } catch (error) {
    console.error(`[i18n] could not load the ${resolved} catalogue:`, error instanceof Error ? error.message : error);
    return englishText;
  }
}
