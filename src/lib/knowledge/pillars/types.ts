import { LocationContext } from "@/lib/location/types";

export type PillarDomain = "cultural" | "spiritual" | "ecological" | "nutritional" | "biomedical" | "clinical";
export type PillarAudience = "user" | "professional" | "both";

export interface SourceRef {
  id: string;
  title: string;
  type: "paper" | "oral_tradition" | "dataset" | "informant" | "manuscript";
  citation: string;
  year?: number;
  uri?: string;
  language?: "en" | "am" | "both";
}

export interface PillarResult<TOutput = unknown> {
  pillarId: string;
  version: string;
  domain: PillarDomain;
  audience: PillarAudience;
  confidence: "low" | "moderate" | "high";
  data: TOutput;
  provenance: SourceRef[];
  disclaimers?: string[];
}

export interface Pillar<TInput = unknown, TOutput = unknown> {
  id: string;                 // e.g. "cultural.ethiopia.highlands"
  version: string;            // "1.0.0"
  domain: PillarDomain;
  audience: PillarAudience;
  requires: string[];         // e.g. ["location.agroEcologicalZone"]
  query(input: TInput, ctx: LocationContext): Promise<PillarResult<TOutput>>;
  provenance: SourceRef[];    // citations: paper, oral tradition, dataset, informant
}
