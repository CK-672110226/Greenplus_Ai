# Fix-CICD.00 — GitHub Actions Workflow Permissions Fix

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview
Fixed two issues in the GitHub Actions CI/CD workflows: PR Preview workflow failing with 403 when posting PR comments, and CI artifact name collision across runs.

## Reason
- `preview.yml` called `github.rest.issues.createComment` without `pull-requests: write` permission declared, and without `return await`, causing a 403 "Resource not accessible by integration" error on every PR.
- `ci.yml` artifact name `dist` (static) would collide if multiple branches ran CI simultaneously; renamed to `dist-${{ github.sha }}` to make each artifact unique.

## Changes

### `.github/workflows/preview.yml`
- Added `permissions: pull-requests: write / contents: read` block at workflow level
- Added `return await` to the `github-script` step so errors surface correctly
- Added ✅ prefix to comment body for visual clarity

### `.github/workflows/ci.yml`
- Added `permissions: contents: read` (least-privilege default)
- Renamed artifact from `dist` → `dist-${{ github.sha }}` to avoid upload collisions

## Validation
- `npm run lint` — 0 errors (YAML not linted by ESLint, confirmed syntax manually)
- `npm run build` — unchanged, passes
- Next PR will exercise the fixed `preview.yml`

## Notes
- `continue-on-error: true` on test step retained intentionally — test suite is not yet comprehensive enough to gate merges.
