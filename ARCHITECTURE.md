# Two-Track Culturally-Grounded Case Evaluation Pipeline: Architecture & Specification

## 1. Overview & Non-Negotiable Principles

The **Two-Track Culturally-Grounded Case Evaluation Pipeline** delivers a multi-stage, location-aware clinical case workflow that bridges Ethiopian traditional medicine (ETM), agro-ecological epidemiology, and modern clinical pharmacology.

### Core Tenets:
1. **Location is a First-Class Analytical Input**: No analysis or case report is generated without a resolved `LocationContext` (administrative hierarchy, agro-ecological zone, altitude band, ecosystem, nearest market access, endemic disease vectors, seasonal lean months, and climate).
2. **Two Reports, Two Audiences, One Truth**:
   - **User Report**: Culturally framed, spiritually aligned (opt-in only), plain-language body science tuned to the user's location. Strictly safety-filtered.
   - **Professional Report**: Scientific superset containing full differential diagnoses, raw herb-drug interaction rules, CYP pathways, pharmacological mechanisms, and audit metadata. Hidden from user sessions under all code paths at the API layer.
3. **The Safety Gate is Authoritative**: High-severity herb–drug interactions immediately lock case publication (`BLOCKED_BY_SAFETY_GATE`). Publication is impossible until a licensed professional logs a substantive written clinical override into the immutable audit store.
4. **Mandatory Verbatim Disclaimer**:
   > *"No rule matched ≠ safe. Absence of a known interaction rule in the database does not guarantee safety or absence of clinical risk."*
5. **Immutable Auditability**: All submissions, evaluations, overrides, edits, returns, and approvals append immutable `CaseEvent` records. No updates or deletions are permitted.

---

## 2. Pipeline State Machine

Transitions are verified server-side in `lib/pipeline/transitions.ts`. Illegal transitions fail loudly with HTTP 409 Conflict.

```
REGISTERED
  │
  ▼
PROFILE_SUBMITTED ─────────► PRELIMINARY_ANALYSIS_READY (User views preliminary card)
                                    │
                                    ▼
                             CASE_SUBMITTED
                                    │
                                    ▼
                             CASE_EVALUATING
                              │            │
            (High severity)   │            │  (No high severity)
                              ▼            ▼
           BLOCKED_BY_SAFETY_GATE     PENDING_PROFESSIONAL
                     │                         │
      (Clinical Pro  │                         │
       Override Req) │                         │
                     └────────► PENDING_PROFESSIONAL
                                   │           │
           (Professional Return)   │           │ (Professional Approved)
                                   ▼           ▼
                      PROFESSIONAL_RETURNED   PENDING_ADMIN
                                               │           │
                            (Admin Return)     │           │ (Admin Publish)
                                               ▼           ▼
                                      PENDING_PROFESSIONAL  PUBLISHED (User Report visible)
```

---

## 3. Knowledge Architecture — The Pillar Contract

Knowledge packages reside in `lib/knowledge/pillars/` and adhere to the strict, versioned `Pillar` interface:

```ts
export interface Pillar<TInput, TOutput> {
  id: string;                     // e.g. "cultural.ethiopia.highlands"
  version: string;                // "1.0.0"
  domain: PillarDomain;           // cultural | spiritual | ecological | nutritional | biomedical | clinical
  audience: PillarAudience;       // user | professional | both
  requires: string[];             // e.g. ["location.agroEcologicalZone", "location.altitudeBand"]
  query(input: TInput, ctx: LocationContext): Promise<PillarResult<TOutput>>;
  provenance: SourceRef[];        // citations: paper, oral tradition, dataset, informant
}
```

### Pillar Execution Guarantees:
- **Requirement Assertion**: The pillar resolver checks all declared `requires` against the resolved `LocationContext`. If an unmet requirement is discovered, it fails loudly rather than making speculative assumptions.
- **Confidence & Provenance**: Every `PillarResult` carries an explicit confidence level (`low | moderate | high`) and source references.
- **Spiritual Opt-in Protection**: Spiritual pillars require explicit user consent. If unconsented, spiritual framing is strictly omitted.

---

## 4. Report Projection Rule: Pure Function Allowlist

The User Report is generated through a pure projection function:

$$\text{UserReport} = \text{projectUserReport}(\text{pro}: \text{ProfessionalReport})$$

### Projection Guarantees:
1. **Strict Field Allowlist**: Fields are mapped explicitly. No object spread or default passthrough.
2. **Zero Mechanism Leakage**: Mechanism strings (e.g., `"Inhibition of intestinal P-gp and CYP3A4"`), raw rule rows, and CYP pathways (e.g., `CYP2D6`, `CYP1A2`) are completely excluded.
3. **Plain-Language Translation**: Culturally readable clinical effects (e.g., `"May cause dizziness and amplify blood-sugar drop"`) replace biochemical jargon.
4. **Mandatory Disclaimer Insertion**: Verbatim disclaimers and any safety gate override notices are prepended automatically.

---

## 5. Role-Based Access Control (RBAC) & API Layer Security

| Route | Method | User Role | Professional Role | Admin Role |
|---|---|---|---|---|
| `/api/profile` | `POST` | Create own profile | Create profile | Create profile |
| `/api/profile/analysis` | `GET` | View own preliminary analysis | View analysis | View analysis |
| `/api/cases` | `POST` | Submit case for evaluation | Submit case | Submit case |
| `/api/cases` | `GET` | View own cases | View queue | View all cases |
| `/api/cases/:id` | `GET` | Filtered status view | Full case details | Full case details |
| `/api/cases/:id/report/user` | `GET` | **403 unless PUBLISHED** | View preview | View preview |
| `/api/cases/:id/report/pro` | `GET` | **403 FORBIDDEN** | View superset | View superset |
| `/api/cases/:id/report/pro` | `PATCH` | **403 FORBIDDEN** | Edit & re-project | Edit & re-project |
| `/api/cases/:id/approve` | `POST` | **403 FORBIDDEN** | Advance to Admin | Advance / Approve |
| `/api/cases/:id/return` | `POST` | **403 FORBIDDEN** | Return to patient | Return to pro |
| `/api/cases/:id/override-gate` | `POST` | **403 FORBIDDEN** | Override gate | Override gate |
| `/api/cases/:id/publish` | `POST` | **403 FORBIDDEN** | **403 FORBIDDEN** | Publish to patient |
| `/api/cases/:id/events` | `GET` | **403 FORBIDDEN** | View audit trail | View audit trail |

Every API endpoint enforces:
`Session Check` $\rightarrow$ `Role Check` $\rightarrow$ `Ownership Check` $\rightarrow$ `Zod Schema Validation` $\rightarrow$ `Cache-Control: no-store`.

---

## 6. Immutable Audit Event Store (`CaseEvent`)

Audit records are append-only. Each event captures:
- `id`: Unique event identifier
- `caseId`: Associated case
- `actorId`: User or system ID
- `actorRole`: `USER | PROFESSIONAL | ADMIN`
- `type`: `submitted | evaluated | edited | approved | returned | published | gate_blocked | gate_overridden`
- `before` / `after`: State snapshots
- `note`: Human or system justification
- `at`: ISO 8601 timestamp
