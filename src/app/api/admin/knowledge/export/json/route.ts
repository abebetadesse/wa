import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgeCategories, knowledgeItems, knowledgeStrands } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";

export async function GET() {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  const [strands, categories, items] = await Promise.all([
    db.select().from(knowledgeStrands),
    db.select().from(knowledgeCategories),
    db.select().from(knowledgeItems),
  ]);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), strands, categories, items }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=\"knowledge-backup.json\"" },
  });
}
