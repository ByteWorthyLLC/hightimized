# hightimized

## What This Is

Browser-only PWA that audits a hospital bill or EOB against the hospital's own publicly-mandated chargemaster, flags overcharges in plain English, and generates a certified-mail-ready dispute letter citing the regulation that was violated. Zero upload, no accounts, no SaaS.

Built for any patient (or caregiver) who got a confusing US hospital bill — and as a forkable artifact for legal-aid orgs, state-AG offices, and ByteWorthy clients who want to deploy a white-label version.

## Core Value

> Drag your hospital bill in. Get the receipts back out — including the receipt for the regulation they broke. Without ever uploading the data.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Drag-drop ingest of hospital bill, itemized statement, or EOB (PDF or image)
- [ ] In-browser OCR extracts line items (CPT/HCPCS code + description + charge)
- [ ] Bundled chargemaster median lookup per code (national + top-30 metro for v1)
- [ ] Rule-based overcharge flagger with explainable rule trace
- [ ] WebGPU plain-English explainer per flagged line (regex-anchored, no hallucinated prices)
- [ ] Dispute letter generator with bundled templates citing 45 CFR §180, No Surprises Act, top-10-state UDAP
- [ ] PDF render via pdf-lib in browser (signature line, certified-mail block)
- [ ] IndexedDB local-only history with always-visible "wipe everything"
- [ ] Encrypted JSON export/import (WebCrypto, user passphrase)
- [ ] PWA installable, works offline after first load
- [ ] Statute viewer (bundled regulation text inline per flagged line)
- [ ] Public release v0.1.0 with hero GIF + 30s demo + Show HN draft

### Out of Scope

- Cloud sync — defeats the privacy hook; encrypted JSON export is the substitute
- Auto-mailing service — defeats the privacy hook; user prints + mails
- Negotiation-on-your-behalf — that's Goodbill's SaaS model, deliberately not what this is
- Insurance-side denial appeals — overlaps Upstream Intelligence territory; anti-overlap rule
- Court-filing templates (small claims, motions) — too high-risk for MVP, defer to v0.2.0+
- Multi-language v1 — English only at launch; Spanish v0.2.0+
- Account system, login, telemetry, analytics — anti-goals, MIT all the way down
- Bundled CPT dictionary — AMA holds CPT copyright; HCPCS-only subset for v1 plus codes pre-printed on user's own bill

## Context

- **Portfolio position:** ByteWorthy OSS Viral Ideas registry slot. Spec lives at `~/Projects/experiments/oss-viral-ideas/chosen-ideas/hightimized/`. PRD at `~/Projects/experiments/oss-viral-ideas/prds/active/02-hightimized.md`.
- **Naming origin:** Reads as `high` + `itemized` — the patient's two demands fused into one word. Verified clear on GitHub (0 repos, 0 code matches, 0 users) and the open web on 2026-04-28.
- **Saturation evidence (2026-04-28):** Goodbill is SaaS taking 25% of savings. Dollar For suspended their negotiation service. SolidAITech is cloud-LLM. Healthcare Bluebook is cloud subscription. CMSgov publishes tools for HOSPITALS to publish MRFs, not for patients to read them. **No open-source patient-facing browser-only tool exists.**
- **Public data underutilized:** CMS Hospital Price Transparency Final Rule (2021) requires every hospital to publish their chargemaster as machine-readable JSON/CSV. CY2026 OPPS/ASC Final Rule updates effective Jan 1, 2026. CMS enforcement begins April 1, 2026. The MRFs are sitting on the floor.
- **Bipartisan political moment:** Surprise billing + price transparency is one of few areas with cross-party rage. No political ceiling on virality.
- **ByteWorthy thesis fit:** Cleanest possible match for "Custom AI you own. Not SaaS you rent." This is the headline product for the brand.

## Constraints

- **License**: MIT — required by the OSS Viral Ideas active filter
- **No external API calls**: browser/local/bundled-data only — required by the active filter
- **No SaaS, no telemetry, no login**: anti-goals, hard limits
- **Anti-overlap with Upstream Intelligence**: patient-side audit + dispute only. Provider-side denial workflows are off-limits. No shared messaging surface.
- **Anti-overlap with honeypot-med**: different domain, clean
- **CPT licensing (AMA)**: cannot bundle CPT dictionary. Use HCPCS Level II (public domain) plus codes pre-printed on user's own bill.
- **UPL (unauthorized practice of law)**: position language as "audit assist + form letter generator," NOT legal advice. Banner persistently visible. No jurisdiction-specific strategy. No court-filing templates in MVP.
- **Bundle size**: target ≤50MB total bundled corpus (excluding WebLLM model weights, which stream on first run)
- **Build effort**: 7–10 days solo, 7-phase build plan
- **Repo target**: `github.com/ByteWorthyLLC/hightimized`
- **Build location**: `~/Projects/hightimized/`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Slug `hightimized` over `medbill` | Reads as `high`+`itemized`; clear on GitHub + open web; slug carries the entire thesis | — Pending validation post-launch |
| MIT license | Active filter; maximizes fork/white-label adoption | — Pending |
| Browser-only, no backend | "Custom AI you own" thesis; eliminates SaaS economics; differentiates from Goodbill | — Pending |
| HCPCS-only dictionary, no bundled CPT | AMA licensing; user's own bill carries CPT codes legally | — Pending Phase 0 legal review |
| WebLLM (mlc-ai) for in-browser inference | Industry standard; WebGPU acceleration; no API call | — Pending |
| Bundled CMS chargemaster aggregated to medians by code+region | Bundle size budget ≤50MB; full granularity not needed for flagging logic | — Pending |
| Coarse phase granularity (7 phases) | Solo 7–10 day build; PRD already mapped phase boundaries | — Pending |
| Skip "Research first" GSD step | Saturation pass and stack research already encoded in PRD | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-28 after initialization from PRD `02-hightimized.md`*
