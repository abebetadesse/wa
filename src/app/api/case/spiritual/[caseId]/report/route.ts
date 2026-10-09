import { NextResponse } from "next/server";
import {
  canEditSpiritualReport,
  getOwnedSpiritualCase,
  getSpiritualCase,
  setSpiritualCaseReviewer,
  updateSpiritualReport,
} from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const user = await requireAuthenticatedUser();
    const isAdmin = ["admin", "super_admin"].includes(user.role) && !user.isImpersonating;
    let session = isAdmin ? getSpiritualCase(caseId) : getOwnedSpiritualCase(caseId, user.id);

    if (!session && user.role === "reviewer") {
      const reviewerSession = getSpiritualCase(caseId);
      if (reviewerSession?.reviewerId === user.id) {
        session = reviewerSession;
      }
    }

    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const canEdit = canEditSpiritualReport(caseId, user);
    const isUnlocked = session.paymentConfirmed || session.status === "full_report_released" || session.status === "consultation_booked";

    if (!isUnlocked) {
      return NextResponse.json({ success: false, error: "The full report has not been released." }, { status: 402 });
    }
    if (!session.report) {
      return NextResponse.json({ success: false, error: "The report draft has not been prepared." }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      data: {
        canDownloadPdf: isAdmin,
        canEdit,
        reviewerId: session.reviewerId ?? null,
        isUnlocked,
        status: session.status,
        report: session.report,
        gematria: session.gematria,
        assignedExpert: session.assignedExpert,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "AUTH_REQUIRED" ? 401 : 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const user = await requireAuthenticatedUser();

    if (!canEditSpiritualReport(caseId, user)) {
      return NextResponse.json({ success: false, error: "Permission denied." }, { status: 403 });
    }

    const payload = await request.json().catch(() => ({}));
    const submitted = payload && typeof payload === "object" ? payload : {};
    const reviewerId = typeof submitted.reviewerId === "string" ? submitted.reviewerId : null;
    const reportPatch = submitted.report && typeof submitted.report === "object" ? submitted.report : {};

    if (["admin", "super_admin"].includes(user.role) && reviewerId !== null) {
      setSpiritualCaseReviewer(caseId, reviewerId);
    }

    const session = updateSpiritualReport(caseId, {
      ...reportPatch,
      reviewerId: reviewerId !== null ? reviewerId : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        canEdit: canEditSpiritualReport(caseId, user),
        reviewerId: session.reviewerId ?? null,
        report: session.report,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update report";
    return NextResponse.json(
      { success: false, error: message },
      { status: message === "AUTH_REQUIRED" ? 401 : 403 }
    );
  }
}
