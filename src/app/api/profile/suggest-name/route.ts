import { NextRequest, NextResponse } from "next/server";
import { suggestAlternativeNames, SuggestionCriteria } from "@/lib/profiling/naming/nameSuggester";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const criteria: SuggestionCriteria = {
      targetElement: body.targetElement,
      targetDestinyNumber: body.targetDestinyNumber ? parseInt(body.targetDestinyNumber, 10) : undefined,
      gender: body.gender,
      languagePreference: body.languagePreference,
      fullName: body.fullName,
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      city: body.city,
    };

    const suggestions = suggestAlternativeNames(criteria);
    return NextResponse.json({
      success: true,
      count: suggestions.length,
      bestSuggestion: suggestions[0] ?? null,
      suggestions,
      disclaimer: "Name scores are transparent cultural-reflection matches, not predictions, diagnoses, or measures of a person's worth.",
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
