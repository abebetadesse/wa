import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parsehealthInquiry } from "../lib/inquiry/parser.ts";
import { retrieveInquiryKnowledge } from "../lib/inquiry/knowledgeRetrieval.ts";
import { BiochemicalKnowledgeStrand } from "../lib/knowledge/strands/biochemicalStrand.ts";
import { BiologicalKnowledgeStrand } from "../lib/knowledge/strands/biologicalStrand.ts";
import { MedicationKnowledgeStrand } from "../lib/knowledge/strands/medicationStrand.ts";
import { CulturalKnowledgeStrand } from "../lib/knowledge/strands/culturalStrand.ts";

describe("Multi-strand inquiry retrieval", () => {
  test("returns medication safety context for a herb and medication query", async () => {
    const inquiry = parsehealthInquiry("I take warfarin and want to use Kosso");
    const result = await retrieveInquiryKnowledge(inquiry);
    const safetyFinding = result.findings.find((finding) => finding.strand === "medication");

    assert.ok(safetyFinding);
    assert.match(safetyFinding.title, /flagged/i);
    assert.ok(safetyFinding.safetyNote);
    assert.ok(result.strandsQueried.includes("ecological"));
  });

  test("connects fatigue to biochemical context without diagnosing", async () => {
    const inquiry = parsehealthInquiry("I feel tired and low energy");
    const result = await retrieveInquiryKnowledge(inquiry);
    const biochemical = result.findings.find((finding) => finding.strand === "biochemical");

    assert.ok(biochemical);
    assert.match(result.disclaimer, /do not establish a diagnosis/i);
  });

  test("retrieves biochemical nutrient context from symptom synonyms and profile data", async () => {
    const strand = new BiochemicalKnowledgeStrand();
    const findings = await strand.query("I feel exhausted with numbness and poor digestion", {
      deficiencies: ["iron"],
      health: { medications: ["Metformin"] },
    });

    assert.ok(findings.some((finding) => finding.name.includes("KREBS CYCLE")));
    assert.ok(findings.some((finding) => finding.name.includes("B12 COBALAMIN")));
    assert.ok(findings.some((finding) => finding.name.includes("IRON ABSORPTION")));
    const enzymeFinding = findings.find((finding) => finding.type === "enzyme_system");
    assert.ok(enzymeFinding);
    assert.equal(enzymeFinding.risk_assessment?.level, "high");
  });

  test("covers Ethiopian fasting, food, and herb-drug helpers", async () => {
    const strand = new BiochemicalKnowledgeStrand();
    const gaps = await strand.analyzeNutrientGaps({ iron: 2, b12: 0 }, {
      cultural: { fasting: true },
    });
    assert.equal(gaps.length, 2);
    assert.ok(gaps.find((finding) => finding.name === "IRON INTAKE GAP")?.recommendations.includes("Teff"));
    assert.match(strand.getFastingAdvice({ cultural: { fasting: true } })[0], /iron/i);

    const interactions = await strand.checkHerbDrugInteractions(["Ginger"], ["Warfarin"]);
    assert.equal(interactions[0]?.severity, "high");
    assert.match(interactions[0]?.evidence || "", /bleeding/i);

    const findings = await strand.query("coffee and khat during Orthodox fasting", {
      cultural: { fasting: true },
    });
    assert.ok(findings.some((finding) => finding.name === "COFFEE METABOLISM"));
    assert.ok(findings.some((finding) => finding.name === "KHAT BIOCHEMISTRY"));
    assert.ok(findings.some((finding) => finding.matches?.includes("fasting_relevant")));
  });

  test("retrieves biological, altitude, and region-aware context", async () => {
    const strand = new BiologicalKnowledgeStrand();
    const findings = await strand.query("bloating, poor sleep, and breathing problems", {
      region: "Amhara Highlands",
      guthealth: { problems: ["IBS"] },
    });

    assert.ok(findings.some((finding) => finding.name === "GUT MICROBIOME"));
    assert.ok(findings.some((finding) => finding.name === "SLEEP NEUROSCIENCE"));
    assert.ok(findings.some((finding) => finding.name === "HYPOXIA RESPONSE"));
    assert.ok(findings.some((finding) => finding.name === "TUBERCULOSIS"));

    const genetic = await strand.assessGeneticRisk({ medications: ["Codeine"] });
    assert.equal(genetic[0]?.severity, "high");
    assert.ok(strand.getAltitudeAcclimatisationAdvice(3000).some((item) => /gradually/i.test(item)));
  });

  test("covers medication interactions, fasting, pregnancy, and adverse reactions", async () => {
    const strand = new MedicationKnowledgeStrand();
    const findings = await strand.query("fasting jaundice pregnancy warfarin metronidazole", {
      health: { medications: ["Warfarin", "Isoniazid"], pregnant: true },
      lifestyle: { fasting: true },
    });

    assert.ok(findings.some((finding) => finding.type === "pregnancy_lactation_safety"));
    assert.ok(findings.some((finding) => finding.type === "fasting_medication_safety"));
    assert.ok(findings.some((finding) => finding.type === "adverse_drug_reaction"));
    assert.ok(findings.some((finding) => finding.type === "drug_drug_interaction"));
  });

  test("returns culturally specific Domain B context without clinical substitution", async () => {
    const strand = new CulturalKnowledgeStrand();
    const findings = await strand.query("Wogesha fracture and Buna coffee ceremony", {
      cultural: { language: "am", ethnicity: "Amhara" },
    });

    assert.ok(findings.some((finding) => /Wogesha/i.test(finding.name)));
    assert.ok(findings.some((finding) => /coffee/i.test(finding.name)));
    assert.ok(findings.every((finding) => finding.domain === "cultural"));
    assert.ok(findings.every((finding) => finding.details?.isDomainB === true));
    assert.ok(findings.some((finding) => finding.evidence?.match(/urgent|medical/i)));
    assert.deepEqual(strand.getNameMeaningAndhealthInsight("Abebe")?.meaning, "Flourished or bloomed");
  });

  test("exposes essential medicine, pharmacokinetic, AMR, and pregnancy safety context", async () => {
    const strand = new MedicationKnowledgeStrand();
    const profile = strand.getEssentialMedicineProfile("Rifampicin");
    assert.equal(profile?.className, "Antituberculosis medicine");
    assert.match(strand.getAntimicrobialResistanceAdvice("rifampicin TB resistance")[0], /combination regimen/i);
    assert.match(strand.getPregnancyLactationSafety("Enalapril")?.pregnancy || "", /pregnancy/i);

    const findings = await strand.query("rifampicin pharmacokinetic resistance", {
      medications: ["Rifampicin"],
    });
    assert.ok(findings.some((finding) => finding.type === "essential_medicine_profile"));
    assert.ok(findings.some((finding) => finding.type === "pharmacokinetic_safety"));
    assert.ok(findings.some((finding) => finding.type === "antimicrobial_resistance_guidance"));
  });
});
