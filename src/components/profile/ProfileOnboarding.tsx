"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EthiopianLocationInput } from "@/components/location/EthiopianLocationInput";

const CASE_TYPES = [
  ["wellbeing", "wellbeing & wellness"],
  ["relationships", "Relationships & family"],
  ["career", "Money & Business Reflection"],
  ["legal", "Peace & Harmony"],
  ["social", "Social & community"],
  ["spiritual", "Spiritual & cultural reflection"],
];

export default function ProfileOnboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [caseType, setCaseType] = useState("wellbeing");
  const [birthLocation, setBirthLocation] = useState("");
  const [motherName, setMotherName] = useState("");
  const [socialHandles, setSocialHandles] = useState("");
  const [deviceConsent, setDeviceConsent] = useState(false);
  const [socialConsent, setSocialConsent] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDeviceInfo({
      language: navigator.language,
      platform: navigator.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent,
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingComplete: true,
          caseType,
          birthLocation,
          motherName,
          socialHandles: socialConsent ? socialHandles : "",
          deviceMetadata: deviceConsent ? deviceInfo : {},
          consent: { deviceMetadata: deviceConsent, socialHandles: socialConsent, capturedAt: new Date().toISOString() },
        }),
      });
      if (!profileResponse.ok) {
        const payload = await profileResponse.json();
        throw new Error(payload.error || "Unable to save your profile.");
      }
      const userResponse = await fetch("/api/auth/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!userResponse.ok) {
        const payload = await userResponse.json();
        throw new Error(payload.error || "Unable to save your account details.");
      }
      router.push("/case");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save your profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-5rem)] max-w-3xl px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">One-time setup</p>
        <h1 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">Complete your private profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">This information helps route your request. Your first analysis is preliminary; an assigned expert reviews your profile and case before a final response.</p>
      </div>
      <Card className="space-y-0 border-border/70 bg-card/90 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <CardHeader><CardTitle>Tell us about your request</CardTitle><CardDescription>Only information you choose to provide is used for routing and review.</CardDescription></CardHeader>
        <CardContent><form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="profile-phone">Phone number</Label><Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 9..." /></div>
            <div className="space-y-2"><Label htmlFor="profile-case">Case type</Label><Select id="profile-case" value={caseType} onChange={(e) => setCaseType(e.target.value)}>{CASE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></div>
            <EthiopianLocationInput
              label="Birth location"
              required
              value={birthLocation}
              onChange={(location) => setBirthLocation(location)}
              placeholder="Search birth region, zone, district, or town..."
            />
          </div>
          <div className="space-y-2"><Label htmlFor="profile-mother">Mother&apos;s name <span className="text-muted-foreground">(identity and cultural matching)</span></Label><Input id="profile-mother" required value={motherName} onChange={(e) => setMotherName(e.target.value)} /></div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <label className="flex gap-3 text-sm text-slate-300"><input type="checkbox" checked={deviceConsent} onChange={(e) => setDeviceConsent(e.target.checked)} className="mt-1" />Allow basic device language, timezone, platform, and browser details to help personalize the experience.</label>
            <label className="flex gap-3 text-sm text-slate-300"><input type="checkbox" checked={socialConsent} onChange={(e) => setSocialConsent(e.target.checked)} className="mt-1" />I consent to storing the social handles I choose to provide below.</label>
            <Input value={socialHandles} onChange={(e) => setSocialHandles(e.target.value)} disabled={!socialConsent} placeholder="Optional public handles, e.g. Instagram: @name" />
            <p className="text-xs leading-5 text-slate-500">Browsers and phones do not grant apps access to private phone contacts or social-media account names automatically. We never scrape them; only information you explicitly authorize or enter is stored.</p>
          </div>
          {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Saving profile..." : "Save profile and choose my case"}</Button>
        </form></CardContent>
      </Card>
    </main>
  );
}
