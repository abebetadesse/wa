import { NextRequest, NextResponse } from "next/server";
import { EntityExtractor } from "@/lib/knowledge/parsing/entityExtractor";
import { UrgencyDetector } from "@/lib/knowledge/parsing/urgencyDetector";

const extractor = new EntityExtractor();
const urgencyDetector = new UrgencyDetector();

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("query") || "").trim();
  if (query.length < 10) return NextResponse.json({ success: true, data: { suggestions: [], urgencyHint: "", safetyFlags: [] } });

  const entities = extractor.extract(query);
  const urgency = urgencyDetector.detect(query, entities);
  const medications = entities.filter((entity) => entity.category === "medication").map((entity) => entity.value);
  const safetyFlags = medications.length
    ? [`Medication detected: ${medications.join(", ")}. Include dose and timing so interactions can be reviewed safely.`]
    : [];
  const suggestions = [
    !/\b(day|week|month|since|yesterday|today)\b/i.test(query) ? "Add when this started and whether it is getting better or worse." : "",
    !/\b(take|using|medicine|medication|herb|supplement)\b/i.test(query) ? "Mention any medicines, herbs, or supplements you currently use." : "",
  ].filter(Boolean);
  const urgencyHint = urgency.level === "critical" || urgency.level === "high" || urgency.level === "medium"
    ? "Your description contains possible urgency signals. Seek urgent medical care if symptoms are severe, sudden, or worsening."
    : "";
  return NextResponse.json({ success: true, data: { suggestions, urgencyHint, safetyFlags } });
}
