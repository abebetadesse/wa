import { NextResponse } from "next/server";
import { formulate, type FormulationRequest } from "@/lib/nutrition/formulationEngine";

function isFormulationRequest(value: unknown): value is FormulationRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<FormulationRequest>;
  return !!request.profile && Array.isArray(request.candidateIngredients) && Array.isArray(request.nutrients);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  if (!isFormulationRequest(body)) {
    return NextResponse.json({ success: false, error: "profile, candidateIngredients, and nutrients are required." }, { status: 400 });
  }
  const result = formulate(body);
  return NextResponse.json({
    success: true,
    result,
    disclaimer: "Planning tool only; not a diagnosis or substitute for practitioner/dietitian advice. Therapeutic, pregnancy, child, medication, and chronic-disease outputs require expert review.",
  }, { status: result.status === "blocked" ? 422 : 200 });
}