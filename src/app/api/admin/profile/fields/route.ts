import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLog, profileFieldDefinitions } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";
import { validateFieldInput } from "@/lib/profileFields";

export async function GET() {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  const fields = await db.select().from(profileFieldDefinitions).orderBy(asc(profileFieldDefinitions.section), asc(profileFieldDefinitions.displayOrder));
  return NextResponse.json({ success: true, fields, sections: [...new Set(fields.map((field) => field.section))] });
}

export async function POST(request: NextRequest) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  try {
    const input = validateFieldInput(await request.json());
    const [field] = await db.insert(profileFieldDefinitions).values({ ...input, createdBy: auth.user.id, updatedBy: auth.user.id }).returning();
    await db.insert(auditLog).values({ userId: auth.user.id, eventType: "profile_field_created", payload: { fieldId: field.id } });
    return NextResponse.json({ success: true, field }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to create field." }, { status: 400 });
  }
}
