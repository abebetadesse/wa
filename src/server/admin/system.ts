import { revalidatePath } from "next/cache";
import { count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLog, authSessions, literatureFindings, literatureSyncLog, users, wellbeingGapReports } from "@/lib/db/schema";
import { getSystemConfig, updateSystemConfig, type SystemConfig } from "@/lib/config/systemConfig";
import { getLiteratureFetcher } from "@/lib/literature/literatureFetcher";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { isKnowledgeStrand } from "@/lib/knowledge/catalog";
import type { KnowledgeStrandType } from "@/lib/knowledge/types";
import { LANGUAGES } from "./userPolicy";

const STRICTNESS = ["standard", "elevated", "strict_lock"] as const;

const flagsPatch = z
  .object({
    allowSelfRegistration: z.boolean(),
    requireEmailVerification: z.boolean(),
    domainBEnforced: z.boolean(),
    safetyGateStrictness: z.enum(STRICTNESS),
    literatureAutoSync: z.boolean(),
    altitudeCalibrationMeters: z.number().min(0).max(5000),
    defaultLanguage: z.enum(LANGUAGES),
    sessionTimeoutHours: z.number().int().min(1).max(24 * 30),
    debugTelemetry: z.boolean(),
  })
  .partial();

const platformPatch = z
  .object({
    name: z.string().trim().min(1).max(120),
    organization: z.string().trim().max(160),
    supportEmail: z.string().trim().email(),
    version: z.string().trim().max(60),
  })
  .partial();

/** Every administrative action the control plane accepts, validated per action. */
export const systemAction = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("toggle_maintenance"),
    payload: z.object({ enabled: z.boolean().optional(), message: z.string().trim().max(500).optional() }).default({}),
  }),
  z.object({
    action: z.literal("set_announcement"),
    payload: z
      .object({
        enabled: z.boolean().optional(),
        message: z.string().trim().max(500).optional(),
        severity: z.enum(["info", "warning", "critical"]).optional(),
      })
      .default({}),
  }),
  z.object({ action: z.literal("trigger_sync"), payload: z.object({ strands: z.array(z.custom<KnowledgeStrandType>((value) => typeof value === "string" && isKnowledgeStrand(value), "Unknown knowledge strand.")).optional() }).default({}) }),
  z.object({ action: z.literal("emergency_lock"), payload: z.object({}).passthrough().default({}) }),
  z.object({ action: z.literal("update_flags"), payload: z.object({ flags: flagsPatch }) }),
  z.object({ action: z.literal("update_platform"), payload: z.object({ platform: platformPatch }) }),
  z.object({ action: z.literal("revalidate_cache"), payload: z.object({}).passthrough().default({}) }),
]);
export type SystemAction = z.infer<typeof systemAction>;

const strictnessRank = (value: SystemConfig["flags"]["safetyGateStrictness"]) => STRICTNESS.indexOf(value);

/**
 * Weakening a safety control (disabling the Domain A/B firewall or lowering safety-gate strictness)
 * is reserved for super admins. Strengthening them is open to every administrator.
 */
export function assertSafetyChangeAllowed(actor: { role: string }, current: SystemConfig["flags"], next: SystemConfig["flags"]) {
  const weakensFirewall = current.domainBEnforced && !next.domainBEnforced;
  const lowersGate = strictnessRank(next.safetyGateStrictness) < strictnessRank(current.safetyGateStrictness);
  if ((weakensFirewall || lowersGate) && actor.role !== "super_admin") {
    throw ApiError.forbidden("Only a Super Admin can relax the Domain A/B firewall or safety-gate strictness.");
  }
}

async function safeCount(query: Promise<{ total: number }[]>) {
  try {
    const [row] = await query;
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function getSystemStatus() {
  let dbStatus: "healthy" | "degraded" | "down" = "healthy";
  let dbLatencyMs = 0;
  try {
    const start = performance.now();
    await db.execute(sql`SELECT 1`);
    dbLatencyMs = Math.round(performance.now() - start);
    if (dbLatencyMs > 500) dbStatus = "degraded";
  } catch (error) {
    console.error("[system] database ping failed:", error);
    dbStatus = "down";
  }

  const memory = process.memoryUsage();
  const [activeSessions, totalAuditEvents, totalUsers, totalCases, literatureArticles, lastSync] = await Promise.all([
    safeCount(db.select({ total: count() }).from(authSessions).where(eq(authSessions.isActive, true))),
    safeCount(db.select({ total: count() }).from(auditLog)),
    safeCount(db.select({ total: count() }).from(users)),
    safeCount(db.select({ total: count() }).from(wellbeingGapReports)),
    safeCount(db.select({ total: count() }).from(literatureFindings).where(eq(literatureFindings.isActive, 1))),
    db.select().from(literatureSyncLog).orderBy(desc(literatureSyncLog.startedAt)).limit(1).then(([row]) => row ?? null).catch(() => null),
  ]);
  const config = getSystemConfig();

  return {
    timestamp: new Date().toISOString(),
    database: { status: dbStatus, latencyMs: dbLatencyMs, connected: dbStatus !== "down" },
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMb: Math.round(memory.rss / 1048576),
        heapTotalMb: Math.round(memory.heapTotal / 1048576),
        heapUsedMb: Math.round(memory.heapUsed / 1048576),
      },
    },
    telemetry: { activeSessions, totalAuditEvents, totalUsers, totalCases, literatureArticles, lastSync },
    services: [
      { name: "MySQL Database", status: dbStatus, latency: `${dbLatencyMs}ms`, type: "core" },
      { name: "Literature Synthesis Engine", status: lastSync?.errors && lastSync.errors.length > 0 ? "warning" : "healthy", latency: "async", type: "intelligence" },
      { name: "Herb-Drug Safety Gate", status: config.flags.safetyGateStrictness === "strict_lock" ? "locked" : "healthy", latency: "in-process", type: "scientific" },
      { name: "Domain A/B Firewall", status: config.flags.domainBEnforced ? "active" : "disabled", latency: "in-process", type: "compliance" },
    ],
    config,
  };
}

export interface SystemActionResult {
  message: string;
  config: SystemConfig;
  audit: { action: string; resourceType: string; details: Record<string, unknown> };
}

export async function runSystemAction(actor: AuthenticatedUser, input: SystemAction): Promise<SystemActionResult> {
  const current = getSystemConfig();

  switch (input.action) {
    case "toggle_maintenance": {
      const enabled = input.payload.enabled ?? !current.maintenance.enabled;
      const message = input.payload.message || current.maintenance.message;
      const config = updateSystemConfig({ maintenance: { enabled, message, startedAt: enabled ? new Date().toISOString() : null } });
      return {
        message: enabled ? "Maintenance mode activated." : "Maintenance mode deactivated.",
        config,
        audit: { action: enabled ? "SYSTEM_MAINTENANCE_ENABLED" : "SYSTEM_MAINTENANCE_DISABLED", resourceType: "system_control", details: { message } },
      };
    }
    case "set_announcement": {
      const announcement = {
        enabled: input.payload.enabled ?? true,
        message: input.payload.message ?? current.announcement.message,
        severity: input.payload.severity ?? current.announcement.severity,
        updatedAt: new Date().toISOString(),
      };
      const config = updateSystemConfig({ announcement });
      return { message: "System announcement updated.", config, audit: { action: "SYSTEM_ANNOUNCEMENT_UPDATED", resourceType: "system_announcement", details: announcement } };
    }
    case "trigger_sync": {
      getLiteratureFetcher()
        .triggerManual(input.payload.strands)
        .catch((error) => console.error("[system] literature sync failed:", error));
      return {
        message: "Literature synchronization started in the background.",
        config: current,
        audit: { action: "LITERATURE_SYNC_TRIGGERED", resourceType: "literature_fetcher", details: { strands: input.payload.strands ?? "all" } },
      };
    }
    case "emergency_lock": {
      const next = current.flags.safetyGateStrictness === "strict_lock" ? "standard" : "strict_lock";
      const flags = { ...current.flags, safetyGateStrictness: next } as SystemConfig["flags"];
      assertSafetyChangeAllowed(actor, current.flags, flags);
      const config = updateSystemConfig({ flags });
      return {
        message: next === "strict_lock" ? "Emergency safety lock engaged. Unverified interactions blocked." : "Emergency safety lock released to standard strictness.",
        config,
        audit: {
          action: next === "strict_lock" ? "SAFETY_GATE_EMERGENCY_LOCK_ENGAGED" : "SAFETY_GATE_EMERGENCY_LOCK_RELEASED",
          resourceType: "safety_gate",
          details: { strictness: next },
        },
      };
    }
    case "update_flags": {
      const flags = { ...current.flags, ...input.payload.flags };
      assertSafetyChangeAllowed(actor, current.flags, flags);
      const config = updateSystemConfig({ flags });
      return { message: "System feature flags updated.", config, audit: { action: "SYSTEM_FLAGS_UPDATED", resourceType: "system_flags", details: { flags: input.payload.flags } } };
    }
    case "update_platform": {
      const config = updateSystemConfig({ platform: { ...current.platform, ...input.payload.platform } });
      return { message: "Platform settings updated.", config, audit: { action: "PLATFORM_METADATA_UPDATED", resourceType: "platform_metadata", details: { platform: input.payload.platform } } };
    }
    case "revalidate_cache": {
      revalidatePath("/", "layout");
      return { message: "Page caches revalidated.", config: current, audit: { action: "CACHE_REVALIDATED", resourceType: "system_cache", details: {} } };
    }
  }
}
