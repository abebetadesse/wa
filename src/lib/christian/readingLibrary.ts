export type ReadingCategory = "daily" | "gospels" | "psalms" | "epistles" | "ethiopian-canon";

export interface ReadingOption {
  id: string;
  label: string;
  labelAm: string;
  book: string;
  chapter: string;
  description: string;
  category: ReadingCategory;
  ethiopianNote?: string;
}

export const READING_CATEGORIES = [
  { id: "daily", label: "Daily", description: "Short passages for the day." },
  { id: "gospels", label: "Gospels", description: "The life and words of Jesus." },
  { id: "psalms", label: "Psalms", description: "Prayers and songs." },
  { id: "epistles", label: "Epistles", description: "Letters to the early churches." },
  { id: "ethiopian-canon", label: "Ethiopian Canon", description: "Books read in the Ethiopian Orthodox Tewahedo tradition." },
] as const;

export const READING_LIBRARY: ReadingOption[] = [
  { id: "john-1", label: "John 1", labelAm: "ዮሐንስ ፩", book: "43", chapter: "1", description: "The Word, light, and life.", category: "daily", ethiopianNote: "Read at Christmas liturgy (Genna)." },
  { id: "matt-1", label: "Matthew 1", labelAm: "ማቴዎስ ፩", book: "40", chapter: "1", description: "The genealogy and birth of Jesus.", category: "gospels" },
  { id: "mark-1", label: "Mark 1", labelAm: "ማርቆስ ፩", book: "41", chapter: "1", description: "The beginning of the Gospel.", category: "gospels" },
  { id: "psalm-23", label: "Psalm 23", labelAm: "መዝሙር ፳፫", book: "19", chapter: "23", description: "A prayer of guidance and comfort.", category: "psalms" },
  { id: "psalm-51", label: "Psalm 51", labelAm: "መዝሙር ፶፩", book: "19", chapter: "51", description: "A prayer of repentance.", category: "psalms", ethiopianNote: "Read during Great Lent (Hudadi)." },
  { id: "psalm-91", label: "Psalm 91", labelAm: "መዝሙር ፺፩", book: "19", chapter: "91", description: "A prayer of protection.", category: "psalms" },
  { id: "romans-8", label: "Romans 8", labelAm: "ሮሜ ፰", book: "45", chapter: "8", description: "Hope, life, and perseverance.", category: "epistles" },
  { id: "eth-enoch-1", label: "Enoch (1)", labelAm: "ሄኖክ", book: "eth-enoch", chapter: "1", description: "The Book of Enoch — Ethiopian Orthodox canon.", category: "ethiopian-canon", ethiopianNote: "Included in the Ethiopian Orthodox Tewahedo canon; direct chapter routing is not yet confirmed." },
  { id: "eth-jub-1", label: "Jubilees", labelAm: "መጽሐፈ ኩፋሌ", book: "eth-jubilees", chapter: "1", description: "The Book of Jubilees — Ethiopian Orthodox canon.", category: "ethiopian-canon", ethiopianNote: "Not in Protestant Bibles." },
  { id: "eth-meq-1", label: "Meqabyan 1", labelAm: "መቃብያን ፩", book: "eth-meqabyan-1", chapter: "1", description: "First Book of Meqabyan — Ethiopian Orthodox canon.", category: "ethiopian-canon", ethiopianNote: "Distinct from the Greek Maccabees." },
];

export function readingsByCategory(category: ReadingCategory) {
  return READING_LIBRARY.filter((reading) => reading.category === category);
}

export function wordProjectChapterUrl(book: string, chapter: string) {
  return book.startsWith("eth-")
    ? "https://www.wordproject.org/bibles/am/index.htm"
    : `https://www.wordproject.org/bibles/am/${book}/${chapter}.htm`;
}

export const WORDPROJECT_INDEX_URL = "https://www.wordproject.org/bibles/am/index.htm";
