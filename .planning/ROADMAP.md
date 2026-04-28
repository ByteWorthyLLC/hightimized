# Roadmap: hightimized

**Created:** 2026-04-28
**Source:** Synthesized from `~/Projects/experiments/oss-viral-ideas/prds/active/02-hightimized.md`
**Phases:** 7 (Phase 0 → Phase 6)
**Granularity:** Coarse (matches PRD structure)
**Total v1 requirements mapped:** 38 / 38 ✓

## Phase Summary

| # | Phase | Goal | Requirements | UI hint | Effort |
|---|-------|------|--------------|---------|--------|
| 0 | Decisions + scaffolding | Resolve open decisions, init repo, scaffold | (decisions only) | no | 1 day |
| 1 | Vertical slice | End-to-end happy path with hardcoded data | INGEST-01, OCR-01..02, LETTER-01 (stub) | yes | 2 days |
| 2 | Real bundled data + flagger | Real chargemaster lookups + rule-based flagger | INGEST-02..04, OCR-03..04, AUDIT-01..06 | yes | 2 days |
| 3 | WebGPU LLM integration | In-browser explainer + dispute letter generator | EXPL-01..05, LETTER-02..07 | yes | 1.5 days |
| 4 | Persistence + export | Local history, encrypted export, wipe everything | STORAGE-01..05 | yes | 1 day |
| 5 | PWA polish + onboarding | Service worker, manifest, onboarding tour, statute viewer | PWA-01..06, STATUTE-01..03 | yes | 1 day |
| 6 | Public release + viral assets | Repo public, demo video, launch drafts, domains | RELEASE-01..06 | yes | 0.5–1 day |

---

## Phase 0: Decisions + Scaffolding

**Goal:** Resolve the 6 open Phase 0 decisions from `STATUS.md`, initialize the repo at `github.com/ByteWorthyLLC/hightimized`, and scaffold the project so `pnpm dev` runs and CI passes on first commit.

**Requirements:** (architectural decisions; no v1 product requirements yet)

**Success Criteria:**
1. Decision document committed at `docs/decisions/0001-phase-0-decisions.md` resolving: CPT licensing path, MRF bundling scope, OCR engine choice, UPL framing language, Upstream anti-overlap confirmation, WebLLM model choice
2. Repo created at `github.com/ByteWorthyLLC/hightimized` with MIT LICENSE
3. Vite + TypeScript + React scaffold initialized
4. Lefthook + ESLint + Prettier + Vitest configured
5. GitHub Actions CI runs build + test on every PR; green on first commit
6. README has thesis line ("They charged you high. Get it itemized.") and project skeleton

**UI hint:** no — pure scaffolding phase

**Plans:** 4/8 plans executed

Plans:
- [x] 00-01-PLAN.md — Vite + TS + React + pnpm scaffold with /hightimized/ base path
- [x] 00-02-PLAN.md — ESLint flat config + Prettier + Lefthook + EditorConfig
- [x] 00-03-PLAN.md — Vitest + jsdom + Testing Library smoke test
- [ ] 00-04-PLAN.md — vite-plugin-pwa stub + project skeleton directories
- [ ] 00-05-PLAN.md — GitHub Actions ci.yml + deploy-pages.yml
- [x] 00-06-PLAN.md — LICENSE + README + ADR + CONTRIBUTING + SECURITY + templates
- [ ] 00-07-PLAN.md — Local smoke test + first git commit (no push)
- [ ] 00-08-PLAN.md — gh repo create + push + Discussions + Pages source (GATED, autonomous: false)

---

## Phase 1: Vertical Slice

**Goal:** End-to-end happy path with hardcoded data — drag a sample bill, OCR a known fixture, lookup against a single-row bundled SQLite, render one flagged line, generate a stub PDF letter. Proves the architecture before scaling the corpus.

**Requirements:** INGEST-01, OCR-01, OCR-02, LETTER-01 (stub form)

**Success Criteria:**
1. User can drag-drop a fixture bill PDF and see extracted line items in the UI
2. tesseract.js (or chosen OCR) runs entirely in-browser, no network call
3. Line-item parser extracts CPT/HCPCS code + description + charge from the fixture
4. A single hardcoded bundled chargemaster row triggers the flagger on the fixture
5. A stub PDF letter generates and downloads (placeholder text fine)
6. Manual demo from drag → flagged line → PDF passes end-to-end

**UI hint:** yes — first user-visible surface

---

## Phase 2: Real Bundled Data + Flagger Logic

**Goal:** Replace hardcoded data with the real bundled corpus. Build the data pipeline that ingests CMS MRFs, aggregates to medians by code+region, and emits a SQLite blob ≤50MB. Implement the rule-based flagger with explainable trace.

**Requirements:** INGEST-02, INGEST-03, INGEST-04, OCR-03, OCR-04, AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04, AUDIT-05, AUDIT-06

**Success Criteria:**
1. Build-time pipeline ingests CMS Hospital Price Transparency MRFs from `CMSgov/hospital-price-transparency` and produces aggregated SQLite ≤50MB
2. Bundled SQLite covers national + top-30 metro regional medians; HCPCS Level II dictionary; Medicare allowable rates
3. Real chargemaster lookups work for any of the top-30 metros on a real anonymized bill fixture
4. Flagger fires on `>1.5× hospital published rate` AND `>2× regional Medicare-allowable` rules independently
5. Each flagged line carries a human-readable rule trace
6. 20-row fixture bill test passes with expected flagged lines

**UI hint:** yes — flagged-line visualization

---

## Phase 3: WebGPU LLM Integration

**Goal:** Boot WebLLM in-browser, slot-fill plain-English explainers per flagged line, and slot-fill the full dispute letter — all with regex-anchored verification so the model can never hallucinate a price.

**Requirements:** EXPL-01, EXPL-02, EXPL-03, EXPL-04, EXPL-05, LETTER-02, LETTER-03, LETTER-04, LETTER-05, LETTER-06, LETTER-07

**Success Criteria:**
1. WebLLM bootstraps; first-run model download has clear progress UX; subsequent runs use cached model
2. Per-flagged-line explainer generates plain-English text via slot-fill against pre-written templates
3. Verification regex anchors every explainer output; no output is rendered without passing the anchor check
4. Dispute letter generator slot-fills bundled templates citing 45 CFR §180, No Surprises Act, top-10-state UDAP, HHS-OIG format as applicable
5. Letter renders to PDF via pdf-lib with signature line, return address, certified-mail block, dated, 30-day rebill demand
6. Page degrades gracefully on devices without WebGPU (rule-trace visible, prose absent)

**UI hint:** yes — LLM-rendered content visible

---

## Phase 4: Persistence + Export

**Goal:** Bills, audits, and letters persist across sessions in IndexedDB only. Always-visible "wipe everything." Encrypted JSON export/import for cross-device portability without ever introducing cloud sync.

**Requirements:** STORAGE-01, STORAGE-02, STORAGE-03, STORAGE-04, STORAGE-05

**Success Criteria:**
1. IndexedDB schema persists bill history; refresh reloads previous bills + audits + letters
2. "Wipe everything" button is visible from every screen and actually wipes IndexedDB clean
3. Encrypted JSON export uses WebCrypto with user-supplied passphrase; export file is portable
4. Encrypted JSON import on a different browser/device reproduces identical history given the passphrase
5. Persistent privacy banner ("your data never leaves this device") visible across the app

**UI hint:** yes — privacy-affirming surfaces

---

## Phase 5: PWA Polish + Onboarding

**Goal:** Make it installable, offline-capable, and fast. Add the 60-second guided onboarding, the certified-mail walkthrough card, and the inline statute viewer so a first-time user understands the value within 60 seconds of first interaction.

**Requirements:** PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, STATUTE-01, STATUTE-02, STATUTE-03

**Success Criteria:**
1. Site is installable as PWA with manifest + service worker; "Add to Home Screen" works on iOS, Android, desktop Chrome
2. After first load, site works fully offline with no network requests
3. Lighthouse PWA score ≥ 90 on the production deployment
4. Cold-start to first useful flag completes under 30 seconds on a 2024 mid-tier laptop
5. 60-second guided onboarding walks first-time users through ingest → audit → letter
6. Certified-mail walkthrough card explains the print + mail step
7. Statute viewer renders bundled regulation text inline per flagged line; full text available; public-domain source links present

**UI hint:** yes — onboarding + statute UI

---

## Phase 6: Public Release + Viral Assets

**Goal:** Ship v0.1.0 publicly with the launch assets that turn the demo into a screenshot people share. README hero GIF, 30-second demo video, drafts for Show HN + r/personalfinance + Twitter, domain reservations.

**Requirements:** RELEASE-01, RELEASE-02, RELEASE-03, RELEASE-04, RELEASE-05, RELEASE-06

**Success Criteria:**
1. README is published with hero GIF (drag → flagged → letter, ~10s loop) and 30-second demo video
2. GitHub repo `ByteWorthyLLC/hightimized` is public with MIT LICENSE, signed commits, and CONTRIBUTING.md
3. v0.1.0 release tagged on GitHub
4. Site deployed to GitHub Pages (or equivalent static host) at a stable URL
5. Show HN draft, r/personalfinance draft, and Twitter thread draft are written and ready to post (separate launch decision)
6. Domains `hightimized.com` and `hightimized.org` reserved (even if not pointed yet)

**UI hint:** yes — README hero + demo video are user-facing artifacts

---

## Anti-Overlap Verification (gate for promotion to NEXT)

Before Phase 1 begins, confirm:

- [ ] No Upstream Intelligence repo, page, or marketing surface mentions `hightimized` or vice versa
- [ ] Phrasing in README and copy avoids RCM/denials/prior-auth language
- [ ] Repo is owned by `ByteWorthyLLC` org, not `Upstream-Intelligence` org
- [ ] No shared collaborators that would imply institutional crossover
- [ ] honeypot-med, vqol, outbreaktinder, woundlog roadmaps are unaffected

## Coverage

- **v1 requirements**: 38 total
- **Mapped to phases**: 38 (all)
- **Unmapped**: 0 ✓

## Source Documents

- PRD: `~/Projects/experiments/oss-viral-ideas/prds/active/02-hightimized.md`
- Vision spec: `~/Projects/experiments/oss-viral-ideas/chosen-ideas/hightimized/IDEA.md`
- Status + decisions: `~/Projects/experiments/oss-viral-ideas/chosen-ideas/hightimized/STATUS.md`
- Active filter: `~/Projects/experiments/oss-viral-ideas/STRATEGY.md`

---
*Roadmap created: 2026-04-28*
*Last updated: 2026-04-28 after initialization*
