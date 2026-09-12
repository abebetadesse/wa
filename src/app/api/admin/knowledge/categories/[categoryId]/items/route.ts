import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgeItems } from "@/lib/db/schema";
import { requireKnowledgeRole, parseJsonObject } from "@/lib/adminKnowledge";
import { desc, eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  const auth = await requireKnowledgeRole(["editor", "reviewer", "admin", "super_admin"]); if (auth.error) return auth.error;
  const { categoryId } = await params;
  try { return NextResponse.json({ success: true, data: await db.select().from(knowledgeItems).where(eq(knowledgeItems.categoryId, categoryId)).orderBy(desc(knowledgeItems.updatedAt)) }); }
  catch { return NextResponse.json({ success: false, error: "Knowledge database is unavailable." }, { status: 503 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  const auth = await requireKnowledgeRole(["editor", "admin", "super_admin"]); if (auth.error) return auth.error;
  const { categoryId } = await params;
  try { const body = await request.json(); const [item] = await db.insert(knowledgeItems).values({ categoryId, data: parseJsonObject(body.data || {}, "data"), status: "draft", createdBy: auth.user.id, updatedBy: auth.user.id }).returning(); return NextResponse.json({ success: true, data: item }, { status: 201 }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to create item." }, { status: 400 }); }
}
