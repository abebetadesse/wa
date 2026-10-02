import { NextRequest, NextResponse } from "next/server";
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
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/export/[reportId]?format=json|csv
 *
 * Exports a wellbeing gap report in JSON or CSV format.
 * Domain A — scientific data. Exports include nutritional gaps, causes, and solutions.
 * Cultural / Domain B data is never included in exports.
 */

interface ReportPageProps {
  params: Promise<{ reportId: string }>;
}

export async function GET(request: NextRequest, { params }: ReportPageProps) {
  const authenticatedUser = await getAuthenticatedUser({ refreshAccessCookie: true });
  if (!authenticatedUser) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { reportId } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "json";

  // 1. Fetch report
  const [report] = await db
    .select()
    .from(wellbeingGapReports)
    .where(eq(wellbeingGapReports.id, reportId))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  const canExport =
    report.userId === authenticatedUser.id ||
    authenticatedUser.role === "admin" ||
    authenticatedUser.role === "super_admin";
  if (!canExport) {
    return NextResponse.json({ error: "You cannot export this report" }, { status: 403 });
  }

  // 2. Fetch user & profile
  const [user] = await db.select().from(users).where(eq(users.id, report.userId)).limit(1);
  const [profile] = await db
    .select()
    .from(wellbeingProfiles)
    .where(eq(wellbeingProfiles.userId, report.userId))
    .limit(1);

  // 3. Fetch gaps with nutrient data
  const gapsData = await db
    .select({ gap: identifiedGaps, nutrient: nutrients })
    .from(identifiedGaps)
    .innerJoin(nutrients, eq(identifiedGaps.nutrientId, nutrients.id))
    .where(eq(identifiedGaps.reportId, report.id));

  // 4. Fetch causes & solutions
  const allCauses = await db.select().from(gapCauses);
  const allSolutions = await db.select().from(gapSolutions);

  const gapsWithDetails = gapsData.map(({ gap, nutrient }) => ({
    nutrient: nutrient.name,
    symbol: nutrient.symbol,
    unit: nutrient.unit,
    gapType: gap.gapType,
    severity: gap.severity,
    estimatedIntakePct: Number(gap.estimatedIntakePct),
    targetRda: Number(gap.targetRda),
    calculatedDailyIntake: Number(gap.calculatedDailyIntake),
    sourceRef: gap.sourceRef,
    causes: allCauses.filter((c) => c.gapId === gap.id).map((c) => ({
      type: c.causeType,
      title: c.title,
      description: c.description,
      evidence: c.evidenceStrength,
      source: c.sourceRef,
    })),
    solutions: allSolutions.filter((s) => s.gapId === gap.id).map((s) => ({
      type: s.solutionType,
      title: s.title,
      description: s.description,
      rankScore: Number(s.rankScore),
      interactionChecked: s.interactionChecked,
      source: s.sourceRef,
    })),
  }));

  // ── JSON export ───────────────────────────────────────────────────────────
  if (format === "json") {
    const exportPayload = {
      exportMeta: {
        exportedAt: new Date().toISOString(),
        reportId: report.id,
        modelVersion: report.modelVersion,
        safetyGateVerified: report.safetyGateVerified,
        dataClassification: "Domain A — scientific (No Cultural/Astrological Data)",
        sourceDatabase: "EFCT 2025 / ETM-DB",
      },
      patient: {
        name: user?.name ?? "Anonymous",
        region: profile?.region ?? "Unknown",
        altitudeMeters: profile?.altitudeMeters ?? null,
        age: profile?.age ?? null,
        gender: profile?.gender ?? null,
        activityLevel: profile?.activityLevel ?? null,
        pregnancyOrLactation: profile?.pregnancyOrLactation ?? null,
      },
      report: {
        generatedAt: report.generatedAt,
        safetyGateVerified: report.safetyGateVerified,
        summaryNarrative: report.summaryNarrative,
      },
      gaps: gapsWithDetails,
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="wellbeing-report-${reportId.slice(0, 8)}.json"`,
      },
    });
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  if (format === "csv") {
    const rows: string[] = [
      // Header
      "Nutrient,Symbol,Unit,Gap Type,Severity,Intake %,Target RDA,Daily Intake,Source,Top Cause,Top Solution",
    ];

    for (const gap of gapsWithDetails) {
      const topCause = gap.causes[0]?.title ?? "N/A";
      const topSolution = gap.solutions[0]?.title ?? "N/A";
      rows.push(
        [
          `"${gap.nutrient}"`,
          gap.symbol ?? "",
          gap.unit,
          gap.gapType,
          gap.severity,
          gap.estimatedIntakePct.toFixed(1),
          gap.targetRda.toFixed(2),
          gap.calculatedDailyIntake.toFixed(2),
          gap.sourceRef,
          `"${topCause.replace(/"/g, '""')}"`,
          `"${topSolution.replace(/"/g, '""')}"`,
        ].join(",")
      );
    }

    const csv = rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="wellbeing-report-${reportId.slice(0, 8)}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Invalid format. Use ?format=json or ?format=csv" }, { status: 400 });
}
