export interface CulturalResource {
  title: string;
  organization: string;
  url: string;
}

export interface WorldTradition {
  id: string;
  country: string;
  region: string;
  tradition: string;
  focus: string;
  overview: string;
  reflection: string;
  context: string;
  resources: CulturalResource[];
}

export const WORLD_TRADITION_REGIONS = [
  "All regions",
  "East Asia",
  "South Asia",
  "Latin America",
  "Africa",
] as const;

export const WORLD_TRADITIONS: WorldTradition[] = [
  {
    id: "china-tcm",
    country: "China",
    region: "East Asia",
    tradition: "Traditional Chinese medicine",
    focus: "Historical medical systems and changing practice",
    overview:
      "A diverse, historically developed system that includes practices such as acupuncture and tai chi. Its concepts and use vary across communities and settings.",
    reflection:
      "How do practitioners explain a practice, and how does that compare with the questions asked in clinical research?",
    context:
      "A cultural and educational overview is not treatment advice; evidence and safety differ by practice.",
    resources: [
      {
        title: "Traditional Chinese Medicine: What You Need To Know",
        organization: "U.S. National Center for Complementary and Integrative Health",
        url: "https://www.nccih.nih.gov/health/traditional-chinese-medicine-what-you-need-to-know",
      },
      {
        title: "Acupuncture and moxibustion of traditional Chinese medicine",
        organization: "UNESCO Intangible Cultural Heritage",
        url: "https://ich.unesco.org/en/RL/acupuncture-and-moxibustion-of-traditional-chinese-medicine-00425",
      },
    ],
  },
  {
    id: "india-ayurveda",
    country: "India",
    region: "South Asia",
    tradition: "Ayurveda",
    focus: "A plural, long-standing system of health traditions",
    overview:
      "Ayurveda has many lineages and contemporary forms. Its approaches may include food, daily routines, movement, and herbal preparations.",
    reflection:
      "How can a conversation make room for a person's own understanding of a tradition without assuming every community practices it the same way?",
    context:
      "Products and preparations can have side effects or interact with medicines. Discuss use with a qualified health professional.",
    resources: [
      {
        title: "Ayurvedic Medicine: In Depth",
        organization: "U.S. National Center for Complementary and Integrative Health",
        url: "https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth",
      },
      {
        title: "Yoga",
        organization: "UNESCO Intangible Cultural Heritage",
        url: "https://ich.unesco.org/en/RL/yoga-01163",
      },
    ],
  },
  {
    id: "japan-washoku",
    country: "Japan",
    region: "East Asia",
    tradition: "Washoku and seasonal food culture",
    focus: "Foodways, seasonality, and community",
    overview:
      "Washoku describes Japanese dietary culture and its relationship to seasonal ingredients, celebration, and shared practices—not a single prescriptive diet.",
    reflection:
      "What do seasonality, family, and celebration mean in the food traditions of your own community?",
    context:
      "Food traditions are varied and change over time; nutritional needs remain individual.",
    resources: [
      {
        title: "Washoku: traditional dietary cultures of the Japanese",
        organization: "UNESCO Intangible Cultural Heritage",
        url: "https://ich.unesco.org/en/RL/washoku-traditional-dietary-cultures-of-the-japanese-notably-for-the-celebration-of-new-year-00869",
      },
    ],
  },
  {
    id: "japan-kampo",
    country: "Japan",
    region: "East Asia",
    tradition: "Kampo",
    focus: "Traditional herbal practice in contemporary Japan",
    overview:
      "Kampo is a Japanese system of herbal medicine with historical roots and contemporary clinical use. It has its own context and should not be treated as interchangeable with other Asian traditions.",
    reflection:
      "What safeguards help people discuss traditional products alongside prescribed medicines?",
    context:
      "Herbal products may cause adverse effects or interactions; seek individualized medical guidance.",
    resources: [
      {
        title: "Herbs at a Glance",
        organization: "U.S. National Center for Complementary and Integrative Health",
        url: "https://www.nccih.nih.gov/health/herbsataglance",
      },
    ],
  },
  {
    id: "latin-america-community",
    country: "Latin America",
    region: "Latin America",
    tradition: "Community and Indigenous health knowledge",
    focus: "Plural knowledge, place, and community-led care",
    overview:
      "Across Latin America, Indigenous nations and local communities hold distinct knowledge and care traditions shaped by language, land, and history. There is no single regional practice.",
    reflection:
      "Who holds the knowledge, and how can learning respect community authority, consent, and local context?",
    context:
      "This broad regional overview is a starting point, not a substitute for community-specific sources or permission.",
    resources: [
      {
        title: "Traditional, Complementary and Integrative Medicine",
        organization: "Pan American Health Organization",
        url: "https://www.paho.org/en/topics/traditional-complementary-and-integrative-medicine",
      },
      {
        title: "Traditional knowledge and Indigenous peoples",
        organization: "World Intellectual Property Organization",
        url: "https://www.wipo.int/en/web/traditional-knowledge",
      },
    ],
  },
  {
    id: "mexico-day-of-dead",
    country: "Mexico",
    region: "Latin America",
    tradition: "Indigenous festivity dedicated to the dead",
    focus: "Remembrance, family, and community ritual",
    overview:
      "A living tradition of remembrance that connects families and communities with deceased relatives. Practices differ across places and households.",
    reflection:
      "How do shared rituals help communities remember, grieve, and care for one another?",
    context:
      "Avoid treating a community's sacred or family practices as a spectacle; learn from respectful, locally grounded sources.",
    resources: [
      {
        title: "Indigenous festivity dedicated to the dead",
        organization: "UNESCO Intangible Cultural Heritage",
        url: "https://ich.unesco.org/en/RL/indigenous-festivity-dedicated-to-the-dead-00054",
      },
    ],
  },
  {
    id: "ethiopia-coffee",
    country: "Ethiopia",
    region: "Africa",
    tradition: "Coffee ceremony",
    focus: "Hospitality, conversation, and belonging",
    overview:
      "Coffee ceremonies can create time for welcome, conversation, and connection. How a ceremony is prepared and shared varies by family and community.",
    reflection:
      "What makes a guest feel welcome in your community?",
    context:
      "Caffeine affects people differently; cultural appreciation is separate from health advice.",
    resources: [
      {
        title: "Ethiopian coffee ceremony",
        organization: "UNESCO Intangible Cultural Heritage",
        url: "https://ich.unesco.org/en/lists",
      },
    ],
  },
  {
    id: "ghana-adinkra",
    country: "Ghana",
    region: "Africa",
    tradition: "Adinkra symbols and visual philosophy",
    focus: "Art, values, and intergenerational knowledge",
    overview:
      "Adinkra symbols carry layered meanings in Akan visual culture and are used in contexts including textiles and community expression.",
    reflection:
      "What responsibilities come with interpreting symbols and knowledge from a culture that is not your own?",
    context:
      "Meanings can be contextual and community-held; seek Ghanaian and Akan voices when learning.",
    resources: [
      {
        title: "Intangible Cultural Heritage lists",
        organization: "UNESCO",
        url: "https://ich.unesco.org/en/lists",
      },
    ],
  },
];

export const CULTURAL_STARTER_RESOURCES: CulturalResource[] = [
  {
    title: "Traditional, Complementary and Integrative Medicine",
    organization: "World Health Organization",
    url: "https://www.who.int/health-topics/traditional-complementary-and-integrative-medicine",
  },
  {
    title: "Intangible Cultural Heritage",
    organization: "UNESCO",
    url: "https://ich.unesco.org/",
  },
  {
    title: "Traditional knowledge",
    organization: "World Intellectual Property Organization",
    url: "https://www.wipo.int/en/web/traditional-knowledge",
  },
  {
    title: "Traditional, Complementary and Integrative Medicine",
    organization: "Pan American Health Organization",
    url: "https://www.paho.org/en/topics/traditional-complementary-and-integrative-medicine",
  },
  {
    title: "Herbs and supplements",
    organization: "U.S. National Center for Complementary and Integrative Health",
    url: "https://www.nccih.nih.gov/health/herbsataglance",
  },
];
