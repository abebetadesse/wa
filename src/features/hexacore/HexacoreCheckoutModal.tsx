"use client";

import { useState, useCallback } from "react";
import {
  X,
  Sparkles,
  Smartphone,
  Building2,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  ArrowRight,
  Shield,
} from "lucide-react";
import type { HexacoreDossierReport } from "@/lib/hexacore/HexacoreDossierService";

interface HexacoreProduct {
  code: string;
  name: string;
  nameAm?: string | null;
  tagline?: string | null;
  taglineAm?: string | null;
  priceEtb: string | number;
  priceUsd: string | number;
  tier: string;
  badgeEn?: string | null;
  badgeAm?: string | null;
  features: Array<{ textEn: string; textAm: string; highlight?: boolean }>;
}

interface HexacoreCheckoutModalProps {
  product: HexacoreProduct;
  onClose: () => void;
  onUnlocked?: (dossier: HexacoreDossierReport, reference: string) => void;
  defaultLang?: "en" | "am";
}

type PaymentMethod = "telebirr" | "cbe_transfer" | "chapa";
type Step = "intake" | "payment" | "verify" | "success";

const t = {
  en: {
    title: "Unlock Your Natal Dossier",
    subtitle: "14-Layer Ethiopian Traditional Arcana Reading",
    fullName: "Your Full Name",
    fullNamePlaceholder: "e.g. Abebe Girma",
    motherName: "Mother's Name (for lineage calculation)",
    motherNamePlaceholder: "e.g. Tigist Lemma",
    birthDate: "Date of Birth",
    focusQuestion: "Focus Intention (optional)",
    focusQuestionPlaceholder: "e.g. What life direction should I pursue?",
    currency: "Currency",
    paymentMethod: "Payment Method",
    telebirr: "Telebirr Mobile",
    cbeTransfer: "CBE Bank Transfer",
    chapa: "Chapa / Card Gateway",
    next: "Continue to Payment",
    pay: "Confirm & Pay",
    verify: "Verify Payment",
    txRef: "Transaction Reference",
    txRefPlaceholder: "Enter Telebirr/CBE transaction code",
    copyRef: "Copy Reference",
    copied: "Copied!",
    verifying: "Verifying payment...",
    generating: "Generating your 14-layer dossier...",
    unlocked: "Dossier Unlocked!",
    viewDossier: "View Full Dossier",
    downloadPdf: "Download PDF",
    disclaimer: "Cultural reflection only — not a medical diagnosis.",
    requiredFields: "Please fill in your name and date of birth to continue.",
    invalidDate: "Please enter a valid date of birth (YYYY-MM-DD).",
    step1: "Personal Details",
    step2: "Choose Payment",
    step3: "Verify & Unlock",
    step4: "Complete",
  },
  am: {
    title: "የልደት ሰነድዎን ይክፈቱ",
    subtitle: "14-ደረጃ የኢትዮጵያ ባህላዊ አርካና ቅኝት",
    fullName: "ሙሉ ስምዎ",
    fullNamePlaceholder: "ለምሳሌ፡ አበበ ግርማ",
    motherName: "የእናት ስም (ለሐረግ ስሌት)",
    motherNamePlaceholder: "ለምሳሌ፡ ትጉስት ለማ",
    birthDate: "የልደት ቀን",
    focusQuestion: "የሕይወት ጥያቄ (ፈቃደኛ ከሆኑ)",
    focusQuestionPlaceholder: "ለምሳሌ፡ ምን ዓይነት የሕይወት አቅጣጫ ልከተል?",
    currency: "ምንዛሪ",
    paymentMethod: "የክፍያ ዘዴ",
    telebirr: "ቴሌብር ሞባይል",
    cbeTransfer: "ንግድ ባንክ ዝውውር",
    chapa: "ቻፓ / ካርድና ዲጂታል ክፍያ",
    next: "ወደ ክፍያ ይቀጥሉ",
    pay: "ያረጋግጡና ይክፈሉ",
    verify: "ክፍያ ያረጋግጡ",
    txRef: "የግብይት ቁጥር",
    txRefPlaceholder: "የቴሌብር/ባንክ ግብይት ቁጥር ያስገቡ",
    copyRef: "ቁጥሩን ቅዳ",
    copied: "ተቀድቷል!",
    verifying: "ክፍያ እያረጋገጥን ነው...",
    generating: "14ቱን ደረጃዎች እያሰናዳን ነው...",
    unlocked: "ሰነድዎ ተከፍቷል!",
    viewDossier: "ሙሉ ሰነድ ይመልከቱ",
    downloadPdf: "ፒዲኤፍ ያውርዱ",
    disclaimer: "ባህላዊ ማሰላሰያ ብቻ — የሕክምና ምርመራ አይደለም።",
    requiredFields: "ለመቀጠል ስምዎንና የልደት ቀንዎን ያስገቡ።",
    invalidDate: "ትክክለኛ የልደት ቀን (YYYY-MM-DD) ያስገቡ።",
    step1: "ግላዊ መረጃ",
    step2: "ክፍያ ምረጡ",
    step3: "ያረጋግጡ",
    step4: "ተጠናቋል",
  },
};

export default function HexacoreCheckoutModal({
  product,
  onClose,
  onUnlocked,
  defaultLang = "en",
}: HexacoreCheckoutModalProps) {
  const [lang, setLang] = useState<"en" | "am">(defaultLang);
  const [step, setStep] = useState<Step>("intake");
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("telebirr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form fields
  const [clientName, setClientName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [focusQuestion, setFocusQuestion] = useState("");

  // Purchase result
  const [purchaseReference, setPurchaseReference] = useState<string | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [txRef, setTxRef] = useState("");
  const [unlockedDossier, setUnlockedDossier] = useState<HexacoreDossierReport | null>(null);

  const i18n = t[lang];
  const priceEtb = typeof product.priceEtb === "number" ? product.priceEtb : parseFloat(String(product.priceEtb));
  const priceUsd = typeof product.priceUsd === "number" ? product.priceUsd : parseFloat(String(product.priceUsd));
  const priceDisplay = currency === "USD" ? `$${priceUsd.toFixed(2)} USD` : `${priceEtb.toFixed(2)} ETB`;

  const isFree = product.tier === "free" || (priceEtb === 0 && priceUsd === 0);

  const handleCopy = useCallback(() => {
    if (purchaseReference) {
      navigator.clipboard.writeText(purchaseReference).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [purchaseReference]);

  const handleIntakeSubmit = () => {
    if (!clientName.trim() || !birthDate) {
      setError(i18n.requiredFields);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError(i18n.invalidDate);
      return;
    }
    setError(null);
    if (isFree) {
      handleCheckout();
    } else {
      setStep("payment");
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hexacore/commercial/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode: product.code,
          clientName: clientName.trim(),
          motherName: motherName.trim() || undefined,
          birthDate,
          focusQuestion: focusQuestion.trim() || undefined,
          paymentMethod: isFree ? "telebirr" : paymentMethod,
          currency,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Checkout failed");

      const data = json.data;
      setPurchaseReference(data.reference);
      setPaymentInstructions(data.paymentInstructions);

      if (data.status === "completed" && data.unlockedPayload) {
        setUnlockedDossier(data.unlockedPayload);
        setStep("success");
        onUnlocked?.(data.unlockedPayload, data.reference);
      } else {
        setStep("verify");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!txRef.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hexacore/commercial/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: purchaseReference, paymentReference: txRef.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Verification failed");

      setUnlockedDossier(json.data.unlockedPayload);
      setStep("success");
      onUnlocked?.(json.data.unlockedPayload, json.data.reference);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please re-check the transaction code.");
    } finally {
      setLoading(false);
    }
  };

  const steps: Step[] = ["intake", "payment", "verify", "success"];
  const stepLabels = [i18n.step1, i18n.step2, i18n.step3, i18n.step4];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl"
        style={{
          background: "radial-gradient(circle at top right, rgba(212,175,55,0.1), transparent 55%), #0D1322",
          border: "1px solid rgba(212,175,55,0.3)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10"
          style={{ background: "rgba(13,19,34,0.95)", backdropFilter: "blur(12px)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Hexacore Arcana</span>
              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === "en" ? "am" : "en")}
                className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition"
              >
                {lang === "en" ? "አማርኛ" : "English"}
              </button>
            </div>
            <h2 className="text-lg font-black text-white">{i18n.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{lang === "en" ? product.name : (product.nameAm || product.name)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex items-center">
                <div
                  className="w-full h-1.5 rounded-full transition-all duration-500"
                  style={{
                    background: steps.indexOf(step) >= i
                      ? "linear-gradient(90deg, #D4AF37, #10B981)"
                      : "rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {stepLabels.map((label, i) => (
              <span key={i} className="text-[9px] text-slate-500 uppercase tracking-wide" style={{ flex: 1 }}>{label}</span>
            ))}
          </div>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: INTAKE ──────────────────────────────────── */}
          {step === "intake" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{i18n.fullName} *</label>
                <input
                  id="hx-client-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={i18n.fullNamePlaceholder}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{i18n.motherName}</label>
                <input
                  id="hx-mother-name"
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder={i18n.motherNamePlaceholder}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{i18n.birthDate} *</label>
                <input
                  id="hx-birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-amber-500/60 focus:outline-none"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{i18n.focusQuestion}</label>
                <textarea
                  id="hx-focus-question"
                  value={focusQuestion}
                  onChange={(e) => setFocusQuestion(e.target.value)}
                  placeholder={i18n.focusQuestionPlaceholder}
                  rows={2}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500/60 focus:outline-none resize-none"
                />
              </div>

              <button
                id="hx-intake-next"
                onClick={handleIntakeSubmit}
                disabled={loading}
                className="w-full rounded-xl py-3 font-bold text-sm text-black transition hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #D4AF37, #10B981)" }}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {i18n.generating}</>
                ) : isFree ? (
                  <>{lang === "en" ? "Unlock Free Celestial Preview" : "ነጻ እይታውን አሁን ይክፈቱ"} <Sparkles className="h-4 w-4" /></>
                ) : (
                  <>{i18n.next} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 2: PAYMENT METHOD ──────────────────────────── */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Currency Switcher */}
              <div className="flex items-center gap-2 p-1 rounded-xl border border-white/10 bg-white/[0.03] w-fit">
                {(["ETB", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    id={`hx-currency-${c.toLowerCase()}`}
                    onClick={() => setCurrency(c)}
                    className="rounded-lg px-4 py-1.5 text-sm font-bold transition"
                    style={{
                      background: currency === c ? "linear-gradient(135deg, #D4AF37, #B8952A)" : "transparent",
                      color: currency === c ? "#000" : "#94A3B8",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Price Display */}
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                      {lang === "en" ? product.badgeEn : product.badgeAm}
                    </span>
                    <div className="text-white font-semibold text-sm mt-1">
                      {lang === "en" ? product.name : (product.nameAm || product.name)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-300">{priceDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                {[
                  { id: "telebirr" as PaymentMethod, icon: Smartphone, label: i18n.telebirr, desc: lang === "en" ? "Send to Telebirr 0911002233 (Instant SMS Reference)" : "ወደ ቴሌብር 0911002233 ይላኩ (ፈጣን የማረጋገጫ ኮድ)" },
                  { id: "cbe_transfer" as PaymentMethod, icon: Building2, label: i18n.cbeTransfer, desc: lang === "en" ? "CBE Account: 1000234567891 (Commercial Bank of Ethiopia)" : "የኢትዮጵያ ንግድ ባንክ ሂሳብ: 1000234567891" },
                  { id: "chapa" as PaymentMethod, icon: CreditCard, label: i18n.chapa, desc: lang === "en" ? "Direct digital checkout with Visa, Mastercard, or local bank card" : "በቪዛ፣ ማስተርካርድ ወይም በሀገር ውስጥ ካርዶች በቀጥታ ይክፈሉ" },
                ].map(({ id, icon: Icon, label, desc }) => (
                  <button
                    key={id}
                    id={`hx-pay-${id}`}
                    onClick={() => setPaymentMethod(id)}
                    className="w-full flex items-start gap-3 rounded-2xl border p-4 transition text-left"
                    style={{
                      background: paymentMethod === id ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)",
                      borderColor: paymentMethod === id ? "rgba(212,175,55,0.6)" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="shrink-0 mt-0.5">
                      <Icon className="h-5 w-5" style={{ color: paymentMethod === id ? "#D4AF37" : "#64748B" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white">{label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                    </div>
                    {paymentMethod === id && (
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              <button
                id="hx-pay-confirm"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-xl py-3 font-bold text-sm text-black transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #D4AF37, #10B981)" }}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {i18n.generating}</>
                ) : (
                  <>{i18n.pay} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 3: VERIFY ──────────────────────────────────── */}
          {step === "verify" && paymentInstructions && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <p className="text-sm font-semibold text-white">
                  {lang === "en" ? paymentInstructions.instructionsEn : paymentInstructions.instructionsAm}
                </p>
                {paymentInstructions.accountDetails && (
                  <div className="text-xs text-slate-300 space-y-1 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div><span className="text-slate-500">Bank: </span><strong>{paymentInstructions.accountDetails.bankName}</strong></div>
                    <div><span className="text-slate-500">Account: </span><strong className="text-amber-300">{paymentInstructions.accountDetails.accountNumber}</strong></div>
                    <div><span className="text-slate-500">Name: </span>{paymentInstructions.accountDetails.accountHolder}</div>
                  </div>
                )}
                {paymentInstructions.telebirrCode && (
                  <div className="text-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <div className="text-xs text-amber-300 mb-1">Telebirr Number</div>
                    <div className="text-xl font-black text-white tracking-widest">{paymentInstructions.telebirrCode}</div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-mono text-amber-300">
                    {purchaseReference}
                  </div>
                  <button
                    id="hx-copy-ref"
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg border border-white/15 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{i18n.txRef}</label>
                <input
                  id="hx-tx-ref"
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder={i18n.txRefPlaceholder}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <button
                id="hx-verify"
                onClick={handleVerify}
                disabled={loading || !txRef.trim()}
                className="w-full rounded-xl py-3 font-bold text-sm text-black transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #D4AF37, #10B981)" }}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {i18n.verifying}</>
                ) : (
                  <>{i18n.verify} <CheckCircle2 className="h-4 w-4" /></>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 4: SUCCESS ──────────────────────────────────── */}
          {step === "success" && unlockedDossier && (
            <div className="space-y-5 text-center">
              <div
                className="rounded-3xl border p-6"
                style={{
                  background: "radial-gradient(circle at center, rgba(212,175,55,0.15), transparent 70%)",
                  borderColor: "rgba(212,175,55,0.4)",
                }}
              >
                <div className="text-5xl mb-3">✨</div>
                <h3 className="text-xl font-black text-white mb-1">{i18n.unlocked}</h3>
                <p className="text-sm text-slate-300">
                  {lang === "en"
                    ? `Your complete 14-layer natal dossier has been synthesized for ${unlockedDossier.client.clientName}.`
                    : `ለ${unlockedDossier.client.clientName} ሙሉ 14ቱ የጥበብ ደረጃዎች ተዘጋጅቷል።`}
                </p>

                {/* Core Archetype Summary */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{lang === "en" ? "Dominant Core" : "ዋናው ማዕከል"}</span>
                    <strong className="text-amber-300">{unlockedDossier.dominantCore}</strong>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{lang === "en" ? "Core Number" : "የቁጥር ስሌት"}</span>
                    <strong className="text-white">#{unlockedDossier.coreNumber}</strong>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{lang === "en" ? "Archetype" : "ምልክት"}</span>
                    <strong className="text-emerald-300">{unlockedDossier.masterArchetype}</strong>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{lang === "en" ? "Solfeggio Hz" : "የድምፅ ፍሪኩዌንሲ"}</span>
                    <strong className="text-indigo-300">{unlockedDossier.solfeggioHz} Hz</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  id="hx-view-dossier"
                  href={purchaseReference ? `/api/hexacore/commercial/export-pdf/${purchaseReference}?lang=${lang}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-black transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #10B981)" }}
                >
                  <ExternalLink className="h-4 w-4" />
                  {i18n.viewDossier}
                </a>
                <a
                  id="hx-download-pdf"
                  href={purchaseReference ? `/api/hexacore/commercial/export-pdf/${purchaseReference}?lang=${lang}&format=pdf` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 py-3 text-sm font-bold text-amber-300 hover:bg-amber-500/10 transition"
                >
                  <FileText className="h-4 w-4" />
                  {i18n.downloadPdf}
                </a>
              </div>
            </div>
          )}

          {/* Safety Disclaimer */}
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-500">
            <Shield className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            {i18n.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}
