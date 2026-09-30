/**
 * Chapa (https://developer.chapa.co) hosted checkout. Chapa's checkout offers telebirr, CBE Birr,
 * M-Pesa, cards and bank payments, so it also carries "telebirr via Chapa".
 *
 * A payment is only ever treated as paid after our server asks Chapa's verify endpoint with the
 * secret key. Webhooks and return URLs merely prompt that check.
 */
import crypto from "node:crypto";
import { ApiError } from "@/lib/api/route";

const API = () => (process.env.CHAPA_API_URL || "https://api.chapa.co/v1").replace(/\/$/, "");
const secret = () => process.env.CHAPA_SECRET_KEY?.trim() || "";

export function chapaConfigured() {
  return secret().length > 0;
}

/** Test keys start with CHASECK_TEST; shown to administrators so nobody goes live on a test key. */
export function chapaMode(): "live" | "test" | "off" {
  if (!chapaConfigured()) return "off";
  return secret().startsWith("CHASECK_TEST") ? "test" : "live";
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!chapaConfigured()) throw new ApiError(503, "Online payment is not set up yet. Please choose another payment method.");
  let res: Response;
  try {
    res = await fetch(`${API()}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new ApiError(502, "We couldn't reach the payment service. Please try again in a moment.");
  }
  const body = (await res.json().catch(() => ({}))) as { status?: string; message?: unknown; data?: unknown };
  if (!res.ok || body.status !== "success") {
    const message = typeof body.message === "string" ? body.message : "The payment service rejected the request.";
    throw Object.assign(new ApiError(res.status >= 500 ? 502 : 400, message), { providerStatus: res.status, body });
  }
  return body.data as T;
}

/** Chapa limits: title ≤ 16 chars, description only letters, numbers, spaces, - _ . */
const cleanText = (text: string, max: number) => text.replace(/[^A-Za-z0-9 ._-]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export async function initializeCheckout(input: {
  txRef: string;
  amountEtb: number;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  title: string;
  description: string;
  callbackUrl: string;
  returnUrl: string;
}) {
  const data = await call<{ checkout_url: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountEtb.toFixed(2),
      currency: "ETB",
      tx_ref: input.txRef,
      email: input.email && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(input.email) ? input.email : undefined,
      first_name: input.firstName ? cleanText(input.firstName, 50) || undefined : undefined,
      last_name: input.lastName ? cleanText(input.lastName, 50) || undefined : undefined,
      callback_url: input.callbackUrl,
      return_url: input.returnUrl,
      customization: { title: cleanText(input.title, 16), description: cleanText(input.description, 50) },
    }),
  });
  if (!data?.checkout_url) throw new ApiError(502, "The payment service did not return a checkout page.");
  return { checkoutUrl: data.checkout_url };
}

export interface ChapaVerification {
  paid: boolean;
  amountEtb: number | null;
  currency: string | null;
  reference: string | null;
  method: string | null;
  raw: Record<string, unknown>;
}

export async function verifyTransaction(txRef: string): Promise<ChapaVerification> {
  try {
    const data = await call<Record<string, unknown>>(`/transaction/verify/${encodeURIComponent(txRef)}`);
    return {
      paid: data?.status === "success",
      amountEtb: data?.amount != null ? Number(data.amount) : null,
      currency: typeof data?.currency === "string" ? data.currency : null,
      reference: typeof data?.reference === "string" ? data.reference : null,
      method: typeof data?.method === "string" ? data.method : typeof data?.payment_method === "string" ? data.payment_method : null,
      raw: data ?? {},
    };
  } catch (error) {
    // Chapa answers 4xx for transactions that were never completed.
    if (error instanceof ApiError && error.status === 400) return { paid: false, amountEtb: null, currency: null, reference: null, method: null, raw: {} };
    throw error;
  }
}

/**
 * Webhook authenticity (defence in depth; the payment is re-verified with the API regardless).
 * Chapa signs the raw body with the webhook secret (x-chapa-signature) and also sends
 * chapa-signature = HMAC(secret, secret).
 */
export function webhookSignatureValid(rawBody: string, headers: Headers): boolean {
  const key = process.env.CHAPA_WEBHOOK_SECRET?.trim();
  if (!key) return true;
  const hmac = (value: string) => crypto.createHmac("sha256", key).update(value).digest("hex");
  const candidates = [headers.get("x-chapa-signature"), headers.get("chapa-signature")].filter((v): v is string => Boolean(v));
  const expected = [hmac(rawBody), hmac(key)];
  return candidates.some((sig) => expected.some((exp) => sig.length === exp.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))));
}
