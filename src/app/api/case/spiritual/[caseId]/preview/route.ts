import { NextRequest, NextResponse } from "next/server";
import { getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const user = await requireAuthenticatedUser();
    const session = getOwnedSpiritualCase(caseId, user.id);

    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const freeSummary = `Your name ${session.nameGeez} carries the vibration of ${session.gematria.finalNumber}, associated with the ancient constellation of ${session.gematria.zodiac.name}. The Awde Negest reveals you are currently within the Circle of ${session.gematria.awdeCircle.name} (${session.gematria.awdeCircle.nameAmharic}), Segment ${session.gematria.awdeSegment.number}, suggesting a period of significant reawakening...`;

    const debteraNote = `"When I read your name, I immediately felt the tension between your deep inner desire for clarity and the external duties pulling at you. This is a season of release and renewal." — ${session.assignedExpert?.name || "Verified Debtera"}`;

    const toc = [
      { id: 1, title: "Divination Summary", locked: false },
      { id: 2, title: "Cultural Interpretation", locked: true },
      { id: 3, title: "Practical Guidance", locked: true },
      { id: 4, title: "Recommended Ritual", locked: true },
      { id: 5, title: "Personalized Healing Scroll", locked: true },
      { id: 6, title: "Follow-up Consultation Access", locked: true },
    ];

    return NextResponse.json({
      success: true,
      data: {
        caseId: session.id,
        status: session.status,
        expert: session.assignedExpert,
        toc,
        freeSummary,
        debteraNote,
        priceEtb: 500,
        currency: "ETB",
        scrollPreviewAvailable: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
