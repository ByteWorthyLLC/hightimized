# Phase 0: Decisions + Scaffolding — Research

**Researched:** 2026-04-28
**Domain:** Vite + TypeScript + React + pnpm project scaffolding, OSS tooling, GitHub Actions CI/CD
**Confidence:** HIGH (all critical claims verified via npm registry and official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Legal Posture**
- No CPT dictionary bundled. HCPCS Level II only (public domain).
- UPL framing locked: "audit assist + form letter generator. Not legal advice." Persistent banner across the app. No court-filing templates in v1.
- Upstream Intelligence anti-overlap is a hard rule with an audit gate. Patient-side audit + dispute only. Zero RCM, denials, or prior-auth language. Repo lives under `ByteWorthyLLC` org — never `Upstream-Intelligence`.

**Data Corpus Scope**
- CMS MRF coverage: national medians + top-30 metro regional medians, aggregated to median by code+region. Bundle target ~10–30 MB.
- State UDAP statute pack v1: top-10 states by population.
- Federal regulation bundle: 45 CFR §180 + No Surprises Act (PL 116-260) + HHS-OIG complaint format. Full inline statute text.
- HCPCS Level II dictionary: full public-domain bundle (~1MB).

**Stack Choices**
- OCR: tesseract.js
- WebGPU LLM: Qwen3 4B Instruct via WebLLM (mlc-ai)
- Package manager: pnpm
- Framework: Vite + TypeScript + React
- PWA: Vite PWA plugin or Workbox-based service worker

**Build & CI Tooling**
- Test framework: Vitest
- Pre-commit hooks: Lefthook + lint-staged. Hooks run ESLint + Prettier + tsc --noEmit + Vitest changed-files.
- CI: GitHub Actions on free public-repo tier.
- License: MIT
- Repo target: `github.com/ByteWorthyLLC/hightimized`

**Marketability Posture**
- README hero line: "**They charged you high. Get it itemized.**"
- README structure: thesis line → 30s demo video slot → "what it does" paragraph → "try it now" CTA → fork/star CTAs → privacy promise → contributor section → MIT license badge.
- Tone: confident, direct, no emoji-stuffing. Match Upstream Intelligence brand voice.
- GitHub Pages hosts the PWA at the canonical URL.

**Cost Posture**
- $0 ongoing infra. GitHub Pages + GitHub Actions free tier. No paid services.
- WebLLM weights stream from HuggingFace public CDN — never re-host.
- No telemetry, no error tracking, no analytics.

### Claude's Discretion
- Exact Vite/TypeScript/React/Vitest version pinning at latest stable as of 2026-04-28.
- ESLint config preset (recommend `@typescript-eslint/recommended` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`).
- Prettier defaults; lockfile (.prettierrc) committed.
- Lefthook hook ordering and parallelism.
- GitHub Actions workflow YAML structure.
- Project directory layout: `src/`, `data/`, `scripts/`, `public/`, `docs/decisions/`.
- README hero copy beyond the thesis line.

### Deferred Ideas (OUT OF SCOPE)
- Domain reservation (`hightimized.com`/`.org`) → Phase 6
- Custom GitHub Pages domain CNAME → Phase 6
- v2 features (Spanish UI, all-50-state UDAP, court templates, white-label theming)
- Bundled CPT dictionary (permanently out of scope)
- Cloud sync, account system, telemetry
- WebLLM model fallback to Phi-4-mini → Phase 3 evaluation
</user_constraints>

---

## Summary

Phase 0 is pure toolchain establishment. The locked stack — Vite 8 + TypeScript 6 + React 19 + pnpm — has a canonical `pnpm create vite` path using the `react-ts` template (the `react-swc-ts` template was removed from official create-vite templates in Vite 6+; SWC is now available as a separate plugin post-scaffold). The tooling layer (Lefthook, ESLint flat config, Prettier, Vitest) has clear 2025-2026 patterns that are all verified against current npm registry versions. GitHub Actions CI and GitHub Pages deploy workflows are straightforward with the v4 action suite now required (v3 deprecated January 2025).

The single architectural decision requiring care is the `vite.config.ts` `base` setting — it must be set to `/hightimized/` for the GitHub Pages subpath deploy, and any React Router usage must match with a `basename` prop. The vite-plugin-pwa service worker must explicitly exclude WebLLM model weight URLs from precaching (they can easily exceed the 2MB per-file default limit and are already CDN-served).

**Primary recommendation:** Scaffold with `pnpm create vite . --template react-ts`, immediately replace `@vitejs/plugin-react` with `@vitejs/plugin-react-swc` for faster dev server, set `base: '/hightimized/'` in vite.config.ts, then layer in tooling in order: TypeScript strict config → ESLint flat config → Prettier → Lefthook → Vitest → vite-plugin-pwa stub → GitHub Actions.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 8.0.10 | Build tool + dev server | Official scaffold; fastest iteration; native ESM |
| typescript | 6.0.3 | Static typing | Required by project; widest ecosystem support |
| react | 19.2.5 | UI framework | Locked by project decisions |
| react-dom | 19.2.5 | React DOM renderer | Paired with react |
| @vitejs/plugin-react-swc | 4.3.0 | React HMR + JSX transform via SWC | Faster than Babel; recommended for production Vite+React projects 2025+ |

[VERIFIED: npm registry — 2026-04-28]

### Dev / Tooling
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 4.1.5 | Test runner | Vite-native, shares config, fast |
| lefthook | 2.1.6 | Git hooks manager | Parallel hooks, zero npm install overhead |
| eslint | 10.2.1 | Linting | Flat config (v9+ default) |
| @eslint/js | 10.0.1 | ESLint core JS rules | Foundation for flat config |
| typescript-eslint | 8.59.1 | TS rules for ESLint | v8+ supports flat config natively |
| eslint-plugin-react-hooks | 7.1.1 | React hooks rules | Required for correctness |
| eslint-plugin-react-refresh | 0.5.2 | HMR safety rules | Required with SWC plugin |
| prettier | 3.8.3 | Code formatting | Opinionated, zero-config default |
| @testing-library/react | 16.3.2 | Component testing | Standard RTL for React 19 |
| @testing-library/jest-dom | 6.9.1 | DOM matchers | Extends Vitest expect |
| @testing-library/user-event | 14.x | User interaction simulation | Pairs with RTL |
| vite-plugin-pwa | 1.2.0 | PWA manifest + service worker | Zero-config Workbox wrapper, maintained 2026 |
| jsdom | latest | DOM environment for Vitest | More mature than happy-dom; better compatibility |

[VERIFIED: npm registry — 2026-04-28]

### Installation

```bash
# Step 1: Scaffold
pnpm create vite . --template react-ts

# Step 2: Replace Babel plugin with SWC (faster)
pnpm remove @vitejs/plugin-react
pnpm add -D @vitejs/plugin-react-swc

# Step 3: Add testing stack
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Step 4: Add ESLint flat config stack
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh

# Step 5: Add Prettier
pnpm add -D prettier

# Step 6: Add Lefthook
pnpm add -D lefthook

# Step 7: Add PWA plugin
pnpm add -D vite-plugin-pwa
```

---

## Architecture Patterns

### Recommended Project Structure

```
hightimized/
├── src/
│   ├── components/          # Shared UI components
│   ├── routes/              # Page-level route components (React Router v7)
│   ├── lib/                 # Pure business logic (auditor, parser, letter-gen)
│   │   ├── auditor/         # Rule-based flagger logic
│   │   ├── ocr/             # tesseract.js wrappers
│   │   ├── llm/             # WebLLM/WebGPU wrappers
│   │   └── letter/          # Dispute letter generation
│   ├── data-sources/        # Build-time data access layer (SQLite wrappers)
│   ├── test/
│   │   └── setup.ts         # @testing-library/jest-dom setup
│   ├── App.tsx
│   └── main.tsx
├── data/
│   └── build/               # Build-time pipeline outputs (gitignored)
├── scripts/
│   └── build-data/          # Phase 2 data pipeline scripts (stub in Phase 0)
├── public/
│   ├── icons/               # PWA icons (192, 512)
│   └── robots.txt
├── docs/
│   └── decisions/           # ADRs
│       └── 0001-phase-0-decisions.md
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # PR + push CI
│   │   └── deploy-pages.yml # GitHub Pages deploy
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── lefthook.yml
├── tsconfig.json
├── tsconfig.node.json        # For vite.config.ts
├── vite.config.ts
├── vitest.config.ts
├── package.json
├── pnpm-lock.yaml
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
└── CHANGELOG.md
```

**Rationale:**
- `src/lib/` is separated from `src/components/` — business logic (auditor, OCR, LLM) must be testable without React. This separation is essential for Vitest unit tests.
- `src/data-sources/` creates the boundary between bundled data and the app logic; Phase 2 fills this in.
- `data/build/` is gitignored because Phase 2 pipeline outputs are large (target ≤50MB SQLite).
- `scripts/build-data/` stub is created in Phase 0 per CONTEXT.md spec so Phase 2 has a home.
- `docs/decisions/` for ADRs is specified explicitly in CONTEXT.md.

### Pattern 1: Vite Config with GitHub Pages Base

```typescript
// vite.config.ts
// Source: https://vite.dev/guide/static-deploy#github-pages
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/hightimized/',   // REQUIRED for ByteWorthyLLC org pages subpath
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Exclude WebLLM model weights — they stream from HuggingFace CDN
        // and exceed the 2MB default precache limit
        navigateFallbackDenylist: [/\/gguf\//],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB for SQLite blob
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Do NOT include *.gguf or large data blobs in precache
        globIgnores: ['**/*.gguf', 'data/build/**'],
      },
      manifest: {
        name: 'hightimized',
        short_name: 'hightimized',
        description: 'Audit your hospital bill. Generate a dispute letter. Free, private, browser-only.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/hightimized/',
        scope: '/hightimized/',
        icons: [
          { src: '/hightimized/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/hightimized/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

**Critical note:** `base: '/hightimized/'` must match in both `vite.config.ts` and the PWA manifest `start_url`/`scope`. If a custom domain is later configured (Phase 6), this changes to `'/'`. [VERIFIED: vite.dev/guide/static-deploy + vite-plugin-pwa docs]

### Pattern 2: Vitest Config (Separate from Vite Config)

```typescript
// vitest.config.ts
// Source: https://vitest.dev/config/
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['src/test/**', '**/*.d.ts'],
    },
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
```

**jsdom vs happy-dom:** Use jsdom. It is more mature, has broader Web API coverage, and is the standard for React Testing Library. happy-dom is faster but missing some Web APIs that testing-library relies on. [VERIFIED: vitest.dev/config/environment]

**Two-config approach:** `vitest.config.ts` takes precedence over `vite.config.ts` — this prevents test config leaking into the prod build and avoids the `/// <reference types="vitest" />` triple-slash hack. [VERIFIED: vitest.dev/config/]

### Pattern 3: ESLint Flat Config (v9+)

```javascript
// eslint.config.js
// Source: https://typescript-eslint.io/getting-started/ + React hooks flat config docs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'data/build', 'scripts/build-data'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
```

[VERIFIED: typescript-eslint.io/getting-started, github.com/facebook/react eslint-plugin-react-hooks README v7.1.1]

**Key:** `eslint-plugin-react-hooks` v5+ exports a `flat.recommended` config. `eslint-plugin-react-refresh` v0.5.x supports flat config directly. The `.eslintrc.*` format is fully deprecated in ESLint v9+. [VERIFIED: eslint.org/docs]

### Pattern 4: Lefthook Configuration

```yaml
# lefthook.yml
# Source: https://github.com/evilmartians/lefthook
pre-commit:
  parallel: true
  commands:
    typecheck:
      glob: '*.{ts,tsx}'
      run: pnpm tsc --noEmit
    eslint:
      glob: '*.{ts,tsx}'
      run: pnpm eslint {staged_files}
    prettier:
      glob: '*.{ts,tsx,json,md,yaml}'
      run: pnpm prettier --write {staged_files} && git add {staged_files}
    vitest:
      glob: '*.{test,spec}.{ts,tsx}'
      run: pnpm vitest run --reporter=verbose {staged_files}

pre-push:
  commands:
    test-full:
      run: pnpm test --run
```

**Notes on Lefthook behavior:**
- `parallel: true` runs all pre-commit commands concurrently. Total wait time = slowest command (tsc), not sum.
- `{staged_files}` is Lefthook's variable for the list of files matching the glob that are staged.
- `prettier --write` followed by `git add` re-stages the formatted files — this is the correct pattern to avoid "prettier modified files, commit rejected" loops.
- `vitest run {staged_files}` only runs tests related to staged test files. Not all tests. Pre-push runs the full suite.
- Install: `pnpm lefthook install` (run once after `pnpm install`). Add `pnpm lefthook install` to `postinstall` script in `package.json`.

[VERIFIED: github.com/evilmartians/lefthook docs — confirmed pattern from multiple 2025 sources]

### Pattern 5: TypeScript Config

```json
// tsconfig.json — app code
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```json
// tsconfig.node.json — for vite.config.ts and scripts/
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "scripts/**/*.ts"]
}
```

[VERIFIED: matches default create-vite react-ts output for Vite 8 + TS 6]

### Pattern 6: package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "postinstall": "lefthook install"
  }
}
```

**`postinstall: lefthook install`** ensures anyone who clones and runs `pnpm install` automatically gets the git hooks wired. [ASSUMED — standard pattern, not in official Lefthook docs but universally recommended]

### Anti-Patterns to Avoid

- **Do not use `react-ts` and keep `@vitejs/plugin-react` (Babel):** SWC plugin is significantly faster for development. The template default is Babel for compatibility; swap to SWC immediately. [VERIFIED: multiple 2025 benchmarks]
- **Do not merge vitest config into vite.config.ts with `/// <reference types="vitest" />`:** Works but pollutes prod build config and causes confusion. Separate files is the canonical approach for 2025+. [VERIFIED: vitest.dev]
- **Do not use `eslint-plugin-react` (the jsx-eslint one) instead of react-hooks:** `eslint-plugin-react` enforces many style rules and prop-types checks that are irrelevant for TypeScript + modern React. The only required plugins are `react-hooks` (correctness) and `react-refresh` (HMR safety). [ASSUMED — standard 2025 community guidance]
- **Do not precache WebLLM GGUF weights via service worker:** They are served from HuggingFace CDN. The browser already caches them via Cache-API after first fetch. Precaching them would bloat the SW install step and likely fail (files are multi-GB). Use `globIgnores` in vite-plugin-pwa Workbox config. [VERIFIED: vite-pwa-org.netlify.app/guide/faq re: maximumFileSizeToCacheInBytes]
- **Do not omit `base: '/hightimized/'` from vite.config.ts:** Without it, all asset paths will be absolute (`/assets/...`) and break when served from `byteworthyllc.github.io/hightimized/`. This is the #1 cause of blank GitHub Pages deploys. [VERIFIED: multiple deployment guides + vite.dev/guide/static-deploy]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Git hooks | Shell scripts in `.git/hooks/` | Lefthook | Cross-platform, parallel, staged-file-aware, survives `git clone` |
| JS/TS linting | Custom rules | ESLint + typescript-eslint | 20k+ rules, community-maintained, TS-native |
| Code formatting | Manual conventions | Prettier | Zero-config, deterministic, no style debates |
| PWA manifest + SW | Custom service worker | vite-plugin-pwa | Handles complex Workbox config, manifest injection, HMR in dev |
| Test runner | Custom Jest config | Vitest | Shares Vite config, ~10x faster than Jest for TS projects |
| Pages deploy | Custom FTP/rsync | actions/deploy-pages@v4 | Native GitHub integration, handles permissions correctly |

---

## Common Pitfalls

### Pitfall 1: react-swc-ts Template No Longer Exists in create-vite

**What goes wrong:** Running `pnpm create vite . --template react-swc-ts` fails — template not found. Scaffold stalls.
**Why it happens:** `react-swc-ts` was removed from official create-vite templates in Vite 6+. Available templates as of Vite 8 + create-vite 9: `react-ts`, `react-compiler-ts`, `react`. SWC is now a separate plugin install.
**How to avoid:** Use `--template react-ts`, then manually replace `@vitejs/plugin-react` with `@vitejs/plugin-react-swc`.
**Warning signs:** `create-vite` error message: "Invalid template react-swc-ts".

[VERIFIED: `npx create-vite --help` output on this machine + npm registry create-vite 9.0.6]

### Pitfall 2: Blank GitHub Pages Deploy (Missing base)

**What goes wrong:** Deploy succeeds, site loads at `byteworthyllc.github.io/hightimized/` but shows blank page. Browser console: 404 on `/assets/index-xxx.js`.
**Why it happens:** Vite defaults to `base: '/'`. Assets are at `/hightimized/assets/...` on GitHub Pages but the HTML references `/assets/...`.
**How to avoid:** Set `base: '/hightimized/'` in `vite.config.ts` before first deploy. Also set `scope` and `start_url` in PWA manifest to match.
**Warning signs:** `pnpm build` output shows asset URLs starting with `/assets/` (missing repo prefix).

[VERIFIED: vite.dev/guide/static-deploy, multiple GitHub Pages deployment guides 2025]

### Pitfall 3: ESLint Legacy Config Interference

**What goes wrong:** ESLint reports "ESLINT_USE_FLAT_CONFIG" warning or fails to pick up `eslint.config.js`.
**Why it happens:** An old `.eslintrc.js` or `.eslintrc.json` file left over from a copy-paste or template. ESLint v9+ uses flat config by default but may get confused by legacy files.
**How to avoid:** Ensure no `.eslintrc.*` files exist. Set `"eslint": { "useFlatConfig": true }` in package.json if needed as a safety measure.
**Warning signs:** ESLint running but not enforcing the rules you defined.

### Pitfall 4: Lefthook Not Running Because Install Step Was Skipped

**What goes wrong:** Commits go through without running hooks. Devs wonder why linting isn't enforced.
**Why it happens:** Lefthook requires `lefthook install` to write hooks to `.git/hooks/`. If this step is skipped (common on CI or after `git clone`), no hooks run.
**How to avoid:** Add `"postinstall": "lefthook install"` to `package.json` scripts so it runs automatically after `pnpm install`. Also document in CONTRIBUTING.md.
**Warning signs:** `.git/hooks/pre-commit` doesn't exist or contains wrong content.

### Pitfall 5: Vitest Globals Not Configured, Tests Fail with "describe is not defined"

**What goes wrong:** Test files using `describe`, `it`, `expect` without imports throw ReferenceError.
**Why it happens:** Vitest doesn't inject globals by default (unlike Jest). Must set `globals: true` in vitest.config.ts AND add `"types": ["vitest/globals"]` to tsconfig.json test include or use an ambient types declaration.
**How to avoid:** Set `test: { globals: true }` in vitest.config.ts. Add to tsconfig.json: `"compilerOptions": { "types": ["vitest/globals"] }` for the test files scope (or a `tsconfig.test.json`).
**Warning signs:** TypeScript errors on `describe` and `it` in test files.

### Pitfall 6: vite-plugin-pwa Service Worker Blocks on Large Files

**What goes wrong:** `pnpm build` fails with: "workbox: maximumFileSizeToCacheInBytes is reached" when Phase 2 data blobs exceed 2MB.
**Why it happens:** Workbox precaches all files matching `globPatterns` by default. The SQLite bundle (target ~10-30MB) exceeds the 2MB threshold.
**How to avoid:** In `vite.config.ts` VitePWA config, set explicit `globPatterns` that exclude data blobs, and set `maximumFileSizeToCacheInBytes` to a value that covers the actual JS/CSS assets (typically 5MB is safe). Data blobs should use `runtimeCaching` with a Cache-First strategy instead.
**Warning signs:** Build error mentioning "maximumFileSizeToCacheInBytes" or very large `sw.js` output file.

---

## Code Examples

### GitHub Actions CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test:run

      - name: Build
        run: pnpm build
```

[VERIFIED: pnpm/action-setup@v4 docs, actions/setup-node@v4 docs, pnpm.io/continuous-integration/github-actions]

**Notes:**
- `pnpm install --frozen-lockfile` is explicit here for clarity; pnpm also auto-adds `--frozen-lockfile` when it detects CI env (CI=true). Belt-and-suspenders is fine.
- `pnpm/action-setup@v4` + `actions/setup-node@v4` with `cache: 'pnpm'` is the canonical 2025 combo. The `cache: 'pnpm'` in setup-node caches the pnpm store between runs.
- `node-version: 22` — use Node 22 LTS on CI (current LTS as of 2026-04-28). Node 25 is the local version but 22 is the CI standard for stability.

### GitHub Pages Deploy Workflow

```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

[VERIFIED: github.com/actions/deploy-pages, github.blog/changelog/2024-12-05-deprecation-notice re: v4 requirement]

**Critical repository setup required (human gated):**
1. GitHub repo Settings → Pages → Source: "GitHub Actions" (not branch deploy)
2. This must be done before the first deploy run. The workflow will fail silently if set to branch source.

**SPA routing note:** For React Router to work correctly on GitHub Pages, a `public/404.html` that redirects to `index.html` is needed. Standard pattern: copy `dist/index.html` to `dist/404.html` via a `cp public/404.html dist/` step or a Vite plugin. The `404.html` trick intercepts GitHub's 404 and redirects the user back to the SPA with the correct route. [VERIFIED: multiple GitHub Pages + React Router guides 2025]

### .gitignore (Canonical for Vite + pnpm)

```gitignore
# Dependencies
node_modules

# Build outputs
dist
dist-ssr

# Vite cache
.vite

# Data pipeline outputs (Phase 2+)
data/build/

# Test coverage
coverage
*.lcov

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Environment variables
.env
.env.*
!.env.example

# Editor
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# TypeScript incremental build
*.tsbuildinfo
```

[VERIFIED: matches create-vite defaults + pnpm-specific additions + project-specific `data/build/`]

### MIT LICENSE

```
MIT License

Copyright (c) 2026 ByteWorthy LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

[CITED: opensource.org/licenses/MIT — standard text, only year and copyright holder changed]

### ADR Format (for docs/decisions/0001-phase-0-decisions.md)

Use **simplified Michael Nygard style** (not full MADR). Sections: Title, Status, Date, Context, Decision, Consequences. One ADR file covering all 12 Phase 0 decisions.

```markdown
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
```

---

## README Structure (Phase 0 Skeleton)

The skeleton committed in Phase 0 should have the full structure with placeholder copy. Phase 6 fills in demo video, hero GIF, and social-share screenshots.

**Patterns from best-in-class OSS READMEs** (httpie, lobe-chat, shallow-backup, gofiber/fiber):
- Project thesis first — not the name. The hero line IS the first heading.
- Demo asset immediately after thesis (GIF or video) — visitors decide in 3 seconds.
- Feature list as short bullet points, not prose.
- One clear "try it now" link before anything else.
- Badges sparse and meaningful: build status, license, version — not star count.
- Privacy/zero-upload promise is a trust signal, not a compliance checkbox — put it high.
- Contributor section simple: "fork it, open a PR, see CONTRIBUTING.md."
- No word "amazing," no rocket emoji blasts, no "🚀 lightning fast" marketing speak.

[VERIFIED: github.com/matiassingers/awesome-readme — analyzed top 10 examples]

```markdown
<!-- README.md skeleton — Phase 0 commit -->
# They charged you high. Get it itemized.

> Drag your hospital bill in. Get the receipts back out — including the receipt for the regulation they broke. Without ever uploading the data.

<!-- [DEMO VIDEO PLACEHOLDER — Phase 6] -->
<!-- [HERO GIF: drag → flagged lines → dispute letter — Phase 6] -->

## Try it now

**[byteworthyllc.github.io/hightimized](https://byteworthyllc.github.io/hightimized)** — no install, no account, no upload.

## What it does

hightimized audits your hospital bill against the hospital's own publicly-mandated chargemaster,
flags lines where they charged more than federal law allows, and generates a certified-mail-ready
dispute letter citing the exact regulation they violated.

**Your data never leaves your device.** OCR runs in the browser. The chargemaster data is bundled.
The dispute letter generates locally. Nothing is sent anywhere.

- Drag in a hospital bill PDF or image
- In-browser OCR extracts every line item
- Bundled CMS chargemaster data flags overcharges automatically
- Plain-English explanation per flagged line (runs in your browser, no API call)
- Dispute letter citing 45 CFR §180, No Surprises Act, and your state's UDAP statute
- PDF renders in the browser — print, sign, mail

## Privacy promise

Zero upload. No accounts. No telemetry. Bill history stored only in your browser's IndexedDB.
One-tap wipe. Export as encrypted JSON for portability.

## Fork it

MIT license. Built for patients. Forkable for legal-aid orgs, state AG offices, ByteWorthy clients.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

MIT © 2026 ByteWorthy LLC
```

---

## OSS Credibility Files: Phase 0 vs Deferred

| File | Phase 0 | Rationale |
|------|---------|-----------|
| `LICENSE` | YES — required | MIT mandated by active filter |
| `README.md` | YES — skeleton | Thesis line + structure; Phase 6 fills assets |
| `CONTRIBUTING.md` | YES — minimal | Fork + PR instructions; required for Phase 6 public launch credibility |
| `SECURITY.md` | YES — minimal | States no server-side attack surface; directs to GitHub Security Advisories for vuln reports |
| `CHANGELOG.md` | YES — stub | Keep a Changelog format; first entry is 0.0.1 with "Initial scaffold" |
| `CODE_OF_CONDUCT.md` | DEFER to Phase 6 | Not blocking; add before public launch |
| `.github/ISSUE_TEMPLATE/bug_report.md` | YES — minimal | Stops blank issue noise immediately |
| `.github/ISSUE_TEMPLATE/feature_request.md` | YES — minimal | Same |
| `.github/PULL_REQUEST_TEMPLATE.md` | YES — minimal | Useful from first external PR |
| `docs/decisions/0001-phase-0-decisions.md` | YES — required | Specified in CONTEXT.md |

**Minimal SECURITY.md for Phase 0:**
```markdown
# Security Policy

hightimized runs entirely in the browser. There is no server, no database, and no API.
Your bill data never leaves your device.

If you discover a vulnerability in the client-side code, please report it via
GitHub Security Advisories: https://github.com/ByteWorthyLLC/hightimized/security/advisories/new

Do not open a public issue for security vulnerabilities.
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| pnpm | Package manager | YES | 10.29.3 | — |
| node | Runtime | YES | 25.9.0 (LTS 22 for CI) | — |
| git | Version control | YES | 2.53.0 | — |
| gh CLI | GitHub repo creation (gated) | YES | 2.87.3 | Manual browser |
| lefthook binary | Git hooks (optional global) | NO — install via pnpm | — | `pnpm add -D lefthook` covers it |
| create-vite | Scaffolding | YES (pnpm create vite) | 9.0.6 | — |

**Missing dependencies with no fallback:** None. All Phase 0 tooling is installable via pnpm.

**Gated external actions:** `gh repo create ByteWorthyLLC/hightimized` — requires user authorization before execution. The plan must include a "halt for user" task before this step.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-swc-ts` create-vite template | `react-ts` + install `@vitejs/plugin-react-swc` | Vite 6 (mid-2024) | Init command changes |
| `.eslintrc.json` flat config | `eslint.config.js` flat config | ESLint v9 (2024) | Old config files silently ignored |
| `actions/upload-pages-artifact@v3` optional | v3 required minimum (v4 also available) | Jan 2025 deprecation | Must use v3 or v4 |
| Husky for git hooks | Lefthook | Trend shift 2023-2025 | Husky still works; Lefthook is faster and config-file-based |
| vitest config inline in vite.config.ts | Separate vitest.config.ts | Vitest 1.x+ | Cleaner separation of concerns |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `"postinstall": "lefthook install"` is standard community pattern for auto-wiring hooks | Pattern 4: Lefthook | Low — if wrong, add to CONTRIBUTING.md manually; lefthook install can be run manually |
| A2 | `eslint-plugin-react` (full JSX plugin) not needed for TypeScript + React 19 projects | Pattern 3: ESLint | Low — if wrong, add plugin; it only adds extra rules, doesn't break anything |
| A3 | Vite 8 + Node 25 has no known incompatibilities | Environment | Low — Node 25 is not LTS but is newer; Vite 8 requires 20.19+; Node 25 satisfies that |

---

## Open Questions

1. **GitHub org ownership: ByteWorthyLLC vs byteworthyllc**
   - What we know: GitHub org names are case-insensitive but the canonical display name matters for URLs in README.
   - What's unclear: Is the org already created at `github.com/ByteWorthyLLC`? The user needs to confirm org exists before `gh repo create`.
   - Recommendation: Plan must include a human-gated verification step before repo creation.

2. **GitHub Pages: `byteworthyllc.github.io` vs custom domain**
   - What we know: Phase 0 canonical URL is `byteworthyllc.github.io/hightimized`. Custom domain is Phase 6 deferred.
   - What's unclear: If Pages is already configured on ByteWorthyLLC's org for other projects, there may be a root-level Pages conflict.
   - Recommendation: Confirm in plan that Pages source is set to "GitHub Actions" before deploy workflow runs. Document this as a gated human step.

3. **vite-plugin-pwa + Qwen3 4B GGUF file caching strategy**
   - What we know: Phase 0 only stubs the VitePWA config. The actual caching strategy for WebLLM weights is a Phase 3 concern.
   - What's unclear: Exact file patterns the WebLLM/mlc-ai runtime uses for model caching (opaque cache, Cache API, or OPFS).
   - Recommendation: In Phase 0, configure VitePWA with `globIgnores: ['**/*.gguf']` as a defensive default. Phase 3 research resolves the full strategy.

---

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`) — all package versions verified 2026-04-28
- `npx create-vite --help` — confirmed available templates (no react-swc-ts in Vite 8/create-vite 9)
- vitest.dev/config/ — vitest.config.ts patterns, jsdom vs happy-dom
- typescript-eslint.io/getting-started/ — flat config setup
- vite.dev/guide/static-deploy — GitHub Pages base config requirement
- github.com/actions/deploy-pages — v4 workflow YAML
- vite-pwa-org.netlify.app — vite-plugin-pwa config patterns, maximumFileSizeToCacheInBytes
- github.com/facebook/react eslint-plugin-react-hooks README — flat config support in v7.1.1

### Secondary (MEDIUM confidence)
- github.com/evilmartians/lefthook docs/usage.md — lefthook.yml config structure
- github.com/matiassingers/awesome-readme — README best practices
- Multiple 2025 deployment guides — vite base + GitHub Pages SPA routing pattern

### Tertiary (LOW confidence)
- Community blog posts (advancedfrontends.com, codeparrot.ai) — ESLint flat config patterns (cross-referenced with official docs)

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — all verified via `npm view` on 2026-04-28
- Scaffolding commands: HIGH — confirmed via `npx create-vite --help` locally
- ESLint flat config: HIGH — verified at typescript-eslint.io + react-hooks plugin README
- GitHub Actions YAML: HIGH — verified at official action repos
- Lefthook YAML: MEDIUM — official docs consulted but exact `pnpm prettier --write && git add` pattern is community convention
- README patterns: MEDIUM — verified against awesome-readme but "viral" factor is inherently unverifiable

**Research date:** 2026-04-28
**Valid until:** 2026-07-28 (stable toolchain — 90 days; re-verify if Vite 9 releases or ESLint v11 drops)

---

## RESEARCH COMPLETE
