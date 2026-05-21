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

`tests/login.spec.ts` exercises one flow: log in at `/login`, assert the secure-area landing state, log out, and assert return to `/login` with the logout success flash. Credentials come from the environment. The spec uses `async ({ page })` and instantiates page objects inline (`new LoginPage(page)`); a custom `test.extend` fixtures layer is deferred. Negative cases and cross-browser coverage are deferred deliberately (see *Extending* below).

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
- **Specs own assertions and nothing else.** No raw selectors, no hardcoded URLs or credentials. Page objects are constructed inline in the spec (`new LoginPage(page)`), not injected via `test.extend`. Imports use the `@/` alias so refactors don't ripple through relative paths.
- **`playwright.config.ts` is the seam.** It is the only file that sees both the env layer and the Playwright runtime.

Full conventions live in [`CLAUDE.md`](./CLAUDE.md).

## Extending for additional tests

Growth paths in the order they would pay off:

- **More specs, same page objects.** New file in `tests/`, import the page objects, write assertions. Zero new infrastructure. 
- **Negative and edge cases.** Invalid credentials, lockout, field validation. `LoginPage.errorFlash` is already exposed, so these are mechanical to add — left out today only because the brief asked for a single happy path. 
- **A new page.** `src/pages/<name>-page.ts`: locators up top, intent methods under them. The base class already handles `goto` / `waitForReady`.
- **Cross-browser.** Uncomment `firefox` and `webkit` in the `projects` array. CI already isolates the Chromium install step; the others reuse it.
- **Custom fixtures for shared POs.** Add `src/fixtures/` with `test.extend` so specs read `async ({ loginPage }) => …` instead of repeating `new LoginPage(page)`. Worth it once three-plus specs share that boilerplate — not before; the shipped spec already uses inline construction on purpose.
- **Shared auth state.** A `storageState` fixture that logs in once via API and hands cookies to downstream specs. Removes the login UI as a dependency of unrelated flows and shaves seconds per test. Only pays off once a non-login flow exists.
- **Push tests down the pyramid.** The highest-value move, and it isn't a UI one. Validation rules, session contracts, and auth setup belong in API and unit tests; isolated component states belong in component tests. Reserve browser E2E for journeys that only make sense end-to-end. A setup-only `src/api/` client is the enabler — it trades a slow, UI-heavy suite for fewer, faster specs. On a payments product that's the gap between a 3-minute and a 30-minute pipeline.
- **Persisted reporting.** The HTML reporter answers "did this run pass." Once there's history worth watching, the real question is "is the suite getting flakier" — at which point publish the report to GitHub Pages per run, or graduate to Allure (trends/history) or a hosted runner like Currents (sharding plus flake analytics).
- **Containerized runs.** The official `mcr.microsoft.com/playwright` image pins identical browser versions across local and CI, killing a common "works on my machine" flake class and dropping the local Playwright install from onboarding. Skipped here on purpose — it adds a layer between clone and green that this assignment doesn't need — but it's the correct call the moment env parity starts causing flake.
- **Mobile when there is a product need.** Playwright `projects` with device descriptors for responsive and touch flows. Out of scope while the target is desktop Chromium.

## CI

`.github/workflows/test.yml` runs on pull requests and pushes to `main`: install dependencies via pnpm, `pnpm typecheck`, install Chromium with system deps, run the test. On failure it uploads `playwright-report/` as an artifact with 7-day retention so traces are recoverable without re-running the job.

## AI usage

I use usually those three tools deliberately, escalating by cost and capability:

- **Cursor + Composer 2.5.** Day-to-day editor: small diffs, local test runs, lint fixes. Not used for architecture.
- **Claude Sonnet 4.6.** Planning. `PLAN.md`, phase boundaries, and scope cuts before any code.
- **Claude Code (Opus 4.7).** Heavy execution when the cost was worth it. Initial Playwright/pnpm scaffold, `src/config/env.ts` with the zod boundary, page-object boilerplate (`login-page.ts`, `secure-area-page.ts`), `.github/workflows/test.yml`, and a first README draft.

**Where it helped.** Scaffold and CI YAML each in roughly one prompt. The `process.loadEnvFile` + zod pattern in `env.ts` (I wouldn't have reached for native env-file loading first). README structure: sections 1–6 drafted by Opus, then I rewrote the *Framework structure* boundaries and the *Extending* sections.

**Where it was overkill.** Cut a `src/fixtures/` layer extending Playwright `test` and an abstract `BasePage` that Opus proposed early; for one spec the indirection costs more than the duplication it saves. Held the brief's one-happy-path scope and pushed negative cases, cross-browser projects, and a custom reporter to *Extending*. Smaller calls: assertions stay in the spec (not on page objects), no `waitForTimeout` (web-first assertions only), no selectors in test files. `PLAN.md` and `CLAUDE.md` were the guardrails that made those calls cheap.
