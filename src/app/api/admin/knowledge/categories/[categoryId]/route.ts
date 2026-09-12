import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgeCategories } from "@/lib/db/schema";
import { requireKnowledgeRole, parseJsonObject } from "@/lib/adminKnowledge";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  const auth = await requireKnowledgeRole(["editor", "reviewer", "admin", "super_admin"]);
  if (auth.error) return auth.error;
  const { categoryId } = await params;
  const [category] = await db.select().from(knowledgeCategories).where(eq(knowledgeCategories.id, categoryId)).limit(1);
  if (!category) return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: category });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  const { categoryId } = await params;
  try {
    const body = await request.json();
    const [category] = await db.update(knowledgeCategories).set({
      name: String(body.name || "").trim(),
      description: String(body.description || ""),
      schema: parseJsonObject(body.schema || { fields: [] }, "schema"),
      displayOrder: Number(body.displayOrder || 0),
      isActive: body.isActive !== false,
      updatedAt: new Date(),
    }).where(eq(knowledgeCategories.id, categoryId)).returning();
    if (!category) return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to update category." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  const { categoryId } = await params;
  const [category] = await db.update(knowledgeCategories).set({ isActive: false, updatedAt: new Date() }).where(eq(knowledgeCategories.id, categoryId)).returning();
  if (!category) return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: category });
}
