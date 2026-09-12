import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAnyRole(["super_admin"]);
    const { id: userId } = await params;
    const body = await request.json();

    const roleName = typeof body.role === "string" ? body.role.trim() : "";

    if (!roleName) {
      return NextResponse.json({ success: false, error: "Role name is required." }, { status: 400 });
    }

    const [targetRole] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (!targetRole) {
      return NextResponse.json({ success: false, error: `Role '${roleName}' does not exist.` }, { status: 404 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (userId === admin.id && roleName !== "super_admin") {
      return NextResponse.json({ success: false, error: "You cannot demote your own Super Admin role." }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set({
        role: roleName,
        roleId: targetRole.id,
        updatedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    await logAuditEvent({
      userId: admin.id,
      action: "user_role_changed",
      resourceType: "user",
      resourceId: userId,
      details: { previousRole: user.role, newRole: roleName, targetEmail: user.email },
    });

    await logUserActivity({
      userId,
      activityType: "role_change",
      description: `Role changed from ${user.role} to ${roleName} by Super Admin`,
      metadata: { previousRole: user.role, newRole: roleName },
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${roleName}.`,
      data: updated,
    });
  } catch (error) {
    console.error("Admin change role error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to change role." },
      { status: error instanceof Error && error.message.includes("ROLE_DENIED") ? 403 : 500 }
    );
  }
}
