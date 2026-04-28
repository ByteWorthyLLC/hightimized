---
phase: 00-decisions-scaffolding
plan: "01"
subsystem: infra
tags: [vite, react, typescript, pnpm, swc, github-pages]

requires: []

provides:
  - Vite 8.0.10 + React 19.2.5 + TypeScript 6.0.3 project skeleton
  - pnpm lockfile with pinned core deps
  - vite.config.ts with base='/hightimized/' for GitHub Pages subpath deploy
  - tsconfig.json (strict, react-jsx, ES2022) + tsconfig.node.json
  - Canonical .gitignore (node_modules, dist, .vite, data/build/, .env, etc.)
  - pnpm dev starts on http://localhost:5173/hightimized/ returning 200
  - pnpm build emits dist/ with /hightimized/-prefixed asset URLs

affects:
  - 00-02 (ESLint/Prettier/Lefthook build on this scaffold)
  - 00-03 (Vitest shares vite config)
  - 00-04 (vite-plugin-pwa added to vite.config.ts from this plan)
  - all subsequent phases (base path + tsconfig patterns locked here)

tech-stack:
  added:
    - vite@8.0.10
    - react@19.2.5
    - react-dom@19.2.5
    - typescript@6.0.3
    - "@vitejs/plugin-react-swc@4.3.0"
    - "@types/react@^19.2.0"
    - "@types/react-dom@^19.2.0"
  patterns:
    - "vite.config.ts: base='/hightimized/' for GitHub Pages subpath"
    - "tsconfig.json: strict + react-jsx + types:vite/client (no project references on app config)"
    - "tsconfig.node.json: covers vite.config.ts and scripts/"
    - "package.json pnpm.onlyBuiltDependencies: ['@swc/core'] for native binary approval"

key-files:
  created:
    - package.json
    - pnpm-lock.yaml
    - vite.config.ts
    - tsconfig.json
    - tsconfig.node.json
    - index.html
    - src/main.tsx
    - src/App.tsx
    - src/App.css
    - src/index.css
    - .gitignore
  modified: []

key-decisions:
  - "Use @vitejs/plugin-react-swc (not Babel) — react-swc-ts template removed from create-vite in Vite 6+"
  - "tsconfig.json is the app config (not a composite root) — project references removed to avoid noEmit conflict"
  - "types:vite/client added to tsconfig.json for SVG/CSS/PNG module resolution without vite-env.d.ts"
  - "pnpm.onlyBuiltDependencies used to approve @swc/core native build (non-interactive env)"

patterns-established:
  - "Pattern: vite.config.ts base='/hightimized/' — ALL asset imports in build will have this prefix"
  - "Pattern: tsc --noEmit for typecheck, tsc -b for build pre-check"
  - "Pattern: tsconfig.json covers src/ only; tsconfig.node.json covers vite.config.ts + scripts/"

requirements-completed: []

duration: 20min
completed: "2026-04-28"
---

# Phase 0 Plan 01: Vite + TypeScript + React + SWC Scaffold Summary

**Vite 8 + React 19 + TypeScript 6 skeleton with @vitejs/plugin-react-swc and base='/hightimized/' locked for GitHub Pages subpath deploy**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-28T15:27:00Z
- **Completed:** 2026-04-28T15:33:44Z
- **Tasks:** 3 (1 scaffold, 1 config, 1 smoke test)
- **Files modified:** 14 created, 0 modified

## Accomplishments

- Vite 8.0.10 project scaffolded with `pnpm create vite . --template react-ts --overwrite`
- `@vitejs/plugin-react` (Babel) replaced with `@vitejs/plugin-react-swc@4.3.0` for faster HMR
- `vite.config.ts` has `base: '/hightimized/'` — build emits `/hightimized/assets/...` URLs
- `tsconfig.json` strict mode + ES2022 + react-jsx + vite/client types — `pnpm typecheck` exits 0
- `pnpm build` emits `dist/index.html` with `/hightimized/`-prefixed asset URLs verified
- Dev server returns HTTP 200 on `http://localhost:5173/hightimized/` verified

## Task Commits

1. **Task 1: Scaffold Vite react-ts + swap to SWC** - `73feb0e` (chore)
2. **Task 2: vite.config.ts + tsconfig pair** - `1d81d56` (chore)
3. **Task 3: Smoke test** - (verification only, no file changes)

## Files Created/Modified

- `package.json` - pinned deps: react@19.2.5, typescript@6.0.3, vite@8.0.10, swc@4.3.0; scripts: dev/build/preview/typecheck
- `pnpm-lock.yaml` - lockfile for pinned versions
- `vite.config.ts` - base='/hightimized/', @vitejs/plugin-react-swc plugin
- `tsconfig.json` - strict, ES2022, react-jsx, noEmit, vite/client types, covers src/
- `tsconfig.node.json` - strict, ES2022, covers vite.config.ts + scripts/
- `index.html` - Vite entry HTML with `<script type="module" src="/src/main.tsx">`
- `src/main.tsx` - React root via createRoot
- `src/App.tsx` - Default scaffold landing component
- `.gitignore` - canonical: node_modules, dist, .vite, data/build/, coverage, .env*, .DS_Store, *.tsbuildinfo

## Decisions Made

- Used `--overwrite` flag with `pnpm create vite` (interactive prompts not available in non-TTY env)
- Removed `tsconfig.app.json` from Vite 8 scaffold's 3-file setup; collapsed to 2-file Pattern 5 per RESEARCH.md
- Added `pnpm.onlyBuiltDependencies: ["@swc/core"]` to package.json to approve SWC native binary build in non-interactive env

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed project references from tsconfig.json to fix noEmit conflict**
- **Found during:** Task 2 (tsconfig pair)
- **Issue:** RESEARCH.md Pattern 5 specified `"references": [{"path": "./tsconfig.node.json"}]` in `tsconfig.json`, but TypeScript project references require `composite: true`, which conflicts with `noEmit: true`. Error: `TS6306: Referenced project must have setting "composite": true` + `TS6310: Referenced project may not disable emit`.
- **Fix:** Removed `references` array from `tsconfig.json`. Added `"types": ["vite/client"]` to provide SVG/CSS/PNG module type declarations (previously supplied by `tsconfig.app.json`'s vite/client types).
- **Files modified:** `tsconfig.json`
- **Verification:** `pnpm typecheck` exits 0, `tsc -b` exits 0, `pnpm build` exits 0
- **Committed in:** `1d81d56`

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in plan's Pattern 5)
**Impact on plan:** Fix required for correctness. Both `pnpm typecheck` and `pnpm build` pass. The two-file tsconfig pattern is maintained; only the project-references cross-link was removed.

## Issues Encountered

- `pnpm create vite . --template react-ts` cancelled with "Operation cancelled" when piped `y` via stdin. Used `--overwrite` flag instead.
- `pnpm approve-builds` for `@swc/core` requires interactive TTY. Resolved by adding `pnpm.onlyBuiltDependencies: ["@swc/core"]` to package.json — pnpm respects this field and allows the build automatically on next install.
- `vite:react-swc` advisory warning: "recommend switching to @vitejs/plugin-react for improved performance as no swc plugins are used." This is non-fatal; the plan explicitly requires SWC. The warning appears because no SWC transform plugins (like emotion or styled-components) are configured yet — the plugin still provides SWC-based JSX transform.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Scaffold is ready for Plan 00-02 (ESLint flat config + Prettier + Lefthook)
- `eslint.config.js` was created by the scaffold and left untracked — Plan 00-02 will overwrite it with the Pattern 3 flat config
- `pnpm build` and `pnpm typecheck` are green baselines for all subsequent plans

---
*Phase: 00-decisions-scaffolding*
*Completed: 2026-04-28*
