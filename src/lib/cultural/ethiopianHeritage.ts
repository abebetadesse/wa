export const ETHIOPIAN_HERITAGE_CATEGORIES = [
  "All",
  "Ceremonies & festivals",
  "Churches & sacred places",
  "Holy water & pilgrimage",
  "Springs & geothermal places",
  "Historic & cultural places",
] as const;

export type EthiopianHeritageCategory =
  (typeof ETHIOPIAN_HERITAGE_CATEGORIES)[number];

export interface EthiopianHeritagePlace {
  id: string;
  name: string;
  localName?: string;
  category: Exclude<EthiopianHeritageCategory, "All">;
  area: string;
  characteristics: string[];
  culturalMeaning: string;
  timing?: string;
  visitorNote: string;
  source: {
    label: string;
    url: string;
  };
}

const intangibleHeritage = {
  label: "UNESCO Intangible Cultural Heritage",
  url: "https://ich.unesco.org/en/state/ethiopia-ET",
};

const worldHeritage = {
  label: "UNESCO World Heritage Centre",
  url: "https://whc.unesco.org/en/statesparties/et",
};

const ethiopianTourism = {
  label: "Ethiopian tourism information",
  url: "https://visitethiopia.et/",
};

export const ETHIOPIAN_HERITAGE_DIRECTORY: EthiopianHeritagePlace[] = [
  {
    id: "timkat",
    name: "Timkat (Ethiopian Epiphany)",
    localName: "ጥምቀት",
    category: "Ceremonies & festivals",
    area: "Nationwide; especially Gondar, Addis Ababa, and Lalibela",
    characteristics: [
      "Orthodox Christian celebration of Christ's baptism",
      "Processions accompany tabots, replicas representing the Ark of the Covenant",
      "Prayer, chanting, community gathering, and water-blessing ceremonies",
    ],
    culturalMeaning:
      "A major Christian feast joining liturgy, community, place, and the renewal of baptismal vows.",
    timing: "Tir 11 in the Ethiopian calendar, usually January 19 (January 20 in leap years).",
    visitorNote:
      "Sacred processions are worship, not performances. Follow clergy and steward instructions; ask before photographing people or religious objects.",
    source: intangibleHeritage,
  },
  {
    id: "meskel",
    name: "Meskel (Finding of the True Cross)",
    localName: "መስቀል",
    category: "Ceremonies & festivals",
    area: "Nationwide; large public gathering in Addis Ababa",
    characteristics: [
      "The Demera bonfire is built and blessed before it is lit",
      "Crosses, flowers, hymns, and procession are prominent",
      "The direction in which the bonfire falls carries customary interpretation",
    ],
    culturalMeaning:
      "An Ethiopian Orthodox feast of the finding of the True Cross, also associated with the seasonal turn and communal celebration.",
    timing: "Meskerem 17, usually September 27 (September 28 in leap years).",
    visitorNote:
      "Keep a safe distance from the bonfire and follow crowd-control guidance. Local observances vary.",
    source: intangibleHeritage,
  },
  {
    id: "irreecha",
    name: "Irreecha (Oromo thanksgiving)",
    localName: "Irreecha",
    category: "Ceremonies & festivals",
    area: "Oromo communities; prominent gatherings at Hora Arsadi and Hora Finfinne",
    characteristics: [
      "Gathering of families and communities to give thanks and renew relationships",
      "Green grass and flowers are carried as seasonal symbols",
      "Blessings, songs, and Oromo cultural expression are part of observances",
    ],
    culturalMeaning:
      "A living Oromo thanksgiving tradition connected with gratitude, reconciliation, and the end of the rainy season.",
    timing: "Usually around the transition from the rainy to the dry season; dates and local practice vary.",
    visitorNote:
      "Attend through local guidance, respect community protocols, and use official event information for access and safety.",
    source: ethiopianTourism,
  },
  {
    id: "fichee-chambalaalla",
    name: "Fichee-Chambalaalla (Sidama New Year)",
    localName: "Fichee-Chambalaalla",
    category: "Ceremonies & festivals",
    area: "Sidama Region",
    characteristics: [
      "New Year celebration rooted in Sidama community life",
      "Families prepare and share traditional foods, including buurisame",
      "Elders announce the date after observing seasonal and astronomical signs",
    ],
    culturalMeaning:
      "A Sidama expression of identity, intergenerational knowledge, shared food, and social solidarity.",
    timing: "The date is determined through community knowledge and changes from year to year.",
    visitorNote:
      "Ask local organizers for the year's date and public events; do not assume every household observes it identically.",
    source: intangibleHeritage,
  },
  {
    id: "gada",
    name: "Gadaa system gatherings and leadership transition",
    localName: "Gadaa",
    category: "Ceremonies & festivals",
    area: "Oromo communities across Oromia",
    characteristics: [
      "Oromo system of governance, social organization, and age-based grades",
      "Leadership transition and public assembly follow customary cycles",
      "Oral knowledge, law, civic responsibility, and ritual are interwoven",
    ],
    culturalMeaning:
      "A living Indigenous Oromo institution for governance, knowledge transmission, and community life.",
    timing: "Assemblies and transition ceremonies follow community-specific cycles.",
    visitorNote:
      "Some proceedings are community-led or restricted. Seek permission before recording or publishing images.",
    source: intangibleHeritage,
  },
  {
    id: "ashenda",
    name: "Ashenda / Shadey",
    category: "Ceremonies & festivals",
    area: "Tigray and neighboring northern communities",
    characteristics: [
      "Girls and young women gather in groups to sing and celebrate",
      "Distinctive dress, greenery, and locally composed songs may feature",
      "The celebration creates space for youth, friendship, and community recognition",
    ],
    culturalMeaning:
      "A regional celebration with variations in name and practice across communities.",
    timing: "Often held around the Assumption season in August; dates vary by local calendar.",
    visitorNote:
      "Ask permission before photographing participants, especially children. Follow local guidance on public events.",
    source: ethiopianTourism,
  },
  {
    id: "enkutatash",
    name: "Enkutatash (Ethiopian New Year)",
    localName: "እንቁጣጣሽ",
    category: "Ceremonies & festivals",
    area: "Nationwide",
    characteristics: [
      "Welcomes the Ethiopian New Year and the month of Meskerem",
      "Family visits, greetings, songs, and seasonal flowers are common",
      "Religious observances and public celebrations differ by community",
    ],
    culturalMeaning:
      "A calendar turning point associated with renewal, reunion, and the start of the harvest season in many areas.",
    timing: "Meskerem 1, usually September 11 (September 12 before a Gregorian leap year).",
    visitorNote:
      "Ask hosts about household customs; celebrations are not identical across faiths and regions.",
    source: ethiopianTourism,
  },
  {
    id: "genna",
    name: "Genna (Ethiopian Christmas)",
    localName: "ገና",
    category: "Ceremonies & festivals",
    area: "Nationwide; Lalibela is a major pilgrimage destination",
    characteristics: [
      "Ethiopian Orthodox Christmas observances include overnight worship",
      "White traditional clothing is common at services",
      "Community meals and the game called genna are associated with the season",
    ],
    culturalMeaning:
      "A Christian feast celebrated through worship, family gathering, and regional customs.",
    timing: "Tahsas 29, usually January 7.",
    visitorNote:
      "Services may be long and crowded. Dress modestly, follow church instructions, and ask before taking photographs.",
    source: ethiopianTourism,
  },
  {
    id: "sigd",
    name: "Sigd",
    localName: "ስግድ",
    category: "Ceremonies & festivals",
    area: "Beta Israel communities; prominent gathering in Jerusalem and observances in Ethiopia",
    characteristics: [
      "Beta Israel religious day of prayer, fasting, and communal gathering",
      "Includes readings, reflection, and renewal of community commitment",
      "Contemporary observances connect people with heritage and identity",
    ],
    culturalMeaning:
      "A significant Beta Israel religious and cultural observance.",
    timing: "Hidar 29 in the Ethiopian calendar.",
    visitorNote:
      "Respect worship and community privacy. Confirm whether an event is open to visitors before attending.",
    source: ethiopianTourism,
  },
  {
    id: "coffee-ceremony",
    name: "Buna (Ethiopian coffee ceremony)",
    localName: "ቡና",
    category: "Ceremonies & festivals",
    area: "Nationwide, with regional and household variations",
    characteristics: [
      "Coffee is roasted, ground, and brewed in a jebena",
      "Incense, shared conversation, and serving several rounds may be part of the gathering",
      "Hosts and guests shape the pace and meaning of the ceremony",
    ],
    culturalMeaning:
      "An expression of hospitality and social connection; practices differ among communities and families.",
    visitorNote:
      "Accepting or declining is personal. Ask before handling ceremonial objects or photographing the host.",
    source: intangibleHeritage,
  },
  {
    id: "lalibela",
    name: "Rock-hewn churches of Lalibela",
    localName: "ላሊበላ",
    category: "Churches & sacred places",
    area: "Lalibela, Amhara Region",
    characteristics: [
      "Eleven medieval churches carved from rock and organized in groups",
      "Connected by trenches, passages, courtyards, and tunnels",
      "An active pilgrimage and worship landscape as well as a historic site",
    ],
    culturalMeaning:
      "A major Ethiopian Orthodox pilgrimage centre and a landmark of Ethiopian architecture and faith.",
    visitorNote:
      "This is an active sacred site. Dress modestly, remove shoes where requested, protect fragile stone, and check access conditions locally.",
    source: worldHeritage,
  },
  {
    id: "aksum",
    name: "Aksum and the Church of Maryam Tsion",
    localName: "አክሱም",
    category: "Churches & sacred places",
    area: "Aksum, Tigray Region",
    characteristics: [
      "Ancient stelae, archaeological remains, and long-standing Christian institutions",
      "Maryam Tsion is a major Ethiopian Orthodox pilgrimage site",
      "Some religious areas and traditions are not open to general access",
    ],
    culturalMeaning:
      "A centre of Ethiopian history and Orthodox Christian devotion with continuing religious significance.",
    visitorNote:
      "Access rules differ between archaeological areas and active church compounds. Follow clergy and site staff guidance; never assume access to restricted objects or spaces.",
    source: worldHeritage,
  },
  {
    id: "gondar",
    name: "Fasil Ghebbi and Gondar churches",
    localName: "ፋሲል ግቢ",
    category: "Churches & sacred places",
    area: "Gondar, Amhara Region",
    characteristics: [
      "Royal enclosure with castles and related historic structures",
      "Debre Berhan Selassie is known for its painted ceiling and church art",
      "Timkat draws large gatherings to Gondar, including at Fasilides' Bath",
    ],
    culturalMeaning:
      "A historic centre of Ethiopian statecraft, architecture, Christian art, and public celebration.",
    visitorNote:
      "Religious services and heritage visits have different protocols. Ask before photographing worshippers or interiors.",
    source: worldHeritage,
  },
  {
    id: "debredamo",
    name: "Debre Damo monastery",
    localName: "ደብረ ዳሞ",
    category: "Churches & sacred places",
    area: "Tigray Region",
    characteristics: [
      "Historic monastery on a flat-topped mountain",
      "Known for its ancient church architecture and monastic tradition",
      "Access to the plateau involves a steep rope ascent",
    ],
    culturalMeaning:
      "An important Ethiopian Orthodox monastic site with a long history of religious learning.",
    visitorNote:
      "Access is restricted and has traditionally been limited to men. Confirm current community rules and security before travel; the ascent is physically demanding and not suitable for everyone.",
    source: ethiopianTourism,
  },
  {
    id: "yemrehanna",
    name: "Yemrehanna Kristos Church",
    localName: "ይምርሃነ ክርስቶስ",
    category: "Churches & sacred places",
    area: "Lasta highlands, Amhara Region",
    characteristics: [
      "Medieval church built within a cave setting",
      "Distinctive timber-and-stone construction",
      "Part of a wider highland religious landscape",
    ],
    culturalMeaning:
      "A significant Ethiopian Orthodox church and example of regional sacred architecture.",
    visitorNote:
      "Check road and site conditions before travel. Observe local rules about dress, footwear, photography, and entry.",
    source: ethiopianTourism,
  },
  {
    id: "debrelibanos",
    name: "Debre Libanos Monastery and gorge",
    localName: "ደብረ ሊባኖስ",
    category: "Churches & sacred places",
    area: "North Shewa, Oromia Region",
    characteristics: [
      "Ethiopian Orthodox monastic centre associated with Saint Tekle Haymanot",
      "Church, monastery, memorial sites, and dramatic surrounding landscape",
      "Pilgrimage and worship remain part of contemporary site life",
    ],
    culturalMeaning:
      "A major monastic and pilgrimage destination with religious and historical significance.",
    visitorNote:
      "Treat the monastery as an active religious community. Confirm which areas are open and request permission before photography.",
    source: ethiopianTourism,
  },
  {
    id: "entoto-maryam",
    name: "Entoto Maryam and the Entoto highlands",
    localName: "እንጦጦ ማርያም",
    category: "Churches & sacred places",
    area: "Mount Entoto, Addis Ababa",
    characteristics: [
      "Historic church and museum connected with Menelik II and Empress Taytu",
      "Highland forest, viewpoints, and nearby community sites",
      "Church grounds are places of worship, not simply scenic attractions",
    ],
    culturalMeaning:
      "A place where religious heritage, Ethiopian political history, and highland landscape meet.",
    visitorNote:
      "Mountain weather and altitude can affect visitors. Follow church rules and local advice on trails and photography.",
    source: ethiopianTourism,
  },
  {
    id: "harar-jugol",
    name: "Harar Jugol and historic mosques",
    localName: "ሐረር ጁጎል",
    category: "Churches & sacred places",
    area: "Harar, Harari Region",
    characteristics: [
      "Walled historic city with dense lanes, homes, markets, and mosques",
      "Living centre of Muslim scholarship, trade, and community life",
      "The surrounding Harari cultural landscape includes distinct domestic architecture",
    ],
    culturalMeaning:
      "A historic Islamic and trading city whose heritage is maintained by its residents.",
    visitorNote:
      "Respect prayer times and private homes. Ask before entering religious sites or photographing residents.",
    source: worldHeritage,
  },
  {
    id: "abuneyemata",
    name: "Abuna Yemata Guh",
    localName: "አቡነ የማታ ጉህ",
    category: "Churches & sacred places",
    area: "Gheralta, Tigray Region",
    characteristics: [
      "Rock-hewn church in a cliff setting with historic religious paintings",
      "Reached by a demanding exposed climb over rock",
      "An active sacred place within a distinctive sandstone landscape",
    ],
    culturalMeaning:
      "A place of worship and heritage whose dramatic setting is inseparable from its local context.",
    visitorNote:
      "The route includes serious fall exposure and is not an ordinary hike. Do not attempt without local assessment, an authorized guide, suitable conditions, and appropriate ability; access may change.",
    source: ethiopianTourism,
  },
  {
    id: "gishen-mariam",
    name: "Gishen Mariam pilgrimage",
    localName: "ግሸን ማርያም",
    category: "Holy water & pilgrimage",
    area: "Wollo highlands, Amhara Region",
    characteristics: [
      "Mountain monastery and pilgrimage destination",
      "Religious traditions associate the site with the Ethiopian Orthodox Täbot of the True Cross",
      "Pilgrimage combines worship, travel, and community gathering",
    ],
    culturalMeaning:
      "A revered Ethiopian Orthodox pilgrimage landscape.",
    timing: "Major annual observances are associated with Meskerem; confirm the current date locally.",
    visitorNote:
      "The journey can be strenuous. Ask local church authorities about access, lodging, water, and appropriate conduct.",
    source: ethiopianTourism,
  },
  {
    id: "kulubi-gabriel",
    name: "Kulubi Gabriel pilgrimage church",
    localName: "ቁልቢ ገብርኤል",
    category: "Holy water & pilgrimage",
    area: "East Hararghe, Oromia Region",
    characteristics: [
      "Major Ethiopian Orthodox pilgrimage church",
      "Pilgrims travel on foot from surrounding areas for annual feast gatherings",
      "Prayer, vows, and communal pilgrimage are central features",
    ],
    culturalMeaning:
      "A regionally significant place of devotion and collective pilgrimage.",
    timing: "Large pilgrimages take place around the church's annual feast days; verify dates locally.",
    visitorNote:
      "Expect crowds at feast times. Confirm transport and current safety arrangements and respect worshippers' privacy.",
    source: ethiopianTourism,
  },
  {
    id: "sheikh-hussein",
    name: "Sheikh Hussein shrine and pilgrimage",
    localName: "Sheikh Hussein",
    category: "Holy water & pilgrimage",
    area: "Bale Zone, Oromia Region",
    characteristics: [
      "Venerated Muslim shrine and pilgrimage centre",
      "Pilgrimage connects religious devotion with long-distance travel and community ties",
      "The site is important to Muslim communities in Ethiopia and the wider region",
    ],
    culturalMeaning:
      "A significant Islamic sacred landscape and living centre of pilgrimage.",
    visitorNote:
      "Respect mosque and shrine etiquette, seek local guidance about access, and dress appropriately. Travel conditions can be challenging.",
    source: ethiopianTourism,
  },
  {
    id: "tsebel-practice",
    name: "Tsebel (blessed water) traditions",
    localName: "ጸበል",
    category: "Holy water & pilgrimage",
    area: "Churches and pilgrimage sites across Ethiopia; each site has its own community",
    characteristics: [
      "Water receives meaning and use through particular religious traditions and local histories",
      "Pilgrims may visit a named spring, church, or monastery for prayer and blessing",
      "Practices and access arrangements are site-specific",
    ],
    culturalMeaning:
      "A sacred practice of Ethiopian Orthodox devotion; meanings belong to the communities who maintain each site.",
    visitorNote:
      "This cultural description does not make health claims. Do not drink untreated water; ask site stewards about safe use and local etiquette.",
    source: ethiopianTourism,
  },
  {
    id: "zequala",
    name: "Mount Zuqualla monastery and crater lake",
    localName: "ዝቋላ",
    category: "Holy water & pilgrimage",
    area: "Oromia Region, south of Addis Ababa",
    characteristics: [
      "Mountain monastery situated within a volcanic landscape",
      "Crater lake and highland ecology form part of the setting",
      "Religious use and nature conservation share this landscape",
    ],
    culturalMeaning:
      "A sacred mountain and pilgrimage destination with environmental as well as spiritual significance.",
    visitorNote:
      "Ask about monastery access and local conservation rules; avoid disturbing wildlife or water sources.",
    source: ethiopianTourism,
  },
  {
    id: "filwoha",
    name: "Filwoha thermal springs",
    localName: "ፍልውሃ",
    category: "Springs & geothermal places",
    area: "Addis Ababa",
    characteristics: [
      "Urban geothermal bathing area associated with the city's hot-spring name",
      "Thermal water and bathing facilities have changed with development over time",
      "Current access, services, and water conditions should be checked locally",
    ],
    culturalMeaning:
      "A familiar part of Addis Ababa's urban geography and thermal-water history.",
    visitorNote:
      "No medical benefit is implied. Follow operator guidance, avoid excessively hot water, and check accessibility and hygiene conditions before visiting.",
    source: ethiopianTourism,
  },
  {
    id: "sodere",
    name: "Sodere hot springs",
    localName: "ሶደሬ",
    category: "Springs & geothermal places",
    area: "East Shewa, near the Awash River",
    characteristics: [
      "Thermal-water destination with bathing and resort facilities",
      "Situated in a warmer Rift Valley landscape with riverine vegetation",
      "Facilities and water access may vary by season and operator",
    ],
    culturalMeaning:
      "A well-known domestic leisure and bathing destination.",
    visitorNote:
      "Water temperature and quality vary; use marked bathing areas and follow local safety guidance. Thermal bathing is not a substitute for medical care.",
    source: ethiopianTourism,
  },
  {
    id: "wondo-genet",
    name: "Wondo Genet hot springs and forest",
    localName: "ወንዶ ገነት",
    category: "Springs & geothermal places",
    area: "Sidama Region, near Shashemene",
    characteristics: [
      "Thermal pools set within a forested highland landscape",
      "The area is also known for biodiversity and a university forestry research presence",
      "Visitors combine bathing with walks and nature observation",
    ],
    culturalMeaning:
      "A meeting point of local recreation, thermal water, and highland forest.",
    visitorNote:
      "Use designated paths and pools, check current facility conditions, and avoid making unverified medicinal claims about the water.",
    source: ethiopianTourism,
  },
  {
    id: "danakil-geothermal",
    name: "Danakil and Dallol geothermal landscape",
    category: "Springs & geothermal places",
    area: "Afar Region, northern Danakil Depression",
    characteristics: [
      "Active geothermal terrain with salt formations, hot ground, and vivid mineral deposits",
      "A fragile geological environment, not a recreational bathing spring",
      "Extreme heat, remoteness, and changing conditions shape access",
    ],
    culturalMeaning:
      "A dramatic geological landscape in Afar territory that requires locally informed, responsible travel.",
    visitorNote:
      "Do not touch, drink, or bathe in geothermal pools. Visit only with current local permits, qualified guides, and safety arrangements.",
    source: ethiopianTourism,
  },
  {
    id: "harar-jugol-heritage",
    name: "Harar Jugol: old city and living heritage",
    localName: "ሐረር ጁጎል",
    category: "Historic & cultural places",
    area: "Harar, Harari Region",
    characteristics: [
      "Historic walled city with gates, narrow lanes, markets, and distinctive homes",
      "Harari homes preserve characteristic interior arrangements and social customs",
      "Trade, foodways, language, and religious life remain visible in the living city",
    ],
    culturalMeaning:
      "Heritage is maintained by residents; the old city is a neighborhood, not an open-air museum.",
    visitorNote:
      "Respect household privacy, local religious practice, and community guidance. Do not feed wildlife or approach animals without the handler's permission.",
    source: worldHeritage,
  },
  {
    id: "konso",
    name: "Konso cultural landscape",
    localName: "Konso",
    category: "Historic & cultural places",
    area: "Konso Zone, Southern Ethiopia",
    characteristics: [
      "Terraced hillsides and dry-stone walls reflect long-term environmental adaptation",
      "Settlements, communal spaces, and wooden waka markers have cultural meaning",
      "Local governance and knowledge are part of the living landscape",
    ],
    culturalMeaning:
      "A community-shaped landscape demonstrating place-based knowledge, history, and social organization.",
    visitorNote:
      "Visit with community-approved local guides. Treat ritual places, homes, and memorial markers with care; ask before photographing people or objects.",
    source: worldHeritage,
  },
  {
    id: "tana-monasteries",
    name: "Lake Tana monasteries and island churches",
    localName: "ጣና ሐይቅ",
    category: "Historic & cultural places",
    area: "Lake Tana and Bahir Dar, Amhara Region",
    characteristics: [
      "Island and lakeshore monastic communities with distinct local histories",
      "Church paintings, manuscripts, and sacred objects are held at particular sites",
      "Lake ecology and livelihoods are closely connected with religious heritage",
    ],
    culturalMeaning:
      "A living religious and cultural landscape, not all of which is open to visitors.",
    visitorNote:
      "Confirm which monasteries welcome visitors, follow dress and photography rules, and use responsible boat operators.",
    source: ethiopianTourism,
  },
  {
    id: "tiya",
    name: "Tiya archaeological site",
    category: "Historic & cultural places",
    area: "Central Ethiopia",
    characteristics: [
      "Archaeological field with carved stone stelae",
      "The monuments are part of a wider, still-studied cultural landscape",
      "Individual symbols should not be assigned meanings without reliable evidence",
    ],
    culturalMeaning:
      "A protected heritage site that invites careful interpretation and ongoing research.",
    visitorNote:
      "Do not climb on, touch, move, or mark the stones. Use site interpretation and staff guidance.",
    source: worldHeritage,
  },
  {
    id: "lower-omo",
    name: "Lower Omo Valley cultural landscapes",
    category: "Historic & cultural places",
    area: "South Omo Zone, Southern Ethiopia",
    characteristics: [
      "Home to diverse Indigenous communities, languages, livelihoods, and knowledge systems",
      "River, pastoral, agricultural, and trading environments shape local life",
      "The region contains important archaeological and fossil sites",
    ],
    culturalMeaning:
      "A culturally and historically diverse region; no single description represents all its peoples.",
    visitorNote:
      "Travel with community-consented local guides. Ask explicit permission before portraits, respect refusal, and never treat people as attractions.",
    source: worldHeritage,
  },
  {
    id: "aksum-heritage",
    name: "Aksum archaeological landscape",
    localName: "አክሱም",
    category: "Historic & cultural places",
    area: "Aksum, Tigray Region",
    characteristics: [
      "Ancient stelae, tombs, inscriptions, and archaeological remains",
      "Evidence of an influential ancient kingdom and long-distance connections",
      "Historic monuments coexist with an active contemporary city",
    ],
    culturalMeaning:
      "A key landscape for understanding Ethiopian and regional history.",
    visitorNote:
      "Stay on marked routes and follow current access, heritage protection, and local security guidance.",
    source: worldHeritage,
  },
  {
    id: "fasiledes-bath",
    name: "Fasilides' Bath and Timkat gathering",
    localName: "ፋሲለደስ መታጠቢያ",
    category: "Historic & cultural places",
    area: "Gondar, Amhara Region",
    characteristics: [
      "Historic royal-era water enclosure used as a focal point during Timkat",
      "The structure is filled for the annual celebration under local arrangements",
      "Pilgrimage and public celebration occur alongside heritage conservation",
    ],
    culturalMeaning:
      "A place where Gondar's built heritage and living Orthodox celebration meet.",
    visitorNote:
      "Water-blessing rituals are religious observances. Do not enter the water or restricted areas unless invited and explicitly permitted.",
    source: worldHeritage,
  },
  {
    id: "bale-cultural-landscape",
    name: "Bale highlands and community landscapes",
    category: "Historic & cultural places",
    area: "Bale Zone, Oromia Region",
    characteristics: [
      "Highland settlements and pastoral landscapes alongside exceptional biodiversity",
      "Local knowledge and livelihoods are shaped by altitude, water, and seasonal movement",
      "Sacred places and community access may be distinct from protected-park tourism",
    ],
    culturalMeaning:
      "A diverse living landscape where cultural heritage and ecological stewardship intersect.",
    visitorNote:
      "Use local guides and respect land-use and conservation rules. Weather and altitude can change quickly.",
    source: ethiopianTourism,
  },
];
