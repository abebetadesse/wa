import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAuthenticatedUser, verifyPassword, hashPassword, validatePasswordStrength } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();

    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Current and new passwords are required." }, { status: 400 });
    }

    const [fullUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!fullUser || !fullUser.passwordHash || !verifyPassword(currentPassword, fullUser.passwordHash)) {
      return NextResponse.json({ success: false, error: "Incorrect current password." }, { status: 400 });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return NextResponse.json({ success: false, error: strength.errors[0] }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        passwordHash: hashPassword(newPassword),
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await logAuditEvent({
      userId: user.id,
      action: "password_changed",
      resourceType: "user",
      resourceId: user.id,
    });

    await logUserActivity({
      userId: user.id,
      activityType: "security",
      description: "Changed password via profile settings",
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ success: false, error: "Unable to update password." }, { status: 500 });
  }
}
