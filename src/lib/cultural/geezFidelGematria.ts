/**
 * Enhancement 16: Ge'ez Fidel Gematria Calculator (የፊደል ሂሳብ / ቍጥር)
 * Enhancement 17: Sacred Baptismal Name (የክርስትና ስም) Lineage Vault
 *
 * DOMAIN B HERITAGE LAYER: Strictly isolated from Debral decision-making.
 * Implements classical Abushakir Ge'ez numerical letter values and baptismal patron calendar mapping.
 */

// Classical Abushakir base consonant numerical weights
export const GEEZ_LETTER_VALUES: Record<string, number> = {
  // 1 - 9
  ሀ: 1, ሁ: 1, ሂ: 1, ሃ: 1, ሄ: 1, ህ: 1, ሆ: 1,
  ለ: 2, ሉ: 2, ሊ: 2, ላ: 2, ሌ: 2, ል: 2, ሎ: 2,
  ሐ: 3, ሑ: 3, ሒ: 3, ሓ: 3, ሔ: 3, ሕ: 3, ሖ: 3,
  መ: 4, ሙ: 4, ሚ: 4, ማ: 4, ሜ: 4, ም: 4, ሞ: 4,
  ሠ: 5, ሡ: 5, ሢ: 5, ሣ: 5, ሤ: 5, ሥ: 5, ሦ: 5,
  ረ: 6, ሩ: 6, ሪ: 6, ራ: 6, ሬ: 6, ር: 6, ሮ: 6,
  ሰ: 7, ሱ: 7, ሲ: 7, ሳ: 7, ሴ: 7, ስ: 7, ሶ: 7,
  ሸ: 7, ሹ: 7, ሺ: 7, ሻ: 7, ሼ: 7, ሽ: 7, ሾ: 7,
  ቀ: 8, ቁ: 8, ቂ: 8, ቃ: 8, ቄ: 8, ቅ: 8, ቆ: 8,
  በ: 9, ቡ: 9, ቢ: 9, ባ: 9, ቤ: 9, ብ: 9, ቦ: 9,

  // 10 - 90
  ተ: 10, ቱ: 10, ቲ: 10, ታ: 10, ቴ: 10, ት: 10, ቶ: 10,
  ቸ: 10, ቹ: 10, ቺ: 10, ቻ: 10, ቼ: 10, ች: 10, ቾ: 10,
  ኀ: 20, ኁ: 20, ኂ: 20, ኃ: 20, ኄ: 20, ኅ: 20, ኆ: 20,
  ነ: 30, ኑ: 30, ኒ: 30, ና: 30, ኔ: 30, ን: 30, ኖ: 30,
  ኘ: 30, ኙ: 30, ኚ: 30, ኛ: 30, ኜ: 30, ኝ: 30, ኞ: 30,
  አ: 40, ኡ: 40, ኢ: 40, ኣ: 40, ኤ: 40, እ: 40, ኦ: 40,
  ከ: 50, ኩ: 50, ኪ: 50, ካ: 50, ኬ: 50, ክ: 50, ኮ: 50,
  ኸ: 50, ኹ: 50, ኺ: 50, ኻ: 50, ኼ: 50, ኽ: 50, ኾ: 50,
  ወ: 60, ዉ: 60, ዊ: 60, ዋ: 60, ዌ: 60, ው: 60, ዎ: 60,
  ዐ: 70, ዑ: 70, ዒ: 70, ዓ: 70, ዔ: 70, ዕ: 70, ዖ: 70,
  ዘ: 80, ዙ: 80, ዚ: 80, ዛ: 80, ዜ: 80, ዝ: 80, ዞ: 80,
  ዠ: 80, ዡ: 80, ዢ: 80, ዣ: 80, ዤ: 80, ዥ: 80, ዦ: 80,
  የ: 90, ዩ: 90, ዪ: 90, ያ: 90, ዬ: 90, ይ: 90, ዮ: 90,

  // 100 - 800
  ደ: 100, ዱ: 100, ዲ: 100, ዳ: 100, ዴ: 100, ድ: 100, ዶ: 100,
  ጀ: 100, ጁ: 100, ጂ: 100, ጃ: 100, ጄ: 100, ጅ: 100, ጆ: 100,
  ገ: 200, ጉ: 200, ጊ: 200, ጋ: 200, ጌ: 200, ግ: 200, ጎ: 200,
  ጠ: 300, ጡ: 300, ጢ: 300, ጣ: 300, ጤ: 300, ጥ: 300, ጦ: 300,
  ጨ: 300, ጩ: 300, ጪ: 300, ጫ: 300, ጬ: 300, ጭ: 300, ጮ: 300,
  ጰ: 400, ጱ: 400, ጲ: 400, ጳ: 400, ጴ: 400, ጵ: 400, ጶ: 400,
  ጸ: 500, ጹ: 500, ጺ: 500, ጻ: 500, ጼ: 500, ጽ: 500, ጾ: 500,
  ፀ: 600, ፁ: 600, ፂ: 600, ፃ: 600, ፄ: 600, ፅ: 600, ፆ: 600,
  ፈ: 700, ፉ: 700, ፊ: 700, ፋ: 700, ፌ: 700, ፍ: 700, ፎ: 700,
  ፐ: 800, ፑ: 800, ፒ: 800, ፓ: 800, ፔ: 800, ፕ: 800, ፖ: 800,
};

export interface GematriaCalculationResult {
  originalText: string;
  recognizedFidelLetters: { letter: string; value: number }[];
  totalNumericalSum: number;
  reducedDigitValue: number; // 1 to 9 digital root
  philosophicalVirtue: string;
  biblicalResonance: string;
}

/**
 * Enhancement 16: Calculates Ge'ez Fidel gematria numerical weight and digital root
 */
export function calculateGeezGematria(name: string): GematriaCalculationResult {
  const letters: { letter: string; value: number }[] = [];
  let totalSum = 0;

  for (const char of name) {
    if (GEEZ_LETTER_VALUES[char] !== undefined) {
      const val = GEEZ_LETTER_VALUES[char];
      letters.push({ letter: char, value: val });
      totalSum += val;
    }
  }

  // Calculate digital root (1 - 9)
  let reduced = totalSum;
  while (reduced > 9) {
    reduced = reduced
      .toString()
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  const VIRTUES: Record<number, { virtue: string; bib: string }> = {
    1: { virtue: "Unity & Primordial Beginning (አንድነትና መጀመሪያ)", bib: "Symbol of divine sovereignty and independent initiative." },
    2: { virtue: "Harmony & Dual Reconciliation (ስምምነትና ምስክርነት)", bib: "The two tablets of the Covenant; balance of flesh and spirit." },
    3: { virtue: "Trinitarian Mystery & Completeness (ምሥጢረ ሥላሴ)", bib: "Enduring stability, divine protection, faith, hope, and charity." },
    4: { virtue: "Four Evangelists & Global Compass (አራቱ ወንጌላት)", bib: "The four corners of the earth; grounding in truth and perseverance." },
    5: { virtue: "Five Solitary Nails & Grace (አምስቱ ቅንዋት)", bib: "Transformative redemption, healing mercy, and profound humility." },
    6: { virtue: "Creation Fulfillment & Service (ሥነ ፍጥረት)", bib: "Stewardship of the natural world, compassion for living creatures." },
    7: { virtue: "Sabbath Rest & Sacred Perfection (ሰንበትና ፍጽምና)", bib: "Spiritual discernment, contemplation, wisdom, and inner peace." },
    8: { virtue: "Resurrection & New Dawn (ትንሣኤና አዲስ ኪዳን)", bib: "Transcendence beyond temporal limits, boundless rejuvenation." },
    9: { virtue: "Fruit of the Spirit & Generative Harvest (ፍሬ መንፈስ)", bib: "Fullness of wisdom, mentorship, generosity, and peace." },
  };

  const selected = VIRTUES[reduced] || { virtue: "Quiet Grace", bib: "Enduring strength." };

  return {
    originalText: name,
    recognizedFidelLetters: letters,
    totalNumericalSum: totalSum,
    reducedDigitValue: reduced,
    philosophicalVirtue: selected.virtue,
    biblicalResonance: selected.bib,
  };
}

export interface BaptismalLineageRecord {
  secularName: string;
  baptismalName: string; // e.g. Haile Maryam, Walatta Petros
  patronSaintOrAngel: string;
  monthlyFeastDayDateGeez: number; // e.g. 21 for Maryam, 12 for Mikael
  significance: string;
  ancestralBenediction: string;
}

export const COMMON_BAPTISMAL_PATRONS: {
  prefix: string;
  patron: string;
  dayOfMonth: number;
  significance: string;
}[] = [
    { prefix: "Maryam", patron: "ቅድስት ድንግል ማርያም (Saint Mary)", dayOfMonth: 21, significance: "Intercessor of mercy, maternal protection, and refuge." },
    { prefix: "Mikael", patron: "ቅዱስ ሚካኤል ሊቀ መላእክት (Archangel Michael)", dayOfMonth: 12, significance: "Defender against adversity, strength, and righteous justice." },
    { prefix: "Gabriel", patron: "ቅዱስ ገብርኤል (Archangel Gabriel)", dayOfMonth: 19, significance: "Bringer of joyful tidings and salvation from trials." },
    { prefix: "Giyorgis", patron: "ቅዱስ ጊዮርጊስ ሰማዕት (Saint George)", dayOfMonth: 23, significance: "Unyielding courage in adversity and triumph over tyranny." },
    { prefix: "Tekle Haymanot", patron: "አቡነ ተክለ ሃይማኖት (Abune Tekle Haymanot)", dayOfMonth: 24, significance: "Ascetic devotion, monastic discipline, and mountain holiness." },
    { prefix: "Gebre Meskel", patron: "ክቡር መስቀል (Holy Cross)", dayOfMonth: 17, significance: "Endurance, victorious sacrifice, and beacon of light." },
  ];

/**
 * Enhancement 17: Maps a baptismal name to patron saint feast day and ancestral blessings
 */
export function resolveBaptismalLineage(secularName: string, baptismalName: string): BaptismalLineageRecord {
  const matched = COMMON_BAPTISMAL_PATRONS.find((p) =>
    baptismalName.toLowerCase().includes(p.prefix.toLowerCase())
  );

  if (matched) {
    return {
      secularName,
      baptismalName,
      patronSaintOrAngel: matched.patron,
      monthlyFeastDayDateGeez: matched.dayOfMonth,
      significance: matched.significance,
      ancestralBenediction: `May the grace of ${matched.patron} illuminate your spiritual path on the ${matched.dayOfMonth}th day of every Ethiopian month.`,
    };
  }

  return {
    secularName,
    baptismalName,
    patronSaintOrAngel: "ጠባቂ መልአክ (Guiding Angel)",
    monthlyFeastDayDateGeez: 1,
    significance: "Personal sacred covenant entered on your day of baptism.",
    ancestralBenediction: "May your sacred ancestral covenant sustain peace and wisdom throughout your lineage.",
  };
}
