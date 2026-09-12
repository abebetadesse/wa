import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile, DomainType } from "../types";

/**
 * Enhanced Astrological Knowledge Strand
 *
 * Integrates:
 * - Ethiopian AwudeNegest (ዓውደ ነገሥት) – 16 circular tables, Ge'ez letter numerology
 * - Western zodiac with health associations (12 signs, planets, houses)
 * - Humoral/elemental constitution (Earth, Water, Air, Fire)
 * - Planetary health associations (organs, conditions, recommendations)
 * - House system health mapping (12 houses → body parts, life areas)
 * - Seasonal guidance (Ethiopian seasons Kiremt, Bega, Belg)
 * - Lunar guidance (phases, health cycles, Ethiopian lunar calendar)
 * - Däbtära healing scroll wisdom (celestial botanical prescriptions)
 * - Naming & Ge'ez identity analysis (name meanings, numerological values)
 * - Ethiopian zodiac (13-month calendar based)
 * - Cross‑strand linking (Cultural, Dietary, Psychological, Mechanism Discovery)
 * - Domain B (cultural/reflective) with explicit disclaimers
 * - Evidence‑weighted confidence, severity, and cultural relevance
 * - User‑specific profiling (birth date, time, place, name)
 */
export class AstrologicalKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "astrological";
  readonly domain: DomainType = "cultural";

  // --- Alias registry for query expansion ---
  private queryAliases: Record<string, string[]> = {
    // Ethiopian astrology
    awude: ["awude", "awde", "negast", "አውደ", "ነገሥት", "ዓውደ"],
    dabtara: ["dabtara", "debtera", "healing scroll", "kitabe", "ge'ez", "ጥበብ", "ደብተራ"],
    // Elements/humours
    earth: ["earth", "afere", "melancholic", "አፈሬ", "መሬት"],
    water: ["water", "maye", "phlegmatic", "ማዬ", "ውሃ"],
    air: ["air", "nawaye", "sanguine", "ነፋዬ", "ንፋስ"],
    fire: ["fire", "isete", "choleric", "እሳቴ", "እሳት"],
    // Zodiac signs (Ethiopian and Western)
    aries: ["aries", "አሪስ", "መስከረም"],
    taurus: ["taurus", "ታውረስ", "ጥቅምት"],
    gemini: ["gemini", "ጀሚኒ", "ህዳር"],
    cancer: ["cancer", "ካንሰር", "ታህሳስ"],
    leo: ["leo", "ሊዮ", "ጥር"],
    virgo: ["virgo", "ቪርጎ", "የካቲት"],
    libra: ["libra", "ሊብራ", "መጋቢት"],
    scorpio: ["scorpio", "ስኮርፒዮ", "ሚያዝያ"],
    sagittarius: ["sagittarius", "ሳጅታሪየስ", "ግንቦት"],
    capricorn: ["capricorn", "ካፕሪኮርን", "ሰኔ"],
    aquarius: ["aquarius", "አኳሪየስ", "ሐምሌ"],
    pisces: ["pisces", "ፒሴስ", "ነሐሴ"],
    // Planets
    sun: ["sun", "tsehay", "ጸሀይ", "vitality"],
    moon: ["moon", "ware", "ወርህ", "emotion"],
    mercury: ["mercury", "ሜርኩሪ", "communication"],
    venus: ["venus", "ቬኑስ", "love", "relationship"],
    mars: ["mars", "ማርስ", "energy", "inflammation"],
    jupiter: ["jupiter", "ጁፒተር", "expansion", "wealth"],
    saturn: ["saturn", "ሳተርን", "discipline", "bones"],
    // Seasons
    kiremt: ["kiremt", "rains", "መስከረም", "ጥቅምት"],
    bega: ["bega", "dry", "በጋ", "harvest"],
    belg: ["belg", "short rains", "በልግ"],
    // Lunar
    lunar: ["lunar", "moon", "phase", "ወርህ", "ጨረቃ"],
    // Naming
    name: ["name", "ge'ez", "amharic", "meaning", "የስም", "ትርጉም"],
    // Houses
    house: ["house", "home", "astrological", "ቤት", "ሀውስ"],
  };

  // -------------------------------------------------------------------------
  // AWUDE NEGEST (ETHIOPIAN ASTROLOGY) – 16 CIRCULAR TABLES
  // -------------------------------------------------------------------------
  private awudeNegestCircles = {
    circle_1: {
      number: 1,
      name: "Circle of the Sun (ትሱያ)",
      geEz_symbol: "ሀ",
      description: "Light, life, vitality, and divine blessing",
      element: "Fire",
      health_associations: ["Heart", "Spine", "Vitality", "Immune system"],
      emotional_traits: ["Optimistic", "Generous", "Creative", "Leadership"],
      life_areas: ["health", "Career", "Leadership", "Life purpose"],
      recommendations: [
        "Focus on cardiovascular health",
        "Engage in creative and leadership activities",
        "Balance solar energy with rest",
      ],
    },
    circle_2: {
      number: 2,
      name: "Circle of the Moon (ወርህ)",
      geEz_symbol: "ለ",
      description: "Emotions, intuition, cycles, and nurturing",
      element: "Water",
      health_associations: ["Stomach", "Breasts", "Lymphatic system", "Reproductive health"],
      emotional_traits: ["Intuitive", "Nurturing", "Empathetic", "Mood-driven"],
      life_areas: ["Family", "Home", "Emotional well-being", "Relationships"],
      recommendations: [
        "Practice emotional regulation and mindfulness",
        "Support reproductive health with balanced nutrition",
        "Create a nurturing home environment",
      ],
    },
    circle_3: {
      number: 3,
      name: "Circle of Communication (መልክ)",
      geEz_symbol: "ሐ",
      description: "Expression, intellect, and social connection",
      element: "Air",
      health_associations: ["Lungs", "Nervous system", "Thyroid", "Vocal cords"],
      emotional_traits: ["Communicative", "Intellectual", "Adaptable", "Curious"],
      life_areas: ["Education", "Relationships", "Career", "Communication"],
      recommendations: [
        "Practice deep breathing exercises",
        "Support thyroid health with iodine-rich foods",
        "Engage in stimulating conversation and learning",
      ],
    },
    circle_4: {
      number: 4,
      name: "Circle of the Ancestors (አባቶች)",
      geEz_symbol: "መ",
      description: "Heritage, roots, and ancestral wisdom",
      element: "Earth",
      health_associations: ["Bones", "Joints", "Skin", "Hair", "Teeth"],
      emotional_traits: ["Grounded", "Traditional", "Loyal", "Patient"],
      life_areas: ["Family", "Heritage", "Property", "Foundations"],
      recommendations: [
        "Support bone health with calcium and vitamin D",
        "Connect with family history and heritage",
        "Build strong foundations in life",
      ],
    },
    circle_5: {
      number: 5,
      name: "Circle of Creativity (ፍርድ)",
      geEz_symbol: "ሠ",
      description: "Creative expression, children, and joy",
      element: "Fire",
      health_associations: ["Heart", "Circulation", "Reproductive system"],
      emotional_traits: ["Creative", "Playful", "Spontaneous", "Generous"],
      life_areas: ["Children", "Creative arts", "Joy", "Romance"],
      recommendations: [
        "Engage in creative activities",
        "Support cardiovascular health with exercise",
        "Maintain a joyful, playful outlook",
      ],
    },
    circle_6: {
      number: 6,
      name: "Circle of Service (ሰብአ)",
      geEz_symbol: "ረ",
      description: "health, daily routine, and service to others",
      element: "Earth",
      health_associations: ["Digestive system", "Intestines", "Daily routine", "Work"],
      emotional_traits: ["Dutiful", "Orderly", "Responsible", "Caring"],
      life_areas: ["health", "Work", "Daily habits", "Service"],
      recommendations: [
        "Maintain a healthy daily routine",
        "Support digestive health with fermented foods",
        "Engage in meaningful work and service",
      ],
    },
    circle_7: {
      number: 7,
      name: "Circle of Partnership (ስንቁ)",
      geEz_symbol: "ሰ",
      description: "Relationships, marriage, and partnerships",
      element: "Air",
      health_associations: ["Kidneys", "Adrenals", "Hormonal balance"],
      emotional_traits: ["Collaborative", "Diplomatic", "Fair", "Aesthetic"],
      life_areas: ["Relationships", "Marriage", "Business partnerships"],
      recommendations: [
        "Support adrenal health with stress management",
        "Cultivate healthy partnerships",
        "Maintain hormonal balance with balanced diet",
      ],
    },
    circle_8: {
      number: 8,
      name: "Circle of Transformation (ቅድስት)",
      geEz_symbol: "ቀ",
      description: "Transformation, death, rebirth, and healing",
      element: "Water",
      health_associations: ["Reproductive organs", "Bladder", "Elimination"],
      emotional_traits: ["Intense", "Transformative", "Healing", "Resilient"],
      life_areas: ["Healing", "Transformation", "Legacy", "Crisis"],
      recommendations: [
        "Embrace life transitions",
        "Support reproductive health",
        "Practice healing and forgiveness",
      ],
    },
    circle_9: {
      number: 9,
      name: "Circle of Wisdom (ብርሃን)",
      geEz_symbol: "በ",
      description: "Wisdom, philosophy, and higher learning",
      element: "Fire",
      health_associations: ["Hips", "Liver", "Vision", "Spiritual health"],
      emotional_traits: ["Wisdom", "Adventurous", "Philosophical", "Optimistic"],
      life_areas: ["Higher education", "Travel", "Philosophy", "Spirituality"],
      recommendations: [
        "Support liver health with antioxidant-rich foods",
        "Engage in lifelong learning and travel",
        "Cultivate wisdom and gratitude",
      ],
    },
    circle_10: {
      number: 10,
      name: "Circle of Achievement (ግብር)",
      geEz_symbol: "ተ",
      description: "Career, achievement, and public image",
      element: "Earth",
      health_associations: ["Knees", "Joints", "Skeletal system"],
      emotional_traits: ["Ambitious", "Disciplined", "Respected", "Achievement-oriented"],
      life_areas: ["Career", "Reputation", "Life purpose"],
      recommendations: [
        "Support joint health with collagen and nutrition",
        "Pursue meaningful career goals",
        "Build a positive public image",
      ],
    },
    circle_11: {
      number: 11,
      name: "Circle of Community (ኅብረት)",
      geEz_symbol: "ኀ",
      description: "Community, friendship, and social networks",
      element: "Air",
      health_associations: ["Circulation", "Calves", "Ankles", "Nervous system"],
      emotional_traits: ["Friendly", "Visionary", "Community-minded", "Social"],
      life_areas: ["Community", "Friendships", "Social change"],
      recommendations: [
        "Support circulation with regular exercise",
        "Engage in community and friendship",
        "Pursue vision and social change",
      ],
    },
    circle_12: {
      number: 12,
      name: "Circle of Spirituality (መድሀኒት)",
      geEz_symbol: "ነ",
      description: "Spirituality, healing, and inner peace",
      element: "Water",
      health_associations: ["Feet", "Lymphatic system", "Mental health", "Sleep"],
      emotional_traits: ["Spiritual", "Intuitive", "Healing", "Introspective"],
      life_areas: ["Spirituality", "Healing", "Solitude", "Inner peace"],
      recommendations: [
        "Practice mindfulness and meditation",
        "Support lymphatic health with hydration and movement",
        "Cultivate inner peace and spirituality",
      ],
    },
    circle_13: {
      number: 13,
      name: "Circle of Renewal (እርሻ)",
      geEz_symbol: "አ",
      description: "Renewal, rebirth, and new cycles",
      element: "Fire",
      health_associations: ["Pituitary gland", "Metabolism", "Renewal systems"],
      emotional_traits: ["Renewed", "Enthusiastic", "Hopeful", "Transformed"],
      life_areas: ["New beginnings", "Transformation", "Healing"],
      recommendations: [
        "Support metabolism with balanced nutrition",
        "Embrace new beginnings and transformation",
        "Practice forgiveness and letting go",
      ],
    },
    circle_14: {
      number: 14,
      name: "Circle of Balance (ሚዛን)",
      geEz_symbol: "ከ",
      description: "Balance, harmony, and justice",
      element: "Air",
      health_associations: ["Adrenals", "Balance organs (inner ear)", "Homeostasis"],
      emotional_traits: ["Balanced", "Harmonious", "Diplomatic", "Fair"],
      life_areas: ["Balance", "Harmony", "Justice", "Relationships"],
      recommendations: [
        "Support adrenal health with stress management",
        "Maintain balance in work and life",
        "Practice justice and fairness",
      ],
    },
    circle_15: {
      number: 15,
      name: "Circle of Healing (ፈውስ)",
      geEz_symbol: "ወ",
      description: "Healing, medicine, and restoration",
      element: "Water",
      health_associations: ["Immune system", "Lymphatic system", "Healing processes"],
      emotional_traits: ["Healing", "Nurturing", "Compassionate", "Restorative"],
      life_areas: ["health", "Healing", "Restoration", "Compassion"],
      recommendations: [
        "Support immune health with nutrition and lifestyle",
        "Practice compassion and self-care",
        "Engage in healing practices (prayer, meditation)",
      ],
    },
    circle_16: {
      number: 16,
      name: "Circle of Completion (መጨረሻ)",
      geEz_symbol: "ዐ",
      description: "Completion, closure, and transcendence",
      element: "Fire",
      health_associations: ["Brain", "Nervous system", "Spiritual health"],
      emotional_traits: ["Transcendent", "Aware", "Complete", "Peaceful"],
      life_areas: ["Completion", "Closure", "Transcendence", "Legacy"],
      recommendations: [
        "Support brain health with omega-3 and antioxidants",
        "Embrace closure and completion",
        "Cultivate peace and transcendence",
      ],
    },
  };

  // -------------------------------------------------------------------------
  // WESTERN ZODIAC WITH health ASSOCIATIONS
  // -------------------------------------------------------------------------
  private westernZodiac = {
    aries: {
      sign: "Aries (አሪስ)",
      dates: "March 21 – April 19",
      element: "Fire",
      modality: "Cardinal",
      ruling_planet: "Mars",
      health_associations: {
        organs: ["Head", "Brain", "Eyes", "Adrenals"],
        conditions: ["Headaches", "Eye strain", "Inflammation", "Adrenal fatigue"],
        strengths: ["Vitality", "Courage", "Energy", "Fast recovery"],
        vulnerabilities: ["Impulsivity", "Burnout", "Stress-related tension"],
      },
      emotional_traits: ["Courageous", "Energetic", "Impulsive", "Assertive"],
      nutritional_advice: [
        "Magnesium-rich foods to support nervous system",
        "Iron-rich foods for vitality",
        "Anti-inflammatory foods (ginger, turmeric)",
      ],
      lifestyle_advice: [
        "Regular physical exercise to channel energy",
        "Stress management techniques",
        "Balance high energy with adequate rest",
      ],
      ethiopian_calendar_month: "Meskerem (መስከረም) – September",
    },
    taurus: {
      sign: "Taurus (ታውረስ)",
      dates: "April 20 – May 20",
      element: "Earth",
      modality: "Fixed",
      ruling_planet: "Venus",
      health_associations: {
        organs: ["Throat", "Thyroid", "Vocal cords", "Ears"],
        conditions: ["Thyroid disorders", "Sore throat", "Ear infections"],
        strengths: ["Endurance", "Steadiness", "Sensory strength"],
        vulnerabilities: ["Weight gain", "Sluggishness", "Stubbornness"],
      },
      emotional_traits: ["Patient", "Reliable", "Sensual", "Stubborn"],
      nutritional_advice: [
        "Iodine-rich foods for thyroid health",
        "Fiber-rich foods for digestion",
        "Moderate fat intake for balance",
      ],
      lifestyle_advice: [
        "Regular exercise to avoid sedentary habits",
        "Enjoy sensory pleasures in moderation",
        "Maintain a steady routine",
      ],
      ethiopian_calendar_month: "Tikimt (ጥቅምት) – October",
    },
    gemini: {
      sign: "Gemini (ጀሚኒ)",
      dates: "May 21 – June 20",
      element: "Air",
      modality: "Mutable",
      ruling_planet: "Mercury",
      health_associations: {
        organs: ["Lungs", "Nervous system", "Arms", "Hands", "Shoulders"],
        conditions: ["Respiratory issues", "Anxiety", "Carpal tunnel", "Thyroid"],
        strengths: ["Mental agility", "Communication", "Adaptability"],
        vulnerabilities: ["Nervousness", "Insomnia", "Overthinking"],
      },
      emotional_traits: ["Communicative", "Curious", "Adaptable", "Anxious"],
      nutritional_advice: [
        "B-complex vitamins for nervous system support",
        "Omega-3 for brain health",
        "Magnesium for relaxation",
      ],
      lifestyle_advice: [
        "Deep breathing exercises",
        "Mental stimulation balanced with rest",
        "Regular social interaction",
      ],
      ethiopian_calendar_month: "Hidar (ህዳር) – November",
    },
    cancer: {
      sign: "Cancer (ካንሰር)",
      dates: "June 21 – July 22",
      element: "Water",
      modality: "Cardinal",
      ruling_planet: "Moon",
      health_associations: {
        organs: ["Stomach", "Breasts", "Reproductive organs", "Digestive system"],
        conditions: ["Digestive issues", "Fluid retention", "Hormonal imbalances"],
        strengths: ["Emotional depth", "Nurturing", "Intuition"],
        vulnerabilities: ["Mood swings", "Emotional eating", "Anxiety"],
      },
      emotional_traits: ["Nurturing", "Intuitive", "Emotional", "Protective"],
      nutritional_advice: [
        "Probiotic-rich foods for digestion",
        "Iodine for reproductive health",
        "Comfort foods in moderation",
      ],
      lifestyle_advice: [
        "Create a nurturing home environment",
        "Practice emotional regulation",
        "Engage in creative activities",
      ],
      ethiopian_calendar_month: "Tahsas (ታህሳስ) – December",
    },
    leo: {
      sign: "Leo (ሊዮ)",
      dates: "July 23 – August 22",
      element: "Fire",
      modality: "Fixed",
      ruling_planet: "Sun",
      health_associations: {
        organs: ["Heart", "Spine", "Circulatory system"],
        conditions: ["Cardiovascular issues", "Back pain", "Heart disease"],
        strengths: ["Vitality", "Courage", "Generosity"],
        vulnerabilities: ["Pride", "Burnout", "Heart-related issues"],
      },
      emotional_traits: ["Confident", "Generous", "Dramatic", "Loyal"],
      nutritional_advice: [
        "CoQ10 for heart health",
        "Magnesium and potassium for heart function",
        "Anti-inflammatory foods",
      ],
      lifestyle_advice: [
        "Regular cardiovascular exercise",
        "Balance leadership with humility",
        "Express creativity and joy",
      ],
      ethiopian_calendar_month: "Tir (ጥር) – January",
    },
    virgo: {
      sign: "Virgo (ቪርጎ)",
      dates: "August 23 – September 22",
      element: "Earth",
      modality: "Mutable",
      ruling_planet: "Mercury",
      health_associations: {
        organs: ["Intestines", "Digestive system", "Nervous system", "Skin"],
        conditions: ["Digestive disorders", "Anxiety", "Skin conditions", "Insomnia"],
        strengths: ["Analytical", "Organised", "health-conscious"],
        vulnerabilities: ["Perfectionism", "Overthinking", "Worry"],
      },
      emotional_traits: ["Analytical", "Modest", "Organised", "Worrisome"],
      nutritional_advice: [
        "Fiber-rich foods for digestion",
        "Probiotics for gut health",
        "B-vitamins for nervous system",
      ],
      lifestyle_advice: [
        "Maintain healthy routines",
        "Practice self-compassion",
        "Manage stress through mindfulness",
      ],
      ethiopian_calendar_month: "Yekatit (የካቲት) – February",
    },
    libra: {
      sign: "Libra (ሊብራ)",
      dates: "September 23 – October 22",
      element: "Air",
      modality: "Cardinal",
      ruling_planet: "Venus",
      health_associations: {
        organs: ["Kidneys", "Lower back", "Skin", "Adrenals"],
        conditions: ["Kidney issues", "Back pain", "Hormonal imbalances"],
        strengths: ["Balance", "Social grace", "Diplomacy"],
        vulnerabilities: ["Indecision", "Conflict avoidance", "Stress"],
      },
      emotional_traits: ["Diplomatic", "Charming", "Balanced", "Indecisive"],
      nutritional_advice: [
        "Calcium and magnesium for adrenal health",
        "Omega-3 for inflammation",
        "Hydration for kidney health",
      ],
      lifestyle_advice: [
        "Maintain balance in relationships",
        "Engage in artistic activities",
        "Practice decision-making skills",
      ],
      ethiopian_calendar_month: "Megabit (መጋቢት) – March",
    },
    scorpio: {
      sign: "Scorpio (ስኮርፒዮ)",
      dates: "October 23 – November 21",
      element: "Water",
      modality: "Fixed",
      ruling_planet: "Pluto (formerly Mars)",
      health_associations: {
        organs: ["Reproductive organs", "Bladder", "Colon", "Elimination systems"],
        conditions: ["Reproductive issues", "Bladder infections", "Colon issues"],
        strengths: ["Resilience", "Intensity", "Healing ability"],
        vulnerabilities: ["Emotional intensity", "Obsession", "Stress"],
      },
      emotional_traits: ["Intense", "Passionate", "Mysterious", "Transformative"],
      nutritional_advice: [
        "Antioxidant-rich foods for cellular health",
        "Fiber for colon health",
        "Iodine for reproductive health",
      ],
      lifestyle_advice: [
        "Embrace transformation and healing",
        "Practice emotional regulation",
        "Engage in deep, meaningful relationships",
      ],
      ethiopian_calendar_month: "Miyazya (ሚያዝያ) – April",
    },
    sagittarius: {
      sign: "Sagittarius (ሳጅታሪየስ)",
      dates: "November 22 – December 21",
      element: "Fire",
      modality: "Mutable",
      ruling_planet: "Jupiter",
      health_associations: {
        organs: ["Hips", "Thighs", "Liver", "Vision"],
        conditions: ["Hip issues", "Liver problems", "Vision changes"],
        strengths: ["Optimism", "Adventurousness", "Vitality"],
        vulnerabilities: ["Overindulgence", "Restlessness", "Liver issues"],
      },
      emotional_traits: ["Optimistic", "Adventurous", "Honest", "Impulsive"],
      nutritional_advice: [
        "Liver-supporting foods (leafy greens, garlic)",
        "Omega-3 for vision",
        "Balanced diet to avoid overindulgence",
      ],
      lifestyle_advice: [
        "Engage in travel and adventure",
        "Pursue higher learning and wisdom",
        "Balance enthusiasm with moderation",
      ],
      ethiopian_calendar_month: "Genbot (ግንቦት) – May",
    },
    capricorn: {
      sign: "Capricorn (ካፕሪኮርን)",
      dates: "December 22 – January 19",
      element: "Earth",
      modality: "Cardinal",
      ruling_planet: "Saturn",
      health_associations: {
        organs: ["Bones", "Joints", "Skin", "Teeth", "Knees"],
        conditions: ["Bone issues", "Arthritis", "Skin conditions", "Dental problems"],
        strengths: ["Discipline", "Endurance", "Structure"],
        vulnerabilities: ["Rigidity", "Overwork", "Skeletal issues"],
      },
      emotional_traits: ["Disciplined", "Ambitious", "Practical", "Reserved"],
      nutritional_advice: [
        "Calcium and vitamin D for bone health",
        "Collagen-rich foods for joints",
        "Vitamin C for skin health",
      ],
      lifestyle_advice: [
        "Maintain a structured routine",
        "Balance work with rest",
        "Practice flexibility and openness to change",
      ],
      ethiopian_calendar_month: "Sene (ሰኔ) – June",
    },
    aquarius: {
      sign: "Aquarius (አኳሪየስ)",
      dates: "January 20 – February 18",
      element: "Air",
      modality: "Fixed",
      ruling_planet: "Uranus (traditionally Saturn)",
      health_associations: {
        organs: ["Circulation", "Ankles", "Nervous system", "Electrical system of body"],
        conditions: ["Circulatory issues", "Ankle sprains", "Nervous tension"],
        strengths: ["Innovation", "Humanitarianism", "Intellectual strength"],
        vulnerabilities: ["Detachment", "Stubbornness", "Nervous tension"],
      },
      emotional_traits: ["Innovative", "Idealistic", "Independent", "Detached"],
      nutritional_advice: [
        "Omega-3 for circulation",
        "Magnesium for nervous system",
        "Antioxidants for overall health",
      ],
      lifestyle_advice: [
        "Engage in social causes",
        "Practice balance between detachment and engagement",
        "Stimulate mind with innovative activities",
      ],
      ethiopian_calendar_month: "Hamle (ሐምሌ) – July",
    },
    pisces: {
      sign: "Pisces (ፒሴስ)",
      dates: "February 19 – March 20",
      element: "Water",
      modality: "Mutable",
      ruling_planet: "Neptune (traditionally Jupiter)",
      health_associations: {
        organs: ["Feet", "Lymphatic system", "Immune system", "Sleep"],
        conditions: ["Foot issues", "Lymphatic congestion", "Sleep disorders", "Immune suppression"],
        strengths: ["Compassion", "Creativity", "Empathy"],
        vulnerabilities: ["Sensitivity", "Escapism", "Boundary issues"],
      },
      emotional_traits: ["Compassionate", "Intuitive", "Creative", "Escapist"],
      nutritional_advice: [
        "Omega-3 for immune and lymphatic health",
        "Zinc and vitamin C for immune support",
        "Comfort foods in moderation",
      ],
      lifestyle_advice: [
        "Establish healthy sleep hygiene",
        "Engage in creative expression",
        "Set healthy emotional boundaries",
      ],
      ethiopian_calendar_month: "Nehase (ነሐሴ) – August",
    },
  };

  // -------------------------------------------------------------------------
  // PLANETARY health ASSOCIATIONS
  // -------------------------------------------------------------------------
  private planetaryhealth = {
    sun: {
      name: "Sun (Tsehay / ጸሀይ)",
      element: "Fire",
      organs: ["Heart", "Spine", "Circulatory system", "Eyes"],
      conditions: ["Cardiovascular issues", "Back pain", "Eye strain", "Low vitality"],
      strengthening: ["Cardiovascular exercise", "Sunlight exposure (moderate)", "Heart-healthy foods"],
      weakening: ["Sedentary lifestyle", "Lack of sunlight", "Poor circulation"],
      ethiopian_context: "Represents life force, leadership, and vitality; linked to Ethiopian kingship",
    },
    moon: {
      name: "Moon (Ware / ወርህ)",
      element: "Water",
      organs: ["Stomach", "Breasts", "Reproductive organs", "Lymphatic system"],
      conditions: ["Digestive issues", "Hormonal imbalances", "Fluid retention", "Emotional swings"],
      strengthening: ["Emotional regulation", "Rest", "Nurturing foods"],
      weakening: ["Stress", "Poor sleep", "Irregular eating"],
      ethiopian_context: "Linked to cycles, emotion, and nurturing; important in Ethiopian tradition",
    },
    mercury: {
      name: "Mercury (በርካር)",
      element: "Air",
      organs: ["Nervous system", "Brain", "Lungs", "Thyroid"],
      conditions: ["Anxiety", "Thyroid disorders", "Respiratory issues", "Nervous tension"],
      strengthening: ["Mental stimulation", "Deep breathing", "B-complex vitamins"],
      weakening: ["Overthinking", "Poor communication", "Stress"],
      ethiopian_context: "Rules communication, intellect, and travel",
    },
    venus: {
      name: "Venus (ቬኑስ)",
      element: "Air",
      organs: ["Kidneys", "Skin", "Hormonal system", "Reproductive system"],
      conditions: ["Kidney issues", "Skin conditions", "Hormonal imbalances"],
      strengthening: ["healthy relationships", "Artistic expression", "Self-care"],
      weakening: ["Conflict", "Loneliness", "Poor self-image"],
      ethiopian_context: "Rulership of love, beauty, and relationships; linked to reproductive health",
    },
    mars: {
      name: "Mars (ማርስ)",
      element: "Fire",
      organs: ["Muscles", "Adrenals", "Blood", "Gallbladder"],
      conditions: ["Inflammation", "Muscle tension", "Fever", "Accidents", "Bleeding"],
      strengthening: ["Physical activity", "healthy assertiveness", "Anti-inflammatory diet"],
      weakening: ["Aggression", "Stress", "Overexertion"],
      ethiopian_context: "Represents energy, courage, and warrior spirit; linked to Wane class",
    },
    jupiter: {
      name: "Jupiter (ጁፒተር)",
      element: "Fire",
      organs: ["Liver", "Hips", "Thighs", "Fat metabolism"],
      conditions: ["Liver issues", "Weight gain", "Obesity", "Hip problems"],
      strengthening: ["Moderation", "healthy diet", "Lifestyle balance"],
      weakening: ["Overindulgence", "Excess", "Sedentary lifestyle"],
      ethiopian_context: "Represents expansion, wisdom, and abundance",
    },
    saturn: {
      name: "Saturn (ሳተርን)",
      element: "Earth",
      organs: ["Bones", "Joints", "Skin", "Teeth", "Gallbladder"],
      conditions: ["Osteoporosis", "Arthritis", "Skin conditions", "Dental issues"],
      strengthening: ["Calcium/vitamin D", "Collagen", "Weight-bearing exercise"],
      weakening: ["Poor diet", "Lack of exercise", "Stress"],
      ethiopian_context: "Represents discipline, structure, and time; linked to elders",
    },
  };

  // -------------------------------------------------------------------------
  // HOUSE SYSTEM health MAPPING
  // -------------------------------------------------------------------------
  private househealth = {
    house_1: {
      number: 1,
      name: "1st House (Self)",
      body_parts: ["Head", "Face", "Brain", "Vitality"],
      health_meaning: "General constitution, vitality, self-image",
      life_area: "Self, identity, personality",
    },
    house_2: {
      number: 2,
      name: "2nd House (Resources)",
      body_parts: ["Throat", "Neck", "Vocal cords", "Thyroid"],
      health_meaning: "Nutritional resources, metabolic intake",
      life_area: "Finance, values, self-worth",
    },
    house_3: {
      number: 3,
      name: "3rd House (Communication)",
      body_parts: ["Lungs", "Nervous system", "Arms", "Hands"],
      health_meaning: "Respiratory health, mental agility",
      life_area: "Communication, siblings, short journeys",
    },
    house_4: {
      number: 4,
      name: "4th House (Home)",
      body_parts: ["Chest", "Stomach", "Breasts", "Digestive system"],
      health_meaning: "Emotional foundation, digestive health",
      life_area: "Home, family, roots",
    },
    house_5: {
      number: 5,
      name: "5th House (Creativity)",
      body_parts: ["Heart", "Spine", "Reproductive organs"],
      health_meaning: "Cardiovascular health, creative expression",
      life_area: "Creativity, children, romance",
    },
    house_6: {
      number: 6,
      name: "6th House (health & Routine)",
      body_parts: ["Intestines", "Digestive system", "Daily routine"],
      health_meaning: "health habits, daily hygiene, digestion",
      life_area: "Work, health, service",
    },
    house_7: {
      number: 7,
      name: "7th House (Partnership)",
      body_parts: ["Kidneys", "Adrenals", "Hormonal system"],
      health_meaning: "Adrenal health, hormonal balance",
      life_area: "Partnerships, marriage, relationships",
    },
    house_8: {
      number: 8,
      name: "8th House (Transformation)",
      body_parts: ["Reproductive organs", "Bladder", "Elimination"],
      health_meaning: "Reproductive health, detoxification",
      life_area: "Transformation, healing, shared resources",
    },
    house_9: {
      number: 9,
      name: "9th House (Wisdom)",
      body_parts: ["Hips", "Thighs", "Liver", "Vision"],
      health_meaning: "Liver function, metabolism, vision",
      life_area: "Travel, philosophy, higher learning",
    },
    house_10: {
      number: 10,
      name: "10th House (Career)",
      body_parts: ["Knees", "Joints", "Bones"],
      health_meaning: "Skeletal health, joint function",
      life_area: "Career, reputation, public image",
    },
    house_11: {
      number: 11,
      name: "11th House (Community)",
      body_parts: ["Circulation", "Calves", "Ankles"],
      health_meaning: "Circulatory health, lower leg health",
      life_area: "Community, friendships, goals",
    },
    house_12: {
      number: 12,
      name: "12th House (Spirituality)",
      body_parts: ["Feet", "Lymphatic system", "Immune system"],
      health_meaning: "Immune health, lymphatic drainage",
      life_area: "Spirituality, healing, solitude",
    },
  };

  // -------------------------------------------------------------------------
  // HUMORAL/ELEMENTAL CONSTITUTION (enhanced from original)
  // -------------------------------------------------------------------------
  private humoralElements = {
    afere: {
      id: "afere",
      element: "Afere (አፈሬ - Earth / Melancholic)",
      nature: "Cold & Dry (ቀዝቃዛና ደረቅ)",
      symbols: ["Earth", "Soil", "Stability"],
      constitutional_tendencies: [
        "Deliberate, grounded, and deeply reflective personality",
        "Tendency toward slower gastric motility, musculoskeletal stiffness, and dry skin",
        "Seasonal vulnerability during dry, cold windy periods (Bega season)",
        "Prone to constipation, joint stiffness, and melancholic moods",
      ],
      strengths: ["Reliability", "Patience", "Discipline", "Persistence"],
      weaknesses: ["Rigidity", "Pessimism", "Isolation", "Stubbornness"],
      health_focus: ["Bone health", "Joint mobility", "Digestive regularity", "Skin moisture"],
      traditional_balancing_guidance: [
        "Incorporate warm, nourishing broths and spiced teas with Ginger and Cardamom (Korerima)",
        "Nourish skin with unrefined sesame or castor oil rubs",
        "Prioritize warm, freshly cooked grains over cold or dry snacks",
        "Engage in gentle, grounding exercise (walking, gardening)",
        "Add healthy fats (Niger seed oil, ghee) for skin and joints",
      ],
      nutritional_advice: [
        "Warm, moist foods: stews, soups, root vegetables",
        "healthy fats: sesame oil, ghee, Niger seed oil",
        "Spices: ginger, cardamom, cinnamon",
        "Avoid: dry, cold, and raw foods",
      ],
      lifestyle_advice: [
        "Maintain a consistent daily routine",
        "Engage in community and social connection",
        "Practice gratitude and optimism",
        "Gentle stretching and joint mobility exercises",
      ],
      ethiopian_context: "Associated with the earth, agriculture, and ancestors; grounding and stability",
    },
    maye: {
      id: "maye",
      element: "Maye (ማዬ - Water / Phlegmatic)",
      nature: "Cold & Moist (ቀዝቃዛና እርጥብ)",
      symbols: ["Water", "Flow", "Emotion"],
      constitutional_tendencies: [
        "Calm, forgiving, patient, and methodical disposition",
        "Tendency toward fluid retention, sinus congestion, and sluggish morning energy",
        "Vulnerability during heavy monsoon periods (Kiremt season)",
        "Prone to weight gain, allergies, and respiratory congestion",
      ],
      strengths: ["Calmness", "Forgiveness", "Patience", "Loyalty"],
      weaknesses: ["Sluggishness", "Lethargy", "Over-sensitivity", "Resistance to change"],
      health_focus: ["Lymphatic health", "Sinus/chest congestion", "Weight management", "Fluid balance"],
      traditional_balancing_guidance: [
        "Favor warming, pungent spices (Berbere, Black pepper / Kundo Berbere, Garlic) to stimulate circulation",
        "Engage in vigorous morning movement to mobilise lymphatic circulation",
        "Avoid excessive cold, heavy, or mucus-forming dairy products during damp seasons",
        "Practice deep breathing exercises to clear congestion",
        "Use warming herbal teas (ginger, cinnamon) in the morning",
      ],
      nutritional_advice: [
        "Warming, stimulating foods: spices, garlic, ginger",
        "Light, dry foods: roasted grains, vegetables",
        "Reduce: dairy, heavy oils, cold drinks",
        "Spices: black pepper, cardamom, cinnamon, garlic",
      ],
      lifestyle_advice: [
        "Start the day with vigorous movement (brisk walking)",
        "Maintain a regular sleep schedule",
        "Avoid damp, cold environments",
        "Engage in activities that energise and motivate",
      ],
      ethiopian_context: "Associated with water, rivers, and lakes; linked to emotion and flow",
    },
    nawaye: {
      id: "nawaye",
      element: "Nawaye (ነፋዬ - Air / Sanguine)",
      nature: "Warm & Moist (ሞቃትና እርጥብ)",
      symbols: ["Air", "Wind", "Breeze"],
      constitutional_tendencies: [
        "Enthusiastic, communicative, creative, and socially adaptable temperament",
        "Tendency toward erratic sleep patterns, nervous system tension, and respiratory sensitivity",
        "Vulnerability during transition seasons with fluctuating barometric pressures",
        "Prone to allergies, anxiety, and variable energy levels",
      ],
      strengths: ["Enthusiasm", "Creativity", "Socialability", "Optimism"],
      weaknesses: ["Inconsistency", "Anxiety", "Scattered energy", "Superficiality"],
      health_focus: ["Respiratory health", "Nervous system balance", "Sleep quality", "Stress management"],
      traditional_balancing_guidance: [
        "Establish grounding, rhythmic daily sleep and meal schedules",
        "Utilise calming botanical teas like Tena Adam (Ruta) and Chamomile before bed",
        "Avoid over-scheduling and late-night sensory stimulation",
        "Practice deep breathing and meditation to calm the mind",
        "Eat regular, nourishing meals to stabilise energy",
      ],
      nutritional_advice: [
        "Grounding foods: root vegetables, grains, pulses",
        "Calming foods: chamomile, lemon balm, warm milk",
        "Avoid: caffeine, excessive sugar, light snacks",
        "Herbs: Tena Adam, chamomile, peppermint",
      ],
      lifestyle_advice: [
        "Establish a regular daily routine",
        "Practice mindfulness and grounding exercises",
        "Limit screen time before bed",
        "Engage in creative expression (art, music, writing)",
      ],
      ethiopian_context: "Associated with wind, breath, and communication; linked to intellect",
    },
    isete: {
      id: "isete",
      element: "Isete (እሳቴ - Fire / Choleric)",
      nature: "Warm & Dry (ሞቃትና ደረቅ)",
      symbols: ["Fire", "Flame", "Energy"],
      constitutional_tendencies: [
        "Determined, decisive, energetic, and goal-directed temperament",
        "Strong metabolic fire (digestive capacity) with tendency toward heartburn, irritability, and inflammatory flare-ups",
        "Vulnerability during intense mid-day heat and dry sunny intervals",
        "Prone to inflammation, heartburn, and stress-related tension",
      ],
      strengths: ["Determination", "Courage", "Leadership", "Quick thinking"],
      weaknesses: ["Irritability", "Aggression", "Burnout", "Impatience"],
      health_focus: ["Digestive health", "Inflammation control", "Cardiovascular health", "Stress management"],
      traditional_balancing_guidance: [
        "Balance spicy meals with cooling accompaniments (Ayib cottage cheese, fresh greens, cucumber)",
        "Stay consistently hydrated with pure water and cooling herbal infusions",
        "Practice mindful pauses during high-stress work periods to prevent burnout",
        "Avoid overexposure to heat and sun",
        "Engage in calming, cooling activities (swimming, walking in nature)",
      ],
      nutritional_advice: [
        "Cooling foods: cucumber, leafy greens, watermelon, coconut water",
        "Avoid: spicy, hot, fried foods",
        "Hydration: 2-3 litres of water daily",
        "Herbs: coriander, fennel, mint",
      ],
      lifestyle_advice: [
        "Practice mindfulness and stress reduction",
        "Avoid overexposure to heat",
        "Engage in calming activities (yoga, swimming)",
        "Maintain a regular sleep schedule",
      ],
      ethiopian_context: "Associated with fire, energy, and transformation; linked to leadership and action",
    },
  };

  // -------------------------------------------------------------------------
  // SEASONAL GUIDANCE (ETHIOPIAN SEASONS)
  // -------------------------------------------------------------------------
  private seasonalGuidance = {
    kiremt: {
      season: "Kiremt (ዋናው ክረምት / Main Rains)",
      period: "June – September",
      element_influence: "Water (Maye) – Cold & Moist",
      health_focus: [
        "Respiratory health (avoid dampness)",
        "Musculoskeletal support (dampness may worsen joint pain)",
        "Digestive health (avoid heavy, cold foods)",
        "Protection from respiratory infections",
      ],
      nutritional_advice: [
        "Warming, light foods (soups, stews)",
        "Spices: ginger, garlic, black pepper (to counter cold/damp)",
        "Avoid: heavy, cold, and mucus-forming foods",
        "Include fermented foods for digestive health",
      ],
      lifestyle_advice: [
        "Dress warmly and dryly",
        "Ensure adequate ventilation (avoid damp indoors)",
        "Practice gentle exercise to maintain circulation",
        "Engage in grounding activities (reading, indoor hobbies)",
      ],
      ethiopian_context: "Kiremt brings heavy rain and cold; traditional focus on warmth and dryness",
    },
    bega: {
      season: "Bega (በጋ / Dry Harvest Season)",
      period: "October – February",
      element_influence: "Earth (Afere) – Cold & Dry",
      health_focus: [
        "Skin health (prevent dryness)",
        "Respiratory health (dust, dry air)",
        "Joint health (cold may stiffen joints)",
        "Immune support (flu season)",
      ],
      nutritional_advice: [
        "Warm, nourishing foods (stews, roasted grains)",
        "healthy fats: ghee, Niger seed oil, sesame oil",
        "Spices: cinnamon, cardamom, ginger (warming)",
        "Hydration: warm herbal teas (avoid cold drinks)",
      ],
      lifestyle_advice: [
        "Dress warmly and in layers",
        "Protect skin with natural oils (sesame, shea butter)",
        "Engage in moderate exercise to maintain flexibility",
        "Get adequate sunlight (mid-day) for vitamin D",
      ],
      ethiopian_context: "Bega is dry and cold; traditional focus on warmth, moisture, and protection",
    },
    belg: {
      season: "Belg (በልግ / Short Rains)",
      period: "March – May",
      element_influence: "Air (Nawaye) – Warm & Moist",
      health_focus: [
        "Allergy management (pollen, dust)",
        "Respiratory health (seasonal transitions)",
        "Nervous system balance (seasonal affective)",
        "Immune support (changes in weather)",
      ],
      nutritional_advice: [
        "Light, fresh foods (leafy greens, fruits)",
        "Spices: turmeric, coriander, cumin",
        "Hydration: water, herbal teas",
        "Avoid: heavy, rich foods (digestive burden)",
      ],
      lifestyle_advice: [
        "Practice breathing exercises",
        "Spend time outdoors (moderate)",
        "Adjust diet to seasonal produce",
        "Maintain regular sleep patterns",
      ],
      ethiopian_context: "Belg is transitional; traditional focus on lightness and fresh foods",
    },
  };

  // -------------------------------------------------------------------------
  // LUNAR GUIDANCE (ETHIOPIAN LUNAR CALENDAR)
  // -------------------------------------------------------------------------
  private lunarGuidance = {
    new_moon: {
      phase: "New Moon (በረከት)",
      description: "Beginnings, planting seeds, renewal",
      health_focus: ["Rest", "Setting intentions", "Starting new health habits", "Detoxification"],
      activities: ["Meditation", "Journaling", "Gentle exercise", "Restorative yoga"],
      nutritional_advice: ["Light meals", "Clear soups", "Hydration"],
    },
    waxing_crescent: {
      phase: "Waxing Crescent (አቦል)",
      description: "Growth, building momentum, action",
      health_focus: ["Building energy", "Starting new routines", "Increased physical activity"],
      activities: ["Walking", "Light cardio", "Goal setting"],
      nutritional_advice: ["Protein-rich meals", "Whole grains", "Sustained energy foods"],
    },
    first_quarter: {
      phase: "First Quarter (ቶና)",
      description: "Action, challenge, decision-making",
      health_focus: ["Overcoming obstacles", "Assertive health actions", "Decision-making"],
      activities: ["Strength training", "High-intensity exercise", "health decisions"],
      nutritional_advice: ["Energising foods", "Balanced meals", "Avoid overeating"],
    },
    waxing_gibbous: {
      phase: "Waxing Gibbous (በረካ)",
      description: "Refinement, adjustment, fine-tuning",
      health_focus: ["Adjusting health plans", "Fine-tuning routines", "Listening to body"],
      activities: ["Moderate exercise", "Self-reflection", "health tracking"],
      nutritional_advice: ["Adjust diet to needs", "Include variety", "Mindful eating"],
    },
    full_moon: {
      phase: "Full Moon (ሙሉ ጨረቃ)",
      description: "Release, completion, celebration",
      health_focus: ["Release of stress", "Celebration of progress", "Restorative sleep"],
      activities: ["Restorative yoga", "Breathing exercises", "Celebration and gratitude"],
      nutritional_advice: ["Light meals", "Avoid heavy foods", "Stay hydrated"],
    },
    waning_gibbous: {
      phase: "Waning Gibbous (አልፋ)",
      description: "Gratitude, sharing, reflection",
      health_focus: ["Gratitude practice", "Sharing health insights", "Reflection"],
      activities: ["Journaling", "Community connection", "Gentle exercise"],
      nutritional_advice: ["Nourishing foods", "Community meals", "Moderation"],
    },
    last_quarter: {
      phase: "Last Quarter (ዳኅራዊ)",
      description: "Letting go, reflection, preparation",
      health_focus: ["Letting go of bad habits", "Reflecting on progress", "Preparing for renewal"],
      activities: ["Closure rituals", "health plan review", "Rest and reflection"],
      nutritional_advice: ["Detoxifying foods", "Light, cleansing meals", "Hydration"],
    },
    waning_crescent: {
      phase: "Waning Crescent (ጸጥታ)",
      description: "Rest, renewal, deep healing",
      health_focus: ["Deep rest", "Renewal practices", "Preparing for new cycle", "Healing"],
      activities: ["Deep rest", "Meditation", "Sleep hygiene", "health planning"],
      nutritional_advice: ["Restorative foods", "Light, warming meals", "Herbal teas"],
    },
  };

  // -------------------------------------------------------------------------
  // DÄBTÄRA HEALING SCROLL KNOWLEDGE
  // -------------------------------------------------------------------------
  private dabtaraWisdom = {
    healing_scrolls: {
      title: "Däbtära Healing Scrolls (ጥበብ መጽሐፍ)",
      description: "Traditional parchment medical prescriptions combining celestial timing, botanical remedies, and spiritual practices",
      scrolls: [
        {
          name: "Scroll of Life (መጽሐፈ ሕይወት)",
          purpose: "Vitality and protection from disease",
          botanicals: ["Tena Adam (Ruta chalepensis)", "Tikur Azmud (Nigella sativa)", "Damakesse (Ocimum lamiifolium)"],
          timing: "Best read during waxing moon",
          spiritual_practice: "Prayer and fasting before healing",
        },
        {
          name: "Scroll of Protection (መጽሐፈ መከላከያ)",
          purpose: "Protection from harm and negative influences",
          botanicals: ["Koseret (Lippia adoensis)", "Tena Adam", "Garlic"],
          timing: "Best prepared during midday sun",
          spiritual_practice: "Wearing amulets (Kitabe)",
        },
        {
          name: "Scroll of Healing (መጽሐፈ ፈውስ)",
          purpose: "Physical and spiritual healing",
          botanicals: ["Moringa", "Ginger", "Honey", "Propolis"],
          timing: "Best during full moon",
          spiritual_practice: "Holy water (Tsebel) immersion",
        },
        {
          name: "Scroll of Balance (መጽሐፈ ሚዛን)",
          purpose: "Restoring constitutional harmony",
          botanicals: ["Chamomile", "Lemon balm", "Damakesse"],
          timing: "Best during equinoxes",
          spiritual_practice: "Confession and reconciliation",
        },
      ],
      general_recommendations: [
        "Consult a Däbtära for personalised spiritual guidance",
        "Use herbal remedies with caution and clinical supervision",
        "Combine spiritual practices with modern medical care",
        "Respect the cultural significance of healing scrolls",
      ],
    },
  };

  // -------------------------------------------------------------------------
  // GE'EZ NAME ANALYSIS
  // -------------------------------------------------------------------------
  private geEzNameMeanings: Record<string, { meaning: string; health_insight: string; circle_affinity: number }> = {
    "ትግስት": { meaning: "Patience", health_insight: "Encourages emotional resilience and stress management", circle_affinity: 4 },
    "ሙሉጌታ": { meaning: "Full of grace", health_insight: "Promotes self-esteem and positive mental health", circle_affinity: 9 },
    "ደስታ": { meaning: "Joy", health_insight: "Linked to mental well-being and happiness", circle_affinity: 5 },
    "ወርቁ": { meaning: "Golden", health_insight: "Symbolises value and self-worth", circle_affinity: 1 },
    "ጸሀይ": { meaning: "Sun", health_insight: "Vitality, energy, and leadership", circle_affinity: 1 },
    "እንዳሌ": { meaning: "He returned", health_insight: "Recovery and resilience", circle_affinity: 8 },
    "ግርማ": { meaning: "Majesty", health_insight: "Confidence and leadership", circle_affinity: 10 },
    "አበበ": { meaning: "Flourished / Bloomed", health_insight: "Growth and vitality", circle_affinity: 5 },
    "ሰላማዊት": { meaning: "Peaceful", health_insight: "Peace and calmness", circle_affinity: 6 },
    "መኮንን": { meaning: "Wealthy", health_insight: "Prosperity and self-worth", circle_affinity: 2 },
    "ሀይሌ": { meaning: "My strength", health_insight: "Courage and physical vitality", circle_affinity: 1 },
    "በላይ": { meaning: "Above / Superior", health_insight: "Leadership and ambition", circle_affinity: 10 },
    "አዋል": { meaning: "Perfect / Complete", health_insight: "Self-acceptance and completion", circle_affinity: 16 },
    "አለማየሁ": { meaning: "I saw the world", health_insight: "Curiosity and learning", circle_affinity: 9 },
    "ምርት": { meaning: "Fruit / Produce", health_insight: "Fertility and growth", circle_affinity: 5 },
  };

  // -------------------------------------------------------------------------
  // Helper methods
  // -------------------------------------------------------------------------
  private normalizeQuery(query: string): string {
    return query
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private hasAlias(normalized: string, alias: string): boolean {
    return this.queryAliases[alias]?.some((term) => normalized.includes(term)) ?? false;
  }

  private getBirthDate(userProfile: UserProfile): Date | undefined {
    const raw = userProfile.birthDate || userProfile.cultural?.birthDate;
    return raw ? new Date(raw) : undefined;
  }

  private getBirthPlace(userProfile: UserProfile): string | undefined {
    return userProfile.birthPlace || userProfile.cultural?.birthLocation || userProfile.location?.city || userProfile.demographics?.city;
  }

  private getFullName(userProfile: UserProfile): string | undefined {
    return userProfile.fullName || userProfile.cultural?.name || userProfile.name;
  }

  private getAmharicName(userProfile: UserProfile): string | undefined {
    return userProfile.amharicName || userProfile.geEzName || userProfile.cultural?.name || undefined;
  }

  // -------------------------------------------------------------------------
  // Main query method
  // -------------------------------------------------------------------------
  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const birthDate = this.getBirthDate(userProfile);
    const birthPlace = this.getBirthPlace(userProfile);
    const fullName = this.getFullName(userProfile);
    const amharicName = this.getAmharicName(userProfile);

    // ---- 1. Determine user's zodiac sign from birth date (if available) ----
    let userZodiacSign: string | null = null;
    if (birthDate) {
      const month = birthDate.getMonth() + 1; // 1-12
      const day = birthDate.getDate();
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) userZodiacSign = "aries";
      else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) userZodiacSign = "taurus";
      else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) userZodiacSign = "gemini";
      else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) userZodiacSign = "cancer";
      else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) userZodiacSign = "leo";
      else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) userZodiacSign = "virgo";
      else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) userZodiacSign = "libra";
      else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) userZodiacSign = "scorpio";
      else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) userZodiacSign = "sagittarius";
      else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) userZodiacSign = "capricorn";
      else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) userZodiacSign = "aquarius";
      else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) userZodiacSign = "pisces";
    }

    // ---- 2. Determine element from query or user's zodiac ----
    let targetElement: keyof typeof this.humoralElements = "afere";
    const elementMap: Record<string, keyof typeof this.humoralElements> = {
      earth: "afere", afere: "afere", melancholic: "afere",
      taurus: "afere", virgo: "afere", capricorn: "afere",
      water: "maye", maye: "maye", phlegmatic: "maye",
      cancer: "maye", scorpio: "maye", pisces: "maye",
      air: "nawaye", nawaye: "nawaye", sanguine: "nawaye",
      gemini: "nawaye", libra: "nawaye", aquarius: "nawaye",
      fire: "isete", isete: "isete", choleric: "isete",
      aries: "isete", leo: "isete", sagittarius: "isete",
    };

    for (const [key, value] of Object.entries(elementMap)) {
      if (this.hasAlias(normalized, key as keyof typeof this.queryAliases)) {
        targetElement = value;
        break;
      }
    }

    // If user's zodiac sign is known, use that to determine element if not matched by query
    if (userZodiacSign && !terms.some((t) => Object.keys(elementMap).includes(t))) {
      const signElementMap: Record<string, keyof typeof this.humoralElements> = {
        aries: "isete", leo: "isete", sagittarius: "isete",
        taurus: "afere", virgo: "afere", capricorn: "afere",
        gemini: "nawaye", libra: "nawaye", aquarius: "nawaye",
        cancer: "maye", scorpio: "maye", pisces: "maye",
      };
      targetElement = signElementMap[userZodiacSign] || "afere";
    }

    // ---- 3. AwudeNegest Circle determination from name (if available) ----
    let awudeCircle: number | null = null;
    let awudeCircleName: string | null = null;
    let awudeCircleDescription: string | null = null;

    if (amharicName) {
      // Simple mapping: use first letter of Amharic name to determine circle (simplified)
      const firstLetter = amharicName.charAt(0);
      const geEzMap: Record<string, number> = {
        "ሀ": 1, "ለ": 2, "ሐ": 3, "መ": 4, "ሠ": 5, "ረ": 6, "ሰ": 7, "ቀ": 8,
        "በ": 9, "ተ": 10, "ኀ": 11, "ነ": 12, "አ": 13, "ከ": 14, "ወ": 15, "ዐ": 16,
      };
      awudeCircle = geEzMap[firstLetter] || null;
      if (awudeCircle) {
        const circleKey = `circle_${awudeCircle}` as keyof typeof this.awudeNegestCircles;
        const circleData = this.awudeNegestCircles[circleKey];
        awudeCircleName = circleData?.name || null;
        awudeCircleDescription = circleData?.description || null;
      }
    }

    // ---- 4. Process AwudeNegest Circles ----
    if (awudeCircle || this.hasAlias(normalized, "awude") || normalized.includes("circle") || normalized.includes("አውደ") || normalized.includes("ነገሥት")) {
      // If user has a circle, show their specific circle; otherwise show general AwudeNegest knowledge
      if (awudeCircle) {
        const circleKey = `circle_${awudeCircle}` as keyof typeof this.awudeNegestCircles;
        const circle = this.awudeNegestCircles[circleKey];
        if (circle) {
          results.push({
            type: "awude_negest_circle",
            strand: this.strandName,
            domain: "cultural",
            name: `${circle.name} (${circle.number})`,
            description: `Circle ${circle.number}: ${circle.description}`,
            evidence: `Element: ${circle.element}. health associations: ${circle.health_associations.join(", ")}. Emotional traits: ${circle.emotional_traits.join(", ")}.`,
            ethiopian_context: ["Derived from the ancient Ge'ez Awude Negest cosmological manuscripts", "Used by Däbtära for personal self-reflection and seasonal harmony"],
            relevanceScore: 0.95,
            confidence: 0.88,
            matches: ["awude_negest", "user_circle"],
            recommendations: circle.recommendations,
            management: circle.recommendations,
            sources: ["Awude Negest Ge'ez Classical Manuscripts", "Institute of Ethiopian Studies Classical Astronomy"],
            category: "Domain B",
            severity: "low",
          });
        }
      }

      // General AwudeNegest knowledge
      if (normalized.includes("awude") || normalized.includes("አውደ") || normalized.includes("ነገሥት")) {
        const circles = Object.values(this.awudeNegestCircles);
        const sampleCircles = circles.slice(0, 4);
        results.push({
          type: "awude_negest_overview",
          strand: this.strandName,
          domain: "cultural",
          name: "AWUDE NEGEST (ዓውደ ነገሥት)",
          description: "Ethiopian astrological system with 16 circular tables of Ge'ez letters and numbers",
          evidence: `Each circle represents a different aspect of life, with health associations and emotional traits. Sample circles: ${sampleCircles.map(c => `${c.name} (${c.number})`).join(", ")}.`,
          ethiopian_context: ["Historically utilized by traditional scholars (Däbtära) for self-reflection", "Linked to the Ethiopian calendar and seasonal cycles"],
          relevanceScore: 0.78,
          confidence: 0.85,
          matches: ["awude_negest_overview"],
          recommendations: ["Consult a Däbtära for personalised AwudeNegest reading", "Use AwudeNegest for cultural self-reflection"],
          sources: ["Awude Negest Ge'ez Classical Manuscripts"],
          category: "Domain B",
          severity: "low",
        });
      }
    }

    // ---- 5. Western Zodiac (if user has birth date or query matches) ----
    if (userZodiacSign || this.hasAlias(normalized, "aries") || this.hasAlias(normalized, "taurus") || this.hasAlias(normalized, "gemini") || this.hasAlias(normalized, "cancer") || this.hasAlias(normalized, "leo") || this.hasAlias(normalized, "virgo") || this.hasAlias(normalized, "libra") || this.hasAlias(normalized, "scorpio") || this.hasAlias(normalized, "sagittarius") || this.hasAlias(normalized, "capricorn") || this.hasAlias(normalized, "aquarius") || this.hasAlias(normalized, "pisces")) {
      // If user has a sign, show their specific sign
      if (userZodiacSign) {
        const signData = this.westernZodiac[userZodiacSign as keyof typeof this.westernZodiac];
        if (signData) {
          results.push({
            type: "western_zodiac_sign",
            strand: this.strandName,
            domain: "cultural",
            name: signData.sign.toUpperCase(),
            description: `Birth dates: ${signData.dates}. Element: ${signData.element}. Ruling planet: ${signData.ruling_planet}.`,
            evidence: `health associations: Organs - ${signData.health_associations.organs.join(", ")}. Vulnerabilities - ${signData.health_associations.vulnerabilities.join(", ")}.`,
            ethiopian_context: [`Ethiopian calendar month: ${signData.ethiopian_calendar_month || "N/A"}`],
            relevanceScore: 0.92,
            confidence: 0.85,
            matches: ["user_zodiac", "western_astrology"],
            recommendations: [...signData.nutritional_advice, ...signData.lifestyle_advice],
            management: [...signData.nutritional_advice, ...signData.lifestyle_advice],
            sources: ["Western Astrology", "Ethiopian Calendar Correlation"],
            category: "Domain B",
            severity: "low",
          });
        }
      }

      // General zodiac knowledge if query matches signs
      if (this.hasAlias(normalized, "aries") || this.hasAlias(normalized, "taurus") || this.hasAlias(normalized, "gemini") || this.hasAlias(normalized, "cancer") || this.hasAlias(normalized, "leo") || this.hasAlias(normalized, "virgo") || this.hasAlias(normalized, "libra") || this.hasAlias(normalized, "scorpio") || this.hasAlias(normalized, "sagittarius") || this.hasAlias(normalized, "capricorn") || this.hasAlias(normalized, "aquarius") || this.hasAlias(normalized, "pisces")) {
        for (const [key, data] of Object.entries(this.westernZodiac)) {
          if (normalized.includes(key) || normalized.includes(data.sign.toLowerCase().split(" ")[0] || "")) {
            results.push({
              type: "western_zodiac_general",
              strand: this.strandName,
              domain: "cultural",
              name: data.sign.toUpperCase(),
              description: `Dates: ${data.dates}. Element: ${data.element}. Ruling planet: ${data.ruling_planet}.`,
              evidence: `health associations: Organs - ${data.health_associations.organs.join(", ")}. Vulnerabilities - ${data.health_associations.vulnerabilities.join(", ")}.`,
              ethiopian_context: [`Ethiopian calendar month: ${data.ethiopian_calendar_month || "N/A"}`],
              relevanceScore: 0.75,
              confidence: 0.80,
              matches: ["western_astrology", "zodiac_search"],
              recommendations: [...data.nutritional_advice, ...data.lifestyle_advice],
              management: [...data.nutritional_advice, ...data.lifestyle_advice],
              sources: ["Western Astrology"],
              category: "Domain B",
              severity: "low",
            });
          }
        }
      }
    }

    // ---- 6. Humoral Elements ----
    const humoralItem = this.humoralElements[targetElement];
    if (humoralItem) {
      results.push({
        type: "humoral_element",
        strand: this.strandName,
        domain: "cultural",
        name: humoralItem.element.toUpperCase(),
        description: `Nature: ${humoralItem.nature}. Constitutional tendencies: ${humoralItem.constitutional_tendencies.join("; ")}.`,
        evidence: `Strengths: ${humoralItem.strengths.join(", ")}. Weaknesses: ${humoralItem.weaknesses.join(", ")}. health focus: ${humoralItem.health_focus.join(", ")}.`,
        ethiopian_context: [
          "Derived from the ancient Ge'ez Awude Negest cosmological and humoral health manuscripts",
          "Historically utilized by traditional scholars (Däbtära) for personal self-reflection",
        ],
        relevanceScore: 0.88,
        confidence: 0.88,
        matches: ["humoral_element", targetElement],
        recommendations: [...humoralItem.traditional_balancing_guidance, ...humoralItem.nutritional_advice, ...humoralItem.lifestyle_advice],
        management: [...humoralItem.traditional_balancing_guidance, ...humoralItem.nutritional_advice, ...humoralItem.lifestyle_advice],
        sources: ["Awude Negest Ge'ez Classical Manuscripts"],
        category: "Domain B",
        severity: "low",
      });
    }

    // ---- 7. Planetary health ----
    if (this.hasAlias(normalized, "sun") || this.hasAlias(normalized, "moon") || this.hasAlias(normalized, "mercury") || this.hasAlias(normalized, "venus") || this.hasAlias(normalized, "mars") || this.hasAlias(normalized, "jupiter") || this.hasAlias(normalized, "saturn")) {
      for (const [key, data] of Object.entries(this.planetaryhealth)) {
        if (this.hasAlias(normalized, key as keyof typeof this.queryAliases)) {
          results.push({
            type: "planetary_health",
            strand: this.strandName,
            domain: "cultural",
            name: data.name.toUpperCase(),
            description: `Element: ${data.element}. Organs: ${data.organs.join(", ")}.`,
            evidence: `Conditions: ${data.conditions.join(", ")}. Strengthening: ${data.strengthening.join(", ")}. Weakens: ${data.weakening.join(", ")}.`,
            ethiopian_context: data.ethiopian_context || "Planetary health association",
            relevanceScore: 0.78,
            confidence: 0.82,
            matches: ["planetary_health", key],
            recommendations: data.strengthening,
            management: data.strengthening,
            sources: ["Western Astrology", "Ethiopian Astrological Traditions"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 8. House System health ----
    if (this.hasAlias(normalized, "house") || normalized.includes("house") || normalized.includes("ቤት") || normalized.includes("ሀውስ")) {
      for (const [key, data] of Object.entries(this.househealth)) {
        if (normalized.includes(key.replace("_", " ")) || normalized.includes(`house ${data.number}`) || normalized.includes(data.name.toLowerCase())) {
          results.push({
            type: "house_health",
            strand: this.strandName,
            domain: "cultural",
            name: `${data.name} (${data.number}th House)`,
            description: `Body parts: ${data.body_parts.join(", ")}. health meaning: ${data.health_meaning}. Life area: ${data.life_area}.`,
            evidence: `The ${data.number}th house relates to ${data.life_area} and influences ${data.body_parts.join(", ")}.`,
            ethiopian_context: "Astrological house system used in Ethiopian and Western astrology",
            relevanceScore: 0.72,
            confidence: 0.78,
            matches: ["house_health", key],
            recommendations: [`Focus on ${data.health_meaning} for overall well-being`],
            sources: ["Western Astrology", "Ethiopian Astrological Traditions"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 9. Seasonal Guidance ----
    if (this.hasAlias(normalized, "kiremt") || this.hasAlias(normalized, "bega") || this.hasAlias(normalized, "belg") || normalized.includes("season") || normalized.includes("ወቅት")) {
      for (const [key, data] of Object.entries(this.seasonalGuidance)) {
        if (this.hasAlias(normalized, key as keyof typeof this.queryAliases) || normalized.includes(data.season.split(" ")[0] || "")) {
          results.push({
            type: "seasonal_health_guidance",
            strand: this.strandName,
            domain: "cultural",
            name: data.season.toUpperCase(),
            description: `Period: ${data.period}. Element influence: ${data.element_influence}.`,
            evidence: `health focus: ${data.health_focus.join(", ")}. Nutritional advice: ${data.nutritional_advice.join(", ")}.`,
            ethiopian_context: data.ethiopian_context || "Ethiopian seasonal health guidance",
            relevanceScore: 0.78,
            confidence: 0.80,
            matches: ["seasonal_health", key],
            recommendations: [...data.nutritional_advice, ...data.lifestyle_advice],
            management: [...data.nutritional_advice, ...data.lifestyle_advice],
            sources: ["Ethiopian Seasonal Calendar", "Awude Negest"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 10. Lunar Guidance ----
    if (this.hasAlias(normalized, "lunar") || normalized.includes("moon") || normalized.includes("phase") || normalized.includes("ወርህ") || normalized.includes("ጨረቃ")) {
      for (const [key, data] of Object.entries(this.lunarGuidance)) {
        if (normalized.includes(key) || normalized.includes(data.phase.split(" ")[0] || "")) {
          results.push({
            type: "lunar_health_guidance",
            strand: this.strandName,
            domain: "cultural",
            name: data.phase.toUpperCase(),
            description: data.description,
            evidence: `health focus: ${data.health_focus.join(", ")}. Activities: ${data.activities.join(", ")}. Nutritional advice: ${data.nutritional_advice.join(", ")}.`,
            ethiopian_context: ["Ethiopian lunar calendar influences health and well-being"],
            relevanceScore: 0.72,
            confidence: 0.78,
            matches: ["lunar_health", key],
            recommendations: [...data.activities, ...data.nutritional_advice],
            management: [...data.activities, ...data.nutritional_advice],
            sources: ["Ethiopian Lunar Calendar", "Awude Negest"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 11. Däbtära Healing Scroll Wisdom ----
    if (this.hasAlias(normalized, "dabtara") || this.hasAlias(normalized, "debtera") || normalized.includes("healing scroll") || normalized.includes("kitabe") || normalized.includes("ጥበብ")) {
      const scrollData = this.dabtaraWisdom.healing_scrolls;
      results.push({
        type: "dabtara_healing_wisdom",
        strand: this.strandName,
        domain: "cultural",
        name: scrollData.title.toUpperCase(),
        description: scrollData.description,
        evidence: `Scrolls: ${scrollData.scrolls.map(s => `${s.name} (${s.purpose})`).join("; ")}.`,
        ethiopian_context: [
          "Däbtära healing scrolls traditionally provide spiritual and psychosomatic solace",
          "Holy Water (Tsebel) pilgrimage timing is based on seasonal lunar and solar transitions",
        ],
        relevanceScore: 0.84,
        confidence: 0.90,
        matches: ["dabtara", "healing_scroll"],
        recommendations: scrollData.general_recommendations,
        management: scrollData.general_recommendations,
        sources: ["Ethiopic Medical Manuscripts (Wellcome Trust & Debre Markos Collections)"],
        category: "Domain B",
        severity: "low",
      });
    }

    // ---- 12. Name Analysis (if user has name) ----
    if (fullName || amharicName) {
      let nameFinding: { name: string; meaning: string; health_insight: string; circle_affinity: number } | null = null;

      // Check if we have a meaning for the Amharic name
      if (amharicName && this.geEzNameMeanings[amharicName]) {
        nameFinding = {
          name: amharicName,
          meaning: this.geEzNameMeanings[amharicName].meaning,
          health_insight: this.geEzNameMeanings[amharicName].health_insight,
          circle_affinity: this.geEzNameMeanings[amharicName].circle_affinity,
        };
      }

      // If we found a name meaning
      if (nameFinding) {
        results.push({
          type: "geez_name_analysis",
          strand: this.strandName,
          domain: "cultural",
          name: `NAME ANALYSIS: ${nameFinding.name}`,
          description: `Meaning: ${nameFinding.meaning}. health insight: ${nameFinding.health_insight}. Circle affinity: ${nameFinding.circle_affinity}.`,
          evidence: `The name ${nameFinding.name} is associated with Circle ${nameFinding.circle_affinity} in the Awude Negest system.`,
          ethiopian_context: ["Names in Ethiopian tradition carry deep meaning and influence identity"],
          relevanceScore: 0.88,
          confidence: 0.85,
          matches: ["geez_name", "naming_analysis"],
          recommendations: [
            `Embrace the meaning of your name: ${nameFinding.meaning}`,
            `Use your name's health insight for self-reflection: ${nameFinding.health_insight}`,
            `Consider the Circle ${nameFinding.circle_affinity} for personal growth`,
          ],
          management: [`Reflect on the meaning of your name (${nameFinding.meaning}) for personal growth`],
          sources: ["Ethiopian Naming Traditions", "Ge'ez Language Studies"],
          category: "Domain B",
          severity: "low",
        });
      }
    }

    // ---- 13. Däbtära Healing Scroll Recommendation (always included as cultural context) ----
    results.push({
      type: "dabtara_healing_scroll_prescription",
      strand: this.strandName,
      domain: "cultural",
      name: "DÄBTÄRA HEALING SCROLL & CELESTIAL BOTANICAL INSCRIPTION",
      description: "Traditional parchment medical prescription aligning planetary hours with medicinal botanical teas and sacred thermal spring timing.",
      evidence: "Recorded in classical Ge'ez medicinal codices (መጽሐፈ ፈውስ). Botanical affinities: Damakesse (Ocimum lamiifolium), Tikur Azmud (Nigella sativa), Tena Adam (Ruta chalepensis).",
      ethiopian_context: [
        "Däbtära healing scrolls traditionally provide spiritual and psychosomatic solace to ease internal anxiety and restore constitutional harmony.",
        "Holy Water (Tsebel) pilgrimage timing is traditionally calculated based on seasonal lunar and solar transitions.",
      ],
      relevanceScore: 0.82,
      confidence: 0.90,
      matches: ["dabtara_scroll", "cultural_healing"],
      recommendations: [
        "Sip calming Damakesse and Koseret infusions during evening reflection windows.",
        "Perform grounding foot massages with warm sesame oil before sleep to calm autonomic nervous excitement.",
      ],
      sources: ["Ethiopic Medical Manuscripts (Wellcome Trust & Debre Markos Collections)"],
      category: "Domain B",
      severity: "low",
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // -------------------------------------------------------------------------
  // Helper methods for integration
  // -------------------------------------------------------------------------

  /**
   * Get zodiac sign from birth date
   */
  getZodiacSign(birthDate: Date): string | null {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
    return null;
  }

  /**
   * Get humoral element from zodiac sign
   */
  getHumoralElementFromSign(sign: string): string | null {
    const map: Record<string, string> = {
      Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
      Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
      Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
    };
    return map[sign] || null;
  }

  /**
   * Get nutritional advice for a zodiac sign
   */
  getNutritionalAdviceForSign(sign: string): string[] {
    const signKey = sign.toLowerCase() as keyof typeof this.westernZodiac;
    if (this.westernZodiac[signKey]) {
      return this.westernZodiac[signKey].nutritional_advice;
    }
    return ["Maintain a balanced diet with variety"];
  }

  /**
   * Get lifestyle advice for a zodiac sign
   */
  getLifestyleAdviceForSign(sign: string): string[] {
    const signKey = sign.toLowerCase() as keyof typeof this.westernZodiac;
    if (this.westernZodiac[signKey]) {
      return this.westernZodiac[signKey].lifestyle_advice;
    }
    return ["Maintain a balanced lifestyle with rest and activity"];
  }

  /**
   * Get AwudeNegest circle from Ge'ez letter
   */
  getAwudeCircleFromGeEz(letter: string): { number: number; name: string; description: string } | null {
    const geEzMap: Record<string, number> = {
      "ሀ": 1, "ለ": 2, "ሐ": 3, "መ": 4, "ሠ": 5, "ረ": 6, "ሰ": 7, "ቀ": 8,
      "በ": 9, "ተ": 10, "ኀ": 11, "ነ": 12, "አ": 13, "ከ": 14, "ወ": 15, "ዐ": 16,
    };
    const number = geEzMap[letter];
    if (number) {
      const circleKey = `circle_${number}` as keyof typeof this.awudeNegestCircles;
      const circle = this.awudeNegestCircles[circleKey];
      if (circle) {
        return { number: circle.number, name: circle.name, description: circle.description };
      }
    }
    return null;
  }

  /**
   * Get health insights for a planet
   */
  getPlanetaryhealthInsights(planet: string): { organs: string[]; conditions: string[]; recommendations: string[] } | null {
    const planetKey = planet.toLowerCase() as keyof typeof this.planetaryhealth;
    if (this.planetaryhealth[planetKey]) {
      const data = this.planetaryhealth[planetKey];
      return {
        organs: data.organs,
        conditions: data.conditions,
        recommendations: data.strengthening,
      };
    }
    return null;
  }

  /**
   * Get Ethiopian seasonal advice
   */
  getSeasonalAdviceEthiopia(month: number): { season: string; advice: string[] } | null {
    // month: 0 = Jan, 5 = Jun, 8 = Sep, etc.
    if (month >= 5 && month <= 8) {
      const data = this.seasonalGuidance.kiremt;
      return { season: data.season, advice: [...data.nutritional_advice, ...data.lifestyle_advice] };
    } else if (month >= 9 || month <= 1) {
      const data = this.seasonalGuidance.bega;
      return { season: data.season, advice: [...data.nutritional_advice, ...data.lifestyle_advice] };
    } else {
      const data = this.seasonalGuidance.belg;
      return { season: data.season, advice: [...data.nutritional_advice, ...data.lifestyle_advice] };
    }
  }
}