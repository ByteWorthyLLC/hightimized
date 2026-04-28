# Requirements: hightimized

**Defined:** 2026-04-28
**Core Value:** Drag your hospital bill in; get the receipts back out — including the receipt for the regulation they broke. Without ever uploading the data.

## v1 Requirements

### Ingest

- [x] **INGEST-01**: User can drag-drop a hospital bill PDF or image into the page
- [ ] **INGEST-02**: User can paste a bill from clipboard
- [ ] **INGEST-03**: Page accepts itemized statements, EOBs, and balance bills as input formats
- [ ] **INGEST-04**: Page rejects unsupported file types with a clear, non-technical error

### OCR + Parsing

- [x] **OCR-01**: Browser-only OCR extracts text from bill PDF/image with no network call
- [x] **OCR-02**: Line-item parser extracts CPT/HCPCS code, description, and charge amount per line
- [ ] **OCR-03**: Parser handles multi-page bills correctly
- [ ] **OCR-04**: User can manually correct misread line items before audit

### Audit (Bundled-Data Lookup)

- [ ] **AUDIT-01**: Bundled SQLite of CMS Hospital Price Transparency MRFs covers national + top-30 metro regional chargemaster medians
- [ ] **AUDIT-02**: Bundled HCPCS Level II dictionary maps codes to descriptions
- [ ] **AUDIT-03**: Bundled Medicare allowable rates are looked up per code
- [ ] **AUDIT-04**: Audit flags every line where charge > 1.5× hospital's own published rate
- [ ] **AUDIT-05**: Audit flags every line where charge > 2× regional Medicare-allowable
- [ ] **AUDIT-06**: Each flagged line carries an explainable rule trace ("this fired because X")

### Plain-English Explainer (WebGPU LLM)

- [ ] **EXPL-01**: WebLLM (WebGPU) loads on first run; user sees clear progress indicator
- [ ] **EXPL-02**: Subsequent runs use cached model with no re-download
- [ ] **EXPL-03**: Plain-English explainer is generated per flagged line via slot-fill, never free-generation
- [ ] **EXPL-04**: Verification regex anchors every explainer output before display — never hallucinates a price
- [ ] **EXPL-05**: Page degrades gracefully if user's device lacks WebGPU (rule-trace shown without LLM prose)

### Dispute Letter Generator

- [x] **LETTER-01**: User can generate a dispute letter from one or more flagged lines
- [ ] **LETTER-02**: Letter cites 45 CFR §180 (Hospital Price Transparency Final Rule) where applicable
- [ ] **LETTER-03**: Letter cites the No Surprises Act (PL 116-260) for surprise-billing scenarios
- [ ] **LETTER-04**: Letter cites the user's state UDAP statute (top-10 states bundled v1)
- [ ] **LETTER-05**: Letter cites HHS-OIG complaint format for fraudulent-billing scenarios
- [ ] **LETTER-06**: Letter renders to PDF via pdf-lib in browser, with signature line, return address, and certified-mail block
- [ ] **LETTER-07**: Letter is dated automatically and includes 30-day rebill demand

### Local Storage + Privacy

- [ ] **STORAGE-01**: Bill history is stored only in IndexedDB on the user's device
- [ ] **STORAGE-02**: A "wipe everything" button is visible from every screen
- [ ] **STORAGE-03**: User can export full bill history as encrypted JSON (WebCrypto, user passphrase)
- [ ] **STORAGE-04**: User can import an encrypted JSON export on another device
- [ ] **STORAGE-05**: A persistent privacy banner states "your data never leaves this device"

### PWA + Polish

- [ ] **PWA-01**: Site is installable as a PWA with manifest + service worker
- [ ] **PWA-02**: After first load, site works fully offline
- [ ] **PWA-03**: Lighthouse PWA score ≥ 90
- [ ] **PWA-04**: Cold-start to first useful flag completes in under 30 seconds on a 2024 mid-tier laptop
- [ ] **PWA-05**: 60-second guided onboarding tour walks first-time user through ingest → audit → letter
- [ ] **PWA-06**: Certified-mail walkthrough card explains how to send the generated letter

### Statute Viewer

- [ ] **STATUTE-01**: Bundled regulation text is viewable inline next to each flagged line
- [ ] **STATUTE-02**: User can read full text of 45 CFR §180, the No Surprises Act, and bundled state UDAP statutes from within the app
- [ ] **STATUTE-03**: Every cited regulation links to its public-domain source

### Release

- [ ] **RELEASE-01**: README has hero GIF and 30-second demo video
- [ ] **RELEASE-02**: GitHub repo public at `github.com/ByteWorthyLLC/hightimized` with MIT LICENSE
- [ ] **RELEASE-03**: v0.1.0 tagged release with signed commits
- [ ] **RELEASE-04**: Site deployed to GitHub Pages (or equivalent static host)
- [ ] **RELEASE-05**: Show HN draft, r/personalfinance draft, and Twitter thread draft are written
- [ ] **RELEASE-06**: Domains `hightimized.com` and `hightimized.org` reserved

## v2 Requirements

### Multi-Language

- **I18N-01**: Spanish-language UI + bundled Spanish dispute templates

### Court Filings

- **COURT-01**: Small-claims complaint template generator (state-specific)
- **COURT-02**: Motion templates for court-bound disputes

### Expanded Statute Coverage

- **STATUTE-V2-01**: All 50 state UDAP statutes bundled (v1 covers top-10)
- **STATUTE-V2-02**: State-specific surprise-billing laws beyond federal No Surprises Act

### White-Label

- **FORK-01**: Theming + branding API so legal-aid orgs and state-AG offices can deploy as their own
- **FORK-02**: Custom statute pack injection for jurisdiction-specific deployments

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync of bill history | Defeats the privacy hook; encrypted JSON export is the substitute |
| Auto-mailing the dispute letter | Defeats the privacy hook; user prints + mails |
| Negotiate-on-your-behalf service | That's Goodbill's SaaS model — deliberately not what this is |
| Insurance-side denial appeals | Overlaps Upstream Intelligence territory; anti-overlap rule |
| Account / login system | Anti-goal; MIT all the way down |
| Telemetry / analytics | Anti-goal; defeats privacy framing |
| Bundled CPT dictionary | AMA holds CPT copyright; HCPCS-only for v1, user's own bill carries CPT codes |
| Real-time price-shop comparison ("find the cheapest hospital") | Healthcare Bluebook does this in cloud; not the audit-and-dispute thesis |
| Premium tier / paid features | Anti-goal; OSS public good |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| (Decisions, repo scaffold, CI) | Phase 0 | Pending |
| INGEST-01..04 | Phase 1 + Phase 2 | Pending |
| OCR-01..04 | Phase 1 + Phase 2 | Pending |
| AUDIT-01..06 | Phase 2 | Pending |
| EXPL-01..05 | Phase 3 | Pending |
| LETTER-01..07 | Phase 3 | Pending |
| STORAGE-01..05 | Phase 4 | Pending |
| PWA-01..06 | Phase 5 | Pending |
| STATUTE-01..03 | Phase 5 | Pending |
| RELEASE-01..06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-28*
*Last updated: 2026-04-28 after initial definition from PRD 02-hightimized.md*
