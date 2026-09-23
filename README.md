# Ethiopian Wisdom & Wellness Platform

An Ethiopian-centered wisdom, wellness, knowledge, and expert-review platform built with Next.js, React, TypeScript, Drizzle ORM, and PostgreSQL-compatible data access.

The application combines two intentionally separated knowledge domains:

- **Domain A — Welbeing and evidence:** wellness intake, nutrition, medication and herb safety, urgency detection, diagnostic-adjacent reasoning, and practical next steps.
- **Domain B — cultural and reflective knowledge:** Ethiopian heritage, manuscripts, Awde Negast, astrology, numerology, Hexacore reflection, naming, traditional medicine, ritual context, and spiritual interpretation.

Domain B can enrich a user-requested reflection, but it is not presented as a diagnosis, prescription, emergency response, or substitute for licensed professional care.

## What the platform does

The platform supports:

- Account registration, email verification, login, logout, password recovery, session management, and role-based access.
- Profile onboarding with consent-based personal and optional device information.
- Case intake for Welbeing, peace, power, money, relationships, career, legal, social, and spiritual/cultural topics.
- Question-driven case sessions with autosaved answers and recoverable browser drafts.
- Safety screening and crisis routing before specialized workflows continue.
- Preliminary analysis, cause refinement, solution selection, and report review.
- Expert assignment and review gates for specialized case types.
- Ethiopian location, ecology, food, nutrition, herbs, traditional medicine, and manuscript knowledge.
- Hexacore Arcana reflection, creation-day mappings, archetypes, correspondences, frequencies, and a visual orrery.
- Biblical, Ethiopian, Amharic, Ge’ez-linked, and culturally contextual name suggestions with transparent scoring.
- Administrative knowledge, profile, user, audit, role, analytics, and export tools.

## Core user workflow

The normal user journey is:

```text
Guest landing page
  -> Register or sign in
  -> Verify account when required
  -> Complete private profile
  -> Choose a case domain
  -> Select the current challenge
  -> Answer common and domain-specific questions
  -> Review preliminary analysis
  -> Refine causes
  -> Select practical solutions
  -> Review or submit the case
  -> Receive a preliminary or expert-reviewed outcome
```

### 1. Registration and authentication

Registration is handled by `POST /api/auth/register`.

The registration flow:

1. Validates email and password strength.
2. Optionally validates Ethiopian phone numbers.
3. Requires acceptance of the Terms of Service and Privacy Policy.
4. Enforces the current minimum registration age.
5. Prevents duplicate email and phone accounts.
6. Creates the user with the default user role.
7. Creates an email-verification record and one-time verification code.
8. Establishes an authenticated session so the user can continue onboarding.
9. Writes audit and activity events.

Login is handled by `POST /api/auth/login`.

The login flow:

1. Normalizes the email address.
2. Checks that the account is active and not suspended.
3. Enforces temporary lockout after repeated failed passwords.
4. Verifies the password.
5. Resets failed-attempt counters after successful authentication.
6. Creates the session and JWT cookies.
7. Records login, audit, and activity events.
8. Redirects the user to the requested safe internal path or `/profile/onboarding`.

The standalone login UI is available at [`/auth/login`](C:/Users/abebe/Desktop/wa/src/app/auth/login/page.tsx). The broader authentication experience is under [`/auth`](C:/Users/abebe/Desktop/wa/src/app/auth/page.tsx).

### 2. Profile onboarding and consent

The onboarding UI is implemented in [`ProfileOnboarding.tsx`](C:/Users/abebe/Desktop/wa/src/components/profile/ProfileOnboarding.tsx) and is reached at `/profile/onboarding`.

The user supplies:

- Full name
- Phone number
- Case type
- Birth location
- Mother’s name when required by the selected cultural or identity workflow
- Optional social handles entered directly by the user

The browser may offer basic metadata such as language, platform, timezone, and user agent, but only when the user explicitly consents. The application does **not** silently read private phone contacts or scrape social-media accounts. Browsers do not grant that access safely or reliably.

Profile data is stored through `PUT /api/profile`. Profile updates are merged into the user profile record and audited. The profile API also exposes configured field metadata and computed values such as BMI when height and weight are available.

### 3. General case workflow

The general case workspace is available at `/case` and is implemented in [`src/app/case/page.tsx`](C:/Users/abebe/Desktop/wa/src/app/case/page.tsx).

The general workflow is driven by [`engine.ts`](C:/Users/abebe/Desktop/wa/src/lib/case-workflow/engine.ts):

1. **Choose care path** — load active case definitions from `GET /api/cases`.
2. **Select challenge** — choose the issue or goal that best describes the request.
3. **Complete common questions** — collect shared context.
4. **Complete specialized questions** — ask questions associated with the selected domain and challenge.
5. **Save answers** — changes are debounced to `PUT /api/session/:sessionId/answers`.
6. **Build workflow context** — map the case to Domain A and, when requested and safe, Domain B knowledge strands.
7. **Run urgency detection** — identify critical or high-risk signals before cultural reflection is included.
8. **Process the session** — generate causes, evidence references, safety notes, and candidate solutions.
9. **Review the report** — the user can confirm or return to specialized questions.
10. **Refine causes** — select which findings should inform the next plan.
11. **Choose solutions** — select immediate, short-term, long-term, preventive, or holistic actions.
12. **Complete or continue to review** — the selected plan becomes the current session outcome.

The active browser draft is saved under the local-storage key `Debtera-active-case-draft`. This protects progress across refreshes, but it is not a substitute for server persistence.

The session API surface includes:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/session/start` | Start an authenticated general case session |
| `GET /api/session/:sessionId/next` | Get the next question or workflow state |
| `PUT /api/session/:sessionId/answers` | Save answers |
| `POST /api/session/:sessionId/process` | Generate preliminary analysis |
| `POST /api/session/:sessionId/confirm` | Confirm or reject the report |
| `POST /api/session/:sessionId/refine` | Select causes |
| `POST /api/session/:sessionId/solution` | Select solutions |

### 4. Safety and knowledge routing

The integration layer is implemented in [`integration.ts`](C:/Users/abebe/Desktop/wa/src/lib/case-workflow/integration.ts).

For every general case, the application:

1. Selects relevant Domain A knowledge strands.
2. Includes Domain B strands only if the user requests a reflection layer.
3. Runs urgency detection against the case narrative.
4. Blocks Domain B content for critical cases.
5. Preserves safety signals and matched indicators in the workflow context.

This keeps cultural interpretation separate from urgent safety handling. Emergency or crisis signals must be directed to appropriate in-person, emergency, legal, safeguarding, or crisis services rather than treated as ordinary reflective content.

## Specialized expert workflows

Specialized workflows share the same principles—intake, safety screen, structured questions, analysis, expert assignment, review, and optional consultation—but each has its own question engine and safety rules.

### Spiritual and cultural cases

The spiritual workflow is implemented in [`spiritualExpertEngine.ts`](C:/Users/abebe/Desktop/wa/src/lib/case-workflow/spiritualExpertEngine.ts).

Typical stages:

```text
case_received
  -> divination_calculated
  -> ai_draft_prepared
  -> pending_expert_review
  -> visible_to_user
  -> full_report_released
  -> consultation_booked
```

The workflow can calculate culturally defined divination values, prepare a preliminary draft, assign a verified expert using language, region, specialization, rating, ethics, and workload signals, and hold the final report behind expert review. Spiritual crisis screening must take priority over divination or ritual content.

Relevant routes include:

- `POST /api/case/spiritual/start`
- `POST /api/case/spiritual/:caseId/divination`
- `POST /api/case/spiritual/:caseId/preview`
- `POST /api/case/spiritual/:caseId/submit`
- `GET /api/case/spiritual/:caseId/status`
- `GET /api/case/spiritual/:caseId/report`
- `POST /api/case/spiritual/:caseId/consult`

### Career and business cases

The career workflow is implemented in [`careerWorkflow.ts`](C:/Users/abebe/Desktop/wa/src/lib/case-workflow/careerWorkflow.ts).

Stages include:

```text
safety_screen
  -> foundation
  -> stage_specific
  -> timing
  -> expert_review_pending
  -> visible_to_user
  -> full_report_released
  -> consultation_booked
```

The workflow builds a career profile, determines the user’s career stage, calculates timing windows, assigns a career advisor, and prepares a report shell. Safety responses may route the user directly to crisis or additional-support content.

Primary routes include:

- `POST /api/case/career/start`
- `GET /api/case/career/start?sessionId=...`
- `POST /api/case/career/questions`
- `POST /api/case/career/analyze`
- `GET /api/case/career/experts`
- `POST /api/case/career/consult`

### Relationship and family cases

Relationship workflows use a relationship safety screen, structured relationship questions, compatibility reflection, and an assigned counselor or mediator. A submitted case moves to `pending_expert_review` when an expert is available.

The workflow prioritizes:

- Physical and emotional safety
- Respect and boundaries
- Communication and trust
- Mediation or counseling when direct communication is unsafe or ineffective

Compatibility scores are reflective indicators, not objective diagnoses of a relationship or person.

### Legal and dispute-support cases

Legal workflows are implemented in [`legalWorkflow.ts`](C:/Users/abebe/Desktop/wa/src/lib/case-workflow/legalWorkflow.ts).

Stages include:

```text
safety_screen
  -> intake
  -> matter
  -> expert_review_pending
  -> legal_aid_route or visible_to_user
  -> full_report_released
  -> consultation_booked
```

The workflow collects jurisdiction and matter information, performs a safety screen, and can route cases toward legal aid. Platform content is informational and does not establish an attorney-client relationship.

### Social and community cases

Social workflows are implemented in [`socialWorkflow.ts`](C:/Users/abebe/Desktop/wa/src/lib/case-workflow/socialWorkflow.ts).

Stages include:

```text
safety_screen
  -> intake
  -> pattern
  -> expert_review_pending
  -> visible_to_user
  -> full_report_released
  -> consultation_booked
```

The workflow identifies social patterns, screens for safety concerns, and can assign an expert before releasing a complete report.

## Cultural knowledge and reflection modules

The cultural modules are intentionally descriptive and reflective.

### Hexacore Arcana

The Hexacore system models six cores—Power, Humanity, Creation, Peace, Spirit, and Order—with:

- Six cores
- Thirty-six aspects
- Two hundred sixteen frequencies
- Archetypes, shadows, gifts, and remedies
- Core-pair relationships
- Creation-day mappings from Sunday through Friday
- Correspondences such as planets, herbs, sounds, geometry, metals, and stones
- Cross-system bridges and a visual orrery

The main experience is `/hexacore`, rendered by [`HexacoreOrrery.tsx`](C:/Users/abebe/Desktop/wa/src/components/cultural/HexacoreOrrery.tsx). The API is available at `/api/cultural/hexacore`.

Hexacore output is for reflection, journaling, cultural exploration, and self-description. It is not a medical, psychological, legal, or spiritual certainty claim.

### Names and naming suggestions

The naming engine combines:

- Biblical names
- Biblical place names
- Ethiopian and Amharic names
- Ge’ez-linked names
- Meaning and tradition metadata
- Core-number and reflective-element alignment

Suggestions include a best match, score, source tradition, meaning, and score breakdown. Scoring is transparent and should be understood as a cultural/reflection aid rather than an objective prediction.

Relevant endpoints include:

- `GET /api/profile/naming`
- `POST /api/profile/suggest-name`
- `GET /api/cultural/name-meaning`

### Traditional medicine, plants, and composition

Traditional medicine data is exposed through `/api/cultural/traditional-medicine` and related plant routes.

Where source material provides measurements, records may include:

- Proximate composition
- Minerals and vitamins
- Total phenolics and flavonoids
- Active or reported constituents
- Processing state and analytical basis
- Source notes, confidence, and intended use

When a supplied reference does not provide a measured value, the application should use `not_reported` rather than inventing a number. Traditional-use records are not prescriptions. Pregnancy, childhood, medication use, toxicity concerns, chronic disease, and emergencies require qualified review.

### Heritage, manuscripts, astrology, and numerology

Additional cultural APIs support:

- Awde Negast categories, circles, and readings
- Manuscript indexing and wisdom records
- Ethiopian zodiac content
- Astrology charts, transits, horoscopes, and compatibility
- Numerology profiles, life paths, personal days, and personal years
- Dabtara wisdom

These features are separated from Domain A safety and evidence workflows.

## Knowledge architecture

The knowledge system supports:

- Search and retrieval
- Strand-specific retrieval
- Causal relationships
- Intersections between knowledge strands
- Batch loading and reloads
- Metadata and templates
- JSON and CSV import/export for administrators

Knowledge is selected through case-specific strand filters. Reports retain references to the strands used to produce a preliminary result, supporting review and auditability.

## Security, privacy, and governance

The application includes:

- Authenticated route protection
- Role and permission checks
- Account suspension and active-status checks
- Failed-login lockout
- Session and device metadata handling
- Audit events and user activity logs
- Admin user, role, permission, profile-field, and knowledge controls
- Safety screens before specialized workflows
- Consent capture for optional profile metadata

Privacy expectations:

- Do not add secrets to source control.
- Do not assume browser access to private contacts or social accounts.
- Collect only information required for routing, safety, personalization, or the user-requested cultural workflow.
- Treat birth data, identity information, case narratives, and Welbeing-related fields as sensitive.
- Preserve the distinction between user-entered data and inferred or calculated output.

## Project structure

```text
src/
  app/                 Next.js pages and API routes
  components/          UI, profile, cultural, and layout components
  lib/
    auth/              Authentication and session helpers
    case-workflow/     General and specialized case engines
    cultural/          Heritage, Hexacore, divination, plant, and manuscript data
    db/                Drizzle schema and database access
    knowledge/         Retrieval, strands, parsing, and safety utilities
    profiling/         Profile synthesis and name suggestions
    theme/             Theme and contrast context
  styles/              Global styles and design tokens
  tests/               Node/tsx regression and workflow tests
```

## Local development

### Requirements

- Node.js compatible with the project toolchain
- Bun is supported for development
- PostgreSQL-compatible database configuration
- Dependencies installed from `package.json`

### Install dependencies

```bash
bun install
```

or:

```bash
npm install
```

### Environment

Create a local `.env` file using the deployment configuration as a guide. Never commit credentials or production secrets. Database, authentication, email, and integration variables are read by the relevant modules under `src/lib`.

### Start the development server

```bash
bun run dev
```

The configured development server runs on port `5500`:

```text
http://localhost:5500
```

Do not start a second server on the same port. If the port is already occupied, use the running instance or stop the specific owning process intentionally.

### Database commands

```bash
bun run db:push
bun run db:migrate
bun run db:seed
```

Use the command appropriate to the current database lifecycle. Review schema and migration changes before applying them to shared environments.

## Validation

Type-check the project:

```bash
npx --no-install tsc --noEmit
```

Run the configured test suite:

```bash
bun test
```

Run the Hexacore regression suite directly:

```bash
npx --no-install tsx --test --test-force-exit src/tests/hexacore-arcana.test.mjs
```

Useful manual smoke checks:

- `/`
- `/auth/login`
- `/profile/onboarding`
- `/case`
- `/hexacore`
- `/library/medicinal-plants`
- `/library/awde-negast`

Protected pages normally redirect unauthenticated users to authentication rather than returning their private content.

## Current implementation boundaries

The application contains both database-backed and in-memory workflow components. The general case repository persists case sessions, while several specialized workflow engines currently keep active sessions in process memory. A production deployment should move every user-visible specialized session, expert assignment, payment state, and report state to durable storage before relying on multi-instance scaling or process restarts.

The current system also does not silently obtain phone contacts or social-media identities. If those data sources are ever added, they must use an explicit provider integration, consent, scoped permissions, data minimization, and a documented deletion path.

AI, diagnostic-adjacent, divination, numerology, astrology, body-sign, herbal, and cultural outputs must remain bounded by their declared purpose. The application should never claim to diagnose, cure, guarantee, predict with certainty, replace emergency services, or replace qualified legal, medical, mental-Welbeing, or safeguarding professionals.

## Safety disclaimer

This platform provides educational, reflective, cultural, and wellness-oriented information. It is not a substitute for emergency services or qualified professional advice. Do not delay urgent medical, mental-Welbeing, safeguarding, legal, or other professional care because of content shown by the application.

