import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, emailVerifications } from "@/lib/db/schema";
import { establishAuth, getAuthenticatedUser } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq, and, gt, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : typeof body.otpCode === "string" ? body.otpCode.trim() : "";
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const currentUser = await getAuthenticatedUser();
    let targetUserId = currentUser?.id;

    if (!targetUserId && email) {
      const [found] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      targetUserId = found?.id;
    }

    if (!targetUserId && !token) {
      return NextResponse.json({ success: false, error: "Please log in or provide your registered email." }, { status: 400 });
    }

    // Find verification record
    let record;
    if (token) {
      [record] = await db
        .select()
        .from(emailVerifications)
        .where(and(eq(emailVerifications.token, token), gt(emailVerifications.expiresAt, new Date())))
        .limit(1);
    } else if (targetUserId && code) {
      [record] = await db
        .select()
        .from(emailVerifications)
        .where(
          and(
            eq(emailVerifications.userId, targetUserId),
            eq(emailVerifications.otpCode, code),
            gt(emailVerifications.expiresAt, new Date())
          )
        )
        .orderBy(desc(emailVerifications.createdAt))
        .limit(1);
    }

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified
    await db.update(emailVerifications).set({ verifiedAt: new Date() }).where(eq(emailVerifications.id, record.id));
    await db.update(users).set({ isVerified: true, updatedAt: new Date() }).where(eq(users.id, record.userId));

    // Retrieve verified user
    const [verifiedUser] = await db.select().from(users).where(eq(users.id, record.userId)).limit(1);

    if (verifiedUser) {
      await establishAuth({ id: verifiedUser.id, role: verifiedUser.role }, request);
    }

    await logAuditEvent({
      userId: record.userId,
      action: "email_verified",
      resourceType: "user",
      resourceId: record.userId,
      details: { verifiedAt: new Date() },
    });

    await logUserActivity({
      userId: record.userId,
      activityType: "verification",
      description: "Email address verified successfully",
    });

    return NextResponse.json({
      success: true,
      message: "Account verified successfully! Welcome to the Ethiopian Wisdom Platform.",
      data: { isVerified: true },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: "Verification failed. Please try again." }, { status: 500 });
  }
}
