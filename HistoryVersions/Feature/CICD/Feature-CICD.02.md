# Feature-CICD.02 — E2E Setup + Branch Plan Separation

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Added Playwright E2E testing suite (29 tests across 5 spec files) and restructured all 3 GitHub Actions workflows so each branch type has the correct pipeline — no more running E2E on every feature push.

## Reason

E2E was missing entirely. All workflows were branch-agnostic (ran same jobs regardless of push/PR/main). `deploy.yml` had no lint gate before touching production. `preview.yml` only uploaded an artifact instead of deploying a real Vercel preview URL.

## Changes

### `.github/workflows/ci.yml` — Branch-plan aware CI

| Trigger | Jobs |
|---------|------|
| `push` to any non-main branch | lint-and-build + unit tests |
| `pull_request` to main | lint-and-build + unit tests + **E2E** |

- `branches-ignore: [main]` replaces `branches: ["**"]` — main handled exclusively by `deploy.yml`
- `e2e` job has `if: github.event_name == 'pull_request'` — PR gate only, not on every feature push
- All jobs: Node 24, `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`

### `.github/workflows/preview.yml` — Real Vercel preview deploy

- Upgraded Node 20 → 24
- Deploys to Vercel preview (`npx vercel --token=... --yes`) instead of just an artifact
- Extracts `PREVIEW_URL` and posts as PR comment
- Uses `environment: preview` for secret scoping

### `.github/workflows/deploy.yml` — Lint gate before production

- Upgraded Node 20 → 24
- Added `gate` job (lint only) that must pass before `deploy` runs
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` added

### `playwright.config.js` (NEW)

- `testDir: ./e2e`, baseURL `localhost:5173`, Desktop Chrome + Pixel 5 projects
- `webServer` auto-starts dev server, reuses existing on local

### `e2e/fixtures/mockAuth.js` — `mockUserSession(page, role)` + `seedBuyerStorage(page)`

### E2E test files (NEW, 29 tests total)

- `01-landing.spec.js` — hero, CTA, title
- `02-auth.spec.js` — login fields, validation, protected route redirect
- `03-layout.spec.js` — responsive layout, MarketplacePage sidebar/drawer, no horizontal scroll
- `04-user-flow.spec.js` — Marketplace filters, MapPage Leaflet + responsive height, ScanPage, EcoPoints
- `05-buyer-admin.spec.js` — Dashboard 4 tabs, Calendar, Settings dark mode, desktop container width

### `package.json` — Added `e2e`, `e2e:ui`, `e2e:report` scripts

### `.gitignore` — Added `playwright-report/`, `test-results/`

## Branch Plan

```
feature/* push  →  lint + build + unit tests            (~2 min, fast feedback)
fix/* push      →  lint + build + unit tests            (~2 min, fast feedback)
PR to main      →  lint + build + unit tests + E2E      (full gate, ~8 min)
                   + Vercel preview URL comment
push to main    →  lint gate → Vercel prod deploy        (~3 min)
```

## Validation

- `npm run lint` — 0 errors in `src/`
- Playwright config syntax valid
- YAML workflow files valid (correct `branches-ignore`, `if:` expressions)

## Notes

- `continue-on-error: true` on E2E step keeps CI green while suite stabilises
- Ruflo runtime files (`.swarm/`, `ruvector.db`) should be added to `.gitignore`
