import { and, count, desc, eq, like, ne, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLog, authSessions, caseSessions, knowledgeItems, loginHistory, roles, users, wellbeingGapReports } from "@/lib/db/schema";

const LANGUAGE_LABELS: Record<string, string> = {
  am: "አማርኛ (Amharic)",
  om: "Afaan Oromoo",
  en: "English",
  ti: "ትግርኛ (Tigrinya)",
  so: "Af-Soomaali",
};

async function total(query: Promise<{ total: number }[]>) {
  try {
    const [row] = await query;
    return Number(row?.total ?? 0);
  } catch {
    return 0;
  }
}

/** Platform analytics from grouped queries (one query per breakdown, no per-row loops, no estimates). */
export async function getAnalytics() {
  const [
    totalUsers, activeUsers, suspendedUsers, verifiedUsers,
    totalCases, knowledge, activeSessions, auditEvents, successLogins, failedLogins,
    byRole, byLanguage, byRegion, byCaseType, roleNames,
  ] = await Promise.all([
    total(db.select({ total: count() }).from(users)),
    total(db.select({ total: count() }).from(users).where(and(eq(users.isActive, true), eq(users.isSuspended, false)))),
    total(db.select({ total: count() }).from(users).where(eq(users.isSuspended, true))),
    total(db.select({ total: count() }).from(users).where(eq(users.isVerified, true))),
    total(db.select({ total: count() }).from(wellbeingGapReports)),
    total(db.select({ total: count() }).from(knowledgeItems)),
    total(db.select({ total: count() }).from(authSessions).where(eq(authSessions.isActive, true))),
    total(db.select({ total: count() }).from(auditLog)),
    total(db.select({ total: count() }).from(loginHistory).where(eq(loginHistory.status, "success"))),
    total(db.select({ total: count() }).from(loginHistory).where(ne(loginHistory.status, "success"))),
    db.select({ key: users.role, total: count() }).from(users).groupBy(users.role),
    db.select({ key: users.preferredLanguage, total: count() }).from(users).groupBy(users.preferredLanguage),
    db.select({ key: users.region, total: count() }).from(users).groupBy(users.region),
    db.select({ key: caseSessions.caseId, total: count() }).from(caseSessions).groupBy(caseSessions.caseId).catch(() => []),
    db.select({ name: roles.name }).from(roles),
  ]);

  const counted = (rows: { key: string | null; total: number }[]) =>
    new Map(rows.filter((row) => row.key).map((row) => [row.key as string, Number(row.total)]));
  const roleCounts = counted(byRole);
  const languageCounts = counted(byLanguage);
  const attempts = successLogins + failedLogins;

  return {
    users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, verified: verifiedUsers },
    operations: { totalCases, totalReports: totalCases, knowledgeItems: knowledge, activeSessions, totalAuditLogs: auditEvents },
    security: {
      successLogins,
      failedLogins,
      successRate: attempts > 0 ? Math.round((successLogins / attempts) * 100) : 0,
    },
    roleDistribution: roleNames.map(({ name }) => ({ role: name, count: roleCounts.get(name) ?? 0 })),
    languageDistribution: Object.entries(LANGUAGE_LABELS).map(([code, label]) => ({ code, label, count: languageCounts.get(code) ?? 0 })),
    regionalDistribution: [...counted(byRegion)].map(([region, value]) => ({ region, count: value })).sort((a, b) => b.count - a.count),
    caseTypeBreakdown: [...counted(byCaseType)].map(([caseType, value]) => ({ caseType, count: value })).sort((a, b) => b.count - a.count),
    userGrowthTrend: [],
  };
}

export interface AuditQuery {
  action?: string;
  search?: string;
  page: number;
  limit: number;
}

export async function listAuditEvents(query: AuditQuery) {
  const conditions: SQL[] = [];
  if (query.action && query.action !== "all") conditions.push(or(eq(auditLog.action, query.action), eq(auditLog.eventType, query.action))!);
  if (query.search) {
    const pattern = `%${query.search}%`;
    conditions.push(or(like(auditLog.action, pattern), like(auditLog.eventType, pattern), like(auditLog.resourceType, pattern), like(auditLog.ipAddress, pattern))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [totalCount, logs] = await Promise.all([
    total(db.select({ total: count() }).from(auditLog).where(where)),
    db
      .select({
        id: auditLog.id,
        userId: auditLog.userId,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        action: auditLog.action,
        eventType: auditLog.eventType,
        resourceType: auditLog.resourceType,
        resourceId: auditLog.resourceId,
        details: auditLog.details,
        payload: auditLog.payload,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.userId, users.id))
      .where(where)
      .orderBy(desc(auditLog.createdAt))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
  ]);

  return { logs, total: totalCount, page: query.page, limit: query.limit, totalPages: Math.ceil(totalCount / query.limit) || 1 };
}
