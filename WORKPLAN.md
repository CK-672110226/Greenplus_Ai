# GreenPlus Ai — Work Plan v2

**Date:** 14 May 2026  
**Status:** Active  
**Owner:** chanachot_k@cmu.ac.th

---

## สถานะปัจจุบัน (Current State)

Version 1 prototype merged to `main`. พื้นฐานครบ แต่ต้องปรับสถาปัตยกรรมใหญ่ตาม feedback ล่าสุด

---

## การแบ่งงาน (Division of Work)

### ส่วนที่ **คุณ** ต้องทำ (Supabase Dashboard / Google Console)

#### 🔴 ด่วนมาก — ทำก่อนเลย

| # | งาน | วิธีทำ |
|---|-----|--------|
| S-01 | **ปิด Email Confirmation** (สำหรับ dev) | Supabase Dashboard → Authentication → Providers → Email → ปิด "Confirm email" | 
| S-02 | **เปิด Google OAuth** | Supabase → Authentication → Providers → Google → เปิด, ใส่ Client ID + Secret จาก Google Cloud Console |
| S-03 | **ตั้ง Redirect URLs** | Supabase → Authentication → URL Configuration → เพิ่ม `http://localhost:5173/**` และ production URL |
| S-04 | **สร้าง Google OAuth App** | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 → เพิ่ม `https://<project>.supabase.co/auth/v1/callback` ใน Authorized redirect URIs |

#### 🟡 ทำหลัง S-01–S-04 เสร็จ

| # | งาน | วิธีทำ |
|---|-----|--------|
| S-05 | **Run migration SQL** | Supabase → SQL Editor → paste `supabase/migrations/001_init.sql` → Run |
| S-06 | **สร้าง test accounts** | Supabase → Authentication → Users → Add user (ทำ 3 คน: user / buyer / admin) แล้วแก้ role ใน `user_profiles` table |
| S-07 | **ตั้ง RLS policy สำหรับ user_profiles insert** | ตอน sign up ต้องให้ insert ได้ — เพิ่ม policy: `CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);` |
| S-08 | **Upload trained ONNX model** *(ทีหลัง)* | Supabase Storage → สร้าง bucket `ai-models` → upload `.onnx` file ที่ train จาก Teachable Machine |

---

### ส่วนที่ **Claude** จะทำ (Code Changes)

#### 🔴 ด่วน — กำลังทำอยู่

| # | งาน | Branch | สถานะ |
|---|-----|--------|-------|
| C-01 | **Fix LoginPage** — ลบ Google button ซ้ำ, รวม handler เดียว, แก้ email-not-confirmed error | `fix/login` | 🔄 In Progress |
| C-02 | **Admin Login URL ซ่อน** — route `/x/admin` ไม่โชว์ใน nav, ไม่มีลิงก์จากหน้าไหน | `fix/login` | 🔄 In Progress |
| C-03 | **User portal layout** — Shopee-like, bottom tab bar, layout แยกจาก buyer | `feat/user-portal` | ⏳ Next |
| C-04 | **Buyer portal layout** — industrial dashboard layout, sidebar nav | `feat/buyer-portal` | ⏳ Next |

#### 🟡 ถัดไป

| # | งาน | Branch | สถานะ |
|---|-----|--------|-------|
| C-05 | **Marketplace post form** — User โพสต์ขายของใน Marketplace ด้วยตัวเอง | `feat/marketplace-post` | ⏳ |
| C-06 | **Two-Stage AI architecture** — Stage 1: type+size classification, Stage 2: cleanliness scoring | `feat/ai-v2` | ⏳ |
| C-07 | **Admin Teachable Machine UI** — อัปโหลด training data, เทรนโมเดล, deploy | `feat/admin-ai-studio` | ⏳ |
| C-08 | **Waste Rules Engine** — Backend rules/guidelines per material type (Thai standard) | `feat/waste-rules` | ⏳ |
| C-09 | **Email verification flow** — หน้า verify-email, resend email, blocked state | `fix/login` | ⏳ |

#### 🟢 ทีหลัง

| # | งาน |
|---|-----|
| C-10 | Supabase live data hooks (scan_history insert, eco_points increment) |
| C-11 | Real GPS distance (Haversine) ใน Basket routing |
| C-12 | ONNX model integration (replace mock inference) |
| C-13 | Booking system (seller → shop slot booking) |
| C-14 | Admin moderation (flagged posts removal) |

---

## รายละเอียดงาน C-01 ถึง C-04

### C-01 + C-02: Login Fix

**ปัญหาที่พบ:**
- `LoginPage.jsx` มี Google button **2 อัน** และ handler **2 ตัว** (`handleGoogleSignIn` / `handleGoogle`) ขัดกัน — merge artifact
- ไม่มี error handling สำหรับ Supabase `"Email not confirmed"` error
- Admin ไม่ควรมีปุ่ม Login ใน landing page หรือ nav — เข้าได้เฉพาะ `/x/admin`

**วิธีแก้ (Claude จะทำ):**
```
/login?role=user    → User/Buyer login (มี Google OAuth)
/login?role=buyer   → Buyer login (มี Google OAuth)  
/x/admin            → Admin login เฉพาะ (email/password only, ไม่มี Google)
```

---

### C-03: User Portal (Shopee-like Layout)

**โครงสร้าง:**
```
UserLayout
├── TopBar (logo + ไอคอน basket + ไอคอน profile)
├── <Outlet /> (page content)
└── BottomTabBar
    ├── 🏠 Home (scan quick-start)
    ├── 🔍 Scan
    ├── 🛒 Basket (badge)
    ├── 🗺️ Map
    └── 👤 Profile
```

---

### C-04: Buyer Portal (Industrial Dashboard)

**โครงสร้าง:**
```
BuyerLayout
├── Sidebar (desktop) / TopBar (mobile)
│   ├── Dashboard
│   ├── Bookings
│   ├── Pricing
│   ├── Shop Profile
│   └── Marketplace
└── <Outlet />
```

---

## Two-Stage AI Architecture (C-06)

### Stage 1 — Object Detection & Sizing
```
Input: Camera frame
Model: ONNX (Teachable Machine export)
Output: { materialType, boundingBox, sizeEstimate, confidence }
Threshold: confidence ≥ 0.60 → proceed to Stage 2
Fail: "ไม่สามารถระบุประเภทได้ กรุณาลองใหม่"
```

### Stage 2 — Cleanliness Scoring
```
Input: Cropped region from Stage 1 bounding box
Model: Second ONNX model (cleanliness classifier)
Output: { cleanlinessScore (0-100), failReasons[] }
```

### Decision Logic
```
Stage 1 PASS + Stage 2 PASS (score ≥ 50) → Grade A/B/C → "ขายได้"
Stage 1 PASS + Stage 2 FAIL (score < 50) → "ทำความสะอาดก่อน หรือทิ้งให้ถูกวิธี"
Stage 1 FAIL → "ไม่รู้จักวัสดุนี้ ลองใหม่"
```

---

## Waste Rules Engine (C-08)

### ข้อมูลที่ต้องมีใน Backend

```sql
-- waste_rules table
material_type     text
country_code      text  -- 'TH'
rule_type         text  -- 'preparation', 'contamination', 'disposal', 'pricing_note'
title_th          text
title_en          text
detail_th         text
detail_en         text
severity          text  -- 'info', 'warning', 'reject'
```

### กฏ Thai Standard (เริ่มต้น)

| วัสดุ | กฏ | ระดับ |
|-------|-----|-------|
| PET Bottle | ต้องล้างสะอาด ถอดฝา บีบแบน | warning |
| PET Bottle | ห้ามมีของเหลวเหลืออยู่ | reject |
| Aluminum Can | บีบแบนได้ แต่ไม่ต้องล้าง | info |
| Cardboard | ต้องแห้ง ไม่เปียก ไม่มีเทป | warning |
| Cardboard | ลอกสติ๊กเกอร์ออก | info |
| Newspaper | ต้องแห้ง ไม่ฉีกขาดมาก | warning |
| Copper | ต้องแยกจากสายไฟพลาสติก | warning |
| Glass | ล้างสะอาด แยกสีได้ (ใสได้ราคาดีกว่า) | info |
| Cooking Oil | บรรจุในภาชนะปิด ไม่ปนน้ำ | reject (if water) |
| Mixed Plastic | แยกประเภทได้ราคาดีกว่า | info |

---

## Admin AI Studio (C-07)

**หน้าที่:** Admin อัปโหลด training data → เทรนโมเดลผ่าน Teachable Machine API → export ONNX → deploy ให้ users ใช้

**Flow:**
```
1. Admin อัปโหลดรูปภาพ + label ใน Admin Panel
2. กด "Train Model" → เรียก Teachable Machine REST API
3. ดาวน์โหลด ONNX model
4. อัปโหลดขึ้น Supabase Storage (bucket: ai-models)
5. อัปเดต config ใน DB → Users ทุกคนใช้โมเดลใหม่อัตโนมัติ
```

---

## สิ่งที่ยังไม่มี / ต้องเพิ่มใน PRD

- [ ] Admin hidden URL spec (`/x/admin`)
- [ ] User portal layout spec (Shopee-like bottom tab)
- [ ] Buyer portal layout spec (sidebar)
- [ ] Marketplace post creation flow (U-new)
- [ ] Two-stage AI decision tree (ปรับจาก M3/M8)
- [ ] Waste Rules Engine schema + Thai rules table
- [ ] Admin AI Studio spec (Teachable Machine integration)
- [ ] Email verification flow spec
