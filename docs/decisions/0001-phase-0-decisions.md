# ADR 0001: Phase 0 Architecture Decisions

**Status:** Accepted
**Date:** 2026-04-28
**Deciders:** Kevin Richards (ByteWorthy LLC)

## Context

hightimized is a browser-only PWA that audits hospital bills against publicly-mandated
chargemaster data and generates dispute letters. Phase 0 resolves the foundational
architectural and legal decisions before product code begins.

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | No CPT dictionary bundled | AMA holds CPT copyright. HCPCS Level II is public domain. User's own bill carries CPT codes. |
| 2 | UPL framing: "audit assist + form letter generator. Not legal advice." | Persistent banner; no jurisdiction-specific strategy; no court-filing templates in v1. |
| 3 | Upstream anti-overlap: patient-side only | ByteWorthyLLC org; zero RCM/denials/prior-auth language; README audited before Phase 1 promotion. |
| 4 | CMS MRF scope: national + top-30 metro medians | Bundle target ~10-30MB; full granularity exceeds budget. |
| 5 | State UDAP v1: top-10 states by population | CA, TX, FL, NY, PA, IL, OH, GA, NC, MI. v2 adds remaining 40. |
| 6 | Federal regs bundled inline: 45 CFR §180 + No Surprises Act + HHS-OIG format | Full text, not citations only. All public domain. |
| 7 | OCR: tesseract.js | Browser-only, proven, ~10MB, no GPU requirement. |
| 8 | WebGPU LLM: Qwen3 4B Instruct via WebLLM (mlc-ai) | Streamed from HuggingFace CDN on first run, cached locally. Phase 3 evaluation may substitute Phi-4-mini. |
| 9 | Package manager: pnpm | Named in Phase 0 success criteria (`pnpm dev`). Faster installs, stricter hoisting. |
| 10 | Framework: Vite 8 + TypeScript 6 + React 19 | Named in PRD. Industry standard 2026. |
| 11 | Test framework: Vitest | Vite-native; shares config; fastest TS test runner available. |
| 12 | License: MIT | Required by OSS Viral Ideas active filter. Maximizes fork/white-label adoption. |

## Consequences

- Positive: Clean legal posture; no AMA licensing exposure; no PHI handling; browser-only eliminates server costs permanently.
- Positive: MIT + no-CPT bundle enables legal-aid org forks without licensing review.
- Negative: HCPCS-only lookup reduces coverage; user must read CPT codes from their own bill.
- Negative: WebLLM requires first-run model download (~4GB); user must have adequate bandwidth on first use.
