# Stablemint QA Assessment

A small Playwright + TypeScript framework with one happy-path login–logout E2E flow against [the-internet.herokuapp.com](https://the-internet.herokuapp.com/login).

## Setup and run

Requires Node 20+ (uses `process.loadEnvFile`) and pnpm 9.

```bash
pnpm install
cp .env.example .env
pnpm exec playwright install chromium
pnpm test
```

Expected:

```
Running 1 test using 1 worker
  ✓  1 [chromium] › login.spec.ts:6:1 › user can log in and log out of the secure area
  1 passed
```

## The test scenario

`tests/login.spec.ts` exercises one flow: log in at `/login`, assert the secure-area landing state, log out, and assert return to `/login` with the logout success flash. Credentials come from the environment. Negative cases, fixture extraction, and cross-browser coverage are deferred deliberately (see *Extending* below).

## Framework structure

```
src/
  config/env.ts            — zod-validated env loader (single boundary)
  pages/
    login-page.ts          — selectors + goto + loginAs
    secure-area-page.ts    — selectors + logout; assertions live in the spec
tests/
  login.spec.ts            — the one E2E spec (login → logout)
playwright.config.ts       — wires env.BASE_URL, chromium-only project
.github/workflows/test.yml — CI
```

The boundaries matter more than the files:

- **`src/config/env.ts` is the only file that reads `process.env`.** It parses with zod and throws on missing or malformed vars at module load. A typo in `.env` fails at boot, not three minutes into a flaky test.
- **Page objects own selectors and intent, never assertions.** `LoginPage.loginAs(user, pass)` is the surface; how the click happens is private. Selectors prefer role/label over CSS so they survive markup churn. No shared base class — there is nothing yet worth sharing.
- **Specs own assertions and nothing else.** No raw selectors, no hardcoded URLs or credentials. Imports use the `@/` alias so refactors don't ripple through relative paths.
- **`playwright.config.ts` is the seam.** It is the only file that sees both the env layer and the Playwright runtime; everything else is layered cleanly on top.

Full conventions live in [`CLAUDE.md`](./CLAUDE.md).

## Extending for additional tests

Growth paths in the order they would pay off:

- **A second spec using the same page objects.** Drop a file in `tests/`, instantiate the POs at the top, write assertions. No new infrastructure needed — that is the point of keeping the spec layer thin.
- **A new page.** Add `src/pages/<name>-page.ts`. Locators in the constructor, intent methods below.
- **Custom Playwright fixtures.** `test.extend` to inject pre-built POs so specs read `async ({ loginPage }) => ...`. Worth it once three or more specs would otherwise repeat `new LoginPage(page)`; not before, because the indirection cost outweighs the line savings for a single spec.
- **Authenticated-state reuse.** A `storageState` fixture that logs in once via API and writes cookies for downstream specs. Cuts seconds per test once a non-login flow exists.
- **Cross-browser coverage.** Add `firefox` and `webkit` to the `projects` array in `playwright.config.ts`. CI already isolates the Chromium install; mirror that step for the others.
- **Negative cases.** Invalid credentials, locked-out users, validation errors. `LoginPage.errorFlash` is already exposed, so the next spec is mechanical. Excluded today because the brief asks for one happy path.

## CI

`.github/workflows/test.yml` runs on pull requests and pushes to `main`: install dependencies via pnpm, `pnpm typecheck`, install Chromium with system deps, run the test. On failure it uploads `playwright-report/` as an artifact with 7-day retention so traces are recoverable without re-running the job.

## AI usage

<!-- TODO (human): rewrite this section yourself. The brief is explicit that
this is a self-report.

Suggested structure:
- What I used (tool, model, approximate scope)
- Where it helped (e.g. boilerplate, CI workflow scaffolding, env validation
  patterns)
- Where it didn't / where I overrode it (e.g. AI proposed a custom-fixtures
  layer for a single test; rejected as premature abstraction per CLAUDE.md
  scope rules)
- Time saved vs. spent reviewing AI output
-->
