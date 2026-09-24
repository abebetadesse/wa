"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Users,
  RefreshCw,
  Briefcase,
  Sparkles,
  Compass,
} from "lucide-react";
import { notifyAuthStateChanged } from "@/lib/auth/clientEvents";

const DEMO_PRESETS = [
  {
    role: "Case Client / Filer",
    name: "Almaz Bekele",
    email: "almaz.bekele@ethio-wellness.org",
    password: "Ethiowellbeing@2026!",
    badge: "Case Filer",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    desc: "Personal profile with active career and spiritual cases",
  },
  {
    role: "Case Reviewer",
    name: "Dr. Yemane Tesfaye",
    email: "yemane.reviewer@ethio-wellness.org",
    password: "Ethiowellbeing@2026!",
    badge: "Reviewer",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    desc: "Verified practitioner with case review authority",
  },
  {
    role: "Administrator",
    name: "Mekonnen Birhanu",
    email: "mekonnen.admin@ethio-wellness.org",
    password: "Ethiowellbeing@2026!",
    badge: "Admin",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    desc: "System supervisor and case dispatcher",
  },
] as const;

type AuthTab = "login" | "register" | "forgot";

function normalizeAuthTab(mode: string | null): AuthTab {
  if (mode === "register" || mode === "forgot") return mode;
  return "login";
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMode = normalizeAuthTab(searchParams.get("mode"));
  const nextParam = searchParams.get("next");
  const isCaseDestination = Boolean(nextParam?.startsWith("/case"));

  const [tab, setTab] = useState<AuthTab>(requestedMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register Form - 3 Steps
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("+251 9");
  const [regDob, setRegDob] = useState("1995-01-01");
  const [regLanguage, setRegLanguage] = useState("am");
  const [regRegion, setRegRegion] = useState("Addis Ababa");
  const [regGender, setRegGender] = useState("female");
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [demoResetToken, setDemoResetToken] = useState<string | null>(null);

  useEffect(() => {
    setTab((currentTab) => (currentTab === requestedMode ? currentTab : requestedMode));
  }, [requestedMode]);

  const switchTab = (nextTab: AuthTab) => {
    setTab(nextTab);
    setError("");
    setSuccessMsg("");
    const nextQuery = nextParam ? `&next=${encodeURIComponent(nextParam)}` : "";
    router.replace(`/auth?mode=${nextTab}${nextQuery}`, { scroll: false });
  };

  // Password strength calculation
  const strengthCriteria = {
    length: regPassword.length >= 8,
    upper: /[A-Z]/.test(regPassword),
    lower: /[a-z]/.test(regPassword),
    number: /[0-9]/.test(regPassword),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(regPassword),
  };
  const strengthScore = Object.values(strengthCriteria).filter(Boolean).length;

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      const nextPath = searchParams.get("next");
      if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
        notifyAuthStateChanged();
        router.push(nextPath);
        router.refresh();
        return;
      }

      // Check if user is admin or regular user
      const userRole = data.data?.role;
      if (["super_admin", "admin", "editor", "reviewer", "analyst"].includes(userRole)) {
        router.push("/admin");
      } else {
        router.push("/profile/onboarding");
      }
      notifyAuthStateChanged();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterStep1(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!regEmail || !regPassword) {
      setError("Please fill all required account fields.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (strengthScore < 4) {
      setError("Password must meet at least 4 security criteria.");
      return;
    }
    if (!acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }
    setRegisterStep(2);
  }

  async function handleRegisterStep2(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          confirmPassword: regConfirmPassword,
          fullName: regFullName,
          phone: regPhone,
          dateOfBirth: regDob,
          preferredLanguage: regLanguage,
          region: regRegion,
          gender: regGender,
          acceptTerms,
          acceptPrivacy: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      setRegisteredUserId(data.data.id);
      if (data.data.demoOtpCode) {
        setDemoCodeNotice(data.data.demoOtpCode);
        setVerificationCode(data.data.demoOtpCode); // prefill for frictionless dev experience
      }
      setRegisterStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification failed");
      }

      notifyAuthStateChanged();
      const nextPath = searchParams.get("next");
      if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
        router.push(nextPath);
      } else {
        router.push("/profile/onboarding");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Resend failed");
      if (data.data?.demoOtpCode) {
        setDemoCodeNotice(data.data?.demoOtpCode);
        setVerificationCode(data.data?.demoOtpCode);
      }
      setSuccessMsg("A new verification code has been dispatched.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Request failed");
      setSuccessMsg(data.data?.message || "Reset link dispatched.");
      if (data.data?.demoResetToken) {
        setDemoResetToken(data.data?.demoResetToken);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-500 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <span>ጥ</span>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl text-white tracking-tight block group-hover:text-emerald-400 transition-colors">
                Ethiopian Wisdom
              </span>
              <span className="text-xs text-emerald-400/90 font-medium font-mono">Enterprise Access Gateway • መግቢያ በር</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isCaseDestination
              ? "Access Your Case Workspace"
              : tab === "login"
              ? "Sign In to Your Workspace"
              : tab === "register"
              ? "Create Your Holistic Wellbeing Account"
              : "Recover Your Account Password"}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            {isCaseDestination
              ? "Sign in to manage and review your confidential traditional & modern case inquiries."
              : tab === "login"
              ? "Access scientific evaluations, Awde Negest divination sessions, and traditional wellbeing records."
              : tab === "register"
              ? "Join certified debteras, scientific nutritionists, and patients across all Ethiopian regions."
              : "Enter your registered email to receive a password recovery verification token."}
          </p>
        </div>

        {/* Case Destination Awareness Banner */}
        {isCaseDestination && (
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-zinc-900/90 to-amber-950/50 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 backdrop-blur-xl">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-emerald-300 shadow-inner">
                <Briefcase className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Destination: Case Workflow Gateway
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      {nextParam}
                    </span>
                  </div>
                  <Link
                    href="/case"
                    className="text-[11px] text-amber-300 hover:text-amber-200 underline flex items-center gap-0.5"
                  >
                    Browse Overview →
                  </Link>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Authentication is required to protect your private personal history, debtera healing scrolls, and cultural case records. Once signed in, you will be redirected straight to your workspace.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 size={12} /> Confidential &amp; Encrypted
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <Shield size={12} /> 5 Care Domains
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <Sparkles size={12} /> Direct Case Resume
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {nextParam && !isCaseDestination && (
          <div className="mb-6 p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">🔒 Destination:</span>
              <span className="font-mono text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                {nextParam}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Sign in to continue to your page</span>
          </div>
        )}

        {/* Auth Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative backdrop-blur-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-6 gap-2">
            <button
              onClick={() => switchTab("login")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${tab === "login"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
            >
              Sign In (ግባ)
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${tab === "register"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
            >
              Register (ተመዝገብ)
            </button>
            <button
              onClick={() => switchTab("forgot")}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${tab === "forgot"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
            >
              Forgot Password
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-start gap-3 text-emerald-300 text-sm">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === "login" && (
            <div className="space-y-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address / የኢሜይል አድራሻ <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. mekonnen.admin@ethio-wellness.org"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Password / የይለፍ ቃል <span className="text-emerald-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => switchTab("forgot")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-300">Remember this device (30 days)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-950/50 transition-all text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" /> Verifying credentials...
                    </span>
                  ) : (
                    <>
                      <span>
                        {isCaseDestination ? "Sign In & Open Case Workspace" : "Sign In to Platform"}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Access Bar */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    Quick Demo Credentials / ፈጣን መግቢያ
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">1-Click Fill</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_PRESETS.map((p) => {
                    const isSelected = loginEmail === p.email;
                    return (
                      <button
                        key={p.email}
                        type="button"
                        onClick={() => {
                          setLoginEmail(p.email);
                          setLoginPassword(p.password);
                          setError("");
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-emerald-950/70 border-emerald-500/60 text-white ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/40"
                            : "bg-black/30 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${p.badgeColor}`}>
                            {p.badge}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {isSelected ? "Filled ✓" : "Fill"}
                          </span>
                        </div>
                        <p className="text-xs font-semibold truncate text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">{p.email.split("@")[0]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-STEP REGISTER */}
          {tab === "register" && (
            <div>
              {/* Stepper Header */}
              <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                <div
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${registerStep >= 1
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-950/40"
                    : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                >
                  <span>1. Credentials</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${registerStep >= 2
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-950/40"
                    : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                >
                  <span>2. Profile</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${registerStep >= 3
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-950/40"
                    : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                >
                  <span>3. Verify OTP</span>
                </div>
              </div>

              {/* STEP 1: Account credentials */}
              {registerStep === 1 && (
                <form onSubmit={handleRegisterStep1} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address / የኢሜይል አድራሻ <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@domain.et"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Password / የይለፍ ቃል <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {regPassword.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <div className="flex gap-1.5 h-1.5">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`flex-1 rounded-full transition-colors ${strengthScore >= lvl
                                ? strengthScore <= 2
                                  ? "bg-rose-500"
                                  : strengthScore <= 3
                                    ? "bg-amber-400"
                                    : "bg-emerald-500"
                                : "bg-white/10"
                                }`}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1 font-mono">
                          <span className={strengthCriteria.length ? "text-emerald-400 font-bold" : ""}>
                            {strengthCriteria.length ? "✓" : "○"} 8+ Characters
                          </span>
                          <span className={strengthCriteria.upper ? "text-emerald-400 font-bold" : ""}>
                            {strengthCriteria.upper ? "✓" : "○"} Uppercase Letter
                          </span>
                          <span className={strengthCriteria.number ? "text-emerald-400 font-bold" : ""}>
                            {strengthCriteria.number ? "✓" : "○"} Number
                          </span>
                          <span className={strengthCriteria.special ? "text-emerald-400 font-bold" : ""}>
                            {strengthCriteria.special ? "✓" : "○"} Special Symbol
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Confirm Password / የይለፍ ቃል ማረጋገጫ <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                      />
                    </div>
                    {regConfirmPassword && (
                      <span className={`text-[11px] block mt-1 font-mono ${regPassword === regConfirmPassword ? "text-emerald-400 font-bold" : "text-rose-400"}`}>
                        {regPassword === regConfirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed">
                        I accept the <span className="text-emerald-400 underline">Terms of Service</span> and acknowledge the Ethiopian Ministry of health and EFMHACA ethical compliance guidelines.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Proceed to Ethiopian Profile (ቀጥል)</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* STEP 2: Ethiopian localized profile */}
              {registerStep === 2 && (
                <form onSubmit={handleRegisterStep2} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name / ሙሉ ስም <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Almaz Bekele Worku / አልማዝ በቀለ ወርቁ"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Phone / ስልክ ቁጥር (+251)
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+251 91 123 4567"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Date of Birth / የልደት ቀን
                      </label>
                      <input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Preferred Language / ተመራጭ ቋንቋ
                      </label>
                      <select
                        value={regLanguage}
                        onChange={(e) => setRegLanguage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                      >
                        <option value="am">አማርኛ (Amharic)</option>
                        <option value="om">Afaan Oromoo</option>
                        <option value="en">English</option>
                        <option value="ti">ትግርኛ (Tigrinya)</option>
                        <option value="so">Af-Soomaali</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Region (Ethiopia) / ክልል
                      </label>
                      <select
                        value={regRegion}
                        onChange={(e) => setRegRegion(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                      >
                        <option value="Addis Ababa">Addis Ababa (አዲስ አበባ)</option>
                        <option value="Amhara">Amhara (አማራ)</option>
                        <option value="Oromia">Oromia (ኦሮሚያ)</option>
                        <option value="Tigray">Tigray (ትግራይ)</option>
                        <option value="Sidama">Sidama (ሲዳማ)</option>
                        <option value="Somali">Somali (ሶማሌ)</option>
                        <option value="Dire Dawa">Dire Dawa (ድሬዳዋ)</option>
                        <option value="Harari">Harari (ሐረሪ)</option>
                        <option value="Central Ethiopia">Central Ethiopia (ማዕከላዊ ኢትዮጵያ)</option>
                        <option value="South Ethiopia">South Ethiopia (ደቡብ ኢትዮጵያ)</option>
                        <option value="Southwest Ethiopia">Southwest Ethiopia (ደቡብ ምዕራብ)</option>
                        <option value="Afar">Afar (ዓፋር)</option>
                        <option value="Benishangul-Gumuz">Benishangul-Gumuz (ቤኒሻንጉል ጉሙዝ)</option>
                        <option value="Gambela">Gambela (ጋምቤላ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-medium flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      {loading ? "Creating Account..." : "Complete Registration & Send OTP"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: OTP Verification */}
              {registerStep === 3 && (
                <form onSubmit={handleVerify} className="space-y-5 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
                    <KeyRound size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Account Created! Verify Your Code</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      We sent a 6-digit confirmation code to <strong className="text-slate-200">{regEmail}</strong>.
                    </p>
                  </div>

                  {demoCodeNotice && (
                    <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-300 text-xs text-left flex items-start gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong>Verification Code (Test Mode):</strong>
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                            {demoCodeNotice}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-400/80">
                          Pre-filled below for frictionless testing. Click verify to enter your workspace.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="w-48 mx-auto text-center tracking-widest text-2xl font-mono py-2.5 rounded-xl bg-black/40 border border-white/20 text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      {loading ? "Verifying..." : "Verify & Launch Workspace"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-xs text-slate-400 hover:text-emerald-400 underline block mx-auto pt-1"
                    >
                      Didn't receive the code? Resend Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === "forgot" && (
            <div>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Registered Email / የተመዘገበ ኢሜይል <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. almaz.bekele@ethio-wellness.org"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {demoResetToken && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-300 text-xs space-y-1">
                    <strong>Generated Password Reset Token:</strong>
                    <div className="font-mono text-[11px] bg-black/50 p-2 rounded mt-1 break-all text-emerald-400">
                      {demoResetToken}
                    </div>
                    <Link
                      href={`/auth/reset-password?token=${demoResetToken}`}
                      className="mt-2 inline-block text-xs font-semibold text-amber-300 underline"
                    >
                      → Click here to navigate directly to password reset form
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : "Send Password Reset Link"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Ethiopian Wisdom Platform v3.0 Enterprise • Precision Nutrition (EFCT 2025) • Traditional Treatment Safety (ETM-DB)
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" /></div>}>
      <AuthPageInner />
    </Suspense>
  );
}
