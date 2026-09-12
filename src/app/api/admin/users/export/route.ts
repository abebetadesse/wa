import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAnyRole } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAnyRole(["admin", "super_admin"]);
    const format = request.nextUrl.searchParams.get("format")?.toLowerCase() || "json";

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        phone: users.phone,
        preferredLanguage: users.preferredLanguage,
        region: users.region,
        city: users.city,
        gender: users.gender,
        dateOfBirth: users.dateOfBirth,
        isVerified: users.isVerified,
        isActive: users.isActive,
        isSuspended: users.isSuspended,
        loginCount: users.loginCount,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    await logAuditEvent({
      userId: admin.id,
      action: "users_exported",
      resourceType: "user",
      details: { format, exportCount: allUsers.length },
    });

    if (format === "csv") {
      const headers = [
        "ID",
        "Email",
        "Full Name",
        "Role",
        "Phone",
        "Language",
        "Region",
        "City",
        "Gender",
        "Date of Birth",
        "Verified",
        "Active",
        "Suspended",
        "Login Count",
        "Last Login",
        "Created At",
      ];

      const rows = allUsers.map((u) => [
        `"${u.id}"`,
        `"${u.email}"`,
        `"${(u.name || "").replace(/"/g, '""')}"`,
        `"${u.role}"`,
        `"${u.phone || ""}"`,
        `"${u.preferredLanguage}"`,
        `"${u.region || ""}"`,
        `"${u.city || ""}"`,
        `"${u.gender || ""}"`,
        `"${u.dateOfBirth || ""}"`,
        u.isVerified ? "TRUE" : "FALSE",
        u.isActive ? "TRUE" : "FALSE",
        u.isSuspended ? "TRUE" : "FALSE",
        u.loginCount,
        u.lastLoginAt ? `"${new Date(u.lastLoginAt).toISOString()}"` : '""',
        `"${new Date(u.createdAt).toISOString()}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ethio_wellness_users_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: allUsers,
      total: allUsers.length,
    });
  } catch (error) {
    console.error("Export users error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Export failed." },
      { status: 500 }
    );
  }
}
