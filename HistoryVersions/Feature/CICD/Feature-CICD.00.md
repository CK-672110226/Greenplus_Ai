# Feature-CICD.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Set up GitHub Actions CI/CD workflows for automated lint, build, and test on every push and pull request.

## Reason
No automated checks existed. PRs to main needed CI to catch lint errors and broken builds before merge.

## Changes

### .github/workflows/ci.yml (NEW)
- Triggers on: push to any branch, PR to main
- Job `lint-and-build`: checkout → Node 20 + npm cache → `npm ci` → `npm run lint` → `npm run build` → upload `dist/` artifact (7-day retention)
- Job `test`: needs `lint-and-build` → `npm ci` → `npm run test:run --reporter=verbose` (continue-on-error: true)

### .github/workflows/preview.yml (NEW)
- Triggers on: PR to main
- Job `build-preview`: builds dist, uploads artifact named `preview-pr-<number>`, posts comment on PR with link to the run

## Validation
- YAML syntax valid
- Workflow files follow actions/checkout@v4, actions/setup-node@v4, actions/upload-artifact@v4, actions/github-script@v7

## Notes
`continue-on-error: true` on the test step allows CI to report but not block when tests are incomplete (expected during early milestones).
