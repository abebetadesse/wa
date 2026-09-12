import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgeItems, knowledgeVersions } from "@/lib/db/schema";
import { requireKnowledgeRole, parseJsonObject } from "@/lib/adminKnowledge";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const auth = await requireKnowledgeRole(["editor", "admin", "super_admin"]); if (auth.error) return auth.error;
  const { itemId } = await params;
  try { const body = await request.json(); const [current] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, itemId)).limit(1); if (!current) return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 }); const nextData = parseJsonObject(body.data || {}, "data"); const nextVersion = current.version + 1; await db.insert(knowledgeVersions).values({ itemId, data: current.data, versionNumber: current.version, changeComment: String(body.changeComment || ""), createdBy: auth.user.id }); const [item] = await db.update(knowledgeItems).set({ data: nextData, version: nextVersion, status: "draft", updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(knowledgeItems.id, itemId)).returning(); return NextResponse.json({ success: true, data: item }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to update item." }, { status: 400 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]); if (auth.error) return auth.error;
  const { itemId } = await params;
  try { const [item] = await db.update(knowledgeItems).set({ status: "archived", updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(knowledgeItems.id, itemId)).returning(); if (!item) return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 }); return NextResponse.json({ success: true, data: item }); }
  catch { return NextResponse.json({ success: false, error: "Unable to archive item." }, { status: 503 }); }
}
