import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, WelbeingProfiles, WelbeingGapReports } from "@/lib/db/schema";
import { getAuthenticatedUser, validateEthiopianPhone } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    // Optional profile and case stats
    let casesCount = 0;
    try {
      const [caseStat] = await db.select({ count: count() }).from(WelbeingGapReports).where(eq(WelbeingGapReports.userId, user.id));
      casesCount = caseStat?.count || 0;
    } catch {
      // ignore if reports table schema is varied
    }

    let WelbeingProfile = null;
    try {
      [WelbeingProfile] = await db.select().from(WelbeingProfiles).where(eq(WelbeingProfiles.userId, user.id)).limit(1);
    } catch {
      // optional
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats: {
          casesCount,
        },
        WelbeingProfile,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ success: false, error: "Unable to retrieve profile." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : user.name;
    const phone = typeof body.phone === "string" ? body.phone.trim() : user.phone;
    const preferredLanguage = ["am", "om", "en", "ti", "so"].includes(body.preferredLanguage)
      ? body.preferredLanguage
      : user.preferredLanguage;
    const region = typeof body.region === "string" ? body.region.trim() : user.region;
    const city = typeof body.city === "string" ? body.city.trim() : user.city;
    const gender = typeof body.gender === "string" ? body.gender.trim() : user.gender;
    const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : null;

    let formattedPhone = phone;
    if (phone) {
      const validated = validateEthiopianPhone(phone);
      if (!validated.isValid) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid Ethiopian phone number (+251 9... or +251 7...)." },
          { status: 400 }
        );
      }
      formattedPhone = validated.formatted;
    }

    const [updated] = await db
      .update(users)
      .set({
        name,
        phone: formattedPhone,
        preferredLanguage,
        region,
        city,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    await logAuditEvent({
      userId: user.id,
      action: "profile_updated",
      resourceType: "user",
      resourceId: user.id,
      details: { fieldsUpdated: Object.keys(body) },
    });

    await logUserActivity({
      userId: user.id,
      activityType: "profile",
      description: "Updated personal account details",
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        preferredLanguage: updated.preferredLanguage,
        region: updated.region,
        city: updated.city,
        gender: updated.gender,
        dateOfBirth: updated.dateOfBirth,
        role: updated.role,
        isVerified: updated.isVerified,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile." }, { status: 500 });
  }
}
