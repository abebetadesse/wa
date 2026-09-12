import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResets } from "@/lib/db/schema";
import { requireAnyRole, hashPassword } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAnyRole(["admin", "super_admin"]);
    const { id: userId } = await params;
    const body = await request.json().catch(() => ({}));

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    // Optional direct password override if provided, or generated temporary password
    const temporaryPassword =
      typeof body.temporaryPassword === "string" && body.temporaryPassword.trim()
        ? body.temporaryPassword.trim()
        : `Ethiohealth@${Math.floor(1000 + Math.random() * 9000)}!`;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(passwordResets).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Update with new temporary password
    await db
      .update(users)
      .set({
        passwordHash: hashPassword(temporaryPassword),
        failedLoginAttempts: 0,
        lockoutUntil: null,
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await logAuditEvent({
      userId: admin.id,
      action: "admin_password_reset",
      resourceType: "user",
      resourceId: userId,
      details: { targetEmail: user.email },
    });

    await logUserActivity({
      userId,
      activityType: "security",
      description: `Password reset by administrator ${admin.name || admin.email}`,
    });

    return NextResponse.json({
      success: true,
      message: `Password has been reset for ${user.email}.`,
      temporaryPassword,
      resetToken: token,
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to reset password." },
      { status: 500 }
    );
  }
}
