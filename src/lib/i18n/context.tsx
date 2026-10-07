"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, TRANSLATIONS, Translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "am",
  setLanguage: () => {},
  t: TRANSLATIONS.am,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("am");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("ethio_lang") as Language | null;
    if (saved && (saved === "en" || saved === "am" || saved === "om" || saved === "ti" || saved === "so")) {
      setLanguageState(saved);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ethio_lang", lang);
      window.dispatchEvent(new CustomEvent("ethio:language-change", { detail: lang }));
    }
  };

  const activeLanguage = isHydrated ? language : "am";

  return (
    <LanguageContext.Provider
      value={{
        language: activeLanguage,
        setLanguage,
        t: TRANSLATIONS[activeLanguage] || TRANSLATIONS.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
