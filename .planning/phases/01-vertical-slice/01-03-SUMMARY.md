---
phase: 01-vertical-slice
plan: 03
subsystem: database
tags: [sql.js, sqlite, chargemaster, seed, build-script, tsx]

# Dependency graph
requires:
  - phase: 01-vertical-slice
    plan: 01
    provides: "sql.js installed, pnpm seed:phase-1 script entry wired in package.json"
provides:
  - "scripts/build-data/seed-phase-1.ts: reproducible tsx build script for chargemaster.sqlite"
  - "data/build/chargemaster.sqlite: committed single-row SQLite blob for CPT 99213"
  - ".gitignore exception allowing the Phase 1 seed binary to be version-controlled"
affects:
  - 01-06  # auditor loads chargemaster.sqlite via sql.js
  - 01-11  # App integration fetches this asset URL from Vite

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "locateFile callback hardcodes WASM path (not caller-supplied string) to eliminate path-traversal surface"
    - "data/build/* (glob) + !data/build/chargemaster.sqlite (negation) to version-control specific build output while ignoring the rest"

key-files:
  created:
    - scripts/build-data/seed-phase-1.ts
    - data/build/chargemaster.sqlite
  modified:
    - .gitignore

key-decisions:
  - "Hardcode SQL_WASM_PATH constant rather than interpolating the sql.js locateFile 'file' argument into resolve() — eliminates semgrep path-traversal finding (CWE-22)"
  - "Change data/build/ to data/build/* in .gitignore — directory-level ignore cannot be negated; glob-level can"

patterns-established:
  - "Build scripts in scripts/build-data/, run via tsx, committed output tracked by gitignore exception"

requirements-completed:
  - OCR-02

# Metrics
duration: 12min
completed: 2026-04-28
---

# Phase 01 Plan 03: Chargemaster Seed Script Summary

**sql.js single-row SQLite seed for CPT 99213 (187.50/198.00/92.40) written to data/build/chargemaster.sqlite via deterministic tsx build script**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-28T22:17:00Z
- **Completed:** 2026-04-28T22:29:41Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `scripts/build-data/seed-phase-1.ts` creates an in-memory sql.js DB, defines the 5-column chargemaster schema, inserts the CPT 99213 row, exports to bytes, and writes `data/build/chargemaster.sqlite`
- `pnpm seed:phase-1` runs deterministically and exits 0; file is a valid SQLite 3.x database (~12KB)
- `.gitignore` updated from `data/build/` to `data/build/*` + `!data/build/chargemaster.sqlite` so the Phase 1 seed binary is version-controlled without un-ignoring other build outputs

## Task Commits

1. **Task 1: Implement seed-phase-1.ts SQLite seed builder** - `05a0434` (feat)
2. **Task 2: Allow committing the chargemaster.sqlite binary** - `2646a2e` (chore)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `scripts/build-data/seed-phase-1.ts` - tsx script: init sql.js, CREATE TABLE chargemaster, INSERT 99213 row, export + write SQLite bytes
- `data/build/chargemaster.sqlite` - committed single-row SQLite blob; Plan 06 and Plan 11 load this via `?url` Vite import
- `.gitignore` - changed `data/build/` to `data/build/*` + added `!data/build/chargemaster.sqlite` negation exception

## Decisions Made

1. **Hardcoded WASM path**: The sql.js `locateFile` callback received a `file: string` argument that was being passed into `resolve()`. Semgrep flagged this as a path-traversal risk (CWE-22, OWASP A01). Since sql.js only ever requests `sql-wasm.wasm`, I replaced `resolve('node_modules/sql.js/dist', file)` with a named constant `SQL_WASM_PATH = resolve('node_modules/sql.js/dist/sql-wasm.wasm')` and returned that unconditionally from `locateFile`. The callback argument is now ignored.

2. **glob vs directory in .gitignore**: `data/build/` ignores the directory itself; git cannot un-ignore files inside an ignored directory via `!` negation. Changed to `data/build/*` (ignore contents) so the `!data/build/chargemaster.sqlite` exception takes effect. Verified with `git check-ignore data/build/chargemaster.sqlite` exiting 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Security] Hardcoded WASM locateFile path to eliminate path-traversal**
- **Found during:** Task 1 (seed script write)
- **Issue:** Semgrep blocking hook flagged `resolve('node_modules/sql.js/dist', file)` where `file` is the caller-supplied argument to `locateFile` — CWE-22 path-traversal (HIGH likelihood, MEDIUM impact)
- **Fix:** Extracted `SQL_WASM_PATH` constant with the single known filename hardcoded; `locateFile` now returns the constant unconditionally
- **Files modified:** `scripts/build-data/seed-phase-1.ts`
- **Verification:** semgrep hook passed after fix; `pnpm seed:phase-1` still exits 0
- **Committed in:** `05a0434`

**2. [Rule 1 - Bug] Changed data/build/ to data/build/* in .gitignore**
- **Found during:** Task 2 (.gitignore exception)
- **Issue:** `git check-ignore data/build/chargemaster.sqlite` returned exit 0 (file was still ignored) even after adding `!data/build/chargemaster.sqlite` — because git refuses to un-ignore files inside a directory-level ignore pattern
- **Fix:** Changed `data/build/` to `data/build/*` so the ignore applies to contents, not the directory itself, allowing the negation to function
- **Files modified:** `.gitignore`
- **Verification:** `git check-ignore data/build/chargemaster.sqlite` exits 1; file appears as untracked and can be staged
- **Committed in:** `2646a2e`

---

**Total deviations:** 2 auto-fixed (1 security hardening, 1 bug)
**Impact on plan:** Both fixes required for correctness. No scope creep.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `data/build/chargemaster.sqlite` is committed and accessible at a Vite `?url` import path
- Plan 06 (auditor) can `fetch()` the asset URL, pass bytes to `initSqlJs`, and run `SELECT * FROM chargemaster WHERE cpt_code = '99213'`
- CPT 99213 row: hospital_published_rate=187.50, regional_median=198.00, medicare_allowable=92.40 — fixture's $750 charge yields 4.0× multiplier, which fires the flagger
- Phase 2 will replace this file with the real CMS MRF pipeline output; schema stays compatible

## Self-Check: PASSED

- FOUND: scripts/build-data/seed-phase-1.ts
- FOUND: data/build/chargemaster.sqlite (SQLite 3.x, 12KB)
- FOUND: .planning/phases/01-vertical-slice/01-03-SUMMARY.md
- FOUND: commit 05a0434 (feat: seed script)
- FOUND: commit 2646a2e (chore: gitignore + sqlite binary)
- git check-ignore exit code: 1 (file NOT ignored — correct)

---
*Phase: 01-vertical-slice*
*Completed: 2026-04-28*
