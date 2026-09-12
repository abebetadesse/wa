import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgeItems } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";

function parseCsv(input: string) {
  const lines = input.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const parseLine = (line: string) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((cell) => {
    const value = cell.trim().replace(/^"|"$/g, "").replaceAll('""', '"');
    try { return JSON.parse(value); } catch { return value; }
  });
  const headers = parseLine(lines[0]).map(String);
  return lines.slice(1).map((line) => Object.fromEntries(parseLine(line).map((value, index) => [headers[index], value])));
}

export async function POST(request: NextRequest) {
  const auth = await requireKnowledgeRole(["editor", "admin", "super_admin"]);
  if (auth.error) return auth.error;
  const form = await request.formData();
  const categoryId = String(form.get("categoryId") || "");
  const file = form.get("file");
  if (!categoryId || !(file instanceof File)) return NextResponse.json({ success: false, error: "categoryId and file are required." }, { status: 400 });
  if (!file.name.toLowerCase().endsWith(".csv") && file.type && file.type !== "text/csv") {
    return NextResponse.json({ success: false, error: "Only CSV files are accepted." }, { status: 400 });
  }
  const rows = parseCsv(await file.text());
  if (!rows.length) return NextResponse.json({ success: false, error: "CSV contains no data rows." }, { status: 400 });
  const created = await db.insert(knowledgeItems).values(rows.map((data) => ({ categoryId, data, status: "draft", createdBy: auth.user.id, updatedBy: auth.user.id }))).returning();
  return NextResponse.json({ success: true, data: { imported: created.length, items: created } }, { status: 201 });
}
