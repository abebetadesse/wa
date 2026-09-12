import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ethio_wellness";
const pool = new Pool({ connectionString });

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding database via direct runner...");
    await client.query("BEGIN;");

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

    const nutrientIdMap = new Map();
    for (const n of nutrientsData) {
      const res = await client.query(
        `INSERT INTO nutrients (name, symbol, unit, category, rda_base, tolerable_upper_limit)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name;`,
        [n.name, n.symbol, n.unit, n.category, n.rdaBase, n.ul]
      );
      nutrientIdMap.set(res.rows[0].name, res.rows[0].id);
    }
    console.log(`Inserted ${nutrientIdMap.size} reference nutrients.`);

    // 2. Foods
    const foodsData = [
      {
        name: "Fermented Brown Teff Injera",
        nameAmharic: "የቡናማ ጤፍ እንጀራ (የቦካ)",
        category: "Grains & Cereals",
        traditionalPreparation: "4-day spontaneous lactic-acid & yeast fermentation with Ersho. Degrades phytate complexes by up to 60%, significantly liberating bound iron and zinc.",
        sourceRef: "EFCT2025-0101",
        nutrients: [
          { name: "Iron", amountPer100g: 11.5, factor: 1.45, note: "Fermentation increases non-heme bioavailability" },
          { name: "Calcium", amountPer100g: 130.0, factor: 1.20, note: "Phytate degradation" },
          { name: "Zinc", amountPer100g: 3.6, factor: 1.35, note: "Enzymatic liberation" },
          { name: "Protein", amountPer100g: 8.9, factor: 1.0, note: "Complete essential amino acid profile" },
          { name: "Dietary Fiber", amountPer100g: 7.8, factor: 1.0, note: "Prebiotic resistant starch" },
          { name: "Magnesium", amountPer100g: 140.0, factor: 1.15, note: "Enhanced absorption" },
        ],
      },
      {
        name: "White Teff Injera (Nech Teff)",
        nameAmharic: "የነጭ ጤፍ እንጀራ",
        category: "Grains & Cereals",
        traditionalPreparation: "Fermented white teff flour. Higher starch, slightly lower mineral content than brown teff.",
        sourceRef: "EFCT2025-0102",
        nutrients: [
          { name: "Iron", amountPer100g: 6.8, factor: 1.35, note: "Fermented injera" },
          { name: "Calcium", amountPer100g: 90.0, factor: 1.15, note: "White grain fraction" },
          { name: "Zinc", amountPer100g: 2.8, factor: 1.25, note: "Fermented" },
          { name: "Protein", amountPer100g: 8.2, factor: 1.0, note: "Standard protein" },
          { name: "Dietary Fiber", amountPer100g: 5.5, factor: 1.0, note: "Refined teff" },
        ],
      },
      {
        name: "Shiro Wot (Chickpea & Pea Flour Stew)",
        nameAmharic: "ሽሮ ወጥ",
        category: "Legumes & Pulses",
        traditionalPreparation: "Spiced milled chickpea and grass pea (guaya) simmered with onions, garlic, and berbere.",
        sourceRef: "EFCT2025-0201",
        nutrients: [
          { name: "Protein", amountPer100g: 12.4, factor: 1.0, note: "Rich pulse protein" },
          { name: "Folate", amountPer100g: 180.0, factor: 1.0, note: "High natural folate" },
          { name: "Iron", amountPer100g: 4.8, factor: 1.0, note: "Non-heme plant iron" },
          { name: "Zinc", amountPer100g: 2.2, factor: 1.0, note: "Bioavailable pulse zinc" },
          { name: "Dietary Fiber", amountPer100g: 6.2, factor: 1.0, note: "Legume soluble fiber" },
          { name: "Potassium", amountPer100g: 480.0, factor: 1.0, note: "Cardioprotective potassium" },
        ],
      },
      {
        name: "Misir Wot (Spicy Red Lentil Stew)",
        nameAmharic: "ምስር ወጥ",
        category: "Legumes & Pulses",
        traditionalPreparation: "Split red lentils simmered in berbere paste, onions, and garlic.",
        sourceRef: "EFCT2025-0202",
        nutrients: [
          { name: "Protein", amountPer100g: 14.5, factor: 1.0, note: "High protein legume" },
          { name: "Folate", amountPer100g: 210.0, factor: 1.0, note: "Key prenatal nutrient" },
          { name: "Iron", amountPer100g: 5.5, factor: 1.0, note: "Non-heme iron" },
          { name: "Dietary Fiber", amountPer100g: 7.9, factor: 1.0, note: "High fiber" },
        ],
      },
      {
        name: "Gomen (Braised Ethiopian Collard Greens)",
        nameAmharic: "ጎመን",
        category: "Vegetables",
        traditionalPreparation: "Steamed and braised leafy Ethiopian collard greens with garlic, ginger, and green peppers.",
        sourceRef: "EFCT2025-0301",
        nutrients: [
          { name: "Calcium", amountPer100g: 210.0, factor: 1.25, note: "Low oxalate; highly bioavailable calcium" },
          { name: "Vitamin A", amountPer100g: 380.0, factor: 1.0, note: "Beta-carotene provitamin A" },
          { name: "Vitamin C", amountPer100g: 45.0, factor: 0.9, note: "Heat degraded during cooking" },
          { name: "Folate", amountPer100g: 120.0, factor: 1.0, note: "Leafy green folate" },
          { name: "Dietary Fiber", amountPer100g: 4.0, factor: 1.0, note: "Dietary roughage" },
        ],
      },
      {
        name: "Kocho (Fermented Enset Bread)",
        nameAmharic: "ቆጮ (የተቦካ የእንሰት ስራስር)",
        category: "Roots & Tubers",
        traditionalPreparation: "Scraped leaf sheaths and pulverized corm of Enset fermented in underground earthen pits.",
        sourceRef: "EFCT2025-0401",
        nutrients: [
          { name: "Calcium", amountPer100g: 160.0, factor: 1.15, note: "Mineral rich underground pit fermentation" },
          { name: "Zinc", amountPer100g: 1.2, factor: 1.0, note: "Moderate mineral trace" },
          { name: "Dietary Fiber", amountPer100g: 5.8, factor: 1.0, note: "Complex structural enset fibers" },
          { name: "Protein", amountPer100g: 1.8, factor: 1.0, note: "Low protein content" },
        ],
      },
      {
        name: "Bulla Porridge",
        nameAmharic: "ቡላ ገንፎ",
        category: "Roots & Tubers",
        traditionalPreparation: "Refined liquid squeezed from enset pulp, decanted and dried into high-energy flour.",
        sourceRef: "EFCT2025-0402",
        nutrients: [
          { name: "Calcium", amountPer100g: 185.0, factor: 1.10, note: "Traditional postpartum recovery food" },
          { name: "Iron", amountPer100g: 2.1, factor: 1.0, note: "Plant mineral trace" },
          { name: "Dietary Fiber", amountPer100g: 3.2, factor: 1.0, note: "Digestible enset starch" },
        ],
      },
      {
        name: "Moringa (Shiferaw) Leaf Powder",
        nameAmharic: "የሽፈራው ዱቄት",
        category: "Traditional Superfoods",
        traditionalPreparation: "Shade-dried and pulverized leaves of Moringa stenopetala (indigenous Konso variety).",
        sourceRef: "EFCT2025-0305",
        nutrients: [
          { name: "Calcium", amountPer100g: 1850.0, factor: 1.10, note: "Exceptional botanical calcium source" },
          { name: "Iron", amountPer100g: 28.0, factor: 1.15, note: "Dense plant iron" },
          { name: "Vitamin A", amountPer100g: 1600.0, factor: 1.0, note: "Provitamin A carotenoids" },
          { name: "Protein", amountPer100g: 27.0, factor: 1.0, note: "Plant protein matrix" },
          { name: "Magnesium", amountPer100g: 360.0, factor: 1.10, note: "Cellular magnesium" },
        ],
      },
      {
        name: "Doro Wot with Hardboiled Egg",
        nameAmharic: "ዶሮ ወጥ ከእንቁላል ጋር",
        category: "Meat & Poultry",
        traditionalPreparation: "Slow cooked chicken pieces and eggs in caramelized onions, niter kibbeh, and berbere.",
        sourceRef: "EFCT2025-0802",
        nutrients: [
          { name: "Protein", amountPer100g: 22.5, factor: 1.0, note: "Complete animal protein" },
          { name: "Vitamin B12", amountPer100g: 1.8, factor: 1.0, note: "Essential animal source B12" },
          { name: "Iron", amountPer100g: 3.8, factor: 1.8, note: "Heme iron with superior absorption" },
          { name: "Zinc", amountPer100g: 3.2, factor: 1.5, note: "Bioavailable animal zinc" },
        ],
      },
      {
        name: "Ethiopian Fresh Cheese (Aib)",
        nameAmharic: "አይብ",
        category: "Dairy",
        traditionalPreparation: "Soft fresh cottage cheese made by heating buttermilk from fermented whole milk.",
        sourceRef: "EFCT2025-0701",
        nutrients: [
          { name: "Protein", amountPer100g: 13.5, factor: 1.0, note: "Casein and whey protein" },
          { name: "Calcium", amountPer100g: 240.0, factor: 1.3, note: "Dairy calcium" },
          { name: "Vitamin B12", amountPer100g: 0.9, factor: 1.0, note: "Bioavailable B12" },
        ],
      },
      {
        name: "Roasted Telba (Flaxseed) Drink",
        nameAmharic: "የተልባ ውሀ / ጭማቂ",
        category: "Seeds & Nuts",
        traditionalPreparation: "Lightly roasted flaxseed freshly ground and whisked into warm water.",
        sourceRef: "EFCT2025-0502",
        nutrients: [
          { name: "Dietary Fiber", amountPer100g: 27.0, factor: 1.0, note: "Rich mucilage and soluble fiber" },
          { name: "Magnesium", amountPer100g: 390.0, factor: 1.0, note: "High magnesium" },
          { name: "Potassium", amountPer100g: 810.0, factor: 1.0, note: "Cardiovascular electrolyte" },
          { name: "Iron", amountPer100g: 5.7, factor: 1.0, note: "Plant iron" },
        ],
      },
    ];

    for (const food of foodsData) {
      const foodRes = await client.query(
        `INSERT INTO foods (name, name_amharic, category, traditional_preparation, source_ref)
         VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
        [food.name, food.nameAmharic, food.category, food.traditionalPreparation, food.sourceRef]
      );
      const foodId = foodRes.rows[0].id;

      for (const fn of food.nutrients) {
        const nutrientId = nutrientIdMap.get(fn.name);
        if (nutrientId) {
          await client.query(
            `INSERT INTO food_nutrients (food_id, nutrient_id, amount_per_100g, bioavailability_factor, fermentation_impact_note)
             VALUES ($1, $2, $3, $4, $5);`,
            [foodId, nutrientId, fn.amountPer100g, fn.factor, fn.note]
          );
        }
      }
    }
    console.log(`Inserted ${foodsData.length} Ethiopian foods with nutrient profiles.`);

    // 3. Traditional Herbs & Safety Interactions (ETM-DB)
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
            severity: "high",
            mechanism: "Furanocoumarins cause potent platelet inhibition and potentiation of INR prolongation.",
            clinicalEffect: "High risk of gastrointestinal or systemic hemorrhage.",
            contraindicated: true,
            evidenceLevel: "Clinical Case Documentation",
            sourceRef: "ETM-SAFETY-WAR-01",
          },
        ],
      },
      {
        nameVernacular: "Kosso",
        nameScientific: "Hagenia abyssinica",
        nameAmharic: "ኮሶ",
        traditionalUses: "Potent traditional antihelmintic infusion made from dried female inflorescence to expel tapeworms.",
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
            severity: "high",
            mechanism: "Hepatotoxicity risks and mucosal irritation accelerating bleeding.",
            clinicalEffect: "Internal bleeding and hepatic stress.",
            contraindicated: true,
            evidenceLevel: "Documented Toxicological Record",
            sourceRef: "ETM-SAFETY-KOS-02",
          },
          {
            drugClass: "Hypoglycemics",
            drugNameExample: "Metformin, Insulin",
            severity: "high",
            mechanism: "Severe metabolic perturbation and lactic acidosis risk.",
            clinicalEffect: "Unstable blood glucose and metabolic acidosis.",
            contraindicated: true,
            evidenceLevel: "Toxicological Advisory",
            sourceRef: "ETM-SAFETY-KOS-03",
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
            drugNameExample: "Metformin, Glimepiride",
            severity: "moderate",
            mechanism: "Additive glycemic lowering effect via pancreatic beta-cell stimulation and glucose uptake.",
            clinicalEffect: "Symptomatic hypoglycemia if not closely monitored.",
            contraindicated: false,
            evidenceLevel: "Clinical Randomized Trial",
            sourceRef: "ETM-SAFETY-GLU-03",
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
          { name: "Glucotropaeolin", chemicalClass: "Glucosinolate", mechanism: "Hydrolyzed into antimicrobial isothiocyanates." },
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
            (herb_id, drug_class, drug_name_example, interaction_severity, mechanism, clinical_effect, contraindicated, evidence_level, source_ref)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [herbId, inter.drugClass, inter.drugNameExample, inter.severity, inter.mechanism, inter.clinicalEffect, inter.contraindicated, inter.evidenceLevel, inter.sourceRef]
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
    console.log("Database seeded successfully!");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("Seed error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
