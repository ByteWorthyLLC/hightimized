---
phase: 01-vertical-slice
plan: "06"
subsystem: database
tags: [sql.js, sqlite, typescript, vitest, wasm, chargemaster, flagger]

requires:
  - phase: 01-03
    provides: data/build/chargemaster.sqlite with seeded 99213 row

provides:
  - sqliteClient.ts: getSqlJs singleton with BASE_URL-aware locateFile for WASM delivery
  - chargemasterDb.ts: getChargemasterDb fetch+open singleton, lookupChargemaster typed query
  - ChargemasterRow interface (single source of truth)
  - flagLine.ts: pure flagger function implementing Phase 1 rule 1 (charge > 1.5x hospital_published_rate)
  - FlagResult interface with rule trace fields
  - 6 Vitest tests all passing

affects: [01-11, app-integration, ui-components, letter-generator]

tech-stack:
  added: ["@types/sql.js 1.4.11"]
  patterns:
    - Singleton WASM module pattern with module-level cache variable
    - BASE_URL-prefixed locateFile for GitHub Pages sub-path compatibility
    - ?url Vite asset import for fingerprinted SQLite delivery
    - Fake Database duck-type pattern for unit tests without WASM init
    - Pure flagger function with threshold constant + named-number lookup table

key-files:
  created:
    - src/data-sources/sqliteClient.ts
    - src/data-sources/chargemasterDb.ts
    - src/data-sources/chargemasterDb.test.ts
    - src/lib/auditor/flagLine.ts
    - src/lib/auditor/flagLine.test.ts
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "locateFile uses import.meta.env.BASE_URL prefix — prevents /sql-wasm.wasm 404 under /hightimized/ in production"
  - "ChargemasterRow defined in chargemasterDb.ts, re-exported from flagLine.ts — single source of truth"
  - "getChargemasterDb takes no args, imports sqliteUrl via ?url internally — simpler call site in Plan 11"
  - "THRESHOLD = 1.5 as named constant — strict greater-than boundary, not >=, consistent with RESEARCH.md Q8"
  - "toEnglishMultiplier uses 0.05 tolerance for near-integer detection — handles floating-point imprecision"

patterns-established:
  - "Singleton pattern: module-level `let x: T | null = null` with early return guard"
  - "WASM locateFile: always `${import.meta.env.BASE_URL}${filename}` not hardcoded /"
  - "Test mocks for browser-only modules: duck-type cast through unknown, not vi.mock"

requirements-completed: [OCR-02]

duration: 15min
completed: 2026-04-28
---

# Phase 01 Plan 06: Auditor — sql.js Client + flagLine Summary

**sql.js singleton WASM client + chargemaster DB loader + pure FlagResult flagger wired to the 99213 screenshot moment (4.0x / FOUR)**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-28T22:30:00Z
- **Completed:** 2026-04-28T22:46:31Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- sqliteClient.ts delivers WASM via `locateFile` using `import.meta.env.BASE_URL` — correct under `/hightimized/` GitHub Pages base
- chargemasterDb.ts opens the fingerprinted SQLite asset via `?url` import and caches the Database singleton
- flagLine.ts implements rule 1: fires at `charge > 1.5 * hospital_published_rate`, returns FlagResult with multiplier rounded to 1dp and plain-English word (FOUR, TWO, etc.) for whole-number multiples
- 6 Vitest tests pass: 2 for lookupChargemaster (found + null), 4 for flagLine (flag, boundary null, boundary+0.01, decimal multiplier)
- All gates exit 0: typecheck, eslint, prettier, vitest

## Task Commits

1. **Task 1: sql.js singleton client + chargemaster DB loader** - `3c764d6` (feat)
2. **Task 2: Unit-test lookupChargemaster** - `47b448e` (test)
3. **Task 3: Implement and unit-test flagLine** - `daa2336` (feat)

## Files Created/Modified

- `src/data-sources/sqliteClient.ts` - getSqlJs singleton; locateFile uses BASE_URL
- `src/data-sources/chargemasterDb.ts` - getChargemasterDb + lookupChargemaster + ChargemasterRow
- `src/data-sources/chargemasterDb.test.ts` - 2 tests using duck-typed fake Database
- `src/lib/auditor/flagLine.ts` - flagLine + FlagResult + toEnglishMultiplier helper
- `src/lib/auditor/flagLine.test.ts` - 4 deterministic tests including the screenshot case
- `package.json` + `pnpm-lock.yaml` - added @types/sql.js 1.4.11

## Decisions Made

- `getChargemasterDb()` takes no arguments and imports `sqliteUrl` directly via `?url` (simpler than passing URL from callers, consistent with singleton pattern)
- `ChargemasterRow` lives in `chargemasterDb.ts` and is re-exported from `flagLine.ts` — avoids duplication, flagLine.ts stays the single import point for auditor consumers
- Used duck-type cast (`as unknown as Database`) for test mocks rather than `vi.mock` — keeps test file self-contained without module hoisting concerns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @types/sql.js dev dependency**
- **Found during:** Task 1 (typecheck gate)
- **Issue:** `sql.js` v1.14.1 ships no bundled type declarations; TypeScript raised TS7016 on all imports
- **Fix:** `pnpm add -D @types/sql.js`
- **Files modified:** package.json, pnpm-lock.yaml
- **Verification:** `pnpm typecheck` exits 0 after install
- **Committed in:** 3c764d6

**2. [Rule 1 - Bug] Double cast through `unknown` for Object.fromEntries result**
- **Found during:** Task 1 (typecheck gate)
- **Issue:** TS2352 — `{ [k: string]: SqlValue }` does not overlap with `ChargemasterRow`; direct `as ChargemasterRow` rejected
- **Fix:** Changed to `as unknown as ChargemasterRow` — standard safe widening pattern
- **Files modified:** src/data-sources/chargemasterDb.ts
- **Verification:** `pnpm typecheck` exits 0
- **Committed in:** 3c764d6

---

**Total deviations:** 2 auto-fixed (1 blocking dep, 1 type cast bug)
**Impact on plan:** Both necessary for TypeScript correctness. No scope creep.

## Issues Encountered

None beyond the two auto-fixed type errors above.

## User Setup Required

None — no external services. All assets bundled or committed.

## Next Phase Readiness

- Plan 11 (App integration) can now import `getChargemasterDb`, `lookupChargemaster`, and `flagLine` directly
- The full audit pipeline is: `parseBillText` (Plan 05) → `lookupChargemaster` → `flagLine` → FlagResult with multiplier 4.0 for the 99213/$750 demo case
- No blockers

---
*Phase: 01-vertical-slice*
*Completed: 2026-04-28*

## Self-Check: PASSED

Files verified present:
- FOUND: src/data-sources/sqliteClient.ts
- FOUND: src/data-sources/chargemasterDb.ts
- FOUND: src/data-sources/chargemasterDb.test.ts
- FOUND: src/lib/auditor/flagLine.ts
- FOUND: src/lib/auditor/flagLine.test.ts

Commits verified:
- FOUND: 3c764d6 (feat: sql.js singleton client + chargemaster DB loader)
- FOUND: 47b448e (test: unit-test lookupChargemaster)
- FOUND: daa2336 (feat: flagLine auditor with FlagResult type)
