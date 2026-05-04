<div align="center">
<img src="https://raw.githubusercontent.com/ByteWorthyLLC/hightimized/main/.github/assets/hightimized-hero.svg" alt="hightimized: audit your hospital bill" width="100%">

<br />

[![License](https://img.shields.io/badge/license-MIT-2563EB?style=for-the-badge&labelColor=0F172A)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/ByteWorthyLLC/hightimized/ci.yml?branch=main&style=for-the-badge&labelColor=0F172A&label=CI)](https://github.com/ByteWorthyLLC/hightimized/actions/workflows/ci.yml)
[![Live demo](https://img.shields.io/badge/try_it-live_demo-F59E0B?style=for-the-badge&labelColor=0F172A)](https://byteworthyllc.github.io/hightimized)

**They charged you high. Get it itemized.**

[**Try the live demo**](https://byteworthyllc.github.io/hightimized) · No install, no account, no upload.

</div>

---

## What it does

hightimized audits your hospital bill against the hospital's own publicly-mandated chargemaster, flags every line where they charged more than federal law allows, and generates a certified-mail-ready dispute letter citing the exact regulation they violated.

**Your data never leaves your device.** OCR runs in the browser. Chargemaster data is bundled. The dispute letter renders locally. Nothing is sent anywhere — ever.

### How it works

1. **Drop in a hospital bill** — PDF or image, drag-and-drop or file picker
2. **In-browser OCR** extracts every line item (Tesseract.js, no server)
3. **Chargemaster audit** — bundled CMS data flags overcharges automatically
4. **Plain-English explanation** per flagged line — what they charged vs. what the chargemaster says
5. **Dispute letter** citing 45 CFR §180, No Surprises Act, and your state's UDAP statute
6. **Download the PDF** — print, sign, certified-mail it

> **Privacy guarantee:** Zero upload. No accounts. No telemetry. No analytics. Bill history stored only in your browser's IndexedDB. One-tap wipe. Export as encrypted JSON for portability.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (everything runs here)                 │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Drop Zone│→ │ OCR      │→ │ Bill Parser  │  │
│  │ (PDF/img)│  │ Tesseract│  │ Line Items   │  │
│  └──────────┘  └──────────┘  └──────┬───────┘  │
│                                      │          │
│  ┌──────────────┐  ┌────────────────┤          │
│  │ Chargemaster │← │ Auditor        │          │
│  │ SQLite (WASM)│  │ Flag overcharge│          │
│  └──────────────┘  └────────┬───────┘          │
│                              │                  │
│  ┌───────────────────────────┤                  │
│  │ Letter Generator          │                  │
│  │ pdf-lib → dispute PDF     │                  │
│  └───────────────────────────┘                  │
└─────────────────────────────────────────────────┘
         ↑ No network calls. Ever.
```

### State machine

The app uses a `useReducer` state machine with five phases:

```
idle → ocr-loading → parsing → audited → letter-generating
                                  ↑              │
                                  └──────────────┘
```

Each transition is a typed action. Impossible states are unrepresentable.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| **UI** | React 19 + Vite 8 |
| **OCR** | Tesseract.js 7 (WASM, runs in browser) |
| **Data** | sql.js (SQLite compiled to WASM) + bundled CMS chargemaster |
| **PDF generation** | pdf-lib (pure JS, no server) |
| **PDF parsing** | pdfjs-dist |
| **File handling** | react-dropzone |
| **Testing** | Vitest + Testing Library |
| **Type safety** | TypeScript 6 strict |
| **CI/CD** | GitHub Actions → GitHub Pages |
| **Package manager** | pnpm |

---

## Development

```bash
# Install dependencies
pnpm install

# Dev server
pnpm dev

# Run tests
pnpm test:run

# Type check
pnpm typecheck

# Lint
pnpm lint

# Production build
pnpm build
```

---

## Fork it

MIT license. Built for patients — forkable for legal-aid orgs, state AG offices, and anyone who wants to deploy their own version.

The architecture is intentionally simple: one React SPA, no backend, no accounts. Fork it, customize the letter template, add your state's specific statutes, deploy to any static host.

---

## More from ByteWorthy

<table>
<tr>
<td width="25%" align="center">
<a href="https://github.com/ByteWorthyLLC/outbreaktinder"><strong>OutbreakTinder</strong></a><br />
<sub>Tinder for plagues. Swipe through history's deadliest outbreaks. Every fact cited.</sub>
</td>
<td width="25%" align="center">
<a href="https://github.com/ByteWorthyLLC/honeypot-med"><strong>honeypot-med</strong></a><br />
<sub>Exposed: how healthcare middlemen mark up your care. 27-page investigation.</sub>
</td>
<td width="25%" align="center">
<a href="https://github.com/ByteWorthyLLC/vqol"><strong>vqol</strong></a><br />
<sub>Track quality-of-life after a vet diagnosis. Visual timeline for pet owners.</sub>
</td>
<td width="25%" align="center">
<a href="https://github.com/ByteWorthyLLC/sovra"><strong>sovra</strong></a><br />
<sub>Browser-first financial sovereignty tools. No accounts, no cloud.</sub>
</td>
</tr>
</table>

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

MIT © 2026 [ByteWorthy LLC](https://github.com/ByteWorthyLLC)
