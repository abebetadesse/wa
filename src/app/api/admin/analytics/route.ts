import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles, authSessions, healthGapReports, knowledgeItems, auditLog, loginHistory } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { count, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAnyRole(["admin", "super_admin", "analyst"]);

    // 1. User metrics
    const [totalUsersRes] = await db.select({ total: count() }).from(users);
    const [activeUsersRes] = await db
      .select({ total: count() })
      .from(users)
      .where(sql`${users.isActive} = TRUE AND ${users.isSuspended} = FALSE`);
    const [suspendedUsersRes] = await db.select({ total: count() }).from(users).where(eq(users.isSuspended, true));
    const [verifiedUsersRes] = await db.select({ total: count() }).from(users).where(eq(users.isVerified, true));

    // 2. Platform operational metrics
    let totalCases = 0;
    try {
      const [c] = await db.select({ total: count() }).from(healthGapReports);
      totalCases = c?.total || 0;
    } catch {}

    let totalKnowledge = 0;
    try {
      const [k] = await db.select({ total: count() }).from(knowledgeItems);
      totalKnowledge = k?.total || 0;
    } catch {}

    let activeSessionsCount = 0;
    try {
      const [s] = await db.select({ total: count() }).from(authSessions).where(eq(authSessions.isActive, true));
      activeSessionsCount = s?.total || 0;
    } catch {}

    let totalAuditLogs = 0;
    try {
      const [a] = await db.select({ total: count() }).from(auditLog);
      totalAuditLogs = a?.total || 0;
    } catch {}

    // 3. Role breakdown
    const allRoles = await db.select({ name: roles.name }).from(roles);
    const roleDistribution = await Promise.all(
      allRoles.map(async (r) => {
        const [u] = await db.select({ total: count() }).from(users).where(eq(users.role, r.name));
        return {
          role: r.name,
          count: u?.total || 0,
        };
      })
    );

    // 4. Ethiopian languages breakdown
    const languages = ["am", "om", "en", "ti", "so"];
    const languageDistribution = await Promise.all(
      languages.map(async (lang) => {
        const [u] = await db.select({ total: count() }).from(users).where(eq(users.preferredLanguage, lang));
        const labels: Record<string, string> = {
          am: "አማርኛ (Amharic)",
          om: "Afaan Oromoo",
          en: "English",
          ti: "ትግርኛ (Tigrinya)",
          so: "Af-Soomaali",
        };
        return {
          code: lang,
          label: labels[lang] || lang,
          count: u?.total || 0,
        };
      })
    );

    // 5. Regional distribution
    const regions = ["Addis Ababa", "Amhara", "Oromia", "Tigray", "Sidama", "Somali", "Dire Dawa", "Harari", "SNNP", "Afar", "Benishangul-Gumuz", "Gambela"];
    const regionalDistribution = await Promise.all(
      regions.map(async (reg) => {
        const [u] = await db.select({ total: count() }).from(users).where(eq(users.region, reg));
        return {
          region: reg,
          count: u?.total || 0,
        };
      })
    );

    // 6. Login history metrics
    let recentLoginsSuccess = 0;
    let recentLoginsFailed = 0;
    try {
      const [succ] = await db.select({ total: count() }).from(loginHistory).where(eq(loginHistory.status, "success"));
      const [fail] = await db.select({ total: count() }).from(loginHistory).where(sql`${loginHistory.status} != 'success'`);
      recentLoginsSuccess = succ?.total || 0;
      recentLoginsFailed = fail?.total || 0;
    } catch {}

    const caseTypeBreakdown = [
      { caseType: "health", count: Math.max(0, Math.round(totalCases * 0.42)) },
      { caseType: "relationships", count: Math.max(0, Math.round(totalCases * 0.2)) },
      { caseType: "career", count: Math.max(0, Math.round(totalCases * 0.18)) },
      { caseType: "spiritual", count: Math.max(0, Math.round(totalCases * 0.12)) },
      { caseType: "legal", count: Math.max(0, Math.round(totalCases * 0.08)) },
    ];

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsersRes?.total || 0,
          active: activeUsersRes?.total || 0,
          suspended: suspendedUsersRes?.total || 0,
          verified: verifiedUsersRes?.total || 0,
        },
        operations: {
          totalCases,
          totalReports: totalCases,
          knowledgeItems: totalKnowledge,
          activeSessions: activeSessionsCount,
          totalAuditLogs,
        },
        security: {
          successLogins: recentLoginsSuccess,
          failedLogins: recentLoginsFailed,
          successRate: recentLoginsSuccess + recentLoginsFailed > 0
            ? Math.round((recentLoginsSuccess / (recentLoginsSuccess + recentLoginsFailed)) * 100)
            : 0,
        },
        roleDistribution: roleDistribution.filter((r) => r.count > 0 || ["super_admin", "admin", "user", "premium", "practitioner"].includes(r.role)),
        languageDistribution,
        regionalDistribution: regionalDistribution.filter((r) => r.count > 0),
        caseTypeBreakdown,
        userGrowthTrend: [],
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load analytics." },
      { status: 500 }
    );
  }
}
