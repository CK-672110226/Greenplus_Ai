# Feature-CICD.00 — CI/CD Pipeline: PR Check + Production Deploy

18 May 2026 (18 พฤษภาคม 2569)

## Overview

ตั้งค่า GitHub Actions CI/CD pipeline ครบทั้ง 2 workflow:
- `pr.yml` — รัน lint + unit tests + build + optional Vercel preview deploy บน Pull Request ทุกอัน
- `deploy.yml` — รัน lint → build → Vercel production deploy บน push to main (มีอยู่แล้ว; แก้ไข SENTRY_DSN)

## Reason

Deploy workflow เดิมรัน push-to-main เท่านั้น ไม่มี PR check → build failures อาจผ่าน review และถึง main โดยไม่ถูกตรวจสอบ นอกจากนี้ VITE_SENTRY_DSN ขาดหายไปจาก fallback build step

## Changes

### .github/workflows/pr.yml (NEW)

Pipeline 3 stages:
1. **check** — `npm ci` + `npm run lint` + `npm run test:run`
2. **build** — `npm run build` พร้อม env vars ทั้ง 3 (SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN)
3. **preview** — Vercel preview deploy (ข้ามถ้า VERCEL_TOKEN ไม่ถูกตั้ง), post URL comment ลบน PR

### .github/workflows/deploy.yml (MODIFIED)

- เพิ่ม `VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}` ใน "Build (no Vercel token)" step

## Validation

- Lint: pass (0 errors)
- YAML syntax: valid
- Node version: 24 ใน setup-node (consistent กับ FORCE_JAVASCRIPT_ACTIONS_TO_NODE24)
- Secret names align กับ existing deploy.yml: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SENTRY_DSN

## Notes

- `if: ${{ secrets.VERCEL_TOKEN != '' }}` — GitHub Secrets return empty string when not set, this condition correctly skips deploy when token not configured
- preview job posts comment to PR via `actions/github-script@v7` using `pull-requests: write` permission
