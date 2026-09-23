import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles, userActivities, authSessions, wellbeingGapReports } from "@/lib/db/schema";
import { requireAnyRole, getUserPermissions, validateEthiopianPhone } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq, desc, count } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAnyRole(["admin", "super_admin"]);
    const { id: userId } = await params;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const permissions = await getUserPermissions(user.id, user.role);

    // Stats
    let casesCount = 0;
    try {
      const [c] = await db.select({ total: count() }).from(wellbeingGapReports).where(eq(wellbeingGapReports.userId, user.id));
      casesCount = c?.total || 0;
    } catch { }

    let sessionsCount = 0;
    try {
      const [s] = await db.select({ total: count() }).from(authSessions).where(eq(authSessions.userId, user.id));
      sessionsCount = s?.total || 0;
    } catch { }

    // Recent user activities
    const recentActivities = await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, user.id))
      .orderBy(desc(userActivities.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleId: user.roleId,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        gender: user.gender,
        region: user.region,
        city: user.city,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        isActive: user.isActive,
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
        notes: user.notes,
        tags: user.tags,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions,
        stats: {
          casesCount,
          sessionsCount,
          credits: 150,
          reportsCount: casesCount,
        },
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load user." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAnyRole(["admin", "super_admin"]);
    const { id: userId } = await params;
    const body = await request.json();

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : user.name;
    const phone = typeof body.phone === "string" ? body.phone.trim() : user.phone;
    const preferredLanguage = ["am", "om", "en", "ti", "so"].includes(body.preferredLanguage)
      ? body.preferredLanguage
      : user.preferredLanguage;
    const region = typeof body.region === "string" ? body.region.trim() : user.region;
    const city = typeof body.city === "string" ? body.city.trim() : user.city;
    const gender = typeof body.gender === "string" ? body.gender.trim() : user.gender;
    const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : user.dateOfBirth;
    const notes = typeof body.notes === "string" ? body.notes.trim() : user.notes;
    const tags = Array.isArray(body.tags) ? body.tags : user.tags;

    let formattedPhone = phone;
    if (phone) {
      const validated = validateEthiopianPhone(phone);
      if (!validated.isValid) {
        return NextResponse.json({ success: false, error: "Invalid Ethiopian phone format." }, { status: 400 });
      }
      formattedPhone = validated.formatted;
    }

    const [updated] = await db
      .update(users)
      .set({
        name,
        phone: formattedPhone,
        preferredLanguage,
        region,
        city,
        gender,
        dateOfBirth: dateOfBirth || null,
        notes,
        tags,
        updatedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    await logAuditEvent({
      userId: admin.id,
      action: "user_updated",
      resourceType: "user",
      resourceId: userId,
      details: { fieldsUpdated: Object.keys(body) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update user." },
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
    const { id: userId } = await params;

    if (userId === admin.id) {
      return NextResponse.json({ success: false, error: "You cannot delete your own account." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    await db.delete(users).where(eq(users.id, userId));

    await logAuditEvent({
      userId: admin.id,
      action: "user_deleted",
      resourceType: "user",
      resourceId: userId,
      details: { deletedEmail: user.email, deletedRole: user.role },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete user." },
      { status: 500 }
    );
  }
}
