# Stablemint QA Take-Home — Plan

## Goal

Ship a small, well-structured Playwright + TypeScript UI test framework with
exactly one end-to-end happy-path test against the-internet.herokuapp.com/login.
Optimize for architectural clarity and a maintainable foundation. Not for
coverage, not for cleverness.

## Non-goals (do not build)

- More than one test spec
- Negative paths, edge cases, parameterized data
- Allure, Cucumber, custom reporters
- Docker, devcontainers
- Visual regression, accessibility, performance
- API client or test data factories
- BDD / Gherkin layer
- Retry logic beyond Playwright defaults

If any of these feel tempting mid-build, they go in the README "Extensibility"
section instead.

## Stack

| Layer       | Choice                                       |
|-------------|----------------------------------------------|
| Runner      | Playwright Test                              |
| Language    | TypeScript (strict)                          |
| Assertions  | Playwright `expect` (web-first)              |
| Reporting   | Playwright list reporter + HTML on failure   |
| CI          | GitHub Actions (one workflow)                |
| Env config  | Node `process.loadEnvFile` + zod schema      |
| Package mgr | pnpm                                         |

## Architecture — one pattern at this scope

**Page Object Model.** Page objects own selectors and intent methods. Tests
own assertions. `src/config/env.ts` is the only place that reads
`process.env`. That is the whole architecture.

For larger scope, several more layers earn their place — see
**Abstractions deliberately not built** below.

## Abstractions deliberately not built

For a single happy-path test against two URLs, the layers of a larger
framework each cost more than they save. They are deliberately absent here;
in a bigger codebase they would be present from day one.

- **Abstract `BasePage`.** Worth it once 3–4 page objects share real
  behavior — a common `waitForReady()`, a navbar accessor, a loading-spinner
  wait. With two leaf POs and nothing to share, it adds an indirection
  layer that obscures simple constructors.
- **`src/flows/` for cross-page sequences.** Worth it once a flow touches
  three or more page objects (signup → email confirm → onboarding wizard).
  At this scope the spec itself is short enough to be the flow.
- **`src/data/` for typed test data.** Worth it once users grow shape
  (admin vs. member vs. guest, multiple personas, faker-generated payloads).
  One credential pair stays in `.env`.
- **`src/fixtures/` extending Playwright `test`.** Worth it once 3+ specs
  would otherwise repeat `new LoginPage(page)`. For one spec, the
  indirection costs more than the duplication it avoids.
- **`src/utils/logger.ts` (or similar).** Worth it once a CI failure forces
  you to cross-reference trace + report + custom log. Playwright's trace
  viewer covers the one-spec case.

In a real product codebase these arrive on day one because the team's
second-week additions feel awkward without them. In a take-home with a
one-test scope they are dead weight and they obscure the boundaries that
actually matter.

## Repository structure

```
stablemint-qa-assesment/
├── .github/workflows/test.yml
├── .env.example
├── .gitignore
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── README.md
├── PLAN.md
├── CLAUDE.md
│
├── src/
│   ├── config/
│   │   └── env.ts                 # zod-validated env loader
│   └── pages/
│       ├── login-page.ts
│       └── secure-area-page.ts
│
└── tests/
    └── login.spec.ts
```

Two concepts in `src/`: config and pages. Anything that doesn't fit cleanly
into one of those is probably out of scope at this size.

## The test

**File:** `tests/login.spec.ts`

**Scenario:** A valid user logs in, lands on the secure area, sees the
success flash, logs out cleanly, and returns to the login page with a
logout success flash.

**Assertion points:**
1. Secure-area heading is visible after login
2. Success flash contains "logged into a secure area"
3. Logout button is visible on the secure area
4. After logout, URL is `/login`, login-page heading is visible, and the
   success flash contains "logged out of the secure area"

**Selector strategy:** getByRole > getByLabel > getByTestId > CSS. Username
and password inputs resolve cleanly via `getByLabel`; no CSS fallback
needed.

**Spec shape (shipped):** `test(..., async ({ page }) => { ... })` with
`new LoginPage(page)` and `new SecureAreaPage(page)` in the spec body — not
`async ({ loginPage, secureAreaPage })`. No `src/fixtures/` or `test.extend`
at this scope; custom PO fixtures stay in *Abstractions deliberately not built*
until 3+ specs repeat the same `new LoginPage(page)` boilerplate.

## Phases (execute in order, stop after each)

### Phase 1 — Scaffold

- `package.json` with pnpm scripts: `test`, `test:ui`, `typecheck`
- `tsconfig.json` strict mode, `@/*` path alias to `src/*`
- `playwright.config.ts`: baseURL from env, chromium project, list reporter,
  traces on first retry
- `.env.example` with `BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`
- `.gitignore` for `node_modules`, `.env`, `test-results/`, `playwright-report/`
- One trivial smoke spec to confirm the runner works
- **Exit criteria:** `pnpm test` runs and passes

### Phase 2 — Config + env validation

- `src/config/env.ts` with zod schema (`BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`)
- Loads `.env` via Node's native `process.loadEnvFile` (no dotenv dep)
- Throws on missing/invalid env vars at import time with named fields
- `playwright.config.ts` reads `BASE_URL` from this module, not `process.env`
- **Exit criteria:** removing a required var causes a clear error before any test runs

### Phase 3 — Page objects

- `src/pages/login-page.ts`: locators in the constructor; `goto()`, `loginAs()`
- `src/pages/secure-area-page.ts`: locators in the constructor; `logout()`
- Selectors prefer role/label over CSS
- **Exit criteria:** locators resolve against the live site (verified once, then verification spec deleted)

### Phase 4 — The real spec

- Replace the smoke spec with the real login + logout spec (see *The test*)
- Imports: `test`, `expect` from `@playwright/test`; `env` from `src/config/`;
  page objects from `src/pages/`
- Instantiate POs inline (`new LoginPage(page)`); do not add `src/fixtures/`
  or `test.extend` PO injection at this scope
- No selectors, no hardcoded URLs, no hardcoded credentials in the spec
- Run 3x consecutively to confirm no flake
- **Exit criteria:** 3 consecutive green runs locally

### Phase 5 — CI

- `.github/workflows/test.yml`: one job, runs on pull_request and push to `main`
- Steps: checkout, pnpm/action-setup, setup-node with pnpm cache,
  `pnpm install --frozen-lockfile`, `pnpm typecheck`,
  `playwright install --with-deps chromium`, `pnpm test`
- Upload `playwright-report/` as artifact on failure, 7-day retention
- **Exit criteria:** green run on a PR branch, artifact available on failure

### Phase 6 — README

(Write this yourself or heavily edit a draft. README is the candidate's
deliverable, not the AI's.)

Sections:
1. What this is (one sentence)
2. Setup and run (copy-pasteable commands + expected output)
3. The test scenario (one paragraph)
4. Framework structure (tree + boundary rationale)
5. Extending for additional tests (growth paths)
6. CI (where it runs, what it does)
7. AI usage (honest, human-written paragraph)

- **Exit criteria:** a stranger can clone the repo and have a green test run in under 5 minutes

## Definition of done (whole project)

- Fresh clone on a different machine runs green in <5 minutes
- `.env.example` accurate, `.env` not committed
- No `console.log`, no commented-out code, no TODO comments
- No `waitForTimeout` anywhere in the codebase
- Test passes 3x consecutively locally AND in CI
- Git history is clean
- Submission email drafted (short, polite, links repo, one-line run instruction)

## Extensibility (preview — full version belongs in README)

**Ring 1 (no framework changes):** negative auth paths, multi-environment
config, cross-browser projects, parallel sharding via CI matrix.

**Ring 2 (small additions):** the layers from *Abstractions deliberately
not built* above (BasePage, flows, fixtures, data, utils); typed API client
in `src/api/` for setup-only use; visual regression via Playwright's
`toHaveScreenshot()`; accessibility via `@axe-core/playwright`; faker-based
factories when fixed users stop scaling.

**Ring 3 (org-level):** Allure or Currents.dev for cross-run trends, test
impact analysis on PRs, tag-based execution wired to deploy gates,
contract-level checks for fintech flows (belongs in API/integration layer,
not UI).
