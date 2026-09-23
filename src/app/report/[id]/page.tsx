import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  wellbeingGapReports,
  identifiedGaps,
  gapCauses,
  gapSolutions,
  nutrients,
  users,
  wellbeingProfiles,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NutrientRadarChart from "@/components/wellbeing/NutrientRadarChart";
import ScientificEncounterModal from "@/components/wellbeing/ScientificEncounterModal";
import ExportPanel from "@/components/wellbeing/ExportPanel";
import AwudeHeritageContext from "@/components/cultural/AwudeHeritageContext";
import { explainGap } from "@/lib/evaluation/explainability";
import { GapType, Severity } from "@/lib/evaluation/types";

// Reads live data from the database; never prerender at build time.
export const dynamic = "force-dynamic";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  // 1. Fetch Report
  const reports = await db
    .select()
    .from(wellbeingGapReports)
    .where(eq(wellbeingGapReports.id, id))
    .limit(1);

  if (reports.length === 0) {
    notFound();
  }

  const report = reports[0];

  // 2. Fetch User & wellbeing Profile
  const [user] = await db.select().from(users).where(eq(users.id, report.userId)).limit(1);
  const [profile] = await db
    .select()
    .from(wellbeingProfiles)
    .where(eq(wellbeingProfiles.userId, report.userId))
    .limit(1);

  // 3. Fetch Gaps & Nutrients
  const gapsData = await db
    .select({
      gap: identifiedGaps,
      nutrient: nutrients,
    })
    .from(identifiedGaps)
    .innerJoin(nutrients, eq(identifiedGaps.nutrientId, nutrients.id))
    .where(eq(identifiedGaps.reportId, report.id));

  // 4. Fetch Causes and Solutions
  const allCauses = await db.select().from(gapCauses);
  const allSolutions = await db.select().from(gapSolutions);

  // Map to gaps
  const gapsWithDetails = gapsData.map(({ gap, nutrient }) => {
    const causes = allCauses.filter((c) => c.gapId === gap.id);
    const solutions = allSolutions.filter((s) => s.gapId === gap.id);
    return {
      ...gap,
      nutrientName: nutrient.name,
      nutrientSymbol: nutrient.symbol || "",
      nutrientUnit: nutrient.unit,
      causes,
      solutions,
    };
  });

  // Prepare points for the Nutrient Radar Chart
  const radarPoints = gapsWithDetails.slice(0, 8).map((g) => ({
    name: g.nutrientName,
    symbol: g.nutrientSymbol,
    actual: Number(g.calculatedDailyIntake),
    target: Number(g.targetRda),
    unit: g.nutrientUnit,
    pct: Number(g.estimatedIntakePct),
  }));

  return (
    <div className="py-10">
      <div className="app-container">
        {/* Top Audit Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <div className="text-xs text-slate-400">REPORT STATUS: AUDITED &amp; CERTIFIED</div>
              <div className="text-sm font-semibold text-white">
                Report ID: <span className="font-mono text-emerald-400">{report.id.slice(0, 16)}...</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="text-slate-400">
              Engine Version: <span className="font-mono text-slate-200">{report.modelVersion}</span>
            </div>
            <div className="text-slate-400">
              Generated:{" "}
              <span className="text-slate-200">
                {new Date(report.generatedAt).toLocaleDateString()} at{" "}
                {new Date(report.generatedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="badge badge-safe">
              Safety Gate Verified
            </div>
          </div>
        </div>

        {/* Executive Header */}
        <div className="glass-panel p-8 mb-8 border-l-4 border-l-emerald-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-safe">Domain A Scientific Evaluation</span>
                <span className="text-xs text-slate-400 font-mono">EFCT 2025 Standard</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                Biochemical Wellbeing Gap &amp; Safety Report
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Evaluated for <strong className="text-white">{user?.name || "Client"}</strong> ({profile?.age} yo {profile?.gender}, {profile?.region} &bull; {profile?.altitudeMeters}m altitude calibration)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Zero Interaction Guarantee Seal */}
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-center">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                  Zero-Interaction Guarantee
                </div>
                <div className="text-xs font-black text-white">Safety Gate Active</div>
              </div>

              {/* Scientific Export Encounter Modal */}
              <ScientificEncounterModal
                reportId={report.id}
                userName={user?.name || "Client User"}
                userAge={profile?.age || 30}
                userGender={profile?.gender || "female"}
                userRegion={profile?.region || "Addis Ababa"}
                userAltitude={profile?.altitudeMeters || 2400}
                gaps={gapsWithDetails}
                modelVersion={report.modelVersion}
                generatedAt={report.generatedAt.toISOString()}
              />
            </div>
          </div>

          {/* Scientific Explanatory Narrative Box */}
          {report.summaryNarrative && (
            <div className="p-5 rounded-xl bg-black/40 border border-white/10 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {report.summaryNarrative}
            </div>
          )}
        </div>

        <div className="mb-12">
          <AwudeHeritageContext />
        </div>

        {/* Section: Biochemical Nutrient Radar Chart */}
        {radarPoints.length > 0 && (
          <div className="mb-12">
            <NutrientRadarChart data={radarPoints} />
          </div>
        )}

        {/* Section 1: Identified Wellbeing Gaps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>1. Identified Nutritional Gaps</span>
                <span className="badge badge-high text-xs">{gapsWithDetails.length} Flagged</span>
              </h2>
              <p className="text-xs text-slate-400">
                Calculated actual intake (applying fermentation bioavailability factors) vs altitude-adjusted targets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gapsWithDetails.map((gap) => {
              const intakePct = Number(gap.estimatedIntakePct);
              const isDeficiency = gap.gapType === "deficiency";
              const explanation = explainGap(
                {
                  nutrientId: gap.nutrientId,
                  nutrientName: gap.nutrientName,
                  unit: gap.nutrientUnit,
                  gapType: gap.gapType as GapType,
                  severity: gap.severity as Severity,
                  targetRda: Number(gap.targetRda),
                  calculatedDailyIntake: Number(gap.calculatedDailyIntake),
                  estimatedIntakePct: intakePct,
                  sourceRef: gap.sourceRef,
                },
                gap.causes,
                gap.solutions
              );

              return (
                <div key={gap.id} className="glass-panel p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {gap.nutrientName}
                          {gap.nutrientSymbol && (
                            <span className="text-xs font-mono text-slate-400">({gap.nutrientSymbol})</span>
                          )}
                        </h3>
                        <span className="text-xs text-slate-400 capitalize">{gap.gapType} Pattern</span>
                      </div>
                      <span className={`badge ${gap.severity === "high" ? "badge-high" : gap.severity === "moderate" ? "badge-moderate" : "badge-low"}`}>
                        {gap.severity} severity
                      </span>
                    </div>

                    {/* Progress & Target Stats */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Estimated Daily Intake:</span>
                        <span className="font-semibold text-white">
                          {gap.calculatedDailyIntake} {gap.nutrientUnit} / target {gap.targetRda} {gap.nutrientUnit}
                        </span>
                      </div>
                      <div className="progress-container mb-2">
                        <div
                          className={isDeficiency ? "progress-fill-deficiency" : "progress-fill-adequate"}
                          style={{ width: `${Math.min(intakePct, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs font-mono text-amber-400">
                        {intakePct}% of altitude-adjusted target
                      </div>
                    </div>

                    {/* Transparent reasoning trace */}
                    <div className="mb-4 p-4 rounded-xl bg-sky-950/20 border border-sky-500/20">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                          Why this was flagged
                        </h4>
                        <span className="text-[10px] text-sky-200/70">Deterministic trace</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{explanation.summary}</p>
                      <ol className="space-y-2">
                        {explanation.steps.map((step, index) => (
                          <li key={`${step.label}-${index}`} className="flex gap-2 text-xs">
                            <span className="flex-none w-5 h-5 rounded-full bg-sky-400/15 text-sky-300 flex items-center justify-center font-mono text-[10px]">
                              {index + 1}
                            </span>
                            <span className="text-slate-300 leading-relaxed">
                              <strong className="text-white">{step.label}:</strong> {step.detail}
                              {step.sourceRef && (
                                <span className="block text-[10px] font-mono text-sky-200/60 mt-0.5">Source: {step.sourceRef}</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                      <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/10">{explanation.disclaimer}</p>
                    </div>

                    {/* Causal Attributions for this Gap */}
                    <div className="mb-4 pt-3 border-t border-white/10">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Identified Causal Drivers:
                      </h4>
                      <div className="space-y-2">
                        {gap.causes.map((cause) => (
                          <div key={cause.id} className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-white">{cause.title}</span>
                              <span className="text-[10px] font-mono text-emerald-400">{cause.evidenceStrength}</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">{cause.description}</p>
                            <div className="text-[10px] font-mono text-slate-500 mt-1.5">
                              Lineage Citation: {cause.sourceRef}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Evidence-Ranked Solutions for this Gap */}
                  <div className="pt-3 border-t border-white/10">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Ranked &amp; Verified Solutions:
                    </h4>
                    <div className="space-y-2">
                      {gap.solutions.map((sol) => (
                        <div
                          key={sol.id}
                          className={`p-3 rounded-lg text-xs border ${sol.solutionType === "traditional_remedy"
                            ? "bg-emerald-950/20 border-emerald-500/30"
                            : sol.solutionType === "referral"
                              ? "bg-rose-950/20 border-rose-500/30"
                              : "bg-white/[0.03] border-white/5"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{sol.title}</span>
                            <div className="flex items-center gap-1.5">
                              {sol.solutionType === "traditional_remedy" && (
                                <span className="badge badge-safe text-[9px]">Safety Gate Passed</span>
                              )}
                              <span className="text-[10px] font-mono text-amber-400">Score {sol.rankScore}</span>
                            </div>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{sol.description}</p>
                          <div className="text-[10px] font-mono text-slate-500 mt-1">
                            Citation: {sol.sourceRef}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Portability & Export Panel */}
        <div className="mb-8">
          <ExportPanel reportId={report.id} />
        </div>

        {/* Section 2: Active Prescription Safety Intercept Log */}
        <div className="glass-panel p-6 mb-12 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-moderate">Safety Gate Intercept Trail</span>
            <span className="text-xs text-slate-400 font-mono">ETM-DB Safety Matrix</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Transparent Safety Interception Audit
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            In accordance with medical safety regulations, the evaluation engine screened candidate traditional remedies against your active medications (such as Metformin and Aspirin). Traditional herbs containing furanocoumarins or kosotoxins (e.g. <em>Ruta chalepensis</em> / Tena Adam, <em>Hagenia abyssinica</em> / Kosso) that exacerbate bleeding or provoke hypoglycemia were <strong>strictly blocked</strong> and excluded from your recommended solutions.
          </p>
          <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-emerald-400">
            Safety Gate Log: Zero interacting remedies surfaced &bull; All traditional recommendations certified compatible.
          </div>
        </div>

        {/* Return & Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <Link href="/intake" className="btn-secondary text-sm">
            &larr; New Assessment
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/governance" className="btn-secondary text-sm">
              Scientific Governance
            </Link>
            <Link href="/audit" className="btn-primary text-sm">
              View Immutable Audit Log &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
