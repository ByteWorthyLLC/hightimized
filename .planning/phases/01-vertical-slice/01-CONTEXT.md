# Phase 1: Vertical Slice — Context

**Gathered:** 2026-04-28
**Status:** Ready for planning
**Mode:** Smart discuss — 16 PRD-grounded recommendations accepted (YOLO across remaining phases per user)

<domain>
## Phase Boundary

End-to-end happy path with hardcoded data. The user drags a synthetic fixture bill PDF into the page; tesseract.js OCRs it in-browser; the line-item parser extracts CPT/HCPCS code + description + charge per line; a single-row hardcoded `chargemaster.sqlite` (loaded via sql.js) provides the published-rate / regional-median / Medicare-allowable trio; the Phase 1 flagger fires on the obviously-inflated line; the user clicks "Generate dispute letter" in the sticky footer and pdf-lib emits a credible stub letter PDF for download.

Phase 1 ENDS when a user can drag the fixture, see one flagged line with the rule trace, and download a stub PDF — no real corpus, no LLM, no persistence. Proves the architecture top-to-bottom before Phase 2 scales the data.

</domain>

<decisions>
## Implementation Decisions

### Fixture Bill

- **Source**: synthetic, hand-crafted PDF mimicking a US hospital itemized bill format. Stored at `tests/fixtures/sample-bill.pdf`. No real PHI. No real hospital name (use placeholder "Memorial Regional Medical Center").
- **Codes on fixture**: 3 line items, exactly 1 obviously inflated to ensure the flagger fires deterministically:
  - `99213` Office visit, established patient (typical $187, fixture shows $750 — flag fires: 4× hospital published rate)
  - `85025` Complete blood count w/ differential (typical $15, fixture shows $80 — borderline, may or may not flag depending on rule strictness)
  - `J3490` Unclassified injection (typical $50, fixture shows $200 — borderline)
- **Page count**: single page.
- **File format**: PDF only. Image/JPG support is INGEST-03, deferred to Phase 2.

### Hardcoded SQLite Contract

- **Schema**: `chargemaster (cpt_code TEXT PRIMARY KEY, description TEXT, hospital_published_rate REAL, regional_median REAL, medicare_allowable REAL)` — 5 columns, covers both flagger rules.
- **Engine**: sql.js (PRD-locked). Pure WASM, ~1MB total, no OPFS dep, works in service worker context. Imported via `@jlongster/sql.js` or `sql.js` directly, latest stable.
- **Bundle delivery**: Vite static asset import. File at `data/build/chargemaster.sqlite` (committed for Phase 1; replaced by build-time pipeline output in Phase 2). Imported as `import sqliteUrl from '../../data/build/chargemaster.sqlite?url'`. Fingerprinted by Vite, cached by service worker.
- **Phase 1 seed**: One INSERT row matching the 99213 line on the fixture: `(99213, 'Office visit, est. patient, low complexity', 187.50, 198.00, 92.40)`. Phase 2 replaces with the real CMS MRF aggregated corpus.

### UI Flow

- **Page structure**: single-page, three vertical zones — (a) drop-zone hero with persistent privacy banner ("Your data never leaves your device"), (b) line-items list with inline flag badges, (c) sticky footer "Generate dispute letter" CTA. No router yet; App.tsx renders all three. Phase 5 adds onboarding overlay, statute viewer, settings.
- **Drop-zone**: `react-dropzone` v14 (or latest). Accessible (ARIA), keyboard-operable, ~7KB gzip. Fallback `<input type="file">` for click-to-browse.
- **Line item rendering**: single-column card list. Each card: CPT code (mono) · description · charged amount · (if flagged) red badge "{X.X}× hospital published rate" · expand-for-trace caret showing the rule that fired and the comparison numbers. Mobile-first: 100% width on phone, max-w-2xl on desktop.
- **Letter CTA**: sticky footer button, full-width on mobile, max-w-md centered on desktop. Disabled state when zero flagged lines: copy "No overcharges to dispute." Active state: "Generate dispute letter →" with right-arrow glyph.

### Stub PDF Letter

- **Library**: pdf-lib (PRD-locked). ~200KB, browser-only, supports forms + signatures + custom fonts.
- **Stub content**: credible draft structure (NOT lorem ipsum). Sections: return address placeholder, today's date, `RE: Dispute of charges on bill #[BILL_NUMBER]`, body referencing the flagged line by CPT + amount + comparison rate, 30-day rebill demand boilerplate, signature line `Sincerely, [YOUR NAME]`. Patient name is a placeholder so users edit before printing — Phase 3 wires real form fields.
- **Filename**: `hightimized-dispute-{YYYY-MM-DD}.pdf`. No PHI in filename. Date-stamped for provenance.
- **Delivery**: `URL.createObjectURL` + `<a download>` programmatic click → native browser download. Same-tab. Object URL revoked after 30s to free memory.

### Claude's Discretion

- Exact pdf-lib version pinning (latest stable as of 2026-04-28).
- tesseract.js version + worker URL strategy (default CDN-served wasm or self-host in `public/tesseract/`). Recommend self-host to honor `$0`-cost + zero-API constraint and keep service worker cache predictable.
- Component file split — Claude picks (recommended: `<DropZone>`, `<LineItemCard>`, `<FlagBadge>`, `<TraceDetail>`, `<GenerateLetterButton>`).
- Styling approach — confirmed in code-context: Tailwind-or-vanilla-CSS pick goes here. **Recommend vanilla CSS modules / plain CSS** for Phase 1 to avoid adding Tailwind tooling (matches "edit don't add" — Vite create-vite default is plain CSS).
- Error UI — wrong file type, OCR failure, sql.js init failure all need user-facing copy. Stay laconic, voice rules apply.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets (from Phase 0 scaffold)

- `src/App.tsx` — current default Vite component, will be replaced by the three-zone layout.
- `src/App.css`, `src/index.css` — vanilla CSS, ready to extend.
- Empty homes already created in Phase 0:
  - `src/lib/ocr/.gitkeep` — tesseract.js wrapper goes here
  - `src/lib/auditor/.gitkeep` — flagger logic goes here
  - `src/lib/letter/.gitkeep` — pdf-lib wrapper goes here
  - `src/lib/llm/.gitkeep` — Phase 3
  - `src/components/.gitkeep` — UI components
  - `src/data-sources/.gitkeep` — sql.js client
  - `data/build/.gitkeep` — chargemaster.sqlite committed here for Phase 1
- `src/test/setup.ts` — Vitest setup, jsdom + jest-dom matchers ready
- Lefthook pre-commit hooks live: typecheck, eslint, prettier, vitest changed-files

### Established Patterns

- **TypeScript strict mode** — all new code typed.
- **ES module imports** — `import x from 'y'`, no CommonJS.
- **Vite asset imports** — `?url` suffix for binary assets.
- **Vitest for tests** — `*.test.tsx` co-located with source, `setupFiles` already wired.
- **Pre-commit gates** — must pass typecheck + eslint + prettier + tests.

### Integration Points

- `src/main.tsx` mounts `<App />` into `#root`.
- `index.html` has the privacy-banner placeholder (currently default Vite).
- `vite.config.ts` already has VitePWA plugin stub + `globIgnores: ['**/*.gguf']`. Phase 1's sql.js wasm and tesseract.js wasm need to be added to PWA precache or globIgnores depending on size.
- `package.json` scripts: `dev`, `build`, `typecheck`, `lint`, `format`, `test`, `test:run`, `test:coverage`.

</code_context>

<specifics>
## Specific Ideas

- **The screenshot moment**: when the user drags the bill and the 99213 row gets the red `4.0× hospital published rate` badge, that's the demo. Optimize the visual for that frame — the badge color, the rule-trace expand reveal, the price comparison row.
- **Privacy banner placement**: ABOVE the drop zone, not below. Builds trust before the user uploads. Copy: "Your data never leaves your device. No upload, no account."
- **Drop-zone empty-state copy**: "Drop your hospital bill here." H2-sized. Subtitle: "PDF only for now. We'll do the math." (Tone: confident, not chirpy.)
- **Trace expand UX**: caret rotates 90° on click; reveal shows: `Rule: charge > 1.5× hospital published rate (matched).` `Charged: $750.00.` `Hospital published rate: $187.50.` `Multiplier: 4.0×.` `Plain language: We found you were charged FOUR times what this hospital publicly says they charge for this code.`
- **CTA copy variants** (in order of preference): "Generate dispute letter →" / "Get the letter" / "Build the receipt." Pick first.

</specifics>

<deferred>
## Deferred Ideas

- Multi-page bill OCR → OCR-03, Phase 2.
- JPG/PNG image support → INGEST-03, Phase 2.
- Real CPT/HCPCS dictionary lookup → Phase 2 (the bundled HCPCS Level II table).
- Manual line-item correction UI → OCR-04, Phase 2.
- Real WebLLM-rendered explainer text → EXPL-01..05, Phase 3.
- Real letter content with citations → LETTER-02..07, Phase 3.
- Persistence (IndexedDB save/load history) → Phase 4.
- "Wipe everything" button → STORAGE-02, Phase 4.
- Onboarding tour, statute viewer, certified-mail card → Phase 5.

</deferred>
