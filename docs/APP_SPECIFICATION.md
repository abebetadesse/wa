# Ethiopian Wisdom Platform: App Specification

## 1. Product Summary

The application is an Ethiopian-context health, wellness, and cultural reflection platform. It combines guided case intake, multi-strand knowledge retrieval, nutritional evaluation, medication and herb safety screening, AI-assisted synthesis, and optional cultural reflection.

The primary product promise is:

> Help a person describe a real situation, understand the relevant evidence and risks, and choose a practical next step without allowing cultural or speculative material to override clinical safety.

The application is educational and decision-support software. It does not diagnose, prescribe, replace a clinician, or guarantee an outcome.

## 2. Primary User Journey

1. The user enters the guided case workflow at `/case`.
2. The user selects a domain: health, Peace, Power, Money, Career, or Social.
3. The user selects a challenge and provides domain-specific details.
4. The system saves answers and may provide optional live assistance.
5. The system builds a case context and evaluates urgency.
6. The user reviews findings and their evidence before continuing.
7. The user selects relevant causes or findings.
8. The system generates practical solutions and records the selected plan.
9. The user can export, print, or continue into diagnostic, wellness, cultural, safety, or report views.

Case sessions are resumable through server persistence and browser draft recovery.

## 3. Domain Architecture

### Domain A: Clinical and operational knowledge

Domain A may influence urgency, safety, evidence ranking, recommendations, and referrals. It includes:

- Biochemical
- Biological
- Medication
- Addiction
- Ecological
- Epidemiological
- Psychological
- Socioeconomic
- Dietary

### Domain B: Cultural and reflective knowledge

Domain B is optional and must remain separate from clinical decisions. It includes:

- Cultural
- Astrological

AwudeNegest content is represented as cultural content within the astrological/cultural layer, not as an independent clinical knowledge strand. Numerology is a reflective feature, not a clinical retrieval strand.

Domain B must never change:

- Emergency or urgency level
- Medication or herb interaction decisions
- Nutrient targets or deficiency calculations
- Clinical diagnosis or treatment recommendations
- Referral priority

Critical urgency signals firewall Domain B content from active case recommendations until urgent care is addressed.

## 4. Knowledge Retrieval

The knowledge system has two complementary data paths:

1. Registered strand engines in `src/lib/knowledge/strands` provide structured domain-specific reasoning and findings.
2. The catalog and knowledge-management tables provide searchable, versioned categories and items.

The registered strand catalog is the authoritative list for case routing. Case filters must reference valid registered strands and must not contain pseudo-strands.

The retrieval orchestrator queries applicable strands, normalizes missing results, calculates cross-strand intersections, and passes the combined evidence to the reasoning engine.

Each finding should expose, where available:

- Strand and domain
- Finding type and name
- Description and evidence
- Relevance and confidence
- Severity or risk level
- Recommendations and management guidance
- Source references
- Safety alerts

## 5. Case Routing

Every case is associated with the full registered knowledge catalog so that the selected case can use the same knowledge foundation as the diagnostic portal. Layer routing determines whether a strand is queried as Domain A or Domain B.

The shared routing configuration is maintained in:

- `src/lib/case-workflow/strandRouting.ts`
- `src/lib/case-workflow/engine.ts`
- `src/lib/case-workflow/integration.ts`

The routing configuration must remain typed against `KnowledgeStrandType`. Adding a new registered strand requires updating the catalog, its implementation or database-backed resolver, and routing tests.

## 6. AI and Bionic GPT

The AI layer is an optional augmentation over deterministic retrieval and safety logic.

Expected behavior:

- Ground responses in the user query, profile, retrieved findings, and safety state.
- Answer the actual question before offering reflective context.
- Identify uncertainty and missing information.
- Avoid diagnosis, prescribing, medication changes, and unsupported herb claims.
- Treat emergency symptoms plainly and direct the user to urgent care.
- Keep Domain B separate from clinical reasoning.
- Fall back to deterministic output when the external model is unavailable.

Bionic GPT configuration is server-side and must never expose API keys to the browser. External requests require timeouts, structured error handling, and safe fallback behavior.

## 7. Medication, Herbal, and Pharmacognosy Safety

Safety decisions must be based on active substances and persisted evidence whenever possible.

The database model supports:

- `herbs`: vernacular, scientific, and Amharic names
- `compounds`: active compounds associated with each herb
- `herb_drug_interactions`: drug classes, example medicines, severity, mechanism, clinical effect, contraindication, evidence level, and source

The production safety path should:

1. Resolve the requested herb by vernacular or scientific name.
2. Load its persisted active compounds.
3. Load its persisted interaction rules.
4. Resolve the user's medication names and active ingredients/classes.
5. Match the medication against the interaction rule and ingredient context.
6. Return the interaction severity, mechanism, clinical effect, contraindication, and source reference.
7. Fail closed for high-risk or contraindicated combinations.

Static safety rules may remain as an offline fallback, but database-backed evidence is authoritative when available. Culinary use and concentrated medicinal preparations should be distinguished where the evidence supports that distinction.

## 8. Nutritional Evaluation

The evaluation pipeline covers:

1. Profile normalization
2. Altitude and demographic target calculation
3. Food and nutrient intake analysis
4. Fermentation and bioavailability adjustments
5. Cause attribution
6. Herb and medication safety screening
7. Solution generation
8. Narrative and audit validation

Traditional remedies must pass the safety gate before they can appear as recommendations. Blocked remedies must be recorded in the audit/culling output and must not be surfaced as safe solutions.

## 9. Database Responsibilities

PostgreSQL is the source of truth for persisted operational data, including:

- Users and authentication sessions
- health profiles
- Case sessions and answers
- Diagnostic sessions
- Reports and identified gaps
- Nutrients, foods, causes, and solutions
- Herbs, compounds, and herb-drug interactions
- Knowledge strands, categories, items, and versions
- Audit and governance records

In-memory caches may improve response time but must not be treated as durable storage or as the only source of safety evidence.

Knowledge publishing should validate strand names, category structure, versions, item data, and source metadata before activation.

## 10. Main Routes

### User workflows

- `/case`: guided case intake and solution planning
- `/diagnostic`: multi-strand diagnostic portal
- `/intake`: nutritional assessment
- `/report/[id]`: generated nutritional health-gap report
- `/safety`: herb and medication safety checker
- `/wellness`: wellness guidance
- `/awde-negast`: cultural reflection viewer
- `/profile`: personal profile and context

### API responsibilities

- `/api/cases`: active case definitions
- `/api/session/*`: case lifecycle and answer persistence
- `/api/diagnostic/analyze`: multi-strand analysis and persistence
- `/api/knowledge/*`: knowledge catalog loading, searching, metadata, and strand access
- `/api/safety-check`: database-backed herb safety evaluation
- `/api/chat/*`: profile-aware AI chat and readings
- `/api/ai/bionic/test`: Bionic connectivity and configuration diagnostics

## 11. Security and Privacy

- Authentication uses server-side session validation and HTTP-only cookies.
- Protected APIs must authorize ownership of case, profile, report, and diagnostic records.
- Restricted health and medication fields must remain encrypted at rest where configured.
- AI prompts must avoid unnecessary personal data and must not include secrets.
- Safety, report-generation, knowledge-publishing, authentication, and permission changes should be auditable.
- Export and deletion actions require clear user intent and appropriate authorization.

## 12. Accessibility and UX Requirements

Every data-backed screen should provide:

- Loading state
- Empty state
- Error and retry state
- Keyboard-accessible controls
- Visible focus states
- Mobile-responsive layout
- Clear safety and cultural-layer labels
- Plain language around uncertainty and limitations

Clinical warnings and emergency actions must be visually prominent without relying only on color.

## 13. Testing Requirements

Focused tests should cover:

- Case state transitions and draft recovery
- Case filters versus registered knowledge strands
- Domain A/B firewall behavior
- Urgency detection and emergency routing
- Active-ingredient herb-drug interaction matching
- Nutrient target and fermentation calculations
- AI fallback behavior
- Knowledge document validation and database loading
- Authentication, ownership, and RBAC

Required validation commands include:

```text
npm exec tsc -- --noEmit --pretty false
npm test
```

## 14. Known Gaps and Next Priorities

1. Complete database seeding and publishing for every knowledge strand instead of relying on in-memory or static seed data.
2. Add persisted pharmacognosy records for plant parts, preparations, active compounds, dose/formulation context, and evidence level.
3. Add explicit database-backed strand metadata for cultural and astrological content while preserving their Domain B firewall.
4. Normalize medication records so active ingredients are first-class fields rather than inferred from free-text names.
5. Repair remaining diagnostic test failures around multilingual herbal intent classification and herb-drug matching fixtures.
6. Restore missing Bionic GPT adapter exports required by existing chat and connection-test routes.
7. Add browser-level tests for the case workflow, safety checker, report imagery, and accessibility states.

## 15. v4 Product Direction: Divination-First Advisory Platform

The v4 product direction changes the business emphasis from health-first to divination-first while preserving health as the scientific credibility anchor.

### Priority order

1. Spiritual and life direction
2. Relationships and family
3. Career and business
4. Legal and dispute guidance
5. health and wellness

The platform's core cultural services are Ge'ez gematria, AwudeNegest interpretation, Ethiopian and Western astrology, traditional mediation, and reflective spiritual guidance. health, legal, financial, and mental-health content must remain appropriately scoped and must not be presented as professional advice unless reviewed by the appropriate qualified expert.

### Five product case types

| Case type | Primary expert path | Cultural role | Required safety focus |
|---|---|---|---|
| Spiritual and life direction | Verified debtera, numerologist, astrologer, spiritual counselor | Primary | Mental-health crisis, exploitation, false promises |
| Relationships and family | Licensed counselor plus verified traditional mediator | Primary | Domestic violence, child safety, coercion |
| Career and business | Career counselor, financial advisor, AwudeNegest specialist | Primary | Financial distress, suicidal ideation, financial-advice limits |
| Legal and dispute | Licensed attorney plus verified elder mediator | Primary | Imminent harm, arrest, eviction, jurisdiction limits |
| health | Licensed clinician plus traditional-healer collaborator | Supporting | Medical emergency, medication safety, clinical referral |

### Mandatory product rules

- No completed report becomes visible without verified expert identity, case-type credentials, review timestamp, and approved expert content.
- Crisis-routing content is immediate, free, and never blocked by expert review, payment, or AI availability.
- Practical/evidence-informed content and cultural/spiritual content are separate sections with separate disclaimers and no combined score or confidence value.
- AI may structure intake, retrieve deterministic context, and draft neutral material for review. AI may not issue final predictions, guarantees, diagnoses, prescriptions, legal advice, financial advice, or unreviewed rituals.
- If AI is unavailable, the case still enters the expert queue with the structured intake and deterministic context. The review requirement is never lowered.

## 16. v4 Report Lifecycle

The target report state machine is:

```text
intake -> crisis_triage -> draft_ai_generated -> pending_expert_review
	-> expert_revision_requested -> pending_expert_review
	-> expert_approved -> visible_to_user -> full_report_released
	-> archived
```

The crisis branch runs in parallel and exposes safety resources before report review. Visibility requires all of the following:

- `expert_id` is present.
- The expert credential is verified and valid for the case type.
- `reviewed_at` and approved expert content are present.
- Required case-specific checklist items are complete.

The database should enforce these conditions with constraints or triggers, and every status transition should create an immutable audit event.

## 17. v4 Data and Service Additions

The v4 target requires the following persisted concepts beyond the current repository:

- `experts` with credentials, case-type scope, language, availability, expiry, and ethics status.
- `case_reports` with AI draft, expert final content, review state, crisis bypass, payment state, and divination context.
- `report_status_log` and privacy-safe `ai_interactions`.
- `consent_log` for AI analysis, divination, data sharing, and terms versions.
- `report_purchases` and consultation scheduling with idempotent payment webhooks.
- Expert dashboards, review queues, per-case checklists, reassignment, escalation, refunds, and audit views.
- Divination context persistence for gematria, zodiac, AwudeNegest circle/segment, talismanic character, and optional healing-scroll artifacts.

Payment providers, expert credential verification, legal compliance, crisis contacts, and data residency require operational and legal approval before production activation.

## 18. v4 Reconciliation With Current Repository

The current repository already provides useful foundations:

- Next.js App Router and authenticated case workflow.
- Deterministic urgency detection and health safety gates.
- Cultural and astrological engines with Domain B labeling.
- Ge'ez gematria and AwudeNegest calculation modules.
- Bionic GPT integration with deterministic fallback intent.
- Nutritional, medication, herb, and knowledge-strand infrastructure.

The following v4 capabilities are target-state work, not yet complete in the current app:

- The current case workflow has six generic domains rather than the five v4 business case types.
- Expert credentialing, review queues, report approval, and DB-level visibility gates are not yet implemented end to end.
- Crisis routing currently covers health-focused signals; DV, child-safety, legal, financial-distress, and spiritual-exploitation rules must be added.
- Payment, consultation booking, notifications, healing-scroll generation, and refund workflows are not yet production services.
- Some knowledge and divination content remains engine-backed or in-memory rather than fully persisted and reviewed.

Implementation should proceed incrementally: establish the expert/review state machine and crisis bypass first, then add divination-first case types, followed by payment and consultation services. Existing health safety behavior and Domain A/B separation must remain intact throughout the migration.

## 19. Case 1 Dynamic Workflow: Spiritual and Life Direction

Case 1 is the first divination-first workflow to receive a dynamic implementation. The user experience should adapt to the user's name, mother's name, live Ge'ez calculation, selected life category, prior answers, crisis signals, and expert availability.

### Dynamic stages

1. **Name entry:** accept Ge'ez/Amharic name and optional mother's name, validate script, and calculate gematria as input changes.
2. **Live divination preview:** show letter values, total, final number, zodiac context, AwudeNegest circle/segment, and talismanic context with a reflective disclaimer.
3. **Adaptive intake:** generate the base question category first, then branch into life direction, career, relationships, family, health, or spiritual-growth questions. Relationship branches require safety screening.
4. **Optional follow-ups:** use a debounced, privacy-minimized AI endpoint to suggest neutral clarifying questions from the user's own text. Follow-ups are optional and never replace crisis detection.
5. **Divination reveal:** present the deterministic calculation and cultural context before expert review; do not present it as a prediction or guarantee.
6. **Expert queue:** match verified experts by case type, credential scope, language, availability, specialty, and current load. Show status and ETA only from server data.
7. **Preview and review gate:** expose the free divination context and report outline, but release personalized report content only after expert approval.
8. **Payment and unlock:** unlock paid report and scroll artifacts only after an idempotently verified payment event.
9. **Consultation:** expose scheduling only for an approved report and an available, verified expert.

### Real-time requirements

- Live gematria calculation should be deterministic and client-responsive, with server recalculation at submission.
- Crisis detection must run on every relevant input change on the client and again on the server before persistence or AI work.
- Expert assignment, queue position, ETA, payment state, and report readiness must come from authenticated server events or polling fallback, never client assertions.
- AI follow-up requests must be debounced, cancellable, rate-limited, and stripped of unnecessary personal data.
- The workflow needs loading, error, retry, offline, and stale-data states at every asynchronous boundary.

### Case 1 safety rules

- Crisis content is shown immediately and is never paywalled or held for expert review.
- No AI or expert output may predict death, serious harm, guaranteed outcomes, or specific future events.
- Cultural/divination content and practical guidance remain separate sections with separate disclaimers.
- health, financial, legal, and mental-health disclosures trigger the appropriate safety route and professional referral; divination must not interpret them as treatment or advice.
- The user's name and mother's name are sensitive profile data: minimize AI exposure, encrypt persisted values, and record divination consent separately from AI consent.

### Case 1 target APIs

```text
POST /api/case/spiritual/start
POST /api/case/spiritual/calculate-gematria
POST /api/case/spiritual/follow-ups
POST /api/case/spiritual/:caseId/submit
GET  /api/case/spiritual/:caseId/divination
GET  /api/case/spiritual/:caseId/status
GET  /api/case/spiritual/:caseId/preview
POST /api/case/spiritual/:caseId/purchase
GET  /api/case/spiritual/:caseId/report
GET  /api/case/spiritual/:caseId/scroll
POST /api/case/spiritual/:caseId/consult
GET  /api/experts/:expertId/availability
```

### Case 1 implementation order

1. Extract a deterministic `calculateFullDivination` service and add unit tests for known Ge'ez names.
2. Add a persisted spiritual case type and consent model without bypassing current authentication.
3. Build live name entry and preview using server-validated calculations.
4. Add dynamic question branching and deterministic crisis rules.
5. Implement expert credential scope, assignment, review checklist, and visibility enforcement.
6. Add preview/status screens, then payment, scroll generation, notifications, and consultation booking.
7. Add end-to-end tests for crisis bypass, review blocking, payment idempotency, and report release.

The full target specification describes an 11-week delivery roadmap, but the repository should ship these as independently validated slices rather than introducing an unverified all-at-once workflow.

## 20. Case 2 Dynamic Workflow: Relationships and Family

Case 2 is a two-subject, safety-first workflow. It may analyze the user alone or the user and partner together, but compatibility content is always reflective and must never obscure domestic violence, child-safety, coercion, or mental-health risk.

### Mandatory workflow order

1. **Safety pre-screen:** before names, gematria, AI, or compatibility calculation, ask about current safety, threats, child risk, and coercion.
2. **Crisis route:** immediately show neutral, private safety resources for violence or child-safety concerns. Do not quote sensitive disclosures in a banner that another person may see.
3. **Dual name entry:** accept the user's name and optional partner name, with separate consent and privacy controls for partner data.
4. **Live compatibility context:** calculate individual gematria first, then optional combined compatibility, relationship circle, segment, and interaction pattern.
5. **Adaptive relationship intake:** branch on relationship status, primary concern, duration, family involvement, children, and compatibility context.
6. **Expert review:** route routine cases to a licensed counselor and, when requested and safe, a verified traditional mediator. Urgent safety cases prioritize DV-trained counselors and do not require joint participation.
7. **Preview and release:** show the reflective compatibility context and report outline after review; release full guidance only after the expert gate and any payment requirement.
8. **Consultation and follow-up:** support solo or couples sessions, with a private seven-day safety check for cases that carry concern flags.

### Safety pre-screen contract

The first server-validated interaction should evaluate:

- `is_safe`: safe, unsafe, unsure, or prefer not to answer.
- `has_threat`: no, yes, or prefer not to answer.
- `child_risk`: no children, safe, concerned, or prefer not to answer.
- `is_coerced`: no, yes, or prefer not to answer.

Unsafe, threatened, or child-risk responses enter crisis routing. Coercion and uncertainty continue only with an urgent or high-priority expert flag. Crisis resources are free, private, and never gated behind payment or report review.

### Dual compatibility boundaries

- Individual and partner calculations must remain separately attributable.
- Compatibility scores are deterministic cultural reflection, not measures of relationship safety, abuse risk, relationship quality, or likelihood of success.
- The system must not recommend staying, leaving, confronting, or reconciling when safety information indicates danger.
- Practical communication guidance requires counselor review; traditional mediation requires an appropriately verified mediator.
- A partner's data must not be exposed to the other person without explicit consent and authorization.

### Dynamic relationship questions

The question engine should branch on:

- Single, dating, engaged, married, separated, or complicated status.
- Communication, trust, intimacy, family, money, children, conflict, future, or compatibility concern.
- Relationship duration and separation context.
- Children in the household and parenting concerns.
- Optional interaction pattern such as harmonious, complementary, dynamic, challenging, or transformative.

AI follow-ups must be neutral, optional, grounded in the user's own words, debounced, cancellable, and stopped when crisis content is detected. AI must never interview a user about sensitive safety details in a way that increases danger.

### Expert assignment and review

Routine relationship cases may require two distinct expert roles:

- Licensed psychologist, marriage and family counselor, or clinical social worker.
- Verified traditional marriage mediator when cultural mediation is requested and safe.

Urgent safety flags prioritize a DV-trained counselor and suppress automatic couples-session recommendations. Approval requires the relationship checklist, including DV screening, child-safety screening, no one-sided clinical diagnosis, no dangerous advice, cultural labeling, appropriate disclaimers, and mediator review when applicable.

### Case 2 target APIs

```text
POST /api/case/relationships/safety-screen
POST /api/case/relationships/start
POST /api/case/relationships/calculate-gematria
POST /api/case/relationships/follow-ups
POST /api/case/relationships/:caseId/submit
GET  /api/case/relationships/:caseId/compatibility
GET  /api/case/relationships/:caseId/status
GET  /api/case/relationships/:caseId/preview
POST /api/case/relationships/:caseId/purchase
GET  /api/case/relationships/:caseId/report
GET  /api/case/relationships/:caseId/mediation-guide
POST /api/case/relationships/:caseId/consult
```

### Case 2 implementation order

1. Implement and test deterministic safety-screen evaluation and crisis contacts.
2. Add private, server-side relationship case state and consent records.
3. Extract reusable individual gematria and add dual compatibility calculation tests.
4. Add adaptive relationship questions and continuous server-side crisis monitoring.
5. Add expert credential scope, DV-trained assignment, dual review checklists, and release enforcement.
6. Add private status, preview, payment, mediation-guide, consultation, and seven-day follow-up services.
7. Add end-to-end tests proving crisis routing, compatibility reproducibility, review blocking, partner privacy, and escalation response.

The Case 2 target roadmap is twelve weeks, but safety-screen and crisis-routing slices must be validated before compatibility or payment features are exposed.

## 21. Case 3 Dynamic Workflow: Career and Business

Case 3 combines practical career direction with optional Ethiopian timing and business-name reflection. Career and business decisions can affect housing, food, debt, and mental health, so financial-distress and self-harm screening must happen before gematria, AI, or payment flows.

### Mandatory workflow order

1. **Financial-distress pre-screen:** ask whether basic needs are met, whether self-harm thoughts are present, and whether another person is pressuring financial decisions.
2. **Crisis and support route:** route self-harm disclosures immediately to crisis support; route unmet basic needs to social-service and community resources with an urgent expert flag.
3. **Name entry:** accept the user's name, mother's name, and optional business name, with consent and privacy controls for business data.
4. **Career context:** calculate personal and optional business gematria, career affinity, reflective timing windows, circle/segment context, and a blessing preview.
5. **Adaptive intake:** branch on career stage, primary concern, business status, partnership, timing, money concerns, and work-life balance.
6. **Expert review:** assign a career counselor or timing specialist; add a licensed financial advisor when the case involves financial decisions or referral needs.
7. **Preview and release:** show timing and cultural context as reflective material, with practical guidance and report content gated by expert approval.
8. **Payment and artifacts:** unlock the approved report and optional business-blessing certificate only after verified payment.
9. **Consultation:** support solo career or business-owner consultations with a verified expert.

### Financial safety contract

The first server-validated interaction should evaluate:

- `basic_needs`: comfortable, difficult, no, or prefer not to answer.
- `self_harm`: no, occasionally, frequently, or prefer not to answer.
- `financial_pressure`: no, yes, or prefer not to answer.

Frequent or occasional self-harm thoughts enter immediate crisis routing. Unmet basic needs provide free social-service resources and a high-priority expert flag. Financial pressure or uncertainty continues only with an appropriate review flag.

### Regulatory and content boundaries

- Career guidance may discuss skills, work direction, communication, planning, and general business organization.
- Traditional timing and numerology are cultural reflection only; they do not predict success or guarantee a launch, contract, investment, or business outcome.
- The platform must not provide investment advice, lending advice, securities advice, tax advice, contract advice, or personalized financial recommendations without a licensed professional.
- Money-related cases must offer referral to a verified licensed financial advisor when appropriate.
- Expert approval must confirm that no financial advice, guarantees, or exploitative urgency language appears in the report.

### Dynamic career questions

The question engine should branch on:

- Starting, transitioning, stuck, advancing, own-business, expanding, or retirement stage.
- Direction, job search, advancement, launch, growth, business challenges, timing, partnership, money, or work-life concern.
- Business age, business type, resources, skills, partnership context, and the proposed decision timeline.
- Financial concern details and whether a licensed advisor is already involved.

AI follow-ups must be neutral, optional, grounded in the user's own words, debounced, cancellable, and stopped when distress or self-harm content is detected. AI must not generate financial recommendations or pressure the user toward a paid ritual, report, or consultation.

### Timing and business reflection

Any timing calendar should:

- Be reproducible from the supplied name, business context, date range, and deterministic calculation version.
- Show the calculation inputs and generated-at time.
- Use language such as “traditional reflection” or “cultural timing lens,” never “success potential” as a factual probability.
- Keep practical career steps in a separate evidence-informed section.
- Require expert review before personalized blessing instructions or downloadable artifacts are released.

### Expert assignment and review

Routine cases may use a certified career counselor, verified business mentor, or AwudeNegest timing specialist. Cases with financial decision-making should include or refer to a licensed financial advisor. Urgent financial-distress cases prioritize experts trained in crisis referral and should not be routed directly into a sales or payment flow.

Approval requires confirmation of financial-distress screening, no financial or investment advice from unlicensed personnel, no guaranteed outcomes, cultural labeling, appropriate referrals, and clear disclaimers.

### Case 3 target APIs

```text
POST /api/case/career/safety-screen
POST /api/case/career/start
POST /api/case/career/calculate-gematria
POST /api/case/career/follow-ups
POST /api/case/career/:caseId/submit
GET  /api/case/career/:caseId/timing
GET  /api/case/career/:caseId/status
GET  /api/case/career/:caseId/preview
POST /api/case/career/:caseId/purchase
GET  /api/case/career/:caseId/report
GET  /api/case/career/:caseId/blessing-certificate
POST /api/case/career/:caseId/consult
```

### Case 3 implementation order

1. Implement and test deterministic financial-distress screening and crisis contacts.
2. Add private, server-side career case state and separate financial/advisory consent records.
3. Extract reusable individual gematria and add optional business-name calculation tests.
4. Add adaptive career questions and server-side distress monitoring.
5. Add expert credential scope, licensed-advisor referral logic, review checklists, and release enforcement.
6. Add timing preview, status, payment, blessing-certificate, consultation, and notification services.
7. Add end-to-end tests proving crisis routing, timing reproducibility, financial-advice blocking, review enforcement, and payment idempotency.

The Case 3 target roadmap is eleven weeks, but financial-safety screening and advice-boundary enforcement must be validated before timing, payment, or business-artifact features are exposed.

## 22. Definition of Done

A feature is complete when it:

- Uses the existing typed architecture and database boundaries.
- Preserves Domain A safety and Domain B separation.
- Has focused automated coverage.
- Passes TypeScript validation and relevant tests.
- Provides loading, error, empty, and retry behavior where applicable.
- Records important safety and governance decisions.
- Clearly identifies deferred work and known limitations.
