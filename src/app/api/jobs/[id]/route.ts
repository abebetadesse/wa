import { NextRequest, NextResponse } from "next/server";
import { getJobForPolling } from "@/lib/jobs/queue";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const pollingToken =
    req.nextUrl.searchParams.get("token") ??
    req.headers.get("x-job-polling-token");
  const job = getJobForPolling(id, pollingToken);

  if (!job) {
    return NextResponse.json({ error: "Job not found or polling token expired" }, { status: 404 });
  }

  return NextResponse.json({ success: true, job });
}
