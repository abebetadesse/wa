"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { getDomTranslator } from "@/lib/i18n/domTranslator";
import { COMMON_PHRASES, ROUTE_PHRASES } from "@/lib/i18n/phrases/sections";

declare global {
  interface Window {
    /** Lists English text on screen that the Amharic catalogue does not cover yet. */
    ethioMissingPhrases?: () => string[];
  }
}

/** Languages translated from the local phrase catalogue rather than by Google Translate. */
export const LOCAL_LANGUAGES = ["am"] as const;

export function isLocalLanguage(language: string): boolean {
  return (LOCAL_LANGUAGES as readonly string[]).includes(language);
}

const loaded = new Set<string>();

function load(name: string, loader: () => Promise<{ default: Record<string, string> }>) {
  if (loaded.has(name)) return;
  loaded.add(name);
  loader()
    .then((module) => getDomTranslator().addPhrases(module.default))
    .catch(() => {
      // Offline or a failed chunk: try again on the next navigation.
      loaded.delete(name);
    });
}

/** Shows the page in Amharic from the local catalogue: no network translation service involved. */
export default function LocalTranslate() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const active = isLocalLanguage(language);

  useEffect(() => {
    if (active || language === "en") document.documentElement.lang = language;
  }, [active, language]);

  useEffect(() => {
    if (!active) return;
    const translator = getDomTranslator();
    translator.start();
    window.ethioMissingPhrases = () => translator.missingPhrases();
    return () => translator.stop();
  }, [active, language]);

  useEffect(() => {
    if (!active) return;
    COMMON_PHRASES.forEach((loader, index) => load(`common:${index}`, loader));
    const section = pathname.split("/")[1] ?? "";
    const loader = ROUTE_PHRASES[section];
    if (loader) load(section, loader);
    getDomTranslator().refresh();
  }, [active, pathname]);

  return null;
}
