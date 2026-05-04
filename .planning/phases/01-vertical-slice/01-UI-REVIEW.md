---
phase: 1
slug: vertical-slice
audited: 2026-04-28
baseline: 01-UI-SPEC.md
screenshots: not captured (no dev server running)
---

# Phase 1 — UI Review

**Audited:** 2026-04-28
**Baseline:** 01-UI-SPEC.md (approved design contract)
**Screenshots:** not captured (no dev server at ports 3000, 5173, 8080)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | One unspecified fallback error title; all spec copy otherwise exact |
| 2. Visuals | 3/4 | TraceDetail missing expand/collapse animation; caret rotation range is off-spec |
| 3. Color | 3/4 | Accent used correctly; two hardcoded tints on flagged card not tokenized |
| 4. Typography | 2/4 | Global h1/h2 weight 500 violates two-weight rule; font-size 15px in index.css outside spec scale |
| 5. Spacing | 3/4 | App.css scaffold leftover has arbitrary px values; component CSS is on-spec |
| 6. Experience Design | 3/4 | OCR progress value tracked but not surfaced; ToastError missing dismissing fade-out state |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Global h1/h2 font-weight: 500 in index.css** — violates the locked two-weight rule (400/700 only). Any `<h2>` not overridden by a component `.heading` class (e.g., a future section label or error heading) renders at 500, breaking typographic hierarchy. Fix: change `src/index.css` line 93 from `font-weight: 500` to `font-weight: 700`. The DropZone `.heading` class already overrides to 700 correctly, but the global default remains wrong.

2. **TraceDetail has no expand/collapse animation** — the spec mandates `max-height` CSS transition (0 to 300px, 250ms ease-in-out). The implementation uses the HTML `hidden` attribute with `display: none`, which causes an abrupt appear/disappear with no motion. Users lose the contextual reveal cue that communicates "this detail is part of the card above it." Fix: remove `hidden={!isExpanded}` from TraceDetail, replace with a CSS class toggle, and implement `max-height` transition in `TraceDetail.module.css`.

3. **OCR progress value is tracked but never shown to the user** — `App.tsx` dispatches `OCR_PROGRESS` and stores a `progress: number` in state, but nothing in the DropZone processing state surfaces this. On a slow device or large PDF, the user sees an undifferentiated spinner for potentially 10-30 seconds with no indication of advancement. Fix: pass `progress` prop to DropZone and render a thin progress bar or percentage text below the spinner in the `processing` state.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Passing:**
- PrivacyBanner: `"Your data never leaves your device. No upload, no account."` — exact spec match (`PrivacyBanner.tsx:6`)
- DropZone idle heading: `"Drop your hospital bill here."` — exact match (`DropZone.tsx:53`)
- DropZone idle subtitle: `"PDF only for now. We'll do the math."` — exact match (`DropZone.tsx:54-56`)
- DropZone dragging: `"Drop it."` — exact match (`DropZone.tsx:60`)
- DropZone processing heading: `"Reading your bill…"` — exact match (`DropZone.tsx:65`)
- DropZone processing subtitle: `"This runs in your browser. Nothing is uploaded."` — exact match (`DropZone.tsx:66`)
- DropZone complete: `"Drop another bill to start over."` — exact match (`DropZone.tsx:70`)
- GenerateLetterButton active: `"Generate dispute letter →"` — exact match (`GenerateLetterButton.tsx:22`)
- GenerateLetterButton disabled: `"No overcharges to dispute."` — exact match (`GenerateLetterButton.tsx:20`)
- GenerateLetterButton loading: `"Building your letter…"` — exact match (`GenerateLetterButton.tsx:18`)
- Error: file not supported (`App.tsx:127-130`), OCR failure (`App.tsx:106-108`), letter generation failure (`App.tsx:171-172`) — all match spec exactly

**Failing:**
- `App.tsx:116` — generic fallback error: `title: 'Something went wrong.'` / `body: 'Reload the page to try again.'` This is the catch-all for errors not matching the sql/chargemaster or canvas/tesseract patterns. The spec defines four error cases (wrong type, OCR failure, sql.js init, PDF generation) but no generic fallback copy. "Something went wrong" is the exact pattern flagged as unacceptable generic copy. This should map to the most likely unhandled case or use copy consistent with the voice: e.g., `"Couldn't process that file."` / `"Reload and try with a different PDF."` (`App.tsx:116-117`)

### Pillar 2: Visuals (3/4)

**Passing:**
- PrivacyBanner: sticky top, 40px, `--surface` background, border-bottom, centered text — all match spec
- DropZone: dashed border idle, solid accent border + accent-bg dragging, 150ms transition — all match spec
- DropZone complete state: collapses to 48px, solid 1px border, `--surface` background — matches spec
- DropZone spinner: 24px, `border-top-color: var(--accent)`, 0.8s linear — matches spec
- LineItemCard: unflagged (no badge, flat) and flagged (red left border, blush tint, badge) both implemented
- FlagBadge: red pill with entrance animation — matches spec
- GenerateLetterButton: accent background active, `--surface` background disabled, opacity 0.6, 52px height — matches spec
- Focus-visible rings: all interactive elements have `outline: 2px solid var(--accent)` — consistent
- CSS chevron caret: implemented via border trick, transitions on expand — matches spec approach

**Failing:**
- TraceDetail expand/collapse has no animation. The spec mandates `max-height: 0 → 300px, 250ms ease-in-out`. Implementation uses the `hidden` attribute which removes the element from the layout instantly — no motion (`TraceDetail.module.css` has zero transition or max-height declarations). This is the primary interactive reveal moment; its abruptness undercuts the "rule trace" reveal that is the product's signature interaction.
- Caret rotation range mismatch: spec says `rotate(0deg → 90deg)`. Code uses `rotate(-45deg)` collapsed and `rotate(45deg)` expanded — a 90° arc from a -45° base (`LineItemCard.module.css:74,80`). The visual result is different: the caret goes from pointing right to pointing down rather than from pointing down to pointing right. Minor but off-spec.
- GenerateLetterButton: a dead `@keyframes toastIn` block exists in `GenerateLetterButton.module.css:5-8` — unused copy-paste residue from ToastError CSS. No visual impact but is dead code.

### Pillar 3: Color (3/4)

**Passing:**
- `--accent` used in: DropZone drag border, DropZone spinner top, focus-visible outlines, GenerateLetterButton background — all are sanctioned uses per spec
- `--accent` correctly NOT used on badges, links, or decorative borders
- `--flag-red`, `--flag-red-text`, `--flag-red-border` all tokenized in `index.css` and referenced correctly in `FlagBadge.module.css`
- Dark mode overrides: all specified dark-mode values present in `index.css` `@media (prefers-color-scheme: dark)` block
- `--surface`, `--bg`, `--text`, `--text-h`, `--border` consistently applied via tokens across components
- ToastError intentionally uses hardcoded near-black `#1c1917` (brand-neutral toast surface) — this is specified in the UI-SPEC and acceptable

**Failing:**
- LineItemCard flagged state uses raw hex `#fff9f9` (light) and `#1f1515` (dark) for the blush tint (`LineItemCard.module.css:21,27`). The UI-SPEC explicitly lists these values, so their presence is correct. However, they are not tokenized — if the flag color changes in Phase 2 these two values will need manual hunting. Recommend adding `--flag-bg` and a dark-mode `--flag-bg-dark` token to `index.css`. Minor: not a blocking issue for Phase 1.
- `App.css` exists with Vite scaffold styles referencing `var(--accent)` on `.counter` (`App.css:5`) — an element that no longer exists in the app. `App.css` is never imported (confirmed: not in `main.tsx` or `App.tsx`), so it has zero runtime impact. Dead file should be deleted to prevent confusion.

### Pillar 4: Typography (2/4)

**Failing (major):**
- `index.css:93` sets `h1, h2 { font-weight: 500; }`. The spec's two-weight rule is explicit: "No 500 / no 600 anywhere." The DropZone `.heading` module class overrides to 700 for its own h2 (`DropZone.module.css:47`), so the DropZone heading renders correctly. But any other h2 element in the tree — such as a future section label "Your bill" (spec §Components: LineItemList heading) — will default to 500, breaking the typographic contract.
- `index.css:128` has `code { font-size: 15px; }`. The spec defines four sizes: 28px (Display), 20px (Heading), 16px (Body), 14px (Label/mono). 15px appears nowhere in the spec and is a leftover Vite scaffold value for the `<code>` element. No `<code>` elements are used in the Phase 1 app components, so this is dormant — but it extends the size count outside spec bounds.
- `index.css:98` sets `h1 { font-size: 56px }` and `index.css:107` sets `h2 { font-size: 24px }`. No h1 exists in the Phase 1 UI; 56px is pure scaffold leftover. The DropZone overrides h2 to 28px via `.heading`, but 24px is also outside the spec's four declared sizes (28/20/16/14).

**Passing:**
- Component-level font sizes: 28px display (DropZone heading), 14px label (DropZone subtitle, FlagBadge, LineItemCard code/amount, TraceDetail rows, ToastError title/body), 16px body (LineItemCard description, TraceDetail plain, GenerateLetterButton, PrivacyBanner) — all match spec
- Two weights in component CSS: only 400 and 700 used across all component module files
- Mono font applied correctly: CPT code, amount, FlagBadge, TraceDetail rows all use `var(--mono)` as specified
- No italic usage found anywhere

### Pillar 5: Spacing (3/4)

**Passing:**
- `App.module.css` uses only space tokens: `--space-md`, `--space-3xl`, `--space-2xl`, `--space-xl`, `--space-lg`, `--space-sm` — all on-spec
- Component module files use space tokens consistently: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg` — usage counts match expected patterns
- No arbitrary `[Npx]` or `[Nrem]` Tailwind-style values found
- LineItemCard card gap uses `--space-sm` (8px) as specified
- DropZone padding uses `--space-md` as specified; min-heights match spec (180px mobile / 240px desktop)
- TraceDetail padding uses `--space-md` as specified
- GenerateLetterButton footer padding uses `--space-md` as specified; button height is 52px as specified

**Failing:**
- `index.css` has raw px spacing on global h1/h2 margin: `margin: 32px 0` (h1, line 100), `margin: 20px 0` (h1 mobile, line 103), `margin: 0 0 8px` (h2, line 110). These are unspecified scaffold values. 32px = `--space-xl` and 8px = `--space-sm` — the values are equivalent to tokens but don't reference them. Minor since no h1 is rendered in Phase 1.
- `App.css` (unimported, dead file) contains many raw px values: 25px gap, 18px gap, 5px/10px padding, etc. None affect the runtime since the file is not imported, but the file should be deleted.
- `TraceDetail.module.css:20` uses `margin-top: 4px` raw px between data rows. This equals `--space-xs` but is not referenced via token.

### Pillar 6: Experience Design (3/4)

**Passing:**
- All four DropZone states (idle, dragging, processing, complete) implemented and controlled by parent App state machine
- All four GenerateLetterButton states (hidden, disabled, active, loading) implemented with correct copy and visual treatment
- All four error cases from spec covered: wrong file type, OCR failure, sql.js failure, PDF generation failure (`App.tsx:103-172`)
- ToastError: `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"` — correct for immediate screen-reader announcement (`ToastError.tsx:17`)
- ToastError: 5-second auto-dismiss via `useEffect` + `clearTimeout` cleanup — correct (`ToastError.tsx:11-14`)
- DropZone ARIA: `role="button"`, `aria-label`, `aria-describedby="dropzone-subtitle"`, `tabIndex={0}` — matches spec
- LineItemCard ARIA: `role="button"`, `aria-expanded`, `aria-controls="trace-{cptCode}"`, `tabIndex={0}` on flagged cards; no interactive role on unflagged cards — matches spec
- TraceDetail ARIA: `id="trace-{cptCode}"`, `role="region"`, `aria-label` — matches spec. Uses `hidden` attribute correctly (removes from AT, not just visually)
- GenerateLetterButton: `aria-disabled` (not `disabled`) keeps element focusable for screen readers — matches spec
- Keyboard: `Enter`/`Space` handlers on LineItemCard (`LineItemCard.tsx:36-43`)
- Focus-visible rings on all interactive elements
- `prefers-reduced-motion` block in `index.css` disables all keyframe animations correctly
- Object URL revoked after 30 seconds (`App.tsx:168`)

**Failing:**
- OCR progress percentage (0-100) is tracked in state (`App.tsx:25,45`) but never surfaced in the UI. The DropZone processing state shows only a spinner — no progress indicator, no percentage, no advancing bar. The `progress` field in `ocr-loading` state is computed and dispatched but never read by any component. On slow devices or large PDFs, users will stare at an undifferentiated spinner with no feedback. This is a notable gap for a tool that processes potentially large bill PDFs.
- ToastError missing `dismissing` state: the spec defines three states — hidden, visible, dismissing (fade-out 150ms). The component has only hidden/visible. When dismissed (via button or timer), `onDismiss` is called synchronously, which immediately unmounts the component — no `toastOut` fade-out plays. The `@keyframes toastOut` is defined in `ToastError.module.css:6-9` but never referenced (`ToastError.module.css` has no `.dismissing` class). Impact: users see the toast pop abruptly rather than fade, breaking the motion contract.
- No ErrorBoundary wrapping the app. An uncaught render error in any component would crash the entire UI with a blank screen. Since Phase 1 involves WASM, OCR, and SQLite — all with meaningful failure modes — this is a real risk. The spec does not explicitly require an ErrorBoundary, but the experience design pillar penalizes missing catastrophic failure handling.

---

## Registry Safety

shadcn not initialized (`components.json` absent). Registry safety audit not applicable. All dependencies are standard npm packages (`react-dropzone@15`, `tesseract.js@7`, `sql.js@1.14.1`, `pdf-lib@1.17.1`, `pdfjs-dist@5.7.284`).

---

## Files Audited

- `/Users/kevinrichards/Projects/hightimized/src/index.css`
- `/Users/kevinrichards/Projects/hightimized/src/App.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/App.module.css`
- `/Users/kevinrichards/Projects/hightimized/src/App.css` (dead — not imported)
- `/Users/kevinrichards/Projects/hightimized/src/main.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/PrivacyBanner/PrivacyBanner.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/PrivacyBanner/PrivacyBanner.module.css`
- `/Users/kevinrichards/Projects/hightimized/src/components/DropZone/DropZone.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/DropZone/DropZone.module.css`
- `/Users/kevinrichards/Projects/hightimized/src/components/LineItemCard/LineItemCard.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/LineItemCard/LineItemCard.module.css`
- `/Users/kevinrichards/Projects/hightimized/src/components/FlagBadge/FlagBadge.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/FlagBadge/FlagBadge.module.css`
- `/Users/kevinrichards/Projects/hightimized/src/components/TraceDetail/TraceDetail.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/TraceDetail/TraceDetail.module.css`
- `/Users/kevinrichards/Projects/hightimized/src/components/GenerateLetterButton/GenerateLetterButton.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/GenerateLetterButton/GenerateLetterButton.module.css`
- `/Users/kevinrichards/Projects/hightimized/src/components/ToastError/ToastError.tsx`
- `/Users/kevinrichards/Projects/hightimized/src/components/ToastError/ToastError.module.css`
- `/Users/kevinrichards/Projects/hightimized/.planning/phases/01-vertical-slice/01-UI-SPEC.md`
- `/Users/kevinrichards/Projects/hightimized/.planning/phases/01-vertical-slice/01-CONTEXT.md`
