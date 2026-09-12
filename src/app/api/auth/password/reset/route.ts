import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResets } from "@/lib/db/schema";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq, and, gt, isNull } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token) {
      return NextResponse.json({ success: false, error: "Reset token is required." }, { status: 400 });
    }

    if (password !== confirmPassword && confirmPassword !== "") {
      return NextResponse.json({ success: false, error: "Passwords do not match." }, { status: 400 });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json({ success: false, error: strength.errors[0], errors: strength.errors }, { status: 400 });
    }

    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(and(eq(passwordResets.token, token), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())))
      .limit(1);

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid, expired, or already used password reset token." },
        { status: 400 }
      );
    }

    const newHash = hashPassword(password);

    await db
      .update(users)
      .set({
        passwordHash: newHash,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        lockoutUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetRecord.userId));

    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, resetRecord.id));

    await logAuditEvent({
      userId: resetRecord.userId,
      action: "password_reset_completed",
      resourceType: "user",
      resourceId: resetRecord.userId,
    });

    await logUserActivity({
      userId: resetRecord.userId,
      activityType: "security",
      description: "Password reset completed successfully",
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. Please log in with your new credentials.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ success: false, error: "Failed to reset password. Please try again." }, { status: 500 });
  }
}
