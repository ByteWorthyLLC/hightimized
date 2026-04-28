---
phase: 01-vertical-slice
plan: 10
subsystem: ui-components
tags: [react, vitest, tdd, accessibility, css-modules]
dependency_graph:
  requires: ["01-08"]
  provides: ["GenerateLetterButton", "ToastError"]
  affects: ["01-11"]
tech_stack:
  added: []
  patterns: ["aria-disabled over disabled attr", "CSS-only spinner", "useEffect cleanup for timers"]
key_files:
  created:
    - src/components/GenerateLetterButton/GenerateLetterButton.tsx
    - src/components/GenerateLetterButton/GenerateLetterButton.module.css
    - src/components/GenerateLetterButton/GenerateLetterButton.test.tsx
    - src/components/ToastError/ToastError.tsx
    - src/components/ToastError/ToastError.module.css
  modified: []
decisions:
  - "aria-disabled not disabled attr — keeps button focusable so screen readers announce disabled-state copy (UI-SPEC.md line 368)"
  - "ToastError useEffect cleanup clears the 5s timer if component unmounts before it fires"
metrics:
  duration: 164s
  completed: 2026-04-28T23:23:48Z
  tasks_completed: 2
  files_created: 5
  files_modified: 0
requirements:
  - LETTER-01
---

# Phase 01 Plan 10: GenerateLetterButton + ToastError Summary

Sticky-footer CTA with 4 ARIA-correct state-driven copy strings and auto-dismissing fixed-position error toast.

## Commits

| Task | Hash | Description |
|------|------|-------------|
| 1 - GenerateLetterButton | a8e2ab2 | feat(01-10): add GenerateLetterButton sticky-footer CTA with 4-state copy |
| 2 - ToastError | 25a927d | feat(01-10): add ToastError auto-dismissing error toast |

## What Was Built

### GenerateLetterButton

4-state sticky-footer CTA (`position: sticky; bottom: 0; z-index: 50`) wired to a caller-supplied `onGenerate` callback.

**State machine:**

| State | Condition | Copy | aria-disabled |
|-------|-----------|------|---------------|
| hidden | unmounted by parent (Plan 11 controls mounting) | — | — |
| disabled | `flaggedCount === 0 && !isLoading` | "No overcharges to dispute." | true |
| active | `flaggedCount >= 1 && !isLoading` | "Generate dispute letter →" (U+2192) | false |
| loading | `isLoading === true` | "Building your letter…" | true |

**Key decision — `aria-disabled` not `disabled`:** Using the HTML `disabled` attribute would remove the button from tab order, preventing screen readers from reading the disabled-state copy. `aria-disabled="true"` keeps the element focusable while blocking activation. The `onClick` guard (`if (!isDisabled) onGenerate()`) enforces the no-fire contract in JS.

**Props contract:**
```ts
interface GenerateLetterButtonProps {
  flaggedCount: number
  isLoading: boolean
  onGenerate: () => void
}
```

### ToastError

Fixed-position error notice that auto-dismisses at 5 seconds. Plan 11 (App.tsx) will wire it to 4 error triggers from UI-SPEC: wrong file type, OCR failure, sql.js init failure, PDF generation failure.

**Props contract:**
```ts
interface ToastErrorProps {
  title: string
  body: string
  onDismiss: () => void
}
```

**Key implementation notes:**
- `useEffect` cleanup clears the 5s `setTimeout` if `onDismiss` unmounts the component before the timer fires — prevents stale-closure calls on already-unmounted components
- `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` — screen reader announces the error immediately on mount
- Positioned above the sticky footer on mobile: `bottom: calc(84px + var(--space-md))` (84px = footer zone per UI-SPEC line 370)
- `@media (prefers-reduced-motion: reduce)` suppresses both `toastIn` and `toastOut` animations

## Test Results

5/5 tests passing for GenerateLetterButton (TDD: RED then GREEN):
- disabled when flaggedCount=0
- active when flaggedCount >= 1
- loading state shows correct copy and aria-disabled
- calls onGenerate when active button is clicked
- does NOT call onGenerate when disabled

ToastError has no unit tests in this plan (per plan spec: Plan 11 integration smoke test exercises it via wrong-type file drop).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Both components are complete shells. Plan 11 wires `onGenerate` to `generateDisputeLetter` and supplies error state to `ToastError`.

## Self-Check: PASSED
