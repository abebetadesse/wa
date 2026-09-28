import { PUBLISHING_FLOORS } from "@/lib/db/schema/users";
import type { BioNarrativeReport } from "./types";

export function canAutoPublishBioNarrative(
  report: Pick<BioNarrativeReport, "containsHealthContent" | "requiresHumanReview" | "hasCulturalContent">,
  allowAutoPublish: boolean,
): { allowed: boolean; reason?: string } {
  if (report.containsHealthContent && PUBLISHING_FLOORS.healthContentRequiresReview) {
    return { allowed: false, reason: "Health-adjacent content requires human review." };
  }
  if (!allowAutoPublish) {
    return { allowed: false, reason: "Auto-publish is disabled for bio-narratives." };
  }
  if (report.requiresHumanReview) {
    return { allowed: false, reason: "The report is marked for human review." };
  }
  if (!report.hasCulturalContent) {
    return { allowed: false, reason: "The report contains no consented cultural content." };
  }
  return { allowed: true };
}