export type CaseType = "wellbeing" | "relationships" | "career" | "spiritual" | "legal";

export interface CaseTypeDistribution { caseType: CaseType; count: number; }

export const CASE_TYPES: CaseType[] = ["wellbeing", "relationships", "career", "spiritual", "legal"];

export function buildCaseTypeDistribution(
  base: Partial<Record<CaseType, number>> = {}
): CaseTypeDistribution[] {
  return CASE_TYPES.map((caseType) => ({
    caseType,
    count: Math.max(0, Number(base[caseType] ?? 0)),
  }));
}

export function buildSlaCompliance(
  base: Partial<Record<CaseType | `${CaseType}OnTime` | `${CaseType}Late`, number>> = {}
): Array<{ caseType: CaseType; onTime: number; late: number; adherence: number }> {
  return CASE_TYPES.map((caseType) => {
    const onTimeKey = `${caseType}OnTime` as const;
    const lateKey = `${caseType}Late` as const;
    const onTime = Math.max(0, Number(base[onTimeKey] ?? 0));
    const late = Math.max(0, Number(base[lateKey] ?? 0));
    const total = onTime + late;
    return {
      caseType,
      onTime,
      late,
      adherence: total > 0 ? Math.round((onTime / total) * 100) : 0,
    };
  });
}
