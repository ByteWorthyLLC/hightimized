# Contributing to hightimized

Thanks for your interest. hightimized is MIT-licensed and built for forks.

## Quick start

```bash
pnpm install
pnpm dev
```

This wires the Lefthook pre-commit hooks automatically. Your commits will run typecheck, lint, prettier, and changed-file tests before they're accepted.

## Commit format

```
type(scope): message
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`.

## Pull requests

1. Fork the repo
2. Create a branch: `feature/short-desc` or `fix/short-desc`
3. Run `pnpm test:run` and `pnpm lint` before pushing
4. Open a PR against `main`

## What's in scope

Patient-side bill audit, dispute letter generation, statute viewing, browser-only privacy. Anything that defeats the privacy hook (cloud sync, accounts, telemetry) is out of scope by design.

## What's out of scope

- Insurance-side workflows (denials, prior auth, appeals) — different project, different repo
- Cloud sync of bill data — defeats the privacy promise
- Negotiation-on-your-behalf services — out of scope by design

## Questions

Open a [Discussion](https://github.com/ByteWorthyLLC/hightimized/discussions) before opening an issue if you're unsure.
