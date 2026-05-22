# GreenPlus Ai — Project Design Document

> อัปเดตล่าสุด: 22 พฤษภาคม 2569 (22 May 2026)  
> สถานะของทุก feature สะท้อน production branch `main` ณ วันนี้

---

## 1. Product Overview

GreenPlus Ai เป็น waste-to-value platform ที่เชื่อม **ผู้มีขยะรีไซเคิล** กับ **ร้านรับซื้อ** โดยใช้ AI สแกนประเมินราคาก่อนเดินทาง  
Pilot zone: ย่านมช. / ตำบลสุเทพ เชียงใหม่ — bilingual TH/EN

**เป้าหมาย:** ผู้ขายเดินถูกร้าน ได้ราคาตรง ร้านรับซื้อเต็ม intake queue โดยไม่ต้องวิ่งหาซัพพลาย

---

## 2. Roles

| Role | คือใคร | เข้าระบบจาก |
|------|--------|-------------|
| `user` | ผู้ขาย (นักศึกษา, freelancer) — สแกนขยะ จองร้าน ติดตาม driver | `/` → Login → `/home` |
| `buyer` | ร้านรับซื้อ — จัดการ order, ตั้งราคา, มอบหมาย driver | `/` → Login → `/dashboard` |
| `buyer` + `is_driver:true` | พนักงาน/driver ของร้าน — รับงานและขับรับ | `/driver` |
| `admin` | Moderator แพลตฟอร์ม — อนุมัติร้าน, ดูแล marketplace | `/x/admin` → `/admin` |

---

## 3. Navigation Structure

### User Shell — `UserLayout`
```
TopBar (sticky, h:56px)
  [G+ Logo]  [EN/TH toggle]  [basket icon + badge]

<page content>  (pb-68px)

BottomTabBar (fixed bottom, h:68px)
  [Home] [Scan] [Basket🔴badge] [Map] [Profile]
```

### Buyer Shell — `BuyerLayout`
```
Desktop (≥768px):
  Sidebar (fixed left, w:220px)
    [G+ Logo]
    Dashboard · Schedule · Pricing · Marketplace
    Shop Setup (badge เมื่อยังไม่ onboard)
    Driver Mode (ถ้า is_driver=true)
    Chat (badge unread)
    ─────
    Profile · Settings · Sign Out

Mobile (<768px):
  TopBar + BottomTabBar
    [Dashboard] [Marketplace] [Driver*] [Chat] [Profile]
    (* ถ้า is_driver=true)
```

### Admin Shell
```
NavBar + full-width content
ไม่มี sidebar — ใช้ tabs ภายใน AdminPage
```

---

## 4. Feature Map by Role

### 4.1 role: `user`

| Route | หน้า | ฟีดเจอร์ | สถานะ |
|-------|------|---------|-------|
| `/home` | HomePage | KPI (kg, ฿, pending payout), hatch bar chart, recent scans, nearby shops | ✅ |
| `/scan` | ScanPage | กล้อง AI 2-stage pipeline, batch queue, dirty/clean alert, add to basket, report misid | ✅ |
| `/basket` | BasketPage | รายการ scan, weight editor, TSP route planner, GPS, book pickup | ✅ |
| `/map` | MapPage | Leaflet map, shop markers (basket match), material filter, Open/Closed badge, directions | ✅ |
| `/marketplace` | MarketplacePage | ตลาดโพสต์, Open/Closed badge (shop hours), Post Ad form | ✅ |
| `/profile` | ProfilePage | Scan history, lifetime stats, avatar upload | ✅ |
| `/notifications` | NotificationsPage | รายการแจ้งเตือน (Redux only — ไม่มี push จาก backend) | ⚠️ |
| — | UserTrackingPanel | ติดตาม driver realtime, ETA, toast เมื่อ accepted/ใกล้มาถึง/arrived | ✅ |

**Toast notifications (user role):**
- Rider รับงาน → `"พบไรเดอร์แล้ว! กำลังมาหาคุณ"`
- Driver ระยะ < 500m → `"ไรเดอร์ใกล้มาถึงแล้ว! เตรียมของได้เลย"` (ยิงครั้งเดียว/booking)
- Driver arrived → `"ไรเดอร์มาถึงแล้ว! กรุณาออกมาพบ"`

---

### 4.2 role: `buyer` (ร้านรับซื้อ)

| Route | หน้า | ฟีดเจอร์ | สถานะ |
|-------|------|---------|-------|
| `/dashboard` | DashboardPage | Orders (accept/reject), Assign Driver modal, KPI, Bookings tab, pricing tab | ✅ |
| `/schedule` | SchedulePage | Calendar week view, list view (morning/afternoon/evening), confirm/cancel/complete, **inline assign driver picker** | ✅ |
| `/pricing` | PricingPage | ตั้งราคา per material, market rate comparison | ⚠️ local only |
| `/marketplace` | MarketplacePage | ดูโพสต์, Post Ad | ✅ |
| `/onboarding` | BuyerOnboardingPage | 3-step: shop info → materials → location + **opens_at / closes_at** | ✅ |
| `/chat` | ChatPage | Real-time 1:1 chat กับผู้ขาย, offer modal | ✅ |
| `/driver` | DriverDashboardPage | (ถ้า is_driver=true) ดูหัวข้อ driver ด้านล่าง | — |

**Assign Driver Flow (SchedulePage):**
1. ร้านเห็น booking ที่ confirmed ใน list view
2. กด `+ Assign Driver` → inline picker แสดง driver ทุกคน + จำนวนงานวันนี้
3. เลือก driver → ระบบเช็ค conflict ±30 นาที
4. หากไม่ conflict → `driver_assignment_status: 'invited'`

---

### 4.3 role: `buyer` + `is_driver: true` (Driver)

> Driver คือ user ของร้านที่ถูก flag `is_driver = true` ใน `user_profiles`  
> สามารถมีได้หลายคนต่อร้าน — จัดการผ่าน AdminPage Users tab

| Tab / ส่วน | ฟีดเจอร์ | สถานะ |
|-----------|---------|-------|
| Online/Offline toggle | อัปเดต `is_online` + เริ่ม GPS broadcast ทุก 30s | ✅ |
| **Today's Jobs panel** | แสดง jobs ของวันนี้ (สีเขียว) sorted by time, invited/accepted badge | ✅ |
| My Assignments tab | งานที่ร้านมอบหมาย (invited/accepted), accept/decline | ✅ |
| Customer Pickups tab | on-demand orders ภายใน 5km radius | ✅ |
| Inter-Shop Transfers tab | งานโอนวัสดุระหว่างร้าน (accept/cancel) | ✅ |
| GPS tracking | `current_lat/lng` → `user_profiles` → Realtime → UserTrackingPanel (ฝั่ง user) | ✅ |
| **Toast เมื่อได้งานใหม่** | Realtime subscription ตรวจ invited assignment ใหม่ → toast ชื่อร้าน + เวลา | ✅ |

**Driver Assignment Columns (bookings table):**
```
assigned_driver_id        UUID  → user_profiles.id ของ driver
driver_assignment_status  TEXT  → 'unassigned' | 'invited' | 'accepted' | 'rejected'
```

---

### 4.4 role: `admin`

| Tab | ฟีดเจอร์ | สถานะ |
|-----|---------|-------|
| Shops | pending list, approve/reject, active shops | ✅ |
| Users | list all users, ban/unban, edit role, **avatar display** | ✅ |
| Moderation | flag/remove marketplace posts | ✅ |
| Logistics | **RiderAssignmentPanel** (assign driver to booking), **TransferJobsPanel** (create/cancel transfer jobs) | ✅ |
| AI Studio | model registry, upload, activate/deploy | ✅ |
| Heatmap | placeholder | ❌ |
| System Monitor | presence (shops/users/drivers), anomaly rules, 30s refresh | ✅ |

---

## 5. Architecture

```
src/main.jsx
  <StrictMode>
    <Provider store>       ← Redux (12 slices)
      <PersistGate>        ← redux-persist (waste + pricing slices)
        <App />
```

```
src/App.jsx
  <AuthInitializer>        ← useAuth + useActiveModels + usePresence + darkMode sync
    <SmartLayout>          ← role → UserLayout | BuyerLayout | NavBar shell
      <Routes>
        /              LandingPage
        /login         LoginPage
        /x/admin       AdminLoginPage
        /home          HomePage            (user only)
        /scan          ScanPage            (user only)
        /basket        BasketPage          (user only)
        /map           MapPage             (user only)
        /marketplace   MarketplacePage     (user + buyer)
        /profile       ProfilePage         (all)
        /notifications NotificationsPage   (all)
        /settings      SettingsPage        (all)
        /chat          ChatPage            (buyer)
        /dashboard     DashboardPage       (buyer)
        /schedule      SchedulePage        (buyer)
        /pricing       PricingPage         (buyer)
        /onboarding    BuyerOnboardingPage (buyer)
        /driver        DriverDashboardPage (buyer + is_driver)
        /rider         RiderDashboardPage  (buyer only — on-demand mode)
        /admin         AdminPage           (admin)
```

---

## 6. Redux Store (12 slices)

| Slice | Persist | ข้อมูลหลัก |
|-------|---------|-----------|
| `user` | ❌ | session, profile, language, darkMode, loading |
| `waste` | ✅ | basket[], lastScan |
| `bookings` | ❌ | bookings[] |
| `marketplace` | ❌ | posts[] |
| `aiConfig` | localStorage | model, ONNX/TM/Vertex URLs, confidenceThreshold |
| `buyer` | localStorage | openDays, acceptedMaterials |
| `schedule` | ❌ | slots[] |
| `notifications` | ❌ | items[] |
| `pricing` | ✅ | prices{}, savedAt |
| `customLabels` | localStorage | {materialKey: {th, en}} |
| `logistics` | ❌ | activeBooking, nearbyOrders, riderLocation, isOnline |
| `chat` | ❌ | rooms[], activeRoomId, messages{} |

---

## 7. Supabase Database

### Tables (24 migrations, ล่าสุด: 024)

| Table | ใช้โดย |
|-------|--------|
| `user_profiles` | ทุก role — id ตรงกับ auth.users |
| `shops` | buyer onboarding, map, marketplace, bookings |
| `shop_pricing` | PricingPage, MarketplacePage, BasketPage |
| `bookings` | BasketPage (INSERT), DashboardPage/SchedulePage (SELECT/UPDATE), driver assignment |
| `booking_groups` | multi-shop on-demand (10-min expires_at) |
| `scan_history` | ScanPage (INSERT), ProfilePage (SELECT) |
| `marketplace_posts` | MarketplacePage |
| `notifications` | NotificationsPage (SELECT/INSERT) |
| `transfer_jobs` | AdminPage TransferJobsPanel, DriverDashboardPage |
| `chat_rooms` | ChatPage |
| `chat_messages` | ChatPage |
| `model_registry` | AdminPage AI Studio |
| `user_reports` | ScanPage (INSERT), AdminPage (SELECT/UPDATE) |

### Key booking columns (migrations 019–021)
```
pickup_mode              'dropOff' | 'onDemand'
pickup_lat / pickup_lng  พิกัดนัดรับ
booking_group_id         UUID → booking_groups
scheduled_for            TIMESTAMPTZ
assigned_driver_id       UUID → auth.users
driver_assignment_status 'unassigned' | 'invited' | 'accepted' | 'rejected'
```

### Key user_profiles columns (migrations 008, 020–023)
```
role              'user' | 'buyer' | 'admin'
is_driver         BOOLEAN
driver_vehicle    TEXT
is_online         BOOLEAN
current_lat/lng   FLOAT8  (driver GPS)
last_seen         TIMESTAMPTZ (2-min heartbeat)
avatar_url        TEXT    (Supabase Storage: avatars bucket)
onboarding_complete BOOLEAN
```

### Key shops columns (migrations 001, 023)
```
owner_id          UUID → user_profiles
opens_at          TIME  (e.g. '08:00')
closes_at         TIME  (e.g. '18:00')
status            'pending' | 'active' | 'rejected'
```

---

## 8. AI Pipeline

```
Camera / Upload
      ↓
Stage 1 — material type detection (priority order):
  1. YOLO ONNX   /model_ai/yolo_stage1.onnx        6 classes
  2. TM local    /model_ai/tm-my-image-model/       11 classes
  3. ONNX url    (if aiConfig.onnxStage1Url set)
  4. Vertex AI   (if aiConfig.vertexStage1Endpoint set)
  fallback → noDetection:true → toast ให้ user scan ใหม่
      ↓
Stage 2 — clean/dirty per material:
  1. TM per-material  /model_ai/{ขวด,กระดาษ,...}/
  2. ONNX cleanliness (if onnxStage2Url set)
  3. Vertex AI        (if vertexStage2Endpoint set)
  fallback → stage2Pass:true, stage2Skipped:true
      ↓
Result: { materialType, clean, confidence, factorScores, price }
→ dispatch addToBasket + INSERT scan_history
```

**WASTE_ITEMS (8 materials):**
`pet_bottle_clear`, `aluminum_can`, `cardboard`, `newspaper`, `mixed_plastic`, `copper`, `glass`, `cooking_oil`

---

## 9. Design System

| Token | ค่า | ใช้เมื่อ |
|-------|-----|---------|
| `--ink` | #1a1a1a | text, borders, shadows |
| `--ink-2` | #3a3a3a | secondary text |
| `--ink-3` | #6a6a6a | labels, metadata |
| `--ink-4` | #c0c0c0 | dividers, dashed borders |
| `--paper` | #f5f0e8 | background |
| `--paper-2` | #ede8dc | card, input background |
| `--green` | #4caf50 | active state fill |
| `--green-soft` | #e8f5e9 | success background |
| `--green-ink` | #2e7d32 | positive metric, CTA text |
| `--orange` | #e65100 | warning, pending |

**Border rule:** `1.5px solid var(--ink)` ทุก interactive surface  
**Shadow rule:** `2px 2px 0 var(--ink)` — flat, ไม่ใช่ blur  
**No border-radius** ยกเว้น avatar (rounded-full) และ status dots

**Typography classes:** `font-brand` (headings), `font-body` (prose), `font-data` (labels/metrics/mono)

---

## 10. Feature Status Summary

### ✅ Fully built
- AI scan pipeline (YOLO + TM local)
- Basket + route planner (TSP)
- Map with shop markers, Open/Closed, directions
- Marketplace with Open/Closed badge
- Shop onboarding (3-step, saves hours to DB)
- Dashboard orders (accept/reject/complete)
- Schedule calendar + list view + inline driver assignment
- Driver dashboard (today's jobs, assignments, transfers, GPS)
- Driver approaching notifications (3 states)
- Chat (real-time 1:1)
- Admin: shops/users/moderation/logistics/AI Studio
- Auth: email, Google OAuth, forgot password

### ⚠️ Partial (core works, gaps remain)
| ฟีดเจอร์ | ขาดอะไร |
|---------|---------|
| PricingPage | บันทึกแค่ localStorage — ยังไม่ persist ลง `shop_pricing` ใน Supabase |
| Notifications | Redux only — ไม่มี push จาก backend (DB trigger / Edge Function) |
| HomePage pending payout | สูตร ×63% hardcode — ควรคำนวณจาก actual bookings |
| LandingPage global stats | hardcode "—" — ควร query จาก scan_history + bookings |
| ProfilePage admin stats | hardcode 0 |
| `/rider` RiderDashboardPage | ซ้อนกับ `/driver` — ควร consolidate หรือแยก use case ให้ชัด |

### ❌ Not built
| ฟีดเจอร์ | หมายเหตุ |
|---------|---------|
| Admin Heatmap | placeholder — ต้อง aggregate scan_history by district |
| Flash / multi-camera | UI disabled ใน ScanPage |
| Settings: delete account | ปุ่มมีแต่ไม่มี handler |
| Export CSV (marketplace) | toast "coming soon" |

---

## 11. Key Hooks Reference

| Hook | ทำอะไร |
|------|--------|
| `useAuth` | Supabase session listener → Redux setSession/setProfile |
| `useSupabaseBookings` | SELECT bookings for current shop (buyer), applyStatus |
| `useBookingActions` | updateStatus (accept/reject/complete) with optimistic update |
| `useDriverAssignment` | fetchAvailableDrivers, assignDriver (±30-min conflict), respondToAssignment, myAssignments (Realtime + new-job toast) |
| `useRealtimeLogistics` | seller: booking status sub + driver GPS sub + approaching toasts; rider: nearby orders |
| `useBookingGroup` | multi-shop on-demand group (10-min expires_at, Realtime countdown) |
| `useSupabaseMarketplace` | posts + secondary query for shop hours (opensAt/closesAt) |
| `useSystemMonitor` | admin: presence tracking, 5 anomaly rules, 30s auto-refresh |
| `usePresence` | heartbeat ทุก 2 นาที → user_profiles.last_seen (mount ใน AuthInitializer only) |
| `useGPS` | navigator.geolocation wrapper |
| `useT` | wraps useTranslation() → t object |

---

## 12. Environment Variables

```
VITE_SUPABASE_URL        Supabase project URL
VITE_SUPABASE_ANON_KEY   Supabase anon key
VITE_SENTRY_DSN          Sentry error monitoring (optional)
```

---

## 13. CI/CD Pipeline (`.github/workflows/pr.yml`)

```
PR → main:
  Stage 1: Lint + Unit Tests    (Vitest + ESLint)
  Stage 2: Build                (Vite, injects VITE_* secrets)
  Stage 3: Smoke Tests          (Playwright, 00-smoke.spec.js only)

Merge → Vercel auto-deploy (production)
```

---

*สำหรับรายละเอียด visual spec อ่าน `docs/design-spec.md`  
สำหรับ component API อ่าน `docs/ui-components.md`  
สำหรับ page composition อ่าน `docs/user-flow.md`*
