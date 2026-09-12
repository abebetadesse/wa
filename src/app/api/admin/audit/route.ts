import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog, users } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { eq, desc, and, ilike, or, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(["admin", "super_admin", "analyst"]);
    const searchParams = request.nextUrl.searchParams;

    const action = searchParams.get("action")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (action && action !== "all") {
      conditions.push(or(eq(auditLog.action, action), eq(auditLog.eventType, action)));
    }

    if (search) {
      conditions.push(
        or(
          ilike(auditLog.action, `%${search}%`),
          ilike(auditLog.eventType, `%${search}%`),
          ilike(auditLog.resourceType, `%${search}%`),
          ilike(auditLog.ipAddress, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRes] = await db.select({ total: count() }).from(auditLog).where(whereClause);
    const total = totalRes?.total || 0;

    const logs = await db
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
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin audit log error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load audit logs." },
      { status: 500 }
    );
  }
}
