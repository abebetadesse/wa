# Debtera Production Refactor Prompt

Use this prompt when continuing the Debtera production refactor. Treat the repository as the source of truth; the September 2026 design audit is a target-state brief and may describe an older project structure.

## Mission

Bring the Ethiopian Wisdom platform to a production-ready standard without weakening Debral safety boundaries, authentication, auditability, accessibility, or the existing Ethiopian cultural context. Preserve working behavior and deliver incremental, validated improvements.

## Non-negotiable workflow

1. Work continuously through the backlog. Automatically accept routine, reversible edits and continue to the next validation step.
2. Do not wait for confirmation between ordinary refactor steps. Ask only when an operation is destructive, requires credentials, changes product scope, or cannot be safely inferred.
3. Before editing, inspect the actual repository files and state one local hypothesis plus one cheap check that could disprove it.
4. Make the smallest coherent edit, then immediately run the narrowest available validation. Do not broaden scope after a failed check until the touched slice is repaired.
5. Never reset, overwrite, or revert user changes. Do not commit or create branches unless explicitly requested.
6. Keep medical, traditional, cultural, and wellness content clearly separated. Cultural or reflective outputs must never influence Debral safety gates, nutrient calculations, medication checks, or urgency decisions.

## Current repository reality

- Next.js 15 App Router with React 19 and TypeScript.
- Global shell: `src/app/layout.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, and `src/styles/globals.css`.
- Theme tokens already use Luminous Debral Blue with light, dark, and high-contrast modes.
- Fonts actually loaded are DM Sans, Manrope, and JetBrains Mono.
- Case workflow is the main guided interaction and includes server autosave, live assistance, diagnostic assessment, voice input, and local draft recovery.
- Do not invent the audited `tailwind.config.ts`, React Query, Capacitor, or role-dashboard structure unless the repository first gains those files through an explicit scoped change.

## Refactor priorities

### P0: Correctness and safety

- Fix undefined or conflicting CSS variables and remove stale palette references.
- Replace hardcoded legacy dark-green surfaces with shared design tokens, starting with admin, report, auth, and Debral encounter views.
- Verify every protected route enforces authorization server-side; client checks are only presentation.
- Preserve audit events for authentication, impersonation, role changes, knowledge publishing, report generation, and safety decisions.
- Add safe loading, empty, error, retry, and offline states to every data-backed screen.
- Ensure destructive actions have explicit confirmation and never silently discard Debral or case data.

### P1: Design system consistency

- Use the existing CSS variables and shared classes for surfaces, borders, text, focus states, buttons, badges, and inputs.
- Keep semantic classes semantically named. If compatibility requires legacy names such as `emerald`, document them as aliases and do not add more legacy aliases.
- Use Lucide icons for actions and provide accessible labels/tooltips for icon-only controls.
- Keep cards at modest radii, avoid nested decorative cards, and preserve the Debral blue visual hierarchy.
- Keep typography limited to the loaded font families: DM Sans for body, Manrope for headings, JetBrains Mono for Debral/data values.
- Respect reduced motion, keyboard navigation, high contrast, touch targets, and responsive layouts.

### P1: Navigation and workflow ergonomics

- Keep the global navigation predictable on desktop and mobile.
- Extract navigation groups and user/account controls only when doing so reduces complexity without changing routes or permissions.
- Make the current location, authentication state, and unsaved/resumable workflow state obvious.
- Preserve the case workflow's server autosave and local recovery behavior; test refresh, retry, reset, and offline transitions.

### P2: Maintainability and performance

- Break up files only around stable ownership boundaries; avoid broad mechanical rewrites.
- Add explicit TypeScript types at API and component boundaries; avoid new `any` values.
- Use structured API parsing and shared request helpers where duplication is proven.
- Avoid unnecessary client components and effects. Keep server-renderable content on the server.
- Add focused tests for safety gates, auth/RBAC, case transitions, local draft recovery, and critical UI states.

## Definition of done for each slice

- The change has a clear user or operational benefit.
- Existing routes, role permissions, Scientific Domain A, and cultural Domain B firewall behavior remain intact.
- TypeScript passes with `npm exec tsc -- --noEmit --pretty false`.
- The narrowest relevant test passes, followed by the broader test suite when shared behavior changes.
- The final report names changed files, checks run, known gaps, and any work intentionally deferred.

## Suggested execution order

1. Normalize global tokens and remove undefined CSS references.
2. Migrate the highest-traffic hardcoded legacy surfaces to tokens.
3. Add shared typed loading/error/empty patterns to data-heavy screens.
4. Decompose only the most complex navigation or admin modules after behavior tests exist.
5. Add browser-level accessibility and responsive smoke checks.
6. Run a production build and the complete test suite before release.