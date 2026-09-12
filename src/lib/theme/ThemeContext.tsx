"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [highContrast, setHighContrast] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("ninimed-theme");
    const storedContrast = window.localStorage.getItem("ninimed-contrast");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme === "dark" || (!storedTheme && prefersDark) ? "dark" : "light");
    setHighContrast(storedContrast === "true");
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("contrast-mode", theme === "dark" && highContrast);
    window.localStorage.setItem("ninimed-theme", theme);
    window.localStorage.setItem("ninimed-contrast", String(highContrast));
  }, [theme, highContrast, isHydrated]);

  return (
    <ThemeContext.Provider
      value={{
        theme: isHydrated ? theme : "light",
        toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
        highContrast: isHydrated ? highContrast : false,
        toggleHighContrast: () => setHighContrast((current) => !current),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
