---
phase: 01-vertical-slice
plan: "04"
subsystem: ocr
tags: [ocr, pdfjs, tesseract, browser-only, wasm]
dependency_graph:
  requires: ["01-01"]
  provides: ["ocrFirstPageOfPdf"]
  affects: ["01-11"]
tech_stack:
  added: []
  patterns:
    - "pdfjs-dist v5 RenderParameters requires explicit canvas + canvasContext (v5 breaking change from v4)"
    - "tesseract.js v7 createWorker options: workerPath/langPath/corePath all via BASE_URL"
    - "try/finally for worker.terminate() — prevents leak on recognize() rejection"
    - "vi.mock at module scope + dynamic import('./ocrPdf') per test — avoids WASM loading in jsdom"
key_files:
  created:
    - src/lib/ocr/ocrPdf.ts
    - src/lib/ocr/ocrPdf.test.ts
  modified: []
decisions:
  - "pdfjs v5 RenderParameters.canvas is required (not optional) — pass the HTMLCanvasElement explicitly alongside canvasContext"
  - "HTMLCanvasElement.prototype.getContext stubbed in beforeEach via unknown cast — jsdom returns null for 2D context by default"
  - "eslint-disable comment removed after prettier reformatted cast (no longer triggered any-explicit-any rule)"
metrics:
  duration_seconds: 146
  completed_date: "2026-04-28"
  tasks_completed: 2
  files_changed: 2
requirements_satisfied:
  - OCR-01
---

# Phase 01 Plan 04: OCR Pipeline Summary

**One-liner:** Browser OCR pipeline using pdfjs-dist v5 canvas render at 2x scale fed into self-hosted tesseract.js v7 worker — no network calls, all assets from `public/tesseract/` via `BASE_URL`.

## What Was Built

`ocrFirstPageOfPdf(file: File, onProgress?: (p: number) => void): Promise<string>`

- Reads the PDF as an `ArrayBuffer` via `pdfjs.getDocument({ data: buffer })`
- Renders page 1 to an in-memory canvas at `scale: 2.0` (144 DPI equivalent)
- Feeds the canvas to a tesseract.js v7 worker initialized with self-hosted assets resolving via `import.meta.env.BASE_URL`
- Returns the extracted text string
- Calls `worker.terminate()` unconditionally via `try/finally`

### Asset URL Pattern

```
workerPath: `${BASE}tesseract/worker.min.js`
langPath:   `${BASE}tesseract/lang`
corePath:   `${BASE}tesseract/`   ← directory, not a specific .js file
```

In production (`BASE = /hightimized/`) and in dev (`BASE = /`) — both resolve correctly.

## Tests (3/3 passing, <1s)

| Test | What it verifies |
|------|-----------------|
| returns OCR text on success | recognize() result flows through; terminate() called |
| forwards progress events | logger { status: 'recognizing text', progress: 0.5 } → onProgress(0.5) |
| terminates on recognize rejection | try/finally contract holds when recognize() throws |

Mocking strategy: `vi.mock('tesseract.js')` + `vi.mock('pdfjs-dist')` at module scope. Dynamic `import('./ocrPdf')` inside each test so Vitest applies mocks before module initialization. No real WASM loads in jsdom.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] pdfjs-dist v5 requires `canvas` in RenderParameters**
- **Found during:** Task 1 typecheck
- **Issue:** Plan code used `{ canvasContext: ctx, viewport }` but pdfjs v5 made `canvas: HTMLCanvasElement` a required field in `RenderParameters` (breaking change from v4)
- **Fix:** Added `canvas` to the render call: `{ canvas, canvasContext: ctx, viewport }`
- **Files modified:** `src/lib/ocr/ocrPdf.ts`
- **Commit:** c089e87

**2. [Rule 1 - Bug] HTMLCanvasElement.prototype.getContext stub type mismatch**
- **Found during:** Task 2 typecheck
- **Issue:** `vi.fn(() => ({} as unknown as CanvasRenderingContext2D))` assigned to the overloaded `getContext` signature caused TS2322 — TypeScript's overload resolver requires the full overloaded type
- **Fix:** Cast assignment as `unknown as typeof HTMLCanvasElement.prototype.getContext`; prettier subsequently reformatted to `vi.fn(() => ({}) as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext`
- **Files modified:** `src/lib/ocr/ocrPdf.test.ts`
- **Commit:** c089e87

## Known Stubs

None. Module exports a real (testable) implementation. No hardcoded empty returns or placeholder text. Actual WASM execution deferred to runtime where real `public/tesseract/` assets are present.

## Threat Flags

None. This module operates entirely in the browser on user-supplied data. No network egress, no file I/O, no external endpoints introduced.

## Self-Check: PASSED

- `src/lib/ocr/ocrPdf.ts` — FOUND
- `src/lib/ocr/ocrPdf.test.ts` — FOUND
- commit c089e87 — FOUND (feat(01-04): implement browser OCR pipeline PDF → canvas → tesseract)
- `pnpm typecheck` — exits 0
- `pnpm test:run src/lib/ocr/ocrPdf.test.ts` — 3/3 passing
