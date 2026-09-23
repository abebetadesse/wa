import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile, DomainType } from "../types";

/**
 * Enhanced Ecological Knowledge Strand
 *
 * Integrates:
 * - 5 major ecosystems (Highlands, Mid-Highlands, Lowlands, Rift Valley, Desert)
 * - Climate patterns (Kiremt, Bega, Belg, Climate change impacts)
 * - Ethiopian biomes (Afromontane, Savanna, Desert)
 * - Ecological wellbeing risks (Malaria, Schistosomiasis, Dengue, Chikungunya, Leishmaniasis, Fluorosis, Podoconiosis)
 * - Water resources (Lakes, Rivers, Groundwater quality)
 * - Land use & degradation (Agriculture, Pastoralism, Deforestation, Soil erosion)
 * - Biodiversity & conservation (Endemic species, Protected areas)
 * - Environmental wellbeing policies & adaptation
 * - Cross‑strand linking with Epidemiological, Dietary, and Cultural strands
 * - Domain A (scientific/wellbeing risks) and Domain B (cultural/ecological context)
 * - Evidence‑weighted confidence and region‑specific recommendations
 * - User‑specific location/altitude matching
 */
export class EcologicalKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "ecological";
  readonly domain: DomainType = "wellbeing";

  // --- Alias registry for query expansion ---
  private queryAliases: Record<string, string[]> = {
    // Ecosystems
    highlands: ["highland", "dega", "wurch", "plateau", "mountain", "simien", "bale"],
    mid_highlands: ["mid‑highland", "woina", "dega", "agrarian", "highland fringe"],
    lowlands: ["lowland", "kolla", "bereha", "arid", "semi‑arid", "pastoral", "afar", "somali"],
    rift_valley: ["rift", "lake", "fluorosis", "fluoride", "schistosomiasis", "endod"],
    desert: ["desert", "danakil", "depression", "hot", "arid"],
    // Climate
    kiremt: ["kiremt", "rains", "monsoon", "june", "september", "malaria peak"],
    bega: ["bega", "dry", "harvest", "october", "february", "meningitis"],
    belg: ["belg", "short rains", "march", "may"],
    // wellbeing risks
    malaria: ["malaria", "plasmodium", "mosquito", "anopheles", "fever"],
    schistosomiasis: ["bilharzia", "snail", "lake", "rift valley", "endod"],
    fluorosis: ["fluorosis", "fluoride", "teeth", "bone", "skeletal"],
    podoconiosis: ["podoconiosis", "non‑filarial", "elephantiasis", "volcanic", "soil"],
    leishmaniasis: ["leishmaniasis", "kala‑azar", "sandfly", "visceral"],
    dengue: ["dengue", "aedes", "fever", "breakbone"],
    // Environmental
    deforestation: ["deforestation", "forest", "tree", "woodland"],
    erosion: ["erosion", "soil", "land degradation", "silt"],
    biodiversity: ["biodiversity", "endemic", "species", "conservation"],
    water: ["water", "lake", "river", "groundwater", "irrigation"],
  };

  // -------------------------------------------------------------------------
  // ECOSYSTEMS (expanded from original)
  // -------------------------------------------------------------------------
  private ecosystems = {
    highlands_dega_wurch: {
      id: "highlands",
      name: "Ethiopian Highlands (Dega & Wurch Zones)",
      altitude_range: "2,300m – 4,600m",
      climate: "Cool temperate to afro‑alpine; high UV‑B irradiance; reduced oxygen partial pressure (hypoxia)",
      wellbeing_implications: [
        "Physiological highland erythropoiesis and elevated daily basal iron requirements (+15% to +25% above sea‑level RDA)",
        "Cold stress and seasonal acute lower respiratory infections (pneumonia, bronchiolitis) in children",
        "Low ambient vector transmission (malaria transmission generally absent above 2,200m)",
        "Endemic goitre in heavily leached highland volcanic soils deficient in bioavailable iodine",
        "Risk of vitamin D deficiency despite high solar irradiance due to indoor lifestyles and clothing",
      ],
      agricultural_staples: ["Teff (Eragrostis tef)", "Barley (Gebs)", "Wheat (Sindi)", "Faba beans (Bakela)", "Highland potatoes"],
      traditional_healing_flora: ["Hagenia abyssinica (Kosso)", "Juniperus procera (Tid)", "Eucalyptus globulus (Bahr Zaf - introduced steam inhalation)"],
      ethiopian_context: [
        "Home to Addis Ababa (2,400m), Debre Berhan (2,800m), and the Simien/Bale massifs",
        "Unique high‑altitude adaptation prevents chronic mountain sickness seen in other global regions",
      ],
      recommendations: [
        "Ensure calibrated iron and protein intake to support elevated haemoglobin synthesis",
        "Use iodised salt to counteract leached highland soil iodine deficits",
        "Maintain adequate home ventilation when using indoor warming hearths",
        "Monitor vitamin D status; consider supplementation if indoor lifestyle is predominant",
      ],
    },
    mid_highlands_woina_dega: {
      id: "mid_highlands",
      name: "Mid‑Altitude Agrarian Belt (Woina Dega Zone)",
      altitude_range: "1,500m – 2,300m",
      climate: "Moderate temperate; annual rainfall 800–1,200mm; prime agricultural zone with highest demographic density",
      wellbeing_implications: [
        "Unstable seasonal and microclimatic malaria transmission along river valleys and irrigation dams",
        "Pollen and agro‑chemical respiratory sensitizations during planting and harvest seasons",
        "Intestinal helminthiasis (Ascaris, Trichuris) in wet agricultural soils",
        "Schistosomiasis in irrigated areas (snail habitats)",
      ],
      agricultural_staples: ["Teff", "Maize (Bekolo)", "Sorghum (Mashila)", "Coffee (Buna / Coffea arabica)", "Pulses (Lentils, Chickpeas)"],
      traditional_healing_flora: ["Ruta chalepensis (Tena Adam)", "Ocimum lamiifolium (Damakesse)", "Lepidium sativum (Feto)"],
      ethiopian_context: [
        "Heart of the Ethiopian grain and coffee economy (Jimma, Hawassa, Debre Markos, Gondar)",
        "Traditional garden medicinal plots ('Yeguaro Medhanit') maintain household herbal supply",
      ],
      recommendations: [
        "Utilise treated bed nets along river basin fringes",
        "Wash and thoroughly cook garden produce to eliminate soil helminths",
        "Monitor irrigation water quality to reduce snail habitats",
      ],
    },
    lowlands_kolla_bereha: {
      id: "lowlands",
      name: "Lowlands & Arid Basins (Kolla & Bereha Zones)",
      altitude_range: "Below 1,500m",
      climate: "Hot arid to semi‑arid; extreme ambient daytime temperatures (30°C–45°C); erratic precipitation",
      wellbeing_implications: [
        "Hyper‑endemic perennial and seasonal vector‑borne diseases: Plasmodium falciparum malaria, Visceral Leishmaniasis (Kala‑azar), Dengue fever, Chikungunya",
        "Dehydration, heat exhaustion, and urinary tract lithiasis",
        "Nutritional vulnerabilities during prolonged droughts (protein‑calorie and micronutrient wasting)",
        "High risk of aflatoxin contamination in stored grains (mycotoxins)",
      ],
      agricultural_staples: ["Sorghum", "Pearl millet (Dagussa)", "Camel milk", "Goat and cattle pastoral dairy"],
      traditional_healing_flora: ["Acacia senegal (Gum arabic)", "Commiphora myrrha (Karbe / Myrrh)", "Aloe debrana"],
      ethiopian_context: [
        "Spans the Afar depression, Somali region, Gambella, and lower Omo valley",
        "Pastoralist nomadic and semi‑nomadic lifestyles resilient to extreme arid ecologies",
      ],
      recommendations: [
        "Rigorous vector avoidance (long‑lasting insecticidal nets, indoor residual spraying)",
        "Prioritise electrolyte rehydration and clean water storage protection",
        "Ensure adequate food storage to prevent aflatoxin contamination (proper drying and hermetic bags)",
      ],
    },
    rift_valley_geochemical_basin: {
      id: "rift_valley",
      name: "Great East African Rift Valley Zone",
      altitude_range: "600m – 1,800m",
      climate: "Warm semi‑arid; active volcanic geology and tectonic lakes (Ziway, Langano, Shala, Awassa, Chamo)",
      wellbeing_implications: [
        "Endemic dental and skeletal fluorosis due to excessive geochemical fluoride in deep groundwater (> 1.5–10+ mg/L vs WHO 1.5 mg/L threshold)",
        "Intestinal and urogenital schistosomiasis (bilharzia) transmission via freshwater Bulinus and Biomphalaria snail hosts",
        "Silica‑rich volcanic dust exposure predisposing to non‑filarial elephantiasis (podoconiosis) in bare‑foot agriculturalists",
        "Risk of algal blooms (cyanobacteria) in some lakes producing toxins (microcystins)",
      ],
      agricultural_staples: ["Commercial vegetables", "Maize", "Fish from freshwater lakes", "Papaya and tropical fruits"],
      traditional_healing_flora: ["Phytolacca dodecandra (Endod - natural molluscicide controlling schistosomiasis snails)"],
      ethiopian_context: [
        "Stretches from Afar through the central lake basin down to Southern Nations",
        "Endod research led by Dr. Aklilu Lemma demonstrated global benchmark for eco‑friendly bilharzia control",
      ],
      recommendations: [
        "Utilise defluoridated drinking water filters (bone char or aluminium hydroxide systems) to prevent crippling skeletal fluorosis",
        "Avoid wading or swimming in stagnant freshwater lake shallows",
        "Wear protective footwear (shoes/boots) to prevent podoconiosis volcanic soil penetration",
        "Monitor lake water quality for cyanobacteria blooms",
      ],
    },
    desert_danakil: {
      id: "desert",
      name: "Danakil Desert & Extreme Arid Zone",
      altitude_range: "−125m to 500m (below sea level to low altitude)",
      climate: "Extremely hot and arid; one of the hottest places on Earth with annual temperatures > 40°C",
      wellbeing_implications: [
        "Severe dehydration and heatstroke risks during daytime exposure",
        "Hypersalinity and mineral‑rich waters (soda lakes) causing skin irritation and electrolyte imbalances",
        "Limited vector‑borne diseases but potential for cholera if water sources are contaminated",
        "High UV and solar radiation exposure leading to skin damage and eye disease",
      ],
      agricultural_staples: ["Dates", "Salt harvesting (mining)", "Limited subsistence crops"],
      traditional_healing_flora: ["Acacia species", "Drought‑resistant succulents"],
      ethiopian_context: [
        "The Danakil Depression is one of the most extreme environments on Earth",
        "Salt mining is a traditional livelihood with associated occupational wellbeing risks",
      ],
      recommendations: [
        "Avoid daytime outdoor exertion; wear protective clothing and hydrate copiously",
        "Use sunglasses and sun protection due to extreme UV",
        "Ensure safe water sources (desalination or imported) to avoid dehydration",
      ],
    },
  };

  // -------------------------------------------------------------------------
  // CLIMATE PATTERNS (enhanced with climate change)
  // -------------------------------------------------------------------------
  private seasonalCycles = {
    kiremt_rains: {
      season: "Kiremt (ዋናው ክረምት / Main Rains)",
      period: "June – September",
      characteristics: "Heavy monsoon rains, overcast skies, ambient humidity, temperature drop in highlands",
      epidemiological_hazards: [
        "Proliferation of Anopheles mosquito breeding pools causing the annual post‑Kiremt malaria epidemic wave",
        "Water supply contamination triggering acute watery diarrhoea (AWD / Cholera)",
        "Chilling highland dampness precipitating viral pneumonia and asthma exacerbations",
        "Flooding in lowland areas leading to displacement and water‑borne disease outbreaks",
      ],
      nutritional_patterns: ["Pre‑harvest 'lean season' before the new crops mature; reliance on preserved staples and wild green foraged plants (Gomen)"],
      recommendations: [
        "Reinforce insecticide‑treated net use; drain stagnant water near homes",
        "Ensure safe drinking water (boil or chlorinate)",
        "Maintain respiratory hygiene; avoid crowded indoor spaces",
      ],
    },
    bega_harvest: {
      season: "Bega (በጋ / Dry Harvest Season)",
      period: "October – February",
      characteristics: "Sunny warm days, cold cloudless nights with frost at high elevations, dry dusty north‑easterly winds",
      epidemiological_hazards: [
        "Dry winds and dust clouds predisposing to conjunctivitis, epistaxis, and respiratory mucosal irritation",
        "Meningococcal meningitis risk in the African meningitis belt during dry windy months",
        "Increased bushfires in dry savannas, causing smoke inhalation",
        "Dust exposure exacerbates podoconiosis (volcanic soil) and chronic lung disease",
      ],
      nutritional_patterns: ["Post‑harvest peak food availability: freshly threshed teff, new pulse crops, seasonal livestock slaughter for holidays"],
      recommendations: [
        "Use face coverings during dusty conditions; ensure hydration",
        "Maintain meningitis vaccination and early symptom recognition",
        "Store food properly to avoid rodent contamination",
      ],
    },
    belg_short_rains: {
      season: "Belg (በልግ / Minor Rains)",
      period: "March – May",
      characteristics: "Intermittent showers, variable humidity, early planting season for short‑cycle crops",
      epidemiological_hazards: ["Transient vector proliferation", "Flash flooding in arid lowland wadis", "Rising temperatures accelerate malaria transmission"],
      nutritional_patterns: ["Secondary harvest in Belg‑dependent zones; early seasonal fruits"],
      recommendations: [
        "Begin early vector control measures",
        "Prepare flood‑proof water sources; avoid flash flood areas",
      ],
    },
    climate_change: {
      season: "Climate Change Impacts (Ongoing)",
      period: "Long‑term trends",
      characteristics: "Rising average temperatures, increased frequency of droughts and floods, erratic rainfall patterns",
      epidemiological_hazards: [
        "Expansion of malaria and other vector‑borne diseases to higher altitudes (new highland transmission)",
        "Increased food insecurity due to crop failure",
        "Heat‑related morbidity (heatstroke, cardiovascular stress)",
        "Outbreak of new pathogens (e.g., Rift Valley fever) due to changing ecology",
      ],
      nutritional_patterns: ["Declining crop yields; increased reliance on imported food; micronutrient deficiencies"],
      recommendations: [
        "Support climate‑resilient agriculture (drought‑tolerant crops, irrigation efficiency)",
        "Strengthen disease surveillance in previously unaffected highland areas",
        "Promote early warning systems for extreme weather events",
        "Encourage community adaptation and disaster preparedness",
      ],
    },
  };

  // -------------------------------------------------------------------------
  // BIODIVERSITY & CONSERVATION
  // -------------------------------------------------------------------------
  private biodiversity = {
    afromontane_forests: {
      name: "Afromontane Forests",
      description: "High altitude forests with unique endemic species, including the Ethiopian wolf and Gelada baboon",
      locations: ["Bale Mountains", "Simien Mountains", "Arsi", "Choke"],
      endemic_plants: ["Hagenia abyssinica", "Juniperus procera", "Podocarpus gracilior", "Prunus africana"],
      ecosystem_services: ["Water catchment", "Carbon storage", "Medicinal plant source", "Tourism"],
      threats: ["Deforestation", "Agriculture encroachment", "Climate change"],
      conservation_status: "Critical; many areas are protected but still under pressure",
      wellbeing_relevance: "Clean water supply and biodiversity for medicinal plants",
    },
    savanna_woodlands: {
      name: "Savanna Woodlands",
      description: "Open grasslands with scattered acacia trees, covering much of the lowlands",
      locations: ["Gambella", "Omo valley", "Somali region", "Southern Ethiopia"],
      endemic_species: ["Acacia", "Commiphora", "Large herbivores (zebra, antelope)"],
      ecosystem_services: ["Grazing land for pastoralists", "Wildlife tourism", "Carbon sequestration"],
      threats: ["Overgrazing", "Desertification", "Bush encroachment", "Climate change"],
      wellbeing_relevance: "Supports pastoral livelihoods and traditional medicine (gum arabic, myrrh)",
    },
    wetlands_and_rivers: {
      name: "Wetlands & Riverine Ecosystems",
      description: "Riparian forests, lakes, and marshes that support high biodiversity",
      locations: ["Blue Nile / Abay", "Awash River", "Lake Tana", "Rift Valley lakes"],
      ecosystem_services: ["Freshwater supply", "Fisheries", "Irrigation", "Tourism"],
      threats: ["Water diversion", "Pollution (agricultural runoff)", "Invasive species (water hyacinth)"],
      wellbeing_relevance: "Water‑borne disease transmission (schistosomiasis) but also essential for livelihoods",
    },
  };

  // -------------------------------------------------------------------------
  // WATER RESOURCES & QUALITY
  // -------------------------------------------------------------------------
  private waterResources = {
    rift_valley_lakes: {
      name: "Rift Valley Lakes",
      description: "Freshwater and soda lakes with varying water quality",
      lakes: ["Ziway", "Langano", "Awasa", "Shala", "Chamo", "Abaya"],
      wellbeing_risks: ["Schistosomiasis (snail hosts)", "Cyanobacterial toxins (microcystins) in some lakes", "Fluoride in groundwater (affects drinking water)"],
      benefits: ["Fisheries", "Irrigation", "Tourism", "Biodiversity"],
      recommendations: [
        "Avoid swimming in lake shallows; use safe drinking water sources",
        "Monitor lake water quality for algal blooms",
        "Support sustainable fishing and irrigation practices",
      ],
    },
    rivers_and_groundwater: {
      name: "Rivers & Groundwater",
      description: "Major river systems and underground aquifers",
      major_rivers: ["Blue Nile (Abay)", "Awash", "Omo", "Tekeze", "Wabe Shebelle"],
      water_quality_issues: ["Sedimentation", "Agricultural runoff (pesticides, fertilisers)", "Industrial pollution (urban areas)"],
      wellbeing_risks: ["Water‑borne diseases (cholera, typhoid)", "Fluoride in Rift Valley groundwater"],
      recommendations: [
        "Promote safe drinking water practices (boiling, filtration)",
        "Reduce agricultural runoff through sustainable farming",
        "Monitor industrial wastewater discharge",
      ],
    },
  };

  // -------------------------------------------------------------------------
  // LAND USE & DEGRADATION
  // -------------------------------------------------------------------------
  private landUse = {
    deforestation: {
      description: "Rapid deforestation driven by agriculture, fuelwood, and logging",
      annual_loss: "Estimated 1.0‑1.5% forest cover per year",
      causes: ["Expansion of agriculture", "Charcoal production", "Population pressure", "Urbanisation"],
      consequences: ["Loss of biodiversity", "Soil erosion", "Water cycle disruption", "Reduced carbon storage"],
      wellbeing_impact: ["Loss of medicinal plants", "Increased respiratory issues (dust)", "Reduced clean water supply"],
      recommendations: [
        "Promote reforestation and agroforestry (e.g., planting trees on farms)",
        "Provide alternative energy sources to reduce fuelwood demand",
        "Enforce forest protection policies",
      ],
    },
    soil_erosion: {
      description: "Accelerated soil erosion due to deforestation, overgrazing, and inappropriate cultivation",
      severity: "High in highland areas; contributes to reservoir sedimentation",
      consequences: ["Loss of agricultural productivity", "Nutrient depletion", "Landslides", "Siltation of water bodies"],
      wellbeing_impact: ["Reduced food security", "Malnutrition", "Loss of traditional livelihoods"],
      recommendations: [
        "Implement terracing and contour ploughing",
        "Promote cover cropping and crop rotation",
        "Support community‑led watershed management",
      ],
    },
    pastoral_land_use: {
      description: "Pastoralism in arid and semi‑arid areas, with seasonal mobility",
      benefits: ["Sustainable use of marginal lands", "Rich livestock biodiversity"],
      challenges: ["Overgrazing near water points", "Land tenure conflicts", "Vulnerability to drought"],
      wellbeing_impact: ["Zoonotic diseases (anthrax, brucellosis)", "Water scarcity", "Malnutrition during droughts"],
      recommendations: [
        "Support pastoralist adaptation to climate change",
        "Improve water access and veterinary services",
        "Enhance livestock marketing and diversification",
      ],
    },
  };

  // -------------------------------------------------------------------------
  // ECOLOGICAL wellbeing RISKS (vector‑borne, zoonotic, environmental)
  // -------------------------------------------------------------------------
  private ecologicalwellbeingRisks = {
    malaria: {
      disease: "Malaria",
      ecology: "Breeding in stagnant water; Anopheles mosquitoes",
      endemic_areas: ["Below 1500m (lowlands, mid‑highlands)", "Seasonal in highlands (>2000m) due to climate change"],
      seasonal_patterns: "Kiremt rains peak; post‑rain surge",
      prevention: ["Insecticide‑treated nets (ITNs)", "Indoor residual spraying (IRS)", "Chemoprevention (IPTp)"],
      high_risk_groups: ["Children <5", "Pregnant women", "Non‑immune immigrants"],
      treatment: ["Artemisinin‑based combination therapies (ACTs)"],
      ethiopian_context: "Major wellbeing burden; emerging resistance to ACTs in some regions",
    },
    schistosomiasis: {
      disease: "Schistosomiasis (Bilharzia)",
      ecology: "Freshwater snail hosts (Bulinus, Biomphalaria)",
      endemic_areas: ["Rift Valley lakes", "Irrigation schemes", "River basins"],
      prevention: ["Avoid swimming/wading in endemic waters", "Molluscicides (Endod)", "Safe water supply"],
      treatment: ["Praziquantel"],
      ethiopian_context: "Endod research is a local scientific landmark; control programmes exist but coverage varies",
    },
    dengue_chikungunya: {
      disease: "Dengue & Chikungunya",
      ecology: "Aedes mosquitoes; urban and peri‑urban areas",
      endemic_areas: ["Dry and urban lowland areas (Dire Dawa, Harar, Addis Ababa?"],
      prevention: ["Eliminate standing water", "Use repellents", "Bed nets"],
      treatment: ["Supportive care"],
      ethiopian_context: "Emerging threat due to urbanisation and climate change",
    },
    visceral_leishmaniasis: {
      disease: "Visceral Leishmaniasis (Kala‑azar)",
      ecology: "Sandfly vectors; linked to arid lowlands",
      endemic_areas: ["Afar", "Somali", "Gambella", "Omo valley"],
      prevention: ["Insect repellents", "Protective clothing", "Control sandfly breeding"],
      treatment: ["Pentavalent antimonials", "Liposomal amphotericin B"],
      ethiopian_context: "Endemic in arid lowlands; associated with malnutrition and immunosuppression",
    },
    podoconiosis: {
      disease: "Podoconiosis (Non‑filarial Elephantiasis)",
      ecology: "Volcanic soil – silica dust penetrates bare feet, triggering lymphoedema",
      endemic_areas: ["Rift Valley highlands (Oromia, Sidama)", "Areas with red volcanic soil"],
      prevention: ["Wear shoes/boots", "Foot hygiene"],
      treatment: ["Lymphoedema management (elevation, exercise, antibiotics)"],
      ethiopian_context: "A major cause of lymphoedema; often mistaken for filariasis",
    },
    fluorosis: {
      disease: "Dental & Skeletal Fluorosis",
      ecology: "High fluoride in groundwater of Rift Valley (> 1.5 mg/L)",
      endemic_areas: ["Rift Valley (Ziway, Langano, Hawassa)"],
      prevention: ["Defluoridation of drinking water (bone char, aluminium hydroxide)", "Use safe surface water"],
      treatment: ["Supportive dental and orthopaedic care; no cure for skeletal fluorosis"],
      ethiopian_context: "Affects millions; children are most vulnerable to dental fluorosis",
    },
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

  private getRegion(userProfile: UserProfile): string | undefined {
    return userProfile.region || userProfile.location?.region;
  }

  private getAltitude(userProfile: UserProfile): number | undefined {
    return userProfile.location?.altitude || 2400; // default to Addis Ababa altitude
  }

  // -------------------------------------------------------------------------
  // Main query method
  // -------------------------------------------------------------------------
  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const results: StrandFinding[] = [];
    const normalized = this.normalizeQuery(query);
    const terms = normalized.split(/\s+/).filter((t) => t.length > 2);
    const userRegion = this.getRegion(userProfile);
    const userAltitude = this.getAltitude(userProfile);

    // ---- 1. Match Ecosystems ----
    for (const [key, eco] of Object.entries(this.ecosystems)) {
      let score = 0;
      const matches: string[] = [];

      // Direct name or alias match
      if (
        normalized.includes(eco.name.toLowerCase()) ||
        this.hasAlias(normalized, key as keyof typeof this.queryAliases)
      ) {
        score += 30;
        matches.push("ecosystem_name_match");
      }

      // User region/altitude matching
      if (userRegion && eco.name.toLowerCase().includes(userRegion.toLowerCase())) {
        score += 35;
        matches.push(`user_region_${userRegion}`);
      }

      if (key === "highlands_dega_wurch" && userAltitude && userAltitude >= 2200) {
        score += 30;
        matches.push("high_altitude_match");
      } else if (key === "lowlands_kolla_bereha" && userAltitude && userAltitude < 1500) {
        score += 30;
        matches.push("lowland_altitude_match");
      } else if (key === "rift_valley_geochemical_basin" && userAltitude && userAltitude >= 600 && userAltitude <= 1800) {
        score += 25;
        matches.push("rift_valley_altitude");
      } else if (key === "desert_danakil" && userAltitude && userAltitude < 500) {
        score += 25;
        matches.push("desert_altitude");
      }

      // Keyword scoring
      for (const term of terms) {
        if (eco.wellbeing_implications.some((hi) => hi.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`wellbeing_risk_${term}`);
        }
        if (eco.name.toLowerCase().includes(term) || eco.climate.toLowerCase().includes(term)) {
          score += 10;
          matches.push(`term_${term}`);
        }
        if (eco.ethiopian_context.some((ctx) => ctx.toLowerCase().includes(term))) {
          score += 10;
          matches.push(`ethio_${term}`);
        }
      }

      if (score > 15) {
        results.push({
          type: "ecological_zone",
          strand: this.strandName,
          domain: "wellbeing",
          name: eco.name.toUpperCase(),
          description: `Altitude range: ${eco.altitude_range}. Climate: ${eco.climate}.`,
          evidence: `Regional health risks: ${eco.wellbeing_implications.join("; ")}. Indigenous flora: ${eco.traditional_healing_flora.join(", ")}.`,
          ethiopian_context: eco.ethiopian_context,
          relevanceScore: Math.min(score / 60, 0.96),
          confidence: 0.90,
          matches,
          recommendations: eco.recommendations,
          management: eco.recommendations,
          sources: ["Ethiopian Biodiversity Institute", "Agro‑ecological Atlas of Ethiopia"],
          category: "Domain A",
          severity: "moderate",
        });
      }
    }

    // ---- 2. Match Seasonal Climate Cycles ----
    for (const [key, season] of Object.entries(this.seasonalCycles)) {
      let score = 0;
      const matches: string[] = [];

      if (normalized.includes(key.split("_")[0]) || season.season.toLowerCase().includes(normalized) || this.hasAlias(normalized, key as keyof typeof this.queryAliases)) {
        score += 30;
        matches.push("season_direct_match");
      }

      for (const term of terms) {
        if (season.epidemiological_hazards.some((h) => h.toLowerCase().includes(term))) {
          score += 15;
          matches.push(`seasonal_hazard_${term}`);
        }
        if (season.recommendations?.some((r) => r.toLowerCase().includes(term))) {
          score += 10;
          matches.push(`rec_${term}`);
        }
      }

      if (score > 15) {
        results.push({
          type: "seasonal_climate_pattern",
          strand: this.strandName,
          domain: "wellbeing",
          name: season.season.toUpperCase(),
          description: `Period: ${season.period}. Characteristics: ${season.characteristics}.`,
          evidence: `Seasonal epidemiological vulnerabilities: ${season.epidemiological_hazards.join("; ")}.`,
          ethiopian_context: ["Seasonal shifts govern vector density, crop harvest, and wellbeing risks"],
          relevanceScore: Math.min(score / 50, 0.90),
          confidence: 0.88,
          matches,
          recommendations: season.recommendations || ["Adapt hygiene and vector precautions to current seasonal patterns."],
          management: season.recommendations || [],
          sources: ["National Meteorology Agency of Ethiopia", "EPHI Climate‑Sensitive Diseases Surveillance"],
          category: "Domain A",
          severity: "moderate",
        });
      }
    }

    // ---- 3. Biodiversity (Domain B) ----
    if (this.hasAlias(normalized, "biodiversity") || normalized.includes("conservation") || normalized.includes("endemic")) {
      for (const [key, bio] of Object.entries(this.biodiversity)) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(bio.name.toLowerCase())) {
          score += 30;
          matches.push("biodiversity_match");
        }

        for (const term of terms) {
          if (bio.description.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (bio.threats.some((t) => t.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`threat_${term}`);
          }
          if (bio.wellbeing_relevance?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`wellbeing_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "biodiversity",
            strand: this.strandName,
            domain: "cultural",
            name: bio.name.toUpperCase(),
            description: bio.description,
            evidence: `Ecosystem services: ${bio.ecosystem_services.join(", ")}. Threats: ${bio.threats.join(", ")}.`,
            ethiopian_context: ["Ethiopia's biodiversity is globally significant"],
            relevanceScore: Math.min(score / 50, 0.85),
            confidence: 0.80,
            matches,
            recommendations: ["Support conservation efforts", "Promote sustainable land use"],
            management: [],
            sources: ["Ethiopian Biodiversity Institute", "IUCN"],
            category: "Domain B",
            severity: "low",
          });
        }
      }
    }

    // ---- 4. Water Resources ----
    if (this.hasAlias(normalized, "water") || normalized.includes("lake") || normalized.includes("river") || normalized.includes("groundwater")) {
      for (const [key, water] of Object.entries(this.waterResources)) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(water.name.toLowerCase())) {
          score += 30;
          matches.push("water_match");
        }

        for (const term of terms) {
          if (water.description?.toLowerCase().includes(term)) {
            score += 10;
            matches.push(`desc_${term}`);
          }
          if (water.wellbeing_risks?.some((r) => r.toLowerCase().includes(term))) {
            score += 20;
            matches.push(`risk_${term}`);
          }
          const waterBodies: string[] = (water as any).lakes || (water as any).major_rivers || [];
          if (waterBodies.some((l) => l.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`water_${term}`);
          }
        }

        if (score > 15) {
          results.push({
            type: "water_resource",
            strand: this.strandName,
            domain: "wellbeing",
            name: water.name.toUpperCase(),
            description: water.description || "Water resource with wellbeing implications",
            evidence: `wellbeing risks: ${water.wellbeing_risks?.join(", ") || "N/A"}. Benefits: ${(water as any).benefits?.join(", ") || "N/A"}.`,
            ethiopian_context: "Water resources are vital for wellbeing, agriculture, and livelihoods",
            relevanceScore: Math.min(score / 50, 0.88),
            confidence: 0.82,
            matches,
            recommendations: water.recommendations || [],
            management: water.recommendations || [],
            sources: ["Ministry of Water, Irrigation and Electricity", "EPHI Water Quality Reports"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 5. Land Use & Degradation ----
    if (this.hasAlias(normalized, "deforestation") || this.hasAlias(normalized, "erosion") || normalized.includes("land use")) {
      for (const [key, land] of Object.entries(this.landUse)) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(key) || land.description.toLowerCase().includes(normalized)) {
          score += 30;
          matches.push("land_use_match");
        }

        for (const term of terms) {
          if ((land as any).causes?.some((c: string) => c.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`cause_${term}`);
          }
          if ((land as any).consequences?.some((c: string) => c.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`conseq_${term}`);
          }
          const wellbeingImpacts: string[] = Array.isArray(land.wellbeing_impact) ? land.wellbeing_impact : (land.wellbeing_impact ? [land.wellbeing_impact] : []);
          if (wellbeingImpacts.some((h) => h.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`wellbeing_${term}`);
          }
        }

        if (score > 15) {
          const wellbeingImpacts: string[] = Array.isArray(land.wellbeing_impact) ? land.wellbeing_impact : (land.wellbeing_impact ? [land.wellbeing_impact] : []);
          results.push({
            type: "land_use",
            strand: this.strandName,
            domain: "wellbeing",
            name: key.toUpperCase(),
            description: land.description,
            evidence: `Consequences: ${((land as any).consequences || (land as any).challenges || []).join(", ") || "N/A"}. wellbeing impact: ${wellbeingImpacts.join("; ") || "N/A"}.`,
            ethiopian_context: "Land degradation threatens food security and wellbeing",
            relevanceScore: Math.min(score / 50, 0.85),
            confidence: 0.80,
            matches,
            recommendations: land.recommendations || [],
            management: land.recommendations || [],
            sources: ["Ethiopian Ministry of Environment", "FAO"],
            category: "Domain A",
            severity: "moderate",
          });
        }
      }
    }

    // ---- 6. Ecological wellbeing Risks (vector‑borne, zoonotic, environmental) ----
    if (
      this.hasAlias(normalized, "malaria") ||
      this.hasAlias(normalized, "schistosomiasis") ||
      this.hasAlias(normalized, "dengue") ||
      this.hasAlias(normalized, "leishmaniasis") ||
      this.hasAlias(normalized, "podoconiosis") ||
      this.hasAlias(normalized, "fluorosis")
    ) {
      for (const [key, risk] of Object.entries(this.ecologicalwellbeingRisks)) {
        let score = 0;
        const matches: string[] = [];

        if (normalized.includes(risk.disease.toLowerCase()) || this.hasAlias(normalized, key as keyof typeof this.queryAliases)) {
          score += 40;
          matches.push("disease_match");
        }

        for (const term of terms) {
          if (risk.ecology?.toLowerCase().includes(term)) {
            score += 15;
            matches.push(`ecology_${term}`);
          }
          if (risk.endemic_areas?.some((a) => a.toLowerCase().includes(term))) {
            score += 15;
            matches.push(`area_${term}`);
          }
          if (risk.prevention?.some((p) => p.toLowerCase().includes(term))) {
            score += 10;
            matches.push(`prevent_${term}`);
          }
        }

        // User region match
        if (userRegion && risk.endemic_areas?.some((a) => a.toLowerCase().includes(userRegion.toLowerCase()))) {
          score += 25;
          matches.push(`user_region_${userRegion}`);
        }

        if (score > 15) {
          results.push({
            type: "ecological_wellbeing_risk",
            strand: this.strandName,
            domain: "wellbeing",
            name: risk.disease.toUpperCase(),
            description: `Ecology: ${risk.ecology}. Endemic areas: ${risk.endemic_areas?.join(", ") || "N/A"}.`,
            evidence: `Seasonal patterns: ${(risk as any).seasonal_patterns || "N/A"}. Prevention: ${risk.prevention?.join(", ") || "N/A"}.`,
            ethiopian_context: risk.ethiopian_context || "Significant wellbeing concern in specific ecological zones",
            relevanceScore: Math.min(score / 60, 0.95),
            confidence: 0.92,
            matches,
            recommendations: risk.prevention || [],
            management: Array.isArray((risk as any).treatment) ? (risk as any).treatment : ((risk as any).treatment ? [(risk as any).treatment] : []),
            sources: ["EPHI Disease Surveillance", "WHO"],
            category: "Domain A",
            severity: "high",
            risk_assessment: {
              level: "high",
              risk_factors: [risk.ecology || "", ...(risk.endemic_areas || [])],
              recommendations: risk.prevention || [],
            },
          });
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // -------------------------------------------------------------------------
  // Helper methods for integration
  // -------------------------------------------------------------------------

  /**
   * Get ecological wellbeing risks for a given region
   */
  getRisksForRegion(region: string): string[] {
    const risks: string[] = [];
    for (const [key, risk] of Object.entries(this.ecologicalwellbeingRisks)) {
      if (risk.endemic_areas?.some((a) => a.toLowerCase().includes(region.toLowerCase()))) {
        risks.push(`${risk.disease}: ${risk.ecology}`);
      }
    }
    return risks;
  }

  /**
   * Get ecosystem recommendations for altitude
   */
  getEcosystemRecommendations(altitude: number): string[] {
    if (altitude >= 2200) {
      return this.ecosystems.highlands_dega_wurch.recommendations;
    } else if (altitude >= 1500 && altitude < 2200) {
      return this.ecosystems.mid_highlands_woina_dega.recommendations;
    } else if (altitude >= 600 && altitude < 1500) {
      return this.ecosystems.rift_valley_geochemical_basin.recommendations;
    } else {
      return this.ecosystems.lowlands_kolla_bereha.recommendations;
    }
  }

  /**
   * Get seasonal wellbeing advice
   */
  getSeasonalAdvice(currentMonth: number): string[] {
    // Month: 0 = Jan, 5 = Jun, 8 = Sep, etc.
    if (currentMonth >= 5 && currentMonth <= 8) {
      return this.seasonalCycles.kiremt_rains.recommendations || [];
    } else if (currentMonth >= 9 || currentMonth <= 1) {
      return this.seasonalCycles.bega_harvest.recommendations || [];
    } else {
      return this.seasonalCycles.belg_short_rains.recommendations || [];
    }
  }

  /**
   * Get water quality advice for Rift Valley residents
   */
  getRiftValleyWaterAdvice(): string[] {
    return this.waterResources.rift_valley_lakes.recommendations || [];
  }
}