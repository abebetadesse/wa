export interface ParsedNameComponents {
  givenName: string;
  fatherName?: string;
  grandfatherName?: string;
  isGeezScript: boolean;
  normalizedGivenName: string;
}

export function parseEthiopianName(rawName: string): ParsedNameComponents {
  const trimmed = rawName.trim();
  const isGeezScript = /[\u1200-\u137F]/.test(trimmed);

  // Split by whitespace
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  const givenName = tokens[0] || "Tigist";
  const fatherName = tokens[1] || undefined;
  const grandfatherName = tokens[2] || undefined;

  // Normalized for lookup (lowercase, trimmed)
  const normalizedGivenName = givenName.toLowerCase();

  return {
    givenName,
    fatherName,
    grandfatherName,
    isGeezScript,
    normalizedGivenName,
  };
}
