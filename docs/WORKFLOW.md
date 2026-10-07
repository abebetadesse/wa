# Ethiopian Wisdom Platform Workflow

## 1. Purpose

The application uses a domain-first guided workflow as its primary entry point. A user begins at `/`, is redirected to `/case`, selects a life domain, describes a challenge, provides case-specific context, reviews a synthesized report, refines the relevant findings, and accepts or reviews tailored solutions.

The workflow intentionally keeps two information layers visible:

- **Domain A:** scientific, safety-adjacent, biochemical, psychological, socioeconomic, ecological, and other operational knowledge.
- **Domain B:** cultural, traditional, spiritual, identity, seasonal, and reflective context.

Domain B can shape reflection and framing when the user opts in. It must not override scientific urgency, medication safety, nutrient calculations, or emergency referral logic.

### Biological, wellbeing and health pathway

The expert-reviewed workflow at `/case/workflows` includes **Biological, Wellbeing and Health**. A user may provide one detailed written account, one audio/video attachment, or both. Uploaded media is private to the uploader and the authorized case reviewer; audio/video is not transcribed or interpreted by the automated analysis. The text-based reviewer dossier uses the existing biological, biochemical, medication-safety and dietary knowledge engines. A possible acute emergency is routed to emergency guidance instead of routine analysis. An administrator or assigned reviewer must check and approve the report before it is visible to the user; generated content is educational and is not a diagnosis or treatment plan.

Users are directed to `/profile` after registration. Preliminary profile calculations use entered profile details only; missing birth information is not replaced with sample/default values. Astrology, numerology and naming reflection are cultural tools, while dietary material is educational and not a personalized medical diet.

## 2. Entry Gate

### Browser route

```text
GET /
  -> 307 redirect to /case
```

The root route is implemented in `src/app/page.tsx` and does not render the former overview page. The primary navigation evaluation action also points to `/case`.

### Guided evaluator

```text
/case
```

The guided evaluator is a client-side workflow in `src/app/case/page.tsx`. It loads active domains from `GET /api/cases` and creates a session only after the user selects a domain.

### Authentication boundary

The evaluator now has an authentication gateway at `/auth`. Registration creates a user account, hashes passwords with salted scrypt, issues an HTTP-only short-lived access cookie plus a persisted refresh session, and applies a five-attempt/15-minute lockout policy. The page middleware sends unauthenticated browser routes to `/auth`; auth endpoints remain public so a user can register or sign in.

Guided session APIs resolve the authenticated user server-side and reject session IDs owned by another user. The MySQL database schema is managed by migrations in `drizzle-mysql/` and can be applied with `npm run db:migrate` after a dedicated MySQL 8 database is available.

### Important boundary

The root entry is gated, but direct URLs such as `/diagnostic`, `/intake`, `/inquiry`, `/profile`, and the platform exploration pages remain reachable if a user enters them manually. Enforcing a true application-wide gate requires authentication/session middleware and a route policy; the current implementation provides a mandatory root entry, not global authorization.

## 3. User Journey

### Stage 1: Domain selection

The user selects one of six active domains:

| ID | Display name | Primary concern | Knowledge strands | Layers |
|---|---|---|---|---|
| `wellbeing` | wellbeing | Symptoms, nutrition, medication context, recovery | biochemical, biological, medication, epidemiological, psychological, dietary | A+B |
| `peace` | Peace | Stress, conflict, safety, sleep, restoration | psychological, socioeconomic, cultural | A+B |
| `power` | Power | Agency, boundaries, energy, leadership | psychological, biochemical, ecological | A+B |
| `money` | Money | Stability, obligations, income, planning | socioeconomic, psychological | A+B |
| `career` | Career | Direction, job search, skills, sustainable work | psychological, socioeconomic, cultural | A+B |
| `social` | Social | Belonging, family, friendship, community | psychological, socioeconomic, cultural | A+B |

The client calls:

```http
POST /api/session/start
Content-Type: application/json

{"caseId":"career"}
```

The response contains a `CaseSession` with a generated session ID and `currentStep: "common"`.

### Stage 2: Common challenge selection

The client calls:

```http
GET /api/session/{sessionId}/next
```

The engine returns the domain-specific common challenge question set. The user selects one challenge, for example:

```text
Finding work
```

The client saves it with:

```http
PUT /api/session/{sessionId}/answers
Content-Type: application/json

{"answers":{"challenge":"Finding work"}}
```

Once `challenge` exists, the session moves to `currentStep: "specialized"`.

### Stage 3: Specific case and interest

The next question set is derived from the selected domain. Each domain asks for a specific description plus an interest that controls the recommendations.

Typical fields include:

- `detail`: the user’s situation or concern.
- A domain-specific context field such as `age`, `region`, `medications`, `support`, `barrier`, `horizon`, or `stage`.
- `selectedInterest`: the outcome the user wants to prioritize.
- `reflectionLens`: whether Domain B reflection should be included.

The UI validates required fields before submitting:

```http
PUT /api/session/{sessionId}/answers
Content-Type: application/json

{
  "answers": {
    "detail": "I want a role in public health",
    "stage": "Exploring",
    "selectedInterest": "skill building",
    "reflectionLens": "Yes"
  }
}
```

### Stage 4: Processing and report review

The client requests processing:

```http
POST /api/session/{sessionId}/process
```

The engine creates a report-oriented synthesis containing:

- A primary cause based on the selected common challenge.
- A context cause based on the selected interest and domain-specific field.
- An optional cultural cause when Domain B reflection is selected.
- Evidence labels showing which answers shaped the result.
- Confidence values for review.

The session enters:

```text
currentStep: "reportReview"
reportConfirmed: false
```

The UI displays the selected domain, challenge, interest, Domain A strand count, Domain B preference, and a non-diagnostic disclaimer.

The user confirms the report with:

```http
POST /api/session/{sessionId}/confirm
Content-Type: application/json

{"confirmed":true}
```

The session then enters `causeRefinement`.

### Stage 5: Cause refinement

The user can include or remove the generated findings before recommendations are created:

```http
POST /api/session/{sessionId}/refine
Content-Type: application/json

{"selectedCauseIds":["career-challenge","career-context","career-domain-b"]}
```

The engine marks causes as selected or unselected, creates solutions from the selected causes, and moves to `currentStep: "solution"`.

### Stage 6: Solution review and acceptance

The generated solution set normally contains:

1. An immediate first move tied to the selected interest.
2. A short-term plan tied to the selected interest.
3. A holistic reflection/support option.

Each solution includes:

- `title`
- `section`
- `description`
- actionable `steps`
- confidence
- contributing cause IDs
- knowledge references
- `interestMatch`

The user selects one or more solutions:

```http
POST /api/session/{sessionId}/solution
Content-Type: application/json

{"selectedSolutionIds":["career-immediate","career-short-term"]}
```

The final session state is:

```text
currentStep: "solutionReview"
selectedSolutionIds: [...]
```

The UI shows a completion message and preserves the selected path in the active session.

### Strand-aware processing and safety gates

Each processed session now records a workflow context containing the Domain A strands, opted-in Domain B strands, and the strands queried for the selected domain. Domain B is opt-in through the reflection answer. Critical urgency signals detected in the case details suppress Domain B processing and add a safety cause so reflective or cultural context cannot compete with emergency guidance. Domain A safety handling always takes precedence.

## 4. Session State Machine

```text
common
  -> specialized       when a challenge is saved
specialized
  -> reportReview      when processing is requested
reportReview
  -> causeRefinement   when the user confirms the report
causeRefinement
  -> solution           when causes are refined
solution
  -> solutionReview     when solution choices are submitted
```

A report can be rejected through the API by sending `{"confirmed":false}`. The engine sends the session back to `specialized`, allowing the user to revise the case details. The report UI now exposes an “Edit case details” action that returns to the specialized questions with existing answers preserved; submitting the revised details generates a fresh report.

## 5. Domain A and Domain B Handling

### Domain A

Domain A is represented by the domain’s `knowledgeStrandFilters` and, for the wellbeing domain, the existing scientific engines:

- Nutrient normalization and target calculations.
- Ethiopian regional altitude adjustments.
- Food composition and fermentation bioavailability.
- Medication and herb safety checks.
- Urgency detection and emergency routing.
- Psychological and socioeconomic contextual findings.

The legacy scientific evaluation is available through `/intake` and `/api/intake`. It persists users, wellbeing profiles, intake submissions, reports, causes, solutions, and audit events in MySQL.

### Domain B

Domain B includes the existing cultural and reflective surfaces:

- Cultural heritage and traditional reflection.
- Awde Negest and astrological context.
- Humoral/constitution reflection.
- Naming and Ge'ez identity analysis.
- Seasonal, fasting, coffee ceremony, and community context.

The guided case flow only adds a Domain B cause when the user requests a reflection layer. The generated text explicitly states that Domain B is separate from scientific or safety decisions.

The diagnostic portal also exposes cultural and astrological context, but its disclaimers and architectural firewall are implemented separately from the guided case engine.

## 6. API Surface

| Method | Route | Responsibility |
|---|---|---|
| `GET` | `/api/cases` | List active domains |
| `GET` | `/api/cases/{caseId}` | Return one domain and its common questions |
| `GET` | `/api/questions/{setId}` | Return a question set |
| `POST` | `/api/session/start` | Create an in-memory guided session |
| `GET` | `/api/session/{sessionId}/next` | Return the next question set |
| `PUT` | `/api/session/{sessionId}/answers` | Merge answers into the session |
| `POST` | `/api/session/{sessionId}/process` | Generate report causes |
| `POST` | `/api/session/{sessionId}/confirm` | Confirm or reject the report |
| `POST` | `/api/session/{sessionId}/refine` | Select the causes that guide solutions |
| `GET` | `/api/session/{sessionId}/solution` | Read current solutions and selected causes |
| `POST` | `/api/session/{sessionId}/solution` | Save selected solutions |

## 7. Persistence and Security Status

### Current guided workflow

The current `case-workflow` engine still stores active workflow objects in a process-local `Map`:

```ts
const sessions = new Map<string, CaseSession>();
```

Consequences:

- The authenticated identity is now required for guided session API access.
- Session ownership is checked against the server-side `userId` stored in the session.
- Sessions still disappear when the server restarts because the engine has not yet been switched to repository-backed reads and writes.
- Sessions are not shared across clustered instances.
- There is no database recovery for an interrupted guided case yet.

### Existing database schema

The repository already contains `case_sessions`, `case_causes`, and `case_solutions` tables in `src/lib/db/schema/caseWorkflow.ts`, but the new guided engine does not currently write to them.

### Recommended production hardening

1. Apply the generated migration and configure a non-development `AUTH_SECRET`.
2. Persist every guided session transition to the existing case tables.
3. Replace the in-memory session map with a repository backed by MySQL.
4. Add expiration and deletion policies for abandoned sessions.
5. Store report confirmation and selected solution IDs in the database.
6. Add an audit event for report confirmation and solution acceptance.
7. Extend middleware and API guards to the remaining legacy APIs after deciding which routes are intentionally public.

## 8. Legacy and Parallel Workflows

The application currently contains multiple valid but separate entry points:

- `/case`: new domain-first holistic workflow.
- `/intake`: detailed scientific nutrition intake with MySQL persistence and wellbeing-gap reports.
- `/diagnostic`: multi-strand diagnostic portal with urgency detection, retrieval, causal pathways, and diagnostic session persistence.
- `/inquiry`: lighter natural-language inquiry and synthesis flow.
- `/profile`: astrology, numerology, naming, and personal profiling.
- `/cultural`, `/constitution`, `/ecology`, `/fasting`, `/somatics`, `/zoonotic`: exploratory Domain B or specialized tools.

Only `/` is currently forced into `/case`. Direct navigation to the other routes is still possible. A future consolidation should decide whether `/case` should dispatch wellbeing cases into `/intake` or `/diagnostic` rather than maintaining parallel wellbeing flows.

## 9. Validation Evidence

The standard test command is:

```powershell
npm test
```

It currently covers:

- scientific evaluation stages and altitude calculations.
- Fermentation-aware nutrient gap detection.
- Herb-drug safety canaries.
- Narrative guardrails.
- Domain A/B scientific firewall behavior.
- The six guided case domains.
- Report confirmation, cause refinement, interest matching, and solution selection.

The production validation command is:

```powershell
npm run build
```

The last validated build generated all application routes successfully, including `/`, `/case`, and the guided session APIs.

## 10. Recommended Next Product Iteration

The best next step is not another UI layer. It is unifying the session model and persistence boundary:

1. Make `/case` create or resolve an authenticated user.
2. Persist the guided case to `case_sessions` immediately after domain selection.
3. Route the wellbeing domain’s confirmed case into the scientific evaluation engine when the selected interest is symptom, nutrition, or safety related.
4. Return one review object that combines the guided case context with the appropriate Domain A and optional Domain B findings.
5. Preserve the existing safety gates and urgent-care routing as non-overridable rules.
6. Keep Money, Career, Peace, Power, and Social recommendations educational and clearly scoped; do not present them as scientific, legal, financial, or guaranteed professional advice.

## 11. Mechanism Discovery Extension

The Thryval-inspired discovery slice is available at `/discover` and is implemented by `src/lib/discovery/mechanismEngine.ts`.

### Supported routes

```http
GET /api/mechanism/search?q=metformin&type=medication
GET /api/mechanism/compare?item1=metformin&item2=moringa
```

The current catalog contains a curated set of Ethiopian-context mechanism parallels covering medication, herbs, nutrients, food practices, symptoms, and cultural practices. Each result includes:

- source and target modality types
- mechanism description
- evidence level
- confidence score
- PubMed reference slots for future verified citations
- Ethiopian context where available
- explicit safety notes

The confidence system uses evidence-level weights, but the current records are intentionally conservative. Empty PubMed arrays mean a record has not yet been linked to a verified citation and must not be represented as peer-reviewed coverage. The application does not claim the Thryval scale of thousands of herbs, drugs, conditions, or PubMed records.

Mechanism matches are deliberately kept separate from `checkHerbDrugSafety` and the scientific evaluation pipeline. A parallel pathway is not a compatibility check, equivalent efficacy claim, diagnosis, or treatment recommendation. Safety gates remain authoritative for medication and herb decisions.

### Next discovery phases

1. Add a persistent `mechanism_matches` table with source lineage and citation validation.
2. Import only reviewed records with verified PubMed identifiers and provenance.
3. Add practitioner and curated-content tables with moderation status and expiration.
4. Connect wellbeing case review to mechanism explanations without allowing mechanism scores to bypass urgency or safety gates.

## 12. Integrative Constitution Extension

The Huazhen-inspired wellness layer is available at `/integrative` and is implemented by `src/lib/cultural/multimodalConstitution.ts`.

It combines three explicitly labeled inputs:

- **Everyday pattern check-in:** energy, digestion, stress, sleep, temperature, and activity.
- **Manual observations:** optional pulse-pattern, tongue-color, tongue-coating, and tongue-shape selections.
- **Wearable context:** optional user-entered heart rate, blood oxygen, and sleep duration; the dashboard provides a browser capability notice but does not pretend to support arbitrary Bluetooth device profiles.

The API is:

```http
POST /api/integrative/assess
```

The response includes the existing constitution assessment, modality coverage, observation provenance, Ethiopian food and rhythm recommendations, and safety flags for unusually low oxygen or out-of-range heart-rate readings.

This layer is intentionally reflective and Domain B adjacent. It does not upload or analyze tongue images, perform scientific pulse diagnosis, claim AI model accuracy, or treat wearable readings as medical-device evidence. It must not override the emergency detector, scientific evaluation, herb-drug safety gate, or professional medical advice.

## 13. Knowledge Management Admin Extension

The knowledge administration workspace is available at `/admin/knowledge`.

### Capabilities implemented

- Strand listing and creation/update/archive APIs.
- Category listing and creation with flexible JSON schemas.
- Item listing and JSON-backed draft creation/editing.
- Draft -> review -> published transitions.
- Version snapshots on item edits.
- Audit events for strand creation/update/archive, item publication, review, and status changes.
- Role checks for `editor`, `reviewer`, `admin`, and `super_admin`.

### Schema and migration

The persisted tables are defined in `src/lib/db/schema/knowledgeManagement.ts` and the migration is:

```text
drizzle/0001_worried_johnny_storm.sql
```

Apply migrations with:

```powershell
npm run db:migrate
```

### API surface

```http
GET  /api/admin/knowledge/strands
POST /api/admin/knowledge/strands
PUT  /api/admin/knowledge/strands/{strandId}
DELETE /api/admin/knowledge/strands/{strandId}
GET  /api/admin/knowledge/strands/{strandId}/categories
POST /api/admin/knowledge/strands/{strandId}/categories
GET  /api/admin/knowledge/categories/{categoryId}/items
POST /api/admin/knowledge/categories/{categoryId}/items
PUT  /api/admin/knowledge/items/{itemId}
DELETE /api/admin/knowledge/items/{itemId}
POST /api/admin/knowledge/items/{itemId}/status
```

The current UI uses a JSON editor for flexible item data. A future editor can render fields from `knowledge_categories.schema.fields` without changing the persistence contract.

### Current operational boundary

The admin records are persisted separately from the legacy in-memory `knowledgeCatalog`. Publishing an item records its lifecycle state and audit event, but it does not yet automatically merge that record into the runtime catalog. The next integration step is a published-content loader or cache invalidation bridge that reads only `published` records and safely reloads the retrieval engine.
