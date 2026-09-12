import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { eq, desc, count } from "drizzle-orm";

export async function GET() {
  try {
    await requireAnyRole(["admin", "super_admin"]);

    const allRoles = await db.select().from(roles).orderBy(desc(roles.isSystemRole), roles.name);

    // Calculate user count per role
    const rolesWithCounts = await Promise.all(
      allRoles.map(async (role) => {
        const [uCount] = await db.select({ total: count() }).from(users).where(eq(users.role, role.name));
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions || [],
          permissionsCount: Array.isArray(role.permissions) ? role.permissions.length : 0,
          isSystemRole: role.isSystemRole,
          isActive: role.isActive,
          userCount: uCount?.total || 0,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        };
      })
    );

    return NextResponse.json({ success: true, data: rolesWithCounts });
  } catch (error) {
    console.error("Admin roles error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load roles." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAnyRole(["super_admin"]);
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim().toLowerCase().replace(/\s+/g, "_") : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const permissions = Array.isArray(body.permissions) ? body.permissions : [];

    if (!name) {
      return NextResponse.json({ success: false, error: "Role name is required." }, { status: 400 });
    }

    const [existing] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, name)).limit(1);
    if (existing) {
      return NextResponse.json({ success: false, error: `Role '${name}' already exists.` }, { status: 409 });
    }

    const [newRole] = await db
      .insert(roles)
      .values({
        name,
        description,
        permissions,
        isSystemRole: false,
        isActive: true,
      })
      .returning();

    await logAuditEvent({
      userId: admin.id,
      action: "role_created",
      resourceType: "role",
      resourceId: newRole.id,
      details: { roleName: name, permissionsCount: permissions.length },
    });

    return NextResponse.json({ success: true, data: newRole }, { status: 201 });
  } catch (error) {
    console.error("Admin create role error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create role." },
      { status: 500 }
    );
  }
}
