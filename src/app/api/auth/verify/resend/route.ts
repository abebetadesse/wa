import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, emailVerifications } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    let user;
    if (email) {
      [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    } else {
      const current = await getAuthenticatedUser();
      if (current) {
        [user] = await db.select().from(users).where(eq(users.id, current.id)).limit(1);
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Account not found." }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: "Account is already verified." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(emailVerifications).values({
      userId: user.id,
      token,
      otpCode,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: `A new verification code has been dispatched to ${user.email}.`,
      demoOtpCode: otpCode,
      demoVerificationToken: token,
    });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ success: false, error: "Unable to resend code." }, { status: 500 });
  }
}
