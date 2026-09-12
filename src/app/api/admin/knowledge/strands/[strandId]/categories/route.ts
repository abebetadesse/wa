import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog, knowledgeCategories } from "@/lib/db/schema";
import { requireKnowledgeRole, parseJsonObject } from "@/lib/adminKnowledge";
import { asc, eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ strandId: string }> }) {
  const auth = await requireKnowledgeRole(["editor", "reviewer", "admin", "super_admin"]); if (auth.error) return auth.error;
  const { strandId } = await params;
  try { return NextResponse.json({ success: true, data: await db.select().from(knowledgeCategories).where(eq(knowledgeCategories.strandId, strandId)).orderBy(asc(knowledgeCategories.displayOrder), asc(knowledgeCategories.name)) }); }
  catch { return NextResponse.json({ success: false, error: "Knowledge database is unavailable." }, { status: 503 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ strandId: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]); if (auth.error) return auth.error;
  const { strandId } = await params;
  try { const body = await request.json(); const [category] = await db.insert(knowledgeCategories).values({ strandId, name: String(body.name || ""), description: String(body.description || ""), schema: parseJsonObject(body.schema || { fields: [] }, "schema"), displayOrder: Number(body.displayOrder || 0) }).returning(); await db.insert(auditLog).values({ userId: auth.user.id, eventType: "knowledge_category_created", payload: { categoryId: category.id, strandId } }); return NextResponse.json({ success: true, data: category }, { status: 201 }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to create category." }, { status: 400 }); }
}
