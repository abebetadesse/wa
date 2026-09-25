export type ChristianTradition = "orthodox" | "protestant" | "catholic" | "unspecified";

const ORTHODOX = ["orthodox", "tewahedo", "tawahedo", "ethiopian orthodox", "eotc", "ኦርቶዶክስ", "ተዋሕዶ", "ሐዋርያዊ"];
const PROTESTANT = ["protestant", "evangelical", "p'ent'ay", "pentay", "ፕሮቴስታንት", "ወንጌላዊ", "ሙሉ ወንጌል"];
const CATHOLIC = ["catholic", "roman catholic", "ካቶሊክ"];
const GENERIC = ["christian", "christianity", "ክርስቲያን"];
const NEGATIVE_PREFIXES = ["non-", "non ", "ex-", "ex ", "former ", "not "];

export interface ReligionMatch {
  isChristian: boolean;
  tradition: ChristianTradition;
  raw: string;
}

export function matchReligion(raw: unknown): ReligionMatch {
  const value = String(raw ?? "").trim();
  if (!value) return { isChristian: false, tradition: "unspecified", raw: "" };
  const normalized = value.toLowerCase();
  const positive = NEGATIVE_PREFIXES.reduce(
    (current, prefix) => current.startsWith(prefix) ? current.slice(prefix.length).trim() : current,
    normalized,
  );
  const negated = positive !== normalized;
  const has = (terms: string[]) => terms.some((term) => positive.includes(term));
  const orthodox = has(ORTHODOX);
  const protestant = has(PROTESTANT);
  const catholic = has(CATHOLIC);
  const christian = orthodox || protestant || catholic || has(GENERIC);
  return {
    isChristian: christian && !negated,
    tradition: orthodox ? "orthodox" : protestant ? "protestant" : catholic ? "catholic" : "unspecified",
    raw: value,
  };
}
