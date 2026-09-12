import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { authSessions, users } from "@/lib/db/schema";
import { createAccessToken, getUserPermissions, REFRESH_COOKIE, ACCESS_COOKIE } from "@/lib/auth";
import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";

export async function POST() {
  try {
    const jar = await cookies();
    const refreshToken = jar.get(REFRESH_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: "No refresh token present." }, { status: 401 });
    }

    const refreshHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const [session] = await db
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.refreshTokenHash, refreshHash),
          eq(authSessions.isActive, true),
          gt(authSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session || session.revokedAt) {
      return NextResponse.json({ success: false, error: "Session expired or revoked." }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user || user.isSuspended || !user.isActive) {
      return NextResponse.json({ success: false, error: "Account inactive or suspended." }, { status: 403 });
    }

    const permissions = await getUserPermissions(user.id, user.role);
    const newAccessToken = createAccessToken(user.id, user.role, permissions);

    jar.set(ACCESS_COOKIE, newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ success: false, error: "Token refresh failed." }, { status: 500 });
  }
}
