/**
 * WhatsApp through Meta's WhatsApp Business Cloud API.
 *
 *   WHATSAPP_ACCESS_TOKEN       a permanent system-user token with whatsapp_business_messaging
 *   WHATSAPP_PHONE_NUMBER_ID    the sending number's id (WhatsApp Manager → API setup)
 *   WHATSAPP_BUSINESS_NUMBER    the same number as people dial it, e.g. +251911000000 (for chat links)
 *   WHATSAPP_APP_SECRET         signs incoming webhooks (Meta app → Settings → Basic)
 *   WHATSAPP_VERIFY_TOKEN       any random value; entered once when registering the webhook
 *   WHATSAPP_TEMPLATE_NAME      optional approved template with two body variables, {{1}} title and {{2}} text
 *   WHATSAPP_TEMPLATE_LANG      the template's language code (default "en")
 *
 * WhatsApp only allows free-form messages within 24 hours of the person's last message to the
 * number. Outside that window a pre-approved template is required, so updates are sent as text
 * while the window is open and through the template otherwise.
 */
import crypto from "node:crypto";

const GRAPH = "https://graph.facebook.com/v21.0";
export const WHATSAPP_WINDOW_MS = 24 * 60 * 60 * 1000;

const env = (name: string) => process.env[name]?.trim() || "";

export function whatsappStatus() {
  const number = env("WHATSAPP_BUSINESS_NUMBER").replace(/\D/g, "");
  return {
    configured: Boolean(env("WHATSAPP_ACCESS_TOKEN") && env("WHATSAPP_PHONE_NUMBER_ID")),
    /** Digits only, as wa.me links expect. */
    number: number || null,
    inbound: Boolean(env("WHATSAPP_APP_SECRET") && env("WHATSAPP_VERIFY_TOKEN")),
    template: env("WHATSAPP_TEMPLATE_NAME") || null,
  };
}

/** Meta signs each webhook body with the app secret: `X-Hub-Signature-256: sha256=<hex>`. */
export function verifyWhatsAppSignature(appSecret: string, rawBody: string, header: string | null): boolean {
  if (!appSecret || !header?.startsWith("sha256=")) return false;
  const expected = Buffer.from(crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex"));
  const received = Buffer.from(header.slice(7));
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export function withinWindow(lastInboundAt: Date | string | null | undefined, now = Date.now()): boolean {
  if (!lastInboundAt) return false;
  const at = new Date(lastInboundAt).getTime();
  return Number.isFinite(at) && now - at < WHATSAPP_WINDOW_MS;
}

/** The request body for one update: text inside the 24-hour window, the template outside it. */
export function whatsappPayload(to: string, message: { title: string; body?: string; url?: string }, options: { windowOpen: boolean; template: string | null; language?: string }) {
  const text = [message.title, message.body, message.url].filter(Boolean).join("\n\n");
  if (options.windowOpen || !options.template) {
    return { messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body: text.slice(0, 4000) } };
  }
  // Template variables may not contain line breaks or runs of spaces.
  const flat = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 900);
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: options.template,
      language: { code: options.language || "en" },
      components: [{ type: "body", parameters: [{ type: "text", text: flat(message.title) }, { type: "text", text: flat([message.body, message.url].filter(Boolean).join(" ")) || "-" }] }],
    },
  };
}

/** Best effort: failures are logged without the recipient or the text, never thrown. */
export async function sendWhatsApp(to: string, message: { title: string; body?: string; url?: string }, lastInboundAt?: Date | string | null): Promise<boolean> {
  const status = whatsappStatus();
  if (!status.configured) return false;
  const windowOpen = withinWindow(lastInboundAt);
  try {
    const res = await fetch(`${GRAPH}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env("WHATSAPP_ACCESS_TOKEN")}` },
      body: JSON.stringify(whatsappPayload(to, message, { windowOpen, template: status.template, language: env("WHATSAPP_TEMPLATE_LANG") })),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const code = await res.json().then((json) => json?.error?.code).catch(() => undefined);
      const hint = !windowOpen && !status.template ? " (outside the 24-hour window; set WHATSAPP_TEMPLATE_NAME to an approved template)" : "";
      console.warn(`[whatsapp] send failed: ${res.status}${code ? ` code ${code}` : ""}${hint}`);
    }
    return res.ok;
  } catch (error) {
    console.warn("[whatsapp] send error", error instanceof Error ? error.message : error);
    return false;
  }
}

export interface WhatsAppInbound {
  from: string;
  text: string;
  id: string;
}

/** Text messages in a webhook delivery; statuses, media and other event kinds are ignored. */
export function parseWhatsAppWebhook(body: unknown): WhatsAppInbound[] {
  const messages: WhatsAppInbound[] = [];
  const entries = (body as { entry?: unknown })?.entry;
  if (!Array.isArray(entries)) return messages;
  for (const entry of entries) {
    for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
      for (const message of Array.isArray(change?.value?.messages) ? change.value.messages : []) {
        const from = typeof message?.from === "string" ? message.from.replace(/\D/g, "") : "";
        const text = message?.type === "text" && typeof message.text?.body === "string" ? message.text.body : "";
        if (from && text) messages.push({ from, text: text.slice(0, 4096), id: String(message.id ?? "") });
      }
    }
  }
  return messages;
}
