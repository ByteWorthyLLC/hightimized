---
phase: 00-decisions-scaffolding
plan: "04"
subsystem: infra
tags: [vite-plugin-pwa, workbox, pwa, service-worker, skeleton, scaffold]

requires:
  - phase: 00-decisions-scaffolding/00-01
    provides: vite.config.ts with base /hightimized/ and @vitejs/plugin-react-swc
  - phase: 00-decisions-scaffolding/00-02
    provides: package.json with pnpm scripts + lefthook postinstall
  - phase: 00-decisions-scaffolding/00-03
    provides: vitest.config.ts separate from vite.config.ts

provides:
  - vite-plugin-pwa@1.2.0 wired with Workbox generateSW mode
  - PWA manifest with start_url /hightimized/ and scope /hightimized/
  - Workbox globIgnores for *.gguf and data/build/** (Pitfall 6 fix)
  - All Phase 1-6 skeleton directories committed with .gitkeep
  - public/robots.txt (allow all)
  - public/404.html SPA fallback stub with meta-refresh

affects: [phase-1-ui, phase-2-data-pipeline, phase-3-llm, phase-5-pwa-polish]

tech-stack:
  added: [vite-plugin-pwa@1.2.0, workbox-build@7.x]
  patterns:
    - VitePWA generateSW mode with explicit globPatterns and globIgnores
    - PWA manifest scope/start_url pinned to /hightimized/ (GitHub Pages subpath)
    - maximumFileSizeToCacheInBytes 5MB to support SQLite blob in Phase 2
    - navigateFallbackDenylist excludes /gguf/ routes for WebLLM weights

key-files:
  created:
    - src/lib/auditor/.gitkeep
    - src/lib/ocr/.gitkeep
    - src/lib/llm/.gitkeep
    - src/lib/letter/.gitkeep
    - src/components/.gitkeep
    - src/routes/.gitkeep
    - src/data-sources/.gitkeep
    - scripts/build-data/.gitkeep
    - data/build/.gitkeep
    - public/icons/.gitkeep
    - public/robots.txt
    - public/404.html
  modified:
    - vite.config.ts
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "vite-plugin-pwa@1.2.0 pinned — Phase 5 upgrades when PWA polish lands"
  - "globIgnores includes **/*.gguf and data/build/** to prevent Workbox precache of large blobs"
  - "data/build/.gitkeep force-tracked (git add -f) so directory exists but contents stay gitignored"
  - "public/404.html is a meta-refresh stub — Phase 1 replaces with Rafgraph SPA sessionStorage pattern"

patterns-established:
  - "Pattern: VitePWA config in vite.config.ts alongside react() plugin — vitest.config.ts stays clean"
  - "Pattern: skeleton dirs use .gitkeep so git tracks empty directories"
  - "Pattern: force-add .gitkeep for gitignored dirs (data/build/) to commit the empty dir"

requirements-completed: []

duration: 1min
completed: 2026-04-28
---

# Phase 00 Plan 04: PWA Plugin + Project Skeleton Summary

**vite-plugin-pwa@1.2.0 wired with Workbox generateSW, manifest scoped to /hightimized/, and all Phase 1-6 skeleton directories committed**

## Performance

- **Duration:** ~8 min (wall clock including package install)
- **Started:** 2026-04-28T20:51:07Z
- **Completed:** 2026-04-28T20:59:00Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- Installed vite-plugin-pwa@1.2.0 and wired VitePWA into vite.config.ts with correct Workbox config
- PWA manifest emits with start_url /hightimized/ and scope /hightimized/ — confirmed via dist/manifest.webmanifest
- All 12 skeleton directories created for Phase 1-6 artifacts (auditor, ocr, llm, letter, components, routes, data-sources, build-data, icons)
- public/robots.txt (allow all) and public/404.html (meta-refresh stub) in place

## Task Commits

1. **Task 1: Install vite-plugin-pwa + update vite.config.ts** - `8d0c689` (feat)
2. **Task 2: Create skeleton directories + robots.txt + 404.html stub** - `1629c98` (chore)

## Files Created/Modified

- `vite.config.ts` — Added VitePWA plugin with Workbox config and manifest (start_url/scope /hightimized/)
- `package.json` — Added vite-plugin-pwa@1.2.0 devDependency
- `pnpm-lock.yaml` — Updated lockfile
- `src/lib/auditor/.gitkeep` — Phase 2 rule-based flagger home
- `src/lib/ocr/.gitkeep` — Phase 2/3 tesseract.js home
- `src/lib/llm/.gitkeep` — Phase 3 WebLLM/WebGPU home
- `src/lib/letter/.gitkeep` — Phase 4 letter generator home
- `src/components/.gitkeep` — Phase 1+ shared UI components
- `src/routes/.gitkeep` — Phase 1 React Router pages
- `src/data-sources/.gitkeep` — Phase 2 SQLite boundary layer
- `scripts/build-data/.gitkeep` — Phase 2 CMS MRF pipeline scripts
- `data/build/.gitkeep` — Phase 2 pipeline outputs dir (force-tracked, contents gitignored)
- `public/icons/.gitkeep` — PWA icon home (192px + 512px land in Phase 5)
- `public/robots.txt` — Allow all crawlers
- `public/404.html` — SPA routing fallback stub (Phase 1 replaces with Rafgraph pattern)

## Decisions Made

- Pinned vite-plugin-pwa at 1.2.0 per RESEARCH.md — Phase 5 upgrades to latest when PWA polish lands
- Used `git add -f data/build/.gitkeep` to force-track the empty dir while keeping its contents gitignored — this preserves the directory in fresh clones without leaking pipeline outputs
- public/404.html is a minimal meta-refresh stub rather than the full Rafgraph SPA pattern — React Router doesn't exist yet in Phase 0, so the full pattern would be misleading. Phase 1 replaces it atomically.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- vite-plugin-pwa@1.2.0 peer dependency warning: package declares peerDep vite@"^3.1.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0" but project uses vite@8.0.10. This is a docs lag in vite-plugin-pwa — Vite 8 is backward-compatible. Build passes cleanly (`pnpm build` exits 0, manifest emits correctly). No action required.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All skeleton directories in place — Phase 2 can write to scripts/build-data/ and data-sources/ immediately
- Phase 3 has src/lib/llm/ home ready for WebLLM wrappers
- Phase 5 PWA polish: update VitePWA config (add runtimeCaching for SQLite), add real icon files to public/icons/, replace 404.html with Rafgraph SPA pattern
- vite.config.ts is the single source of truth for the PWA config — vitest.config.ts unchanged

---
*Phase: 00-decisions-scaffolding*
*Completed: 2026-04-28*
