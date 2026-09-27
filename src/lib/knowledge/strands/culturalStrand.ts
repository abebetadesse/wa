import { KnowledgeStrand, KnowledgeStrandType, StrandFinding, UserProfile } from "../types";

type CulturalEntry = {
  title: string;
  description: string;
  practices: string[];
  advice: string[];
  context: string;
  safety?: string;
  aliases: string[];
};

/**
 * Domain B cultural context. These findings support culturally responsive care;
 * they never diagnose, prescribe, or replace urgent clinical evaluation.
 */
export class CulturalKnowledgeStrand implements KnowledgeStrand {
  readonly strandName: KnowledgeStrandType = "cultural";

  private readonly entries: CulturalEntry[] = [
    {
      title: "Wogesha (ወገሻ) - Traditional Bone-Setters",
      description: "Community practitioners associated with fracture setting, splinting, massage, and joint care.",
      practices: ["Manual traction and splinting", "Joint manipulation", "Herbal or butter compresses", "Apprenticeship-based knowledge"],
      advice: ["Use certified emergency and orthopedic services for open, displaced, or circulation-threatening fractures.", "Traditional support may be discussed as complementary care after clinical assessment."],
      context: "Wogesha practitioners are important first points of care in some rural Ethiopian communities.",
      safety: "Severe pain, deformity, numbness, loss of pulse, or an open wound requires urgent medical evaluation.",
      aliases: ["wogesha", "bone setter", "fracture", "joint"],
    },
    {
      title: "Debtera (ደብተራ) and Spiritual Counselling",
      description: "Orthodox scholarly and spiritual traditions involving prayer, holy water, scripture, and community support.",
      practices: ["Prayer and spiritual counselling", "Holy water traditions", "Community and family support", "Protective texts and blessings"],
      advice: ["Spiritual support can complement medical or psychological care.", "Do not delay evaluation for severe physical symptoms, psychosis, seizures, or suicidal thoughts."],
      context: "Debtera and church communities may act as trusted cultural brokers and sources of emotional support.",
      safety: "Spiritual explanations should not be used to exclude urgent medical or mental-health assessment.",
      aliases: ["debtera", "church", "tewahedo", "holy water", "spiritual"],
    },
    {
      title: "Awalaj (አዋላጅ) and Maternal Support",
      description: "Traditional birth attendants and family networks supporting pregnancy, labour, newborn care, and postpartum recovery.",
      practices: ["Labour companionship", "Newborn and cord-care traditions", "Postpartum rest", "Family-supported feeding and recovery"],
      advice: ["Plan skilled birth attendance and emergency transport in advance.", "Postpartum rest and family support can complement, not replace, antenatal and postnatal care."],
      context: "Awalaj and family support remain meaningful in remote and rural settings.",
      safety: "Heavy bleeding, severe headache, convulsions, fever, breathing difficulty, or reduced fetal movement requires urgent care.",
      aliases: ["awalaj", "birth attendant", "pregnancy", "postpartum", "aras bet", "newborn"],
    },
    {
      title: "Ethiopian Herbalist Traditions",
      description: "Local plant, root, leaf, spice, and preparation knowledge used in household and community healing.",
      practices: ["Herbal teas and infusions", "Plant-based poultices", "Household remedies", "Oral transmission of plant knowledge"],
      advice: ["Record the exact plant, preparation, dose, and timing before discussing it with a pharmacist.", "Keep herbs separate from prescribed medicines until interactions have been reviewed."],
      context: "Herbal practice varies by region and preparation; plant identity and concentration are often uncertain.",
      safety: "Do not use unknown herbs in pregnancy, childhood, liver or kidney disease, or alongside anticoagulants without professional review.",
      aliases: ["herbalist", "herb", "plant remedy", "traditional medicine", "root", "leaf", "tena adam", "kosso"],
    },
    {
      title: "Zar and Community Rituals",
      description: "Music, drumming, ceremony, and community practices used by some people to express distress, identity, and belonging.",
      practices: ["Drumming and singing", "Community ceremony", "Family and elder participation", "Meaning-making and emotional expression"],
      advice: ["Respect the person’s interpretation and obtain consent before involving family or spiritual leaders.", "Offer culturally safe psychological and medical assessment when distress impairs safety or functioning."],
      context: "Zar traditions have diverse meanings and should not be reduced to a psychiatric diagnosis.",
      safety: "Confusion, inability to care for oneself, violence risk, or self-harm requires immediate professional support.",
      aliases: ["zar", "spirit", "possession", "drumming", "ceremony"],
    },
    {
      title: "Ethiopian Naming and Identity",
      description: "Names, baptismal and aqiqah traditions, family histories, and language can be important sources of identity and resilience.",
      practices: ["Orthodox naming and baptism", "Islamic Aqiqah", "Moggaatii and regional naming customs", "Storytelling about names and ancestors"],
      advice: ["Ask how the person wants their name, language, family, and identity represented in care.", "Use identity and naming stories to support belonging without assigning health traits to ethnicity or names."],
      context: "Naming traditions differ across Ethiopian communities, religions, and diaspora families.",
      aliases: ["name", "naming", "aqiqah", "baptism", "moggaatii", "identity", "language"],
    },
    {
      title: "Islamic, Waaqeffanna, and Other Faith Contexts",
      description: "Faith, prayer, fasting, family, and community practices may shape health decisions and preferred support.",
      practices: ["Ramadan and Eid traditions", "Mosque and family support", "Waaqeffanna and sacred nature traditions", "Prayer and religious counselling"],
      advice: ["Ask which practices the person wants included in care and how fasting affects food, hydration, and medication timing.", "Respect religious choice while maintaining urgent clinical safety and informed consent."],
      context: "Ethiopia includes diverse Muslim, Orthodox, Protestant, Catholic, Waaqeffanna, and other faith communities.",
      safety: "Religious practice should not prevent emergency treatment or essential medication review.",
      aliases: ["islam", "muslim", "ramadan", "eid", "waaqeffanna", "mosque", "faith", "religion"],
    },
    {
      title: "Family Structures, Rites, and Community Care",
      description: "Elders, family networks, marriage, funerals, birth rites, and community obligations can influence consent, caregiving, and recovery.",
      practices: ["Elder involvement", "Family decision-making", "Birth and marriage rites", "Funeral and mourning support", "Community storytelling"],
      advice: ["Ask the patient who may be involved and preserve the patient’s privacy, consent, and autonomy.", "Include trusted family or elders when invited, while ensuring confidential access to care."],
      context: "Family and community structures vary by region, religion, generation, gender, and diaspora experience.",
      aliases: ["family", "elder", "clan", "marriage", "funeral", "birth rite", "mourning", "community"],
    },
    {
      title: "Iqub (እቁብ) and Community Reciprocity",
      description: "Iqub is a community association built around mutual trust, agreed participation, reciprocity, and shared responsibility. Its cultural significance can be explored without making decisions about money or participation.",
      practices: ["Community-defined participation", "Reciprocity and mutual recognition", "Trust, consent, and shared responsibility"],
      advice: ["Reflect on how community, trust, and reciprocity shape your sense of belonging and responsibility; this is cultural reflection, not financial guidance."],
      context: "Iqub practices and meanings vary across communities and groups.",
      aliases: ["iqub", "equb", "community savings", "rotating savings"],
    },
    {
      title: "Vocation, Work, and Communal Values",
      description: "Work and vocation may be understood through service, responsibility, craftsmanship, family identity, and contribution to community life.",
      practices: ["Reflecting on meaningful work", "Learning and mentorship across generations", "Balancing personal purpose with community values"],
      advice: ["Use these themes as optional prompts for personal reflection; they do not predict career outcomes or prescribe a career choice."],
      context: "Ideas about vocation and work differ across Ethiopian communities, faiths, and personal traditions.",
      aliases: ["vocation", "meaningful work", "career purpose", "craftsmanship", "mentorship"],
    },
    {
      title: "Ethiopian Festivals and health",
      description: "Enkutatash, Timkat, Fasika, Meskel, Irreecha, Eid, and other celebrations combine food, worship, travel, family, and community.",
      practices: ["Family and community gatherings", "Fasting and feast transitions", "Water and outdoor ceremonies", "Coffee, shared meals, singing, and prayer"],
      advice: ["Break prolonged fasts gradually, hydrate, and monitor glucose when relevant.", "During crowded events, protect sleep, hygiene, respiratory health, and safe transport.", "Limit smoke exposure around bonfires and seek shade and water during outdoor gatherings."],
      context: "Festivals can strengthen connection and wellbeing while changing food, sleep, medication, and exposure patterns.",
      aliases: ["festival", "enkutatash", "timkat", "fasika", "meskel", "irreecha", "eid", "new year"],
    },
    {
      title: "Gursha, Buna Coffee Ceremony, and Ethiopian Food Culture",
      description: "Communal eating, gursha, injera, coffee ceremony, hospitality, and shared food are important social practices.",
      practices: ["Shared injera meals", "Gursha as affection and respect", "Buna coffee ceremony", "Conversation with elders and neighbours"],
      advice: ["Respect communal eating while accommodating allergies, diabetes, swallowing needs, and infection-control preferences.", "Coffee can support social connection; consider timing, sleep, reflux, pregnancy, and iron absorption."],
      context: "Food culture is a strength and should be included rather than treated as a barrier to health advice.",
      aliases: ["gursha", "injera", "food", "eating", "coffee", "buna"],
    },
    {
      title: "Diaspora and Cultural Identity health",
      description: "Migration can affect language, access, family roles, diet, discrimination, identity, and continuity of care.",
      practices: ["Community connection", "Culturally competent interpretation", "Traditional food adaptation", "Intergenerational dialogue"],
      advice: ["Offer interpreters and culturally responsive services.", "Ask about migration stress, isolation, discrimination, insurance, and family support without stereotyping."],
      context: "Ethiopian diaspora experiences vary widely by country, generation, language, and migration history.",
      aliases: ["diaspora", "migration", "abroad", "acculturation", "discrimination"],
    },
    {
      title: "Sacred and Traditional Healing Spaces",
      description: "Churches, monasteries, mosques, sacred forests, springs, and healer sites may provide meaning, connection, and comfort.",
      practices: ["Prayer and reflection", "Holy-water traditions", "Nature-based gathering", "Community ceremony"],
      advice: ["Discuss environmental and travel safety, clean water, accessibility, and medication continuity when visiting healing sites.", "Cultural spaces may complement care but should not replace emergency services."],
      context: "Healing spaces are locally meaningful and differ across religious and ethnic communities.",
      aliases: ["sacred", "forest", "waterfall", "mosque", "monastery", "healing space"],
    },
  ];

  private normalize(query: string): string {
    return query.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
  }

  private profileValue(profile: UserProfile, key: "language" | "religion" | "ethnicity" | "name"): string | undefined {
    return profile[key] ?? profile.cultural?.[key] ?? (key === "language" ? profile.demographics?.language : undefined);
  }

  private fasting(profile: UserProfile): boolean {
    return Boolean(profile.cultural?.fasting || profile.lifestyle?.fasting);
  }

  async query(query: string, userProfile: UserProfile): Promise<StrandFinding[]> {
    const normalized = this.normalize(query);
    const results: StrandFinding[] = [];
    const identity = ["language", "religion", "ethnicity", "name"]
      .map((key) => this.profileValue(userProfile, key as "language" | "religion" | "ethnicity" | "name"))
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());

    for (const entry of this.entries) {
      const matches = entry.aliases.filter((alias) => normalized.includes(alias));
      const identityMatch = identity.some((value) => normalized.includes(value));
      const relevant = matches.length > 0 || identityMatch || normalized.includes("culture") || normalized.includes("traditional");
      if (!relevant) continue;

      let score = Math.min(0.52 + matches.length * 0.12 + (identityMatch ? 0.15 : 0), 0.96);
      if (this.fasting(userProfile) && /fast|tsome|ramadan|lent/.test(normalized) && /festival|food|awalaj|religion/.test(entry.title.toLowerCase())) score = Math.min(score + 0.12, 0.98);

      results.push({
        type: "cultural_context",
        strand: this.strandName,
        domain: "cultural",
        name: entry.title,
        description: entry.description,
        evidence: `Practices: ${entry.practices.join("; ")}. ${entry.safety || ""}`.trim(),
        ethiopian_context: entry.context,
        relevanceScore: score,
        confidence: 0.84,
        matches: matches.length ? matches : ["cultural_context"],
        recommendations: entry.advice,
        management: entry.advice,
        sources: ["Ethiopian cultural health context", "Culturally responsive care guidance"],
        category: "Domain B",
        severity: "low",
        details: {
          isDomainB: true,
          crossStrands: ["psychological", "dietary", "astrological", "epidemiological"],
          notice: "Cultural context is reflective and advisory; it does not change clinical triage or treatment decisions.",
        },
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  getTraditionalHealingForCondition(condition: string): string[] {
    const normalized = this.normalize(condition);
    const matches = this.entries
      .filter((entry) => entry.aliases.some((alias) => normalized.includes(alias)) || entry.title.toLowerCase().includes(normalized))
      .flatMap((entry) => [entry.title, ...entry.advice]);
    return matches.length ? matches : ["Discuss culturally familiar support with a qualified clinician; do not delay necessary medical care."];
  }

  getFestivalwellbeingAdvice(festivalName: string): string[] {
    const normalized = this.normalize(festivalName);
    const festival = this.entries.find((entry) => entry.aliases.some((alias) => normalized.includes(alias)) && /festival|food/.test(entry.title.toLowerCase()));
    return festival?.advice ?? ["Hydrate, plan medication and transport needs, and seek care for urgent symptoms during gatherings."];
  }

  getCulturalIdentitySupport(identity: string): string[] {
    const normalized = this.normalize(identity);
    const entry = this.entries.find((item) => item.aliases.some((alias) => normalized.includes(alias)) && /identity|diaspora|naming/.test(item.title.toLowerCase()));
    return entry?.advice ?? ["Ask what language, community, family, and identity supports would make care feel safe and respectful."];
  }

  getDiasporawellbeingRecommendations(): string[] {
    return this.entries.find((entry) => entry.title.startsWith("Diaspora"))?.advice ?? [];
  }

  getFoodCultureAdvice(): string[] {
    return this.entries.find((entry) => entry.title.startsWith("Gursha"))?.advice ?? [];
  }

  getNameMeaningAndwellbeingInsight(name: string): { meaning: string; wellbeingInsight: string } | null {
    const meanings: Record<string, { meaning: string; wellbeingInsight: string }> = {
      abebe: { meaning: "Flourished or bloomed", wellbeingInsight: "A personal story of growth and resilience" },
      selamawit: { meaning: "Peaceful", wellbeingInsight: "A possible source of identity and calm" },
      girma: { meaning: "Majesty", wellbeingInsight: "A family association with dignity and confidence" },
      taye: { meaning: "Seen or protected", wellbeingInsight: "A possible connection to belonging and care" },
    };
    return meanings[this.normalize(name)] ?? null;
  }
}
