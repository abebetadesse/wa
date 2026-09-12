import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLog, profileFieldDefinitions } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";
import { validateFieldInput } from "@/lib/profileFields";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  try {
    const input = validateFieldInput(await request.json());
    const { id } = await params;
    const [field] = await db.update(profileFieldDefinitions).set({ ...input, updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(profileFieldDefinitions.id, id)).returning();
    if (!field) return NextResponse.json({ success: false, error: "Field not found." }, { status: 404 });
    await db.insert(auditLog).values({ userId: auth.user.id, eventType: "profile_field_updated", payload: { fieldId: id } });
    return NextResponse.json({ success: true, field });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to update field." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  const { id } = await params;
  const [field] = await db.update(profileFieldDefinitions).set({ isActive: false, updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(profileFieldDefinitions.id, id)).returning();
  if (!field) return NextResponse.json({ success: false, error: "Field not found." }, { status: 404 });
  return NextResponse.json({ success: true, field });
}
