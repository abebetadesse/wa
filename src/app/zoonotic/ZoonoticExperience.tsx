"use client";

import { useState } from "react";
import Link from "next/link";
import {
  evaluateRawMeatSafety,
  getZebuNiterKibbehProfile,
  RawMeatConsumptionFrequency,
} from "@/lib/engines/zoonoticSafetyEngine";
import { evaluateApitherapySafety, getTazmaApitherapyProfile } from "@/lib/engines/apitherapyEngine";
import { evaluateVectorSafeIron } from "@/lib/engines/vectorSafeNutritionEngine";
import { getEnsetMicrobiomeProfile } from "@/lib/engines/fermentationMicrobiomeEngine";

export default function ZoonoticExperience() {
  const [rawMeatFreq, setRawMeatFreq] = useState<RawMeatConsumptionFrequency>("weekly");
  const [hasSymptoms, setHasSymptoms] = useState<boolean>(false);
  const [consideringKosso, setConsideringKosso] = useState<boolean>(true);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [isImmunocompromised, setIsImmunocompromised] = useState<boolean>(false);
  const parasitologyAssessment = evaluateRawMeatSafety(rawMeatFreq, hasSymptoms, consideringKosso, {
    isPregnant,
    isImmunocompromised,
  });

  const zebuProfile = getZebuNiterKibbehProfile();
  const tazmaProfile = getTazmaApitherapyProfile();
  const [ageMonths, setAgeMonths] = useState<number>(36);
  const [hasBeeProductAllergy, setHasBeeProductAllergy] = useState<boolean>(false);
  const [hasDiabetes, setHasDiabetes] = useState<boolean>(false);
  const [replacingMedicalCare, setReplacingMedicalCare] = useState<boolean>(false);
  const apitherapyAssessment = evaluateApitherapySafety({
    ageMonths,
    hasBeeProductAllergy,
    hasDiabetes,
    replacingMedicalCare,
  });

  const [vectorAltitude, setVectorAltitude] = useState<number>(600);
  const [vectorRegion, setVectorRegion] = useState<string>("Gambela");
  const [intendedIronDose, setIntendedIronDose] = useState<number>(65);
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [usesInsecticideTreatedNet, setUsesInsecticideTreatedNet] = useState<boolean>(false);
  const vectorAssessment = evaluateVectorSafeIron({
    altitudeMeters: vectorAltitude,
    region: vectorRegion,
    month,
    intendedIronSupplementDoseMg: intendedIronDose,
    isSleepingUnderInsecticideTreatedNet: usesInsecticideTreatedNet,
  });

  const [selectedEnsetProduct, setSelectedEnsetProduct] = useState<"kocho" | "bulla">("kocho");
  const ensetProfile = getEnsetMicrobiomeProfile(selectedEnsetProduct);

  return (
    <div className="app-container py-10 space-y-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-2">
          <span>Regional Ecology, Apiculture & Scientific Safety Gates</span>
          <span>•</span>
          <span className="text-gold">Enhancements 6, 7, 8, 9 & 12</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Zoonotic Safety, Zebu Lipidomics & Apitherapy
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-3xl mt-2">
          Scientific safety surveillance for raw meat consumption and toxic Kosso interception, highland Zebu pasture lipidomics,
          subterranean Tazma honey pharmacopeia, lowland malaria vector iron gating, and Enset colonic butyrate modeling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold text-danger uppercase tracking-wider">Enhancement 6 (Safety Gate)</span>
              <h2 className="text-xl font-bold text-foreground">Kitfo Parasitology & Kosso Interceptor</h2>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${parasitologyAssessment.riskTier === "critical" || parasitologyAssessment.riskTier === "high"
                  ? "bg-danger-soft border-danger/40 text-danger-strong"
                  : "bg-brand-soft border-brand/30 text-brand-strong"
                }`}
            >
              {parasitologyAssessment.riskTier.toUpperCase()} RISK
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-soft block mb-1">Raw Beef Intake (Kitfo / Tere Siga):</label>
              <select
                value={rawMeatFreq}
                onChange={(e) => setRawMeatFreq(e.target.value as RawMeatConsumptionFrequency)}
                className="w-full bg-sunken/80 border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:border-danger"
              >
                <option value="never">Never / Fully Cooked Only</option>
                <option value="rarely">Rarely (Holiday Feasts)</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="multiple_per_week">Multiple Times Per Week</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSymptoms}
                  onChange={(e) => setHasSymptoms(e.target.checked)}
                  className="rounded border-border-strong bg-sunken/80 text-danger focus:ring-0"
                />
                <span>Experiencing unexplained epigastric discomfort or nausea</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded border-border-strong bg-sunken/80 text-danger focus:ring-0"
                />
                <span>Currently pregnant</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImmunocompromised}
                  onChange={(e) => setIsImmunocompromised(e.target.checked)}
                  className="rounded border-border-strong bg-sunken/80 text-danger focus:ring-0"
                />
                <span>Have a weakened immune system</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={consideringKosso}
                  onChange={(e) => setConsideringKosso(e.target.checked)}
                  className="rounded border-border-strong bg-sunken/80 text-danger focus:ring-0"
                />
                <span className="text-gold font-medium">Considering traditional Kosso (ኮሶ) flower infusion</span>
              </label>
            </div>
          </div>

          {parasitologyAssessment.vulnerabilityGate.interceptTriggered && (
            <div role="alert" className="p-4 rounded-xl bg-danger-soft border border-danger/40 space-y-2 text-xs">
              <strong className="text-danger">Food-safety gate: choose thoroughly cooked meat</strong>
              <ul className="list-disc list-inside text-soft text-[11px] space-y-1">
                {parasitologyAssessment.vulnerabilityGate.messages.map((message) => <li key={message}>{message}</li>)}
              </ul>
            </div>
          )}

          {parasitologyAssessment.kossoSafetyIntercept.interceptTriggered && (
            <div className="p-4 rounded-xl bg-danger-soft border border-danger/40 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-danger font-bold">
                <span>🛑</span>
                <span>{parasitologyAssessment.kossoSafetyIntercept.warningTitle}</span>
              </div>
              <p className="text-soft text-[11px] leading-relaxed">
                {parasitologyAssessment.kossoSafetyIntercept.scientificAlert}
              </p>
              <div className="p-2.5 rounded bg-sunken/80 border border-danger/20 text-brand text-[11px] space-y-1">
                <strong>Scientificly Validated Safe Protocol:</strong>
                <p className="text-soft">{parasitologyAssessment.kossoSafetyIntercept.saferConventionalAlternative}</p>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-sunken/50 border border-border space-y-2 text-xs">
            <span className="text-muted-foreground font-semibold block text-[11px]">Culinary Hygiene Guidance:</span>
            <ul className="list-disc list-inside text-soft text-[11px] space-y-1">
              {parasitologyAssessment.culinaryHygieneRecommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 9 (Safety Gate)</span>
              <h2 className="text-xl font-bold text-foreground">Lowland Vector-Safe Iron Gate</h2>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${vectorAssessment.ironSafetyGateAction === "block_high_dose_supplement"
                  ? "bg-danger-soft border-danger/40 text-danger-strong"
                  : "bg-brand-soft border-brand/30 text-brand-strong"
                }`}
            >
              {vectorAssessment.ironSafetyGateAction.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-soft">
              VECTOR RISK: {vectorAssessment.vectorRiskLevel.toUpperCase()}
            </span>
            <span className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-soft">
              {vectorAssessment.isPeakTransmissionSeason ? "PEAK TRANSMISSION SEASON" : "OUTSIDE PEAK SEASON"}
            </span>
            <span className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-soft">
              {vectorAssessment.isMalariaEndemicZone ? "MALARIA-RISK ZONE" : "NON-ENDEMIC ZONE"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-soft block mb-1">Region:</label>
              <select
                value={vectorRegion}
                onChange={(e) => setVectorRegion(e.target.value)}
                className="w-full bg-sunken/80 border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-gold"
              >
                <option value="Gambela">Gambela (550m - Endemic)</option>
                <option value="Afar">Afar / Awash (400m - Endemic)</option>
                <option value="Arba Minch">Arba Minch (1,280m - Endemic)</option>
                <option value="Addis Ababa">Addis Ababa (2,400m - Non-Endemic)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-soft block mb-1">Elevation (Meters):</label>
              <input
                type="number"
                value={vectorAltitude}
                onChange={(e) => setVectorAltitude(Number(e.target.value))}
                className="w-full bg-sunken/80 border border-border rounded-lg p-2 text-xs text-foreground font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-soft cursor-pointer">
            <input
              type="checkbox"
              checked={usesInsecticideTreatedNet}
              onChange={(e) => setUsesInsecticideTreatedNet(e.target.checked)}
              className="rounded border-border-strong bg-sunken/80 text-gold focus:ring-0"
            />
            <span>Sleep under an insecticide-treated net</span>
          </label>

          <label className="block text-xs text-soft">
            Month of exposure:
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="mt-1 w-full bg-sunken/80 border border-border rounded-lg p-2 text-xs text-foreground"
            >
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, index) => (
                <option key={name} value={index}>{name}</option>
              ))}
            </select>
          </label>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-soft">Intended Oral Iron Dose (mg elemental Fe):</span>
              <span className="font-mono text-gold font-bold">{intendedIronDose} mg</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={intendedIronDose}
              onChange={(e) => setIntendedIronDose(Number(e.target.value))}
              className="w-full h-2 bg-sunken/80 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          {vectorAssessment.gateWarningTitle && (
            <div className="p-3.5 rounded-xl bg-gold-soft border border-gold/40 text-xs space-y-1">
              <span className="text-gold font-bold block">{vectorAssessment.gateWarningTitle}</span>
              <p className="text-soft text-[11px] leading-relaxed">{vectorAssessment.scientificRationale}</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-sunken/50 border border-border space-y-2 text-xs">
            <span className="text-brand font-semibold block text-[11px]">Recommended Whole-Food Alternatives:</span>
            <ul className="list-disc list-inside text-soft text-[11px] space-y-0.5">
              {vectorAssessment.recommendedDietaryIronAlternatives.map((alt, idx) => (
                <li key={idx}>{alt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 7</span>
          <h2 className="text-xl font-bold text-foreground mt-2">Zebu Niter Kibbeh Lipidomics</h2>
          <div className="mt-4 space-y-3 text-xs text-soft">
            <p><strong className="text-brand">Lipidomic profile:</strong> {zebuProfile.product}</p>
            <p><strong className="text-brand">Micellar absorption gain:</strong> {((zebuProfile.micellarAbsorptionMultiplier - 1) * 100).toFixed(0)}%</p>
            <p><strong className="text-brand">Risk note:</strong> {zebuProfile.cardiovascularContext}</p>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 8</span>
          <h2 className="text-xl font-bold text-foreground mt-2">Tazma Honey Safety Gate</h2>
          <p className="text-xs text-muted-foreground">Educational screening only; this does not establish that honey is an effective treatment.</p>
          <div className="space-y-3 text-xs text-soft">
            <p><strong className="text-brand">Product:</strong> {tazmaProfile.productNameAmharic}</p>
            <p><strong className="text-brand">Habitat:</strong> {tazmaProfile.nestingHabitat}</p>
            <label className="block">
              Age (months):
              <input
                type="number"
                min="0"
                max="1200"
                step="1"
                value={ageMonths}
                onChange={(e) => setAgeMonths(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full bg-sunken/80 border border-border rounded-lg p-2 text-xs text-foreground"
              />
            </label>
            {[
              { label: "Known allergy to honey, bee products, or propolis", checked: hasBeeProductAllergy, onChange: setHasBeeProductAllergy },
              { label: "Diabetes or blood-glucose management", checked: hasDiabetes, onChange: setHasDiabetes },
              { label: "Considering honey instead of prescribed treatment or professional care", checked: replacingMedicalCare, onChange: setReplacingMedicalCare },
            ].map((gate) => (
              <label key={gate.label} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gate.checked}
                  onChange={(e) => gate.onChange(e.target.checked)}
                  className="mt-0.5 rounded border-border-strong bg-sunken/80 text-gold focus:ring-0"
                />
                <span>{gate.label}</span>
              </label>
            ))}
            <div
              role={apitherapyAssessment.action === "block" ? "alert" : "status"}
              className={`rounded-lg border p-3 text-xs ${
                apitherapyAssessment.action === "block"
                  ? "bg-danger-soft border-danger/40 text-danger-strong"
                  : apitherapyAssessment.action === "caution"
                    ? "bg-gold-soft border-gold/40 text-gold-strong"
                    : "bg-brand-soft border-brand/30 text-brand-strong"
              }`}
            >
              <strong className="block mb-2">Honey screening: {apitherapyAssessment.action.toUpperCase()}</strong>
              {apitherapyAssessment.gates.length ? (
                <ul className="list-disc list-inside space-y-1">
                  {apitherapyAssessment.gates.map((gate) => <li key={gate.id}>{gate.title}: {gate.message}</li>)}
                </ul>
              ) : (
                <p>No listed risk factors selected. This is not a safety guarantee or treatment recommendation.</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 12</span>
          <h2 className="text-xl font-bold text-foreground mt-2">Enset Fermentation Microbiome</h2>
          <div className="mt-4 space-y-3 text-xs text-soft">
            <label className="block text-xs text-soft">
              Product:
              <select
                value={selectedEnsetProduct}
                onChange={(e) => setSelectedEnsetProduct(e.target.value as "kocho" | "bulla")}
                className="mt-1 w-full bg-sunken/80 border border-border rounded-lg p-2 text-xs text-foreground"
              >
                <option value="kocho">Kocho</option>
                <option value="bulla">Bulla</option>
              </select>
            </label>
            <p><strong className="text-brand">Butyrate output:</strong> {ensetProfile.simulatedSCFAYieldMmolPerKg.butyrate} mmol/kg</p>
            <p><strong className="text-brand">Microbiome note:</strong> {ensetProfile.gastrointestinalBenefits[0]}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border text-xs">
        <Link href="/ecology" className="text-muted-foreground hover:text-foreground transition-colors">← Back to agroecology</Link>
        <Link href="/safety" className="btn-primary text-xs py-2 px-4">Review herb-drug safety gate →</Link>
      </div>
    </div>
  );
}
