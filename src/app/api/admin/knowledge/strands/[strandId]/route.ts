import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog, knowledgeStrands } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ strandId: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]); if (auth.error) return auth.error;
  const { strandId } = await params;
  try { const body = await request.json(); const [strand] = await db.update(knowledgeStrands).set({ name: String(body.name || ""), description: String(body.description || ""), version: String(body.version || "1.0.0"), displayOrder: Number(body.displayOrder || 0), isActive: body.isActive !== false, updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(knowledgeStrands.id, strandId)).returning(); if (!strand) return NextResponse.json({ success: false, error: "Strand not found." }, { status: 404 }); await db.insert(auditLog).values({ userId: auth.user.id, eventType: "knowledge_strand_updated", payload: { strandId } }); return NextResponse.json({ success: true, data: strand }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to update strand." }, { status: 400 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ strandId: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]); if (auth.error) return auth.error;
  const { strandId } = await params;
  try { const [strand] = await db.update(knowledgeStrands).set({ isActive: false, updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(knowledgeStrands.id, strandId)).returning(); if (!strand) return NextResponse.json({ success: false, error: "Strand not found." }, { status: 404 }); await db.insert(auditLog).values({ userId: auth.user.id, eventType: "knowledge_strand_archived", payload: { strandId } }); return NextResponse.json({ success: true, data: strand }); }
  catch { return NextResponse.json({ success: false, error: "Unable to archive strand." }, { status: 503 }); }
}
