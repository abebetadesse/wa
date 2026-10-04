import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluateCareerSafetyScreen } from "../lib/case-workflow/careerSafetyScreen.ts";
import { buildCareerProfile, getCareerQuestions } from "../lib/case-workflow/careerQuestionEngine.ts";
import { assignCareerAdvisor, releaseCareerAdvisor } from "../lib/case-workflow/careerExpertEngine.ts";
import { CASE_STRAND_FILTERS } from "../lib/case-workflow/strandRouting.ts";
import {
  buildReflectiveDiagnosticSolution,
  retrieveReflectiveCaseFindings,
} from "../lib/case-workflow/reflectiveCaseAnalysis.ts";
import {
  analyzeCareerCase,
  bookCareerConsult,
  evaluateAndStartCareerCase,
  purchaseCareerReport,
  startCareerCase,
} from "../lib/case-workflow/careerWorkflow.ts";

test("case 3 safety screen routes self-harm triggers immediately", () => {
  const result = evaluateCareerSafetyScreen({
    basic_needs: "yes_comfortable",
    self_harm: "occasionally",
    financial_pressure: "no",
  });

  assert.equal(result.action, "crisis_route");
  assert.ok(result.crisisContent?.hotlines.length > 0);
});

test("case 3 workflow builds the end-to-end career flow", () => {
  const session = evaluateAndStartCareerCase({
    safetyAnswers: {
      basic_needs: "yes_comfortable",
      self_harm: "no",
      financial_pressure: "yes",
    },
    answers: {
      career_geez_name: "ሰሎሞን",
      career_mother_geez_name: "አለም",
      career_stage: "transitioning",
      career_sector: "technology",
      career_business_type: "sole_trader",
      career_top_goal: "Find a stable role in data work",
      neg_type: "salary",
      trans_bridge: "yes_tight",
    },
  });

  assert.equal(session.stage, "foundation");
  assert.ok(session.questions.some((question) => question.id === "career_stage"));

  const updated = analyzeCareerCase(session.id, session.userId);
  assert.ok(updated?.timingAnalysis?.numerology);
  assert.ok(updated?.expertAssignment || updated?.stage === "visible_to_user");

  const purchased = purchaseCareerReport(session.id, session.userId);
  assert.equal(purchased?.paymentConfirmed, true);
  assert.equal(purchased?.stage, "full_report_released");

  const booked = bookCareerConsult(session.id, "video", session.userId);
  assert.equal(booked?.consultation?.booked, true);
  assert.equal(booked?.stage, "consultation_booked");
});

test("case 3 profile builder and question generator are consistent", () => {
  const profile = buildCareerProfile({
    career_geez_name: "ማርያም",
    career_mother_geez_name: "ተስፋ",
    career_stage: "starting_business",
    career_sector: "agriculture",
    career_business_type: "cooperative",
    career_top_goal: "Expand a local cooperative",
  });

  assert.equal(profile.careerStage, "starting_business");
  assert.equal(profile.sector, "agriculture");
  assert.ok(getCareerQuestions("starting_business").length > 0);
});

test("career advisor matching is idempotent per case and preview matching does not reserve capacity", () => {
  const profile = buildCareerProfile({
    career_geez_name: "ማርያም",
    career_mother_geez_name: "ተስፋ",
    career_stage: "starting_business",
    career_sector: "agriculture",
  });
  const preview = assignCareerAdvisor(profile, { reserve: false });
  assert.ok(preview);
  const priorLoad = preview.advisor.current_review_load;
  const first = assignCareerAdvisor(profile, { assignmentKey: "case-advisor-test" });
  assert.ok(first);
  assert.equal(first.advisor.current_review_load, priorLoad + 1);
  const repeated = assignCareerAdvisor(profile, { assignmentKey: "case-advisor-test" });
  assert.equal(repeated?.advisor.id, first.advisor.id);
  assert.equal(first.advisor.current_review_load, priorLoad + 1);
  assert.equal(releaseCareerAdvisor("case-advisor-test"), true);
  assert.equal(first.advisor.current_review_load, priorLoad);
  assert.equal(releaseCareerAdvisor("case-advisor-test"), false);
});

test("money and career reflections query only cultural and astrological strands", async () => {
  assert.deepEqual(CASE_STRAND_FILTERS.money, ["cultural", "astrological"]);
  assert.deepEqual(CASE_STRAND_FILTERS.career, ["cultural", "astrological"]);

  for (const domain of ["money", "career"]) {
    const findings = await retrieveReflectiveCaseFindings(domain, "I want to reflect on my future.");
    assert.ok(findings.length > 0, `${domain} returns cultural reflection`);
    assert.ok(findings.every((finding) => ["cultural", "astrological"].includes(finding.strand)));
    assert.doesNotMatch(JSON.stringify(findings), /medical|clinical|diagnos|treatment|investment|capital allocation|contract signing|risk mitigation/i);
    assert.ok(findings.every((finding) => !("recommendations" in finding)));
    assert.ok(findings.every((finding) => domain === "money"
      ? /\b(iqub|equb)\b/i.test(finding.title)
      : /vocation|awude negest/i.test(finding.title)));
    const solution = buildReflectiveDiagnosticSolution({
      originalQuery: "I want to reflect on my future.",
      mode: "text",
      language: "en",
      domain,
      findings,
      urgency: { level: "low", score: 0, matchedSignals: ["safety-check"] },
      intent: "case_reflection",
    });
    assert.deepEqual(solution.causes, []);
    assert.deepEqual(solution.solutions, []);
    assert.ok(solution.rawFindings.cultural.length + solution.rawFindings.astrological.length > 0);
    assert.ok(Object.entries(solution.rawFindings)
      .filter(([strand]) => !["cultural", "astrological"].includes(strand))
      .every(([, results]) => results.length === 0));
    assert.ok(solution.safety.warnings.length > 0, "the separate safety signal is retained");
  }
});
