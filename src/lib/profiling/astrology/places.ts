/**
 * Birth-place gazetteer for chart casting.
 *
 * A chart is only personal if it is cast for where the person was born: the Ascendant, houses and
 * sunrise all depend on the coordinates. Free-text places typed in the profile are matched here;
 * when nothing matches, the caller is told so (`matched: false`) instead of silently getting Addis Ababa.
 */

import { EthiopianCoordinatePreset } from "../types";

export interface ResolvedPlace extends EthiopianCoordinatePreset {
  /** Hours east of UT for civil time at the place. */
  utcOffsetHours: number;
  /** False when the text was not recognised and the default place was used. */
  matched: boolean;
  /** What the person typed. */
  query: string;
}

type PlaceRow = readonly [name: string, latitude: number, longitude: number, altitudeMeters: number, region: string, aliases?: string];

// Towns first; historical provinces and regions after them resolve to their main town.
const PLACES: readonly PlaceRow[] = [
  ["Addis Ababa", 9.03, 38.74, 2355, "Shewa / Capital", "addis abeba|addis|finfinne|sheger|አዲስ አበባ"],
  ["Addis Zemen", 12.12, 37.78, 1975, "South Gondar, Amhara", "አዲስ ዘመን"],
  ["Addis Alem", 9.03, 38.4, 2360, "West Shewa, Oromia", "ejersa|አዲስ ዓለም"],
  ["Gondar", 12.6, 37.47, 2133, "Amhara Highlands", "gonder|ጎንደር"],
  ["Lalibela", 12.03, 39.04, 2500, "Lasta Highlands", "ላሊበላ"],
  ["Harar", 9.31, 42.12, 1885, "Harari Plateau", "harer|ሐረር|ሀረር"],
  ["Bahir Dar", 11.59, 37.39, 1800, "Lake Tana Basin", "bahar dar|bahirdar|ባሕር ዳር|ባህር ዳር"],
  ["Hawassa", 7.05, 38.48, 1708, "Great Rift Valley", "awassa|awasa|ሐዋሳ|ሀዋሳ"],
  ["Mekelle", 13.5, 39.47, 2084, "Tigray Highlands", "mekele|mek'ele|makale|መቀሌ|መቐለ"],
  ["Jimma", 7.67, 36.83, 1780, "Oromia / Coffee Biosphere", "jima|ጅማ"],
  ["Dire Dawa", 9.59, 41.87, 1276, "Eastern Lowland foothills", "diredawa|dire dewa|ድሬዳዋ|ድሬ ዳዋ"],
  ["Axum", 14.13, 38.72, 2131, "Tigray Northern Highlands", "aksum|አክሱም"],
  ["Adama", 8.54, 39.27, 1712, "East Shewa, Oromia", "nazret|nazareth|nazreth|አዳማ|ናዝሬት"],
  ["Dessie", 11.13, 39.63, 2470, "South Wollo, Amhara", "dese|dessye|ደሴ"],
  ["Debre Markos", 10.33, 37.72, 2446, "East Gojjam, Amhara", "debre marqos|ደብረ ማርቆስ"],
  ["Debre Birhan", 9.68, 39.53, 2840, "North Shewa, Amhara", "debre berhan|ደብረ ብርሃን"],
  ["Debre Tabor", 11.85, 38.02, 2706, "South Gondar, Amhara", "ደብረ ታቦር"],
  ["Bishoftu", 8.75, 38.98, 1920, "East Shewa, Oromia", "debre zeit|debre zeyit|ቢሾፍቱ|ደብረ ዘይት"],
  ["Shashamane", 7.2, 38.6, 1930, "West Arsi, Oromia", "shashemene|shashamene|ሻሸመኔ"],
  ["Arba Minch", 6.03, 37.55, 1285, "Gamo, Southern Ethiopia", "arbaminch|አርባ ምንጭ"],
  ["Wolaita Sodo", 6.86, 37.76, 1900, "Wolaita, Southern Ethiopia", "sodo|soddo|wolayta sodo|ሶዶ"],
  ["Hosaena", 7.55, 37.85, 2177, "Hadiya, Central Ethiopia", "hosanna|hossana|hosaina|ሆሳዕና"],
  ["Dilla", 6.41, 38.31, 1570, "Gedeo, Southern Ethiopia", "dila|ዲላ"],
  ["Nekemte", 9.08, 36.55, 2088, "East Wollega, Oromia", "nekemt|lekemt|ነቀምት"],
  ["Ambo", 8.98, 37.85, 2101, "West Shewa, Oromia", "አምቦ"],
  ["Asella", 7.95, 39.13, 2430, "Arsi, Oromia", "asela|assela|አሰላ"],
  ["Jijiga", 9.35, 42.8, 1609, "Somali Region", "jigjiga|ጅጅጋ"],
  ["Gambela", 8.25, 34.59, 526, "Gambela lowlands", "gambella|ጋምቤላ"],
  ["Assosa", 10.07, 34.53, 1570, "Benishangul-Gumuz", "asosa|አሶሳ"],
  ["Semera", 11.79, 41.01, 430, "Afar lowlands", "samara|ሰመራ"],
  ["Asaita", 11.57, 41.44, 300, "Afar lowlands", "asayita|assaita|aysaita"],
  ["Adigrat", 14.28, 39.46, 2457, "Eastern Tigray", "ዓዲግራት|አዲግራት"],
  ["Shire", 14.1, 38.28, 1953, "North-western Tigray", "inda selassie|shire inda selassie|ሽሬ"],
  ["Adwa", 14.17, 38.9, 1907, "Central Tigray", "adowa|ዓድዋ|አድዋ"],
  ["Woldia", 11.83, 39.6, 2112, "North Wollo, Amhara", "weldiya|woldiya|ወልዲያ"],
  ["Kombolcha", 11.08, 39.74, 1842, "South Wollo, Amhara", "ኮምቦልቻ"],
  ["Fiche", 9.8, 38.73, 2738, "North Shewa, Oromia", "fitche|ፍቼ"],
  ["Woliso", 8.53, 37.98, 2063, "South-west Shewa, Oromia", "waliso|ወሊሶ"],
  ["Butajira", 8.12, 38.37, 2131, "Gurage, Central Ethiopia", "ቡታጅራ"],
  ["Batu", 7.93, 38.72, 1643, "Central Rift Valley", "ziway|zeway|ዝዋይ"],
  ["Mojo", 8.59, 39.12, 1788, "East Shewa, Oromia", "modjo|ሞጆ"],
  ["Metu", 8.3, 35.58, 1605, "Illubabor, Oromia", "mettu|መቱ"],
  ["Bonga", 7.27, 36.23, 1714, "Kaffa, South-west Ethiopia", "ቦንጋ"],
  ["Mizan Teferi", 6.99, 35.59, 1451, "Bench Sheko, South-west Ethiopia", "mizan aman|mizan|ሚዛን"],
  ["Tepi", 7.2, 35.42, 1097, "Sheka, South-west Ethiopia", "teppi"],
  ["Jinka", 5.79, 36.57, 1490, "South Omo", "ጂንካ"],
  ["Konso", 5.25, 37.48, 1650, "Konso, Southern Ethiopia", "karat"],
  ["Yabelo", 4.89, 38.1, 1857, "Borana, Oromia", "yabello|ያቤሎ"],
  ["Moyale", 3.53, 39.05, 1090, "Southern border lowlands", "ሞያሌ"],
  ["Negele Borana", 5.33, 39.58, 1475, "Guji, Oromia", "negele|neghelle"],
  ["Goba", 7.01, 39.98, 2743, "Bale Highlands", "ጎባ"],
  ["Bale Robe", 7.12, 40.0, 2492, "Bale Highlands", "robe|ሮቤ"],
  ["Gode", 5.95, 43.55, 255, "Shabelle, Somali Region", "ጎዴ"],
  ["Kebri Dehar", 6.74, 44.28, 493, "Korahe, Somali Region", "kebri dahar|qabri dahar"],
  ["Dembi Dolo", 8.53, 34.8, 1701, "Kellem Wollega, Oromia", "dembidolo|ደምቢ ዶሎ"],
  ["Gimbi", 9.17, 35.83, 1930, "West Wollega, Oromia", "ጊምቢ"],
  ["Bedele", 8.45, 36.35, 2011, "Buno Bedele, Oromia", "በደሌ"],
  ["Agaro", 7.85, 36.58, 1560, "Jimma Zone, Oromia", "አጋሮ"],
  ["Finote Selam", 10.7, 37.27, 1917, "West Gojjam, Amhara", "ፍኖተ ሰላም"],
  ["Injibara", 10.95, 36.93, 2560, "Awi, Amhara", "enjibara|እንጅባራ"],
  ["Metema", 12.95, 36.15, 685, "West Gondar lowlands", "metemma|መተማ"],
  ["Humera", 14.29, 36.61, 585, "Western Tigray lowlands", "ሑመራ|ሁመራ"],
  ["Debark", 13.16, 37.9, 2850, "Simien Highlands", "ደባርቅ"],
  ["Sekota", 12.63, 39.03, 2266, "Wag Hemra, Amhara", "soqota|ሰቆጣ"],
  ["Alamata", 12.42, 39.56, 1520, "Southern Tigray", "አላማጣ"],
  ["Maychew", 12.78, 39.54, 2479, "Southern Tigray", "maichew|ማይጨው"],
  ["Wukro", 13.79, 39.6, 1972, "Eastern Tigray", "ውቕሮ|ውቅሮ"],
  ["Bati", 11.19, 40.02, 1502, "Oromia Zone, Amhara", "ባቲ"],
  ["Awash", 8.98, 40.17, 986, "Awash Valley", "awash sebat kilo|አዋሽ"],
  ["Metehara", 8.9, 39.92, 947, "Awash Valley", "metahara|መተሐራ"],
  ["Chiro", 9.08, 40.87, 1826, "West Hararghe, Oromia", "asebe teferi|asbe teferi|ጭሮ"],
  ["Haramaya", 9.4, 42.01, 2047, "East Hararghe, Oromia", "alemaya|ሐረማያ"],
  ["Sebeta", 8.91, 38.62, 2356, "Sheger, Oromia", "ሰበታ"],
  ["Burayu", 9.07, 38.67, 2580, "Sheger, Oromia", "ቡራዩ"],
  ["Holeta", 9.05, 38.5, 2391, "West Shewa, Oromia", "holetta|ሆለታ"],
  ["Sululta", 9.18, 38.75, 2600, "Sheger, Oromia", "ሱሉልታ"],
  ["Bule Hora", 5.63, 38.23, 1716, "West Guji, Oromia", "hagere mariam|hagere maryam"],
  ["Yirgalem", 6.75, 38.41, 1776, "Sidama", "yirga alem|ይርጋለም"],
  ["Yirgacheffe", 6.16, 38.2, 1880, "Gedeo, Southern Ethiopia", "yirga chefe|irgachefe|ይርጋጨፌ"],
  ["Wolkite", 8.28, 37.78, 1910, "Gurage, Central Ethiopia", "welkite|ወልቂጤ"],
  ["Durame", 7.24, 37.89, 2101, "Kembata, Central Ethiopia", "ዱራሜ"],
  ["Sawla", 6.3, 36.88, 1395, "Gofa, Southern Ethiopia", "ሳውላ"],
  ["Mota", 11.08, 37.87, 2487, "East Gojjam, Amhara", "motta|ሞጣ"],
  ["Bichena", 10.45, 38.2, 2541, "East Gojjam, Amhara", "ቢቸና"],
  ["Dejen", 10.17, 38.15, 2421, "East Gojjam, Amhara", "ደጀን"],
  ["Asmara", 15.34, 38.93, 2325, "Eritrean Highlands", "asmera|አስመራ"],
  // Regions and historical provinces, used only when no town is named.
  ["Tigray", 13.5, 39.47, 2084, "Tigray (cast for Mekelle)", "tigrai|ትግራይ"],
  ["Amhara", 11.59, 37.39, 1800, "Amhara (cast for Bahir Dar)", "አማራ"],
  ["Oromia", 8.54, 39.27, 1712, "Oromia (cast for Adama)", "oromiya|ኦሮሚያ"],
  ["Somali", 9.35, 42.8, 1609, "Somali Region (cast for Jijiga)", "ogaden|ሶማሌ"],
  ["Afar", 11.79, 41.01, 430, "Afar (cast for Semera)", "አፋር"],
  ["Sidama", 7.05, 38.48, 1708, "Sidama (cast for Hawassa)", "sidamo|ሲዳማ"],
  ["Benishangul", 10.07, 34.53, 1570, "Benishangul-Gumuz (cast for Assosa)", "benishangul gumuz|beni shangul"],
  ["Gojjam", 10.33, 37.72, 2446, "Gojjam (cast for Debre Markos)", "gojam|ጎጃም"],
  ["Wollo", 11.13, 39.63, 2470, "Wollo (cast for Dessie)", "welo|wello|ወሎ"],
  ["Wollega", 9.08, 36.55, 2088, "Wollega (cast for Nekemte)", "wellega|welega|ወለጋ"],
  ["Shewa", 9.03, 38.74, 2355, "Shewa (cast for Addis Ababa)", "shoa|ሸዋ"],
  ["Arsi", 7.95, 39.13, 2430, "Arsi (cast for Asella)", "arssi|አርሲ"],
  ["Bale", 7.12, 40.0, 2492, "Bale (cast for Robe)", "ባሌ"],
  ["Kaffa", 7.27, 36.23, 1714, "Kaffa (cast for Bonga)", "kafa|keffa|ከፋ"],
  ["Gurage", 8.28, 37.78, 1910, "Gurage (cast for Wolkite)", "ጉራጌ"],
  ["Wolaita", 6.86, 37.76, 1900, "Wolaita (cast for Sodo)", "wolayta|welayta|ወላይታ"],
  ["Borana", 4.89, 38.1, 1857, "Borana (cast for Yabelo)", "borena|ቦረና"],
  ["Illubabor", 8.3, 35.58, 1605, "Illubabor (cast for Metu)", "ilu aba bora|illu ababor"],
  ["Hararghe", 9.31, 42.12, 1885, "Hararghe (cast for Harar)", "harerge|hararge|ሐረርጌ"],
  ["Gamo", 6.03, 37.55, 1285, "Gamo (cast for Arba Minch)", "gamo gofa|ጋሞ"],
];

const DEFAULT_PLACE = "Addis Ababa";
const EAST_AFRICA_TIME = 3;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,;:()\/\\_-]+/g, " ")
    .replace(/['’`]/g, "")
    .replace(/\b(ethiopia|city|town|zone|region|woreda|kebele|sub city|subcity|kifle ketema)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INDEX: { key: string; row: PlaceRow }[] = PLACES.flatMap((row) =>
  [row[0], ...(row[5] ? row[5].split("|") : [])].map((name) => ({ key: normalize(name), row }))
);

function toPlace(row: PlaceRow, query: string, matched: boolean): ResolvedPlace {
  return {
    city: row[0],
    latitude: row[1],
    longitude: row[2],
    altitudeMeters: row[3],
    region: row[4],
    utcOffsetHours: EAST_AFRICA_TIME,
    matched,
    query,
  };
}

/**
 * Coordinates for a birth place written as free text ("Gondar", "Bole, Addis Ababa", "ጅማ", "9.03, 38.74").
 */
export function resolveBirthPlace(input?: string | null): ResolvedPlace {
  const query = (input ?? "").trim();
  const fallback = PLACES.find((row) => row[0] === DEFAULT_PLACE)!;
  if (!query) return toPlace(fallback, query, false);

  // Coordinates typed directly.
  const coordinates = query.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
  if (coordinates) {
    const latitude = Number(coordinates[1]);
    const longitude = Number(coordinates[2]);
    if (Math.abs(latitude) <= 66 && Math.abs(longitude) <= 180) {
      return {
        city: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
        latitude,
        longitude,
        altitudeMeters: 0,
        region: "Custom coordinates",
        utcOffsetHours: Math.round(longitude / 15),
        matched: true,
        query,
      };
    }
  }

  const text = normalize(query);
  if (!text) return toPlace(fallback, query, false);

  const exact = INDEX.find((entry) => entry.key === text);
  if (exact) return toPlace(exact.row, query, true);

  // A known name inside a longer description ("Bole, Addis Ababa"); the longest name wins,
  // and towns are listed before regions so "Gondar, Amhara" resolves to the town.
  const padded = ` ${text} `;
  let best: { key: string; row: PlaceRow } | null = null;
  for (const entry of INDEX) {
    if (entry.key.length >= 3 && padded.includes(` ${entry.key} `) && (!best || entry.key.length > best.key.length)) best = entry;
  }
  if (best) return toPlace(best.row, query, true);

  // The start of a name ("Debre Mark", "Hawas").
  if (text.length >= 4) {
    const prefix = INDEX.find((entry) => entry.key.startsWith(text));
    if (prefix) return toPlace(prefix.row, query, true);
  }

  return toPlace(fallback, query, false);
}

/** Town names offered as suggestions in the birth-place field. */
export const BIRTH_PLACE_SUGGESTIONS: { city: string; altitudeMeters: number; region: string }[] = PLACES
  .filter((row) => !row[4].includes("(cast for"))
  .map((row) => ({ city: row[0], altitudeMeters: row[3], region: row[4] }));
