"use client";

import Link from "next/link";
import { ChevronDown, Compass, User, Shield, LogOut, Moon, Sun, Contrast, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/ThemeContext";
import { AUTH_STATE_CHANGED } from "@/lib/auth/clientEvents";
import { getClientUser, invalidateClientUser } from "@/lib/auth/clientState";

type CurrentUser = {
  name?: string | null;
  email: string;
  role: string;
};

const PUBLIC_PATHS = [
  "/",
  "/auth",
  "/emergency",
  "/safety",
  "/discover",
  "/cultural",
  "/awde-negast",
  "/constitution",
  "/somatics",
  "/ecology",
  "/fasting",
  "/zoonotic",
  "/foods",
  "/atlas",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshUser = useCallback(async () => {
    if (isPublicPath(pathname)) {
      setCurrentUser(null);
      setIsLoadingUser(false);
      return;
    }

    try {
      const user = await getClientUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, [pathname]);

  useEffect(() => {
    void refreshUser();
    const handleAuthChange = () => {
      invalidateClientUser();
      void refreshUser();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshUser();
    };
    window.addEventListener(AUTH_STATE_CHANGED, handleAuthChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED, handleAuthChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshUser]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navigationGroups = [
    {
      label: "Core workflow",
      links: [
        { href: "/", label: t.nav.overview },
        { href: "/case", label: "Start a holistic case", tone: "case" },
        { href: "/discover", label: "Explore mechanisms", tone: "discover" },
        { href: "/integrative", label: "Integrative assessment", tone: "integrative" },
        { href: "/intake", label: t.nav.intake },
        { href: "/diagnostic", label: t.nav.diagnostic || "Diagnostic Portal", tone: "diagnostic" },
        { href: "/wellness", label: "Today's Wellness" },
        { href: "/profile", label: "Personal Profile", tone: "profile" },
      ],
    },
    {
      label: "Explore",
      links: [
        { href: "/constitution", label: "Constitution" },
        { href: "/ecology", label: "Ecology & Soils" },
        { href: "/fasting", label: "Fasting & Timing" },
        { href: "/zoonotic", label: "Terroir & Safety" },
        { href: "/cultural", label: "Astral & Heritage" },
        { href: "/somatics", label: "Coffee Somatics" },
        { href: "/library", label: "Library" },
        { href: "/library/medicinal-plants", label: "Medicinal Atlas" },
      ],
    },
    {
      label: "Platform",
      links: [
        { href: "/governance", label: t.nav.governance },
        { href: "/atlas", label: t.nav.atlas },
        { href: "/emergency", label: t.nav.emergency },
        { href: "/audit", label: t.nav.audit },
      ],
    },
  ];

  const activeLabel = navigationGroups.flatMap((group) => group.links).find((link) => link.href === pathname)?.label;

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="app-container site-header-inner flex items-center justify-between h-20">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-950/40">
            <span className="text-xl">ጥ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight group-hover:text-emerald-400 transition-colors">
                {t.nav.brand}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-full">
                v3.0 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {t.nav.tagline}
            </p>
          </div>
        </Link>

        <div className="navigation-dropdown" ref={menuRef}>
          <button
            type="button"
            className={`navigation-trigger ${isMenuOpen ? "is-open" : ""}`}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <Compass size={16} aria-hidden="true" />
            <span>{activeLabel || "Explore platform"}</span>
            <ChevronDown size={15} aria-hidden="true" className="navigation-chevron" />
          </button>
          <button
            type="button"
            className="navigation-mobile-trigger md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
          {isMenuOpen && (
            <nav id="primary-navigation" className="navigation-dropdown-panel" aria-label="Platform navigation">
              {navigationGroups.map((group) => (
                <div key={group.label} className="navigation-group">
                  <p className="navigation-group-label">{group.label}</p>
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`navigation-link ${link.tone ? `navigation-link-${link.tone}` : ""} ${pathname === link.href ? "is-active" : ""}`}
                    >
                      {link.tone === "diagnostic" && <span className="navigation-status-dot" />}
                      {link.tone === "profile" && <span aria-hidden="true">✨</span>}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Action Controls & Language Selector */}
        <div className="header-actions flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-pill-ghost p-2"
            title={mounted ? `Switch to ${theme === "light" ? "dark" : "light"} mode` : "Switch to dark mode"}
            aria-label={mounted ? `Switch to ${theme === "light" ? "dark" : "light"} mode` : "Switch to dark mode"}
          >
            {mounted && theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`btn-pill-ghost p-2 ${mounted && highContrast ? "text-amber-500" : ""}`}
            title="Toggle high contrast"
            aria-label="Toggle high contrast"
          >
            <Contrast size={16} />
          </button>
          {/* Language Selector */}
          <div className="theme-control-surface flex items-center rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === "en" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("am")}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === "am" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              አማ
            </button>
            <button
              type="button"
              onClick={() => setLanguage("om")}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === "om" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              ORO
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ti")}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === "ti" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              ትግ
            </button>
            <button
              type="button"
              onClick={() => setLanguage("so")}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                language === "so" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              SO
            </button>
          </div>

          {/* Admin & Auth Status */}
          {!mounted || isLoadingUser ? (
            <span className="h-8 w-20 animate-pulse rounded-lg bg-white/5" aria-label="Loading account" />
          ) : currentUser ? (
            <div className="flex items-center gap-2">
              {["super_admin", "admin", "editor", "reviewer", "analyst"].includes(currentUser.role) && (
                <Link
                  href="/admin"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-900/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Shield size={13} />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-colors"
                title={`${currentUser.name || currentUser.email} (${currentUser.role})`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] font-bold text-white">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name || currentUser.email.split("@")[0]}</span>
                <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded">
                  {currentUser.role === "super_admin" ? "Super" : currentUser.role}
                </span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                  setCurrentUser(null);
                  window.location.href = "/auth";
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs transition-colors border border-transparent hover:border-rose-500/30"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <User size={13} />
              <span>Sign In</span>
            </Link>
          )}

          <Link href="/case" className="btn-primary text-xs py-2 px-3.5">
            {t.nav.evaluateBtn}
          </Link>
        </div>
      </div>
    </header>
  );
}
