import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateLegalSafetyScreen } from "../lib/case-workflow/legalSafetyScreen.ts";

const safeAnswers = {
  immediateHarm: "no",
  criminalMatter: "no",
  evictionRisk: "no",
  childWelfare: "no_children",
};

describe("Legal case safety pre-screen", () => {
  test("routes immediate physical danger to crisis support", () => {
    const result = evaluateLegalSafetyScreen({ ...safeAnswers, immediateHarm: "physical_danger" });
    assert.equal(result.action, "crisis_route");
    assert.ok(result.crisisContent?.hotlines.some((contact) => contact.number === "911"));
  });

  test("routes criminal matters to legal aid", () => {
    const result = evaluateLegalSafetyScreen({ ...safeAnswers, criminalMatter: "yes" });
    assert.equal(result.action, "legal_aid_route");
    assert.ok(result.legalAidContent?.hotlines.some((contact) => contact.name.includes("Bar Association")));
  });

  test("routes child welfare concerns to crisis support", () => {
    const result = evaluateLegalSafetyScreen({ ...safeAnswers, childWelfare: "concerned" });
    assert.equal(result.action, "crisis_route");
    assert.ok(result.crisisContent?.hotlines.some((contact) => contact.name.includes("Child Protection")));
  });

  test("flags eviction deadlines for urgent expert review", () => {
    const result = evaluateLegalSafetyScreen({ ...safeAnswers, evictionRisk: "within_7" });
    assert.equal(result.action, "proceed_with_concern");
    assert.equal(result.expertFlag?.priority, "urgent");
  });

  test("prioritizes immediate danger over criminal routing", () => {
    const result = evaluateLegalSafetyScreen({
      ...safeAnswers,
      immediateHarm: "threats",
      criminalMatter: "yes",
    });
    assert.equal(result.action, "crisis_route");
  });

  test("flags incomplete screening for expert review", () => {
    const result = evaluateLegalSafetyScreen({ ...safeAnswers, criminalMatter: "unsure" });
    assert.equal(result.action, "proceed_with_concern");
    assert.equal(result.expertFlag?.priority, "high");
  });
});
