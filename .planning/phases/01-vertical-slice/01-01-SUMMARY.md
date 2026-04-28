---
phase: 01-vertical-slice
plan: "01"
subsystem: deps-and-wasm
tags: [tesseract, sql.js, pdfjs-dist, pdf-lib, react-dropzone, wasm, pwa, vite]
dependency_graph:
  requires: []
  provides: [tesseract-wasm-selfhosted, sqljswasm-selfhosted, phase1-deps-installed]
  affects: [01-02-PLAN, 01-03-PLAN, 01-04-PLAN, 01-05-PLAN, 01-06-PLAN, 01-07-PLAN]
tech_stack:
  added:
    - tesseract.js@7.0.0
    - sql.js@1.14.1
    - react-dropzone@15.0.0
    - pdf-lib@1.17.1
    - pdfjs-dist@5.7.284
    - tsx@4.21.0 (dev)
  patterns:
    - WASM self-hosting via public/ directory (stable predictable URLs)
    - workbox globIgnores to skip large binary precaching
key_files:
  created:
    - public/tesseract/worker.min.js
    - public/tesseract/tesseract-core.wasm.js
    - public/tesseract/tesseract-core-simd.wasm.js
    - public/tesseract/tesseract-core-lstm.wasm.js
    - public/tesseract/tesseract-core-simd-lstm.wasm.js
    - public/tesseract/lang/eng.traineddata.gz
    - public/sql-wasm.wasm
  modified:
    - package.json
    - pnpm-lock.yaml
    - vite.config.ts
    - .gitignore
decisions:
  - "Self-host all WASM/worker files from public/ (not CDN) for $0-cost + zero-API constraint"
  - "tesseract.js-core v7 ships .wasm.js glue files — copied all four variants (plain, simd, lstm, simd-lstm)"
  - "eng.traineddata.gz downloaded from tessdata.projectnaptha.com (primary URL succeeded, 11MB)"
  - "tsx installed without exact pin (pnpm resolved to 4.21.0)"
  - "Do NOT install @pdf-lib/fontkit — StandardFonts only in Phase 1"
metrics:
  duration_seconds: 209
  tasks_completed: 3
  tasks_total: 3
  files_changed: 11
  completed_date: "2026-04-28"
---

# Phase 01 Plan 01: Dependency Install + WASM Self-Hosting Summary

**One-liner:** Five Phase 1 production deps installed at exact pinned versions; tesseract.js WASM core files (4 variants + worker, 11MB eng model) and sql.js WASM (~660KB) self-hosted under public/ with workbox globIgnores updated to skip their precaching.

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Install production deps + tsx | c3fe797 | package.json, pnpm-lock.yaml |
| 2 | Self-host tesseract + sql.js WASM | c93720e | public/tesseract/*, public/sql-wasm.wasm, .gitignore |
| 3 | Extend vite.config.ts globIgnores | b21f27f | vite.config.ts |

## Installed Versions

| Package | Version | Location |
|---------|---------|----------|
| tesseract.js | 7.0.0 | dependencies |
| sql.js | 1.14.1 | dependencies |
| react-dropzone | 15.0.0 | dependencies |
| pdf-lib | 1.17.1 | dependencies |
| pdfjs-dist | 5.7.284 | dependencies |
| tsx | 4.21.0 | devDependencies |

## WASM Asset Locations

| Asset | Path | Size | Source |
|-------|------|------|--------|
| tesseract worker | public/tesseract/worker.min.js | 111KB | node_modules/.pnpm/tesseract.js@7.0.0/.../dist/ |
| tesseract core | public/tesseract/tesseract-core.wasm.js | 4.7MB | node_modules/.pnpm/tesseract.js-core@7.0.0/.../ |
| tesseract core SIMD | public/tesseract/tesseract-core-simd.wasm.js | 4.7MB | node_modules/.pnpm/tesseract.js-core@7.0.0/.../ |
| tesseract core LSTM | public/tesseract/tesseract-core-lstm.wasm.js | 3.9MB | node_modules/.pnpm/tesseract.js-core@7.0.0/.../ |
| tesseract core SIMD+LSTM | public/tesseract/tesseract-core-simd-lstm.wasm.js | 3.9MB | node_modules/.pnpm/tesseract.js-core@7.0.0/.../ |
| English language model | public/tesseract/lang/eng.traineddata.gz | 11MB | https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz |
| sql.js WASM | public/sql-wasm.wasm | 660KB | node_modules/.pnpm/sql.js@1.14.1/.../dist/ |

**Production URLs (base=/hightimized/):**
- Worker: `/hightimized/tesseract/worker.min.js`
- Core dir: `/hightimized/tesseract/`
- Lang dir: `/hightimized/tesseract/lang`
- SQL WASM: `/hightimized/sql-wasm.wasm`

## vite.config.ts Change

```typescript
// Before:
globIgnores: ['**/*.gguf', 'data/build/**'],

// After:
globIgnores: ['**/*.gguf', 'data/build/**', 'tesseract/**', 'sql-wasm.wasm'],
```

Service worker precache manifest verified: tesseract-core and sql-wasm not present in dist/sw.js.

## pnpm Scripts Added

```json
"seed:phase-1": "tsx scripts/build-data/seed-phase-1.ts",
"fixtures": "tsx scripts/build-fixtures/sample-bill.ts"
```

## Deviations from Plan

### Notes (not deviations)

1. **tesseract.js-core path is under .pnpm/** — pnpm stores packages in `.pnpm/` virtual store rather than a flat `node_modules/tesseract.js-core/`. Adjusted copy commands to use the `.pnpm` path. No functional change.

2. **tsx resolves to 4.21.0 (not exact pin)** — Plan specified `tsx` as devDep without a pinned version. pnpm resolved to `^4.21.0` (latest stable). Acceptable per plan ("add tsx as dev dep").

3. **tesseract.js-core v7 also ships relaxedsimd variants** — Two additional files (`tesseract-core-relaxedsimd.wasm.js`, `tesseract-core-relaxedsimd-lstm.wasm.js`) exist in the package but were not copied — the plan lists only the four standard variants and the library auto-selects. No action needed.

None of these required plan deviation rules. Plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| pnpm install --frozen-lockfile | PASS |
| pnpm typecheck | PASS |
| pnpm build | PASS |
| public/tesseract/ all 5 files present | PASS |
| public/sql-wasm.wasm exists | PASS |
| eng.traineddata.gz >= 1MB (actual: 11MB) | PASS |
| sw.js does not precache tesseract-core | PASS |
| sw.js does not precache sql-wasm | PASS |
| @pdf-lib/fontkit NOT installed | PASS |

## Known Stubs

None — this plan installs deps and assets only, no application code.

## Threat Flags

None — this plan adds no network endpoints, auth paths, file access patterns, or schema changes. Assets are static files served from public/.

## Self-Check: PASSED

- public/tesseract/worker.min.js: FOUND
- public/tesseract/tesseract-core-simd.wasm.js: FOUND
- public/tesseract/lang/eng.traineddata.gz: FOUND
- public/sql-wasm.wasm: FOUND
- Commits c3fe797, c93720e, b21f27f: all in git log
