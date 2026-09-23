import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema";
import { requireAnyRole, hashPassword, validatePasswordStrength, validateEthiopianPhone } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq, ilike, or, and, desc, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAnyRole(["admin", "super_admin"]);
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search")?.trim() || "";
    const roleFilter = searchParams.get("role")?.trim() || "";
    const statusFilter = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.phone, `%${search}%`)
        )
      );
    }

    if (roleFilter && roleFilter !== "all") {
      conditions.push(eq(users.role, roleFilter));
    }

    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "active") {
        conditions.push(and(eq(users.isActive, true), eq(users.isSuspended, false)));
      } else if (statusFilter === "inactive") {
        conditions.push(eq(users.isActive, false));
      } else if (statusFilter === "suspended") {
        conditions.push(eq(users.isSuspended, true));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total count
    const [totalCountResult] = await db.select({ total: count() }).from(users).where(whereClause);
    const total = totalCountResult?.total || 0;

    // Paginated records
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        roleId: users.roleId,
        phone: users.phone,
        preferredLanguage: users.preferredLanguage,
        gender: users.gender,
        region: users.region,
        city: users.city,
        isVerified: users.isVerified,
        isActive: users.isActive,
        isSuspended: users.isSuspended,
        suspensionReason: users.suspensionReason,
        loginCount: users.loginCount,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: {
        users: userList,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin user list error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to load users." },
      { status: error instanceof Error && error.message.includes("ROLE_DENIED") ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAnyRole(["admin", "super_admin"]);
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : typeof body.fullName === "string" ? body.fullName.trim() : "";
    const password = typeof body.password === "string" ? body.password : "EthioWelbeing@2026!";
    const roleName = typeof body.role === "string" ? body.role.trim() : "user";
    const phoneInput = typeof body.phone === "string" ? body.phone.trim() : "";
    const preferredLanguage = ["am", "om", "en", "ti", "so"].includes(body.preferredLanguage)
      ? body.preferredLanguage
      : "en";
    const region = typeof body.region === "string" ? body.region.trim() : null;
    const city = typeof body.city === "string" ? body.city.trim() : null;
    const gender = typeof body.gender === "string" ? body.gender.trim() : null;
    const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : null;
    const status = typeof body.status === "string" ? body.status : "active";
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Valid email is required." }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ success: false, error: "Full Name is required." }, { status: 400 });
    }

    // Role security check: Only super_admin can create super_admin or admin
    if (["super_admin", "admin"].includes(roleName) && admin.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Only Super Admins can create administrative accounts." }, { status: 403 });
    }

    // Phone validation
    let formattedPhone: string | null = null;
    if (phoneInput) {
      const phoneValidation = validateEthiopianPhone(phoneInput);
      if (!phoneValidation.isValid) {
        return NextResponse.json({ success: false, error: "Invalid Ethiopian phone format." }, { status: 400 });
      }
      formattedPhone = phoneValidation.formatted;
    }

    // Existing check
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ success: false, error: "User with this email already exists." }, { status: 409 });
    }

    // Lookup role
    const [targetRole] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash: hashPassword(password),
        role: roleName,
        roleId: targetRole?.id || null,
        phone: formattedPhone,
        preferredLanguage,
        region,
        city,
        gender,
        dateOfBirth: dateOfBirth || null,
        isActive: status !== "inactive",
        isSuspended: status === "suspended",
        isVerified: true,
        notes,
        tags,
        createdBy: admin.id,
      })
      .returning();

    await logAuditEvent({
      userId: admin.id,
      action: "user_created",
      resourceType: "user",
      resourceId: newUser.id,
      details: { createdUserEmail: email, role: roleName },
    });

    await logUserActivity({
      userId: newUser.id,
      activityType: "account_created",
      description: `Account created by administrator ${admin.name || admin.email}`,
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create user." },
      { status: 500 }
    );
  }
}
