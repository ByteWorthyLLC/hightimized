---
phase: 00-decisions-scaffolding
plan: "02"
subsystem: infra
tags: [eslint, prettier, lefthook, editorconfig, git-hooks, code-quality]

requires:
  - 00-01 (Vite scaffold with package.json, pnpm, tsconfig)

provides:
  - ESLint flat config (typescript-eslint + react-hooks + react-refresh)
  - Prettier with committed .prettierrc defaults
  - Lefthook pre-commit (parallel: typecheck, eslint, prettier, vitest) + pre-push
  - .editorconfig for editor consistency
  - pnpm lint and pnpm format scripts (both exit 0)
  - postinstall script auto-wires hooks on pnpm install

affects:
  - 00-03 (Vitest stanza already in lefthook.yml — hooks just work when vitest lands)
  - all contributors (hooks enforce quality on every commit)

tech-stack:
  added:
    - eslint@10.2.1
    - "@eslint/js@10.0.1"
    - typescript-eslint@8.59.1
    - eslint-plugin-react-hooks@7.1.1
    - eslint-plugin-react-refresh@0.5.2
    - prettier@3.8.3
    - lefthook@2.1.6
  patterns:
    - "ESLint flat config via tseslint.config() — no legacy .eslintrc.*"
    - "Prettier excludes *.md to preserve README hero line spacing"
    - "Lefthook parallel pre-commit: typecheck + eslint + prettier + vitest (glob-gated)"
    - "lefthook added to pnpm.onlyBuiltDependencies to allow postinstall in non-interactive env"

key-files:
  created:
    - eslint.config.js
    - .prettierrc
    - .prettierignore
    - lefthook.yml
    - .editorconfig
  modified:
    - package.json (lint, format, postinstall scripts; lefthook dep; onlyBuiltDependencies)
    - pnpm-lock.yaml

key-decisions:
  - "lefthook added to pnpm.onlyBuiltDependencies — same pattern as @swc/core from Plan 01; required for postinstall to run in non-interactive (CI/CD) environments"
  - "Prettier excludes *.md — preserves README hero line exact spacing per CONTEXT.md marketability spec"
  - "vitest stanza included in lefthook.yml pre-commit now (glob-gated to *.test.* files) — zero config change needed when Plan 03 lands Vitest"

metrics:
  duration: 3min
  completed: "2026-04-28"
  tasks: 2
  files_created: 5
  files_modified: 2
---

# Phase 0 Plan 02: ESLint + Prettier + Lefthook + EditorConfig Summary

**ESLint flat config (typescript-eslint + react-hooks + react-refresh) + Prettier + Lefthook parallel pre-commit hooks auto-wired via postinstall**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-28T20:35:40Z
- **Completed:** 2026-04-28T20:38:49Z
- **Tasks:** 2
- **Files created:** 5 | **Files modified:** 2

## Accomplishments

- `eslint.config.js` written with canonical flat config pattern from RESEARCH.md Pattern 3 — typescript-eslint, react-hooks, react-refresh, `@typescript-eslint/no-unused-vars` with argsIgnorePattern
- `.prettierrc` committed with explicit defaults (semi=false, singleQuote, trailingComma=all, printWidth=100)
- `.prettierignore` excludes `*.md` to preserve README hero line exact spacing per CONTEXT.md marketability spec
- `lefthook.yml` with parallel pre-commit (typecheck, eslint, prettier, vitest) + pre-push full test
- `.editorconfig` for editor-agnostic consistency (space/2, lf, utf-8, final newline)
- `pnpm lint` exits 0 on clean tree
- `pnpm format` exits 0, all files pass Prettier
- Lefthook fired and passed on Task 2's own commit (live proof the hooks work)

## Task Commits

1. **Task 1: ESLint flat config + Prettier** — `ceee450`
2. **Task 2: Lefthook + EditorConfig + postinstall wiring** — `780562e`

## Files Created/Modified

- `eslint.config.js` — flat config: tseslint.config(), typescript-eslint recommended, react-hooks, react-refresh
- `.prettierrc` — semi=false, singleQuote, trailingComma=all, printWidth=100, tabWidth=2
- `.prettierignore` — node_modules, dist, coverage, data/build, pnpm-lock.yaml, *.md
- `lefthook.yml` — pre-commit parallel (typecheck/eslint/prettier/vitest, each glob-gated) + pre-push test-full
- `.editorconfig` — space/2, lf, utf-8, trim trailing whitespace (md exempt), insert final newline
- `package.json` — added scripts: lint, format, postinstall; added lefthook dep + onlyBuiltDependencies entry
- `pnpm-lock.yaml` — updated with 7 new devDeps

## Decisions Made

- **lefthook added to `pnpm.onlyBuiltDependencies`** — Lefthook ships a native binary that pnpm blocks by default in non-interactive environments. Same resolution as @swc/core in Plan 01. Without this, `postinstall` is silently skipped and `.git/hooks/pre-commit` is never written.
- **Prettier excludes `*.md`** — CONTEXT.md marketability spec requires the README hero line spacing to be preserved exactly. Prettier reformats markdown line lengths, which would break intentional formatting.
- **vitest stanza pre-staged in lefthook.yml** — Plan 03 (Vitest) is next. Including the vitest hook now (glob-gated to `*.{test,spec}.{ts,tsx}`) means no lefthook.yml change is needed when tests land.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added `lefthook` to `pnpm.onlyBuiltDependencies`**
- **Found during:** Task 2
- **Issue:** `pnpm add -D lefthook@2.1.6` installed the package but pnpm blocked its postinstall build script with "Ignored build scripts: lefthook@2.1.6." Without this, `pnpm install` silently skips `lefthook install` and `.git/hooks/pre-commit` is never created — the core deliverable of Task 2 (hooks auto-wire on install) would be broken.
- **Fix:** Added `"lefthook"` to `pnpm.onlyBuiltDependencies` array in package.json, then re-ran `pnpm install` — postinstall fired, Lefthook wired `pre-commit` and `pre-push` hooks.
- **Files modified:** `package.json`
- **Commit:** `780562e`

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical functionality, same pnpm binary-approval pattern as Plan 01)

## Known Stubs

None — all files are complete and functional. The vitest stanza in lefthook.yml references `pnpm test:run` which does not exist yet (Plan 03 adds it) but is glob-gated to `*.{test,spec}.{ts,tsx}` files and will only fire when test files are staged.

## Self-Check: PASSED

- `eslint.config.js` — FOUND, contains `typescript-eslint` and `react-hooks`
- `.prettierrc` — FOUND
- `.prettierignore` — FOUND
- `lefthook.yml` — FOUND, contains `pnpm tsc --noEmit`
- `.editorconfig` — FOUND
- `.git/hooks/pre-commit` — FOUND (Lefthook-generated shell script)
- `package.json` scripts — lint, format, postinstall all present; lefthook in onlyBuiltDependencies
- Commit `ceee450` — Task 1
- Commit `780562e` — Task 2 (Lefthook fired on this commit itself — live proof)
- `pnpm lint` exits 0
- `pnpm format` exits 0

---
*Phase: 00-decisions-scaffolding*
*Completed: 2026-04-28*
