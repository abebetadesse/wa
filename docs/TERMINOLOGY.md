# Platform Terminology

The platform is **not** a clinical or health-care service. It uses scientific data to study, calculate and
understand a user's existing condition and to formulate potential solutions. Use these terms in code, UI copy,
data files and documentation.

## Describing the platform and its outputs

| Avoid | Use |
| --- | --- |
| health (profile, status, gap, insight…) | wellbeing |
| clinical (analysis, findings, safety…) | scientific |
| clinician (as the platform's reviewer) | practitioner |
| clinical effect (of an herb–drug interaction) | physiological effect |
| clinical hallmarks / symptoms | physiological hallmarks / symptoms |
| first-line clinical cure | first-line standard treatment |

Identifiers follow the same rule: `wellbeingProfile`, `wellbeing_profiles`, `scientificAnalyses`,
`physiologicalEffect`, `practitionerNotes`.

## When the original terms stay

Accurate real-world terms are kept where they refer to something **outside** the platform, because
safety referrals and evidence labels must be unambiguous:

- External services and people: *healthcare*, *health professional*, *health facility*, *health worker*,
  *public health*, *pharmacist*, *doctor*, *emergency services*.
- Types of external research evidence: *clinical trial*, *clinical study*, *clinical evidence*,
  *clinical pharmacology*.
- Ordinary English such as *healthy fats*.

The platform never claims to diagnose, prescribe or replace a qualified health professional.

## Database

Legacy table and column names (`health_profiles`, `health_gap_reports`, `clinical_effect`, and names produced
by an earlier faulty find-replace such as `Welbeing_*` / `Debral_*` / `Debrian_*`) are renamed by:

```
npm run db:rename-terms             # dry run: lists what would change
npm run db:rename-terms -- --apply
```

Applied migrations under `drizzle/` and `drizzle-mysql/` are history and keep their original names.
