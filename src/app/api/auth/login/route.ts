import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { establishAuth, verifyPassword, getUserPermissions } from "@/lib/auth";
import { logLoginAttempt, logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Browser Client";

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const rememberMe = Boolean(body.rememberMe);

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Please provide both email and password." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      await logLoginAttempt({
        email,
        ipAddress: ip,
        userAgent,
        status: "failed",
        failureReason: "User account not found",
      });
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    // Check account status
    if (user.isSuspended) {
      await logLoginAttempt({
        userId: user.id,
        email,
        ipAddress: ip,
        userAgent,
        status: "failed",
        failureReason: "Account suspended",
      });
      return NextResponse.json(
        {
          success: false,
          error: `This account has been suspended. ${user.suspensionReason || "Please contact platform support."}`,
        },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: "This account is inactive. Please contact support." }, { status: 403 });
    }

    // Check lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMs = new Date(user.lockoutUntil).getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      await logLoginAttempt({
        userId: user.id,
        email,
        ipAddress: ip,
        userAgent,
        status: "locked",
        failureReason: `Account locked for ${remainingMinutes} more minutes`,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Account is temporarily locked due to repeated failed attempts. Please wait ${remainingMinutes} minutes before trying again.`,
        },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = user.passwordHash ? verifyPassword(password, user.passwordHash) : false;

    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const isNowLocked = attempts >= MAX_ATTEMPTS;
      const lockoutTime = isNowLocked ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null;

      await db
        .update(users)
        .set({
          failedLoginAttempts: attempts,
          lockoutUntil: lockoutTime,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await logLoginAttempt({
        userId: user.id,
        email,
        ipAddress: ip,
        userAgent,
        status: isNowLocked ? "locked" : "failed",
        failureReason: isNowLocked ? "Max failed attempts exceeded - locked" : `Incorrect password (attempt ${attempts}/${MAX_ATTEMPTS})`,
      });

      if (isNowLocked) {
        return NextResponse.json(
          {
            success: false,
            error: `Security Alert: 5 consecutive failed attempts. Your account is locked for ${LOCKOUT_MINUTES} minutes.`,
          },
          { status: 423 }
        );
      }

      const remaining = MAX_ATTEMPTS - attempts;
      return NextResponse.json(
        {
          success: false,
          error: `Invalid email or password. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining before lockout.`,
        },
        { status: 401 }
      );
    }

    // Successful login: reset failed attempts, update stats
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
        loginCount: (user.loginCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Record login in history
    await logLoginAttempt({
      userId: user.id,
      email,
      ipAddress: ip,
      userAgent,
      status: "success",
    });

    // Establish auth session & JWT cookies
    const authResult = await establishAuth(
      { id: user.id, role: user.role },
      { rememberMe, request, deviceInfo: { userAgent, ip } }
    );

    const permissions = await getUserPermissions(user.id, user.role);

    await logAuditEvent({
      userId: user.id,
      action: "user_login",
      resourceType: "user",
      resourceId: user.id,
      details: { rememberMe, role: user.role },
      ipAddress: ip,
      sessionId: authResult.sessionId,
    });

    await logUserActivity({
      userId: user.id,
      activityType: "login",
      description: `Logged in successfully (${rememberMe ? "Extended session" : "Standard session"})`,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleId: user.roleId,
        preferredLanguage: user.preferredLanguage,
        isVerified: user.isVerified,
        permissions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login service is currently unavailable. Please check database connection." },
      { status: 503 }
    );
  }
}
