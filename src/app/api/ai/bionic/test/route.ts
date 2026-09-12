import { NextResponse } from "next/server";
import { testBionicConnection, getBionicConfigStatus } from "@/lib/ai/bionicGPT";

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
  const configStatus = getBionicConfigStatus();
  const connectionResult = await testBionicConnection();

  return NextResponse.json({
    integration: "Bionic GPT",
    account: "abebetadesse33@gmail.com",
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
