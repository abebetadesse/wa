/**
 * Multi-scale biological and biochemical analysis. DOMAIN A.
 *
 * For each symptom category it lays out a causal chain across four levels (molecular & cellular,
 * biochemical pathway, physiological & organ system, whole person) and pairs each cause with the
 * mechanisms by which candidate plants' constituents are reported to act. These are mechanistic
 * hypotheses drawn mostly from laboratory and animal studies: they explain, they do not diagnose,
 * and they never override the safety matrix.
 */
import type { SymptomCategory } from "@/lib/shared/symptomCategories";

export type Level = "molecular" | "pathway" | "physiological" | "organism";
export const LEVEL_LABELS: Record<Level, string> = {
  molecular: "Molecular & cellular",
  pathway: "Biochemical pathway",
  physiological: "Physiological & organ system",
  organism: "Whole person (what is felt)",
};

type Action =
  | "ros_scavenging"
  | "antioxidant_enzymes"
  | "membrane_stabilization"
  | "mast_cell_stabilization"
  | "cox2_inhibition"
  | "lox5_inhibition"
  | "nfkb_inhibition"
  | "insulin_sensitising"
  | "mucilage_coating"
  | "carminative"
  | "enos_activation"
  | "antimicrobial"
  | "counter_irritant"
  | "bronchodilator"
  | "phytate_breakdown";

const ACTIONS: Record<Action, { level: Level; mechanism: string }> = {
  ros_scavenging: { level: "molecular", mechanism: "Polyphenols donate hydrogen atoms to superoxide (O₂•⁻) and hydroxyl radicals, ending lipid-peroxidation chain reactions." },
  antioxidant_enzymes: { level: "molecular", mechanism: "Nrf2 activation up-regulates superoxide dismutase (SOD), catalase and glutathione peroxidase, clearing H₂O₂." },
  membrane_stabilization: { level: "molecular", mechanism: "Flavonoids intercalate into membranes and chelate iron, protecting phospholipids from peroxidation." },
  mast_cell_stabilization: { level: "molecular", mechanism: "Flavonoids (quercetin-type) reduce calcium influx into mast cells, limiting degranulation and histamine release at H₁ receptors." },
  cox2_inhibition: { level: "pathway", mechanism: "Flavonoids and gingerols occupy the cyclo-oxygenase-2 (COX-2) active site, lowering conversion of arachidonic acid to PGE₂." },
  lox5_inhibition: { level: "pathway", mechanism: "Polyphenols and terpenoids inhibit 5-lipoxygenase (5-LOX), reducing leukotriene B₄ (LTB₄)." },
  nfkb_inhibition: { level: "pathway", mechanism: "Terpenoids and thymoquinone-type quinones block NF-κB p65 nuclear translocation, down-regulating TNF-α, IL-1β and IL-6." },
  insulin_sensitising: { level: "pathway", mechanism: "AMPK activation and slower carbohydrate digestion improve glucose uptake (why these plants add to diabetes medicines)." },
  mucilage_coating: { level: "physiological", mechanism: "Polysaccharide mucilage forms a protective film over mucosa, reducing acid and irritant contact." },
  carminative: { level: "physiological", mechanism: "Volatile phenols (thymol, carvacrol, eugenol) relax gut smooth muscle via calcium-channel effects, easing spasm and gas." },
  enos_activation: { level: "physiological", mechanism: "Polyphenols activate endothelial nitric oxide synthase (eNOS), improving microvascular tone and reducing leakiness." },
  antimicrobial: { level: "physiological", mechanism: "Organosulfur compounds and essential oils disrupt microbial membranes and biofilms." },
  counter_irritant: { level: "physiological", mechanism: "Isothiocyanates stimulate skin TRPA1 receptors, producing warmth that masks deeper joint pain (a rubefacient effect)." },
  bronchodilator: { level: "physiological", mechanism: "1,8-cineole and gingerols relax airway smooth muscle and thin mucus." },
  phytate_breakdown: { level: "pathway", mechanism: "Fermentation phytases dephosphorylate phytate (IP6 → lower inositol phosphates), releasing Fe²⁺ and Zn²⁺ for absorption." },
};

interface Constituent {
  compound: string;
  compoundClass: string;
  actions: Action[];
  topicalOnly?: boolean;
}

/** Reported constituents of plants in the safety matrix (by slug). */
export const PLANT_CONSTITUENTS: Record<string, { plant: string; constituents: Constituent[] }> = {
  "tena-adam": { plant: "Ruta chalepensis", constituents: [{ compound: "Rutin", compoundClass: "flavonoid glycoside", actions: ["ros_scavenging", "membrane_stabilization", "cox2_inhibition"] }, { compound: "Chalepensin (furanocoumarin)", compoundClass: "furanocoumarin", actions: ["antimicrobial"] }] },
  "nech-shinkurt": { plant: "Allium sativum", constituents: [{ compound: "Allicin and ajoene", compoundClass: "organosulfur", actions: ["antimicrobial", "nfkb_inhibition", "enos_activation"] }] },
  abish: { plant: "Trigonella foenum-graecum", constituents: [{ compound: "Galactomannan mucilage", compoundClass: "polysaccharide", actions: ["mucilage_coating", "insulin_sensitising"] }, { compound: "Diosgenin", compoundClass: "steroidal saponin", actions: ["nfkb_inhibition"] }] },
  damakesse: { plant: "Ocimum lamiifolium", constituents: [{ compound: "Rosmarinic acid", compoundClass: "phenolic acid", actions: ["ros_scavenging", "lox5_inhibition"] }, { compound: "Monoterpenes", compoundClass: "essential oil", actions: ["antimicrobial", "carminative"] }] },
  ariti: { plant: "Artemisia afra", constituents: [{ compound: "1,8-Cineole and thujone", compoundClass: "monoterpenes", actions: ["bronchodilator", "antimicrobial"] }, { compound: "Luteolin-type flavones", compoundClass: "flavonoid", actions: ["cox2_inhibition", "lox5_inhibition"] }] },
  zinjibil: { plant: "Zingiber officinale", constituents: [{ compound: "6-Gingerol and shogaols", compoundClass: "phenylpropanoid", actions: ["cox2_inhibition", "lox5_inhibition", "nfkb_inhibition", "bronchodilator"] }] },
  "bahir-zaf": { plant: "Eucalyptus globulus", constituents: [{ compound: "1,8-Cineole", compoundClass: "monoterpene oxide", actions: ["bronchodilator", "nfkb_inhibition"], topicalOnly: true }] },
  embuay: { plant: "Solanum incanum", constituents: [{ compound: "Solasodine glycoalkaloids", compoundClass: "steroidal glycoalkaloid", actions: ["antimicrobial"], topicalOnly: true }] },
  gizawa: { plant: "Withania somnifera", constituents: [{ compound: "Withanolides (withaferin A)", compoundClass: "steroidal lactone", actions: ["nfkb_inhibition", "antioxidant_enzymes"] }] },
  feto: { plant: "Lepidium sativum", constituents: [{ compound: "Seed mucilage", compoundClass: "polysaccharide", actions: ["mucilage_coating"] }, { compound: "Glucosinolates", compoundClass: "glucosinolate", actions: ["antioxidant_enzymes"] }] },
  senafich: { plant: "Brassica nigra", constituents: [{ compound: "Sinigrin → allyl isothiocyanate", compoundClass: "glucosinolate", actions: ["counter_irritant"], topicalOnly: true }] },
  telba: { plant: "Linum usitatissimum", constituents: [{ compound: "Seed mucilage", compoundClass: "polysaccharide", actions: ["mucilage_coating"] }, { compound: "Alpha-linolenic acid and lignans", compoundClass: "omega-3 fatty acid / lignan", actions: ["nfkb_inhibition", "ros_scavenging"] }] },
  tosign: { plant: "Thymus schimperi", constituents: [{ compound: "Thymol and carvacrol", compoundClass: "phenolic monoterpene", actions: ["carminative", "antimicrobial", "ros_scavenging"] }] },
  "tikur-azmud": { plant: "Nigella sativa", constituents: [{ compound: "Thymoquinone", compoundClass: "quinone", actions: ["nfkb_inhibition", "antioxidant_enzymes", "insulin_sensitising", "mast_cell_stabilization"] }] },
  "tej-sar": { plant: "Cymbopogon citratus", constituents: [{ compound: "Citral", compoundClass: "monoterpene aldehyde", actions: ["antimicrobial"] }, { compound: "Luteolin glycosides", compoundClass: "flavonoid", actions: ["enos_activation", "ros_scavenging"] }] },
  woyra: { plant: "Olea europaea subsp. cuspidata", constituents: [{ compound: "Oleuropein and hydroxytyrosol", compoundClass: "secoiridoid polyphenol", actions: ["enos_activation", "ros_scavenging"] }] },
};

interface CategoryChain {
  molecular: string[];
  pathway: string[];
  physiological: string[];
  organism: { symptom: string; linkedTo: string }[];
  relevant: Action[];
}

const INFLAMMATION_CORE = {
  molecular: ["Reactive oxygen species (O₂•⁻, H₂O₂) from uncoupled mitochondrial electron transport peroxidise membrane lipids.", "Mast-cell degranulation releases histamine that over-activates H₁ receptors."],
  pathway: ["Phospholipase A₂ frees arachidonic acid; COX-2 turns it into PGE₂ (pain, throbbing) and 5-LOX into leukotrienes (LTB₄).", "NF-κB p65 moves into the nucleus and switches on TNF-α, IL-1β and IL-6."],
};

const CHAINS: Record<SymptomCategory, CategoryChain> = {
  digestive: { ...INFLAMMATION_CORE, physiological: ["Breakdown of the mucosal barrier lets acid and microbes irritate the gut wall.", "Smooth-muscle spasm and gas distension of the intestine."], organism: [{ symptom: "Cramping belly pain", linkedTo: "Smooth-muscle spasm and PGE₂-sensitised nerve endings" }, { symptom: "Bloating and wind", linkedTo: "Gas distension with slowed transit" }], relevant: ["carminative", "mucilage_coating", "antimicrobial", "cox2_inhibition", "ros_scavenging"] },
  stomach_acid: { molecular: INFLAMMATION_CORE.molecular, pathway: ["Reduced prostaglandin protection of the stomach lining (for example after NSAIDs) and NF-κB-driven inflammation."], physiological: ["Disruption of the gastric mucosal barrier with back-diffusion of protons (H⁺) into the tissue."], organism: [{ symptom: "Burning pain high in the belly", linkedTo: "Acid back-diffusion across a damaged mucosal barrier" }], relevant: ["mucilage_coating", "ros_scavenging", "nfkb_inhibition"] },
  headache: { ...INFLAMMATION_CORE, physiological: ["Dilation and PGE₂-sensitised nerves of meningeal blood vessels (trigeminovascular activation).", "Sympathetic overdrive with muscle tension in scalp and neck."], organism: [{ symptom: "Throbbing, one-sided headache", linkedTo: "COX-2-derived PGE₂ sensitising trigeminal nerve endings around dilated vessels" }, { symptom: "Band-like tension", linkedTo: "Sustained contraction of pericranial muscles" }], relevant: ["cox2_inhibition", "lox5_inhibition", "enos_activation", "ros_scavenging"] },
  febrile: { molecular: ["Microbial products activate immune cells; IL-1β and IL-6 reach the hypothalamus."], pathway: ["COX-2 in hypothalamic endothelium produces PGE₂, raising the body's temperature set point."], physiological: ["Shivering and skin vasoconstriction generate and conserve heat until the new set point is reached."], organism: [{ symptom: "Fever with shivering", linkedTo: "PGE₂ resetting the hypothalamic set point" }], relevant: ["cox2_inhibition", "nfkb_inhibition", "antimicrobial"] },
  respiratory: { ...INFLAMMATION_CORE, physiological: ["Airway smooth-muscle constriction and thick mucus.", "Microvascular leakiness swelling the airway lining."], organism: [{ symptom: "Cough and chest tightness", linkedTo: "Leukotriene-driven bronchoconstriction and mucus" }], relevant: ["bronchodilator", "lox5_inhibition", "antimicrobial", "mast_cell_stabilization"] },
  dermal: { ...INFLAMMATION_CORE, physiological: ["Endothelial hyperpermeability causing redness and swelling; broken skin invites infection."], organism: [{ symptom: "Itching and redness", linkedTo: "Histamine at H₁ receptors and leaky capillaries" }, { symptom: "Weeping sores", linkedTo: "Barrier loss with bacterial colonisation" }], relevant: ["antimicrobial", "mast_cell_stabilization", "ros_scavenging", "membrane_stabilization"] },
  joint: { ...INFLAMMATION_CORE, physiological: ["Synovial inflammation with cartilage-degrading enzymes; stiffness after rest."], organism: [{ symptom: "Aching, stiff joints", linkedTo: "PGE₂ and cytokines in the synovium" }], relevant: ["cox2_inhibition", "nfkb_inhibition", "counter_irritant", "ros_scavenging"] },
  blood_sugar: { molecular: ["High glucose drives glycation and mitochondrial ROS production."], pathway: ["Insulin resistance: reduced AMPK and GLUT4 activity in muscle."], physiological: ["Fluctuating glucose strains blood vessels and nerves."], organism: [{ symptom: "Thirst, tiredness, frequent urination", linkedTo: "Glucose spilling into urine and pulling water with it" }], relevant: ["insulin_sensitising", "antioxidant_enzymes", "mucilage_coating"] },
  heart_fatigue: { molecular: ["Oxidative stress in vessel walls reduces nitric oxide."], pathway: ["NF-κB-driven vascular inflammation."], physiological: ["Endothelial dysfunction and sympathetic overdrive raise blood pressure and cardiac workload."], organism: [{ symptom: "Tiredness and breathlessness on effort", linkedTo: "Reduced cardiac reserve (always needs a clinical check)" }], relevant: ["enos_activation", "ros_scavenging"] },
  tremor: { molecular: ["Neuronal oxidative stress in motor circuits."], pathway: ["Imbalance of excitatory and inhibitory signalling."], physiological: ["Sympathetic overdrive (stress, stimulants, thyroid excess) amplifies physiological tremor."], organism: [{ symptom: "Shaking of the hands", linkedTo: "Amplified motor oscillation (stimulants, anxiety, medicines or nervous-system disease)" }], relevant: ["antioxidant_enzymes"] },
  general: { molecular: INFLAMMATION_CORE.molecular, pathway: INFLAMMATION_CORE.pathway, physiological: ["Low-grade inflammation and nutrient gaps sap energy."], organism: [{ symptom: "General tiredness", linkedTo: "Many causes, including anaemia from poor iron absorption" }], relevant: ["ros_scavenging", "phytate_breakdown"] },
};

export interface LevelBreakdown {
  level: Level;
  label: string;
  causes: string[];
  solutions: { mechanism: string; sources: { plant: string; slug: string; compound: string; topicalOnly: boolean }[] }[];
}

export interface BiochemicalAnalysis {
  categories: SymptomCategory[];
  levels: LevelBreakdown[];
  correlations: { symptom: string; cellularEvent: string; phytochemicals: string[] }[];
  evidenceNote: string;
}

export function analyseBiochemistry(input: { categories: SymptomCategory[]; plantSlugs: string[]; nutrientGaps?: ("iron" | "zinc")[] }): BiochemicalAnalysis {
  const categories: SymptomCategory[] = input.categories.length ? [...new Set(input.categories)] : ["general"];
  const chains = categories.map((category) => CHAINS[category]);
  const relevant = new Set<Action>(chains.flatMap((chain) => chain.relevant));
  if (input.nutrientGaps?.length) relevant.add("phytate_breakdown");

  const sourcesFor = (action: Action) =>
    input.plantSlugs.flatMap((slug) =>
      (PLANT_CONSTITUENTS[slug]?.constituents ?? []).filter((c) => c.actions.includes(action)).map((c) => ({ plant: PLANT_CONSTITUENTS[slug].plant, slug, compound: c.compound, topicalOnly: Boolean(c.topicalOnly) })),
    );

  const levels: LevelBreakdown[] = (["molecular", "pathway", "physiological", "organism"] as Level[]).map((level) => {
    const causes = level === "organism" ? [...new Set(chains.flatMap((chain) => chain.organism.map((o) => `${o.symptom}: ${o.linkedTo}`)))] : [...new Set(chains.flatMap((chain) => chain[level]))];
    const solutions = [...relevant]
      .filter((action) => ACTIONS[action].level === level)
      .map((action) => ({
        mechanism: action === "phytate_breakdown" ? `${ACTIONS[action].mechanism} (traditional ersho fermentation of injera and kocho)` : ACTIONS[action].mechanism,
        sources: sourcesFor(action),
      }))
      .filter((solution) => solution.sources.length || solution.mechanism.includes("fermentation"));
    return { level, label: LEVEL_LABELS[level], causes, solutions };
  });

  const correlations = chains.flatMap((chain) =>
    chain.organism.map((o) => ({
      symptom: o.symptom,
      cellularEvent: o.linkedTo,
      phytochemicals: [...new Set(chain.relevant.flatMap((action) => sourcesFor(action).map((s) => `${s.compound} (${s.plant}${s.topicalOnly ? ", on the skin only" : ""})`)))],
    })),
  );

  return {
    categories,
    levels,
    correlations,
    evidenceNote: "Mechanisms are reported mostly from laboratory and animal studies. They explain how a plant might act; they do not show that it works for this person, and they never override the safety matrix.",
  };
}
