# Feature-Tests.01

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview
Added full Playwright E2E testing infrastructure to the project, including config, auth mock fixtures, npm scripts, CI/CD integration, and `.gitignore` updates.

## Reason
The project had unit tests (Vitest) but no browser-level E2E coverage. Playwright was introduced to validate navigation, auth flows, and responsive layout across Desktop Chrome and Pixel 5 viewports. The CI pipeline was extended so E2E runs automatically on every push in parallel with the existing `test` job.

## Changes

### package.json (UPDATED)
- Added `@playwright/test ^1.60.0` to devDependencies (via `npm install --save-dev`)
- Added three new scripts: `e2e`, `e2e:ui`, `e2e:report`

### playwright.config.js (NEW)
- `testDir: './e2e'`, `fullyParallel: true`
- Two projects: `chromium` (Desktop Chrome) and `mobile-chrome` (Pixel 5)
- `webServer` block: starts `npm run dev` on CI; reuses existing server locally
- HTML + list reporters; trace on first retry; screenshot on failure only
- CI mode: 2 retries, 2 workers, `forbidOnly: true`

### e2e/fixtures/mockAuth.js (NEW)
- `mockUserSession(page, role)` — intercepts Supabase `auth/v1/user`, `rest/v1/user_profiles`, and `auth/v1/token` with deterministic mock payloads for `user` or `buyer` roles
- `seedBuyerStorage(page)` — injects `buyer_settings` into localStorage via `addInitScript`

### e2e/.gitkeep (NEW)
- Ensures `e2e/` directory is tracked by git even before tests are added

### .github/workflows/ci.yml (UPDATED)
- Added `e2e` job after `test` job; `needs: lint-and-build`
- Runs on `ubuntu-latest`, installs Chromium with `--with-deps`
- `continue-on-error: true` so a failing E2E does not block the pipeline during ramp-up
- Uploads `playwright-report/` as a named artifact (`playwright-report-<sha>`, 7-day retention) on every run

### .gitignore (UPDATED)
- Added `playwright-report/` and `test-results/` under a new `# Playwright` section
- `e2e/` itself is NOT ignored — test files are committed

## Validation
- `npx playwright --version` → `Version 1.60.0`
- `npx playwright test --list` discovers 29+ tests across `e2e/tests/01-landing.spec.js`, `02-auth.spec.js`, `03-layout.spec.js` with correct project matrix (chromium + mobile-chrome)
- Config parses without errors; webServer block correctly reuses running Vite dev server locally

## Notes
- Chromium browser binary installed to `~/Library/Caches/ms-playwright/chromium-1223` (macOS arm64)
- `--with-deps` is a no-op on macOS but installs required system libs on the Ubuntu CI runner
- The `e2e` CI job runs in parallel with `test` (both `needs: lint-and-build`) to minimise wall-clock time
