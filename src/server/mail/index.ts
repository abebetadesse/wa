/**
 * Outgoing email over SMTP (any provider, including a mailbox created in the hosting panel).
 *
 *   SMTP_HOST, SMTP_PORT (587 by default; 465 uses implicit TLS), SMTP_USER, SMTP_PASSWORD
 *   MAIL_FROM   e.g. "Ethiopian Wisdom Atlas <no-reply@example.et>" (defaults to SMTP_USER)
 *
 * Without SMTP_HOST nothing is sent and callers fall back (Telegram, or "contact support").
 * Sending never throws: a mail-server problem must not fail a sign-up or a reset request.
 */
import nodemailer, { type Transporter } from "nodemailer";

export function mailStatus() {
  const host = process.env.SMTP_HOST?.trim();
  return { configured: Boolean(host), from: process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "" };
}

let transport: Transporter | null = null;
let transportKey = "";

function getTransport() {
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const key = `${host}:${port}:${user ?? ""}`;
  if (!transport || transportKey !== key) {
    transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: user ? { user, pass: process.env.SMTP_PASSWORD ?? "" } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    transportKey = key;
  }
  return transport;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendMail(message: MailMessage): Promise<{ sent: boolean }> {
  const status = mailStatus();
  if (!status.configured || !status.from) return { sent: false };
  try {
    await getTransport().sendMail({ from: status.from, to: message.to, subject: message.subject, text: message.text, html: message.html });
    return { sent: true };
  } catch (error) {
    // The address and content are deliberately not logged.
    console.error("[mail] delivery failed:", error instanceof Error ? error.message : error);
    return { sent: false };
  }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** A plain, single-action email: a few lines, then one code or one button. */
export function actionEmail(input: { heading: string; lines: string[]; code?: string; action?: { label: string; url: string }; footer: string }) {
  const text = [input.heading, "", ...input.lines, input.code ? `\n${input.code}\n` : "", input.action ? `${input.action.label}: ${input.action.url}` : "", "", input.footer].filter((line) => line !== "").join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f4ef;font-family:Arial,Helvetica,sans-serif;color:#1f2933">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(input.heading)}</h1>
${input.lines.map((line) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.5">${escapeHtml(line)}</p>`).join("\n")}
${input.code ? `<p style="margin:20px 0;font-size:30px;font-weight:bold;letter-spacing:6px">${escapeHtml(input.code)}</p>` : ""}
${input.action ? `<p style="margin:20px 0"><a href="${escapeHtml(input.action.url)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">${escapeHtml(input.action.label)}</a></p><p style="margin:0 0 12px;font-size:12px;color:#6b7280;word-break:break-all">${escapeHtml(input.action.url)}</p>` : ""}
<p style="margin:20px 0 0;font-size:12px;color:#6b7280">${escapeHtml(input.footer)}</p>
</div></body></html>`;
  return { text, html };
}
