import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { eq, count } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAnyRole(["admin", "super_admin"]);
    const { id: roleId } = await params;

    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    const [uCount] = await db.select({ total: count() }).from(users).where(eq(users.role, role.name));

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        userCount: uCount?.total || 0,
      },
    });
  } catch (error) {
    console.error("Admin role detail error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load role." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAnyRole(["super_admin"]);
    const { id: roleId } = await params;
    const body = await request.json();

    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    const description = typeof body.description === "string" ? body.description.trim() : role.description;
    const permissions = Array.isArray(body.permissions) ? body.permissions : role.permissions;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : role.isActive;

    const [updated] = await db
      .update(roles)
      .set({
        description,
        permissions,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, roleId))
      .returning();

    await logAuditEvent({
      userId: admin.id,
      action: "role_updated",
      resourceType: "role",
      resourceId: roleId,
      details: { roleName: role.name, permissionsCount: permissions.length },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin update role error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update role." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAnyRole(["super_admin"]);
    const { id: roleId } = await params;

    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found." }, { status: 404 });
    }

    if (role.isSystemRole) {
      return NextResponse.json({ success: false, error: "System roles cannot be deleted." }, { status: 403 });
    }

    // Check if any users have this role
    const [uCount] = await db.select({ total: count() }).from(users).where(eq(users.role, role.name));
    if (uCount && uCount.total > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete role '${role.name}' because it is assigned to ${uCount.total} active user(s). Reassign them first.`,
        },
        { status: 400 }
      );
    }

    await db.delete(roles).where(eq(roles.id, roleId));

    await logAuditEvent({
      userId: admin.id,
      action: "role_deleted",
      resourceType: "role",
      resourceId: roleId,
      details: { roleName: role.name },
    });

    return NextResponse.json({ success: true, message: `Role '${role.name}' deleted successfully.` });
  } catch (error) {
    console.error("Admin delete role error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete role." },
      { status: 500 }
    );
  }
}
