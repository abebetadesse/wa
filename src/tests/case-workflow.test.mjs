import { test } from "node:test";
import assert from "node:assert/strict";
import {
  confirmReport,
  decideSolutions,
  getCase,
  listCases,
  processSession,
  refineCauses,
  saveAnswers,
  startSession,
} from "../lib/case-workflow/engine.ts";

test("guided workflow supports the expanded case taxonomy and interest refinement", () => {
  assert.deepEqual(listCases().map((item) => item.id), ["wellbeing", "peace", "power", "money", "career", "relationships", "spiritual", "legal", "social"]);

  const session = startSession("career");
  saveAnswers(session.id, { challenge: "Finding work" });
  saveAnswers(session.id, {
    detail: "I want a role in public health",
    stage: "Exploring",
    selectedInterest: "skill building",
    reflectionLens: "Yes",
  });

  const report = processSession(session.id);
  assert.equal(report?.currentStep, "reportReview");
  assert.equal(report?.causes.some((cause) => cause.category === "preference"), true);
  assert.equal(report?.answers.selectedInterest, "skill building");
  assert.ok(report?.workflowContext?.domainA.includes("psychological") || report?.workflowContext?.domainA.length === 0);
  assert.ok(report?.workflowContext?.domainB.includes("astrological"));
  assert.equal(report?.workflowContext?.safety.domainBAllowed, true);

  const revised = confirmReport(session.id, false);
  assert.equal(revised?.currentStep, "specialized");
  saveAnswers(session.id, { detail: "I want a community wellbeing role" });
  assert.equal(processSession(session.id)?.currentStep, "reportReview");

  const confirmed = confirmReport(session.id, true);
  assert.equal(confirmed?.currentStep, "causeRefinement");
  const refined = refineCauses(session.id, confirmed?.causes.map((cause) => cause.id) || []);
  assert.equal(refined?.currentStep, "solution");
  assert.equal(refined?.solutions.every((solution) => solution.interestMatch === "skill building" || solution.title === "Holistic reflection and support"), true);

  const completed = decideSolutions(session.id, refined?.solutions.map((solution) => solution.id) || []);
  assert.equal(completed?.currentStep, "solutionReview");
  assert.equal(getCase("social")?.name, "Social");
  assert.equal(getCase("relationships")?.name, "Relationships & Family");
  assert.equal(getCase("legal")?.name, "Legal & Dispute");
  assert.equal(getCase("spiritual")?.name, "Spiritual & Life Direction");
});

test("case synthesis incorporates full identity, birth data, and geographic context", () => {
  const session = startSession("wellbeing");
  saveAnswers(session.id, {
    challenge: "Symptoms or a new concern",
    fullName: "Selam Bekele",
    motherName: "Mariam",
    birthDate: "1992-02-14",
    birthTime: "08:30",
    birthPlace: "Addis Ababa",
    altitudeMeters: 2400,
    longitude: 38.74,
    latitude: 9.03,
    selectedInterest: "nutrition and recovery",
    reflectionLens: "Yes, include Domain B reflection",
    detail: "I feel exhausted and tense, especially during rainy periods.",
  });

  const report = processSession(session.id);
  assert.ok(report?.profileSynthesis);
  assert.equal(report.profileSynthesis.identity.name, "Selam Bekele");
  assert.equal(report.profileSynthesis.identity.motherName, "Mariam");
  assert.equal(report.profileSynthesis.geography.city, "Addis Ababa");
  assert.equal(report.profileSynthesis.geography.altitudeMeters, 2400);
  assert.ok(report.profileSynthesis.chart.some((point) => point.key === "vitality"));
  assert.ok(report.profileSynthesis.summary.toLowerCase().includes("selam") || report.profileSynthesis.summary.length > 0);
});

test("case synthesis does not invent birth data when personal details are missing", () => {
  const session = startSession("wellbeing");
  saveAnswers(session.id, {
    challenge: "Symptoms or a new concern",
    location: "Hawassa",
    region: "Sidama",
    detail: "I have been feeling tired for a few days.",
  });

  const report = processSession(session.id);
  assert.equal(report?.profileSynthesis, undefined);
  assert.equal(report?.causes.some((cause) => cause.description.includes("AFERE")), false);
  assert.equal(report?.causes.some((cause) => cause.description.includes("INCOME INEQUALITY")), false);
  assert.ok(report?.causes.some((cause) => cause.description.includes("feeling tired")));
});

test("case synthesis requires explicit reflection and a real client name", () => {
  const session = startSession("wellbeing");
  saveAnswers(session.id, {
    challenge: "Symptoms or a new concern",
    fullName: "Case Client",
    birthDate: "1990-01-15",
    birthTime: "12:00",
    birthPlace: "Addis Ababa",
    reflectionLens: "Yes",
  });

  assert.equal(processSession(session.id)?.profileSynthesis, undefined);
});

test("refining findings preserves the intake-specific diagnostic recommendations", () => {
  const session = startSession("wellbeing");
  saveAnswers(session.id, {
    challenge: "Symptoms or a new concern",
    detail: "Headaches become worse after long periods without water.",
    selectedInterest: "symptom understanding",
    diagnosticAssessment: {
      causes: [
        { name: "Possible dehydration pattern", probability: 62, evidence: "User reported thirst-linked symptoms.", domain: "biochemical" },
        { name: "Possible sleep contribution", probability: 31, evidence: "Sleep schedule needs clarification.", domain: "psychological" },
      ],
      solutions: [
        { id: "hydration-review", title: "Review hydration and headache timing", description: "Track fluid intake alongside symptoms.", priority: "medium", sourceRef: "User symptom history" },
      ],
    },
  });

  const report = processSession(session.id);
  const chosenCause = report?.causes[0];
  assert.ok(chosenCause);
  const refined = refineCauses(session.id, [chosenCause.id]);
  assert.equal(refined?.solutions.length, 1);
  assert.equal(refined?.solutions[0].title, "Review hydration and headache timing");
  assert.deepEqual(refined?.solutions[0].basedOnCauses, [chosenCause.id]);
  assert.equal(refined?.solutions[0].knowledgeReferences.includes("User symptom history"), true);
});

test("report processing keeps cultural astrology separate from case findings", () => {
  const session = startSession("wellbeing");
  saveAnswers(session.id, {
    challenge: "Symptoms or a new concern",
    detail: "I have been tired for several days.",
    selectedInterest: "symptom understanding",
    diagnosticAssessment: {
      causes: [
        { name: "AFERE (Earth / melancholic)", probability: 88, evidence: "Generic constitutional profile", domain: "astrological" },
        { name: "Däbtära healing scroll & celestial botanical inscription", probability: 82, evidence: "Generic tradition text", domain: "astrological" },
        { name: "Possible sleep contribution", probability: 54, evidence: "Sleep schedule needs clarification.", domain: "psychological" },
      ],
      solutions: [],
    },
  });

  const report = processSession(session.id);
  assert.deepEqual(report?.causes.map((cause) => cause.description), ["Possible sleep contribution"]);
});

test("critical wellbeing signals gate Domain B recommendations", () => {
  const session = startSession("wellbeing");
  saveAnswers(session.id, { challenge: "Symptoms or a new concern" });
  saveAnswers(session.id, {
    detail: "I have chest pain and cannot breathe",
    age: 40,
    region: "Addis Ababa",
    selectedInterest: "symptom understanding",
    reflectionLens: "Yes, include Domain B reflection",
  });

  const report = processSession(session.id);
  assert.equal(report?.workflowContext?.safety.level, "critical");
  assert.equal(report?.workflowContext?.domainB.length, 0);
  assert.equal(report?.causes[0]?.category, "safety");
});

test("relationship case 2 workflow supports safety-first intake and expert review", async () => {
  const { evaluateRelationshipSafetyScreen } = await import("../lib/case-workflow/relationshipSafetyScreen.ts");
  const { getRelationshipQuestions, hasRelationshipSafetyTrigger } = await import("../lib/case-workflow/relationshipQuestionEngine.ts");
  const { startRelationshipCase, submitRelationshipCase, purchaseRelationshipReport, bookRelationshipConsult } = await import("../lib/case-workflow/relationshipExpertEngine.ts");

  const safety = evaluateRelationshipSafetyScreen({
    feelsSafe: "unsafe",
    domesticViolence: "possible",
    childSafety: "no_children",
    immediateRisk: "no",
  });
  assert.equal(safety.action, "crisis_route");

  const questions = getRelationshipQuestions("intake");
  assert.ok(questions.some((question) => question.id === "relationship_status"));
  assert.equal(hasRelationshipSafetyTrigger({ relationship_issue: "I am afraid of being hurt" }), true);

  const session = startRelationshipCase({
    userName: "Selam",
    partnerName: "Abel",
    answers: { relationship_status: "dating", relationship_issue: "Communication is breaking down" },
    safetyResult: safety,
  });

  const submitted = submitRelationshipCase(session.id, { desired_outcome: "communication" });
  assert.equal(submitted?.status, "crisis_routed");
  assert.equal(submitted?.assignedExpert, undefined);
  assert.equal(submitted?.report, undefined);
  const purchased = purchaseRelationshipReport(session.id);
  const consulted = bookRelationshipConsult(session.id, "video");
  assert.equal(purchased?.status, "crisis_routed");
  assert.equal(purchased?.paymentConfirmed, false);
  assert.equal(consulted?.status, "crisis_routed");
  assert.equal(consulted?.consultation, undefined);
});

test("crisis-routed social and legal cases cannot enter routine paid review", async () => {
  const { startSocialCase, submitSocialCase, purchaseSocialReport, bookSocialConsult } = await import("../lib/case-workflow/socialExpertEngine.ts");
  const social = startSocialCase({ safetyResult: { action: "crisis_route" } });
  assert.equal(submitSocialCase(social.id, { belonging_need: "community" })?.status, "crisis_routed");
  assert.equal(social.assignedExpert, undefined);
  assert.equal(social.report, undefined);
  assert.equal(purchaseSocialReport(social.id)?.paymentConfirmed, false);
  assert.equal(bookSocialConsult(social.id, "chat")?.consultation, undefined);
  assert.equal(social.status, "crisis_routed");

  const { startLegalCase, submitLegalCase, purchaseLegalReport, bookLegalConsult } = await import("../lib/case-workflow/legalExpertEngine.ts");
  const legal = startLegalCase({ safetyResult: { action: "crisis_route" } });
  assert.equal(submitLegalCase(legal.id, { issue_type: "dispute" })?.status, "crisis_routed");
  assert.equal(legal.assignedExpert, undefined);
  assert.equal(legal.report, undefined);
  assert.equal(purchaseLegalReport(legal.id)?.paymentConfirmed, false);
  assert.equal(bookLegalConsult(legal.id, "chat")?.consultation, undefined);
  assert.equal(legal.status, "crisis_routed");
});
