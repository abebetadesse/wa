"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  ChevronDown,
  Contrast,
  FileText,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Shield,
  Sparkles,
  Store,
  Sun,
  User,
  UserCog,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/ThemeContext";
import { useSession } from "@/features/session/SessionProvider";
import { NotificationBell } from "@/features/realtime/NotificationBell";
import { useExplore } from "@/features/toolkit/useExplore";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/marketplace", label: "Find a healer", icon: Search },
  { href: "/business", label: "For businesses", icon: Store },
];

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "am", label: "አማ" },
  { code: "om", label: "ORO" },
  { code: "ti", label: "ትግ" },
  { code: "so", label: "SO" },
] as const;

const ADMIN_ROLES = ["super_admin", "admin", "editor", "reviewer", "analyst"];

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const exploreRef = useOutsideClose(exploreOpen, () => setExploreOpen(false));
  const accountRef = useOutsideClose(accountOpen, () => setAccountOpen(false));

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    return path === "/" ? pathname === "/" : pathname.startsWith(path);
  };

  const explore = useExplore();
  const primary = PRIMARY;
  const exploreGroups = explore?.groups ?? [];

  const accountLinks = [
    { href: "/account", label: t.nav.account, icon: UserCog },
    { href: "/account/bookings", label: t.nav.bookings, icon: CalendarCheck },
    { href: "/messages", label: t.nav.messages, icon: MessageCircle },
    { href: "/business", label: "My business", icon: Briefcase },
    { href: "/case/workflows", label: "My cases", icon: BookOpen },
    ...(user?.permissions?.includes("cases:review") || user?.role === "admin" || user?.role === "super_admin"
      ? [{ href: "/case-review", label: "Case request review", icon: FileText }]
      : []),
    { href: "/profile", label: t.nav.profile, icon: User },
    ...(user && ADMIN_ROLES.includes(user.role) ? [{ href: "/admin", label: t.nav.admin, icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-gold via-amber-500 to-brand-strong font-geez text-lg font-bold text-inverse-foreground shadow-lg shadow-gold/25 transition-transform group-hover:scale-105">
            ጥ
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-[15px] font-extrabold tracking-tight text-foreground">{t.nav.brand}</span>
            <span className="text-[11px] font-medium text-muted-foreground">{t.nav.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 xl:flex">
          {primary.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                isActive(link.href) ? "bg-brand/10 text-brand-strong" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <link.icon className="size-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
          <div className="relative" ref={exploreRef}>
            <button
              type="button"
              onClick={() => setExploreOpen((value) => !value)}
              aria-expanded={exploreOpen}
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {t.nav.overview} <ChevronDown className={cn("size-4 transition-transform", exploreOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {exploreOpen && (
              <div className="absolute left-0 mt-2 max-h-[70vh] w-[40rem] overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-2xl backdrop-blur-xl">
                {exploreGroups.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">{t.common.loading}</p>}
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  {exploreGroups.map((group) => (
                    <div key={group.group}>
                      <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</p>
                      {group.tools.map((tool) => (
                        <Link key={tool.key} href={tool.href} title={tool.description} className="block rounded-xl px-3 py-1.5 text-sm text-foreground hover:bg-accent">
                          {tool.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="hidden items-center rounded-full border border-border bg-card/60 p-0.5 text-[11px] xl:flex" role="group" aria-label="Language">
            {LANGUAGES.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => setLanguage(option.code)}
                translate="no"
                aria-pressed={language === option.code}
                className={cn(
                  "rounded-full px-2 py-1 font-semibold transition-colors",
                  language === option.code ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && theme === "dark" ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={mounted && highContrast}
            className={cn("hidden size-10 items-center justify-center rounded-full hover:bg-accent sm:inline-flex", mounted && highContrast ? "text-gold" : "text-muted-foreground hover:text-foreground")}
            aria-label="Toggle high contrast"
          >
            <Contrast className="size-5" aria-hidden="true" />
          </button>

          {user && <NotificationBell />}

          {loading ? (
            <span className="h-10 w-24 animate-pulse rounded-full bg-muted" aria-label="Loading account" />
          ) : user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
                className="flex items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3 text-sm font-semibold text-foreground hover:border-input"
              >
                <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-strong text-xs font-bold text-inverse-foreground">
                  {(user.name || user.email)[0]?.toUpperCase()}
                </span>
                <span className="hidden max-w-[8rem] truncate sm:inline">{user.name || user.email.split("@")[0]}</span>
                <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-xl">
                  <p className="truncate px-3 pb-2 pt-1 text-xs text-muted-foreground">{user.email}</p>
                  {accountLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent">
                      <link.icon className="size-4 text-muted-foreground" aria-hidden="true" /> {link.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      window.location.href = "/";
                    }}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger hover:bg-danger/10"
                  >
                    <LogOut className="size-4" aria-hidden="true" /> {t.auth.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/auth?next=${encodeURIComponent(pathname)}&via=menu`} className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-brand-strong">
              <LogIn className="size-4" aria-hidden="true" /> {t.auth.login}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-accent xl:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Mobile" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background px-4 pb-6 pt-3 xl:hidden">
          <div className="flex flex-col gap-1">
            {primary.map((link) => (
              <Link key={link.href} href={link.href} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-semibold text-foreground hover:bg-accent">
                <link.icon className="size-5 text-brand" aria-hidden="true" /> {link.label}
              </Link>
            ))}
          </div>
          {exploreGroups.map((group) => (
            <div key={group.group}>
              <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{group.label}</p>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {group.tools.map((tool) => (
                  <Link key={tool.key} href={tool.href} className="rounded-xl px-3 py-2 text-sm text-foreground hover:bg-accent">
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 flex flex-wrap gap-1 px-2" role="group" aria-label="Language">
            {LANGUAGES.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => setLanguage(option.code)}
                translate="no"
                aria-pressed={language === option.code}
                className={cn("rounded-full border px-3 py-1 text-xs font-semibold", language === option.code ? "border-brand bg-brand text-primary-foreground" : "border-border text-muted-foreground")}
              >
                {option.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
