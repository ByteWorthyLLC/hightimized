<!-- GSD:project-start source:PROJECT.md -->
## Project

**hightimized**

Browser-only PWA that audits a hospital bill or EOB against the hospital's own publicly-mandated chargemaster, flags overcharges in plain English, and generates a certified-mail-ready dispute letter citing the regulation that was violated. Zero upload, no accounts, no SaaS.

Built for any patient (or caregiver) who got a confusing US hospital bill — and as a forkable artifact for legal-aid orgs, state-AG offices, and ByteWorthy clients who want to deploy a white-label version.

**Core Value:** > Drag your hospital bill in. Get the receipts back out — including the receipt for the regulation they broke. Without ever uploading the data.

### Constraints

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
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
