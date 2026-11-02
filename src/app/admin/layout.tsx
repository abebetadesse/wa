"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Radio,
  Compass,
  Pill,
  UserCheck,
  Wallet,
  ListFilter,
  PhoneCall,
} from "lucide-react";
import { withBasePath } from '@/lib/base-path';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch(withBasePath("/api/auth/me"))
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success || !data.data) {
          throw new Error(data.error || "Please sign in to access the admin console.");
        }
        return data;
      })
      .then((data) => {
        setCurrentUser(data.data);
      })
      .catch((error) => setAuthError(error instanceof Error ? error.message : "Unable to verify administrator access."))
      .finally(() => setLoading(false));
  }, [pathname]);

  // Close mobile nav when pathname changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    router.push("/auth");
    router.refresh();
  }

  async function handleStopImpersonation() {
    document.cookie = "ethio_impersonate=; Max-Age=0; path=/;";
    window.location.reload();
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/case-review", label: "Case request queue", icon: FileText },
    ...(currentUser?.role === "super_admin" ? [{ href: "/admin/case-routing", label: "Case routing", icon: Radio }] : []),
    { href: "/admin/marketplace", label: "Marketplace", icon: ShieldAlert },
    { href: "/admin/toolkit", label: "Healer toolkit", icon: Compass },
    { href: "/admin/safety", label: "Safety matrix", icon: Pill },
    { href: "/admin/emergency-numbers", label: "Emergency numbers", icon: PhoneCall },
    { href: "/admin/payments", label: "Payments & pricing", icon: Wallet },
    { href: "/admin/sign-up", label: "Sign-up & Telegram", icon: UserCheck },
    { href: "/admin/users", label: "Users & Accounts", icon: Users },
    { href: "/admin/roles", label: "Roles & Permissions", icon: KeyRound },
    { href: "/admin/knowledge", label: "Knowledge Base", icon: BookOpen },
    { href: "/admin/case-search", label: "Case search filters", icon: ListFilter },
    { href: "/admin/audit", label: "Audit Ledger", icon: FileText },
    { href: "/admin/analytics", label: "Analytics & Demographics", icon: BarChart3 },
    { href: "/admin/settings", label: "System & Governance", icon: Settings },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-8 text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p>Verifying administrator authorization...</p>
        </div>
      </main>
    );
  }

  if (authError || !currentUser) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6">
        <section className="glass-panel max-w-md p-8 text-center rounded-2xl border border-border shadow-raised">
          <ShieldAlert className="mx-auto mb-4 text-gold" size={36} />
          <h1 className="text-xl font-bold text-foreground">Administrator Access Required</h1>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {authError || "Your account credentials do not possess administrator rights to this control console."}
          </p>
          <Link href="/auth" className="btn-primary inline-flex mt-6 px-4 py-2 text-xs rounded-xl">
            Go to Sign In
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Impersonation Banner */}
      {currentUser?.isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gold-fill via-gold-fill to-gold-fill text-gold-foreground px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-panel">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="animate-pulse text-gold-strong shrink-0" />
            <span>
              Impersonation Mode: Browsing as <strong>{currentUser.name || currentUser.email}</strong> ({currentUser.role})
            </span>
          </div>
          <button
            onClick={handleStopImpersonation}
            className="px-2.5 py-1 bg-sunken/80 hover:bg-sunken/80 rounded text-[11px] font-bold border border-border-strong transition-all"
          >
            Stop Impersonating
          </button>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b border-border bg-[var(--bg-secondary)] ${currentUser?.isImpersonating ? "mt-8" : ""}`}>
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-gold-fill flex items-center justify-center font-bold text-brand-foreground text-sm shadow">
            ጥ
          </div>
          <span className="font-bold text-sm text-foreground">Admin Console</span>
        </Link>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-lg bg-foreground/5 border border-border text-soft hover:text-foreground"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-full md:w-64 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col justify-between ${
          currentUser?.isImpersonating ? "md:mt-8" : ""
        } ${isMobileNavOpen ? "block" : "hidden md:flex"}`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-gold-fill flex items-center justify-center font-bold text-brand-foreground shadow-md">
                <span className="text-lg">ጥ</span>
              </div>
              <div>
                <span className="font-bold text-base text-foreground tracking-tight group-hover:text-brand transition-colors block">
                  Admin Console
                </span>
                <span className="text-[10px] uppercase tracking-wider text-brand font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  <span>Control Plane v3.0</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-soft text-brand-strong border border-brand/30 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-brand" : "text-muted-foreground"} />
                    <span>{link.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-brand" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Badge */}
        <div className="p-4 border-t border-border bg-sunken/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-brand-soft border border-brand/40 flex items-center justify-center text-xs font-bold text-brand-strong shrink-0">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : "A"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">{currentUser.name || currentUser.email}</p>
                <p className="text-[10px] text-brand uppercase tracking-wider">
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 py-1.5 px-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-soft hover:text-foreground text-[11px] font-medium text-center border border-border transition-colors flex items-center justify-center gap-1"
            >
              <span>Main Portal</span>
              <ExternalLink size={12} />
            </Link>
            <button
              onClick={handleLogout}
              className="py-1.5 px-2.5 rounded-lg bg-danger-soft hover:bg-danger-soft text-danger-strong hover:text-danger-strong text-[11px] font-medium border border-danger/20 transition-colors flex items-center justify-center gap-1"
              title="Sign Out"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto ${currentUser?.isImpersonating ? "md:mt-8" : ""}`}>
        {children}
      </main>
    </div>
  );
}
