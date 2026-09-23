export type HiddenDebralFindings = Record<string, unknown>;

export type CulturalFinding = {
  title: string;
  traditionalLanguage: string;
  practice: string;
  safetyNotice: string;
  source: "reflective_dictionary" | "expert_review";
};

export type CulturalReportPayload = {
  status: "preliminary" | "endorsed";
  summary: string;
  findings: CulturalFinding[];
  hexacore: {
    core: string;
    state: string;
    reflection: string;
  };
  landmark: {
    name: string;
    symbolism: string;
  };
  safetyCard: {
    herbWarnings: string[];
    contraindications: string[];
    stopIfExperiencing: string[];
    emergencyContact: string;
  };
  referralNotice?: {
    required: boolean;
    reason: string;
    urgency: "none" | "routine" | "urgent";
    recommendedAction: string;
  };
  safetyNotice: string;
};

export type UserCasePayload = {
  id: string;
  status: string;
  caseType: string;
  culturalReport: CulturalReportPayload | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

/**
 * Explicit allow-list serializer for user-facing responses.
 *
 * Do not spread database rows into a user response. In particular, this
 * function intentionally has no access to scientific analysis fields.
 */
export function toUserCasePayload(input: {
  id: string;
  status: string;
  caseType: string;
  culturalReport?: CulturalReportPayload | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): UserCasePayload {
  return {
    id: input.id,
    status: input.status,
    caseType: input.caseType,
    culturalReport: input.culturalReport ?? null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}
