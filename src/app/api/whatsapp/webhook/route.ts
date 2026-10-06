import { NextResponse } from "next/server";
import { receiveChatMessage } from "@/server/messaging/bot";
import { createDeduper } from "@/server/messaging/inbound";
import { parseWhatsAppWebhook, sendWhatsApp, verifyWhatsAppSignature } from "@/server/messaging/whatsapp";

export const dynamic = "force-dynamic";

const alreadyHandled = createDeduper();

/** Meta calls this once when the webhook is registered and expects the challenge echoed back. */
export async function GET(request: Request) {
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim() ?? "";
  const params = new URL(request.url).searchParams;
  if (!expected || params.get("hub.mode") !== "subscribe" || params.get("hub.verify_token") !== expected) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return new Response(params.get("hub.challenge") ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: Request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim() ?? "";
  if (!appSecret) return NextResponse.json({ error: "WhatsApp webhook is not configured." }, { status: 503 });
  // The signature covers the exact bytes Meta sent, so it is checked before parsing.
  const raw = await request.text();
  if (!verifyWhatsAppSignature(appSecret, raw, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  for (const message of parseWhatsAppWebhook(body)) {
    if (alreadyHandled(message.id)) continue;
    try {
      const reply = await receiveChatMessage("whatsapp", message.from, message.text);
      // The person has just written, so the 24-hour window is open and plain text is allowed.
      if (reply) await sendWhatsApp(message.from, { title: reply.text, url: reply.link?.url }, new Date());
    } catch (error) {
      // Answer 200 regardless: Meta retries failed deliveries, which would repeat the message.
      console.error("[whatsapp] webhook handling failed:", error instanceof Error ? error.message : error);
    }
  }
  return NextResponse.json({ ok: true });
}
