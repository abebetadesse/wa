import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAnyRole(["super_admin"]);
    const { id: roleId } = await params;
    const body = await request.json();

    if (!Array.isArray(body.permissions)) {
      return NextResponse.json({ success: false, error: "Permissions must be an array of permission strings." }, { status: 400 });
    }

    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    const [updated] = await db
      .update(roles)
      .set({
        permissions: body.permissions,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, roleId))
      .returning();

    await logAuditEvent({
      userId: admin.id,
      action: "role_permissions_updated",
      resourceType: "role",
      resourceId: roleId,
      details: { roleName: role.name, permissionsCount: body.permissions.length },
    });

    return NextResponse.json({
      success: true,
      message: `Permissions updated for role '${role.name}'.`,
      data: updated,
    });
  } catch (error) {
    console.error("Update role permissions error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update permissions." },
      { status: 500 }
    );
  }
}
