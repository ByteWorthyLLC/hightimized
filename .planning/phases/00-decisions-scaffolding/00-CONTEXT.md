# Phase 0: Decisions + Scaffolding — Context

**Gathered:** 2026-04-28
**Status:** Ready for planning
**Mode:** Smart discuss — all 12 PRD-grounded recommendations accepted by user

<domain>
## Phase Boundary

Resolve the 6 open architectural/legal decisions documented in `~/Projects/experiments/oss-viral-ideas/chosen-ideas/hightimized/STATUS.md`, initialize a Vite + TypeScript + React project at `~/Projects/hightimized/`, configure quality tooling (lefthook, ESLint, Prettier, Vitest), set up GitHub Actions CI, and write the README skeleton + decision document. The phase ends when `pnpm dev` runs locally and CI is green on the first commit.

The phase does NOT include any product code (no OCR, no flagger, no UI beyond a default landing route). Phase 0 is pure foundation.

External actions (creating the GitHub repo, pushing the initial commit, enabling Discussions) are gated on explicit user authorization — the autonomous loop halts before those steps.

</domain>

<decisions>
## Implementation Decisions

### Legal Posture

- **No CPT dictionary bundled.** HCPCS Level II only (public domain). User's own bill carries CPT codes legally — we never re-publish them.
- **UPL framing locked**: copy reads "audit assist + form letter generator. Not legal advice." Persistent banner across the app. No jurisdiction-specific strategy. No court-filing templates in v1. State-specific UDAP citations are *informational* — the user mails their own letter.
- **Upstream Intelligence anti-overlap is a hard rule with an audit gate.** Patient-side audit + dispute only. Zero RCM, denials, or prior-auth language anywhere in copy, code, or docs. README is audited before Phase 1 promotion. Repo lives under `ByteWorthyLLC` org — never `Upstream-Intelligence`.

### Data Corpus Scope

- **CMS MRF coverage**: national medians + top-30 metro regional medians, aggregated to median by code+region. Bundle target ~10–30 MB. Source: `CMSgov/hospital-price-transparency`.
- **State UDAP statute pack v1**: top-10 states by population — CA, TX, FL, NY, PA, IL, OH, GA, NC, MI. v2 adds the remaining 40.
- **Federal regulation bundle**: 45 CFR §180 (Hospital Price Transparency Final Rule) + No Surprises Act (PL 116-260) + HHS-OIG complaint format. Full inline statute text (not citations only).
- **HCPCS Level II dictionary**: full public-domain bundle (~1MB).

### Stack Choices

- **OCR**: tesseract.js — proven, browser-only, no GPU requirement, ~10 MB.
- **WebGPU LLM**: Qwen3 4B Instruct via WebLLM (mlc-ai). Streamed from public CDN on first run; cached locally after.
- **Package manager**: pnpm (named in success criterion `pnpm dev`).
- **Framework**: Vite + TypeScript + React (named in PRD).
- **PWA**: Vite PWA plugin or Workbox-based service worker.

### Build & CI Tooling

- **Test framework**: Vitest (Vite-native).
- **Pre-commit hooks**: Lefthook + lint-staged. Hooks run ESLint + Prettier + tsc --noEmit + Vitest changed-files.
- **CI**: GitHub Actions on free public-repo tier. Workflow runs build + typecheck + test on every PR and on push to main. Lighthouse PWA audit gates added in Phase 5.
- **License**: MIT (active filter requirement).
- **Repo target**: `github.com/ByteWorthyLLC/hightimized` (private until first README/LICENSE land, then public).

### Marketability Posture (locked from STATE.md user intent)

- README hero line: "**They charged you high. Get it itemized.**"
- README structure (Phase 6 fills the assets, Phase 0 lays the skeleton): thesis line → 30s demo video slot → "what it does" paragraph → "try it now" CTA → fork/star CTAs → privacy promise (zero upload, no accounts) → contributor section → MIT license badge.
- Tone: confident, direct, no emoji-stuffing. Match Upstream Intelligence brand voice.
- GitHub Pages hosts the PWA itself at the canonical URL — no separate marketing site. The product is the marketing.

### Cost Posture (locked from STATE.md cost constraint)

- $0 ongoing infra. GitHub Pages hosting, GitHub Actions CI, no metered services.
- WebLLM weights stream from HuggingFace public CDN — never re-host.
- No telemetry, no error tracking, no analytics.

### Claude's Discretion

- Exact Vite/TypeScript/React/Vitest version pinning at the latest stable as of 2026-04-28.
- ESLint config preset (recommend `@typescript-eslint/recommended` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`).
- Prettier defaults; lockfile (.prettierrc) committed.
- Lefthook hook ordering and parallelism — Claude picks.
- GitHub Actions workflow YAML structure — Claude picks (one workflow per concern: ci.yml, lighthouse.yml later).
- Project directory layout: `src/` for app code, `data/` for bundled corpus build outputs (gitignored), `scripts/` for build-time pipelines, `public/` for static assets, `docs/decisions/` for ADRs.
- README hero copy beyond the thesis line — Claude drafts; reviewable before Phase 6.

</decisions>

<code_context>
## Existing Code Insights

This is a greenfield project — `~/Projects/hightimized/` currently contains only the `.planning/` directory and a `CLAUDE.md`. No source code exists yet. Phase 0 IS the scaffold.

### Reusable Assets

None internal. External public-domain assets to bundle in later phases:
- `CMSgov/hospital-price-transparency` (CMS MRF schema reference)
- HCPCS Level II from CMS public dataset
- 45 CFR §180 text from eCFR (federal-public)
- No Surprises Act text from Congress.gov (federal-public)
- Top-10 state UDAP statutes from each state's official code (state-public)

### Established Patterns

None — this is the establishment.

### Integration Points

- GitHub Pages deployment workflow → wires up in Phase 6 but folder layout chosen now must support it.
- Build-time data pipeline (Phase 2) → `scripts/build-data/` directory created in Phase 0 as empty stub.

</code_context>

<specifics>
## Specific Ideas

- README's first heading must be the thesis line, not the project name. The slug `hightimized` is reveal-by-reading, not announce-by-stating.
- Decision document path: `docs/decisions/0001-phase-0-decisions.md`. ADR style: title, status, context, decision, consequences. Each of the 12 decisions above gets its own row.
- `.gitignore` must include `node_modules`, `dist`, `.vite`, `data/build/`, `.env*`, and `*.log`.
- First commit message: `chore: initial scaffold + Phase 0 decisions`. Co-authored-by Claude Opus footer.
- LICENSE file: standard MIT, `Copyright (c) 2026 ByteWorthy LLC`.

</specifics>

<deferred>
## Deferred Ideas

- Domain reservation (`hightimized.com`/`.org`) → Phase 6 vanity step, optional.
- Custom GitHub Pages domain CNAME → Phase 6.
- v2 features (Spanish UI, all-50-state UDAP, court templates, white-label theming) → noted in REQUIREMENTS.md v2 section, not in scope.
- Bundled CPT dictionary → permanently out of scope (AMA copyright).
- Cloud sync, account system, telemetry → permanently out of scope (active filter, anti-goals).
- WebLLM model fallback to Phi-4-mini if Qwen3 4B underperforms → Phase 3 evaluation, not Phase 0.

</deferred>
