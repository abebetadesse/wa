import { NextResponse } from "next/server";
import { testBionicConnection, getBionicConfigStatus } from "@/lib/ai/bionicGPT";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/ai/bionic/test
 *
 * Tests the Bionic GPT connection and returns config status.
 * Use this to verify your API key and base URL are correct.
 *
 * Example:
 *   curl http://localhost:3000/api/ai/bionic/test
 */
export async function GET() {
  const user = await getAuthenticatedUser({ refreshAccessCookie: true });
  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }
  if (!["admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ success: false, error: "Administrator access required." }, { status: 403 });
  }

  const configStatus = getBionicConfigStatus();
  const connectionResult = await testBionicConnection();

  return NextResponse.json({
    integration: "Bionic GPT",
    config: configStatus,
    connection: connectionResult,
    instructions: configStatus.configured
      ? null
      : {
          steps: [
            "1. Log in to your Bionic GPT instance (https://app.bionic-gpt.com)",
            "2. Go to Settings → API Keys → Generate New Key",
            "3. Copy the key and set BIONIC_GPT_API_KEY in your .env file",
            "4. Set BIONIC_GPT_BASE_URL to your Bionic instance URL",
            "5. Set BIONIC_GPT_MODEL to the model name shown in your console",
            "6. Restart the dev server and call this endpoint again",
          ],
          missingVars: configStatus.missingVars,
        },
  });
}
