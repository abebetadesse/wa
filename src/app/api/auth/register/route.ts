import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, emailVerifications, roles } from "@/lib/db/schema";
import { establishAuth, hashPassword, validatePasswordStrength, validateEthiopianPhone } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const name = typeof body.fullName === "string" ? body.fullName.trim() : typeof body.name === "string" ? body.name.trim() : null;
    const phoneInput = typeof body.phone === "string" ? body.phone.trim() : "";
    const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : null;
    const preferredLanguage = ["am", "om", "en", "ti", "so"].includes(body.preferredLanguage)
      ? body.preferredLanguage
      : "en";
    const gender = typeof body.gender === "string" ? body.gender.trim() : null;
    const region = typeof body.region === "string" ? body.region.trim() : null;
    const city = typeof body.city === "string" ? body.city.trim() : null;
    const acceptTerms = Boolean(body.acceptTerms);
    const acceptPrivacy = Boolean(body.acceptPrivacy);

    // Validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Please provide a valid email address." }, { status: 400 });
    }

    if (password !== confirmPassword && confirmPassword !== "") {
      return NextResponse.json({ success: false, error: "Passwords do not match." }, { status: 400 });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json({ success: false, error: strength.errors[0], errors: strength.errors }, { status: 400 });
    }

    if (!acceptTerms || !acceptPrivacy) {
      return NextResponse.json({ success: false, error: "You must accept the Terms of Service and Privacy Policy." }, { status: 400 });
    }

    let formattedPhone: string | null = null;
    if (phoneInput) {
      const phoneValidation = validateEthiopianPhone(phoneInput);
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid Ethiopian phone number (+251 9... or +251 7...)." },
          { status: 400 }
        );
      }
      formattedPhone = phoneValidation.formatted;
    }

    // Check minimum age (at least 13 years old)
    if (dateOfBirth) {
      const birth = new Date(dateOfBirth);
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
      if (birth > minAgeDate) {
        return NextResponse.json({ success: false, error: "You must be at least 13 years old to register." }, { status: 400 });
      }
    }

    // Check existing email or phone
    const existing = await db
      .select({ id: users.id, email: users.email, phone: users.phone })
      .from(users)
      .where(or(eq(users.email, email), formattedPhone ? eq(users.phone, formattedPhone) : undefined))
      .limit(1);

    if (existing.length > 0) {
      const isEmailMatch = existing[0].email.toLowerCase() === email;
      return NextResponse.json(
        {
          success: false,
          error: isEmailMatch
            ? "An account with this email address already exists."
            : "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    // Lookup user role ID
    const [userRole] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, "user")).limit(1);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: name || email.split("@")[0],
        passwordHash: hashPassword(password),
        role: "user",
        roleId: userRole?.id || null,
        phone: formattedPhone,
        dateOfBirth: dateOfBirth || null,
        gender,
        region,
        city,
        preferredLanguage,
        isVerified: false,
        isActive: true,
      })
      .returning();

    // Generate 6-digit OTP code & verification token
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(emailVerifications).values({
      userId: newUser.id,
      token,
      otpCode,
      expiresAt,
    });

    // Auto-login session for user
    await establishAuth({ id: newUser.id, role: newUser.role }, request);

    // Audit and activity logging
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    await logAuditEvent({
      userId: newUser.id,
      action: "user_registered",
      resourceType: "user",
      resourceId: newUser.id,
      details: { email, preferredLanguage, region },
      ipAddress: ip,
    });

    await logUserActivity({
      userId: newUser.id,
      activityType: "registration",
      description: "Created new holistic Welbeing account",
      metadata: { preferredLanguage, region },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          preferredLanguage: newUser.preferredLanguage,
          isVerified: false,
          requiresVerification: true,
          demoOtpCode: otpCode, // Provided for instant testing without external SMTP
          demoVerificationToken: token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Registration is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
