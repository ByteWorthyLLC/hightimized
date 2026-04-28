---
phase: 01-vertical-slice
plan: "02"
subsystem: fixture-generation
tags: [pdf-lib, fixtures, ocr, testing]
dependency_graph:
  requires: ["01-01"]
  provides: ["tests/fixtures/sample-bill.pdf", "scripts/build-fixtures/sample-bill.ts"]
  affects: ["01-11 integration test", "OCR pipeline tests"]
tech_stack:
  added: []
  patterns: ["pdf-lib StandardFonts.Courier for OCR-friendly monospaced fixture PDFs", "tsx for node-side script execution", "mkdirSync recursive for safe directory creation"]
key_files:
  created:
    - scripts/build-fixtures/sample-bill.ts
    - tests/fixtures/sample-bill.pdf
  modified: []
decisions:
  - "ASCII hyphens (-) used for divider rows instead of Unicode U+2500 (─) — StandardFonts.Courier uses WinAnsi encoding which excludes that glyph; would crash pdf-lib with encoding error"
  - "Fixture PDF committed to git for CI determinism; regenerated deterministically via pnpm fixtures"
metrics:
  duration: "8 minutes"
  completed: "2026-04-28T22:25:37Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 01 Plan 02: Fixture Generator Summary

**One-liner:** Deterministic pdf-lib fixture script generating a single-page Courier PDF with 99213/85025/J3490 line items for OCR integration tests.

## What Was Built

`scripts/build-fixtures/sample-bill.ts` — a 65-line tsx script that:

- Creates a US Letter (612x792 pt) PDF via pdf-lib
- Embeds `StandardFonts.Courier` (11pt) for body text and `StandardFonts.CourierBold` for headers/totals
- Renders 3 exact line items the Phase 1 regex parser targets:
  - `99213   Office visit, est. patient, low complexity   $750.00`
  - `85025   Complete blood count w/ diff                  $80.00`
  - `J3490   Unclassified injection                       $200.00`
- Writes output to `tests/fixtures/sample-bill.pdf` (1592 bytes, PDF 1.7)
- Exits 0, prints `Generated tests/fixtures/sample-bill.pdf`

Run via: `pnpm fixtures`

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Implement sample-bill.ts fixture generator | 1a7f696 |
| 2 | Commit generated fixture binary | a2e3a2f |

## Verification Results

- `pnpm fixtures` exits 0 and regenerates deterministically
- `tests/fixtures/sample-bill.pdf` exists, 1592 bytes, type: PDF document version 1.7
- Not blocked by `.gitignore` (git check-ignore exits 1)
- Script contains all 3 exact line-item strings the regex parser keys on
- All 3 line items match the Phase 1 regex: `/^([A-Z]\d{4}|\d{5})\s+(.+?)\s+\$?(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\s*$/gm`

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written, with one documented intentional deviation:

**1. [Pre-emptive fix] ASCII hyphens for divider rows**
- **Found during:** Task 1 (noted in PLAN.md action block)
- **Issue:** RESEARCH.md Q9 used Unicode `─` (U+2500) for divider lines. `StandardFonts.Courier` uses WinAnsi encoding which does not include that glyph — embedding it would throw a pdf-lib encoding error.
- **Fix:** Used ASCII `-` repeated 65 times instead. The three line items the parser keys on are unaffected (all ASCII).
- **Files modified:** scripts/build-fixtures/sample-bill.ts
- **Commit:** 1a7f696

## Known Stubs

None — the fixture script is complete and deterministic. The PDF it generates is the authoritative source of truth for Plan 11 integration tests.

## Self-Check: PASSED

- `scripts/build-fixtures/sample-bill.ts` — FOUND
- `tests/fixtures/sample-bill.pdf` — FOUND
- Commit 1a7f696 — FOUND
- Commit a2e3a2f — FOUND
