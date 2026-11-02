"use client";

import React, { use, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usePaymentStream } from "@/hooks/usePaymentStream";
import { withBasePath } from '@/lib/base-path';

function SpiritualPaymentContent({ caseId }: { caseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMethod = searchParams.get("method") || "telebirr";

  const [paymentMethod, setPaymentMethod] = useState(initialMethod);
  const [phoneNumber, setPhoneNumber] = useState("0911234567");
  const [fullName, setFullName] = useState("Selamawit");
  const [email, setEmail] = useState("seeker@ethiowellbeing.com");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const { status, setStatus } = usePaymentStream(caseId);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatus("processing");
    setStatusMessage("Connecting to " + paymentMethod.toUpperCase() + " secure gateway...");

    try {
      // Simulate live gateway confirmation
      const res = await fetch(withBasePath(`/api/case/spiritual/${caseId}/purchase/confirm`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          phoneNumber,
          transactionRef: `TXN-${Date.now()}`,
        }),
      });

      const payload = await res.json();
      if (payload.success) {
        setStatus("completed");
        setStatusMessage("Payment confirmed! Unlocking your reading...");
        setTimeout(() => {
          router.push(`/case/spiritual/${caseId}/report?unlocked=true`);
        }, 1000);
      } else {
        throw new Error(payload.error || "Payment failed");
      }
    } catch (err) {
      setIsProcessing(false);
      setStatus("failed");
      setStatusMessage("Payment failed: " + (err instanceof Error ? err.message : "Network error"));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-4">
          <Link href={`/case/spiritual/${caseId}/preview`} className="hover:text-gold transition-colors">
            ← Back to Preview
          </Link>
          <span className="px-3 py-1 rounded-full bg-gold/10 text-gold-strong font-mono">
            STAGE 6: SECURE UNLOCK & PAYMENT
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
            <span>🔒 Bank-Grade Encrypted Transaction</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-gold-strong">Secure Payment</h1>
        </div>

        <form onSubmit={handlePay} className="space-y-6">
          {/* Order Summary */}
          <div className="p-6 rounded-3xl bg-card border border-gold/30 shadow-raised space-y-4">
            <div className="text-xs uppercase tracking-wider text-gold font-bold">
              Order Summary
            </div>

            <div className="space-y-2 text-sm text-soft">
              <div className="flex justify-between font-medium text-foreground">
                <span>Personalized Spiritual Reading</span>
                <span className="font-mono text-gold">500 ETB</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pl-3 border-l border-gold/30">
                <li>• Expert-reviewed report by Selamawit Tadesse</li>
                <li>• Personalized healing scroll printable PDF</li>
                <li>• Follow-up consultation booking access</li>
              </ul>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase">Total Due</span>
              <span className="text-2xl font-bold font-mono text-brand">500 ETB</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Select Payment Method
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "telebirr", name: "Telebirr", badge: "Recommended", icon: "📱" },
                { id: "cbe_birr", name: "CBE Birr", icon: "🏦" },
                { id: "chapa", name: "Chapa / Local Cards", icon: "💳" },
                { id: "stripe", name: "Stripe (International)", icon: "🌐" },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${paymentMethod === m.id
                      ? "bg-gold-soft border-gold text-foreground shadow-md"
                      : "bg-sunken/80 border-border text-soft hover:border-border"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-gold focus:ring-gold"
                    />
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-sm font-semibold">{m.name}</span>
                  </div>
                  {m.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold-strong font-mono font-bold">
                      {m.badge}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Billing Info */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4 text-xs">
            <div className="uppercase tracking-wider text-muted-foreground font-bold">
              Billing Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-soft block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sunken/80 border border-border text-soft outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-soft block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sunken/80 border border-border text-soft outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-soft block mb-1">Email Receipt Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sunken/80 border border-border text-soft outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl text-xs text-center font-medium ${status === "completed"
                  ? "bg-brand-soft border border-brand/40 text-brand-strong"
                  : status === "failed"
                    ? "bg-danger-soft border border-danger/40 text-danger-strong"
                    : "bg-gold-soft border border-gold/30 text-gold-strong animate-pulse"
                }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-fill to-gold-fill hover:from-gold-fill hover:to-gold-fill text-gold-foreground font-extrabold text-base shadow-panel transition-all flex items-center justify-center gap-2"
          >
            <span>{isProcessing ? "Processing Unlock..." : "Pay 500 ETB & Unlock Full Reading"}</span>
          </button>

          <p className="text-center text-[11px] text-subtle">
            🔒 Secured by TLS 1.3 · PCI-DSS compliant · Instant unlock upon authorization
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SpiritualPaymentPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-gold flex items-center justify-center">Loading payment...</div>}>
      <SpiritualPaymentContent caseId={caseId} />
    </Suspense>
  );
}
