import { CausalPathway, KnowledgeStrandType, StrandFinding, UserProfile } from "../types";

export class CausalInferenceEngine {
  buildCausalPathways(
    query: string,
    findings: StrandFinding[],
    userProfile: UserProfile
  ): CausalPathway[] {
    const pathways: CausalPathway[] = [];
    const normalized = query.toLowerCase();

    // 1. Malaria / Febrile Pathway
    if (normalized.includes("fever") || normalized.includes("malaria") || normalized.includes("headache") || normalized.includes("ትኩሳት") || normalized.includes("ወባ")) {
      pathways.push({
        id: "pathway-febrile-malaria",
        title: "Ecology to Febrile Parasitemia Pathway",
        description: "Tracing lowland climate conditions and vector dynamics to acute erythrocytic lysis and systemic fever",
        nodes: [
          { id: "n1", label: "Warm Lowland Ecology & Stagnant Pools", domain: "ecological", description: "Post-Kiremt rainfall produces optimal ambient breeding conditions for Anopheles arabiensis" },
          { id: "n2", label: "Sporozoite Inoculation & Hepatic Schizogony", domain: "biological", description: "Plasmodium sporozoites invade hepatocytes and mature over 7-14 days" },
          { id: "n3", label: "Erythrocyte Invasion & Synchronous Rupture", domain: "biochemical", description: "Merozoites lyse red blood cells, releasing hemozoin pigment and pyrogenic cytokines (TNF-α, IL-1)" },
          { id: "n4", label: "Acute Fever Paroxysms, Rigors & Fatigue", domain: "symptom", description: "Patient experiences cyclic high fever, throbbing frontal headache, and hemolytic anemia" },
          { id: "n5", label: "Integrated Solution: Artemether-Lumefantrine + LLIN + Hydration", domain: "remedy", description: "Prompt parasitological confirmation, first-line ACT antimalarial, electrolyte fluid support, and bed net protection" },
        ],
        edges: [
          { from: "n1", to: "n2", label: "Vector transmission" },
          { from: "n2", to: "n3", label: "Blood-stage cycle" },
          { from: "n3", to: "n4", label: "Pyrogenic cytokine surge" },
          { from: "n4", to: "n5", label: "Clinical resolution" },
        ],
        integratedSolution: [
          "Seek immediate blood smear microscopy or Rapid Diagnostic Test (RDT) at a clinic",
          "Complete full 3-day course of Artemether-Lumefantrine (Coartem) if positive",
          "Drink oral rehydration salts (ORS) or fresh lemon-honey water to restore electrolytes",
          "Sleep under Long-Lasting Insecticidal Nets (LLINs) every night",
        ],
      });
    }

    // 2. Iron Deficiency Anemia & Highland Hypoxia Pathway
    if (normalized.includes("fatigue") || normalized.includes("tired") || normalized.includes("anemia") || normalized.includes("iron") || normalized.includes("ድካም") || normalized.includes("ደም ማነስ")) {
      pathways.push({
        id: "pathway-anemia-iron",
        title: "Highland Hypoxia & Micronutrient Bioavailability Pathway",
        description: "Tracing altitude oxygen demands and unfermented dietary phytates to microcytic anemia and chronic exhaustion",
        nodes: [
          { id: "n1", label: "Highland Atmospheric Hypoxia (2,400m+)", domain: "ecological", description: "Reduced oxygen partial pressure triggers renal erythropoietin secretion requiring higher iron stores" },
          { id: "n2", label: "Dietary Phytates & Coffee Polyphenols", domain: "dietary", description: "Unfermented grains or drinking coffee directly with meals chelates non-heme iron in the duodenum" },
          { id: "n3", label: "Impaired Heme Synthesis & Microcytosis", domain: "biochemical", description: "Inadequate ferrous iron restricts erythroblast hemoglobin assembly, decreasing oxygen-carrying capacity" },
          { id: "n4", label: "Chronic Lethargy, Cold Intolerance & Brain Fog", domain: "symptom", description: "Cellular ATP production slows due to suboptimal cytochrome oxidase electron transport" },
          { id: "n5", label: "Integrated Solution: 4-Day Ersho Injera + Vitamin C + Spaced Coffee", domain: "remedy", description: "Maximize phytate degradation via long fermentation, add citrus to pulse wots, space coffee 90 minutes" },
        ],
        edges: [
          { from: "n1", to: "n3", label: "Elevates basal iron need" },
          { from: "n2", to: "n3", label: "Inhibits intestinal uptake" },
          { from: "n3", to: "n4", label: "Tissue oxygen debt" },
          { from: "n4", to: "n5", label: "Nutritional restitution" },
        ],
        integratedSolution: [
          "Check complete blood count (CBC) and serum ferritin to quantify deficiency level",
          "Select thoroughly fermented brown teff injera (72+ hours ersho)",
          "Add lemon or citrus to lentil and chickpea wots to enhance iron absorption",
          "Never drink coffee or strong black tea within 90 minutes before or after iron-containing meals",
        ],
      });
    }

    // 3. Khat / Sympathomimetic Insomnia & Gastric Pathway
    if (normalized.includes("khat") || normalized.includes("chat") || normalized.includes("insomnia") || normalized.includes("stomach") || normalized.includes("heartburn") || normalized.includes("ጨጓራ") || normalized.includes("እንቅልፍ")) {
      pathways.push({
        id: "pathway-khat-gastric-neuro",
        title: "Stimulant Sympathomimetic & Mucosal Irritation Pathway",
        description: "Tracing extended khat alkaloid mastication to autonomic hyperarousal, insomnia, and gastric mucosal inflammation",
        nodes: [
          { id: "n1", label: "Extended Khat Chewing Sessions (Bercha)", domain: "addiction", description: "4-8 hours of mastication releases cathinone and tannins while displacing meals" },
          { id: "n2", label: "Noradrenergic Release & Lower Esophageal Relaxation", domain: "biological", description: "Cathinone stimulates central alpha-1 and beta-1 receptors and relaxes lower esophageal sphincter" },
          { id: "n3", label: "Delayed Gastric Emptying & Acid Reflux", domain: "biochemical", description: "Tannins cause mucosal astringency and acid hypersecretion without protective food buffers" },
          { id: "n4", label: "Epigastric Burning, Severe Insomnia & Heart Racing", domain: "symptom", description: "User experiences painful heartburn ('Chigwara'), nocturnal panic, and sleep fragmentation" },
          { id: "n5", label: "Integrated Solution: Session Limits + Pre-Chew Feeding + Chamomile/Tena Adam", domain: "remedy", description: "Taper chew duration, eat a warm meal beforehand, hydrate with water instead of sugary soda, take calming teas" },
        ],
        edges: [
          { from: "n1", to: "n2", label: "Alkaloid absorption" },
          { from: "n1", to: "n3", label: "Direct mucosal contact" },
          { from: "n2", to: "n4", label: "Autonomic arousal" },
          { from: "n3", to: "n4", label: "Acid mucosal erosion" },
          { from: "n4", to: "n5", label: "Harm reduction plan" },
        ],
        integratedSolution: [
          "Always eat a warm, bland meal (bulla porridge, teff with non-spicy wot) before any chewing",
          "Limit chewing sessions to under 2 hours and avoid chewing past 5:00 PM to protect sleep architecture",
          "Replace soda with water or unsweetened herbal infusions during chewing",
          "Utilize natural soothing teas (chamomile, ginger, marshmallow root) for esophageal relief",
        ],
      });
    }

    // Fallback default pathway if no specific match
    if (pathways.length === 0) {
      pathways.push({
        id: "pathway-general-holistic",
        title: "Holistic Multi-Domain Equilibrium Pathway",
        description: "Connecting dietary, environmental, and physiological factors to symptom manifestation and balanced lifestyle restoration",
        nodes: [
          { id: "n1", label: "Environmental & Dietary Baselines", domain: "ecological", description: "Regional climate, altitude, and dietary patterns form the daily physiological substrate" },
          { id: "n2", label: "Metabolic & Immune Processing", domain: "biochemical", description: "Digestive enzyme efficiency, microbiome diversity, and cellular energy production" },
          { id: "n3", label: "Systemic Symptom Expression", domain: "symptom", description: "Physical feedback reflecting physiological imbalance or nutrient shortfall" },
          { id: "n4", label: "Harmonized Ethiopian Care Plan", domain: "remedy", description: "Validated diet, verified safe herbal remedies, lifestyle pacing, and clinical medical checkup" },
        ],
        edges: [
          { from: "n1", to: "n2", label: "Nutritional intake" },
          { from: "n2", to: "n3", label: "Physiological strain" },
          { from: "n3", to: "n4", label: "Targeted correction" },
        ],
        integratedSolution: [
          "Consult a qualified healthcare provider for targeted clinical evaluation",
          "Maintain traditional high-fiber diverse Ethiopian staples (Teff, Gomen, Shiro)",
          "Utilize the Safety Gate before consuming any traditional herbal preparation",
        ],
      });
    }

    return pathways;
  }
}
