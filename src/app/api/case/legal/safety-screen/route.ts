import { NextResponse } from "next/server";
import { evaluateLegalSafetyScreen, LegalSafetyAnswers } from "@/lib/case-workflow/legalSafetyScreen";

const allowedValues = {
  immediateHarm: new Set(["no", "physical_danger", "threats", "prefer_not"]),
  criminalMatter: new Set(["no", "yes", "unsure", "prefer_not"]),
  evictionRisk: new Set(["no", "within_30", "within_7", "prefer_not"]),
  childWelfare: new Set(["no_children", "safe", "concerned", "prefer_not"]),
} as const;

function parseAnswers(value: unknown): LegalSafetyAnswers | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const keys = Object.keys(allowedValues) as Array<keyof typeof allowedValues>;
  if (keys.some((key) => typeof input[key] !== "string" || !allowedValues[key].has(input[key] as never))) return null;
  return {
    immediateHarm: input.immediateHarm as LegalSafetyAnswers["immediateHarm"],
    criminalMatter: input.criminalMatter as LegalSafetyAnswers["criminalMatter"],
    evictionRisk: input.evictionRisk as LegalSafetyAnswers["evictionRisk"],
    childWelfare: input.childWelfare as LegalSafetyAnswers["childWelfare"],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const answers = parseAnswers(body.answers);
    if (!answers) {
      return NextResponse.json({ success: false, error: "Complete all legal safety-screen answers." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: evaluateLegalSafetyScreen(answers) });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to evaluate the legal safety screen." }, { status: 400 });
  }
}
