# State: hightimized

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-28)

**Core value:** Drag your hospital bill in; get the receipts back out — including the receipt for the regulation they broke. Without ever uploading the data.

**Current focus:** Phase 0 — Decisions + Scaffolding (pre-kickoff)

## Workflow State

| Field | Value |
|---|---|
| Mode | YOLO |
| Granularity | Coarse |
| Parallelization | True |
| Commit docs | True |
| Model profile | Balanced (Sonnet) |
| Research workflow | Skipped (PRD encodes it) |
| Plan check | On |
| Verifier | On |
| Auto-advance | True |

## Phase Status

| Phase | Status |
|-------|--------|
| 0. Decisions + Scaffolding | ◑ In Progress (plan 02 of N complete) |
| 1. Vertical Slice | ○ Pending |
| 2. Real Bundled Data + Flagger | ○ Pending |
| 3. WebGPU LLM Integration | ○ Pending |
| 4. Persistence + Export | ○ Pending |
| 5. PWA Polish + Onboarding | ○ Pending |
| 6. Public Release + Viral Assets | ○ Pending |

## Source-of-Truth Pointers

- PRD: `~/Projects/experiments/oss-viral-ideas/prds/active/02-hightimized.md`
- Vision spec: `~/Projects/experiments/oss-viral-ideas/chosen-ideas/hightimized/IDEA.md`
- Status + open decisions: `~/Projects/experiments/oss-viral-ideas/chosen-ideas/hightimized/STATUS.md`
- Active filter: `~/Projects/experiments/oss-viral-ideas/STRATEGY.md`

## Supplemental User Intent (2026-04-28)

User invoked `/gsd-autonomous --from 0` with these additional asks:

1. **Run research, plan, verify** — full loop, no shortcuts.
2. **Create GitHub repo** at `github.com/ByteWorthyLLC/hightimized` during Phase 0 (initialize + push first commit + open Discussions).
3. **README marketability + virality** — copy must convert. Hero GIF, thesis line, "drag bill → flagged → letter" demo loop, social-share-friendly screenshots. Tone: confident, not breathless. No emoji-stuffing, no "🚀 amazing!" energy. The product does the talking.
4. **GitHub Pages marketing page** — landing site for the project (could be the PWA itself at root, or a marketing index at `/` with the PWA at `/app`). Must include: thesis hero, one-paragraph "what it does," 30-second demo video embed, "try it now" CTA, fork/star CTAs.
5. **Tone constraint**: marketing voice is direct, not salesy. Match Upstream Intelligence brand voice (real numbers, real receipts, no fluff). Reference `~/.claude/personas/jack-dorsey.md` (single thesis, edit don't add).

Phases that absorb this:
- **Phase 0** — repo creation, GitHub Discussions on, MIT license, initial commit
- **Phase 5** — PWA polish (the page itself becomes part of the marketing surface)
- **Phase 6** — README hero + demo video + landing page deployment + Show HN/Twitter drafts

## Cost Constraint (locked 2026-04-28)

**Free for every user. Free for the maintainer. Forever.**

Practical implications all phases must honor:

- Hosting: **GitHub Pages only** (free public-repo tier). No Vercel, Netlify, Cloudflare paid plans. No card-on-file anywhere.
- No metered services in the runtime stack (no Firebase, Supabase, S3, Sentry, PostHog, Datadog).
- No API keys at runtime. No keys at build time either, except where the CI runner's GitHub token (free) is used.
- WebLLM weights served from HuggingFace's public CDN (free). Never re-host.
- CMS / 45 CFR / HCPCS / state UDAP corpus: all public-domain, bundled at build, zero API calls.
- CI: GitHub Actions free tier on public repos (effectively unlimited).
- Domains (`hightimized.com`, `hightimized.org` in Phase 6): optional vanity. Repo URL + `byteworthyllc.github.io/hightimized` are the canonical URLs. No domain renewal creates an outage.
- No telemetry, no analytics, no error tracking — anti-goals in PROJECT.md, also a $0 enforcement mechanism.

## Decisions

- **00-01:** Use @vitejs/plugin-react-swc (not Babel); tsconfig.json is app config only (no project references); types:vite/client added; pnpm.onlyBuiltDependencies approves @swc/core native build
- **00-02:** lefthook added to pnpm.onlyBuiltDependencies (same non-interactive env pattern as @swc/core); Prettier excludes *.md to preserve README hero line spacing; vitest stanza pre-staged in lefthook.yml so Plan 03 requires no hook changes

## Last Action

- 2026-04-28 — Project initialized via `/gsd-do` → `/gsd-new-project`. PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, config.json all written from PRD `02-hightimized.md`.
- 2026-04-28 — `/gsd-autonomous --from 0` invoked. Starting full autonomous loop through all 7 phases.
- 2026-04-28 — Completed 00-02-PLAN.md: ESLint flat config + Prettier + Lefthook + EditorConfig. Stopped at: Completed 00-02-PLAN.md
