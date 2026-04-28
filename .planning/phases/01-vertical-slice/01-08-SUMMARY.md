---
phase: 01-vertical-slice
plan: "08"
subsystem: ui-primitives
tags: [components, css-tokens, dropzone, react-dropzone, accessibility, tdd]
dependency_graph:
  requires: ["01-01"]
  provides: ["PrivacyBanner", "DropZone", "css-design-tokens", "shared-keyframes"]
  affects: ["01-09", "01-10"]
tech_stack:
  added: ["react-dropzone@15.0.0 (already in deps)"]
  patterns: ["CSS Modules", "useDropzone hook", "TDD with act()", "CSS-only keyframes"]
key_files:
  created:
    - src/components/PrivacyBanner/PrivacyBanner.tsx
    - src/components/PrivacyBanner/PrivacyBanner.module.css
    - src/components/DropZone/DropZone.tsx
    - src/components/DropZone/DropZone.module.css
    - src/components/DropZone/DropZone.test.tsx
  modified:
    - src/index.css
decisions:
  - "Used act() wrapper around fireEvent.drop because react-dropzone processes drop events asynchronously in jsdom"
  - "DropZone dragging state driven by isDragActive from useDropzone (not the state prop) — dragging is transient hover state, not a prop-controlled state"
  - "idle and dragging are mutually exclusive in render — !isDragging guard on idle content block"
metrics:
  duration_seconds: 268
  completed_date: "2026-04-28"
  tasks_completed: 3
  tasks_total: 3
  files_created: 5
  files_modified: 1
---

# Phase 01 Plan 08: UI Primitives (PrivacyBanner + DropZone) Summary

PrivacyBanner (sticky 40px banner, exact privacy copy) and DropZone (react-dropzone v15 wrapper, PDF-only, 4 states, full ARIA) with 6 Vitest tests, plus extended CSS token set with spacing scale, flag colors, and shared keyframes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend src/index.css with UI-SPEC tokens | fed98aa | src/index.css |
| 2 | PrivacyBanner component | 27c08af | PrivacyBanner.tsx, PrivacyBanner.module.css |
| 3 | DropZone component + tests (TDD) | d3a9c65 | DropZone.tsx, DropZone.module.css, DropZone.test.tsx |

## DropZone Props Contract

```typescript
export type DropZoneState = 'idle' | 'dragging' | 'processing' | 'complete'

export interface DropZoneProps {
  onFileAccepted: (file: File) => void
  onFileRejected: (reason: 'wrong-type' | 'too-large' | 'unknown') => void
  state: DropZoneState
}
```

## DropZone State Copy Strings (verbatim from UI-SPEC)

| State | Heading | Subtitle |
|-------|---------|---------|
| idle | "Drop your hospital bill here." | "PDF only for now. We'll do the math." |
| dragging | "Drop it." | — (hidden) |
| processing | "Reading your bill…" | "This runs in your browser. Nothing is uploaded." |
| complete | — | "Drop another bill to start over." |

## CSS Tokens Added to src/index.css

### Spacing scale (light + dark)
- `--space-xs: 4px`
- `--space-sm: 8px`
- `--space-md: 16px`
- `--space-lg: 24px`
- `--space-xl: 32px`
- `--space-2xl: 48px`
- `--space-3xl: 64px`

### Surface + flag tokens (light mode)
- `--surface: var(--code-bg)` (#f4f3ec)
- `--flag-red: #dc2626`
- `--flag-red-text: #ffffff`
- `--flag-red-border: #b91c1c`

### Dark mode overrides
- `--surface: #1f2028`
- `--flag-red: #7f1d1d`
- `--flag-red-text: #fecaca`
- `--flag-red-border: #991b1b`

### Shared keyframes
- `@keyframes spin` — DropZone processing spinner, 0.8s linear infinite
- `@keyframes badgeEntrance` — FlagBadge mount animation (Plans 09/10)
- `@keyframes toastIn` — ToastError mount slide (Plans 09/10)
- `@keyframes toastOut` — ToastError dismiss fade (Plans 09/10)
- `@media (prefers-reduced-motion: reduce)` — suppresses all animations

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Wrapped fireEvent.drop in act() for async react-dropzone processing**
- **Found during:** Task 3 GREEN phase — Tests 1 and 2 failed (callbacks never called)
- **Issue:** react-dropzone's onDropAccepted/onDropRejected fire asynchronously after the drop event. fireEvent.drop without act() completes synchronously before react-dropzone processes the file list.
- **Fix:** Wrapped `fireEvent.drop(...)` in `await act(async () => { ... })` in both drop tests.
- **Files modified:** src/components/DropZone/DropZone.test.tsx
- **Commit:** d3a9c65

**2. [Rule 1 - Bug] Fixed idle/dragging double-render**
- **Found during:** Task 3 implementation review — both idle and dragging content would render simultaneously since both checked `state === 'idle'`
- **Fix:** Added `!isDragging` guard to idle content block; dragging block checks only `isDragging`.
- **Files modified:** src/components/DropZone/DropZone.tsx
- **Commit:** d3a9c65

## Known Stubs

None. All components render their final UI-SPEC content. No placeholder text.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundary crossings. All processing is client-side.

## Self-Check: PASSED

All 5 created files confirmed on disk. All 3 task commits confirmed in git log.
