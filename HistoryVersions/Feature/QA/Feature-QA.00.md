# Feature-QA.00 — Test Infrastructure: Vitest Unit Tests + Playwright E2E

18 May 2026 (18 พฤษภาคม 2569)

## Overview

ตั้งค่า test infrastructure ครบทั้ง 2 layers:
- **Unit tests (Vitest)** — แก้ไข tests ที่ fail และ config ที่ผิด; 17 tests pass
- **E2E tests (Playwright)** — copy test suite จาก agent worktree มาที่ main directory; 5 test files, ~50 specs

## Reason

- `npm run test:run` รัน tests จาก `.claude/worktrees/` ด้วย ทำให้ fail 12 files จาก 17
- `wasteItems.test.js` ใช้ grade-string API (`'A'`, `'B'`, `'C'`) แต่ `pricePerKg()` รับ boolean `clean` เท่านั้น
- E2E tests ถูก generate ใน worktrees แต่ไม่เคย copy มา main directory
- `@testing-library/dom` peer dependency ขาดหายไป

## Changes

### vite.config.js

เพิ่ม `exclude` ใน test config:
```js
exclude: ['**/node_modules/**', '**/.claude/worktrees/**', '**/e2e/**']
```

### src/__tests__/wasteItems.test.js (MODIFIED)

แก้ทุก test assertions ให้ใช้ boolean API จริง:
- `pricePerKg('aluminum_can', true)` = 40 (clean = base price)
- `pricePerKg('aluminum_can', false)` ≈ 28 (dirty = 70%)
- เพิ่ม test: default arg, all materials have positive base prices

### e2e/ (NEW)

```
e2e/
  fixtures/
    mockAuth.js          — Playwright route interceptors for Supabase auth + profile
  tests/
    01-landing.spec.js   — Landing page: hero, CTAs, role navigation
    02-auth.spec.js      — Login page: fields, validation, auth redirect
    03-layout.spec.js    — Responsive layout: desktop/mobile, no horizontal scroll
    04-user-flow.spec.js — User role pages: marketplace, scan, basket, map
    05-buyer-admin.spec.js — Buyer dashboard, pricing, calendar, materials tabs
```

### playwright.config.js

Already existed (correct). No changes needed.

### package.json

เพิ่ม `@testing-library/dom` ใน devDependencies (peer dep of @testing-library/react)

## Validation

- `npm run test:run` → 3 test files, 17 tests, 0 failures
- Worktree tests no longer picked up
- E2E suite structure verified: 5 files with Supabase route-intercept fixtures
- `npm run lint` → 0 errors

## Notes

- `mockAuth.js` interceptors ใช้ `page.route()` เพื่อ mock Supabase auth/profile endpoints — ไม่ต้องการ env vars จริงในการรัน E2E
- E2E tests รัน dev server อัตโนมัติผ่าน `webServer` ใน playwright.config.js
- สำหรับ CI: E2E tests ถูก integrate ใน pr.yml (future) หลังจาก playwright browser install step ถูกเพิ่ม
