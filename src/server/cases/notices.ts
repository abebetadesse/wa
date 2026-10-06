/**
 * Wording of the case updates people receive in the app and, when connected, on Telegram and
 * WhatsApp. Pure, so the privacy rule below can be tested without a database.
 *
 * Privacy: a chat app shows message previews on a phone other people may see. When the safety
 * screen raised a concern (for example violence at home), updates say only that there is news and
 * link to the case; the reviewer's words stay behind the sign-in.
 */
import type { CaseMessage, WorkflowCase } from "./types";

export interface Notice {
  type: string;
  title: string;
  body?: string;
  href: string;
}

export type OwnerNoticeType = "received" | "claimed" | "message" | "approved";

const MAX_BODY = 900;
const clip = (text: string) => (text.length > MAX_BODY ? `${text.slice(0, MAX_BODY - 1).trimEnd()}…` : text);

/** Updates for this case must not carry its content outside the app. */
export function isSensitive(record: Pick<WorkflowCase, "safety">): boolean {
  return record.safety.action !== "proceed";
}

export function ownerNotice(record: WorkflowCase, label: string, type: OwnerNoticeType, message?: CaseMessage): Notice {
  const href = `/case/workflows/${record.id}`;
  const discreet = isSensitive(record);
  if (type === "received") {
    return { type: "case.received", title: "We received your request", body: discreet ? "Open the app to follow its progress." : `Your ${label} request is with our review team. We will write to you here when there is news.`, href };
  }
  if (type === "claimed") {
    return { type: "case.claimed", title: "A reviewer has started on your request", body: discreet ? "Open the app to follow its progress." : `Your ${label} request is being reviewed now.`, href };
  }
  if (type === "message") {
    const question = message?.kind === "question";
    if (discreet || !message) return { type: "case.message", title: "You have a new message", body: "Open the app to read it and reply.", href };
    return {
      type: "case.message",
      title: question ? "Your reviewer has a question" : "Message from your reviewer",
      body: clip(question ? `${message.body}\n\nReply to this message to answer.` : message.body),
      href,
    };
  }
  const notes = record.review?.notes?.trim();
  return {
    type: "case.approved",
    title: "Your report is ready",
    body: discreet
      ? "Open the app to read it."
      : clip(notes ? `Your ${label} request has been reviewed.\n\nFrom your reviewer: ${notes}\n\nOpen your case to read the full report.` : `Your ${label} request has been reviewed. Open your case to read the response.`),
    href,
  };
}

export type ReviewerNoticeType = "submitted" | "reply";

export function reviewerNotice(record: WorkflowCase, label: string, type: ReviewerNoticeType): Notice {
  const href = record.businessId ? `/business/${record.businessId}/cases/${record.id}` : `/case-review/${record.id}`;
  if (type === "reply") {
    return { type: "case.reply", title: `Reply on a ${label} request`, body: "The person answered. Their reply has been added to the analysis.", href };
  }
  const priority = record.safety.priority === "routine" ? "" : ` (${record.safety.priority} priority)`;
  return { type: "case.submitted", title: `New ${label} request${priority}`, body: "A request was submitted. The analysis and a draft report are ready for review.", href };
}
