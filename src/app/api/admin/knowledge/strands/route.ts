import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog, knowledgeStrands } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const auth = await requireKnowledgeRole(["editor", "reviewer", "admin", "super_admin"]);
  if (auth.error) return auth.error;
  try { return NextResponse.json({ success: true, data: await db.select().from(knowledgeStrands).orderBy(knowledgeStrands.displayOrder, knowledgeStrands.name) }); }
  catch { return NextResponse.json({ success: false, error: "Knowledge database is unavailable." }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ success: false, error: "Strand name is required." }, { status: 400 });
    const [strand] = await db.insert(knowledgeStrands).values({ name, description: String(body.description || ""), version: String(body.version || "1.0.0"), displayOrder: Number(body.displayOrder || 0), createdBy: auth.user.id, updatedBy: auth.user.id }).returning();
    await db.insert(auditLog).values({ userId: auth.user.id, eventType: "knowledge_strand_created", payload: { strandId: strand.id, name } });
    return NextResponse.json({ success: true, data: strand }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to create strand." }, { status: 400 }); }
}
