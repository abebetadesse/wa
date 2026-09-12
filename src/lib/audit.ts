import { db } from "@/lib/db";
import { auditLog, userActivities, loginHistory } from "@/lib/db/schema";

export interface LogAuditOptions {
  userId?: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  sessionId?: string | null;
}

export async function logAuditEvent(options: LogAuditOptions) {
  try {
    const details = options.details || {};
    await db.insert(auditLog).values({
      userId: options.userId || null,
      eventType: options.action, // backward compatibility
      action: options.action,
      resourceType: options.resourceType || "system",
      resourceId: options.resourceId || null,
      payload: details, // backward compatibility
      details,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
      sessionId: options.sessionId || null,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

export interface LogActivityOptions {
  userId: string;
  activityType: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function logUserActivity(options: LogActivityOptions) {
  try {
    await db.insert(userActivities).values({
      userId: options.userId,
      activityType: options.activityType,
      description: options.description,
      metadata: options.metadata || {},
    });
  } catch (error) {
    console.error("Failed to log user activity:", error);
  }
}

export interface LogLoginOptions {
  userId?: string | null;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: Record<string, unknown>;
  status: "success" | "failed" | "locked";
  failureReason?: string | null;
}

export async function logLoginAttempt(options: LogLoginOptions) {
  try {
    await db.insert(loginHistory).values({
      userId: options.userId || null,
      email: options.email,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
      deviceInfo: options.deviceInfo || {},
      status: options.status,
      failureReason: options.failureReason || null,
    });
  } catch (error) {
    console.error("Failed to record login attempt:", error);
  }
}
