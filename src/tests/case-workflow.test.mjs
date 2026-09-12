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
  assert.deepEqual(listCases().map((item) => item.id), ["health", "peace", "power", "money", "career", "relationships", "spiritual", "legal", "social"]);

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
  saveAnswers(session.id, { detail: "I want a community health role" });
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

test("critical health signals gate Domain B recommendations", () => {
  const session = startSession("health");
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
