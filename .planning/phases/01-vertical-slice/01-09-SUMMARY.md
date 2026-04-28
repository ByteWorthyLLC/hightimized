---
phase: 01-vertical-slice
plan: "09"
subsystem: ui
tags: [react, css-modules, vitest, aria, animation]

requires:
  - phase: 01-vertical-slice
    plan: "06"
    provides: "FlagResult type from flagLine.ts (charged, comparisonRate, multiplier, plainEnglishMultiplier)"
  - phase: 01-vertical-slice
    plan: "08"
    provides: "CSS design tokens (--flag-red, --mono, --sans, --space-*, --bg, --surface, --border, --text-h, --text, --accent)"

provides:
  - "FlagBadge: inline pill with 4.0× multiplier format, role=status, badgeEntrance animation"
  - "TraceDetail: four locked monospace data rows + plain-English sentence, hidden attribute for a11y"
  - "LineItemCard: unflagged/flagged/expanded states, CSS-only caret rotating 90deg on expand, keyboard-operable"

affects:
  - "01-11"  # Plan 11 imports these three components and wires audit state to props

tech-stack:
  added: []
  patterns:
    - "article > .row div + TraceDetail sibling: keeps flex layout isolated from the expanded trace block"
    - "HTML hidden attribute (not display:none) on TraceDetail for correct assistive-technology hiding"
    - "CSS-only chevron via border-right + border-bottom trick, rotate 0->90deg via caretExpanded modifier class"
    - "TDD: test file first (RED), component second (GREEN), pre-commit hook confirms all 4 pass"

key-files:
  created:
    - src/components/FlagBadge/FlagBadge.tsx
    - src/components/FlagBadge/FlagBadge.module.css
    - src/components/FlagBadge/FlagBadge.test.tsx
    - src/components/TraceDetail/TraceDetail.tsx
    - src/components/TraceDetail/TraceDetail.module.css
    - src/components/LineItemCard/LineItemCard.tsx
    - src/components/LineItemCard/LineItemCard.module.css
  modified: []

key-decisions:
  - "article > row + TraceDetail sibling pattern: outer article is display:block; inner .row is the flex container; TraceDetail is a sibling div outside the flex row so it spans full width without inheriting flex sizing"
  - "HTML hidden attribute on TraceDetail: per UI-SPEC.md line 316 and RESEARCH.md Q12.4, hidden removes from layout AND from a11y tree — display:none only removes from layout"
  - "Caret added via Rule 2 deviation: UI-SPEC motion table line 590 requires rotate(0->90deg) caret on expand; plan action section omitted it but success_criteria listed it explicitly"

patterns-established:
  - "CSS-only caret: .caret uses border-right + border-bottom at 45deg; .caretExpanded rotates to 45deg (appears pointing down); transition 200ms ease-in-out"
  - "FlagBadge: U+00D7 multiplication sign (×) hardcoded in TSX, not x; always toFixed(1)"
  - "Keyboard handler: Enter calls onToggleExpand directly; Space calls preventDefault then onToggleExpand"

requirements-completed:
  - OCR-02

duration: 4min
completed: "2026-04-28"
---

# Phase 01 Plan 09: LineItemCard + FlagBadge + TraceDetail Summary

**Three UI components ship the demo's hero visual: flagged 99213 row with red left border, "4.0x hospital published rate" badge, CSS-only rotating caret, and expandable four-line rule trace with plain-English "FOUR times" sentence**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-28T23:13:14Z
- **Completed:** 2026-04-28T23:17:25Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- FlagBadge pill with U+00D7 multiplier format, role=status ARIA announcement, and badgeEntrance 200ms ease-out animation
- TraceDetail with four locked monospace data rows matching UI-SPEC verbatim, HTML hidden attribute for correct a11y hiding, role=region landmark
- LineItemCard composing both: unflagged static card, flagged keyboard-operable card with aria-expanded/aria-controls, CSS-only caret rotating 90deg on expand

## Props Contracts

**LineItemCard** (`src/components/LineItemCard/LineItemCard.tsx`):
```typescript
interface LineItemCardProps {
  cptCode: string
  description: string
  charge: number
  flag: FlagResult | null
  isExpanded: boolean
  onToggleExpand: () => void
}
```

**FlagBadge** (`src/components/FlagBadge/FlagBadge.tsx`):
```typescript
interface FlagBadgeProps {
  multiplier: number  // formatted as toFixed(1) + U+00D7
}
```

**TraceDetail** (`src/components/TraceDetail/TraceDetail.tsx`):
```typescript
interface TraceDetailProps {
  cptCode: string
  flag: FlagResult  // charged, comparisonRate, multiplier, plainEnglishMultiplier
  isExpanded: boolean
}
```

## Wrapping Pattern

```
<article class="card flagged" role="button" aria-expanded aria-controls="trace-{cpt}">
  <div class="row">          ← flex container
    <span class="code" />
    <span class="description" />
    <FlagBadge />
    <span class="amount" />
    <span class="caret caretExpanded?" aria-hidden />
  </div>
  <TraceDetail hidden={!isExpanded} />   ← sibling of .row, outside flex
</article>
```

The outer article is `display: block`. The `.row` div is the flex container. TraceDetail sits as a sibling so it spans full card width without inheriting flex item sizing.

## Task Commits

1. **Task 1: FlagBadge component + tests** - `a03b4b8` (feat + test, TDD)
2. **Task 2: TraceDetail component** - `5484975` (feat)
3. **Task 3: LineItemCard component** - `6838a37` (feat)

## Files Created/Modified
- `src/components/FlagBadge/FlagBadge.tsx` - Inline pill badge with multiplier format and ARIA
- `src/components/FlagBadge/FlagBadge.module.css` - Red pill styles + badgeEntrance keyframe
- `src/components/FlagBadge/FlagBadge.test.tsx` - 4 Vitest tests (multiplier format, ARIA)
- `src/components/TraceDetail/TraceDetail.tsx` - Four data rows + plain-English sentence
- `src/components/TraceDetail/TraceDetail.module.css` - Mono rows + prose sentence styles
- `src/components/LineItemCard/LineItemCard.tsx` - Card with unflagged/flagged/expanded states
- `src/components/LineItemCard/LineItemCard.module.css` - Block card + flex row + caret animation

## Decisions Made
- `article > .row + TraceDetail` sibling pattern chosen over wrapping in a second element — outer article is `display: block`, inner `.row` is the flex container. TraceDetail sits outside the flex row so it spans full width naturally.
- HTML `hidden` attribute on TraceDetail per UI-SPEC: removes element from both layout and assistive technology tree (CSS `display:none` only removes from layout).
- Caret rotation implemented as a CSS modifier class (`caretExpanded`) rather than an inline style — keeps animation in CSS where it belongs and avoids style prop.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added CSS-only rotating caret to LineItemCard**
- **Found during:** Task 3 (LineItemCard)
- **Issue:** Plan action section omitted the caret, but the plan's own `<success_criteria>` explicitly required "Caret rotates 90° on expand" and UI-SPEC.md motion table (line 590) specifies `transform: rotate(0deg→90deg)` at 200ms ease-in-out for "TraceDetail caret"
- **Fix:** Added `.caret` + `.caretExpanded` CSS classes using border-right + border-bottom chevron trick; span with `aria-hidden="true"` added to flagged card's `.row`
- **Files modified:** `LineItemCard.tsx`, `LineItemCard.module.css`
- **Verification:** `pnpm typecheck` exits 0; visual: caret points right when collapsed, down when expanded
- **Committed in:** `6838a37` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical per spec)
**Impact on plan:** Required for success criteria. No scope creep.

## Issues Encountered
None — all three tasks executed cleanly. Pre-commit hooks (prettier, typecheck, eslint, vitest) passed on first attempt for each commit.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three components exported and typed — Plan 11 can import `LineItemCard`, `FlagBadge`, `TraceDetail` directly
- Props contracts stable: `flag: FlagResult | null` from `flagLine.ts`, `isExpanded` / `onToggleExpand` managed by parent
- No shared state in these components — Plan 11 supplies everything via props from audit state

---
*Phase: 01-vertical-slice*
*Completed: 2026-04-28*
