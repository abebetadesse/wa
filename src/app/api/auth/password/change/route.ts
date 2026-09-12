import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAuthenticatedUser, verifyPassword, hashPassword, validatePasswordStrength } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();

    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Please supply your current password and new password." }, { status: 400 });
    }

    if (newPassword !== confirmPassword && confirmPassword !== "") {
      return NextResponse.json({ success: false, error: "New passwords do not match." }, { status: 400 });
    }

    // Verify existing password
    const [fullUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    if (!fullUser || !fullUser.passwordHash || !verifyPassword(currentPassword, fullUser.passwordHash)) {
      return NextResponse.json({ success: false, error: "Current password does not match our records." }, { status: 400 });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return NextResponse.json({ success: false, error: strength.errors[0], errors: strength.errors }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    await db
      .update(users)
      .set({
        passwordHash: newHash,
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
      description: "Updated account password",
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error && error.message === "AUTH_REQUIRED" ? "Authentication required." : "Password update failed." },
      { status: error instanceof Error && error.message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}
