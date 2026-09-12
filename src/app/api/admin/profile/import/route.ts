import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profileFieldDefinitions } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";
import { validateFieldInput } from "@/lib/profileFields";

export async function POST(request: NextRequest) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const raw = Array.isArray(body) ? body : body?.fields;
    if (!Array.isArray(raw)) return NextResponse.json({ success: false, error: "Expected a fields array." }, { status: 400 });
    const values = raw.map(validateFieldInput).map((field) => ({ ...field, createdBy: auth.user.id, updatedBy: auth.user.id }));
    const fields = values.length ? await db.insert(profileFieldDefinitions).values(values).returning() : [];
    return NextResponse.json({ success: true, fields, imported: fields.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to import fields." }, { status: 400 });
  }
}
