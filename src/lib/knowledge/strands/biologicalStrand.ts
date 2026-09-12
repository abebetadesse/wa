import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile } from "../types";

export class BiologicalKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "biological";

  private queryAliases: Record<string, string[]> = {
    gut: ["gut", "digestion", "bloating", "microbiome", "probiotic", "fermentation", "stomach", "diarrhea", "constipation"],
    oral: ["oral", "mouth", "teeth", "gum", "dental", "breath", "khat"],
    skin: ["skin", "rash", "eczema", "acne", "dermatitis", "itching"],
    genetics: ["genetic", "hereditary", "familial", "inherited", "variant", "mutation"],
    cyp: ["cyp450", "cyp2d6", "cyp2c19", "cyp3a4", "drug metabolism"],
    lactose: ["lactose", "dairy", "milk", "lactase", "intolerance"],
    hemoglobin: ["sickle", "hemoglobin", "thalassemia", "anaemia", "sickle cell"],
    immune: ["immune", "infection", "inflammation", "autoimmune", "allergy", "antibody"],
    vaccine: ["vaccine", "vaccination", "immunization", "immunity"],
    brain: ["brain", "neurotransmitter", "serotonin", "dopamine", "gaba", "cognition", "memory", "focus"],
    sleep: ["sleep", "insomnia", "circadian", "melatonin"],
    mitochondria: ["mitochondria", "energy", "atp", "fatigue", "cellular energy"],
    oxidative: ["oxidative", "antioxidant", "free radical", "ros"],
    cardiovascular: ["heart", "blood pressure", "hypertension", "cardiovascular"],
    respiratory: ["lung", "breathing", "asthma", "copd", "tuberculosis", "tb"],
    renal: ["kidney", "renal", "nephron", "dehydration"],
    reproduction: ["fertility", "pregnancy", "menstrual", "menopause", "andropause"],
    altitude: ["altitude", "highland", "hypoxia", "oxygen", "acclimatization"],
    malaria: ["malaria", "plasmodium", "mosquito", "antimalarial"],
  };

  private microbiomeEcosystems = {
    gut_microbiome: {
      description: "Intestinal microbial ecosystem and gut barrier integrity influencing immune tone, metabolism, and neurotransmitter balance",
      key_species: ["Lactobacillus fermentum", "Lactobacillus plantarum", "Bifidobacterium infantis", "Faecalibacterium prausnitzii"],
      prebiotics: ["Teff soluble fiber", "Enset resistant starch", "Inulin", "Legume oligosaccharides"],
      probiotics: ["Authentic Ersho fermented injera", "Traditional wild fermented Kocho", "Raw buttermilk (Ergo)", "Kefir"],
      conditions: ["Irritable bowel syndrome (IBS)", "Dysbiosis", "Systemic endotoxemia", "Inflammatory bowel disease", "Metabolic syndrome"],
      ethiopian_context: [
        "Injera 4-day ersho backslopping cultivates a rich, stable consortium of lactic acid bacteria and wild yeasts (Saccharomyces, Candida krusei)",
        "Kocho pit-fermentation underground yields high concentrations of butyrate-producing microbes and protective lactic bacilli",
      ],
      recommendations: [
        "Maintain gut microbial diversity through minimally processed traditional fermented staples (Ergo, Kocho, Injera)",
        "Pair high-fiber pulse wots with fermented injera to fuel short-chain fatty acid (SCFA) synthesis",
      ],
    },
    oral_and_skin_microbiome: {
      description: "Symbiotic bacterial communities colonizing the buccal mucosa and epidermal mantle",
      key_species: ["Streptococcus salivarius", "Staphylococcus epidermidis", "Cutibacterium acnes"],
      prebiotics: ["Polyphenolic botanical fibers"],
      probiotics: ["Topical natural microflora"],
      conditions: ["Dental caries", "Periodontitis", "Halitosis", "Eczema", "Atopic dermatitis"],
      ethiopian_context: [
        "Traditional chewing stick (Mefekia from Olea africana / Weira or Clausena anisata) releases antimicrobial polyphenols that inhibit cariogenic Streptococcus mutans",
      ],
      recommendations: [
        "Incorporate traditional antibacterial mefekia plant fibers for natural plaque control",
        "Preserve epidermal lipid barriers with unrefined botanical oils (Sesame, Castor / Gule)",
      ],
    },
  };

  private geneticsAndDiversity = {
    ethiopian_cyp_pharmacogenomics: {
      description: "Unique distribution of Cytochrome P450 polymorphic alleles in Ethiopian populations affecting drug clearance rates",
      key_variants: ["CYP2D6 *1xN (Ultra-rapid metabolizer gene duplications present in up to 29% of Ethiopians)", "CYP2C19 *2 / *3 (Poor metabolizers)", "CYP3A5 *1 (Expressers)"],
      health_implications: [
        "Ultra-rapid CYP2D6 metabolizers convert codeine to morphine dangerously fast, creating elevated toxicity risks",
        "Altered clearance of beta-blockers, tricyclic antidepressants, and neuroleptics",
      ],
      ethiopian_context: [
        "Ethiopian populations harbor among the highest global frequencies of CYP2D6 gene duplication, necessitating cautious pharmacotherapy dosing",
      ],
      recommendations: [
        "Exercise extreme clinical caution with prodrug analgesics like codeine or tramadol",
        "Consider pharmacogenomic testing or therapeutic drug monitoring for psychiatric and cardiac medications",
      ],
    },
    lactose_persistence: {
      description: "Allelic divergence in the MCM6 regulatory region governing adult lactase gene expression",
      key_variants: ["-13910 C/T (European marker)", "-14010 C/G", "-13915 T/G (East African pastoralist marker)"],
      health_implications: ["Lactase persistence in pastoralists vs non-persistence in agrarian adults"],
      ethiopian_context: [
        "Pastoralist traditions have consumed unpasteurized camel and cow milk for millennia, whereas highland agrarian diets historically rely on fermented dairy (Ergo, Ayib) which degrades lactose into lactic acid",
      ],
      recommendations: [
        "If lactose intolerance is suspected, utilize traditional cultured dairy (Ergo, Ayib) where bacterial lactase has already pre-digested the sugar",
      ],
    },
    hemoglobin_variants_and_altitude: {
      description: "Genetic adaptations to lowland malaria pressure and high-altitude chronic hypoxia",
      key_variants: ["HbS (Sickle cell trait)", "Alpha-thalassemia deletions", "EGLN1 and PPARA hypoxia pathway alleles"],
      health_implications: [
        "Heterozygous hemoglobinopathies confer potent natural protection against severe falciparum malaria in lowland basins",
        "Highland Ethiopians possess unique hypoxia adaptations without excessive pathological erythrocytosis compared to Andean populations",
      ],
      ethiopian_context: [
        "Ethiopian highlanders (2,000–3,500m) maintain elevated oxygen saturation via increased cardiac output and microvascular perfusion rather than extreme polycythemia",
      ],
      recommendations: [
        "Screen for sickle trait or G6PD deficiency before initiating oxidative antimalarial drugs like primaquine in lowland populations",
      ],
    },
  };

  private neuroAndImmune = {
    brain_gut_axis: {
      description: "Bidirectional neural, endocrine, and inflammatory communication between the enteric nervous system (ENS) and central nervous system (CNS) via the vagus nerve",
      components: ["Vagus nerve signaling", "Short-chain fatty acids (butyrate, acetate, propionate)", "Enterochromaffin cell serotonin release"],
      conditions: ["Anxiety-associated gastrointestinal distress", "Brain fog", "Depression linked to gut inflammation", "Stress-induced dyspepsia"],
      ethiopian_context: [
        "Traditional Ethiopian recognition of the intimate link between abdominal comfort and emotional state ('Hode basheshugn')",
        "Anti-inflammatory spices in Berbere (Korerima, Ginger, Cloves) possess neuroprotective and gut barrier-sealing carminative properties",
      ],
      recommendations: [
        "Support gut-brain equilibrium with calming carminative infusions (Tena Adam tea, Ginger-Korerima decoctions)",
        "Prioritize gut barrier recovery when addressing chronic anxiety or mood instability",
      ],
    },
    systemic_inflammation_and_immunity: {
      description: "Innate and adaptive immunological surveillance against pathogens, tissue damage, and chronic low-grade inflammation",
      components: ["High-sensitivity C-Reactive Protein (hs-CRP)", "Tumor Necrosis Factor-alpha (TNF-α)", "Interleukin-6 (IL-6)", "Ferritin"],
      conditions: ["Rheumatoid arthritis", "Cardiovascular atherogenesis", "Metabolic syndrome", "Chronic viral infections (HIV, Hepatitis)"],
      ethiopian_context: [
        "Nigella sativa (Tikur Azmud) and Zingiber officinale (Zinjibil) contain active principles that downregulate nuclear factor kappa B (NF-κB) transcription of inflammatory cytokines",
      ],
      recommendations: [
        "Adopt an anti-inflammatory dietary pattern rich in wild brassicas (Gomen), cold-pressed Niger seed oil, and culinary turmeric/black seed",
        "Address chronic occult dental, parasitic, or environmental infections driving silent inflammatory elevation",
      ],
    },
  };

  private immunologyData = {
    immune_response_endemic: {
      description: "Innate and adaptive immune surveillance against infection, tissue injury, and chronic inflammation",
      key_components: ["Neutrophils", "T cells", "B cells", "Antibodies", "Cytokines"],
      conditions: ["Malaria", "Tuberculosis", "HIV", "Allergy", "Autoimmune disease"],
      ethiopian_context: ["Malaria risk varies by altitude and region", "TB prevention depends on ventilation, nutrition, vaccination, and treatment completion"],
      recommendations: ["Seek testing for persistent fever or weight loss", "Complete prescribed antimicrobial courses and keep vaccinations current"],
    },
    vaccine_response: {
      description: "Immune memory and antibody responses shaped by nutrition, infection history, and vaccination",
      key_components: ["Antibodies", "Memory B cells", "T cells"],
      conditions: ["Vaccine-preventable infections", "Malnutrition", "Immunosuppression"],
      ethiopian_context: ["Access and timing of routine vaccination vary by region"],
      recommendations: ["Use local immunization services and seek clinical advice for immunocompromising conditions"],
    },
  };

  private neuroscienceData = {
    cognitive_function: {
      description: "Learning, memory, attention, and executive function depend on sleep, nutrition, and neural signaling",
      key_components: ["DHA/EPA", "Iron", "B12", "Iodine", "Zinc"],
      conditions: ["Cognitive decline", "Brain fog", "Learning difficulty"],
      ethiopian_context: ["Lake fish, niger seed, iodized salt, and iron-rich foods are relevant local contexts"],
      recommendations: ["Protect sleep, maintain social and physical activity, and review persistent cognitive change clinically"],
    },
    sleep_neuroscience: {
      description: "Circadian rhythms and sleep regulation integrate melatonin, adenosine, GABA, and light exposure",
      key_components: ["Melatonin", "GABA", "Adenosine", "Serotonin"],
      conditions: ["Insomnia", "Sleep apnea", "Circadian rhythm disorder"],
      ethiopian_context: ["Late coffee consumption and changing work patterns can disrupt sleep"],
      recommendations: ["Keep a consistent schedule, limit afternoon caffeine, and seek evaluation for loud snoring or daytime sleepiness"],
    },
  };

  private cellBiologyData = {
    mitochondrial_function: {
      description: "Mitochondrial oxidative phosphorylation produces ATP and adapts to exercise, nutrition, and hypoxia",
      key_processes: ["Electron transport", "ATP synthesis", "Mitochondrial biogenesis", "Fission and fusion"],
      conditions: ["Chronic fatigue", "Diabetes", "Heart failure", "Aging"],
      ethiopian_context: ["High-altitude adaptation may involve altered oxygen delivery and mitochondrial demand"],
      recommendations: ["Use gradual activity, adequate food, and clinical assessment for persistent or severe fatigue"],
    },
    oxidative_stress: {
      description: "Reactive oxygen species are balanced by cellular antioxidant and repair systems",
      key_processes: ["Glutathione", "Superoxide dismutase", "Catalase", "DNA repair"],
      conditions: ["Inflammation", "Cardiovascular disease", "Neurodegeneration"],
      ethiopian_context: ["Coffee, spices, vegetables, and legumes provide culturally familiar polyphenol contexts"],
      recommendations: ["Prioritize varied whole foods and avoid high-dose antioxidant self-treatment"],
    },
  };

  private physiologyData = {
    cardiovascular_physiology: {
      description: "Heart and vascular function influenced by blood pressure, salt, activity, lipids, and body composition",
      conditions: ["Hypertension", "Stroke", "Atherosclerosis", "Heart failure"],
      ethiopian_context: ["Urbanization is associated with changing activity and dietary patterns"],
      recommendations: ["Reduce excess salt, stay active, and obtain clinical review for chest pain or persistent high blood pressure"],
    },
    respiratory_physiology: {
      description: "Lung function and gas exchange are affected by air quality, infection, smoking, and altitude",
      conditions: ["Asthma", "COPD", "Pneumonia", "Tuberculosis"],
      ethiopian_context: ["Biomass cooking smoke and high-altitude oxygen pressure are important regional contexts"],
      recommendations: ["Improve ventilation, avoid smoke, and seek care for persistent cough, fever, or breathing difficulty"],
    },
    renal_physiology: {
      description: "Kidneys regulate filtration, fluid balance, electrolytes, and blood pressure",
      conditions: ["Chronic kidney disease", "Kidney stones", "Dehydration", "Acute kidney injury"],
      ethiopian_context: ["Heat and water access vary between arid lowlands and highland communities"],
      recommendations: ["Hydrate appropriately and avoid nephrotoxic herbs or medicines without professional guidance"],
    },
    reproductive_physiology: {
      description: "Reproductive health includes menstrual, pregnancy, fertility, menopausal, and androgen physiology",
      conditions: ["Menstrual disorders", "PCOS", "Infertility", "Pregnancy", "Menopause"],
      ethiopian_context: ["Early antenatal care and culturally respectful family-planning support are important"],
      recommendations: ["Discuss preconception folate, iron, B12, and persistent reproductive symptoms with a qualified clinician"],
    },
  };

  private highAltitudeData = {
    hypoxia_response: {
      description: "Reduced oxygen pressure activates erythropoietin, ventilation, vascular, and cellular hypoxia responses",
      adaptations: ["Ventilatory acclimatization", "Microvascular perfusion", "Erythropoietin signaling"],
      ethiopian_context: ["Highland populations live across substantial elevation gradients including Simien and Bale"],
      recommendations: ["Ascend gradually, hydrate, and seek care for severe headache, confusion, or breathing difficulty"],
    },
  };

  private ethiopianBiologicalContext = {
    malaria: {
      description: "Mosquito-borne Plasmodium infection risk varies by altitude, season, and local ecology",
      diseases: ["Malaria"],
      practices: ["Insecticide-treated nets", "Repellent", "Early fever testing"],
      recommendations: ["Use region-appropriate prevention and seek early testing for fever after exposure"],
    },
    tuberculosis: {
      description: "Airborne Mycobacterium tuberculosis transmission is affected by ventilation, crowding, nutrition, and treatment continuity",
      diseases: ["Tuberculosis"],
      practices: ["Ventilation", "Prompt testing", "Treatment completion"],
      recommendations: ["Persistent cough, night sweats, or unexplained weight loss needs clinical evaluation"],
    },
  };

  private normalizeQuery(query: string) {
    return query.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
  }

  private hasAlias(query: string, alias: string) {
    return this.queryAliases[alias]?.some((term) => query.includes(term)) ?? false;
  }

  private profileConditions(userProfile: UserProfile) {
    return [...(userProfile.conditions || []), ...(userProfile.health?.conditions || [])];
  }

  private isHighland(userProfile: UserProfile) {
    const region = userProfile.region || userProfile.location?.region || "";
    return ["amhara", "tigray", "oromia highlands", "bale", "simien", "arssi", "gurage", "highland"].some((name) =>
      region.toLowerCase().includes(name)
    );
  }

  private isLowland(userProfile: UserProfile) {
    const region = userProfile.region || userProfile.location?.region || "";
    return ["afar", "somali", "gambella", "benishangul", "lowland"].some((name) =>
      region.toLowerCase().includes(name)
    );
  }

  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const userConditions = this.profileConditions(userProfile);
    const highland = this.isHighland(userProfile);
    const lowland = this.isLowland(userProfile);

    // 1. Query Microbiome ecosystems
    for (const [key, item] of Object.entries(this.microbiomeEcosystems)) {
      let score = 0;
      const matches: string[] = [];

      if (normalized.includes("gut") || normalized.includes("digestion") || normalized.includes("stomach") || normalized.includes("bloat") || normalized.includes("diarrhea") || normalized.includes("constipation") || normalized.includes("microbiome")) {
        score += 30;
        matches.push("microbiome_symptom_match");
      }

      for (const term of terms) {
        if (item.conditions.some((c) => c.toLowerCase().includes(term))) {
          score += 20;
          matches.push(`condition_${term}`);
        }
        if (item.ethiopian_context.some((ctx) => ctx.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`ethio_context_${term}`);
        }
      }

      if (userProfile.guthealth?.problems) {
        for (const prob of userProfile.guthealth.problems) {
          if (item.conditions.some((c) => c.toLowerCase().includes(prob.toLowerCase()))) {
            score += 25;
            matches.push(`user_gut_problem_${prob}`);
          }
        }
      }

      if (score > 15) {
        results.push({
          type: "microbiome",
          strand: this.strandName,
          domain: "health",
          name: key.replace(/_/g, " ").toUpperCase(),
          description: item.description,
          evidence: `Symbiotic bacterial taxa: ${item.key_species.join(", ")}. Prebiotic substrates: ${item.prebiotics?.join(", ") || "Fermentable carbohydrates"}.`,
          ethiopian_context: item.ethiopian_context,
          relevanceScore: Math.min(score / 55, 0.96),
          confidence: 0.9,
          matches,
          recommendations: item.recommendations,
          management: item.recommendations,
          sources: ["Ethiopian Microbiome Research Consortium", "Nature Microbiology - Fermented Foods & Human Gut Axis"],
        });
      }
    }

    // 2. Query Genetics and Pharmacogenomics
    for (const [key, item] of Object.entries(this.geneticsAndDiversity)) {
      let score = 0;
      const matches: string[] = [];

      if (normalized.includes("genetic") || normalized.includes("hereditary") || normalized.includes("drug") || normalized.includes("milk") || normalized.includes("altitude") || normalized.includes("malaria")) {
        score += 25;
        matches.push("genetic_topic_match");
      }

      for (const term of terms) {
        if (item.key_variants?.some((v) => v.toLowerCase().includes(term)) || item.description.toLowerCase().includes(term)) {
          score += 15;
          matches.push(`variant_${term}`);
        }
        if (item.ethiopian_context.some((ctx) => ctx.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`ethio_genetics_${term}`);
        }
      }

      if (score > 15) {
        results.push({
          type: "genetic_adaptation",
          strand: this.strandName,
          domain: "health",
          name: key.replace(/_/g, " ").toUpperCase(),
          description: item.description,
          evidence: `Key loci / variants: ${item.key_variants?.join("; ") || "Polygenic adaptation"}.`,
          ethiopian_context: item.ethiopian_context,
          relevanceScore: Math.min(score / 55, 0.94),
          confidence: 0.88,
          matches,
          recommendations: item.recommendations,
          management: item.recommendations,
          sources: ["Addis Ababa University Department of Genetics", "Pharmacogenomics Journal (CYP2D6 Polymorphisms in East Africa)"],
        });
      }
    }

    // 3. Query Neuro-Immune & Brain-Gut Axis
    for (const [key, item] of Object.entries(this.neuroAndImmune)) {
      let score = 0;
      const matches: string[] = [];

      if (this.hasAlias(normalized, "brain") || this.hasAlias(normalized, "immune") || normalized.includes("stress") || normalized.includes("pain")) {
        score += 30;
        matches.push("neuro_immune_match");
      }

      for (const term of terms) {
        if (item.conditions.some((c) => c.toLowerCase().includes(term))) {
          score += 20;
          matches.push(`condition_${term}`);
        }
        if (item.ethiopian_context.some((ctx) => ctx.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`ethio_context_${term}`);
        }
      }

      if (score > 15) {
        results.push({
          type: "neuro_immunology",
          strand: this.strandName,
          domain: "cross-strand",
          name: key.replace(/_/g, " ").toUpperCase(),
          description: item.description,
          evidence: `Mediators: ${item.components.join(", ")}.`,
          ethiopian_context: item.ethiopian_context,
          relevanceScore: Math.min(score / 55, 0.95),
          confidence: 0.91,
          matches,
          recommendations: item.recommendations,
          management: item.recommendations,
          sources: ["Frontiers in Immunology", "Lancet Psychiatry - Psychoneuroimmunology in African Populations"],
        });
      }
    }

    const datasets: Array<[string, {
      description: string;
      conditions?: string[];
      ethiopian_context?: string[];
      recommendations?: string[];
      key_components?: string[];
      key_processes?: string[];
      adaptations?: string[];
      diseases?: string[];
      practices?: string[];
    }]> = [
      ...Object.entries(this.immunologyData),
      ...Object.entries(this.neuroscienceData),
      ...Object.entries(this.cellBiologyData),
      ...Object.entries(this.physiologyData),
    ];

    for (const [key, item] of datasets) {
      let score = 0;
      const matches: string[] = [];
      const text = `${item.description} ${(item.conditions || []).join(" ")} ${(item.ethiopian_context || []).join(" ")}`.toLowerCase();
      const alias = key.includes("micro") ? "gut" : key.includes("sleep") ? "sleep" : key.includes("cardio") ? "cardiovascular" : key.includes("respiratory") ? "respiratory" : key.includes("renal") ? "renal" : key.includes("reproductive") ? "reproduction" : key.includes("mitochond") ? "mitochondria" : key.includes("oxidative") ? "oxidative" : key.includes("immune") || key.includes("vaccine") ? "immune" : "brain";
      if (normalized.includes(key.replace(/_/g, " ")) || this.hasAlias(normalized, alias)) {
        score += 30;
        matches.push("biological_topic_match");
      }
      for (const term of terms) {
        if (text.includes(term)) {
          score += 10;
          matches.push(`context_${term}`);
        }
      }
      for (const condition of userConditions) {
        if ((item.conditions || []).some((value) => value.toLowerCase().includes(condition.toLowerCase()))) {
          score += 20;
          matches.push(`user_condition_${condition}`);
        }
      }
      if (score <= 15) continue;
      results.push({
        type: key.includes("micro") ? "microbiome" : key.includes("physio") ? "physiology" : key.includes("neuro") ? "neuroscience" : "cell_immunology",
        strand: this.strandName,
        domain: key.includes("ethiopian") ? "cultural" : "health",
        name: key.replace(/_/g, " ").toUpperCase(),
        description: item.description,
        evidence: `Relevant biological factors: ${(item.key_components || item.key_processes || item.adaptations || item.diseases || []).join(", ") || "multisystem context"}.`,
        ethiopian_context: item.ethiopian_context || [],
        relevanceScore: Math.min(score / 60, 0.94),
        confidence: 0.84,
        matches,
        recommendations: item.recommendations || [],
        management: item.recommendations || [],
        sources: ["Molecular Biology of the Cell", "Guyton and Hall Textbook of Medical Physiology", "EPHI health guidance"],
        category: "Domain A",
        severity: "moderate",
      });
    }

    if (highland || this.hasAlias(normalized, "altitude")) {
      const item = this.highAltitudeData.hypoxia_response;
      results.push({
        type: "high_altitude_adaptation",
        strand: this.strandName,
        domain: "health",
        name: "HYPOXIA RESPONSE",
        description: item.description,
        evidence: `Adaptations: ${item.adaptations.join(", ")}.`,
        ethiopian_context: item.ethiopian_context,
        relevanceScore: highland ? 0.95 : 0.78,
        confidence: 0.88,
        matches: [highland ? "highland_resident" : "altitude_query"],
        recommendations: item.recommendations,
        management: item.recommendations,
        severity: "moderate",
        sources: ["High Altitude Medicine & Biology"],
      });
    }

    if (lowland || this.hasAlias(normalized, "malaria") || this.hasAlias(normalized, "respiratory")) {
      for (const [key, item] of Object.entries(this.ethiopianBiologicalContext)) {
        results.push({
          type: "ethiopian_biological_context",
          strand: this.strandName,
          domain: "cultural",
          name: key.replace(/_/g, " ").toUpperCase(),
          description: item.description,
          evidence: `Relevant diseases: ${item.diseases.join(", ")}; prevention: ${item.practices.join(", ")}.`,
          ethiopian_context: "Region-sensitive Ethiopian biological context",
          relevanceScore: 0.82,
          confidence: 0.8,
          matches: [lowland ? "lowland_region" : "query_match"],
          recommendations: item.recommendations,
          management: item.recommendations,
          severity: "moderate",
          sources: ["EPHI infectious disease guidance"],
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async assessGeneticRisk(userProfile: UserProfile): Promise<StrandFinding[]> {
    const findings: StrandFinding[] = [];
    const medications = userProfile.medications || userProfile.health?.medications || [];
    if (medications.some((medication) => /codeine|tramadol/i.test(String(medication)))) {
      findings.push({
        type: "pharmacogenomic_safety",
        strand: this.strandName,
        domain: "health",
        name: "CYP2D6 MEDICATION REVIEW",
        description: "Variation in drug-metabolizing enzymes can change opioid exposure; ancestry alone cannot determine an individual genotype.",
        evidence: "Medication list contains a CYP2D6-relevant prodrug.",
        relevanceScore: 0.95,
        confidence: 0.86,
        severity: "high",
        safetyAlerts: ["Discuss codeine or tramadol dosing with a clinician; do not change it independently."],
        recommendations: ["Consider pharmacogenomic testing or therapeutic monitoring when clinically appropriate"],
        sources: ["Clinical Pharmacogenetics Implementation Consortium"],
      });
    }
    return findings;
  }

  getMicrobiomeAdvice(symptoms: string[], diet: string[]): string[] {
    const text = `${symptoms.join(" ")} ${diet.join(" ")}`.toLowerCase();
    const advice = ["Increase dietary fiber gradually", "Choose safe fermented foods such as injera, kocho, yogurt, or Ergo", "Limit highly processed sugars"];
    if (/diarrhea|vomit|blood|fever/.test(text)) advice.push("Seek clinical advice rather than self-treating persistent or severe gastrointestinal symptoms");
    return advice;
  }

  getAltitudeAcclimatisationAdvice(destinationAltitude: number): string[] {
    if (destinationAltitude <= 2500) return ["No special altitude precautions are usually needed at this elevation; consider individual health factors."];
    return ["Ascend gradually above 2,500m", "Hydrate and avoid alcohol or sedatives", "Watch for headache, nausea, dizziness, or confusion", "Descend and seek care if symptoms worsen"];
  }

  getEndemicDiseasePrevention(region: string): string[] {
    const normalized = region.toLowerCase();
    if (/afar|somali|gambella|lowland/.test(normalized)) return ["Use insecticide-treated nets and repellent", "Seek early testing for fever", "Avoid stagnant water where possible"];
    return ["Improve ventilation to reduce respiratory transmission", "Keep vaccinations current", "Seek evaluation for persistent cough, fever, or weight loss"];
  }
}
