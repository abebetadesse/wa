import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLog, userProfiles } from "@/lib/db/schema";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isVisible } from "@/lib/profileFields";
import { ensureProfileFieldCatalog } from "@/lib/profileFieldCatalog";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id));
    const fields = await ensureProfileFieldCatalog();
    const data = profile?.data || {};
    const height = typeof data.height === "number" ? data.height : Number(data["Welbeing.height"]);
    const weight = typeof data.weight === "number" ? data.weight : Number(data["Welbeing.weight"]);
    const bmi = height > 0 && weight > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : null;
    return NextResponse.json({ success: true, data, fields, computed: { bmi } });
  } catch {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ success: false, error: "Profile data must be an object." }, { status: 400 });
    const incoming = body as Record<string, unknown>;
    const fields = await ensureProfileFieldCatalog();
    const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id));
    const data = { ...(existing?.data || {}), ...incoming };
    for (const field of fields) {
      if (field.required && isVisible(field, data) && (data[field.id] === undefined || data[field.id] === "")) {
        return NextResponse.json({ success: false, error: `${field.label} is required.` }, { status: 400 });
      }
    }
    await db.insert(userProfiles).values({ userId: user.id, data, updatedAt: new Date() }).onConflictDoUpdate({ target: userProfiles.userId, set: { data, updatedAt: new Date() } });
    await db.insert(auditLog).values({ userId: user.id, eventType: "profile_updated", payload: { fieldIds: Object.keys(incoming) } });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to update profile." }, { status: 400 });
  }
}
