# Project conventions

- TypeScript strict mode, no `any`
- No `waitForTimeout` — use web-first assertions only
- Selectors: getByRole > getByLabel > getByTestId > CSS (last resort)
- All env vars validated through src/config/env.ts (zod)
- Tests never contain selectors or hardcoded strings
- Page objects expose intent (loginAs), not mechanics (clickButton)
- Commits: conventional commits, one logical change per commit
- Before declaring done: `pnpm lint && pnpm test` must pass 3x in a row
