import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { profileFieldDefinitions } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";

export async function GET() {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  const fields = await db.select().from(profileFieldDefinitions).orderBy(asc(profileFieldDefinitions.displayOrder));
  return new NextResponse(JSON.stringify({ fields, exportedAt: new Date().toISOString() }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=profile-fields.json" },
  });
}
