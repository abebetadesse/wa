import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { pool } from "./index";
import { EFCT_MASTER_FOODS } from "../nutrition/efctDatabase";

export async function runSeed() {
  const client = await pool.connect();
  try {
    console.log("Beginning seed data insertion for Ethiopian Wisdom & Wellness Platform...");

    await client.query("BEGIN;");

    // Clean existing data
    await client.query(`
      TRUNCATE TABLE 
        audit_log,
        gap_solutions,
        gap_causes,
        identified_gaps,
        health_gap_reports,
        intake_submissions,
        herb_drug_interactions,
        compounds,
        herbs,
        food_nutrients,
        foods,
        nutrients,
        cultural_profiles,
        health_profiles,
        users
      CASCADE;
    `);

    // 1. Nutrients
    const nutrientsData = [
      { name: "Iron", symbol: "Fe", unit: "mg", category: "mineral", rdaBase: 18.0, ul: 45.0 },
      { name: "Calcium", symbol: "Ca", unit: "mg", category: "mineral", rdaBase: 1000.0, ul: 2500.0 },
      { name: "Zinc", symbol: "Zn", unit: "mg", category: "mineral", rdaBase: 11.0, ul: 40.0 },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", category: "vitamin", rdaBase: 2.4, ul: null },
      { name: "Folate", symbol: "B9", unit: "mcg", category: "vitamin", rdaBase: 400.0, ul: 1000.0 },
      { name: "Vitamin D", symbol: "VitD", unit: "IU", category: "vitamin", rdaBase: 600.0, ul: 4000.0 },
      { name: "Magnesium", symbol: "Mg", unit: "mg", category: "mineral", rdaBase: 400.0, ul: 350.0 },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", category: "vitamin", rdaBase: 90.0, ul: 2000.0 },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", category: "vitamin", rdaBase: 900.0, ul: 3000.0 },
      { name: "Protein", symbol: "Pro", unit: "g", category: "macronutrient", rdaBase: 56.0, ul: null },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", category: "macronutrient", rdaBase: 30.0, ul: null },
      { name: "Potassium", symbol: "K", unit: "mg", category: "mineral", rdaBase: 3400.0, ul: null },
    ];

    const nutrientIdMap = new Map<string, string>();
    for (const n of nutrientsData) {
      const res = await client.query(
        `INSERT INTO nutrients (name, symbol, unit, category, rda_base, tolerable_upper_limit)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name;`,
        [n.name, n.symbol, n.unit, n.category, n.rdaBase, n.ul]
      );
      nutrientIdMap.set(res.rows[0].name, res.rows[0].id);
    }
    console.log(`Inserted ${nutrientIdMap.size} reference nutrients.`);

    // 2. Ethiopian Foods (EFCT 2025 Master Database - 45+ Foods)
    for (const food of EFCT_MASTER_FOODS) {
      const foodRes = await client.query(
        `INSERT INTO foods (
           name, 
           name_amharic, 
           category, 
           traditional_preparation, 
           source_ref, 
           fasting_suitability, 
           glycemic_index, 
           phytic_acid_mg, 
           tannins_mg, 
           oxalates_mg, 
           fermentation_reduction_pct
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;`,
        [
          food.name,
          food.nameAmharic,
          food.category,
          food.traditionalPreparation,
          food.sourceRef,
          food.fastingSuitability,
          food.glycemicIndex.value,
          food.antinutrients.phyticAcidMgPer100g,
          food.antinutrients.tanninsMgPer100g,
          food.antinutrients.oxalatesMgPer100g,
          food.antinutrients.fermentationReductionPct,
        ]
      );
      const foodId = foodRes.rows[0].id;

      for (const fn of food.nutrients) {
        const nutrientId = nutrientIdMap.get(fn.name);
        if (nutrientId) {
          await client.query(
            `INSERT INTO food_nutrients (food_id, nutrient_id, amount_per_100g, bioavailability_factor, fermentation_impact_note)
             VALUES ($1, $2, $3, $4, $5);`,
            [foodId, nutrientId, fn.amountPer100g, fn.bioavailabilityFactor, fn.note || food.antinutrients.bioavailabilityUpliftDescription]
          );
        }
      }
    }
    console.log(`Inserted ${EFCT_MASTER_FOODS.length} authenticated Ethiopian foods with comprehensive nutrient & antinutrient profiles.`);

    // 3. Traditional Ethiopian Medicinal Herbs (ETM-DB)
    const herbsData = [
      {
        nameVernacular: "Damakesse",
        nameScientific: "Ocimum lamiifolium",
        nameAmharic: "ዳማከሴ",
        traditionalUses: "Crushed fresh leaves inhaled or consumed as tea for fever, colds, severe headache, and inflammatory distress.",
        primaryPartsUsed: "Leaves",
        contraindicationsGeneral: "Caution with concurrent antihypertensive therapy; may potentiate blood pressure drops.",
        sourceRef: "ETM-DB-DAM-01",
        compounds: [
          { name: "Rosmarinic acid", chemicalClass: "Polyphenol", mechanism: "Anti-inflammatory COX-2 inhibition and free radical scavenging." },
          { name: "Eugenol", chemicalClass: "Phenylpropanoid", mechanism: "Analgesic and antimicrobial properties." },
        ],
        interactions: [
          {
            drugClass: "Antihypertensives",
            drugNameExample: "Lisinopril, Amlodipine",
            severity: "moderate",
            mechanism: "Synergistic vasodilatory effect leading to risk of orthostatic hypotension.",
            clinicalEffect: "Sudden drops in blood pressure, dizziness.",
            contraindicated: false,
            evidenceLevel: "Pharmacological In Vivo",
            sourceRef: "ETM-SAFETY-HYP-04",
            ethiopianContext: "Ubiquitous traditional remedy for fever, common cold, and headache consumed as hot steam inhalation or tea.",
            recommendation: "Monitor blood pressure when using Damakesse tea; avoid sudden standing from seated or recumbent positions.",
          },
        ],
      },
      {
        nameVernacular: "Tena Adam",
        nameScientific: "Ruta chalepensis",
        nameAmharic: "ጤና አዳም",
        traditionalUses: "Leaves and berries added to Ethiopian coffee (Bunna), stews, or teas for abdominal colic, dyspepsia, and spasms.",
        primaryPartsUsed: "Leaves, Seeds, Inflorescence",
        contraindicationsGeneral: "Absolute contraindication in pregnancy (uterine stimulant/abortifacient) and bleeding disorders.",
        sourceRef: "ETM-DB-TEN-02",
        compounds: [
          { name: "Rutin", chemicalClass: "Flavonoid glycoside", mechanism: "Capillary wall strengthening and antioxidant." },
          { name: "Furanocoumarins (Bergapten)", chemicalClass: "Coumarin", mechanism: "Inhibition of hepatic CYP3A4 and platelet aggregation inhibition." },
        ],
        interactions: [
          {
            drugClass: "Anticoagulants / Antiplatelets",
            drugNameExample: "Warfarin, Aspirin, Clopidogrel",
            severity: "critical",
            mechanism: "Furanocoumarins and rutin exert potent antithrombotic effects while inhibiting drug clearance pathways.",
            clinicalEffect: "High risk of gastrointestinal or systemic hemorrhage.",
            contraindicated: true,
            evidenceLevel: "Clinical Case Documentation",
            sourceRef: "ETM-SAFETY-WAR-01",
            ethiopianContext: "Tena Adam is frequently added to coffee or morning tea, creating widespread hidden interaction risks with blood thinners.",
            recommendation: "DO NOT combine Tena Adam with prescription anticoagulants or antiplatelet drugs. Discontinue herb immediately and consult your physician.",
          },
        ],
      },
      {
        nameVernacular: "Kosso",
        nameScientific: "Hagenia abyssinica",
        nameAmharic: "ኮሶ",
        traditionalUses: "Potent traditional antihelmintic infusion made from dried female inflorescence to expel tapeworms (Taenia saginata).",
        primaryPartsUsed: "Female Flowers",
        contraindicationsGeneral: "Strictly contraindicated in pregnancy, hepatic impairment, renal disease, and children. Narrow therapeutic window.",
        sourceRef: "ETM-DB-KOS-03",
        compounds: [
          { name: "Kosotoxin", chemicalClass: "Phloroglucinol derivative", mechanism: "Paralysis of parasite musculature; neurotoxic in high doses." },
          { name: "Protogenin", chemicalClass: "Resin acid", mechanism: "Purgative and anthelmintic agent." },
        ],
        interactions: [
          {
            drugClass: "Anticoagulants / Antiplatelets",
            drugNameExample: "Warfarin, Heparin",
            severity: "critical",
            mechanism: "Kosotoxin causes direct gastric mucosal damage and hepatic metabolic stress.",
            clinicalEffect: "Internal bleeding and hepatic stress.",
            contraindicated: true,
            evidenceLevel: "Documented Toxicological Record",
            sourceRef: "ETM-SAFETY-KOS-02",
            ethiopianContext: "Traditional anthelmintic purging remedy; historically known for narrow therapeutic index and acute toxicity.",
            recommendation: "ABSOLUTELY CONTRAINDICATED with anticoagulants, antiplatelets, or NSAIDs. Seek certified medical anthelmintics (Albendazole) instead.",
          },
          {
            drugClass: "Hypoglycemics",
            drugNameExample: "Metformin, Insulin",
            severity: "critical",
            mechanism: "Kosotoxin-induced hepatic and gastrointestinal toxicity compounds biguanide metabolic burden, precipitating lactic acidosis risk.",
            clinicalEffect: "Unstable blood glucose and metabolic acidosis.",
            contraindicated: true,
            evidenceLevel: "Toxicological Advisory",
            sourceRef: "ETM-SAFETY-KOS-03",
            ethiopianContext: "Traditional tapeworm purge remedy that should never be used concurrently with metabolic medications.",
            recommendation: "STRICTLY CONTRAINDICATED. Never consume Kosso while taking diabetic medications.",
          },
        ],
      },
      {
        nameVernacular: "Tikur Azmud",
        nameScientific: "Nigella sativa",
        nameAmharic: "ጥቁር አዝሙድ",
        traditionalUses: "Aromatic seeds consumed in bread, honey, or decoctions for immune support, asthma, flatulence, and joint ache.",
        primaryPartsUsed: "Seeds",
        contraindicationsGeneral: "Large medicinal amounts should be avoided during pregnancy.",
        sourceRef: "ETM-DB-AZM-06",
        compounds: [
          { name: "Thymoquinone", chemicalClass: "Quinone", mechanism: "PPAR-gamma activation, antioxidant, AMPK pathway stimulation." },
        ],
        interactions: [
          {
            drugClass: "Hypoglycemics",
            drugNameExample: "Metformin, Glimepiride, Insulin",
            severity: "high",
            mechanism: "Thymoquinone activates AMPK pathways and stimulates beta-cell insulin release additively with oral hypoglycemic agents.",
            clinicalEffect: "Symptomatic hypoglycemia if not closely monitored.",
            contraindicated: false,
            evidenceLevel: "Clinical Randomized Trial",
            sourceRef: "ETM-SAFETY-GLU-03",
            ethiopianContext: "Tikur Azmud oil or seeds are widely consumed as a panacea for immune and metabolic health.",
            recommendation: "If consuming black seed preparations, close blood glucose self-monitoring is essential. Medication doses may require physician titration.",
          },
        ],
      },
      {
        nameVernacular: "Feto",
        nameScientific: "Lepidium sativum",
        nameAmharic: "ፌጦ",
        traditionalUses: "Crushed seeds macerated in water or honey for amoebiasis, stomach cramps, and postpartum strength.",
        primaryPartsUsed: "Seeds",
        contraindicationsGeneral: "Goitrogenic potential in high prolonged doses; caution with thyroid disease.",
        sourceRef: "ETM-DB-FET-05",
        compounds: [
          { name: "Glucotropaeolin", chemicalClass: "Glucosinolate", mechanism: "Hydrolyzed by myrosinase into antimicrobial isothiocyanates." },
        ],
        interactions: [
          {
            drugClass: "Diuretics",
            drugNameExample: "Furosemide, Spironolactone",
            severity: "moderate",
            mechanism: "Additive natriuretic and diuretic action.",
            clinicalEffect: "Electrolyte imbalance, dehydration, and hypotension.",
            contraindicated: false,
            evidenceLevel: "In Vivo Pharmacological",
            sourceRef: "ETM-SAFETY-DIU-05",
            ethiopianContext: "Feto seeds macerated in water are a common postpartum and digestive remedy.",
            recommendation: "Monitor electrolytes and hydration when combining Feto with diuretic medications.",
          },
        ],
      },
      {
        nameVernacular: "Garlic (Nech Shinkurt)",
        nameScientific: "Allium sativum",
        nameAmharic: "ነጭ ሽንኩርት",
        traditionalUses: "Raw cloves crushed in honey, or added to Wot stews, for respiratory infections and cardiovascular protection.",
        primaryPartsUsed: "Bulb",
        contraindicationsGeneral: "Concentrated medicinal extracts should be avoided before surgery or with bleeding disorders.",
        sourceRef: "ETM-DB-GAR-08",
        compounds: [
          { name: "Allicin", chemicalClass: "Organosulfur compound", mechanism: "Inhibits platelet thromboxane A2 synthesis." },
          { name: "Ajoene", chemicalClass: "Organosulfur compound", mechanism: "Synergistic platelet aggregation inhibition." },
        ],
        interactions: [
          {
            drugClass: "Anticoagulants / Antiplatelets",
            drugNameExample: "Warfarin, Aspirin",
            severity: "high",
            mechanism: "Allicin and ajoene inhibit platelet aggregation synergistically with anticoagulants.",
            clinicalEffect: "Increased bleeding time and bruising.",
            contraindicated: true,
            evidenceLevel: "Clinical Case Documentation",
            sourceRef: "ETM-SAFETY-GAR-01",
            ethiopianContext: "Raw garlic crushed in honey is commonly taken for respiratory infections and cardiovascular protection.",
            recommendation: "Avoid medicinal or concentrated garlic extracts while on blood thinners. Normal culinary use in cooked dishes is acceptable.",
          },
        ],
      },
      {
        nameVernacular: "Tosign",
        nameScientific: "Thymus serrulatus",
        nameAmharic: "ጦስኝ",
        traditionalUses: "Steeped as aromatic tea for pulmonary congestion, chronic cough, stomach distress, and hypertension.",
        primaryPartsUsed: "Aerial shoots, Leaves",
        contraindicationsGeneral: "Safe in normal culinary amounts.",
        sourceRef: "ETM-DB-TOS-07",
        compounds: [
          { name: "Thymol", chemicalClass: "Monoterpene phenol", mechanism: "Spasmolytic on tracheal smooth muscle; potent antibacterial." },
          { name: "Carvacrol", chemicalClass: "Monoterpenoid", mechanism: "Antimicrobial and anti-inflammatory." },
        ],
        interactions: [],
      },
    ];

    for (const h of herbsData) {
      const herbRes = await client.query(
        `INSERT INTO herbs (name_vernacular, name_scientific, name_amharic, traditional_uses, primary_parts_used, contraindications_general, source_ref)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
        [h.nameVernacular, h.nameScientific, h.nameAmharic, h.traditionalUses, h.primaryPartsUsed, h.contraindicationsGeneral, h.sourceRef]
      );
      const herbId = herbRes.rows[0].id;

      for (const comp of h.compounds) {
        await client.query(
          `INSERT INTO compounds (herb_id, compound_name, chemical_class, mechanism_of_action)
           VALUES ($1, $2, $3, $4);`,
          [herbId, comp.name, comp.chemicalClass, comp.mechanism]
        );
      }

      for (const inter of h.interactions) {
        await client.query(
          `INSERT INTO herb_drug_interactions
            (herb_id, drug_class, drug_name_example, interaction_severity, mechanism, clinical_effect, contraindicated, evidence_level, source_ref, ethiopian_context, recommendation)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
          [herbId, inter.drugClass, inter.drugNameExample, inter.severity, inter.mechanism, inter.clinicalEffect, inter.contraindicated, inter.evidenceLevel, inter.sourceRef, inter.ethiopianContext ?? null, inter.recommendation ?? null]
        );
      }
    }
    console.log(`Inserted ${herbsData.length} traditional Ethiopian herbs with compounds and safety interactions.`);

    // 4. Create Demo User
    const userRes = await client.query(`
      INSERT INTO users (email, name)
      VALUES ('almaz.bekele@ethio-wellness.org', 'Almaz Bekele')
      RETURNING id;
    `);
    const userId = userRes.rows[0].id;

    // Create Initial health Profile for Demo User (Domain A)
    await client.query(`
      INSERT INTO health_profiles (
        user_id, age, gender, region, altitude_meters, activity_level, pregnancy_or_lactation,
        medical_history, medications, allergies, lifestyle_habits
      ) VALUES (
        $1, 34, 'female', 'Addis Ababa', 2400, 'moderate', 'none',
        '["Mild fatigue", "Occasional dyspepsia"]'::jsonb,
        '[{"name": "Metformin", "dose": "500mg daily", "drugClass": "Hypoglycemics"}, {"name": "Aspirin", "dose": "81mg daily", "drugClass": "Anticoagulants / Antiplatelets"}]'::jsonb,
        '["Peanuts"]'::jsonb,
        '{"teaWithMeals": true, "coffeeRitualTwiceDaily": true, "fastingDays": "Wednesdays and Fridays"}'::jsonb
      );
    `, [userId]);

    // Create Separate Cultural Profile for Demo User (Domain B - Firewalled)
    await client.query(`
      INSERT INTO cultural_profiles (
        user_id, full_name, birth_date, birth_time, birth_location,
        geez_zodiac_sign, traditional_name_meaning, cultural_calendar_preference
      ) VALUES (
        $1, 'Almaz Bekele Worku', '1992-04-18', '08:30', 'Addis Ababa',
        'Hamle / Leo', 'Almaz means "Diamond" - representing unyielding inner strength and clarity', 'geez'
      );
    `, [userId]);

    // Insert Initial Audit Log Event
    await client.query(`
      INSERT INTO audit_log (user_id, event_type, payload)
      VALUES ($1, 'system_initialized', '{"status": "seed_complete", "version": "3.0.0"}'::jsonb);
    `, [userId]);

    await client.query("COMMIT;");
    console.log("Seed script completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Error running seed script:", err);
    throw err;
  } finally {
    client.release();
  }
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMainModule) {
  runSeed().then(() => process.exit(0)).catch(() => process.exit(1));
}
