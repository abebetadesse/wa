import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

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

    const members = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        phone: users.phone,
        preferredLanguage: users.preferredLanguage,
        region: users.region,
        isActive: users.isActive,
        isSuspended: users.isSuspended,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, role.name))
      .orderBy(desc(users.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        role: role.name,
        total: members.length,
        users: members,
      },
    });
  } catch (error) {
    console.error("Role users error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load role members." },
      { status: 500 }
    );
  }
}
