import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, authSessions } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAnyRole(["admin", "super_admin"]);
    const { id: userId } = await params;
    const body = await request.json();

    const status = body.status as "active" | "inactive" | "suspended";
    const reason = typeof body.reason === "string" ? body.reason.trim() : null;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return NextResponse.json({ success: false, error: "Status must be 'active', 'inactive', or 'suspended'." }, { status: 400 });
    }

    if (userId === admin.id && status !== "active") {
      return NextResponse.json({ success: false, error: "You cannot suspend or deactivate your own account." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const isActive = status !== "inactive";
    const isSuspended = status === "suspended";

    const [updated] = await db
      .update(users)
      .set({
        isActive,
        isSuspended,
        suspensionReason: isSuspended ? reason : null,
        updatedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // If suspended or deactivated, revoke active sessions
    if (isSuspended || !isActive) {
      await db
        .update(authSessions)
        .set({ revokedAt: new Date(), isActive: false })
        .where(eq(authSessions.userId, userId));
    }

    await logAuditEvent({
      userId: admin.id,
      action: `user_status_${status}`,
      resourceType: "user",
      resourceId: userId,
      details: { status, reason, targetEmail: user.email },
    });

    await logUserActivity({
      userId,
      activityType: "status_change",
      description: `Account status updated to ${status} by admin ${admin.name || admin.email}`,
      metadata: { reason },
    });

    return NextResponse.json({
      success: true,
      message: `User status changed to ${status}.`,
      data: updated,
    });
  } catch (error) {
    console.error("Admin user status error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update status." },
      { status: 500 }
    );
  }
}
