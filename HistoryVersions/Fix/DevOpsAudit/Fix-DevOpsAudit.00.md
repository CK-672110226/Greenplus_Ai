# Fix-DevOpsAudit.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Full environment variables and secrets audit across all four GitHub Actions workflows, Vercel deployment, Supabase Edge Functions, and the frontend build. Two issues fixed; full secrets matrix documented.

## Issues Fixed

### Fix 1 — `ci.yml` used non-existent GitHub Actions versions (CRITICAL)

`ci.yml` referenced `actions/checkout@v6`, `actions/setup-node@v6`, and `actions/upload-artifact@v7` — none of which exist (current latest is `@v4`). These would cause immediate step failures on any feature branch push.

Fixed by downgrading all three to `@v4` to match the other three workflows.

### Fix 2 — `ci.yml` `pull_request` trigger duplicated `pr.yml` (MEDIUM)

`ci.yml` had both a `push` and a `pull_request` trigger. On every PR push, both `ci.yml` (lint + build) and `pr.yml` (lint + tests + build + smoke) ran in parallel, doubling CI usage with a strictly redundant weaker run.

Fixed by removing the `pull_request` trigger from `ci.yml`. It now runs only on feature branch pushes (before a PR is opened), which is its unique value. PR coverage is exclusively handled by the more comprehensive `pr.yml`.

Also added `VITE_SENTRY_DSN` to the build step in `ci.yml` (was present in `pr.yml` but missing here, causing inconsistent builds).

### Fix 3 — Missing `.env.example` file (MEDIUM)

`.gitignore` explicitly allows `.env.example` (`!.env.example`) meaning it should be tracked, but the file didn't exist. Developers had no canonical reference for required env vars.

Created `.env.example` documenting all variables with their source locations and security notes.

---

## Secrets / Env Var Matrix

### Frontend (VITE_* — bundled into build at compile time)

| Variable | Required | Where Set |
|----------|----------|-----------|
| `VITE_SUPABASE_URL` | **Required** | GitHub Secrets, Vercel env, `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | **Required** | GitHub Secrets, Vercel env, `.env.local` |
| `VITE_SENTRY_DSN` | Optional | GitHub Secrets, Vercel env, `.env.local` |
| `VITE_VERTEX_PROJECT_ID` | Optional | Vercel env, `.env.local` only |
| `VITE_VERTEX_LOCATION` | Optional | Vercel env, `.env.local` only |
| `VITE_VERTEX_ACCESS_TOKEN` | **NEVER in CI** | Admin UI only (localStorage) |

`VITE_VERTEX_ACCESS_TOKEN` is a short-lived GCP OAuth2 token — it rotates frequently and must never be committed or added to GitHub Secrets. Admins set it manually in the admin AI settings panel; it is stored in `localStorage` via `aiConfigSlice`.

### GitHub Actions secrets (set in repo Settings → Secrets → Actions)

| Secret | Required For | Workflows |
|--------|-------------|-----------|
| `VITE_SUPABASE_URL` | Build | ci.yml, deploy.yml, pr.yml, preview.yml |
| `VITE_SUPABASE_ANON_KEY` | Build | ci.yml, deploy.yml, pr.yml, preview.yml |
| `VITE_SENTRY_DSN` | Build (optional) | ci.yml, deploy.yml, pr.yml, preview.yml |
| `VERCEL_TOKEN` | Vercel deploy | deploy.yml, preview.yml |
| `VERCEL_ORG_ID` | Vercel deploy | deploy.yml, preview.yml |
| `VERCEL_PROJECT_ID` | Vercel deploy | deploy.yml, preview.yml |

If `VERCEL_TOKEN` is absent, all four workflows gracefully fall back to a plain `npm run build` for verification without deploying.

### Supabase Edge Function secrets (Supabase Dashboard → Edge Functions → Secrets)

| Secret | Required For | Notes |
|--------|-------------|-------|
| `ANTHROPIC_API_KEY` | `classify-waste` function | Never in frontend or CI |
| `SUPABASE_URL` | `classify-waste` function | Auto-injected by Supabase |
| `SUPABASE_ANON_KEY` | `classify-waste` function | Auto-injected by Supabase |

### Vercel environment variables (Vercel Dashboard → Project → Settings → Environment Variables)

| Variable | Environment | Notes |
|----------|-------------|-------|
| `VITE_SUPABASE_URL` | All | Same as GitHub Secret |
| `VITE_SUPABASE_ANON_KEY` | All | Same as GitHub Secret |
| `VITE_SENTRY_DSN` | Production | Optional |
| `VITE_VERTEX_PROJECT_ID` | Production | Optional |
| `VITE_VERTEX_LOCATION` | Production | Optional |

`VITE_VERTEX_ACCESS_TOKEN` should NOT be in Vercel env — it is set per-admin-session only.

---

## Workflow Summary (post-fix)

| Workflow | Trigger | Jobs | Purpose |
|----------|---------|------|---------|
| `ci.yml` | Push to non-main | lint + build | Fast feedback on feature branches before PR |
| `pr.yml` | PR → main | lint + tests + build + smoke | Full gate before merge |
| `preview.yml` | PR → main | Vercel preview | Deploy preview URL, comment on PR |
| `deploy.yml` | Push to main | lint gate + deploy | Production deployment after merge |

## Files Changed

- `.github/workflows/ci.yml` — fixed action versions, removed pull_request trigger, added VITE_SENTRY_DSN
- `.env.example` — created with full documentation of all variables
