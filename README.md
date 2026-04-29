<div align="center">
<img src="https://raw.githubusercontent.com/ByteWorthyLLC/hightimized/main/.github/assets/hightimized-hero.svg" alt="hightimized — audit your hospital bill" width="100%">
</div>

[![License](https://img.shields.io/badge/license-MIT-2563EB?style=for-the-badge&labelColor=0F172A)](./LICENSE)
[![Live demo](https://img.shields.io/badge/try_it-live_demo-F59E0B?style=for-the-badge&labelColor=0F172A)](https://byteworthyllc.github.io/hightimized)

**[byteworthyllc.github.io/hightimized](https://byteworthyllc.github.io/hightimized)** — no install, no account, no upload.

## What it does

hightimized audits your hospital bill against the hospital's own publicly-mandated chargemaster,
flags lines where they charged more than federal law allows, and generates a certified-mail-ready
dispute letter citing the exact regulation they violated.

Your data never leaves your device. OCR runs in the browser. The chargemaster data is bundled.
The dispute letter generates locally. Nothing is sent anywhere.

- Drag in a hospital bill PDF or image
- In-browser OCR extracts every line item
- Bundled CMS chargemaster data flags overcharges automatically
- Plain-English explanation per flagged line (runs in your browser, no API call)
- Dispute letter citing 45 CFR §180, No Surprises Act, and your state's UDAP statute
- PDF renders in the browser — print, sign, mail

> **Privacy:** Zero upload. No accounts. No telemetry. Bill history stored only in your browser's IndexedDB. One-tap wipe. Export as encrypted JSON for portability.

## Fork it

MIT license. Built for patients. Forkable for legal-aid orgs, state AG offices, ByteWorthy clients.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

MIT © 2026 ByteWorthy LLC
