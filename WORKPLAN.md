# GreenPlus Ai — Work Plan v2

**Date:** 14 May 2026
**Status:** Active
**Owner:** chanachot_k@cmu.ac.th

---

## สถานะปัจจุบัน (Current State)

All feature branches merged to `main` (14 May 2026):
- `feat/vertex-ai-supabase-integration` ✅
- `feat/buyer-portal-full` ✅
- `feat/ai-suite` ✅
- `feat/prompt-engineering-speed-insights` ✅

---

## การแบ่งงาน (Division of Work)

### ส่วนที่ **คุณ** ต้องทำ (Supabase Dashboard / Google Console)

#### 🔴 ด่วนมาก — ทำก่อนเลย

| # | งาน | วิธีทำ |
|---|-----|--------|
| S-01 | **ปิด Email Confirmation** (สำหรับ dev) | Supabase → Authentication → Providers → Email → ปิด "Confirm email" |
| S-02 | **เปิด Google OAuth** | Supabase → Authentication → Providers → Google → ใส่ Client ID + Secret |
| S-03 | **ตั้ง Redirect URLs** | Supabase → Authentication → URL Configuration → เพิ่ม `http://localhost:5173/**` และ production URL |
| S-04 | **สร้าง Google OAuth App** | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 |

#### 🟡 ทำหลัง S-01–S-04 เสร็จ

| # | งาน | วิธีทำ |
|---|-----|--------|
| S-05 | **Run migrations** | Supabase → SQL Editor → run `001_init.sql` → `002_rls_hardening.sql` → `003_vertex_ai.sql` → `004_performance_hardening.sql` ตามลำดับ |
| S-06 | **สร้าง admin account** | สมัครในแอป → Supabase SQL Editor: `UPDATE public.user_profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com')` |
| S-07 | **สร้าง Supabase Storage buckets** | สร้าง bucket: `training-images` (public), `ai-models` (public) |
| S-08 | **ตั้ง VITE env vars ใน Vercel** | Vercel Dashboard → Project → Settings → Environment Variables → เพิ่ม `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

---

### ส่วนที่ **Claude** ทำแล้ว (Code Changes)

#### ✅ Foundation (C-01 to C-14) — Done

| # | งาน | สถานะ |
|---|-----|-------|
| C-01 | Fix LoginPage — ลบ Google button ซ้ำ, รวม handler | ✅ Done |
| C-02 | Admin Login URL ซ่อน `/x/admin` | ✅ Done |
| C-03 | User portal layout — Shopee-like, bottom tab bar | ✅ Done |
| C-04 | Buyer portal layout — industrial dashboard sidebar | ✅ Done |
| C-05 | Marketplace post form | ✅ Done |
| C-06 | Two-Stage AI architecture — Stage 1: type+size, Stage 2: cleanliness | ✅ Done |
| C-07 | Admin AI Studio UI — upload training data, train, deploy | ✅ Done |
| C-08 | Waste Rules Engine | ✅ Done |
| C-09 | Email verification flow | ✅ Done |
| C-10 | Supabase live data hooks (scan_history insert, eco_points) | ✅ Done |
| C-11 | Real GPS distance (Haversine) ใน Basket routing | ✅ Done |
| C-12 | ONNX model integration | ✅ Done |
| C-13 | Booking system (seller → shop slot booking) | ✅ Done |
| C-14 | Admin moderation (flagged posts removal) | ✅ Done |

---

#### ✅ Buyer Portal (B-01 to B-07) — Done

| # | งาน | สถานะ |
|---|-----|-------|
| B-01 | BuyerLayout — 7-item nav (Main: Dashboard/Schedule/Marketplace/Pricing, Account: Notifications/Profile/Settings) | ✅ Done |
| B-02 | DashboardPage — KPI cards, weekly chart, recent bookings + accept/reject (Supabase) | ✅ Done |
| B-03 | SchedulePage — today's slots, morning/afternoon/evening groups, confirm/complete/cancel → writes to Supabase | ✅ Done |
| B-04 | PricingPage — per-material A/B/C pricing, market rate indicator ↑↓, save/reset | ✅ Done |
| B-05 | NotificationsPage — today/earlier sections, unread badge, mark-all-read, dismiss | ✅ Done |
| B-06 | Redux slices — pricingSlice (localStorage persist), scheduleSlice, notificationSlice (empty init) | ✅ Done |
| B-07 | i18n keys — schedule/pricing/notifications/nav labels (EN + TH) | ✅ Done |

---

#### ✅ Vertex AI + Supabase Integration — Done

| # | งาน | สถานะ |
|---|-----|-------|
| V-01 | vertexAI.js service — REST calls to AutoML endpoints, Stage 1 + Stage 2 | ✅ Done |
| V-02 | twoStageAI.js — priority chain: ONNX → Vertex AI → Mock | ✅ Done |
| V-03 | aiConfigSlice — 5 Vertex AI fields (projectId, location, token, s1/s2 endpoint) | ✅ Done |
| V-04 | Admin Vertex Config UI — ใส่ endpoint IDs, save config | ✅ Done |
| V-05 | Supabase hooks — useSupabaseBookings, useSupabaseMarketplace, useShops, useUserReports | ✅ Done |
| V-06 | Remove all mock seed data from Redux slices | ✅ Done |
| V-07 | ScanPage report flow — user report misclassification → user_reports table | ✅ Done |
| V-08 | Admin Reports tab — approve/reject user reports → creates training_images entry | ✅ Done |
| V-09 | Stage 2 upload UI — clean/dirty images per material → Supabase Storage | ✅ Done |
| V-10 | Export Dataset Manifest — JSON download of all training_images | ✅ Done |
| V-11 | DB migrations — 002_rls_hardening, 003_vertex_ai, 004_performance_hardening | ✅ Done |

---

## Admin Portal Roadmap (A-01 to A-06)

| # | งาน | Priority | สถานะ |
|---|-----|----------|-------|
| A-01 | Admin login guide + secret URL `/x/admin` | ✅ Done |
| A-02 | Admin AI Studio — upload classification images, train, deploy | ✅ Done |
| A-03 | Admin Reports tab — review user-reported misclassifications | ✅ Done |
| A-04 | Admin Shops tab — connect PENDING_SHOPS/ACTIVE_SHOPS to Supabase | 🔴 High | ⏳ Pending |
| A-05 | Admin Heatmap — real scan data plotted on map (replace static markers) | 🟡 Medium | ⏳ Pending |
| A-06 | Admin Analytics — weekly volume, revenue, top materials dashboard | 🟢 Low | ⏳ Pending |

---

## Vercel Deployment

| # | งาน | สถานะ |
|---|-----|-------|
| D-01 | Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to Vercel env vars | ⏳ Pending |
| D-02 | Run `npx vercel --prod --yes` (or login via browser) | ⏳ Pending |
| D-03 | Test production URL — login, scan, basket, admin | ⏳ Pending |

---

## Two-Stage AI Architecture

### Stage 1 — Material Classification
```
Input: Camera frame
Model: ONNX (Teachable Machine export) → Vertex AI AutoML → Mock fallback
Output: { materialType, sizeKg, confidence }
Threshold: confidence ≥ 0.60 → proceed to Stage 2
```

### Stage 2 — Cleanliness Scoring
```
Input: Same frame
Model: ONNX cleanliness classifier → Vertex AI → Mock fallback
Output: { cleanlinessScore (0-100), grade (A/B/C), failReasons[] }
```

### Decision Logic
```
S1 PASS + S2 score ≥ 80  → Grade A
S1 PASS + S2 score 50-79 → Grade B
S1 PASS + S2 score 30-49 → Grade C
S1 PASS + S2 score < 30  → Reject — "ทำความสะอาดก่อน"
S1 FAIL (troll)          → Reject — "ไม่รู้จักวัสดุนี้"
S1 confidence low        → "กรุณาถ่ายใหม่ในที่แสงดีขึ้น"
```

### Model Training Flow (Admin)
```
1. Admin อัปโหลดรูปใน AI Studio tab (≥3 รูป/class)
2. Export Dataset Manifest → download JSON
3. Train ใน Teachable Machine หรือ Vertex AutoML
4. Convert → ONNX (local) หรือ deploy endpoint (Vertex)
5. ใส่ URL/Endpoint ใน Admin → Vertex Config
6. ระบบ switch จาก mock → real model อัตโนมัติ
```

---

## สิ่งที่ต้องทำต่อ

- [ ] S-05: Run 4 migration files ใน Supabase SQL Editor
- [ ] S-06: สร้าง admin account
- [ ] S-07: สร้าง Storage buckets
- [ ] S-08: Set env vars ใน Vercel
- [ ] A-04: Connect admin shops tab to Supabase
- [ ] D-01–D-03: Deploy to Vercel production
