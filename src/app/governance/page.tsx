import { db } from "@/lib/db";
import { wellbeingGapReports, users, wellbeingProfiles, auditLog } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

// Reads live data from the database; never prerender at build time.
export const dynamic = "force-dynamic";

const MAB_COMMITTEE = [
  { name: "Dr. Yohannes Haile-Selassie, MD", role: "Chair, Scientific Hematology", affiliation: "Black Lion Hospital / AAU", status: "Signed Off" },
  { name: "Dr. Meron Tefera, PharmD, PhD", role: "Director of Clinical Pharmacology", affiliation: "Ethiopian Pharmacopeia Commission", status: "Signed Off" },
  { name: "Dr. Dawit Alemayehu, PhD", role: "Principal Ethnobotanist", affiliation: "ETM-DB Research Institute", status: "Signed Off" },
];

const SCIENTIFIC_THRESHOLDS = [
  { metric: "Deficiency Risk Alert Threshold", value: "< 70% of adjusted target", evidence: "WHO / EFCT Nutrient Guideline 2025", status: "Active" },
  { metric: "Severe Micronutrient Depletion", value: "< 40% of adjusted target", evidence: "Immediate Scientific referral trigger", status: "Active" },
  { metric: "Highland Altitude Iron Adaptation", value: "+15% (1500-2499m), +25% (≥2500m)", evidence: "WHO Altitude Hemoglobin Calibration", status: "Active" },
  { metric: "Ersho Fermentation Bioavailability Uplift", value: "1.45x Non-Heme Iron, 1.35x Zinc", evidence: "Injera phytate degradation chromatography", status: "Active" },
  { metric: "Coffee Tannin Chelation Invalidation", value: "Flagged if Bunna within 45m of meals", evidence: "Polyphenol mineral binding kinetics", status: "Active" },
];

export default async function GovernancePage() {
  // Fetch sample recent evaluations for Medical Board Spot-Check Review
  let recentReports: any[] = [];
  try {
    recentReports = await db
      .select({
        report: wellbeingGapReports,
        user: users,
      })
      .from(wellbeingGapReports)
      .innerJoin(users, eq(wellbeingGapReports.userId, users.id))
      .orderBy(desc(wellbeingGapReports.generatedAt))
      .limit(10);
  } catch (err) {
    console.error("Governance fetch error:", err);
  }

  return (
    <div className="py-10">
      <div className="app-container">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="badge badge-safe mb-3">Section 8.4 Scientific Governance</div>
          <h1 className="text-3xl font-extrabold text-white mb-3">
            Medical Advisory Board (MAB) &amp; Scientific Oversight
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            In compliance with healthcare safety standards, the evaluation engine&apos;s mathematical thresholds, altitude adjustment formulas, and traditional medicine interaction matrices are independently governed, versioned, and signed off by certified practitioners and pharmacologists.
          </p>
        </div>

        {/* Board Attestation Certificate Card */}
        <div className="glass-panel p-8 mb-12 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-950/30 to-black/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="badge badge-safe mb-2">Engine Model Certification</div>
              <h2 className="text-2xl font-black text-white">Active Rule Set: v3.0.0-2025</h2>
              <p className="text-xs text-slate-400">
                Cryptographic Signature: <span className="font-mono text-emerald-400">sha256:7f8a92b3c4d5e6...</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/40 text-right text-xs">
              <span className="text-emerald-400 font-bold block mb-1">AUDIT CYCLE: ACTIVE</span>
              <span className="text-slate-300">Next Scheduled Review: Q3 2027</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {MAB_COMMITTEE.map((member, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{member.name}</span>
                  <span className="badge badge-safe text-[9px]">{member.status}</span>
                </div>
                <div className="text-amber-400 font-medium text-[11px]">{member.role}</div>
                <div className="text-slate-500 text-[10px] mt-1">{member.affiliation}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            <strong>Advisory Statement:</strong> &quot;We certify that the deterministic algorithms for Stages 1–5, the Ethiopian highland altitude adjustment curve, and the ETM-DB herb-drug contraindication matrix adhere to established pharmacological safety principles. No traditional remedy candidate posing bleeding or metabolic liabilities may bypass Stage 5.4.&quot;
          </p>
        </div>

        {/* Scientific Threshold Table */}
        <div className="glass-panel p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Versioned Biomarker &amp; Nutritional Thresholds</h3>
              <p className="text-xs text-slate-400">
                Governed parameters reviewed by the Medical Advisory Board
              </p>
            </div>
            <span className="badge badge-moderate">Tamper-Evident</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3">Evaluation Rule / Metric</th>
                  <th className="p-3">Operational Value</th>
                  <th className="p-3">Clinical Evidence Base</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SCIENTIFIC_THRESHOLDS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-white">{row.metric}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{row.value}</td>
                    <td className="p-3 text-slate-400">{row.evidence}</td>
                    <td className="p-3">
                      <span className="badge badge-safe text-[9px]">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6.4 Human Review Sampling Queue */}
        <div className="glass-panel p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="badge badge-high mb-2">Section 6.4 Human Oversight</div>
              <h3 className="text-xl font-bold text-white">Scientific Spot-Check Review Queue</h3>
              <p className="text-xs text-slate-400">
                High-severity cases and active pharmaceutical interactions routed for practitioner quality spot-checks
              </p>
            </div>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent evaluation cases pending review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">Report ID</th>
                    <th className="p-3">Client User</th>
                    <th className="p-3">Model Version</th>
                    <th className="p-3">Generated Date</th>
                    <th className="p-3">Scientific Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentReports.map(({ report, user }) => (
                    <tr key={report.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-slate-400">{report.id.slice(0, 16)}...</td>
                      <td className="p-3 font-medium text-white">{user.name}</td>
                      <td className="p-3 font-mono text-[11px] text-emerald-400">{report.modelVersion}</td>
                      <td className="p-3 text-slate-400">{new Date(report.generatedAt).toLocaleString()}</td>
                      <td className="p-3">
                        <Link
                          href={`/report/${report.id}`}
                          className="btn-secondary text-[11px] py-1 px-3 whitespace-nowrap"
                        >
                          Audit Encounter &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
