import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile } from "../types";

export class BiochemicalKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "biochemical";

  private queryAliases: Record<string, string[]> = {
    energy: ["energy", "fatigue", "tired", "exhaustion", "weakness", "brain fog", "lethargy"],
    glucose: ["glucose", "blood sugar", "diabetes", "insulin resistance", "sugar", "hyperglycemia", "hypoglycemia"],
    iron: ["iron", "anemia", "anaemia", "pale", "restless legs", "ferritin", "haemoglobin"],
    calcium: ["calcium", "bone", "osteoporosis", "cramps", "tetany"],
    magnesium: ["magnesium", "muscle cramps", "sleep", "anxiety", "constipation", "migraine"],
    zinc: ["zinc", "wound healing", "taste", "immune", "hair loss", "acne"],
    b12: ["b12", "vitamin b12", "cobalamin", "numbness", "tingling", "vegan", "megaloblastic"],
    folate: ["folate", "folic acid", "neural tube", "homocysteine"],
    vitamin_d: ["vitamin d", "sunlight", "bone", "immune", "hypovitaminosis d"],
    vitamin_k: ["vitamin k", "clotting", "warfarin", "bleeding"],
    omega3: ["omega 3", "fatty acids", "inflammation", "heart", "brain", "fish oil", "niger seed"],
    digestion: ["digestion", "digestive", "stomach", "bloating", "gut", "microbiome", "fermentation"],
    sleep: ["sleep", "insomnia", "circadian", "melatonin", "rest"],
    liver: ["liver", "detox", "toxin", "herb", "drug interaction", "hepatic"],
    coffee: ["coffee", "buna", "caffeine", "chlorogenic acid"],
    khat: ["khat", "catha edulis", "cathinone", "stimulant"],
    teff: ["teff", "injera", "ersho", "fermentation", "phytate"],
    fasting: ["fasting", "tsome", "orthodox fasting", "abiy tsom", "vegan fasting"],
    herbs: ["herbal", "traditional", "tena adam", "kosso", "ginger", "garlic", "tikur azmud"],
    stress: ["stress", "cortisol", "adrenal", "anxiety", "burnout"],
    mood: ["mood", "depression", "serotonin", "dopamine", "neurotransmitter"],
  };

  private metabolicPathways = {
    glycolysis: {
      description: "Glucose metabolism for cellular energy production and ATP generation",
      key_enzymes: ["Hexokinase", "Phosphofructokinase", "Pyruvate Kinase"],
      nutrients: ["Glucose", "ATP", "NAD+", "Magnesium"],
      conditions: ["Diabetes", "Metabolic Syndrome", "Fatigue", "Lactic Acidosis"],
      ethiopian_context: ["Teff low-glycemic energy release", "4-day Ersho fermented injera starch resistance"],
      interactions: ["Insulin", "Glucagon", "Cortisol"],
      recommendations: ["Balance whole teff intake with protein", "Space complex carbohydrates throughout the day"],
    },
    krebs_cycle: {
      description: "Mitochondrial citric acid cycle converting acetyl-CoA into reducing equivalents and ATP",
      key_enzymes: ["Citrate Synthase", "Isocitrate Dehydrogenase", "Alpha-Ketoglutarate Dehydrogenase"],
      nutrients: ["Acetyl-CoA", "NAD+", "FAD", "Thiamine (B1)", "Riboflavin (B2)", "Magnesium", "Lipoic Acid"],
      conditions: ["Chronic Fatigue", "Mitochondrial dysfunction", "Brain fog", "Altitude hypoxia stress"],
      ethiopian_context: ["Highland mitochondrial energy adaptation from Ethiopian ancient grains (Teff, Emmer wheat/Aja)"],
      interactions: ["Iron-sulfur cluster stability", "Cellular oxygen tension"],
      recommendations: ["Support with B-complex vitamins from unpolished grains", "Optimize oxygen transport with bioavailable iron"],
    },
    fatty_acid_oxidation: {
      description: "Mitochondrial beta-oxidation of fatty acids for sustained energy and ketone body production",
      key_enzymes: ["Carnitine Palmitoyltransferase-1 (CPT-1)", "Acyl-CoA Dehydrogenase"],
      nutrients: ["Fatty acids", "L-Carnitine", "Coenzyme A", "Vitamin B2"],
      conditions: ["Obesity", "Insulin resistance", "Non-alcoholic fatty liver", "Endurance depletion"],
      ethiopian_context: ["Nug (Guizotia abyssinica / Niger seed) oil linoleic acid profile", "Cultured spiced butter (Niter Kibbeh) medium-chain fatty acids"],
      interactions: ["Carnitine shuttle", "Thyroid hormones"],
      recommendations: ["Incorporate cold-pressed Niger seed oil", "Utilize traditional culinary herbs with fat-soluble bioactives"],
    },
    amino_acid_metabolism: {
      description: "Transamination, deamination, and synthesis of essential amino acids and tissue protein",
      key_enzymes: ["Alanine Aminotransferase (ALT)", "Aspartate Aminotransferase (AST)", "Glutamate Dehydrogenase"],
      nutrients: ["Essential amino acids", "Pyridoxal-5-Phosphate (Vitamin B6)", "Zinc", "Magnesium"],
      conditions: ["Muscle wasting", "Malnutrition", "Protein-energy malnutrition (Kwashiorkor/Marasmus)", "Liver stress"],
      ethiopian_context: ["Pulse combinations (Shiro / Kik / Misir wot) paired with teff for complete amino acid complementarity (lysine + methionine balance)"],
      interactions: ["Growth hormone", "Insulin-like growth factor-1"],
      recommendations: ["Pair teff injera with legume wots to form complete protein chains", "Ensure adequate zinc for transaminase enzymes"],
    },
    neurotransmitter_synthesis: {
      description: "Biochemical biosynthesis of monoamine and amino acid neurotransmitters governing mood, focus, and sleep",
      key_enzymes: ["Tyrosine Hydroxylase", "Tryptophan Hydroxylase", "Glutamic Acid Decarboxylase (GAD)"],
      nutrients: ["L-Tryptophan", "L-Tyrosine", "Vitamin B6", "Tetrahydrobiopterin (BH4)", "Iron", "Folate"],
      conditions: ["Depression", "Anxiety", "Insomnia", "ADHD", "Neuropathic pain"],
      ethiopian_context: ["Fermentation GABA production in injera ersho", "Ethiopian highland Arabica coffee chlorogenic acids and caffeine balance"],
      interactions: ["Serotonin-melatonin axis", "Dopamine-norepinephrine cascade"],
      recommendations: ["Utilize naturally fermented foods rich in GABA precursors", "Manage coffee consumption timing relative to circadian cortisol spikes"],
    },
    detoxification_pathways: {
      description: "Hepatic Phase I functionalization and Phase II conjugation pathways for xenobiotic and metabolite clearance",
      key_enzymes: ["Cytochrome P450 superfamily", "Glutathione S-Transferase (GST)", "UDP-Glucuronosyltransferase (UGT)"],
      nutrients: ["Reduced Glutathione", "Glycine", "Taurine", "Glutamine", "Sulfur", "Selenium"],
      conditions: ["Liver dysfunction", "Xenobiotic toxicity", "Substance clearance overload", "Drug adverse interactions"],
      ethiopian_context: ["Traditional protective hepatobiliary herbs (Tena Adam, Tikur Azmud)", "Coffee polyphenols stimulating Nrf2 pathway"],
      interactions: ["CYP enzyme competition", "Glutathione depletion via paracetamol or alcohol"],
      recommendations: ["Support glutathione synthesis with sulfur-rich brassicas (Gomen)", "Avoid overloading phase I enzymes during medication therapy"],
    },
    pentose_phosphate_pathway: {
      description: "Oxidative pathway generating NADPH for antioxidant defense and ribose-5-phosphate for nucleotide synthesis",
      key_enzymes: ["Glucose-6-Phosphate Dehydrogenase (G6PD)", "Transketolase", "Transaldolase"],
      nutrients: ["Glucose-6-Phosphate", "NADP+", "Thiamine (B1)", "Riboflavin"],
      conditions: ["G6PD deficiency", "Oxidative stress", "Fava bean sensitivity"],
      ethiopian_context: ["Fava bean (Baqela) can trigger hemolysis in people with G6PD deficiency"],
      interactions: ["Glutathione redox cycle", "Nucleotide synthesis"],
      recommendations: ["If G6PD deficiency is known, seek clinician guidance before fava beans or oxidizing medicines"],
    },
    urea_cycle: {
      description: "Hepatic conversion of ammonia to urea for safe excretion",
      key_enzymes: ["Carbamoyl Phosphate Synthetase I", "Ornithine Transcarbamylase"],
      nutrients: ["Ammonia", "Aspartate", "Bicarbonate", "Zinc"],
      conditions: ["Liver disease", "Hyperammonemia", "High protein diets"],
      ethiopian_context: ["Fermented milk foods are part of several Ethiopian dietary traditions"],
      interactions: ["Hepatic encephalopathy", "Cirrhosis"],
      recommendations: ["Liver disease and high-protein changes require a qualified clinician or dietitian"],
    },
    gluconeogenesis: {
      description: "Glucose synthesis from lactate, amino acids, and glycerol during fasting",
      key_enzymes: ["PEPCK", "Fructose-1,6-Bisphosphatase", "Glucose-6-Phosphatase"],
      nutrients: ["Lactate", "Alanine", "Glycerol", "Biotin", "Magnesium"],
      conditions: ["Fasting", "Type 2 diabetes", "Starvation"],
      ethiopian_context: ["Extended Orthodox fasting can create recurring periods of altered glucose metabolism"],
      interactions: ["Insulin suppression", "Glucagon stimulation"],
      recommendations: ["People with diabetes should plan extended fasts with their care team and monitor glucose"],
    },
    glycogen_metabolism: {
      description: "Storage and release of glucose as glycogen for exercise and daily energy",
      key_enzymes: ["Glycogen Synthase", "Glycogen Phosphorylase"],
      nutrients: ["Glucose", "UDP-Glucose", "Magnesium", "Potassium"],
      conditions: ["Hypoglycemia", "Exercise-induced fatigue"],
      ethiopian_context: ["Teff-based meals are a culturally familiar complex-carbohydrate option"],
      interactions: ["Insulin stimulates storage", "Glucagon stimulates release"],
      recommendations: ["Pair complex carbohydrates with protein after demanding activity"],
    },
    ketogenesis: {
      description: "Hepatic production of ketone bodies during prolonged fasting or carbohydrate restriction",
      key_enzymes: ["HMG-CoA Synthase", "HMG-CoA Lyase"],
      nutrients: ["Acetyl-CoA", "NADH", "Coenzyme A"],
      conditions: ["Prolonged fasting", "Type 1 diabetes", "Ketoacidosis"],
      ethiopian_context: ["Fasting traditions can alter fuel use, but ketosis is not automatically safe"],
      interactions: ["Insulin suppresses ketogenesis", "Glucagon stimulates it"],
      recommendations: ["Diabetic patients should not use prolonged fasting without medical supervision"],
    },
  };

  private nutrientInteractions = {
    iron_absorption: {
      description: "Biochemical factors and mucosal transporters governing dietary non-heme and heme iron bioavailability",
      enhancers: ["Ascorbic acid (Vitamin C)", "Meat protein factor", "Organic acids (lactic, citric, malic)"],
      inhibitors: ["Inositol hexaphosphate (Phytates)", "Condensed tannins", "Calcium salts", "Polyphenolic chlorogenic acids in coffee/tea"],
      ethiopian_context: ["72-hour yeast-lactic dough fermentation degrades >75% of teff phytates via microbial phytases", "Tradition of drinking strong coffee directly with iron-rich meals strongly blunts absorption"],
      deficiency: "Microcytic hypochromic anemia, cognitive fatigue, restless legs, impaired cold thermogenesis",
      sources: ["Brown teff", "Grass-fed beef", "Lentils (Misir)", "Kale (Gomen)", "Fenugreek (Abish)"],
      recommendations: [
        "Separate coffee or black tea intake by at least 90 minutes from iron-rich meals",
        "Add lemon or citrus to pulse-based dishes to convert ferric (Fe3+) to absorbable ferrous (Fe2+) iron",
      ],
    },
    calcium_metabolism: {
      description: "Intestinal absorption, parathyroid hormone regulation, and bone deposition of calcium ions",
      enhancers: ["1,25-dihydroxyvitamin D3", "Vitamin K2", "Magnesium (Mg2+ balance)"],
      inhibitors: ["Oxalic acid", "Excess unfermented phytates", "High sodium intake inducing hypercalciuria"],
      ethiopian_context: ["High altitude calcium turnover", "Dairy from pasture-fed indigenous Zebu cattle (high K2)", "Kale (Habesha Gomen) low in oxalates compared to spinach"],
      deficiency: "Osteopenia, osteomalacia, muscle cramps, tetany, osteomalacia at high altitude",
      sources: ["Ethiopian fermented cottage cheese (Ayib)", "Raw buttermilk (Ergo)", "Habesha Gomen", "Roasted sesame"],
      recommendations: [
        "Include fermented dairy (Ayib/Ergo) for bioavailable calcium and natural probiotics",
        "Maintain adequate sun exposure for endogenous Vitamin D activation",
      ],
    },
    zinc_bioavailability: {
      description: "Competitive intestinal absorption via ZIP and ZnT transporters and metallothionein regulation",
      enhancers: ["Cysteine and histidine-rich peptides", "Citric acid", "Ersho fermentation"],
      inhibitors: ["Phytate:zinc molar ratio > 15:1", "Excessive inorganic iron supplements", "Cadmium exposure"],
      ethiopian_context: ["Teff contains high native zinc, but bioavailability hinges on ersho fermentation duration", "Traditional soaked and sprouted pulses (Nifro) activate endogenous phytases"],
      deficiency: "Impaired cell-mediated immunity, delayed dermal wound healing, dysgeusia, alopecia",
      sources: ["Teff", "Roasted chickpeas (Kolo)", "Beef", "Pumpkin seeds", "Sesame (Selit)"],
      recommendations: [
        "Choose thoroughly fermented injera (3 to 4 days fermentation) to maximize zinc liberation",
        "Incorporate sprouted legumes into weekly rotation",
      ],
    },
    magnesium_balance: {
      description: "Magnesium supports ATP handling, muscle contraction, nerve signaling, and hundreds of enzyme reactions",
      enhancers: ["Adequate dietary intake", "Fermented foods"],
      inhibitors: ["Alcohol-related renal wasting", "High phytate intake", "Oxalates"],
      ethiopian_context: ["Teff, pumpkin seeds, sesame, and legumes provide culturally familiar magnesium sources"],
      deficiency: "Muscle cramps, constipation, migraine, fatigue, and sleep disturbance",
      sources: ["Teff", "Pumpkin seeds", "Niger seeds", "Legumes", "Dark leafy greens"],
      recommendations: ["Use food-first sources and confirm persistent symptoms with a clinician before supplementing"],
    },
    vitamin_d_endocrine: {
      description: "Cutaneous 7-dehydrocholesterol photolysis to cholecalciferol and renal 1-alpha hydroxylation",
      enhancers: ["Mid-day equatorial sun exposure", "Dietary healthy fats"],
      inhibitors: ["Melanin epidermal filtering", "Indoor sedentary shielding", "Air pollution"],
      factors: ["Melanin epidermal filtering", "Solar zenith angle", "Altitude UV-B irradiance", "Body surface exposure"],
      ethiopian_context: ["Despite high solar irradiance in Ethiopian highlands, indoor urban shifts and dark skin pigmentation often lead to subscientific hypovitaminosis D"],
      deficiency: "Musculoskeletal pain, decreased bone mineral density, elevated parathyroid hormone, depressed immune surveillance",
      sources: ["Equatorial high-altitude sunlight", "Egg yolks", "Pasture butter", "Wild lake fish (Tana Tilapia)"],
      recommendations: [
        "Aim for 20-30 minutes of mid-day sun exposure with forearms and face exposed",
        "Consider 25(OH)D baseline screening in cases of persistent musculoskeletal aches",
      ],
    },
    b12_cobalamin_utilization: {
      description: "Gastric intrinsic factor binding, ileal endocytosis, and methionine synthase coenzyme activity",
      enhancers: ["Adequate gastric acid", "Intrinsic factor production"],
      inhibitors: ["Continuous vegan fasting without fortification", "H. pylori gastritis", "Metformin prolonged use"],
      factors: ["Gastric parietal cell acid secretion", "Strict dietary veganism", "H. pylori gastritis"],
      ethiopian_context: ["Ethiopian Orthodox fasting seasons (Tsome - up to 250 vegan fasting days/year) create cyclical periods of zero dietary B12 intake"],
      deficiency: "Macrocytic megaloblastic anemia, peripheral neuropathy, subacute combined spinal degeneration, fatigue",
      sources: ["Beef liver", "Fish", "Fermented dairy", "Fortified nutritional yeast"],
      recommendations: [
        "Monitor B12 during prolonged fasting periods like Abiy Tsom (Lent)",
        "Incorporate nutritional yeast or clinical cobalamin supplementation if fasting continuously",
      ],
    },
    folate_metabolism: {
      description: "One-carbon transfer reactions supporting DNA synthesis and homocysteine remethylation",
      enhancers: ["Vitamin B12", "Vitamin B6", "Riboflavin"],
      inhibitors: ["Alcohol", "Methotrexate", "Sulfasalazine"],
      ethiopian_context: ["Gomen and pulses provide folate; quick cooking preserves more folate than prolonged boiling"],
      deficiency: "Megaloblastic anemia, elevated homocysteine, and neural tube risk in pregnancy",
      sources: ["Gomen", "Pulses", "Teff", "Avocado", "Fortified grains"],
      recommendations: ["People who may become pregnant should discuss folate needs with a qualified clinician"],
    },
    omega3_omega6_balance: {
      description: "Competition between fatty-acid pathways influences inflammatory and cardiovascular signaling",
      enhancers: ["EPA/DHA from fish", "ALA from flaxseed and chia"],
      inhibitors: ["Excessive omega-6 intake without dietary variety"],
      ethiopian_context: ["Niger seed oil and Lake Tana fish are local food contexts for fatty-acid discussions"],
      deficiency: "Dry skin, inflammatory tendency, and possible cardiovascular risk",
      sources: ["Niger seed oil", "Lake fish", "Flaxseed", "Walnuts"],
      recommendations: ["Favor dietary variety and discuss concentrated supplements with a clinician"],
    },
    vitamin_k2_calcium_axis: {
      description: "Vitamin K-dependent proteins help route calcium toward bone and support vascular tissue",
      enhancers: ["Fermented foods", "Vitamin D sufficiency"],
      inhibitors: ["Warfarin", "Some prolonged antibiotic courses"],
      ethiopian_context: ["Ayib and Ergo provide a culturally familiar fermented-dairy context"],
      deficiency: "Bleeding tendency, bone fragility, and impaired calcium handling",
      sources: ["Ayib", "Ergo", "Egg yolks", "Cheese"],
      recommendations: ["Never change warfarin or vitamin K intake patterns without medical guidance"],
    },
  };

  private enzymeSystems = {
    cytochrome_p450: {
      description: "Hepatic Phase I hemoprotein monooxygenases responsible for the oxidative biotransformation of 70-80% of clinical drugs",
      isoforms: ["CYP1A2", "CYP2C9", "CYP2C19", "CYP2D6", "CYP3A4"],
      inducers: ["Rifampin (anti-TB)", "Carbamazepine", "Phenobarbital", "Tobacco polycyclic hydrocarbons"],
      inhibitors: ["Ciprofloxacin", "Erythromycin", "Fluconazole", "Cimetidine"],
      ethiopian_context: [
        "Ruta chalepensis (Tena Adam) contains furanocoumarins that inhibit CYP3A4 and alter clearance of calcium channel blockers and statins",
        "Hagenia abyssinica (Kosso) induces severe mucosal and hepatotoxic stress competing with hepatic clearance mechanisms",
      ],
      scientific_warning: "Concurrent use of traditional botanical extracts with prescription medications may produce either toxic drug accumulation or therapeutic failure.",
    },
    glutathione_antioxidant_system: {
      description: "Primary cellular non-enzymatic antioxidant defense and conjugation system (GSH, GPx, GR)",
      components: ["Glutathione peroxidase (GPx)", "Glutathione reductase (GR)", "Glutathione S-transferase (GST)"],
      cofactors: ["Selenium", "NADPH", "Riboflavin (B2)", "N-acetylcysteine"],
      ethiopian_context: ["Nigella sativa (Tikur Azmud) thymoquinone upregulates hepatic glutathione concentrations and protects against oxidative stress"],
      function: "Neutralizes reactive oxygen species (ROS), lipid hydroperoxides, and electrophilic xenobiotics",
    },
    aldehyde_dehydrogenase: {
      description: "Converts toxic acetaldehyde to acetate during alcohol metabolism",
      isoforms: ["ALDH1A1", "ALDH2"],
      cofactors: ["NAD+", "Thiamine", "Zinc", "Magnesium"],
      ethiopian_context: ["Traditional Tella and Tej fermentation can produce acetaldehyde alongside alcohol"],
      deficiency: "Flushing, nausea, tachycardia, and increased alcohol-related cancer risk",
      recommendations: ["Avoid alcohol if it causes flushing or other adverse symptoms and seek clinical advice"],
    },
    monoamine_oxidase: {
      description: "Breaks down serotonin, dopamine, and norepinephrine in mitochondria",
      isoforms: ["MAO-A", "MAO-B"],
      cofactors: ["FAD"],
      ethiopian_context: ["Khat cathinone has stimulant effects and may interact with psychiatric medicines"],
      deficiency: "Neuropsychiatric effects from altered monoamine metabolism",
      recommendations: ["Do not combine khat with MAO inhibitors or stimulants without specialist advice"],
    },
    antioxidant_enzymes: {
      description: "Superoxide dismutase, catalase, and glutathione peroxidase limit oxidative injury",
      isoforms: ["SOD1", "SOD2", "Catalase", "GPx1", "GPx4"],
      cofactors: ["Copper", "Zinc", "Manganese", "Iron", "Selenium"],
      ethiopian_context: ["Coffee polyphenols and Nigella sativa are culturally relevant antioxidant contexts"],
      deficiency: "Oxidative stress and reduced cellular protection",
      recommendations: ["Prioritize varied whole foods; avoid treating antioxidant findings as permission for concentrated herbs"],
    },
  };

  private hormonalRegulation = {
    insulin_glucagon_axis: {
      description: "Insulin and glucagon coordinate blood glucose use, storage, and release",
      hormones: ["Insulin", "Glucagon"],
      nutrients: ["Chromium", "Magnesium", "Zinc", "Fiber"],
      conditions: ["Diabetes type 2", "Metabolic syndrome", "Reactive hypoglycemia"],
      ethiopian_context: ["Teff-based high-fiber meals may support slower carbohydrate delivery"],
      recommendations: ["Pair carbohydrate meals with protein and fiber; plan fasting with diabetes care teams"],
    },
    thyroid_axis: {
      description: "Hypothalamus-pituitary-thyroid feedback regulates basal metabolism",
      hormones: ["TRH", "TSH", "T4", "T3"],
      nutrients: ["Iodine", "Selenium", "Zinc", "Iron", "Tyrosine"],
      conditions: ["Hypothyroidism", "Hyperthyroidism", "Goitre"],
      ethiopian_context: ["Highland iodine and selenium access can vary by location and diet"],
      recommendations: ["Use iodized salt appropriately and obtain thyroid symptoms or labs through clinical care"],
    },
    adrenal_cortisol_stress: {
      description: "The HPA axis coordinates cortisol response to stress and energy demand",
      hormones: ["CRH", "ACTH", "Cortisol"],
      nutrients: ["Vitamin C", "Magnesium", "Zinc", "Omega-3"],
      conditions: ["Chronic stress", "Burnout", "Anxiety", "Depression"],
      ethiopian_context: ["Coffee ceremonies can provide social connection while caffeine may worsen anxiety or sleep"],
      recommendations: ["Protect sleep and review persistent distress with a qualified mental-health professional"],
    },
    melatonin_sleep_axis: {
      description: "Melatonin and cortisol coordinate circadian rhythm and sleep timing",
      hormones: ["Melatonin", "Cortisol"],
      nutrients: ["Tryptophan", "Vitamin B6", "Magnesium", "Zinc"],
      conditions: ["Insomnia", "Shift work disorder", "Jet lag"],
      ethiopian_context: ["Late coffee or Buna consumption can delay sleep in caffeine-sensitive people"],
      recommendations: ["Limit late caffeine and use a consistent dark sleep environment"],
    },
  };

  private ethiopianSpecificBiochemistry = {
    coffee_metabolism: {
      description: "Caffeine and chlorogenic-acid metabolism affects alertness, sleep, anxiety, and iron absorption",
      key_compounds: ["Caffeine", "Chlorogenic acids", "Trigonelline"],
      ethiopian_context: "Ethiopia is the birthplace of Arabica coffee and Buna is an important social practice.",
      recommendations: ["Prefer morning coffee, monitor sleep and anxiety, and separate coffee from iron-rich meals"],
    },
    khat_biochemistry: {
      description: "Cathinone and cathine have sympathomimetic stimulant effects",
      active_compounds: ["Cathinone", "Cathine", "Norpseudoephedrine"],
      ethiopian_context: "Khat is used socially in Harar, Dire Dawa, and other regions.",
      recommendations: ["Avoid combining khat with stimulants or MAO-inhibiting medicines and seek support if use feels difficult to control"],
    },
    teff_fermentation: {
      description: "Yeast-lactic fermentation of teff injera reduces phytate interference and can improve mineral bioaccessibility",
      ethiopian_context: "Well-fermented injera is a familiar Ethiopian food context.",
      recommendations: ["Choose well-fermented injera and pair pulse dishes with vitamin-C-rich foods"],
    },
    enset_fermentation: {
      description: "Fermented enset foods such as kocho and bulla provide resistant starch and fermentation products",
      ethiopian_context: "Enset is a staple in Sidama, Gurage, and Wolaita communities.",
      recommendations: ["Include kocho within a varied diet and use safe food preparation practices"],
    },
  };

  private signalingSystems = {
    mtor: {
      description: "Nutrient-sensing pathway coordinating protein synthesis, growth, and autophagy",
      signals: ["Amino acids", "Insulin", "Leucine", "Energy status"],
      contexts: ["muscle recovery", "malnutrition", "aging", "metabolic syndrome"],
      recommendations: ["Combine adequate protein with resistance activity and regular recovery"],
    },
    ampk: {
      description: "Cellular energy sensor activated when ATP is low and energy demand rises",
      signals: ["AMP", "Exercise", "Fasting", "Metformin"],
      contexts: ["exercise", "fasting", "glucose regulation", "mitochondrial health"],
      recommendations: ["Interpret exercise and fasting effects within medication and diabetes safety context"],
    },
    pi3k_mapk: {
      description: "Growth and survival signaling networks involved in insulin action, inflammation, and cell proliferation",
      signals: ["Insulin", "Growth factors", "Inflammatory cytokines"],
      contexts: ["insulin resistance", "inflammation", "cancer biology"],
      recommendations: ["These pathways are educational context and cannot determine a diagnosis"],
    },
    nrf2_redox: {
      description: "Redox-response system regulating antioxidant and detoxification gene expression",
      signals: ["Oxidative stress", "Glutathione", "Heme oxygenase", "Thioredoxin"],
      contexts: ["oxidative stress", "inflammation", "environmental exposure"],
      recommendations: ["Use varied whole-food sources and avoid high-dose antioxidant self-treatment"],
    },
  };

  private normalizeQuery(query: string) {
    return query
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private hasAlias(normalized: string, alias: string) {
    return this.queryAliases[alias]?.some((term) => normalized.includes(term)) ?? false;
  }

  private profileMedications(userProfile: UserProfile) {
    return [
      ...(userProfile.medications || []),
      ...(userProfile.wellbeing?.medications || []),
    ].map(String);
  }

  private isFasting(userProfile: UserProfile) {
    return Boolean(userProfile.cultural?.fasting || userProfile.lifestyle?.fasting);
  }

  private getRegion(userProfile: UserProfile) {
    return userProfile.region || userProfile.location?.region;
  }

  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const medications = this.profileMedications(userProfile);
    const fasting = this.isFasting(userProfile) || this.hasAlias(normalized, "fasting");
    const region = this.getRegion(userProfile);

    // 1. Analyze metabolic pathways
    for (const [pathwayKey, pathway] of Object.entries(this.metabolicPathways)) {
      let score = 0;
      const matches: string[] = [];

      if (
        normalized.includes(pathwayKey.replace(/_/g, " ")) ||
        pathway.description.toLowerCase().includes(normalized) ||
        (pathwayKey === "glycolysis" && this.hasAlias(normalized, "glucose")) ||
        (pathwayKey === "krebs_cycle" && this.hasAlias(normalized, "energy")) ||
        (pathwayKey === "neurotransmitter_synthesis" && this.hasAlias(normalized, "sleep"))
      ) {
        score += 35;
        matches.push("direct_pathway_match");
      }

      for (const term of terms) {
        if (pathway.description.toLowerCase().includes(term)) {
          score += 10;
          matches.push(`desc_${term}`);
        }
        if (pathway.conditions.some((c) => c.toLowerCase().includes(term)) || (term === "fatigue" && this.hasAlias(normalized, "energy"))) {
          score += 20;
          matches.push(`condition_${term}`);
        }
        if (pathway.nutrients.some((n) => n.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`nutrient_${term}`);
        }
        if (pathway.ethiopian_context.some((ctx) => ctx.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`ethio_context_${term}`);
        }
      }

      if (userProfile.conditions || userProfile.wellbeing?.conditions) {
        const conditions = [...(userProfile.conditions || []), ...(userProfile.wellbeing?.conditions || [])];
        for (const condition of conditions) {
          if (pathway.conditions.some((c) => c.toLowerCase().includes(condition.toLowerCase()))) {
            score += 25;
            matches.push(`user_condition_${condition}`);
          }
        }
      }

      if (fasting && ["gluconeogenesis", "fatty_acid_oxidation", "ketogenesis"].includes(pathwayKey)) {
        score += 20;
        matches.push("fasting_relevant");
      }

      if (score > 15) {
        results.push({
          type: "metabolic_pathway",
          strand: this.strandName,
          domain: "wellbeing",
          name: pathwayKey.replace(/_/g, " ").toUpperCase(),
          description: pathway.description,
          evidence: `Involved key enzymes: ${pathway.key_enzymes.join(", ")}. Cofactors: ${pathway.nutrients.join(", ")}.`,
          ethiopian_context: pathway.ethiopian_context,
          relevanceScore: Math.min(score / 60, 0.98),
          confidence: 0.88,
          matches,
          recommendations: pathway.recommendations,
          management: pathway.recommendations,
          sources: ["EFCT 2025 Nutritional Biochemistry", "Lehninger Principles of Biochemistry, 8th Ed."],
          details: { fastingRelevant: fasting, region },
        });
      }
    }

    // 2. Analyze nutrient interactions
    for (const [nutrientKey, interaction] of Object.entries(this.nutrientInteractions)) {
      let score = 0;
      const matches: string[] = [];

      if (
        normalized.includes(nutrientKey.replace(/_/g, " ")) ||
        interaction.description.toLowerCase().includes(normalized) ||
        (nutrientKey.startsWith("iron") && this.hasAlias(normalized, "iron")) ||
        (nutrientKey.startsWith("calcium") && this.hasAlias(normalized, "calcium")) ||
        (nutrientKey.startsWith("magnesium") && this.hasAlias(normalized, "magnesium")) ||
        (nutrientKey.startsWith("zinc") && this.hasAlias(normalized, "zinc")) ||
        (nutrientKey.startsWith("b12") && this.hasAlias(normalized, "b12")) ||
        (nutrientKey.startsWith("folate") && this.hasAlias(normalized, "folate")) ||
        (nutrientKey.startsWith("vitamin_d") && this.hasAlias(normalized, "vitamin_d")) ||
        (nutrientKey.startsWith("vitamin_k") && this.hasAlias(normalized, "vitamin_k")) ||
        (nutrientKey.startsWith("omega3") && this.hasAlias(normalized, "omega3"))
      ) {
        score += 35;
        matches.push("nutrient_direct_match");
      }

      for (const term of terms) {
        if (interaction.deficiency.toLowerCase().includes(term)) {
          score += 25;
          matches.push(`deficiency_${term}`);
        }
        if (interaction.sources.some((s) => s.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`source_${term}`);
        }
        if (interaction.ethiopian_context.some((c) => c.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`ethio_food_${term}`);
        }
      }

      if (userProfile.deficiencies) {
        for (const def of userProfile.deficiencies) {
          if (nutrientKey.toLowerCase().includes(def.toLowerCase()) || interaction.deficiency.toLowerCase().includes(def.toLowerCase())) {
            score += 30;
            matches.push(`user_deficiency_${def}`);
          }
        }
      }

      if (score > 15) {
        results.push({
          type: "nutrient_interaction",
          strand: this.strandName,
          domain: "wellbeing",
          name: nutrientKey.replace(/_/g, " ").toUpperCase(),
          description: interaction.description,
          evidence: `Enhancers: ${interaction.enhancers.join(", ")} | Inhibitors: ${interaction.inhibitors.join(", ")}. Primary deficiency manifestations: ${interaction.deficiency}.`,
          ethiopian_context: interaction.ethiopian_context,
          relevanceScore: Math.min(score / 60, 0.96),
          confidence: 0.92,
          matches,
          recommendations: interaction.recommendations,
          management: interaction.recommendations,
          risk_assessment: {
            level: "moderate",
            risk_factors: interaction.inhibitors,
            recommendations: interaction.recommendations,
          },
          sources: ["Ethiopian Public health Institute (EPHI) Micronutrient Assessment", "EFCT 2025 Bioavailability Matrix"],
          details: { fastingRelevant: fasting, region },
        });
      }
    }

    // 3. Analyze enzyme systems & CYP450 if relevant to drugs, herbs, alcohol, or oxidative stress
    if (this.hasAlias(normalized, "liver") || medications.length > 0) {
      const cyp = this.enzymeSystems.cytochrome_p450;
      results.push({
        type: "enzyme_system",
        strand: this.strandName,
        domain: "wellbeing",
        name: "CYTOCHROME P450 HEPATIC METABOLISM",
        description: cyp.description,
        evidence: `Isoforms: ${cyp.isoforms.join(", ")}. Potent inducers: ${cyp.inducers.join(", ")}. Potent inhibitors: ${cyp.inhibitors.join(", ")}.`,
        ethiopian_context: cyp.ethiopian_context,
        relevanceScore: medications.length > 0 ? 0.92 : 0.75,
        confidence: 0.95,
        matches: ["cytochrome_p450_screen"],
        recommendations: [
          "Always verify traditional herbs against prescribed medicines using the Safety Gate",
          "Inform your doctor or clinical pharmacist about all traditional remedies used",
        ],
        severity: "high",
        risk_assessment: {
          level: "high",
          risk_factors: cyp.ethiopian_context,
          recommendations: [
            "Do not start, stop, or change a medicine or concentrated herb based on this finding.",
            "Ask a clinician or pharmacist to review the complete medication and supplement list.",
          ],
        },
        sources: ["Fullas, F. 'Interactions of Ethiopian Herbal Medicines and Prescription Drugs'", "ETM-DB Pharmacopoeia"],
      });
    }

    for (const [enzymeKey, enzyme] of Object.entries(this.enzymeSystems)) {
      const enzymeText = `${enzyme.description} ${enzyme.ethiopian_context.join(" ")}`.toLowerCase();
      const relevant = terms.some((term) => enzymeText.includes(term)) ||
        (enzymeKey === "monoamine_oxidase" && this.hasAlias(normalized, "khat")) ||
        (enzymeKey === "aldehyde_dehydrogenase" && (normalized.includes("alcohol") || normalized.includes("tej") || normalized.includes("tella"))) ||
        (enzymeKey === "antioxidant_enzymes" && (normalized.includes("oxidative") || normalized.includes("antioxidant")));
      if (!relevant || enzymeKey === "cytochrome_p450") continue;
      results.push({
        type: "enzyme_system",
        strand: this.strandName,
        domain: "wellbeing",
        name: enzymeKey.replace(/_/g, " ").toUpperCase(),
        description: enzyme.description,
        evidence: `Cofactors and isoforms: ${[...("cofactors" in enzyme ? enzyme.cofactors : []), ...("isoforms" in enzyme ? enzyme.isoforms : [])].join(", ")}.`,
        ethiopian_context: enzyme.ethiopian_context,
        relevanceScore: 0.78,
        confidence: 0.82,
        matches: ["enzyme_context_match"],
        recommendations: "recommendations" in enzyme ? enzyme.recommendations : ["Review this biochemical context with a qualified clinician."],
        management: "recommendations" in enzyme ? enzyme.recommendations : ["Review this biochemical context with a qualified clinician."],
        severity: enzymeKey === "monoamine_oxidase" ? "high" : "moderate",
        sources: ["Lehninger Principles of Biochemistry, 8th Ed.", "Ethiopian traditional medicine safety context"],
      });
    }

    for (const [hormoneKey, hormone] of Object.entries(this.hormonalRegulation)) {
      const hormoneText = `${hormone.description} ${hormone.conditions.join(" ")} ${hormone.ethiopian_context.join(" ")}`.toLowerCase();
      if (!terms.some((term) => hormoneText.includes(term)) && !(hormoneKey === "insulin_glucagon_axis" && this.hasAlias(normalized, "glucose"))) continue;
      results.push({
        type: "hormonal_axis",
        strand: this.strandName,
        domain: "wellbeing",
        name: hormoneKey.replace(/_/g, " ").toUpperCase(),
        description: hormone.description,
        evidence: `Hormones: ${hormone.hormones.join(", ")}. Nutrients: ${hormone.nutrients.join(", ")}.`,
        ethiopian_context: hormone.ethiopian_context,
        relevanceScore: 0.8,
        confidence: 0.85,
        matches: ["hormonal_context_match"],
        recommendations: hormone.recommendations,
        management: hormone.recommendations,
        severity: "moderate",
        sources: ["Williams Textbook of Endocrinology", "Ethiopian Public health Institute"],
      });
    }

    for (const [signalKey, signal] of Object.entries(this.signalingSystems)) {
      const signalText = `${signal.description} ${signal.signals.join(" ")} ${signal.contexts.join(" ")}`.toLowerCase();
      if (!terms.some((term) => signalText.includes(term)) &&
        !(signalKey === "ampk" && (fasting || this.hasAlias(normalized, "glucose"))) &&
        !(signalKey === "nrf2_redox" && (this.hasAlias(normalized, "liver") || normalized.includes("oxidative")))) continue;
      results.push({
        type: "cell_signaling",
        strand: this.strandName,
        domain: "wellbeing",
        name: signalKey.replace(/_/g, " ").toUpperCase(),
        description: signal.description,
        evidence: `Signals and contexts: ${[...signal.signals, ...signal.contexts].join(", ")}.`,
        relevanceScore: 0.76,
        confidence: 0.8,
        matches: ["signaling_context_match"],
        recommendations: signal.recommendations,
        management: signal.recommendations,
        severity: "low",
        sources: ["Lehninger Principles of Biochemistry, 8th Ed."],
      });
    }

    for (const [key, data] of Object.entries(this.ethiopianSpecificBiochemistry)) {
      const relevant = this.hasAlias(normalized, key.split("_")[0]) ||
        data.description.toLowerCase().split(/\s+/).some((term) => term.length > 4 && normalized.includes(term));
      if (!relevant) continue;
      results.push({
        type: "ethiopian_specific",
        strand: this.strandName,
        domain: "cultural",
        name: key.replace(/_/g, " ").toUpperCase(),
        description: data.description,
        evidence: "Culturally specific biochemical context; not a diagnosis or treatment recommendation.",
        ethiopian_context: data.ethiopian_context,
        relevanceScore: 0.84,
        confidence: 0.8,
        matches: ["ethiopian_context_match"],
        recommendations: data.recommendations,
        management: data.recommendations,
        category: "Domain B",
        severity: "low",
        sources: ["ETM-DB", "Ethiopian food and ethnobotanical literature"],
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async analyzeNutrientGaps(dietLog: Record<string, number>, userProfile: UserProfile): Promise<StrandFinding[]> {
    const findings: StrandFinding[] = [];
    const dailyTargets: Record<string, number> = { iron: 18, calcium: 1000, magnesium: 310, zinc: 8, b12: 2.4, folate: 400 };
    for (const [nutrient, target] of Object.entries(dailyTargets)) {
      if (!(nutrient in dietLog)) continue;
      const intake = Number(dietLog[nutrient] || 0);
      if (intake >= target) continue;
      const percent = Math.round((intake / target) * 100);
      findings.push({
        type: "nutrient_gap",
        strand: this.strandName,
        domain: "wellbeing",
        name: `${nutrient.toUpperCase()} INTAKE GAP`,
        description: `Recorded intake provides approximately ${percent}% of the general reference target; this is a screening signal, not a diagnosis.`,
        relevanceScore: Math.min(1, 1 - intake / target),
        confidence: 0.7,
        matches: [`intake_${intake}`, `target_${target}`],
        recommendations: this.getEthiopianFoodRecommendations(nutrient),
        severity: percent < 25 ? "high" : percent < 67 ? "moderate" : "low",
        details: { intake, target, fasting: this.isFasting(userProfile) },
        sources: ["EFCT 2025 Nutritional Biochemistry"],
      });
    }
    return findings;
  }

  async checkHerbDrugInteractions(herbs: string[], medications: string[]): Promise<StrandFinding[]> {
    if (!herbs.length || !medications.length) return [];
    const herbText = herbs.join(" ").toLowerCase();
    const medicationText = medications.join(" ").toLowerCase();
    const warnings: string[] = [];
    if (herbText.includes("tena adam") || herbText.includes("rue")) warnings.push("Tena Adam may affect CYP3A4 and alter prescription medicine exposure.");
    if (herbText.includes("kosso")) warnings.push("Kosso can cause toxicity and should not be self-combined with medicines.");
    if (herbText.includes("ginger") && /(warfarin|aspirin|anticoagul)/i.test(medicationText)) warnings.push("Concentrated ginger may increase bleeding risk with antiplatelet or anticoagulant medicines.");
    if (!warnings.length) return [];
    return [{
      type: "herb_drug_safety",
      strand: this.strandName,
      domain: "wellbeing",
      name: "HERB-MEDICATION SAFETY GATE",
      description: "A potential herb-medication interaction requires professional review.",
      evidence: warnings.join(" "),
      relevanceScore: 1,
      confidence: 0.9,
      severity: "high",
      safetyAlerts: warnings,
      recommendations: ["Do not start or stop a medicine or concentrated herb without a clinician or pharmacist."],
      sources: ["ETM-DB Pharmacopoeia", "Medication safety rules"],
    }];
  }

  getEthiopianFoodRecommendations(deficiency: string): string[] {
    const map: Record<string, string[]> = {
      iron: ["Teff", "Moringa", "Lentils", "Gomen", "Beef liver"],
      calcium: ["Ayib", "Ergo", "Gomen", "Sesame"],
      magnesium: ["Teff", "Pumpkin seeds", "Niger seeds", "Legumes"],
      zinc: ["Teff", "Roasted chickpeas", "Beef", "Pumpkin seeds"],
      b12: ["Beef liver", "Fish", "Fermented dairy", "Fortified nutritional yeast"],
      folate: ["Gomen", "Pulses", "Teff", "Avocado"],
      omega3: ["Niger seed oil", "Lake fish", "Flaxseed"],
    };
    return map[deficiency.toLowerCase()] || ["Discuss personalized nutrition with a qualified professional."];
  }

  getFastingAdvice(userProfile: UserProfile): string[] {
    if (!this.isFasting(userProfile)) return ["No fasting status was reported."];
    return [
      "Pair plant iron sources with vitamin-C-rich foods and separate coffee or tea from iron-rich meals.",
      "Discuss B12 planning during prolonged vegan fasting periods.",
      "People with diabetes, pregnancy, or medication-dependent conditions should plan fasting with their care team.",
      "Break extended fasts gradually with fluids and easy-to-digest foods.",
    ];
  }
}
