/** Pure name matching for labels written in cultural content, e.g. "Kosso / Hagenia / ኮሶ (Kosso)". */

export interface NamedEntry {
  slug: string;
  name: string;
  scientificName: string | null;
  amharicName: string | null;
  aliases: string[];
}

export const normalizeName = (value: string) => value.normalize("NFKC").toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function findByLabel<T extends NamedEntry>(entries: T[], label: string): T | null {
  const parts = label.split(/[/,]|\(|\)/).map(normalizeName).filter((part) => part.length >= 3);
  const named = entries.map((entry) => ({ entry, names: [entry.name, entry.slug.replace(/-/g, " "), entry.scientificName, entry.amharicName, ...entry.aliases].filter((v): v is string => Boolean(v)).map(normalizeName) }));
  // Exact names first (in label order, common name before genus), then looser matches.
  for (const part of parts) {
    const exact = named.find(({ names }) => names.includes(part));
    if (exact) return exact.entry;
  }
  for (const part of parts) {
    const loose = named.find(({ names }) => names.some((name) => name.startsWith(`${part} `) || part.startsWith(`${name} `) || (part.length >= 5 && name.includes(part))));
    if (loose) return loose.entry;
  }
  return null;
}
