import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLog, knowledgeItems } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";
import { eq } from "drizzle-orm";

const transitions = { review: ["editor", "admin", "super_admin"], published: ["reviewer", "admin", "super_admin"], draft: ["editor", "reviewer", "admin", "super_admin"] } as const;
export async function POST(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const auth = await requireKnowledgeRole(["editor", "reviewer", "admin", "super_admin"]); if (auth.error) return auth.error;
  const { itemId } = await params;
  try { const body = await request.json(); const status = body.status as keyof typeof transitions; if (!transitions[status] || !transitions[status].includes(auth.user.role as never)) return NextResponse.json({ success: false, error: "Role cannot perform this transition." }, { status: 403 }); const [item] = await db.update(knowledgeItems).set({ status, reviewedBy: status === "published" ? auth.user.id : undefined, publishedAt: status === "published" ? new Date() : undefined, updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(knowledgeItems.id, itemId)).returning(); if (!item) return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 }); await db.insert(auditLog).values({ userId: auth.user.id, eventType: `knowledge_item_${status}`, payload: { itemId, status } }); return NextResponse.json({ success: true, data: item }); }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to transition item." }, { status: 400 }); }
}
