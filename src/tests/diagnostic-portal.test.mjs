import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { IntentClassifier } from "../lib/knowledge/parsing/intentClassifier.ts";
import { EntityExtractor } from "../lib/knowledge/parsing/entityExtractor.ts";
import { UrgencyDetector } from "../lib/knowledge/parsing/urgencyDetector.ts";
import { BiochemicalKnowledgeStrand } from "../lib/knowledge/strands/biochemicalStrand.ts";
import { BiologicalKnowledgeStrand } from "../lib/knowledge/strands/biologicalStrand.ts";
import { MedicationKnowledgeStrand } from "../lib/knowledge/strands/medicationStrand.ts";
import { AddictionKnowledgeStrand } from "../lib/knowledge/strands/addictionStrand.ts";
import { EcologicalKnowledgeStrand } from "../lib/knowledge/strands/ecologicalStrand.ts";
import { EpidemiologicalKnowledgeStrand } from "../lib/knowledge/strands/epidemiologicalStrand.ts";
import { PsychologicalKnowledgeStrand } from "../lib/knowledge/strands/psychologicalStrand.ts";
import { SocioEconomicKnowledgeStrand } from "../lib/knowledge/strands/socioeconomicStrand.ts";
import { DietaryKnowledgeStrand } from "../lib/knowledge/strands/dietaryStrand.ts";
import { CulturalKnowledgeStrand } from "../lib/knowledge/strands/culturalStrand.ts";
import { AstrologicalKnowledgeStrand } from "../lib/knowledge/strands/astrologicalStrand.ts";
import { CrossStrandIntegrationEngine } from "../lib/knowledge/crossStrandIntegration.ts";
import { CausalInferenceEngine } from "../lib/knowledge/ai/causalInference.ts";
import { AIReasoningEngine } from "../lib/knowledge/ai/reasoningEngine.ts";
import { KnowledgeRetrievalOrchestrator } from "../lib/knowledge/orchestrator.ts";
import { KNOWLEDGE_STRANDS } from "../lib/knowledge/catalog.ts";
import { listCases } from "../lib/case-workflow/engine.ts";
import { getWorkflowStrands } from "../lib/case-workflow/integration.ts";

describe("Multi-Strand Knowledge Retrieval & Diagnostic Portal System", () => {
  const intentClassifier = new IntentClassifier();
  const entityExtractor = new EntityExtractor();
  const urgencyDetector = new UrgencyDetector();
  const crossIntegration = new CrossStrandIntegrationEngine();
  const causalEngine = new CausalInferenceEngine();
  const reasoningEngine = new AIReasoningEngine();
  const orchestrator = new KnowledgeRetrievalOrchestrator();

  test("1. IntentClassifier detects multilingual intents accurately", () => {
    // English Emergency
    const r1 = intentClassifier.classify("I have severe crushing chest pain and cannot breathe");
    assert.equal(r1.intent, "emergency");
    assert.equal(r1.detectedLanguage, "en");

    // Amharic Diagnostic
    const r2 = intentClassifier.classify("ከባድ ራስ ምታት እና ትኩሳት ለ3 ቀን ቆየኝ");
    assert.equal(r2.intent, "diagnostic");
    assert.equal(r2.detectedLanguage, "am");

    // Amharic Herbal
    const r3 = intentClassifier.classify("ተና አዳም እና ኮሶ ለሆድ ህመም እንዴት ይወሰዳል?");
    assert.equal(r3.intent, "herbal");
    assert.equal(r3.detectedLanguage, "am");

    // Afaan Oromo Diagnostic
    const r4 = intentClassifier.classify("Mataan na dhukkuba fi hoo'ina qaamaa qaba");
    assert.equal(r4.intent, "diagnostic");
    assert.equal(r4.detectedLanguage, "om");

    // English Astrological
    const r5 = intentClassifier.classify("What is my wellbeing constitution according to Awde Negest star element?");
    assert.equal(r5.intent, "astrological");
  });

  test("case filters link to registered strands and workflow routing", () => {
    const registered = new Set(KNOWLEDGE_STRANDS);
    const wellbeingCase = listCases().find((item) => item.id === "wellbeing");
    assert.ok(wellbeingCase);
    assert.deepEqual(new Set(wellbeingCase.knowledgeStrandFilters), registered);

    for (const caseDefinition of listCases()) {
      assert.ok(
        caseDefinition.knowledgeStrandFilters.every((strand) => registered.has(strand)),
        `${caseDefinition.id} contains an unregistered knowledge strand`,
      );
      const workflow = getWorkflowStrands(caseDefinition.id, true);
      assert.deepEqual(new Set(workflow.queried), new Set(caseDefinition.knowledgeStrandFilters));
      assert.ok(workflow.domainA.every((strand) => !workflow.domainB.includes(strand)));
    }
  });

  test("2. EntityExtractor extracts symptoms, durations, medications, and substances", () => {
    const text = "I have severe headache and stomach pain for 4 days after taking aspirin and chewing khat";
    const entities = entityExtractor.extract(text);

    const symptoms = entities.filter((e) => e.category === "symptom").map((e) => e.value);
    assert.ok(symptoms.includes("headache"), "Expected headache symptom");
    assert.ok(symptoms.includes("stomach_pain"), "Expected stomach_pain symptom");

    const duration = entities.find((e) => e.category === "duration");
    assert.ok(duration, "Expected duration entity");
    assert.match(duration.value, /4 days/i);

    const med = entities.find((e) => e.category === "medication");
    assert.ok(med, "Expected medication entity");
    assert.equal(med.value, "aspirin");

    const sub = entities.find((e) => e.category === "substance");
    assert.ok(sub, "Expected substance entity");
    assert.equal(sub.value, "khat");
  });

  test("3. UrgencyDetector assigns correct scores and emergency tiers", () => {
    // Critical: difficulty breathing
    const entitiesCrit = entityExtractor.extract("Cannot breathe, gasping for air");
    const uCrit = urgencyDetector.detect("Cannot breathe, gasping for air", entitiesCrit);
    assert.equal(uCrit.level, "critical");
    assert.equal(uCrit.score, 100);
    assert.match(uCrit.action, /907 \/ 991/);

    // High: severe jaundice with dark urine
    const entitiesHigh = entityExtractor.extract("Severe yellow eyes and high fever");
    const uHigh = urgencyDetector.detect("Severe yellow eyes and high fever", entitiesHigh);
    assert.equal(uHigh.level, "high");
    assert.equal(uHigh.score, 80);

    // Medium: persistent for weeks
    const entitiesMed = entityExtractor.extract("Mild cough for 3 weeks");
    const uMed = urgencyDetector.detect("Mild cough for 3 weeks", entitiesMed);
    assert.equal(uMed.level, "medium");
    assert.equal(uMed.score, 50);

    // Low: general dietary query
    const entitiesLow = entityExtractor.extract("How to bake teff injera");
    const uLow = urgencyDetector.detect("How to bake teff injera", entitiesLow);
    assert.equal(uLow.level, "low");
    assert.equal(uLow.score, 20);
  });

  test("4. All 11 Knowledge Strands return structured findings", async () => {
    const mockProfile = {
      location: { region: "Addis Ababa", altitude: 2400 },
      medications: ["warfarin"],
      herbUsage: ["tena adam"],
    };

    const bioStrand = new BiochemicalKnowledgeStrand();
    const bioFindings = await bioStrand.query("iron anemia fatigue", mockProfile);
    assert.ok(bioFindings.length > 0, "Biochemical strand should return findings");
    assert.equal(bioFindings[0].strand, "biochemical");

    const bioPhysStrand = new BiologicalKnowledgeStrand();
    const bioPhysFindings = await bioPhysStrand.query("gut digestion microbiome", mockProfile);
    assert.ok(bioPhysFindings.length > 0, "Biological strand should return findings");

    const medStrand = new MedicationKnowledgeStrand();
    const medFindings = await medStrand.query("warfarin tena adam bleeding", mockProfile);
    assert.ok(medFindings.length > 0, "Medication strand should return findings");
    const conflict = medFindings.find((f) => f.type === "herb_drug_interaction_critical");
    assert.ok(conflict, "Expected critical herb-drug interaction for Tena Adam + Warfarin");

    const addStrand = new AddictionKnowledgeStrand();
    const addFindings = await addStrand.query("khat chewing insomnia crash", mockProfile);
    assert.ok(addFindings.length > 0, "Addiction strand should return findings");

    const ecoStrand = new EcologicalKnowledgeStrand();
    const ecoFindings = await ecoStrand.query("lowland malaria climate", mockProfile);
    assert.ok(ecoFindings.length > 0, "Ecological strand should return findings");

    const epiStrand = new EpidemiologicalKnowledgeStrand();
    const epiFindings = await epiStrand.query("fever malaria parasite", mockProfile);
    assert.ok(epiFindings.length > 0, "Epidemiological strand should return findings");

    const psychStrand = new PsychologicalKnowledgeStrand();
    const psychFindings = await psychStrand.query("thinking too much haseb mabzat depression", mockProfile);
    assert.ok(psychFindings.length > 0, "Psychological strand should return findings");

    const socioStrand = new SocioEconomicKnowledgeStrand();
    const socioFindings = await socioStrand.query("rural wellbeing Debr Debr hospital", mockProfile);
    assert.ok(socioFindings.length > 0, "Socioeconomic strand should return findings");

    const dietStrand = new DietaryKnowledgeStrand();
    const dietFindings = await dietStrand.query("teff injera fermentation fasting", mockProfile);
    assert.ok(dietFindings.length > 0, "Dietary strand should return findings");

    const cultStrand = new CulturalKnowledgeStrand();
    const cultFindings = await cultStrand.query("traditional coffee buna healing", mockProfile);
    assert.ok(cultFindings.length > 0, "Cultural strand should return findings");
    assert.ok(cultFindings[0].details?.isDomainB, "Cultural strand must be Domain B");

    const astroStrand = new AstrologicalKnowledgeStrand();
    const astroFindings = await astroStrand.query("awde negest star humor element", mockProfile);
    assert.ok(astroFindings.length > 0, "Astrological strand should return findings");
    assert.ok(astroFindings[0].details?.isDomainB, "Astrological strand must be Domain B");
  });

  test("5. CrossStrandIntegrationEngine detects multi-strand intersections", async () => {
    const mockProfile = {
      location: { region: "Afar Lowlands", altitude: 600 },
      medications: ["warfarin"],
      herbUsage: ["tena adam"],
    };

    const query = "lowland fever and taking warfarin with tena adam";
    const strandResults = {};
    for (const [name, strand] of Object.entries(orchestrator.strands)) {
      strandResults[name] = await strand.query(query, mockProfile);
    }

    const intersections = crossIntegration.findIntersections(strandResults, mockProfile);
    assert.ok(intersections.length > 0, "Expected at least 1 cross-strand intersection");

    const hasBioMed = intersections.some((i) => i.type === "biochemical_medication");
    assert.ok(hasBioMed, "Expected biochemical_medication intersection");

    const hasEcoEpi = intersections.some((i) => i.type === "ecological_epidemiological");
    assert.ok(hasEcoEpi, "Expected ecological_epidemiological intersection");
  });

  test("6. CausalInferenceEngine generates valid causal pathways", () => {
    const mockProfile = { location: { region: "Addis Ababa", altitude: 2400 } };
    const pathways = causalEngine.buildCausalPathways("malaria fever chills", [], mockProfile);

    assert.ok(pathways.length > 0, "Expected at least one causal pathway");
    assert.equal(pathways[0].id, "pathway-febrile-malaria");
    assert.ok(pathways[0].nodes.length >= 4, "Expected >= 4 nodes in pathway");
    assert.ok(pathways[0].edges.length >= 3, "Expected >= 3 edges in pathway");
    assert.ok(pathways[0].integratedSolution.length > 0, "Expected integrated solution in pathway");
  });

  test("7. AIReasoningEngine produces 7-step COT and 5-stage action plan with Domain B isolation", async () => {
    const mockProfile = {
      location: { region: "Addis Ababa", altitude: 2400 },
      medications: ["warfarin"],
    };
    const query = "severe throbbing headache and fever for 3 days";
    const intentResult = intentClassifier.classify(query);
    const entities = entityExtractor.extract(query);
    const urgency = urgencyDetector.detect(query, entities);

    const { strandResults, intersections, solution } = await orchestrator.retrieveAll(
      query,
      "text",
      "en",
      mockProfile,
      intentResult.intent,
      urgency
    );

    // Check Chain of Thought
    assert.equal(solution.reasoning.chainOfThought.length, 7, "Expected exactly 7 Chain-of-Thought steps");

    // Check 5-Stage Action Plan
    assert.ok(solution.action_plan.immediate_actions.length > 0, "Expected immediate actions (Stage 1: NOW)");
    assert.ok(solution.action_plan.short_term.length > 0, "Expected short term actions (Stage 2)");
    assert.ok(solution.action_plan.medium_term.length > 0, "Expected medium term actions (Stage 3)");
    assert.ok(solution.action_plan.long_term.length > 0, "Expected long term actions (Stage 4)");
    assert.ok(solution.action_plan.ongoing.length > 0, "Expected ongoing actions (Stage 5)");

    // Check Domain B Firewall
    assert.equal(solution.cultural_context.isDomainB, true, "Cultural context must be flagged as Domain B");
    assert.equal(solution.astrological_context.isDomainB, true, "Astrological context must be flagged as Domain B");
    assert.match(solution.cultural_context.disclaimer, /Domain B/i);
    assert.match(solution.astrological_context.disclaimer, /Domain B/i);

    // Check Emergency Referral Data
    assert.ok(solution.referral.emergencyHotlines.length >= 3, "Expected at least 3 emergency hotlines");
    const ephi = solution.referral.emergencyHotlines.find((h) => h.number === "907");
    assert.ok(ephi, "Expected 907 EPHI hotline");
  });

  test("8. Diagnostic cache separates scientificly different profiles", async () => {
    const query = "persistent fatigue and dizziness";
    const intentResult = intentClassifier.classify(query);
    const entities = entityExtractor.extract(query);
    const urgency = urgencyDetector.detect(query, entities);

    const first = await orchestrator.retrieveAll(
      query,
      "text",
      "en",
      { userId: "cache-user-a", age: 28, medications: ["metformin"], location: { region: "Addis Ababa", altitude: 2400 } },
      intentResult.intent,
      urgency
    );
    const second = await orchestrator.retrieveAll(
      query,
      "text",
      "en",
      { userId: "cache-user-b", age: 62, medications: ["warfarin"], location: { region: "Addis Ababa", altitude: 2400 } },
      intentResult.intent,
      urgency
    );

    assert.equal(first.fromCache, false);
    assert.equal(second.fromCache, false, "Different medication and age context must not reuse the first result");
  });
});
