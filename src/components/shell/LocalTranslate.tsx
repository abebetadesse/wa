"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { getDomTranslator } from "@/lib/i18n/domTranslator";
import { routeSection, translationEngine } from "@/lib/i18n/engine";
import { CATALOGUE_LANGUAGES, COMMON_PHRASES, ROUTE_PHRASES, type CatalogueLanguage } from "@/lib/i18n/phrases/sections";

declare global {
  interface Window {
    /** Lists English text on screen that the active language's catalogue does not cover yet. */
    ethioMissingPhrases?: () => string[];
  }
}

/** Languages translated from a local phrase catalogue. Oromo, Tigrinya and Somali fall back to Google Translate on routes their catalogue does not cover (see translationEngine). */
export const LOCAL_LANGUAGES = CATALOGUE_LANGUAGES;

export function isLocalLanguage(language: string): boolean {
  return (LOCAL_LANGUAGES as readonly string[]).includes(language);
}

/** Catalogue files already handed to the translator, as "language:section". */
const loaded = new Set<string>();

function load(language: CatalogueLanguage, name: string, loader: () => Promise<{ default: Record<string, string> }>) {
  const key = `${language}:${name}`;
  if (loaded.has(key)) return;
  loaded.add(key);
  loader()
    .then((module) => {
      const translator = getDomTranslator();
      // The language changed while this file was loading: its phrases must not be applied.
      if (translator.language !== language) {
        loaded.delete(key);
        return;
      }
      translator.addPhrases(module.default);
    })
    .catch(() => {
      // Offline or a failed chunk: try again on the next navigation.
      loaded.delete(key);
    });
}

/** Shows the page in the chosen language from the local catalogue: no network translation service involved. */
export default function LocalTranslate() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const active = translationEngine(language, pathname) === "local";

  useEffect(() => {
    if (active || language === "en") document.documentElement.lang = language;
  }, [active, language]);

  useEffect(() => {
    if (!active) return;
    const translator = getDomTranslator();
    if (translator.language !== language) {
      translator.reset(language);
      loaded.clear();
    }
    translator.start();
    window.ethioMissingPhrases = () => translator.missingPhrases();
    // Choosing the language that is already active translates the page again, in case anything was missed.
    const retranslate = () => translator.refresh();
    window.addEventListener("ethio:language-change", retranslate);
    return () => {
      window.removeEventListener("ethio:language-change", retranslate);
      translator.stop();
    };
  }, [active, language]);

  useEffect(() => {
    if (!active) return;
    const lang = language as CatalogueLanguage;
    COMMON_PHRASES[lang].forEach((loader, index) => load(lang, `common:${index}`, loader));
    const section = routeSection(pathname);
    const loader = ROUTE_PHRASES[lang][section];
    if (loader) load(lang, section, loader);
    getDomTranslator().refresh();
  }, [active, language, pathname]);

  return null;
}
