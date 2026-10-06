# Ethiopian Wisdom & Wellness Platform

An Ethiopian-centered wisdom, wellness, knowledge, and expert-review platform built with Next.js, React, TypeScript, Drizzle ORM, and MySQL 8.

The application combines two intentionally separated knowledge domains:

- **Domain A — wellbeing and evidence:** wellness intake, nutrition, medication and herb safety, urgency detection, diagnostic-adjacent reasoning, and practical next steps.
- **Domain B — cultural and reflective knowledge:** Ethiopian heritage, manuscripts, Awde Negast, astrology, numerology, Hexacore reflection, naming, traditional medicine, ritual context, and spiritual interpretation.

Domain B can enrich a user-requested reflection, but it is not presented as a diagnosis, prescription, emergency response, or substitute for licensed professional care.

## What the platform does

The platform supports:

- Account registration, email verification, login, logout, password recovery, session management, and role-based access.
- Profile onboarding with consent-based personal and optional device information.
- Case intake for wellbeing, peace, power, money, relationships, career, legal, social, and spiritual/cultural topics.
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
7. Signs the person in straight away. There is no email-verification step.
8. Writes audit and activity events.

Administrators can pause sign-ups under **Admin → Sign-up & Telegram**. Accounts are verified by connecting Telegram from `/account` (Telegram Login Widget, verified server-side with the bot token). A connected Telegram also enables one-tap sign-in, notification forwarding and password-reset links. The bot responds to `/start`, `/help`, and `/privacy`; set its HTTPS webhook with `npm run telegram:setup`. Administrators can require Telegram for business owners before a business is submitted for listing.

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
- Treat birth data, identity information, case narratives, and wellbeing-related fields as sensitive.
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
- MySQL database configuration and migrations
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

| Variable | Needed for |
|---|---|
| `DATABASE_URL`, `AUTH_SECRET`, `DATA_ENCRYPTION_KEY` | Always |
| `APP_URL` | Production: public base URL for invitation, payment-return and Telegram links (e.g. `https://example.et`) |
| `CHAPA_SECRET_KEY` | Online payments via Chapa (cards, telebirr, CBE Birr, M-Pesa). A `CHASECK_TEST-…` key runs in test mode |
| `CHAPA_WEBHOOK_SECRET` | Optional: checks Chapa webhook signatures. Payments are always re-verified with Chapa's API |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET` | Telegram verification, sign-in, notifications, password resets, and bot commands. Create the bot with @BotFather, set the webhook using `npm run telegram:setup`, and link your domain with `/setdomain` (Telegram does not allow localhost) |

The site is also an installable Progressive Web App. Use **Install app** on Android Chrome or **Share → Add to Home Screen** on iOS Safari. Offline mode keeps public reference pages available; account, booking, messaging, and submission features still need a connection.

| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Email for password-reset links and verification codes (any SMTP mailbox). Without it, resets go to Telegram only |
| `RATE_LIMIT_STORE`, `DB_POOL_MAX` | Optional. Rate limits are counted in MySQL in production (`memory` to opt out); `DB_POOL_MAX` tunes the MySQL connection pool |
| `UPLOAD_DIR` | Where client intake photos, voice notes and videos are stored (default `./storage/uploads`, outside the web root). Use persistent storage in production and include it in backups |
| `PUBMED_api` or `NCBI_API_KEY` | Optional: faster PubMed lookups in the healer's analysis panel (works without a key at a lower rate) |

A reference healer business (Metsehafe Fewus, Metsehafe Asmat and Awde Negest services, intake settings, auto-response rules, remedies) can be created for an existing account with `npm run db:seed:debtera -- --owner you@example.com`. Run `npm run db:migrate` first.

**Manuscripts (መጽሐፈ ፈውስ, መጽሐፈ አስማት).** The platform indexes each book's table of contents only (`src/lib/cultural/metsehafeFewusCatalog.ts`, `metsehafeAsmatCatalog.ts`); prayers, seals and procedures are never reproduced. A service can offer a book's chapters as its intake list; the client picks one, and each business writes the text it uses per chapter in *Intake & automation → Fewus library / Asmat library*. On the booking's review page the healer delivers the chapter as a solution: sent to the client directly, or prepared as a draft to refine. Every delivery carries the physical-safety cautions for how the practice is carried out (`src/lib/evaluation/practiceFormSafety.ts`), a live check of the chapter's plants against the client's medicines, and the chapter's framing notes (protection only, consent, no promised outcome, possible illness). Manuscript texts never go out without a healer's approval.

For local marketplace testing, `npm run db:seed:marketplace-demo -- --confirm-demo-data --approve-demo --owner owner@example.test --client client@example.test --admin admin@example.test` creates or refreshes a sample Hexacore studio. Optionally pass `--practitioner practitioner@example.test` to exercise the team invitation and acceptance flow. All accounts must already exist; use dedicated test accounts. The script refuses production and non-local database hosts, and requires both confirmation flags.

The sample listing is based in Addis Ababa, serves Amharic and English, offers in-person and remote sessions, and is open Monday–Saturday. It includes Hexacore reflection (60 min, 450 ETB), tongue reading (30 min, 200 ETB), palm reading (45 min, 300 ETB), face-reading history and ethics (30 min, 200 ETB), and combined body-sign traditions (45 min, 350 ETB), each with a sample intake prompt.

The sample is explicitly labeled as demo data and exercises business creation and approval, team access, five bookable services with client intake, opening hours, requested/confirmed/cancelled/completed bookings, a booking-linked spiritual case and practitioner review, CRM history, a demo cash payment, client review and business response, and two-way messages. Demo payments are recorded for dashboard testing only; no money is due. The sample listing is approved solely to make its public directory and booking workflows testable, not because any professional credentials were checked. Run `npm run db:setup` before running the seed.

Hexacore service guides are shown on the public listing, during client intake, and in the practitioner's booking review. Tongue and palm images are optional, private booking attachments for a consent-based discussion; no automated image interpretation is performed. Face-reading is limited to cultural history and ethics: face photos and appearance-based health or personal-trait assessments are not part of the workflow. See `src/lib/cultural/hexacoreActivities.ts` for the activity guides and boundaries.

In the Chapa dashboard, set the webhook URL to `<APP_URL>/api/payments/chapa/webhook`. Bring the database up to date with `npm run db:migrate`.

### Payments

Administrators control payments under **Admin → Payments & pricing**:

- **Free mode**: everything the platform charges for is free, and reports unlock on approval.
- **Methods**: Chapa checkout; telebirr, either inside Chapa or sent to the platform's number and confirmed by an admin; bank transfer to the platform's accounts, confirmed by an admin.
- **Prices** per case type (0 means free), and whether clients can report payments to businesses.
- **Review queue** for manual payments, plus totals. Duplicate or underpaid payments are flagged under "Needs attention" and never unlock anything.

Businesses add their own telebirr number and bank accounts under **Settings → How clients pay you**. Clients pay the business directly and submit the transaction number from their booking. The business confirms or rejects it under **Payments**. The platform never holds business money.

### Start the development server

```bash
bun run dev
```

The configured development server runs on port `5500`:

```text
http://localhost:5500
```

Development assets are written to `.next-dev`, separately from the production build output in `.next`. This allows `npm run build` to run without invalidating a live development server.

Do not start a second server on the same port. If the port is already occupied, use the running instance or stop the specific owning process intentionally.

### Database commands

The database is MySQL 8.0 or newer. Set `DATABASE_URL` to a MySQL connection string and run
`npm run db:setup` against a dedicated, initially empty database. MySQL migrations live in
[`drizzle-mysql/`](drizzle-mysql); the legacy `drizzle/` directory contains PostgreSQL SQL and must
not be applied to MySQL.

```bash
npm run db:setup        # everything a new database needs: db:migrate, then db:reference
npm run db:migrate      # schema: baseline on an empty database, then each numbered migration once
npm run db:status       # what is applied and what is pending (changes nothing)
npm run db:reference    # roles, food-composition tables, herb–medicine safety reference
npm run admin:create -- --email you@example.com   # create or promote an administrator
npm run db:backup       # mysqldump to backups/
```

All of these are safe to repeat. `db:seed` fills the food reference tables when they are empty (`-- --reset` replaces them); no seed touches accounts or the audit log. Passwords are never stored in the code: `admin:create` prints a one-time password or takes `ADMIN_PASSWORD` from the environment, and the local demo accounts (`SEED_DEMO_USERS=1 npx tsx src/lib/db/runAuthMigration.ts`) take `DEMO_USER_PASSWORD` and refuse non-local databases.

Schema changes go in `src/lib/db/schema` and a new MySQL migration generated into `drizzle-mysql/`. Review generated SQL before applying it. `npm run db:push` is a local convenience only; `db:migrate` requires an empty database for the first baseline and will not silently adopt an existing schema.

### Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In short: `npm run deploy:plesk` builds an upload-ready release (`plesk-release.zip`) that starts with `node app.js`; the server stops at start-up with a `[config]` message if `DATABASE_URL`, `AUTH_SECRET`, `DATA_ENCRYPTION_KEY` or `APP_URL` is missing; `/api/health` is the uptime probe; unhandled server errors are logged as one JSON line each.

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

AI, diagnostic-adjacent, divination, numerology, astrology, body-sign, herbal, and cultural outputs must remain bounded by their declared purpose. The application should never claim to diagnose, cure, guarantee, predict with certainty, replace emergency services, or replace qualified legal, medical, mental-wellbeing, or safeguarding professionals.

## Safety disclaimer

This platform provides educational, reflective, cultural, and wellness-oriented information. It is not a substitute for emergency services or qualified professional advice. Do not delay urgent medical, mental-wellbeing, safeguarding, legal, or other professional care because of content shown by the application.
