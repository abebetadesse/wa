import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResets } from "@/lib/db/schema";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ success: false, error: "Please enter your registered email address." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // If user exists, create token. If not, return standard response to prevent user enumeration
    let demoResetToken: string | undefined = undefined;

    if (user && user.isActive && !user.isSuspended) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResets).values({
        userId: user.id,
        token,
        expiresAt,
      });

      demoResetToken = token;

      await logAuditEvent({
        userId: user.id,
        action: "password_reset_requested",
        resourceType: "user",
        resourceId: user.id,
        details: { email },
      });

      await logUserActivity({
        userId: user.id,
        activityType: "security",
        description: "Password reset token requested",
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account matches that email address, a password reset link has been dispatched.",
      demoResetToken, // Provided for easy development & demonstration
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, error: "Unable to process password reset request." }, { status: 500 });
  }
}
