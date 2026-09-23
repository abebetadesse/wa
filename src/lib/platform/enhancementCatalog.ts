export type EnhancementAudience = "client" | "provider" | "both";

export interface EnhancementCapability {
  id: string;
  title: string;
  audience: EnhancementAudience;
  status: "available" | "connected" | "planned";
  value: string;
  evidence?: string[];
}

export interface TrustSnapshot {
  generatedAt: string;
  ai: {
    available: boolean;
    mode: "bionic_gpt" | "deterministic_fallback";
    responseModes: Array<"fast" | "detailed" | "provider_review">;
    contextWindowMessages: number;
  };
  safety: {
    triageBeforeAdvice: boolean;
    emergencyEscalation: boolean;
    scientificCulturalFirewall: boolean;
    medicationAndPregnancyChecks: boolean;
  };
  evidence: {
    sourceTypes: string[];
    freshnessLabel: string;
    explanationsAvailable: boolean;
  };
  privacy: {
    consentRequired: boolean;
    exportAvailable: boolean;
    deletionAvailable: boolean;
    sensitiveFieldsEncrypted: boolean;
  };
  provider: {
    verificationRequired: boolean;
    humanApprovalSupported: boolean;
    responseTimeTarget: string;
    bookingAndPaymentConnected: boolean;
  };
  capabilities: EnhancementCapability[];
}

const capabilities: EnhancementCapability[] = [
  { id: "personalized-onboarding", title: "Personalized onboarding assessment", audience: "both", status: "connected", value: "Profiles carry wellbeing, culture, location, language, goals, and preferences into intake." },
  { id: "explainable-ai", title: "Transparent AI explanations", audience: "both", status: "connected", value: "Recommendations can expose reasoning steps, safety gates, uncertainty, and source references." },
  { id: "provider-approval", title: "Provider-approved recommendations", audience: "both", status: "connected", value: "Case workflows support expert review before a report is released." },
  { id: "safety-triage", title: "Safety-first triage", audience: "both", status: "connected", value: "Urgency, crisis, medication, pregnancy, legal, and relationship safety gates run before downstream advice." },
  { id: "evidence-citations", title: "Evidence and source citations", audience: "both", status: "connected", value: "Knowledge strands, literature, EFCT, ETM-DB, and cultural sources remain identifiable." },
  { id: "domain-firewall", title: "Scientific and cultural separation", audience: "both", status: "connected", value: "Domain B reflection cannot change Scientific urgency or safety decisions." },
  { id: "provider-queues", title: "Provider case queues", audience: "provider", status: "connected", value: "Cases can be prioritized by urgency, specialty, language, payment, and workflow stage." },
  { id: "structured-summaries", title: "Structured case summaries", audience: "both", status: "connected", value: "Intake, risk, unanswered questions, causes, and next steps are organized for clients and experts." },
  { id: "multilingual", title: "Multilingual and Amharic-ready support", audience: "both", status: "connected", value: "Profile language and localized question/content fields are supported in workflow surfaces." },
  { id: "streaming", title: "Live AI response streaming", audience: "client", status: "connected", value: "Chat responses stream progressively with a deterministic fallback when the model is unavailable." },
  { id: "response-modes", title: "Fast, detailed, and provider-review modes", audience: "both", status: "connected", value: "The platform can route simple questions to fast guidance and complex cases to review." },
  { id: "action-plans", title: "Action plans and reminders", audience: "both", status: "connected", value: "Diagnostic solutions and workflow stages produce practical next steps and follow-up points." },
  { id: "longitudinal-record", title: "Secure longitudinal record", audience: "both", status: "connected", value: "Profile, diagnostic, case, activity, and report history can be carried forward securely." },
  { id: "privacy-controls", title: "Consent and privacy controls", audience: "client", status: "connected", value: "Sensitive wellbeing data is protected and admin export/audit surfaces are available." },
  { id: "provider-verification", title: "Provider verification", audience: "both", status: "connected", value: "Verified account and role controls are available through the RBAC foundation." },
  { id: "booking-payments", title: "Availability, booking, and payment workflow", audience: "both", status: "connected", value: "Expert availability, consultations, report purchase, and payment status are modeled in case flows." },
  { id: "outcome-feedback", title: "Outcome tracking and feedback", audience: "both", status: "connected", value: "Activity and case lifecycle events provide an extensible outcome trail." },
  { id: "provider-quality", title: "Provider quality dashboard", audience: "provider", status: "connected", value: "Admin analytics and audit telemetry establish the quality measurement foundation." },
  { id: "referral-escalation", title: "Referral and escalation network", audience: "both", status: "connected", value: "Emergency, crisis, legal, Scientific, and expert escalation routes are explicit in workflows." },
  { id: "reliability-indicators", title: "Visible trust and reliability indicators", audience: "both", status: "connected", value: "AI mode, safety status, source freshness, verification, and response targets are shown explicitly." },
];

export function getEnhancementCapabilities(audience?: EnhancementAudience): EnhancementCapability[] {
  return capabilities.filter((capability) => !audience || capability.audience === audience || capability.audience === "both");
}

export function createTrustSnapshot(options: { aiConfigured: boolean; sourceFreshness?: string } = { aiConfigured: false }): TrustSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    ai: {
      available: options.aiConfigured,
      mode: options.aiConfigured ? "bionic_gpt" : "deterministic_fallback",
      responseModes: ["fast", "detailed", "provider_review"],
      contextWindowMessages: 12,
    },
    safety: {
      triageBeforeAdvice: true,
      emergencyEscalation: true,
      scientificCulturalFirewall: true,
      medicationAndPregnancyChecks: true,
    },
    evidence: {
      sourceTypes: ["Scientific guidance", "EFCT", "ETM-DB", "Literature", "Cultural reflection"],
      freshnessLabel: options.sourceFreshness || "Source status is shown with each knowledge result.",
      explanationsAvailable: true,
    },
    privacy: {
      consentRequired: true,
      exportAvailable: true,
      deletionAvailable: true,
      sensitiveFieldsEncrypted: true,
    },
    provider: {
      verificationRequired: true,
      humanApprovalSupported: true,
      responseTimeTarget: "Provider response target is shown before booking.",
      bookingAndPaymentConnected: true,
    },
    capabilities: getEnhancementCapabilities(),
  };
}
