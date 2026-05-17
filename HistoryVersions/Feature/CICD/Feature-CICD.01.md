# Feature-CICD.01 — Fix Duplicate Preview Deploy; Add VITE_SENTRY_DSN to preview.yml

18 May 2026 (18 พฤษภาคม 2569)

## Overview

แก้ไข duplication ระหว่าง `pr.yml` และ `preview.yml` ที่ต่าง trigger บน `pull_request` และต่างทำ Vercel preview deploy

## Reason

- `pr.yml` (Feature-CICD.00) มี 3 stages: check → build → preview
- `preview.yml` (existing, committed ก่อน session นี้) ทำ Vercel preview deploy อยู่แล้ว
- ทั้งสองรันบน `pull_request` → duplicate deploy, double PR comments, wasted CI minutes
- `preview.yml` fallback build step ขาด `VITE_SENTRY_DSN`

## Changes

### .github/workflows/pr.yml (MODIFIED)

ลบ `preview` job ออกทั้งหมด (38 lines):
- ลบ `pull-requests: write` + `deployments: write` permissions (ไม่จำเป็นแล้ว)
- คงไว้เฉพาะ `check` (lint + unit tests) และ `build` (build verification)
- อัพเดต header comment: "Preview deploy is handled separately by preview.yml"

### .github/workflows/preview.yml (MODIFIED)

เพิ่ม `VITE_SENTRY_DSN` ใน fallback build step (no Vercel token path):
```yaml
- name: Build (no Vercel token — build verification only)
  env:
    VITE_SUPABASE_URL:      ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    VITE_SENTRY_DSN:        ${{ secrets.VITE_SENTRY_DSN }}   ← เพิ่ม
```

## Final CI/CD Architecture

```
pull_request → main:
  pr.yml       → check (lint + test) → build [blocks merge]
  preview.yml  → Vercel preview deploy → PR comment (optional, needs VERCEL_TOKEN)

push → main:
  deploy.yml   → gate (lint) → deploy (Vercel production)
```

## Validation

- YAML syntax valid (no structural changes — only deletion and one env var addition)
- Secret names consistent across all 3 workflows: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SENTRY_DSN
- `npm run lint` → 0 errors

## Notes

- `preview.yml` IDE warning "Unrecognized named-value: 'secrets'" is a false positive — `${{ secrets.X }}` is valid GitHub Actions expression syntax; pre-existing in file before this change
