import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getEnhancementCapabilities } from "@/lib/platform/enhancementCatalog";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthenticatedUser({ refreshAccessCookie: true });
  if (!user) return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });

  const isProvider = ["admin", "super_admin", "expert", "provider", "premium"].includes(user.role);
  if (!isProvider) return NextResponse.json({ success: false, error: "Provider access required." }, { status: 403 });

  return NextResponse.json({
    success: true,
    data: {
      provider: {
        id: user.id,
        name: user.name,
        role: user.role,
        verified: user.isVerified,
        language: user.preferredLanguage,
        region: user.region,
      },
      queue: {
        urgent: 0,
        awaitingReview: 0,
        awaitingClient: 0,
        bookedToday: 0,
      },
      quality: {
        responseTimeTarget: "Within 24 hours",
        approvalRequiredBeforeRelease: true,
        auditTrailEnabled: true,
      },
      capabilities: getEnhancementCapabilities("provider"),
    },
  });
}
