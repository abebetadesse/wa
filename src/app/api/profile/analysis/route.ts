import { NextResponse } from "next/server";
import { getPipelineSession } from "@/lib/pipeline/auth";
import { pipelineRepository } from "@/lib/pipeline/repository";
import { evaluateProfile } from "@/lib/evaluation/profileEvaluator";

export async function GET(req: Request) {
  try {
    const session = await getPipelineSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId") || session.userId;

    // Role-based access control (§2): User can only see own preliminary analysis
    if (session.role === "USER" && requestedUserId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Users may only access their own preliminary analysis." },
        { status: 403 }
      );
    }

    const profile = await pipelineRepository.getProfileByUserId(requestedUserId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "No profile found for user. Please submit a profile first." },
        { status: 404 }
      );
    }

    let analysis = await pipelineRepository.getPreliminaryAnalysisByProfileId(profile.id);
    if (!analysis) {
      analysis = await evaluateProfile(profile);
      await pipelineRepository.savePreliminaryAnalysis(profile.id, analysis);
    }

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
