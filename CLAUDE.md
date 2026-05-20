# Project context

This is a take-home assignment for Stablemint. The grader values restraint,
clarity, and a maintainable foundation — not coverage volume or cleverness.
PLAN.md is the source of truth. When in doubt, re-read it.

# Scope discipline (most important)

- One E2E happy-path test. Do not add negative cases, edge cases, or extra specs.
- If a feature is not in PLAN.md, do not add it. Propose it for the README
  "Extensibility" section instead.
- Explicitly out of scope: Allure, Cucumber, custom reporters, Docker,
  visual regression, accessibility checks, API client, test data factories,
  faker, retry-on-failure logic beyond Playwright defaults.
- Do not install dependencies beyond what PLAN.md specifies without flagging first.

# Workflow

- Work in phases (see the **Phases** section of PLAN.md). After each phase,
  stop and report status. Do not chain phases without confirmation.
- After any change to a spec or page object, run the test and show the result.
- If a test fails, do not retry blindly. Diagnose first, propose a fix, then apply.
- Never modify PLAN.md or CLAUDE.md without explicit instruction.

# Code conventions

- TypeScript strict mode, no `any`, no `as` casts without a comment justifying them
- No `waitForTimeout`, no `page.waitFor(ms)`, no arbitrary sleeps — web-first assertions only
- Selectors: getByRole > getByLabel > getByTestId > CSS (last resort, with a comment)
- All env vars validated through src/config/env.ts (zod). Never read process.env directly elsewhere.
- Tests contain no selectors and no hardcoded URLs or credentials
- Page objects expose intent (loginAs), not mechanics (clickLoginButton)
- Imports use the `@/` path alias, never deep relative paths (`../../../`)
- File naming: kebab-case for files, PascalCase for classes, camelCase for functions

# Git hygiene

- Conventional commits (feat:, chore:, test:, docs:, ci:)
- One logical change per commit. No "wip" or "fix stuff" commits.
- Never commit .env, secrets, test-results/, or playwright-report/
- Do not commit on my behalf unless I ask. Show me the diff first.

# Definition of done

Before declaring any phase complete:
- `pnpm lint` passes with zero warnings
- `pnpm test` passes 3x consecutively (flake check)
- No console.log, no commented-out code, no TODO comments
- No unused imports, variables, or dependencies

# What to ask vs. what to assume

- Ask before: installing a new dependency, creating files not in PLAN.md,
  changing the folder structure, modifying CI config beyond what's specified.
- Assume: I want the simplest correct implementation that matches PLAN.md.
  When two approaches are equally valid, pick the one with fewer lines.

# Anti-patterns to refuse

- Adding "just in case" abstractions (BaseTest classes, helper soup, premature interfaces)
- Wrapping Playwright's expect in custom assertion helpers
- Adding logging beyond a single thin logger utility
- Creating index.ts barrel files unless explicitly requested
- Generating tests by parameterizing data (one test, written explicitly)
