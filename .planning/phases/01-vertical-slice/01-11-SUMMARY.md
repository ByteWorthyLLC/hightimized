---
phase: 01-vertical-slice
plan: 11
subsystem: ui
tags: [react, useReducer, vitest, testing-library, css-modules, pdf-download]

requires:
  - phase: 01-vertical-slice
    plan: 04
    provides: ocrFirstPageOfPdf wrapper (tesseract.js + pdfjs-dist)
  - phase: 01-vertical-slice
    plan: 05
    provides: parseBillText pure regex parser
  - phase: 01-vertical-slice
    plan: 06
    provides: getChargemasterDb + lookupChargemaster (sql.js)
  - phase: 01-vertical-slice
    plan: 07
    provides: flagLine auditor
  - phase: 01-vertical-slice
    plan: 08
    provides: DropZone component
  - phase: 01-vertical-slice
    plan: 09
    provides: LineItemCard, FlagBadge, TraceDetail components
  - phase: 01-vertical-slice
    plan: 10
    provides: GenerateLetterButton, ToastError, PrivacyBanner components
  - phase: 01-vertical-slice
    plan: 03
    provides: generateDisputeLetter (pdf-lib)

provides:
  - End-to-end vertical slice: drop PDF -> OCR -> parse -> audit -> render flagged items -> download letter
  - useReducer audit state machine (idle/ocr-loading/parsing/audited/letter-generating)
  - Integration smoke test with mocked WASM/DB verifying the full happy path

affects:
  - Phase 2 (any App.tsx extensions, additional state phases, routing additions)
  - Phase 5 (onboarding overlay, statute viewer will mount alongside existing zones)

tech-stack:
  added: []
  patterns:
    - useReducer discriminated union state machine for multi-step async flows
    - vi.hoisted() for mock variables referenced inside vi.mock factory functions
    - Blob([bytes.buffer as ArrayBuffer]) pattern for Uint8Array -> PDF download

key-files:
  created:
    - src/App.tsx
    - src/App.module.css
    - src/App.test.tsx
  modified: []

key-decisions:
  - "Added letter-generating phase to AuditStatus beyond RESEARCH.md spec — carries lineItems forward so line list stays visible during letter generation"
  - "OCR_ERROR maps to idle (same as RESET) in the reducer — distinction kept in union for exhaustive type safety and audit trail"
  - "Blob receives bytes.buffer cast to ArrayBuffer to satisfy TypeScript strict Uint8Array<ArrayBufferLike> constraint"
  - "vi.hoisted() used for mock spy variables — vi.mock factories are hoisted before const declarations so top-level variables cannot be referenced directly"
  - "findByRole('status', { name: /4.0 times/i }) used to uniquely target FlagBadge — TraceDetail also renders '4.0x' so findByText was ambiguous"

patterns-established:
  - "State machine pattern: useReducer with exhaustive discriminated union + separate useState for ephemeral error/UI state"
  - "Integration test pattern: vi.hoisted for shared mock spies, inline fixture text in vi.mock factory to avoid hoisting issues"
  - "Download pattern: URL.createObjectURL + programmatic anchor click + setTimeout(revokeObjectURL, 30000)"

requirements-completed: [INGEST-01, OCR-01, OCR-02, LETTER-01]

duration: 5min
completed: 2026-04-28
---

# Phase 01 Plan 11: App.tsx Integration — Vertical Slice Summary

**useReducer audit state machine wiring all 5 lib modules and 4 UI components into a drop-to-download flow verified by a 4-test integration smoke under 1 second**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-28T23:26:56Z
- **Completed:** 2026-04-28T23:31:38Z
- **Tasks:** 2 (Task 1: App.tsx + App.module.css, Task 2: App.test.tsx)
- **Files modified:** 3

## Accomplishments

- App.tsx fully replaced: useReducer state machine with 8 actions across 5 phases, composed from all 5 lib modules and all 4 interactive components
- PDF download: URL.createObjectURL blob + programmatic anchor click + 30s revokeObjectURL cleanup
- Integration smoke test: 4 tests, all mocked WASM/DB, runs in under 1 second
- All Phase 1 requirements satisfied end-to-end: INGEST-01, OCR-01, OCR-02, LETTER-01

## Reducer State Union and Action Set

```typescript
type AuditStatus =
  | { phase: 'idle' }
  | { phase: 'ocr-loading'; progress: number }
  | { phase: 'parsing' }
  | { phase: 'audited'; lineItems: AuditedLine[]; flaggedCount: number }
  | { phase: 'letter-generating'; lineItems: AuditedLine[]; flaggedCount: number }

type AuditAction =
  | { type: 'FILE_ACCEPTED'; file: File }
  | { type: 'OCR_PROGRESS'; progress: number }
  | { type: 'OCR_COMPLETE' }
  | { type: 'AUDIT_COMPLETE'; lineItems: AuditedLine[] }
  | { type: 'OCR_ERROR'; message: string }
  | { type: 'LETTER_GENERATING' }
  | { type: 'LETTER_COMPLETE' }
  | { type: 'RESET' }
```

## Data Flow (Drop Through Download)

```
File drop (DropZone onFileAccepted)
  -> dispatch FILE_ACCEPTED         -- phase: ocr-loading
  -> ocrFirstPageOfPdf(file, onProgress)
     -> dispatch OCR_PROGRESS(p)    -- progress updates
  -> dispatch OCR_COMPLETE          -- phase: parsing
  -> parseBillText(text)            -- pure regex, no state change
  -> getChargemasterDb()            -- sql.js WASM init (cached)
  -> lineItems.map: lookupChargemaster + flagLine
  -> dispatch AUDIT_COMPLETE        -- phase: audited, renders line cards + CTA

CTA click (GenerateLetterButton onGenerate)
  -> setLetterLoading(true)         -- local state, spinner
  -> generateDisputeLetter(flagged) -- pdf-lib Uint8Array
  -> Blob([bytes.buffer as ArrayBuffer])
  -> URL.createObjectURL(blob)
  -> anchor.click()                 -- programmatic download
  -> setTimeout(revokeObjectURL, 30000)
  -> setLetterLoading(false)
```

## Manual Demo Steps

```bash
pnpm dev
# -> open http://localhost:5173/hightimized/
# -> drag tests/fixtures/sample-bill.pdf onto the drop zone
# -> see the 99213 row flagged at 4.0× hospital published rate
# -> click the expand caret to see the rule trace
# -> click "Generate dispute letter →"
# -> browser downloads hightimized-dispute-{date}.pdf
```

## Task Commits

1. **Task 1+2: App.tsx state machine + integration test** - `f7c7efe` (feat)

## Files Created/Modified

- `src/App.tsx` - Three-zone layout wired through useReducer audit state machine
- `src/App.module.css` - Content column (max-w-672px), heroZone, list, mobile breakpoint
- `src/App.test.tsx` - 4-test integration smoke with vi.hoisted mocks for WASM/DB

## Decisions Made

- Added `letter-generating` phase (not in RESEARCH.md spec): carries `lineItems` forward so the line list stays visible while the letter is building. RESEARCH.md had `letter-ready` which would have dropped lineItems from state — the plan action spec overrides this.
- `OCR_ERROR` maps to `{ phase: 'idle' }` same as RESET but kept distinct in the union: exhaustive type safety and auditable action history.
- `Blob([bytes.buffer as ArrayBuffer])`: TypeScript strict mode rejects `Uint8Array<ArrayBufferLike>` as a `BlobPart` directly — the `.buffer` cast resolves it cleanly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vi.mock hoisting: fixture text cannot reference top-level const**
- **Found during:** Task 2 (App.test.tsx)
- **Issue:** `vi.mock` factories are hoisted before `const` declarations; `FIXTURE_OCR_TEXT` variable caused `ReferenceError: Cannot access before initialization`
- **Fix:** Inlined the fixture string directly inside the `vi.mock` factory; used `vi.hoisted()` for spy variables (`mockLookupChargemaster`, `generateDisputeLetterMock`, `mockGetChargemasterDb`) that need to be referenced in both mock factories and test assertions
- **Files modified:** src/App.test.tsx
- **Verification:** Test suite ran clean with 4/4 passing
- **Committed in:** f7c7efe

**2. [Rule 1 - Bug] `findByText(/4\.0×/)` matched two elements**
- **Found during:** Task 2, test run
- **Issue:** FlagBadge renders "4.0× hospital published rate" AND TraceDetail renders "Multiplier: 4.0×" (hidden but still in DOM); `findByText` found multiple matches
- **Fix:** Changed assertion to `findByRole('status', { name: /4\.0 times/i })` targeting the FlagBadge's `role="status"` and `aria-label`
- **Files modified:** src/App.test.tsx
- **Verification:** Test 2 passed cleanly
- **Committed in:** f7c7efe

**3. [Rule 1 - Bug] TypeScript: Uint8Array<ArrayBufferLike> not assignable to BlobPart**
- **Found during:** Task 1, typecheck
- **Issue:** `new Blob([bytes])` fails type check in strict mode — `Uint8Array<ArrayBufferLike>.buffer` is typed as `ArrayBufferLike` not `ArrayBuffer`
- **Fix:** `new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })`
- **Files modified:** src/App.tsx
- **Verification:** `pnpm typecheck` exits 0
- **Committed in:** f7c7efe

---

**Total deviations:** 3 auto-fixed (all Rule 1 bugs)
**Impact on plan:** All fixes necessary for correctness. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. App.tsx is browser-only with no external calls — consistent with the project's zero-upload constraint.

## Known Stubs

None. All data flows are wired end-to-end with real implementations.

## Next Phase Readiness

- Phase 1 vertical slice is complete and demo-ready
- Manual demo path verified: drop fixture -> flagged 99213 at 4.0x -> expand trace -> download letter
- Phase 2 entry point: extend chargemaster corpus (real CMS MRF data), add multi-page OCR (OCR-03), add manual correction UI (OCR-04)
- App.tsx reducer can accept new phases (e.g., onboarding, history) by extending AuditStatus union

## Self-Check: PASSED

- src/App.tsx: FOUND
- src/App.module.css: FOUND
- src/App.test.tsx: FOUND
- Commit f7c7efe: FOUND

---
*Phase: 01-vertical-slice*
*Completed: 2026-04-28*
