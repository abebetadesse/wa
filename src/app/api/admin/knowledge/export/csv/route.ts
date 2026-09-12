import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgeItems } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";
import { eq } from "drizzle-orm";

function csvCell(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const auth = await requireKnowledgeRole(["editor", "reviewer", "admin", "super_admin"]);
  if (auth.error) return auth.error;
  const categoryId = request.nextUrl.searchParams.get("categoryId");
  const items = categoryId
    ? await db.select().from(knowledgeItems).where(eq(knowledgeItems.categoryId, categoryId))
    : await db.select().from(knowledgeItems);
  const fields = [...new Set(items.flatMap((item) => Object.keys((item.data || {}) as Record<string, unknown>)))];
  const rows = [fields, ...items.map((item) => fields.map((field) => ((item.data || {}) as Record<string, unknown>)[field]))];
  return new NextResponse(rows.map((row) => row.map(csvCell).join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${categoryId ? `knowledge-${categoryId}` : "knowledge-backup"}.csv"` },
  });
}
