# Feature-CICD.01

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Senior DevOps improvement pass: separated CI jobs, added dummy env vars for build, added production deploy workflow, `.env.example`, `.nvmrc`, and Dependabot config.

## Reason

- `ci.yml` passed undefined `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` to build — Vite warned on every CI run; `createClient(undefined, undefined)` produced a broken runtime bundle
- Lint and test ran sequentially after build (lint → build → test); lint and test are independent after install — parallelising them saves CI time
- No `.env.example` — developers had no template for required env vars; CI had no documentation of what secrets to set
- No `.nvmrc` — Node version was only specified in `ci.yml`; local environments could drift
- No Dependabot — security vulnerabilities in npm deps would go undetected
- No production deploy workflow — deployment was manual via `vercel` CLI

## Changes

### `.env.example` (NEW)
- Documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with placeholder values
- Instructions to copy to `.env.local` and never commit real values

### `.nvmrc` (NEW)
- Contains `20` — pins Node version for local dev (used by `nvm use`, Volta, and `setup-node`)

### `.github/dependabot.yml` (NEW)
- Weekly npm updates, grouped by ecosystem (tailwind, supabase, react, vite)
- Monthly GitHub Actions updates
- `onnxruntime-web` pinned to minor/patch only — major WASM API breaks are high-risk

### `.github/workflows/ci.yml` (UPDATED)
- Extracted `NODE_VERSION: "20"` and dummy `VITE_SUPABASE_*` as top-level `env:` block
- Split into three jobs: `lint` → (`build` | `test` in parallel)
- `build` depends on `lint`; `test` depends on `lint` — eliminates sequential lint-build-test bottleneck
- `test` still runs with `continue-on-error: true` until test coverage is comprehensive

### `.github/workflows/deploy.yml` (NEW)
- Triggers on push to `main` only
- Uses `environment: production` for GitHub's environment protection rules
- Reads real `VITE_SUPABASE_URL/KEY` from GitHub Secrets (not dummy values)
- Deploys via `npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}`
- Requires three GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Required GitHub Secrets for deploy.yml

Set these in: GitHub repo → Settings → Secrets and variables → Actions

| Secret | Where to find |
|--------|--------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `npx vercel env ls` or `~/.vercel/project.json` |
| `VERCEL_PROJECT_ID` | same as above |

## Validation

- YAML syntax manually verified
- `npm run build` with dummy env vars — builds successfully (Supabase client initializes but cannot connect at runtime, which is correct for CI)

## Branching Strategy (Going Forward)

Work should be separated by concern:

| Branch pattern | Purpose |
|---|---|
| `feature/<scope>` | New feature work per PRD milestone |
| `fix/<scope>` | Bug fixes |
| `hotfix/<scope>` | Critical production fixes (branched from main) |
| `chore/<scope>` | DevOps, deps, tooling (no user-facing code) |

Current session changes should be split as:
- `feature/ui-a11y` ← Button, Card, AdminLoginPage focus states
- `feature/ml-pipeline-hardening` ← onnxInference, secondBrain, twoStageAI, AdminPage model options
- `feature/design-tokens-v2` ← index.css @theme + utilities
- `chore/devops-improvements` ← this file's changes
