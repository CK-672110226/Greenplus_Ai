# Feature-CICD.03 — Fix Vercel deploy: vercel pull → build → deploy --prebuilt

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Every push to `main` was showing a "Failed to deploy" entry in the Vercel dashboard because `deploy.yml` ran `npx vercel --prod --token=` with an empty token. Vercel's native GitHub integration was already deploying successfully in parallel, making our workflow a duplicate that only produced noise.

## Reason

`VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are not yet set as GitHub repository secrets. The CLI receives `--token=` (empty) and exits with error code 1. The fix has two parts:
1. Guard every Vercel CLI step with `if: ${{ secrets.VERCEL_TOKEN != '' }}` so it skips gracefully when the token is absent.
2. Upgrade to the `vercel pull → vercel build --prod → vercel deploy --prebuilt --prod` pattern (builds once in CI, deploys the artifact — no redundant rebuild on Vercel's servers).

## Changes

### `.github/workflows/deploy.yml`

- **Pull step (new):** `vercel pull --yes --environment=production` pulls env vars from Vercel project settings before build. Guarded by `if: VERCEL_TOKEN != ''`.
- **Build step:** replaced `npm run build` + GitHub env secrets with `vercel build --prod`. Guarded. Fallback `npm run build` with GitHub secrets runs when token is absent (keeps lint+build verification green).
- **Deploy step:** replaced `npx vercel --prod` with `vercel deploy --prebuilt --prod`. Guarded.
- Downgraded `actions/checkout@v6` → `@v4` (v6 does not exist; Dependabot bumped incorrectly).
- Downgraded `actions/setup-node@v6` → `@v4` (same reason).

### `.github/workflows/preview.yml`

- Same `vercel pull → vercel build → vercel deploy --prebuilt` pattern for preview deployments.
- Guarded with `if: VERCEL_TOKEN != ''`.
- Fallback plain build when token absent.
- Downgraded checkout and setup-node to v4.
- Removed emoji from PR comment body (project style).

## Branch Plan (unchanged)

```
feature/* push  →  lint + build + unit tests
fix/* push      →  lint + build + unit tests
PR to main      →  lint + build + unit tests + E2E + Vercel preview comment
push to main    →  lint gate → Vercel prod deploy (skips if no token)
```

## Validation

- Lint: 0 errors
- When `VERCEL_TOKEN` is set: full `pull → build → deploy --prebuilt` runs
- When `VERCEL_TOKEN` is absent: deploy steps skipped, plain `npm run build` verifies the artifact

## Notes

- To activate production deploys via GitHub Actions: add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` to GitHub repo secrets (Settings → Secrets → Actions). Get them from `vercel.com/account/tokens` and `.vercel/project.json` (run `npx vercel link` locally).
- Vercel's native GitHub integration will continue deploying in parallel until those secrets are set; both are safe to run simultaneously (same SHA, idempotent).
