/**
 * Wording of the case updates people receive in the app and, when connected, on Telegram and
 * WhatsApp. Pure, so the privacy rule below can be tested without a database.
 *
 * Privacy: a chat app shows message previews on a phone other people may see. When the safety
 * screen raised a concern (for example violence at home), updates say only that there is news and
 * link to the case; the reviewer's words stay behind the sign-in.
 */
import { englishText, type Translate } from "@/server/i18n/serverText";
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

/** Paragraphs are translated one by one, so line breaks survive translation. */
const paragraphs = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join("\n\n");

export function ownerNotice(record: WorkflowCase, label: string, type: OwnerNoticeType, message?: CaseMessage, tr: Translate = englishText): Notice {
  const href = `/case/workflows/${record.id}`;
  const discreet = isSensitive(record);
  if (type === "received") {
    return { type: "case.received", title: tr("We received your request"), body: discreet ? tr("Open the app to follow its progress.") : tr("Your {} request is with our review team. We will write to you here when there is news.", label), href };
  }
  if (type === "claimed") {
    return { type: "case.claimed", title: tr("A reviewer has started on your request"), body: discreet ? tr("Open the app to follow its progress.") : tr("Your {} request is being reviewed now.", label), href };
  }
  if (type === "message") {
    const question = message?.kind === "question";
    if (discreet || !message) return { type: "case.message", title: tr("You have a new message"), body: tr("Open the app to read it and reply."), href };
    // The reviewer's own words are passed on as written.
    return {
      type: "case.message",
      title: question ? tr("Your reviewer has a question") : tr("Message from your reviewer"),
      body: clip(question ? paragraphs(message.body, tr("Reply to this message to answer.")) : message.body),
      href,
    };
  }
  const notes = record.review?.notes?.trim();
  return {
    type: "case.approved",
    title: tr("Your report is ready"),
    body: discreet
      ? tr("Open the app to read it.")
      : clip(
          notes
            ? paragraphs(tr("Your {} request has been reviewed.", label), tr("From your reviewer: {}", notes), tr("Open your case to read the full report."))
            : tr("Your {} request has been reviewed. Open your case to read the response.", label),
        ),
    href,
  };
}

export type ReviewerNoticeType = "submitted" | "reply" | "food_herb";

export function reviewerNotice(record: WorkflowCase, label: string, type: ReviewerNoticeType, tr: Translate = englishText): Notice {
  const href = record.businessId ? `/business/${record.businessId}/cases/${record.id}` : `/case-review/${record.id}`;
  if (type === "food_herb") {
    return { type: "case.reply", title: tr("Foods or plants added to a {} request", label), body: tr("The person confirmed foods or plants. They have been added to the analysis."), href };
  }
  if (type === "reply") {
    return { type: "case.reply", title: tr("Reply on a {} request", label), body: tr("The person answered. Their reply has been added to the analysis."), href };
  }
  const title = record.safety.priority === "routine" ? tr("New {} request", label) : tr("New {} request ({} priority)", label, tr(record.safety.priority));
  return { type: "case.submitted", title, body: tr("A request was submitted. The analysis and a draft report are ready for review."), href };
}
