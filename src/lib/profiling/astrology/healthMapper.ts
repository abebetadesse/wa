import { AspectType, CelestialBody } from "../types";

export interface PlanetaryhealthInfo {
  ethiopianName: string;
  ethiopianInterpretation: string;
  organs: string[];
  physiologicalSystems: string[];
  potentialVulnerabilities: string[];
  vitalityStrengths: string[];
}

export const PLANETARY_health_MAP: Record<CelestialBody, PlanetaryhealthInfo> = {
  Sun: {
    ethiopianName: "Shems / Tsehay (ፀሐይ)",
    ethiopianInterpretation: "Represents primordial life force ('Hiwot'), sovereign vitality, and the central heart axis of the kingdom.",
    organs: ["Heart", "Spine / Vertebral column", "Eyes (Right eye in men, Left in women)", "Thymus gland"],
    physiologicalSystems: ["Cardiovascular circulation", "Cellular energy metabolism", "Autonomic equilibrium"],
    potentialVulnerabilities: ["Cardiovascular strain", "Upper back stiffness", "Solar heat intolerance", "Adrenal exhaustion from overexertion"],
    vitalityStrengths: ["High recuperative vitality", "Radiant immune stamina", "Strong physical presence", "Rapid recovery from acute fatigue"],
  },
  Moon: {
    ethiopianName: "Qemer / Werh (ጨረቃ)",
    ethiopianInterpretation: "Governs tidal somatic rhythms, mucosal sanctuary, maternal nurturing, and lymphatic ebb and flow.",
    organs: ["Stomach / Gastric mucosa", "Lymph nodes & ducts", "Breasts / Mammary glands", "Brain meninges"],
    physiologicalSystems: ["Digestive secretion", "Fluid balance & lymphatic drainage", "Circadian sleep-wake cycle", "Reproductive rhythm"],
    potentialVulnerabilities: ["Gastric hyperacidity or bloating", "Fluid retention / edema", "Sleep cycle disturbances", "Emotional somatization in gut"],
    vitalityStrengths: ["Sensitive somatic intuition", "Effective tissue hydration", "Deep emotional resilience", "Natural instinct for protective rest"],
  },
  Mercury: {
    ethiopianName: "Utarid (ሜርኩሪ)",
    ethiopianInterpretation: "Governs cognitive coordination, the breath of speech, neural agility, and peripheral messaging.",
    organs: ["Central & Peripheral Nervous System", "Lungs & Bronchi", "Vocal cords", "Hands & Shoulders"],
    physiologicalSystems: ["Neurotransmission", "Respiratory air exchange", "Sensory motor processing", "Thyroid coordination"],
    potentialVulnerabilities: ["Nervous tension & restlessness", "Bronchial sensitivity / cough", "Mental exhaustion / overthinking", "Insomnia from active racing mind"],
    vitalityStrengths: ["Rapid neuromuscular reflexes", "Sharp cognitive focus", "Adaptable physiological responses", "Excellent fine motor coordination"],
  },
  Venus: {
    ethiopianName: "Zuhara (ቬነስ)",
    ethiopianInterpretation: "Governs internal biological harmony, renal filtration balance, venous circulation, and cellular beauty.",
    organs: ["Kidneys & Adrenal cortex", "Parathyroid glands", "Venous vascular tree", "Skin & Dermal collagen"],
    physiologicalSystems: ["Renal fluid & electrolyte filtration", "Endocrine hormone harmony", "Blood sugar regulation", "Sensory aesthetics"],
    potentialVulnerabilities: ["Renal gravel / mild filtration sluggishness", "Sugar cravings", "Skin allergies / dermatitis", "Hormonal fluctuations"],
    vitalityStrengths: ["Refined biochemical balance", "Resilient skin regeneration", "Calm autonomic recovery", "Capacity for bodily relaxation"],
  },
  Mars: {
    ethiopianName: "Merikh (ማርስ)",
    ethiopianInterpretation: "Represents warrior energy, tied to the Ethiopian 'Wane' military vitality, metabolic heat, and muscular dynamism.",
    organs: ["Muscles", "Adrenal medullas", "Erythrocytes / Red blood cells", "Gallbladder & Bile ducts"],
    physiologicalSystems: ["Musculoskeletal motor power", "Inflammatory response & phagocytosis", "Iron absorption", "Sympathetic nervous activation"],
    potentialVulnerabilities: ["Acute fevers", "Inflammatory flare-ups", "Muscular sprains & tendon strain", "Biliary heat / gastric burning"],
    vitalityStrengths: ["Formidable muscular endurance", "High metabolic core temperature", "Bold physical initiative", "Rapid tissue repair in wounds"],
  },
  Jupiter: {
    ethiopianName: "Mushtari (ጁፒተር)",
    ethiopianInterpretation: "The principle of expansive benevolence, metabolic growth, liver resilience, and spiritual optimism.",
    organs: ["Liver", "Arterial circulation", "Hips & Pelvic girdle", "Posterior pituitary"],
    physiologicalSystems: ["Hepatic glycogen & lipid synthesis", "Detoxification pathways (Phase I & II)", "Arterial blood distribution"],
    potentialVulnerabilities: ["Hepatic congestion / fatty liver tendency", "Overindulgence in heavy wots", "Circulatory sluggishness from rich diets"],
    vitalityStrengths: ["Broad constitutional robustness", "Exceptional liver regenerative capacity", "Upbeat mood fostering immune vitality"],
  },
  Saturn: {
    ethiopianName: "Zuhal (ሳተርን)",
    ethiopianInterpretation: "The principle of stone, skeletal endurance, ancestral boundary, discipline, and cooling contraction.",
    organs: ["Skeletal framework & Bones", "Joint cartilage & Ligaments", "Teeth", "Skin epidermis & Spleen"],
    physiologicalSystems: ["Structural mineral integrity", "Calcium & phosphate homeostasis", "Collagen density", "Chronic immune regulation"],
    potentialVulnerabilities: ["Joint stiffness / osteoarthritis", "Dry skin & brittle nails", "Cold sensitivity during Bega winds", "Chronic muscular tension"],
    vitalityStrengths: ["Long-term longevity and stamina", "High pain threshold", "Structural endurance", "Exceptional self-discipline in diet"],
  },
  Uranus: {
    ethiopianName: "Uranos (ዩራኑስ)",
    ethiopianInterpretation: "The lightning pulse, spontaneous insight, electric nerve pathways, and bio-electric awakening.",
    organs: ["Electrical conduction system of the heart", "Shins & Calves", "Neural synapses", "Circulatory micro-capillaries"],
    physiologicalSystems: ["Neuro-electric pacing", "Cardiac rhythm generation", "Peripheral autonomic pulses"],
    potentialVulnerabilities: ["Arrhythmia / heart flutter under stress", "Sudden muscle spasms / cramps", "Nerve hyperexcitability"],
    vitalityStrengths: ["Electrifying intuitive awareness", "Capacity for rapid cellular recalibration", "Breakthrough recovery from plateaus"],
  },
  Neptune: {
    ethiopianName: "Neptun (ኔፕቱን)",
    ethiopianInterpretation: "The oceanic mystical plane, lymphatic fluids, dream state neurochemistry, and subtle immune porousness.",
    organs: ["Pineal gland", "Lymphatic interstitial fluids", "Feet & Plantar arches", "Immune helper T-cells"],
    physiologicalSystems: ["Pineal melatonin secretion", "Immune boundary recognition", "Subconscious dream processing"],
    potentialVulnerabilities: ["High environmental or chemical sensitivity", "Unusual drug responses / low tolerance", "Sluggish lymphatic circulation"],
    vitalityStrengths: ["Deep spiritual and restorative sleep", "Subtle psychosomatic attunement", "Intuitive connection to herbal resonance"],
  },
  Pluto: {
    ethiopianName: "Pluto (ፕሉቶ)",
    ethiopianInterpretation: "The deep underworld of regeneration, cellular apoptosis, hormonal metamorphosis, and primal rejuvenation.",
    organs: ["Reproductive organs", "Excretory colon", "Prostate / Uterus", "Bone marrow stem cells"],
    physiologicalSystems: ["Cellular apoptosis & autophagic clearance", "Endocrine deep cycles", "Excretory toxin elimination"],
    potentialVulnerabilities: ["Pelvic congestion", "Sluggish intestinal elimination", "Suppressed emotional toxicity causing flare-ups"],
    vitalityStrengths: ["Profound cellular regenerative power", "Ability to rebuild vitality after deep illness", "Unshakable biological survival will"],
  },
  Ascendant: {
    ethiopianName: "Mesreq (መሥራቅ - The Rising Horizon)",
    ethiopianInterpretation: "The physical threshold of birth, immediate facial and constitutional appearance, and primary bodily mask.",
    organs: ["Head", "Facial structure", "Primary neuro-sensory gateways"],
    physiologicalSystems: ["General constitutional temperament", "Surface bio-field vitality", "Immediate metabolic reaction style"],
    potentialVulnerabilities: ["Tension headaches", "Facial sinus congestion", "Immediate physical reactions to sudden weather shifts"],
    vitalityStrengths: ["Instinctive bodily self-preservation", "Vibrant physical aura", "Immediate adaptation to new environments"],
  },
  Midheaven: {
    ethiopianName: "Wuste Semay (ውስተ ሰማይ - Culmination Point)",
    ethiopianInterpretation: "The zenith of purpose, outward vocational exertion, standing stature, and endurance in the public sphere.",
    organs: ["Knees", "Spinal axis", "Major postural muscles"],
    physiologicalSystems: ["Postural biomechanics", "Occupational stress response", "Long-range adrenal stamina"],
    potentialVulnerabilities: ["Occupational burnout", "Knee strain from long standing or travel", "Postural fatigue"],
    vitalityStrengths: ["Commanding physical resilience under vocational responsibility", "Steady stamina over decades"],
  },
};

export const HOUSE_health_MAP: Record<number, { bodyParts: string[]; healthMeaning: string; dailyRoutineImpact: string }> = {
  1: {
    bodyParts: ["Head", "Brain hemispheres", "Face", "General physical constitution"],
    healthMeaning: "Primary constitutional vitality, self-image, bodily armor, and raw physical presence.",
    dailyRoutineImpact: "Sets the baseline energy rhythm upon waking and the body's immediate sensory receptivity.",
  },
  2: {
    bodyParts: ["Throat", "Neck", "Thyroid gland", "Vocal cords", "Oral mucosa"],
    healthMeaning: "Nutrient assimilation, metabolic energy storage, voice resonance, and biochemical grounding.",
    dailyRoutineImpact: "Governs dietary intake habits, chew pace, and steady sustained stamina through the workday.",
  },
  3: {
    bodyParts: ["Shoulders", "Arms", "Hands", "Lungs & Respiratory bronchi", "Peripheral nerves"],
    healthMeaning: "Locomotion, short-distance physical mobility, cognitive agility, and breath coordination.",
    dailyRoutineImpact: "Impacts daily desk posture, typing strain, daily sensory commute, and breathing patterns.",
  },
  4: {
    bodyParts: ["Chest", "Breasts", "Epigastric stomach", "Internal core sanctuary"],
    healthMeaning: "Emotional safety, visceral digestion, ancestry-rooted bodily memory, and restful sanctuary.",
    dailyRoutineImpact: "Governs evening unwinding, domestic meal environments, and feeling safe in one's home space.",
  },
  5: {
    bodyParts: ["Heart", "Spine & Upper back", "Vital warmth", "Sperm / Ova reproductive vitality"],
    healthMeaning: "Joyful vitality, creative expression, cardiovascular pulse, and recreational play.",
    dailyRoutineImpact: "Governs physical exercise enthusiasm, cardiovascular workouts, and artistic or playful recreation.",
  },
  6: {
    bodyParts: ["Digestive tract", "Small & Large intestines", "Abdominal organs", "Immune surveillance"],
    healthMeaning: "Daily health habits, digestive hygiene, workplace ergonomics, and micro-nutrient assimilation.",
    dailyRoutineImpact: "The central house of daily health routines: meal timings, bowel regularity, and stress mitigation at work.",
  },
  7: {
    bodyParts: ["Kidneys & Renal system", "Lower back (Lumbar)", "Adrenal balance", "Buttocks"],
    healthMeaning: "Interpersonal nervous equilibrium, balance between self and other, and renal fluid balance.",
    dailyRoutineImpact: "Governs relational stress management, emotional boundaries with partners, and lumbar ergonomics.",
  },
  8: {
    bodyParts: ["Reproductive organs", "Excretory organs", "Prostate / Pelvic bowl", "Colon"],
    healthMeaning: "Deep tissue regeneration, detoxification, hormonal cycles, and psychological release of trauma.",
    dailyRoutineImpact: "Governs deep sleep detoxification, bowel evacuation, sexual wellness, and processing intense emotions.",
  },
  9: {
    bodyParts: ["Hips", "Thighs & Femur", "Sciatic nerve", "Liver lobes"],
    healthMeaning: "Expansive movement, outdoor nature endurance, philosophical resilience, and high-altitude adaptation.",
    dailyRoutineImpact: "Governs long-distance walking/hiking, mental horizons, pilgrimages to monasteries/sacred springs, and mental optimism.",
  },
  10: {
    bodyParts: ["Knees & Patella", "Skeletal joints", "Skin epidermis", "Postural spine"],
    healthMeaning: "Career resilience, public endurance, structural posture, and occupational stress tolerance.",
    dailyRoutineImpact: "Governs work stamina, managing deadline stress, preventing postural collapse, and career pacing.",
  },
  11: {
    bodyParts: ["Calves", "Shins", "Ankles & Achilles tendons", "Peripheral circulatory network"],
    healthMeaning: "Community health support, collective stamina, visionary energy, and bio-electric flow.",
    dailyRoutineImpact: "Governs participation in social mahber/idir community circles, group wellness walks, and shared collective meals.",
  },
  12: {
    bodyParts: ["Feet", "Toes", "Lymphatic fluid network", "Pineal gland & Deep sleep neurochemistry"],
    healthMeaning: "Subconscious somatic memory, spiritual retreat, dream life, and subtle immune sanctuary.",
    dailyRoutineImpact: "Governs meditation, pre-sleep ritual, quiet solitude, prayer, and protection against over-stimulation.",
  },
};

export function getPlanetaryhealthAssociations(planet: CelestialBody): PlanetaryhealthInfo {
  return PLANETARY_health_MAP[planet] || PLANETARY_health_MAP.Sun;
}

export function getHousehealthMapping(houseNum: number) {
  return HOUSE_health_MAP[houseNum] || HOUSE_health_MAP[1];
}

export function getAspecthealthImpact(
  p1: CelestialBody,
  p2: CelestialBody,
  aspect: AspectType
): { healthImpact: string; psychosomaticIndicator: string } {
  if (aspect === "trine" || aspect === "sextile") {
    return {
      healthImpact: `Harmonious physiological synergy between ${p1} and ${p2}: supports steady cellular vitality and smooth autonomic recuperation.`,
      psychosomaticIndicator: `Ease in emotional self-regulation; somatic stress dissipates naturally without internal organ stagnation.`,
    };
  }

  if (aspect === "conjunction") {
    return {
      healthImpact: `Intensified metabolic fusion of ${p1} and ${p2}: powerful energetic output concentrated in shared organ zones.`,
      psychosomaticIndicator: `Heightened conscious awareness of bodily signals; requires intentional pacing to avoid over-stimulation.`,
    };
  }

  if (aspect === "square") {
    return {
      healthImpact: `Frictional tension between ${p1} and ${p2}: elevated risk of acute inflammation, muscle tightening, or periodic energy spikes.`,
      psychosomaticIndicator: `Tendency to store emotional frustration in smooth muscles and vascular tone; mindful breathing and cooling herbs recommended.`,
    };
  }

  // Opposition
  return {
    healthImpact: `Polarized balance between ${p1} and ${p2}: fluctuating vitality levels; organ systems pull in opposing directions requiring conscious equilibrium.`,
    psychosomaticIndicator: `Sensitivity to interpersonal stress causing somatic shifts in digestion or blood pressure; regular grounding routines essential.`,
  };
}
