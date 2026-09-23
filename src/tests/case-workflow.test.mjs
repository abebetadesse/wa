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
  assert.equal(report?.causes.some((cause) => cause.category === "cultural"), true);
  assert.equal(report?.answers.selectedInterest, "skill building");
  assert.ok(report?.workflowContext?.domainA.includes("psychological"));
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
  assert.equal(submitted?.status, "pending_expert_review");
  assert.ok(submitted?.compatibility?.score >= 20);

  const purchased = purchaseRelationshipReport(session.id);
  const consulted = bookRelationshipConsult(session.id, "video");
  assert.equal(purchased?.paymentConfirmed, true);
  assert.equal(consulted?.consultation?.booked, true);
});
