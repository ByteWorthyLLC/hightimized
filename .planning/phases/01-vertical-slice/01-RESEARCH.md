# Phase 1: Vertical Slice — Research

**Researched:** 2026-04-28
**Domain:** Browser OCR (tesseract.js), browser SQLite (sql.js/WASM), drag-drop ingest (react-dropzone), PDF generation (pdf-lib), PDF-to-canvas pipeline (pdfjs-dist)
**Confidence:** HIGH (all package versions verified via npm registry 2026-04-28; code patterns verified via official docs and canonical GitHub sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Fixture Bill**
- Synthetic hand-crafted PDF at `tests/fixtures/sample-bill.pdf`. No real PHI.
- 3 line items: `99213` (inflated to $750, flag fires), `85025` ($80), `J3490` ($200).
- Single page. PDF format only — JPG deferred to Phase 2.

**Hardcoded SQLite Contract**
- Schema: `chargemaster (cpt_code TEXT PRIMARY KEY, description TEXT, hospital_published_rate REAL, regional_median REAL, medicare_allowable REAL)`
- Engine: sql.js (PRD-locked). WASM, ~1MB, no OPFS dep.
- Asset import: `import sqliteUrl from '../../data/build/chargemaster.sqlite?url'`
- Phase 1 seed: one row for code `99213` with `hospital_published_rate = 187.50`.

**UI Flow**
- Single page, three zones: drop-zone hero, line-items list, sticky footer CTA.
- react-dropzone v14+ (latest stable).
- Vanilla CSS modules — no Tailwind, no shadcn.

**Stub PDF Letter**
- pdf-lib (PRD-locked). StandardFonts only for Phase 1; fontkit deferred to Phase 3.
- Filename: `hightimized-dispute-{YYYY-MM-DD}.pdf`.
- Delivery: `URL.createObjectURL` + `<a download>` programmatic click, revoke after 30s.

**Claude's Discretion**
- Exact pdf-lib version pinning (latest stable).
- tesseract.js version + worker URL strategy (recommend self-host).
- Component file split.
- Error UI copy.

### Deferred Ideas (OUT OF SCOPE)
- Multi-page bill OCR — Phase 2.
- JPG/PNG image support — Phase 2.
- Real CPT/HCPCS dictionary lookup — Phase 2.
- Manual line-item correction UI — Phase 2.
- Real WebLLM explainer text — Phase 3.
- Real letter content with citations — Phase 3.
- Persistence (IndexedDB) — Phase 4.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INGEST-01 | User can drag-drop a hospital bill PDF into the page | react-dropzone v15 — Q3 below |
| OCR-01 | Browser-only OCR extracts text from bill PDF with no network call | tesseract.js v7 self-hosted — Q1, Q5 below |
| OCR-02 | Line-item parser extracts CPT/HCPCS code, description, and charge amount per line | Regex parser — Q6 below |
| LETTER-01 | User can generate a dispute letter from flagged lines | pdf-lib StandardFonts — Q4 below |
</phase_requirements>

---

## Summary

Phase 1 wires together five browser-only libraries that have no natural integration story — they must be composed explicitly. All five have stable current versions as of 2026-04-28 and are verified against the npm registry. The most complex integration concern is the WASM delivery strategy: both sql.js and pdfjs-dist require their WASM/worker files to be served from a predictable URL, and Vite's `?url` import suffix and the `public/` directory copy approach are both valid self-hosting mechanisms. tesseract.js v7 has a similar self-hosting pattern using `public/tesseract/` as the asset base.

The pdf-lib + StandardFonts path is the simplest piece — no fontkit needed for Phase 1, TimesRoman is built-in, and the letter content is a credible plain-text draft with bracket placeholders. The CPT parser is regex-only and handles the exact synthetic fixture format designed in CONTEXT.md. The flagger logic is a pure TypeScript function with no side effects — it can be fully unit-tested without any DOM or WASM.

The state machine in App.tsx uses `useReducer` with five states: `idle → ocr-loading → parsing → audited → letter-ready`. No routing, no global state library.

**Primary recommendation:** Install all five production deps in one `pnpm add` call, configure WASM self-hosting in both vite.config.ts and `public/` for tesseract.js/sql.js/pdfjs-dist, and implement each lib behind a thin wrapper in `src/lib/` so tests never touch WASM directly.

---

## Standard Stack

### Production Dependencies to Add in Phase 1

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| tesseract.js | 7.0.0 | Browser OCR (eng traineddata to text) | [VERIFIED: npm registry 2026-04-28] |
| sql.js | 1.14.1 | SQLite WASM, reads chargemaster.sqlite in-browser | [VERIFIED: npm registry 2026-04-28] |
| react-dropzone | 15.0.0 | Accessible drag-drop plus file picker | [VERIFIED: npm registry 2026-04-28] |
| pdf-lib | 1.17.1 | Browser PDF generation for dispute letter | [VERIFIED: npm registry 2026-04-28] |
| pdfjs-dist | 5.7.284 | Render PDF pages to canvas for OCR input | [VERIFIED: npm registry 2026-04-28] |

**Note on @pdf-lib/fontkit:** Do NOT install for Phase 1. StandardFonts.TimesRoman is built-in to pdf-lib and requires no fontkit. Fontkit is only needed for custom TTF/OTF embedding (Phase 3). [VERIFIED: pdf-lib.js.org official docs]

**Note on react-dropzone version:** UI-SPEC.md says "v14" but latest stable is v15.0.0 (published 2026-02-10). CONTEXT.md says "v14 (or latest)". Use v15.0.0 — the API is compatible. [VERIFIED: npm registry]

**Installation:**
```bash
pnpm add tesseract.js sql.js react-dropzone pdf-lib pdfjs-dist
pnpm add -D tsx
```

**Scripts to add to package.json:**
```json
{
  "seed:phase-1": "tsx scripts/build-data/seed-phase-1.ts",
  "fixtures": "tsx scripts/build-fixtures/sample-bill.ts"
}
```

---

## Question 1: tesseract.js v7 Self-Hosting Strategy

### Current Version and API

tesseract.js v7.0.0 is the latest stable (published 2025-12-15). [VERIFIED: npm registry]

### Self-Hosting Files Required

Four `corePath` WASM files must be available at a directory URL:
1. `tesseract-core.wasm.js`
2. `tesseract-core-simd.wasm.js`
3. `tesseract-core-lstm.wasm.js`
4. `tesseract-core-simd-lstm.wasm.js`

Plus:
- `worker.min.js` (the tesseract.js worker script)
- `eng.traineddata.gz` (English language model, ~10MB)

[VERIFIED: github.com/naptha/tesseract.js/blob/master/docs/local-installation.md]

### Where to Put the Files

```
public/
└── tesseract/
    ├── worker.min.js            (copy from node_modules/tesseract.js/dist/)
    ├── tesseract-core.wasm.js   (copy from node_modules/tesseract.js-core/dist/)
    ├── tesseract-core-simd.wasm.js
    ├── tesseract-core-lstm.wasm.js
    ├── tesseract-core-simd-lstm.wasm.js
    └── lang/
        └── eng.traineddata.gz   (download from jsDelivr or tesseract.js lang repo)
```

Because these are in `public/`, Vite serves them as-is without fingerprinting. The service worker can cache them explicitly in Phase 5. They are NOT bundled into JS — they're served as separate URL-addressable files.

**Important:** Add `'tesseract/**'` to `globIgnores` in vite.config.ts to prevent the PWA service worker from auto-precaching large WASM files at install time (they total ~10MB+). Updated workbox config: `globIgnores: ['**/*.gguf', 'data/build/**', 'tesseract/**', 'sql-wasm.wasm']`.

### createWorker Configuration

```typescript
// src/lib/ocr/createOcrWorker.ts
import { createWorker } from 'tesseract.js'

const BASE = import.meta.env.BASE_URL  // '/hightimized/' in prod, '/' in dev

export async function createOcrWorker() {
  return createWorker('eng', 1, {
    workerPath: `${BASE}tesseract/worker.min.js`,
    langPath:   `${BASE}tesseract/lang`,
    corePath:   `${BASE}tesseract/`,
    // Do NOT set corePath to a specific .js file — library auto-selects based on device
    logger: (m) => {
      if (m.status === 'recognizing text') {
        // m.progress is 0..1 — feed to UI loading indicator
      }
    },
  })
}
```

### PDF Limitation

tesseract.js operates on images (canvas, ImageData, Uint8Array pixel data), not PDF bytestreams. PDF pages must be rendered to canvas via pdfjs-dist first. [VERIFIED: github.com/naptha/tesseract.js docs — no PDF input type listed; confirmed by canonical community pattern in Q5 below]

### Gotcha: Worker Blob URL

tesseract.js v5+ defaults `workerBlobURL: true`. This causes issues in some CSP environments. If the app later adds a strict CSP, add `workerBlobURL: false` to createWorker options. For Phase 1 (no CSP), the default is fine.

---

## Question 2: sql.js + Vite WASM Strategy

### Package

Use `sql.js` directly (not `@jlongster/sql.js`). CONTEXT.md says "sql.js directly, latest stable" and the canonical package is `sql.js`. [VERIFIED: npm registry — sql.js@1.14.1 published 2026-03-04]

### WASM File Delivery — Recommended Approach

Copy the WASM file to `public/` so it gets a stable, predictable URL:

```bash
# Run this once, or add to a postinstall script
cp node_modules/sql.js/dist/sql-wasm.wasm public/sql-wasm.wasm
```

Then reference it in the locateFile callback:

```typescript
// src/data-sources/sqliteClient.ts
import initSqlJs, { type SqlJsStatic } from 'sql.js'

const BASE = import.meta.env.BASE_URL  // '/hightimized/' in prod

let SQL: SqlJsStatic | null = null

export async function getSqlJs(): Promise<SqlJsStatic> {
  if (SQL) return SQL
  SQL = await initSqlJs({
    locateFile: (filename: string) => `${BASE}${filename}`,
    // resolves to '/hightimized/sql-wasm.wasm' in production
    // resolves to '/sql-wasm.wasm' in dev (BASE_URL = '/')
  })
  return SQL
}
```

**Alternative with `?url` import (also valid):**

```typescript
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
```

The `?url` approach lets Vite fingerprint the asset (cache-busting on deploy). The `public/` copy approach is simpler. Recommend the `public/` copy for predictability — consistent with the CONTEXT.md decision to commit `chargemaster.sqlite` to `data/build/`.

### Load a SQLite File from a URL

```typescript
// src/data-sources/chargemasterDb.ts
import type { Database, SqlJsStatic } from 'sql.js'
import { getSqlJs } from './sqliteClient'

let db: Database | null = null

export async function getChargemasterDb(sqliteAssetUrl: string): Promise<Database> {
  if (db) return db
  const SQL: SqlJsStatic = await getSqlJs()
  const response = await fetch(sqliteAssetUrl)
  const buffer = await response.arrayBuffer()
  db = new SQL.Database(new Uint8Array(buffer))
  return db
}
```

Usage in component:
```typescript
import sqliteUrl from '../../data/build/chargemaster.sqlite?url'
const chargeDb = await getChargemasterDb(sqliteUrl)
```

### Query Pattern

```typescript
export interface ChargemasterRow {
  cpt_code: string
  description: string
  hospital_published_rate: number
  regional_median: number
  medicare_allowable: number
}

export function lookupChargemaster(db: Database, cptCode: string): ChargemasterRow | null {
  const results = db.exec(
    'SELECT cpt_code, description, hospital_published_rate, regional_median, medicare_allowable FROM chargemaster WHERE cpt_code = ?',
    [cptCode],
  )
  if (!results.length || !results[0].values.length) return null
  const { columns, values } = results[0]
  return Object.fromEntries(columns.map((c, i) => [c, values[0][i]])) as ChargemasterRow
}
```

### Bundle Size Impact

The `sql-wasm.wasm` file is ~600KB compressed, ~1.5MB uncompressed. [VERIFIED: multiple sources + sql.js README]. It does NOT count against the PWA precache budget because it should be in `globIgnores`. It loads lazily on first `getSqlJs()` call.

---

## Question 3: react-dropzone v15

### Current Version

`react-dropzone@15.0.0` — published 2026-02-10. [VERIFIED: npm registry]
The CONTEXT.md says "v14 (or latest)" — v15 is the correct choice.

### Minimal TypeScript Component

```tsx
// src/components/DropZone/DropZone.tsx
import { useDropzone, type FileRejection } from 'react-dropzone'

interface DropZoneProps {
  onFileAccepted: (file: File) => void
  onFileRejected: (reason: string) => void
  isProcessing?: boolean
  isComplete?: boolean
}

export function DropZone({ onFileAccepted, onFileRejected, isProcessing, isComplete }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024,  // 50MB — hospital bills are rarely large
    onDropAccepted: (files: File[]) => onFileAccepted(files[0]),
    onDropRejected: (rejections: FileRejection[]) => {
      const code = rejections[0]?.errors[0]?.code
      if (code === 'file-invalid-type') onFileRejected('wrong-type')
      else if (code === 'file-too-large') onFileRejected('too-large')
      else onFileRejected('unknown')
    },
    disabled: isProcessing || isComplete,
    noClick: isComplete,  // collapsed state — user must drag, not click
  })

  return (
    <div
      {...getRootProps()}
      role="button"
      aria-label="Drop your hospital bill here, or press Enter to browse"
      tabIndex={0}
    >
      <input {...getInputProps()} aria-hidden="true" />
      {/* render states per UI-SPEC.md */}
    </div>
  )
}
```

**Key TypeScript types exported by react-dropzone:**
- `FileRejection` — `{ file: File; errors: FileError[] }`
- `FileError` — `{ message: string; code: ErrorCode }`
- `ErrorCode` — `'file-invalid-type' | 'file-too-large' | 'too-many-files' | 'file-too-small'`
- `accept` prop type — `Record<string, string[]>` (MIME type to extensions)

**Behavior with `multiple: false` and multiple files dropped:** All files are rejected with `'too-many-files'` error. Only one file at a time is accepted. [VERIFIED: react-dropzone issues #1060 and #458]

**Accessibility:** react-dropzone automatically handles `Enter`/`Space` key on the root element to open the native file picker via `getRootProps()`. The hidden `<input>` is what the browser uses for click-to-browse. [CITED: react-dropzone.js.org docs]

---

## Question 4: pdf-lib + StandardFonts for the Stub Letter

### Versions

- `pdf-lib@1.17.1` — last published 2022-05-12. Mature and stable; no updates needed. [VERIFIED: npm registry]
- `@pdf-lib/fontkit` — do NOT install for Phase 1. [VERIFIED: pdf-lib.js.org — "The @pdf-lib/fontkit module must be installed to embed custom fonts." StandardFonts are built in.]

### Complete Stub Letter Generator

```typescript
// src/lib/letter/generateDisputeLetter.ts
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'

export interface FlaggedLine {
  cptCode: string
  description: string
  charged: number
  publishedRate: number
  multiplier: number
}

export async function generateDisputeLetter(flaggedLines: FlaggedLine[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  const page = pdfDoc.addPage(PageSizes.Letter)  // 612 x 792 points
  const { width, height } = page.getSize()
  const margin = 72  // 1 inch margins
  const lineHeight = 14
  let y = height - margin

  const draw = (text: string, opts: { bold?: boolean; size?: number } = {}) => {
    page.drawText(text, {
      x: margin,
      y,
      size: opts.size ?? 11,
      font: opts.bold ? boldFont : font,
      color: rgb(0, 0, 0),
      maxWidth: width - margin * 2,
    })
    y -= lineHeight * (opts.size ? opts.size / 11 : 1)
  }

  const skip = (lines = 1) => { y -= lineHeight * lines }
  const today = new Date().toISOString().slice(0, 10)

  draw('[YOUR NAME]')
  draw('[YOUR ADDRESS]')
  draw('[CITY, STATE ZIP]')
  skip()
  draw(today)
  skip()
  draw('Billing Department')
  draw('Memorial Regional Medical Center')
  draw('[HOSPITAL ADDRESS]')
  skip()
  draw(`RE: Dispute of Charges — Itemized Bill Dated ${today}`, { bold: true })
  skip()
  draw('Dear Billing Department,')
  skip()

  for (const line of flaggedLines) {
    const amt  = `$${line.charged.toFixed(2)}`
    const pub  = `$${line.publishedRate.toFixed(2)}`
    const diff = `$${(line.charged - line.publishedRate).toFixed(2)}`
    const mult = line.multiplier.toFixed(1)

    draw(`I am writing to dispute the charge for CPT code ${line.cptCode} (${line.description}).`)
    draw(`My bill shows a charge of ${amt}. Memorial Regional Medical Center's own publicly-posted`)
    draw(`chargemaster lists the rate for CPT ${line.cptCode} at ${pub} — a difference of ${diff},`)
    draw(`or ${mult} times the published rate.`)
    skip()
  }

  draw('Under 45 CFR §180 (Hospital Price Transparency Final Rule), hospitals are required to publish')
  draw('their standard charges for all items and services. I am requesting an immediate review and')
  draw('correction of the above line items to reflect the published rates, or a written explanation')
  draw('of the billing discrepancy within 30 days.')
  skip()
  draw('This letter is sent in good faith. I expect a written response within 30 days of receipt.')
  skip(2)
  draw('Sincerely,')
  skip(3)
  draw('_____________________________')
  draw('[YOUR NAME]')
  draw('[YOUR PHONE / EMAIL]')

  page.drawText(
    'This letter was generated by hightimized (hightimized.com), an open-source audit-assist tool. It is not legal advice.',
    { x: margin, y: margin / 2, size: 8, font, color: rgb(0.5, 0.5, 0.5), maxWidth: width - margin * 2 },
  )

  return pdfDoc.save()
}
```

**Download trigger (in component):**
```typescript
async function handleGenerateLetter() {
  const bytes = await generateDisputeLetter(flaggedLines)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hightimized-dispute-${new Date().toISOString().slice(0, 10)}.pdf`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
```

---

## Question 5: PDF-to-Canvas Pipeline for OCR

### Library Choice

`pdfjs-dist@5.7.284` (published 2026-04-27 — very recent, actively maintained). [VERIFIED: npm registry]

**Why not react-pdf:** react-pdf wraps pdfjs-dist with a React rendering layer. We only need the `getDocument` → canvas path. Using pdfjs-dist directly is lighter and more explicit. [ASSUMED]

### Vite Worker URL Strategy

```typescript
import * as pdfjs from 'pdfjs-dist'

// Recommended: new URL() with import.meta.url — Vite handles this as a static asset
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()
```

This resolves correctly in both dev and production builds. [VERIFIED: github.com/mozilla/pdf.js/discussions/19520]

**Alternative `?url` import:**
```typescript
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
```

Both work. Use the `new URL()` approach — it matches the pdfjs official recommendation.

### Complete PDF-to-Canvas-to-OCR Pipeline

```typescript
// src/lib/ocr/ocrPdf.ts
import * as pdfjs from 'pdfjs-dist'
import { createWorker } from 'tesseract.js'

// Set once at module scope
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const BASE = import.meta.env.BASE_URL

export async function ocrFirstPageOfPdf(
  pdfFile: File,
  onProgress?: (p: number) => void,
): Promise<string> {
  // Step 1: PDF byte stream → canvas
  const buffer = await pdfFile.arrayBuffer()
  const pdfDoc = await pdfjs.getDocument({ data: buffer }).promise
  const page = await pdfDoc.getPage(1)                   // Phase 1: page 1 only
  const viewport = page.getViewport({ scale: 2.0 })      // 2x scale for OCR accuracy

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!

  await page.render({ canvasContext: ctx, viewport }).promise

  // Step 2: canvas → OCR text
  const worker = await createWorker('eng', 1, {
    workerPath: `${BASE}tesseract/worker.min.js`,
    langPath:   `${BASE}tesseract/lang`,
    corePath:   `${BASE}tesseract/`,
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress as number)
      }
    },
  })

  const { data: { text } } = await worker.recognize(canvas)
  await worker.terminate()

  return text
}
```

**Note on scale:** `scale: 2.0` gives 144 DPI equivalent (72 DPI native x 2). tesseract.js accuracy improves significantly at this scale for printed bill text. [CITED: simonwillison.net/2024/Mar/30/ocr-pdfs-images/ and multiple 2024-2025 implementations recommending 2x or 3x]

**Note on pdfjs-dist WASM:** pdfjs v5 ships its own WASM files for advanced rendering. For Phase 1's synthetic single-page plain-text PDF, the default JS renderer works fine — no extra WASM config needed. [ASSUMED — based on pdfjs architecture; may need verification on real-world scanned PDFs in Phase 2]

---

## Question 6: CPT/HCPCS Line-Item Parser Strategy

### Code Formats

- **CPT codes** (AMA): 5 digits — `99213`, `85025`
- **HCPCS Level II** (CMS, public domain): letter + 4 digits — `J3490`, `A1234`, `G0008`

[VERIFIED: CMS HCPCS Level II format documentation]

### Regex-Only Parser for Phase 1

```typescript
// src/lib/auditor/parseBillText.ts

export interface LineItem {
  cptCode: string
  description: string
  charge: number
  rawLine: string
}

/**
 * Extracts CPT/HCPCS line items from OCR text.
 * Phase 1: regex-only. Phase 2 adds fuzzy matching and manual correction.
 *
 * Targets bill format:
 *   99213   Office visit, est. patient, low complexity   $750.00
 *   J3490   Unclassified injection                       $200.00
 */
const LINE_ITEM_RE = /^([A-Z]\d{4}|\d{5})\s+(.+?)\s+\$?(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\s*$/gm

export function parseBillText(ocrText: string): LineItem[] {
  const items: LineItem[] = []
  let match: RegExpExecArray | null

  LINE_ITEM_RE.lastIndex = 0  // reset stateful regex before each call

  while ((match = LINE_ITEM_RE.exec(ocrText)) !== null) {
    const [rawLine, cptCode, description, chargeStr] = match
    const charge = parseFloat(chargeStr.replace(',', ''))
    if (!isNaN(charge)) {
      items.push({ cptCode, description: description.trim(), charge, rawLine })
    }
  }

  return items
}
```

### Edge Case Handling Table

| Edge Case | Example | Handling |
|-----------|---------|---------|
| Currency with comma | `$1,250.00` | `chargeStr.replace(',', '')` before parseFloat |
| Dollar sign optional | `750.00` | `\$?` in regex |
| Trailing whitespace | OCR whitespace noise | `.trim()` on description |
| HCPCS J-code | `J3490` | `[A-Z]\d{4}` branch |
| Line continuation | OCR wraps long text | Phase 1 won't handle; fixture uses short descriptions |
| Blank lines / headers | OCR noise | `^` anchor — non-matching lines skipped |

### Fixture Validation

The synthetic fixture PDF (Q9) must produce OCR text where these exact three lines match:
```
99213   Office visit, est. patient, low complexity   $750.00
85025   Complete blood count w/ diff                  $80.00
J3490   Unclassified injection                       $200.00
```

---

## Question 7: Single-Row sql.js Seed Strategy

### Seed Script

```typescript
// scripts/build-data/seed-phase-1.ts
import initSqlJs from 'sql.js'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

async function seedPhase1() {
  const SQL = await initSqlJs()
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE chargemaster (
      cpt_code                TEXT PRIMARY KEY,
      description             TEXT NOT NULL,
      hospital_published_rate REAL NOT NULL,
      regional_median         REAL NOT NULL,
      medicare_allowable      REAL NOT NULL
    )
  `)

  db.run(
    'INSERT INTO chargemaster VALUES (?, ?, ?, ?, ?)',
    ['99213', 'Office visit, est. patient, low complexity', 187.50, 198.00, 92.40],
  )

  const data = db.export()
  const outputPath = resolve('data/build/chargemaster.sqlite')
  writeFileSync(outputPath, Buffer.from(data))
  console.log(`Seeded chargemaster.sqlite at ${outputPath}`)
  db.close()
}

seedPhase1().catch(console.error)
```

Run with: `pnpm seed:phase-1`

### .gitignore Exception

`data/build/` is currently in `.gitignore` (from Phase 0). Add an exception to commit the Phase 1 seed:

```gitignore
data/build/
!data/build/chargemaster.sqlite
```

The committed `chargemaster.sqlite` is ~20KB. Phase 2 replaces this file with the real CMS pipeline output and the exception can be removed.

---

## Question 8: Flagger Logic for Phase 1

### Pure TypeScript Function

```typescript
// src/lib/auditor/flagLine.ts

export interface ChargemasterRow {
  cpt_code: string
  description: string
  hospital_published_rate: number
  regional_median: number
  medicare_allowable: number
}

export interface FlagResult {
  rule: 'charge_exceeds_1_5x_published_rate'
  charged: number
  comparisonRate: number
  multiplier: number              // charged / comparisonRate, rounded to 1 decimal
  plainEnglishMultiplier: string  // 'FOUR' for whole numbers, '4.3' for fractions
}

/**
 * Phase 1 implements rule 1 only.
 * Returns null if no flag fires.
 * Phase 2 adds rule 2: charge > 2x medicare_allowable.
 */
export function flagLine(charge: number, row: ChargemasterRow): FlagResult | null {
  const THRESHOLD = 1.5

  if (charge > THRESHOLD * row.hospital_published_rate) {
    const multiplier = charge / row.hospital_published_rate
    return {
      rule: 'charge_exceeds_1_5x_published_rate',
      charged: charge,
      comparisonRate: row.hospital_published_rate,
      multiplier: Math.round(multiplier * 10) / 10,
      plainEnglishMultiplier: toEnglishMultiplier(multiplier),
    }
  }

  return null
}

const WHOLE_NUMBERS = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE',
  'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
]

function toEnglishMultiplier(n: number): string {
  const rounded = Math.round(n)
  if (Math.abs(n - rounded) < 0.05 && rounded < WHOLE_NUMBERS.length) {
    return WHOLE_NUMBERS[rounded]
  }
  return (Math.round(n * 10) / 10).toString()
}
```

### Deterministic Test Cases

```typescript
// flagLine(750.00, { hospital_published_rate: 187.50 })
// → multiplier: 4.0, plainEnglishMultiplier: 'FOUR'

// flagLine(187.50 * 1.5, mockRow)  // exactly 1.5x — strict greater-than
// → null (281.25 is NOT > 281.25)

// flagLine(187.50 * 1.5 + 0.01, mockRow)
// → flags (281.26 > 281.25)
```

**Note on 85025 and J3490:** Only the `99213` row exists in the Phase 1 DB. `lookupChargemaster` returns `null` for the other two codes. The flagger never fires for them. Only `99213` flags — the "screenshot moment."

---

## Question 9: Synthetic Fixture Bill PDF

### Generate via Script — Source of Truth is Code

```typescript
// scripts/build-fixtures/sample-bill.ts
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

async function generateSampleBill() {
  const pdfDoc = await PDFDocument.create()
  const font     = await pdfDoc.embedFont(StandardFonts.Courier)
  const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold)

  const page = pdfDoc.addPage([612, 792])
  const { height } = page.getSize()
  const margin = 72
  let y = height - margin

  const draw = (text: string, bold = false) => {
    page.drawText(text, {
      x: margin, y, size: 11,
      font: bold ? boldFont : font,
    })
    y -= 16
  }
  const skip = () => { y -= 10 }

  draw('MEMORIAL REGIONAL MEDICAL CENTER', true)
  draw('123 Hospital Drive, Springfield, ST 00000')
  draw('Patient Billing Office: (555) 000-0000')
  skip()
  draw('ITEMIZED STATEMENT', true)
  draw('Patient: [PATIENT NAME]')
  draw('Account: 000000000')
  draw('Statement Date: 2024-03-15')
  skip()
  draw('─'.repeat(65))
  skip()
  draw('CODE    DESCRIPTION                              CHARGE', true)
  draw('─'.repeat(65))
  skip()

  // These three lines are exactly what the Phase 1 regex targets
  draw('99213   Office visit, est. patient, low complexity   $750.00')
  draw('85025   Complete blood count w/ diff                  $80.00')
  draw('J3490   Unclassified injection                       $200.00')
  skip()
  draw('─'.repeat(65))
  draw('TOTAL                                              $1,030.00', true)
  skip()
  draw('Please review this statement and contact billing with questions.')

  const bytes = await pdfDoc.save()
  mkdirSync('tests/fixtures', { recursive: true })
  writeFileSync(resolve('tests/fixtures/sample-bill.pdf'), Buffer.from(bytes))
  console.log('Generated tests/fixtures/sample-bill.pdf')
}

generateSampleBill().catch(console.error)
```

**Why Courier:** Monospaced font produces the most OCR-friendly output from tesseract.js — uniform character spacing, well-separated letterforms, matches typical printed bill format.

**Why generate via script:** The `.pdf` binary is derived from code. Run `pnpm fixtures` to regenerate. Commit the output artifact for CI tests.

**OCR accuracy expectation:** tesseract.js on a clean machine-generated Courier PDF at scale 2x will produce near-100% accurate text for these simple lines. [ASSUMED — based on community reports of tesseract.js accuracy on vector PDFs]

---

## Question 10: Vitest + RTL Testing Patterns

### Mock Strategy for tesseract.js

Never run real OCR in unit tests — it requires WASM files from `public/tesseract/` and takes 3-10 seconds. Mock the entire OCR wrapper:

```typescript
// At top of test file
vi.mock('../../lib/ocr/ocrPdf', () => ({
  ocrFirstPageOfPdf: vi.fn().mockResolvedValue(
    '99213   Office visit, est. patient, low complexity   $750.00\n' +
    '85025   Complete blood count w/ diff                  $80.00\n' +
    'J3490   Unclassified injection                       $200.00',
  ),
}))
```

### Mock Strategy for sql.js

Mock the chargemaster lookup module entirely — simpler than initializing WASM in jsdom:

```typescript
vi.mock('../../data-sources/chargemasterDb', () => ({
  getChargemasterDb: vi.fn().mockResolvedValue({
    exec: vi.fn().mockReturnValue([{
      columns: ['cpt_code', 'description', 'hospital_published_rate', 'regional_median', 'medicare_allowable'],
      values: [['99213', 'Office visit, est. patient, low complexity', 187.50, 198.00, 92.40]],
    }]),
  }),
}))
```

### DropZone Test Pattern

```tsx
// src/components/DropZone/DropZone.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DropZone } from './DropZone'

function mockDropEvent(files: File[]) {
  return {
    dataTransfer: {
      files,
      items: files.map((f) => ({ kind: 'file', type: f.type, getAsFile: () => f })),
      types: ['Files'],
    },
  }
}

test('calls onFileAccepted with the dropped PDF file', () => {
  const onAccepted = vi.fn()
  const onRejected = vi.fn()
  render(<DropZone onFileAccepted={onAccepted} onFileRejected={onRejected} />)

  const file = new File(['%PDF-1.4'], 'bill.pdf', { type: 'application/pdf' })
  fireEvent.drop(screen.getByRole('button'), mockDropEvent([file]))

  expect(onAccepted).toHaveBeenCalledWith(file)
  expect(onRejected).not.toHaveBeenCalled()
})

test('calls onFileRejected for non-PDF files', () => {
  const onAccepted = vi.fn()
  const onRejected = vi.fn()
  render(<DropZone onFileAccepted={onAccepted} onFileRejected={onRejected} />)

  const file = new File(['data'], 'bill.jpg', { type: 'image/jpeg' })
  fireEvent.drop(screen.getByRole('button'), mockDropEvent([file]))

  expect(onRejected).toHaveBeenCalledWith('wrong-type')
  expect(onAccepted).not.toHaveBeenCalled()
})
```

[VERIFIED: github.com/react-dropzone/react-dropzone/discussions/1258 — `fireEvent.drop` with `dataTransfer` mock is the canonical approach]

### FlagBadge Test

```tsx
test('renders flag badge with correct multiplier', () => {
  render(<FlagBadge multiplier={4.0} />)
  expect(screen.getByText(/4\.0×/)).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveAttribute(
    'aria-label',
    'Overcharge flag: 4.0 times hospital published rate',
  )
})
```

### GenerateLetterButton Tests

```tsx
test('button is disabled when no flagged lines', () => {
  render(<GenerateLetterButton flaggedCount={0} onGenerate={vi.fn()} />)
  const btn = screen.getByRole('button')
  expect(btn).toHaveAttribute('aria-disabled', 'true')
  expect(btn).toHaveTextContent('No overcharges to dispute.')
})

test('button is active when flagged lines exist', () => {
  render(<GenerateLetterButton flaggedCount={1} onGenerate={vi.fn()} />)
  const btn = screen.getByRole('button')
  expect(btn).not.toHaveAttribute('aria-disabled', 'true')
  expect(btn).toHaveTextContent('Generate dispute letter')
})
```

### flagLine Unit Tests (no DOM needed)

```typescript
// src/lib/auditor/flagLine.test.ts
import { flagLine } from './flagLine'

const mockRow = {
  cpt_code: '99213',
  description: 'Office visit',
  hospital_published_rate: 187.50,
  regional_median: 198.00,
  medicare_allowable: 92.40,
}

test('flags 99213 at $750 — 4x rate', () => {
  const result = flagLine(750.00, mockRow)
  expect(result).not.toBeNull()
  expect(result!.multiplier).toBe(4.0)
  expect(result!.plainEnglishMultiplier).toBe('FOUR')
})

test('does not flag at exactly 1.5x rate', () => {
  const result = flagLine(187.50 * 1.5, mockRow)  // 281.25 is NOT > 281.25
  expect(result).toBeNull()
})

test('flags at 1.5x + 0.01', () => {
  const result = flagLine(187.50 * 1.5 + 0.01, mockRow)
  expect(result).not.toBeNull()
})
```

---

## Question 11: State Management

### Recommendation: useReducer in App.tsx

Single page, no router, no cross-tree state. `useState` + `useReducer` in App.tsx is correct. No Zustand, no Redux. [ASSUMED — standard React architecture for single-page single-tree apps]

```typescript
// src/App.tsx — state machine types

type AuditStatus =
  | { phase: 'idle' }
  | { phase: 'ocr-loading'; progress: number }
  | { phase: 'parsing' }
  | { phase: 'audited'; lineItems: AuditedLine[]; flaggedCount: number }
  | { phase: 'letter-ready' }

type AuditAction =
  | { type: 'FILE_ACCEPTED'; file: File }
  | { type: 'OCR_PROGRESS'; progress: number }
  | { type: 'OCR_COMPLETE'; text: string }
  | { type: 'AUDIT_COMPLETE'; lineItems: AuditedLine[] }
  | { type: 'OCR_ERROR'; message: string }
  | { type: 'LETTER_GENERATING' }
  | { type: 'LETTER_COMPLETE' }
  | { type: 'RESET' }

function auditReducer(state: AuditStatus, action: AuditAction): AuditStatus {
  switch (action.type) {
    case 'FILE_ACCEPTED':     return { phase: 'ocr-loading', progress: 0 }
    case 'OCR_PROGRESS':      return { phase: 'ocr-loading', progress: action.progress }
    case 'OCR_COMPLETE':      return { phase: 'parsing' }
    case 'AUDIT_COMPLETE':    return {
      phase: 'audited',
      lineItems: action.lineItems,
      flaggedCount: action.lineItems.filter((l) => l.flag).length,
    }
    case 'LETTER_COMPLETE':   return { phase: 'letter-ready' }
    case 'RESET':             return { phase: 'idle' }
    default:                  return state
  }
}
```

**Error state:** Errors are rendered via `ToastError`, managed with a separate `useState<{ message: string } | null>(null)`. Errors do not change the reducer state — user can retry after dismissing the toast.

---

## Question 12: Accessibility Patterns

### Key Patterns (from UI-SPEC.md and WCAG 2.2 AA)

**1. DropZone keyboard nav** — react-dropzone handles `Enter`/`Space` automatically via `getRootProps()`. No extra code needed. [CITED: react-dropzone.js.org]

**2. Focus management on state transitions** — when the DropZone collapses after OCR completes and the LineItemList appears, move focus to the first card:

```typescript
const firstCardRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (status.phase === 'audited' && firstCardRef.current) {
    firstCardRef.current.focus()
  }
}, [status.phase])
```

**3. Screen-reader live regions** — LineItemList container: `aria-live="polite"`. FlagBadge: `role="status"`. ToastError: `role="alert"` + `aria-live="assertive"`.

**4. TraceDetail hidden state** — use the HTML `hidden` attribute, not CSS `display: none`, to correctly hide from assistive technology. `aria-expanded` on the parent card controls the toggle:

```tsx
<div
  id={`trace-${cptCode}`}
  role="region"
  aria-label={`Rule trace for CPT ${cptCode}`}
  hidden={!isExpanded}
>
  {/* trace content */}
</div>
```

**5. GenerateLetterButton aria-disabled** — use `aria-disabled` (not the `disabled` attribute) to keep the element focusable and let screen readers read the disabled-state copy. [CITED: UI-SPEC.md]

**6. Reduced motion** — wrap all CSS keyframe animations in `@media (not (prefers-reduced-motion: reduce))` or use the inverse disable block from UI-SPEC.md.

---

## Architecture Patterns

### Component File Structure

```
src/
├── components/
│   ├── DropZone/
│   │   ├── DropZone.tsx
│   │   ├── DropZone.module.css
│   │   └── DropZone.test.tsx
│   ├── LineItemCard/
│   │   ├── LineItemCard.tsx
│   │   └── LineItemCard.module.css
│   ├── FlagBadge/
│   │   ├── FlagBadge.tsx
│   │   ├── FlagBadge.module.css
│   │   └── FlagBadge.test.tsx
│   ├── TraceDetail/
│   │   ├── TraceDetail.tsx
│   │   └── TraceDetail.module.css
│   ├── GenerateLetterButton/
│   │   ├── GenerateLetterButton.tsx
│   │   ├── GenerateLetterButton.module.css
│   │   └── GenerateLetterButton.test.tsx
│   ├── PrivacyBanner/
│   │   ├── PrivacyBanner.tsx
│   │   └── PrivacyBanner.module.css
│   └── ToastError/
│       ├── ToastError.tsx
│       └── ToastError.module.css
├── lib/
│   ├── ocr/
│   │   └── ocrPdf.ts
│   ├── auditor/
│   │   ├── flagLine.ts
│   │   ├── flagLine.test.ts
│   │   └── parseBillText.ts
│   └── letter/
│       └── generateDisputeLetter.ts
├── data-sources/
│   ├── sqliteClient.ts
│   └── chargemasterDb.ts
├── App.tsx
└── App.test.tsx
```

### Data Flow

```
File drop
  DropZone (react-dropzone) → onFileAccepted(file)
    App dispatch FILE_ACCEPTED
      ocrFirstPageOfPdf(file)
        pdfjs: PDF → canvas
        tesseract: canvas → text
      App dispatch OCR_COMPLETE
        parseBillText(text) → LineItem[]
        for each item: lookupChargemaster(db, code) → ChargemasterRow or null
        for each item + row: flagLine(charge, row) → FlagResult or null
      App dispatch AUDIT_COMPLETE
        render LineItemCards with FlagBadges
        enable/disable GenerateLetterButton

GenerateLetterButton click
  generateDisputeLetter(flaggedLines) → Uint8Array
  URL.createObjectURL → <a download> click
  setTimeout revokeObjectURL 30s
```

### Anti-Patterns to Avoid

- **Running real OCR in Vitest tests.** tesseract.js WASM requires browser-like environment and network file access — will fail or be extremely slow in jsdom. Always mock `src/lib/ocr/ocrPdf.ts` in tests.
- **Setting `corePath` to a specific `.js` file.** tesseract.js auto-selects between 4 WASM variants based on device capabilities. Pointing to one file breaks SIMD support. Always point to a directory.
- **Precaching WASM files in vite-plugin-pwa.** sql-wasm.wasm, tesseract WASM files, and pdfjs worker should all be in `globIgnores`. They are large and loaded lazily.
- **`import pdfWorker from 'pdfjs-dist/build/pdf.worker.js'` (CJS path).** pdfjs-dist v5 is ESM-only — use `.mjs` extension. [VERIFIED: pdfjs-dist exports map]
- **Forgetting db.close() on the sql.js Database.** sql.js leaks memory if not closed. Use a singleton pattern (Q2 above) to avoid multiple open instances.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF drop plus accessibility | Custom drag event listener | react-dropzone | ARIA, keyboard, touch, multi-browser drag API differences, file type validation |
| PDF rendering to canvas | Canvas API reading raw PDF bytes | pdfjs-dist | PDF format complexity: fonts, images, compression, encryption |
| OCR text extraction | Canvas pixel processing | tesseract.js | ML model, LSTM neural net, multi-language, WASM optimization |
| SQLite in browser | IndexedDB key-value shim | sql.js | Full SQL, joins, indexes, standard SQLite file format |
| PDF generation | Canvas/SVG serialization | pdf-lib | PDF spec compliance, font embedding, page sizes, byte streams |

---

## Common Pitfalls

### Pitfall 1: tesseract.js WASM Files Not Copied to public/

**What goes wrong:** `createWorker` hangs or throws "Failed to fetch" for `worker.min.js` or WASM core files.
**Why it happens:** The files in `node_modules/tesseract.js/dist/` and `node_modules/tesseract.js-core/dist/` are not automatically served by Vite. They must be physically copied to `public/tesseract/`.
**How to avoid:** Add a `postinstall` or `prebuild` script that copies these files. Or commit them via a one-time manual copy.
**Warning signs:** `createWorker` never resolves; browser DevTools shows 404 on `worker.min.js`.

### Pitfall 2: pdfjs-dist Worker 404 in Production Build

**What goes wrong:** PDF.js logs "Setting up fake worker failed" and rendering degrades.
**Why it happens:** The `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` pattern resolves in dev but may not copy the worker to `dist/` on all Vite versions.
**How to avoid:** After `pnpm build`, verify `dist/` contains `pdf.worker.min.mjs`. If missing, add a `cp` step in the build script.
**Warning signs:** Builds succeed locally, fail after GitHub Pages deploy.

### Pitfall 3: sql.js locateFile Returns Wrong Path Under /hightimized/ Base

**What goes wrong:** `sql-wasm.wasm` 404s in production because `locateFile` is hardcoded to `/sql-wasm.wasm` instead of `/hightimized/sql-wasm.wasm`.
**Why it happens:** Vite injects `BASE_URL` at build time. If `locateFile` hardcodes `/`, it breaks on GitHub Pages.
**How to avoid:** Always use `import.meta.env.BASE_URL` in the `locateFile` callback. [VERIFIED: vite.dev/guide/env-and-mode]
**Warning signs:** sql.js init throws in production; DevTools shows GET `/sql-wasm.wasm` 404.

### Pitfall 4: tesseract.js Worker Terminated Early During Long OCR

**What goes wrong:** Race condition — `worker.terminate()` called before `recognize()` completes.
**Why it happens:** If the user drops a new file while OCR is running.
**How to avoid:** The `ocr-loading` phase in the reducer disables the DropZone (`disabled` prop). Only call `worker.terminate()` in the `finally` block of the async OCR function.

### Pitfall 5: pdf-lib drawText Overflows Page

**What goes wrong:** Long description strings overflow the right margin silently — pdf-lib does not auto-wrap. Text runs off the page.
**How to avoid:** Always pass `maxWidth: width - margin * 2` to `drawText`. The `generateDisputeLetter` code above includes this.

### Pitfall 6: Regex lastIndex Not Reset Between parseBillText Calls

**What goes wrong:** `LINE_ITEM_RE.exec(text)` returns null on the second call because the global regex's `lastIndex` is stuck at end-of-string.
**Why it happens:** JavaScript global-flag RegExp instances are stateful — `lastIndex` persists across `.exec()` calls.
**How to avoid:** Reset `LINE_ITEM_RE.lastIndex = 0` at the top of `parseBillText`. Code in Q6 shows this pattern.

### Pitfall 7: PWA Service Worker Tries to Precache WASM Files

**What goes wrong:** First-time users see a blank screen; the service worker install step fails because WASM files exceed `maximumFileSizeToCacheInBytes`.
**How to avoid:** Add to vite.config.ts workbox config:
```
globIgnores: ['**/*.gguf', 'data/build/**', 'tesseract/**', 'sql-wasm.wasm']
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| pnpm | Package manager | YES | 10.29.3 | — |
| node | tsx scripts | YES | 25.9.0 | — |
| tsx (to add) | seed + fixtures scripts | NO — must install | — | `pnpm add -D tsx` |
| tesseract WASM files | OCR | In node_modules after install | Via tesseract.js-core | Copy to public/tesseract/ |
| sql-wasm.wasm | sql.js | In node_modules after install | sql.js 1.14.1 | Copy to public/ |
| pdfjs worker .mjs | pdfjs-dist | In node_modules after install | pdfjs-dist 5.7.284 | Handled by new URL() |

**Missing dependencies with no fallback:** None — all installable via pnpm.

**Required setup step before first run:** Copy WASM/worker files from `node_modules/` to `public/` (Pitfall 1). Add as `postinstall` or `prebuild` script.

---

## Validation Architecture

### Test Framework (from Phase 0)

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 |
| Config file | `vitest.config.ts` (already exists) |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm test:run --coverage` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INGEST-01 | File drop triggers onFileAccepted | unit/RTL | `pnpm test:run src/components/DropZone` | Wave 0 |
| INGEST-01 | Wrong type triggers onFileRejected | unit/RTL | same | Wave 0 |
| OCR-01 | ocrFirstPageOfPdf called with file, returns text | unit (mocked) | `pnpm test:run src/lib/ocr` | Wave 0 |
| OCR-02 | parseBillText extracts 3 items from fixture text | unit | `pnpm test:run src/lib/auditor` | Wave 0 |
| OCR-02 | flagLine returns flag for 99213 at $750 | unit | same | Wave 0 |
| LETTER-01 | generateDisputeLetter returns Uint8Array | unit | `pnpm test:run src/lib/letter` | Wave 0 |
| — | GenerateLetterButton disabled at 0 flags | unit/RTL | `pnpm test:run src/components/GenerateLetterButton` | Wave 0 |
| — | App: full flow from drop to audited state | integration (mocked) | `pnpm test:run src/App.test` | Wave 0 |

### Wave 0 Gaps (new test files to create)

- [ ] `src/components/DropZone/DropZone.test.tsx`
- [ ] `src/components/FlagBadge/FlagBadge.test.tsx`
- [ ] `src/components/GenerateLetterButton/GenerateLetterButton.test.tsx`
- [ ] `src/lib/auditor/flagLine.test.ts`
- [ ] `src/lib/auditor/parseBillText.test.ts`
- [ ] `src/lib/letter/generateDisputeLetter.test.ts`
- [ ] `src/lib/ocr/ocrPdf.test.ts` (mocked)
- [ ] `src/App.test.tsx` (integration, all external libs mocked)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | pdfjs-dist bundle is ~500KB gz for main plus ~500KB for worker | Q5 | Low — affects perf budget estimates only; does not block implementation |
| A2 | tesseract.js at scale 2x on machine-generated Courier PDF produces near-100% accurate OCR | Q9 | Medium — if accuracy is lower, fixture PDF may need higher scale or adjusted line format |
| A3 | pdfjs-dist v5 JS-only renderer works for Phase 1 synthetic single-page PDF | Q5 | Low — synthetic PDF uses basic content only; no complex fonts, images, or encryption |
| A4 | Committing tesseract.js-core WASM files to public/ is acceptable (they total ~10MB) | Q1 | Medium — repo size impact; alternative is postinstall download script which adds network dep to CI |
| A5 | react-pdf is heavier than raw pdfjs-dist for the canvas-only use case | Q5 | Low — react-pdf adds React rendering wrapper not needed here |

---

## Open Questions (RESOLVED)

1. **tesseract.js-core WASM file size in public/** — RESOLVED: commit tesseract WASM directly to `public/tesseract/` for Phase 1; Phase 5 revisits when service worker precache budget matters.
   - What we know: 4 WASM files + worker.min.js + eng.traineddata.gz total ~10MB.
   - What is unclear: Committing 10MB to git slows `git clone` and occupies GitHub storage. Alternative: `postinstall` downloads from jsDelivr CDN.
   - Recommendation: For Phase 1 (solo dev, no contributors), commit to `public/tesseract/` and add to `.gitignore` exception. Phase 5 (PWA polish) can migrate to a postinstall download script when the repo is public.

2. **vite-plugin-pwa globIgnores after adding public/tesseract/** — RESOLVED: Plan 01 already specifies the exact globIgnores pattern: `['**/*.gguf', 'data/build/**', 'tesseract/**']`. Verify after first `pnpm build`.
   - What we know: Current config has `globIgnores: ['**/*.gguf', 'data/build/**']`.
   - What is unclear: Whether `'tesseract/**'` correctly excludes `public/tesseract/` files from the SW precache in Workbox. Pattern is relative to the output root.
   - Recommendation: Add `'tesseract/**'` and `'sql-wasm.wasm'` to `globIgnores`. Verify after `pnpm build` that `sw.js` does not list these files.

---

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`) — all package versions and publish dates verified 2026-04-28
- github.com/naptha/tesseract.js/blob/master/docs/local-installation.md — self-hosting file list
- github.com/naptha/tesseract.js/blob/master/docs/api.md — createWorker options
- pdf-lib.js.org — StandardFonts.TimesRoman, fontkit requirement, drawText API
- github.com/react-dropzone/react-dropzone/discussions/1258 — RTL fireEvent.drop testing pattern
- github.com/mozilla/pdf.js/discussions/19520 — Vite workerSrc resolution pattern

### Secondary (MEDIUM confidence)
- tarkarn.com/blog/pdfjs-rendering-guide — pdfjs-dist v5 import, GlobalWorkerOptions, canvas render
- recca0120.github.io/en/2026/03/04/sql-js-browser-sqlite/ — sql.js Vite config, March 2026
- simonwillison.net/2024/Mar/30/ocr-pdfs-images/ — 2x scale recommendation for OCR
- dev.to/helloashish99/ocr-in-the-browser — pdfjs + tesseract.js pipeline confirmation

### Tertiary (LOW confidence)
- Bundle size estimates for pdfjs-dist (~500KB) — [ASSUMED], not from official benchmark
- tesseract.js OCR accuracy on machine-generated PDFs — [ASSUMED], community-reported

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — all verified via `npm view` on 2026-04-28
- tesseract.js self-host pattern: HIGH — verified against official local-installation.md
- sql.js Vite integration: HIGH — official README + 2026 community guide
- pdf-lib API: HIGH — verified at pdf-lib.js.org
- pdfjs-dist Vite worker pattern: HIGH — verified at mozilla/pdf.js discussions
- react-dropzone API: MEDIUM — official docs page returned no content; API derived from GitHub discussions + npm package
- Bundle size estimates: LOW — assumed from community reports, not official benchmarks

**Research date:** 2026-04-28
**Valid until:** 2026-07-28 (stable deps — pdf-lib, react-dropzone, sql.js have not released major versions in 12+ months; pdfjs-dist and tesseract.js are actively maintained)

---

## RESEARCH COMPLETE
