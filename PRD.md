# GreenPlus Ai — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 12 May 2026 (12 พฤษภาคม 2569)  
**Owner:** chanachot_k@cmu.ac.th  
**Status:** Active Development

---

## 1. Vision & Problem Statement

### Vision
> "เปลี่ยนขยะจากสิ่งไร้ค่า สู่สินทรัพย์ที่มีมูลค่าทางจิตใจและการเงิน เพื่อสร้างสังคมที่ยั่งยืน"  
> *Turn waste from worthless into assets — financially and spiritually — to build a sustainable society.*

### Problem
Local waste sellers (students, residents) face three compounding problems:

1. **Price opacity** — no access to current market rates; shops exploit information asymmetry
2. **Grade confusion** — sellers cannot reliably distinguish Grade A / B / C recyclables
3. **Contamination** — mixed or dirty recyclables are rejected or under-priced at the point of sale

### Opportunity
The pilot zone (CMU rear / Tambon Suthep) has dense student housing, established scrap shops, and a growing Digital Nomad population — all underserved by existing waste platforms that are either Bangkok-centric or non-digital.

---

## 2. Target Users

| Persona | Profile | Core Need |
|---------|---------|-----------|
| **Student Seller** | CMU dormitory resident, age 18–25, Thai UI | Scan → get price → find nearest shop in < 60 s |
| **Expat / Digital Nomad** | Non-Thai speaker, English UI required | Same flow, zero Thai required |
| **Scrap Shop Operator (Buyer)** | Local shop owner, semi-technical | Manage pricing table, see incoming bookings |
| **Platform Admin** | Internal / university staff | Approve shops, moderate marketplace, view city heatmap |

---

## 3. Core User Stories

### 3.1 User (Seller)

| ID | Story | Priority |
|----|-------|----------|
| U-01 | As a user, I can open the camera scanner so that I can identify my waste item | Must Have |
| U-02 | As a user, I receive a Grade (A/B/C) and an estimated price in ฿ within 3 seconds | Must Have |
| U-03 | As a user, I can swipe right on a scan result to add it to my basket | Must Have |
| U-04 | As a user, I see a Smart Map with pulsing pins showing shops that accept my current item | Must Have |
| U-05 | As a user, I can book a drop-off slot at a nearby shop | Should Have |
| U-06 | As a user, I earn Eco-Points (Impact Points) after a verified drop-off | Should Have |
| U-07 | As a user, I can switch the UI language between Thai and English | Must Have |
| U-08 | As a user, if I point the camera at a person, I see a playful anti-troll message | Must Have |

### 3.2 Buyer (Shop Operator)

| ID | Story | Priority |
|----|-------|----------|
| B-01 | As a buyer, I see an industrial dashboard with today's booking queue and incoming material summary | Must Have |
| B-02 | As a buyer, I can create, read, update, and delete my shop's pricing table (CRUD) | Must Have |
| B-03 | As a buyer, I can accept or reject a booking request from a seller | Must Have |
| B-04 | As a buyer, I can see the material grade and weight estimate before confirming | Should Have |

### 3.3 Admin

| ID | Story | Priority |
|----|-------|----------|
| A-01 | As an admin, I see a heatmap of waste drop points across Tambon Suthep | Must Have |
| A-02 | As an admin, I can approve or reject new shop registrations | Must Have |
| A-03 | As an admin, I can delete troll / abuse posts from the Marketplace | Must Have |

---

## 4. AI Core — Dual-Stage Scanner

### Stage 1: Object Detection
- Model: YOLO (browser-side ONNX)
- Output: bounding box + material class label (PET bottle, aluminium can, cardboard, HDPE, glass, paper, copper)
- Confidence threshold: ≥ 0.60 to proceed to Stage 2

### Stage 2: Contamination Analysis
- Input: cropped region from bounding box
- Output: cleanliness score → Grade A / B / C
- Grade rules:

| Grade | Cleanliness | Price Multiplier |
|-------|-------------|-----------------|
| A | Clean, dry, no residue | ×1.00 |
| B | Light residue / minor contamination | ×0.75 |
| C | Dirty, wet, heavily contaminated | ×0.40 |

### Valuation Formula
```
Estimated Price = (Standard Weight per Unit × Base Price Grade A) × Grade Multiplier
```

Optional modifiers: +Distance Bonus (if shop is > 2 km away).

### Anti-Troll System
If a living being (human, animal) is detected in frame:
- Thai: "ตรวจพบสิ่งมีชีวิตที่มีมูลค่าสูงเกินกว่าจะเรียกว่าขยะ!"
- English: "We found a living being far too valuable to be called waste!"

### Privacy Constraint
All inference runs client-side (Edge AI). **No user images are transmitted to any server.** This is a hard requirement, not an optimization.

---

## 5. Design System — Mono-Logic Minimalist v0

### Principles
1. **No drop shadows. No gradients.** Use 1.5px solid borders and flat 2px offset shadows instead.
2. **Paper, not screen.** Background is `#FAFAF7`, not white.
3. **Data is the UI.** Prices and weights are primary visual elements.
4. **One accent, infinite restraint.** `#22C55E` is the only accent color system-wide.

### Color Tokens
```css
--ink:        #1A1A1A   /* borders, primary text */
--ink-2:      #3A3A3A   /* secondary text */
--ink-3:      #7A7A7A   /* muted / placeholders */
--ink-4:      #B8B8B8   /* dividers */
--paper:      #FAFAF7   /* primary background */
--paper-2:    #F1EFE8   /* card fill, secondary bg */
--green:      #22C55E   /* primary accent */
--green-soft: rgba(34,197,94,.14)
--green-ink:  #0F7A3A   /* green text on light */
--orange:     #F59E0B   /* alert / Grade C warning */
--blue:       #5BC0BE   /* bounding box */
```

### Grade Colors
| Grade | Background | Text |
|-------|-----------|------|
| A | `#22C55E` | `#062040` |
| B | `#FFF3A8` | `#5A4A1A` |
| C | `#FFFFFF` | `#7A7A7A` |

### Typography
| Role | Font (EN) | Font (TH) | Size |
|------|-----------|-----------|------|
| Heading / Brand | Architects Daughter | Mitr | 28–34px |
| Body / Button / Nav | Caveat | Sarabun | 17–18px |
| Price / Data / Metric | JetBrains Mono | IBM Plex Sans Thai | varies |
| Tag / Chip | JetBrains Mono | IBM Plex Sans Thai | 10–12px |

---

## 6. Information Architecture

### Routes / Pages

| Route | Role | Description |
|-------|------|-------------|
| `/` | All | Landing / role selector |
| `/scan` | User | Full-screen 2-stage AI scanner |
| `/basket` | User | Accumulated scan results + total estimate |
| `/map` | User | Smart map — nearby accepting shops |
| `/marketplace` | User / Buyer | Buy/sell listings with grade filter |
| `/dashboard` | Buyer | Industrial dashboard — queue, stats, pricing CRUD |
| `/admin` | Admin | Heatmap + approval + moderation panel |
| `/settings` | All | Language toggle, profile, preferences |

### Redux Slices
| Slice | Manages |
|-------|---------|
| `wasteSlice` | Scan results, basket, grade + valuation state |
| `marketplaceSlice` | Post listings, filter state, booking queue |
| `userSlice` | Auth, role, language preference, Eco-Points |

---

## 7. Database Schema

### `waste_items`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| name | text | e.g. "PET Bottle (Clear)" |
| name_th | text | Thai label |
| unit | text | "kg" / "piece" |
| base_weight | numeric | Standard weight per unit (kg) |
| price_grade_a | numeric | ฿/kg Grade A |
| price_grade_b | numeric | ฿/kg Grade B |
| price_grade_c | numeric | ฿/kg Grade C |
| updated_at | timestamptz | |

### `marketplace_posts`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK → user_profiles | |
| title | text | |
| material_type | text | FK → waste_items.name |
| grade | char(1) | A / B / C |
| quantity_kg | numeric | |
| asking_price | numeric | ฿ |
| status | text | open / reserved / closed |
| created_at | timestamptz | |

### `user_profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK = auth.users.id | |
| role | text | user / buyer / admin |
| display_name | text | |
| language_pref | text | th / en |
| eco_points | integer | cumulative Impact Points |
| location_lat | numeric | |
| location_lng | numeric | |

### `scan_history`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| user_id | uuid FK → user_profiles | |
| item_type | text | detected material class |
| grade | char(1) | A / B / C |
| confidence | numeric | model confidence 0–1 |
| calculated_value | numeric | ฿ estimated |
| weight_estimate | numeric | kg |
| scanned_at | timestamptz | |

---

## 8. Pricing Reference (Chiang Mai — May 2026)

| Material | Grade A | Source |
|----------|---------|--------|
| Aluminium cans | ฿62/kg | วงษ์พาณิชย์ |
| PET bottle (clear) | ฿8–10/kg | Recycle Station ตลาดจริงใจ |
| Copper (clean) | ฿380–385/kg | วงษ์พาณิชย์ |
| Used cooking oil | ฿20/kg | ปั๊มบางจาก (ทอดไม่ทิ้ง) |
| Cardboard | ฿4.50/kg | Chiang Mai market average |
| Office paper | ฿7.20/kg | Chiang Mai market average |
| HDPE plastic | ฿18.50/kg | Chiang Mai market average |

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Scanner delivers a grade + price estimate ≤ 3 s on mid-range Android (2022) |
| Privacy | Zero image upload; all AI inference is client-side |
| Accessibility | WCAG AA contrast minimum; keyboard navigable on desktop |
| Localisation | Full Thai + English; auto-detect browser language on first load |
| Security | API keys only in `.env.local`; Supabase Row-Level Security on all tables |
| Offline | Pricing table cached locally (IndexedDB / localStorage) for offline reads |

---

## 10. Out of Scope (v1.0)

- Payment / settlement between sellers and buyers (cash-only, in-person for now)
- Recycling route optimisation / logistics
- Carbon credit generation or formal ESG reporting
- Cities outside the CMU / Tambon Suthep pilot area
- Native mobile apps (iOS / Android) — PWA only

---

## 11. Success Metrics

| Metric | Target (3-month post-launch) |
|--------|------------------------------|
| Weekly active scanners | ≥ 200 unique users |
| Scan-to-booking conversion rate | ≥ 25% |
| Average scan result time | ≤ 3 s (p90) |
| Buyer pricing update frequency | ≥ 1× per week per shop |
| User-reported price accuracy | ≥ 80% "matches actual shop offer" |

---

## 12. Milestones

| Milestone | Deliverable |
|-----------|-------------|
| M1 — Design System | CSS tokens, component library, Storybook baseline |
| M2 — Auth + Roles | Supabase auth, role routing, language toggle |
| M3 — AI Scanner MVP | Stage 1 detection live; Grade + valuation displayed |
| M4 — Marketplace | Listing CRUD, grade filter, booking queue |
| M5 — Smart Map | Shop pins, pulsing animation, material-match filter |
| M6 — Buyer Dashboard | Pricing CRUD, queue management, stats |
| M7 — Admin Panel | Heatmap, shop approval, post moderation |
| M8 — Stage 2 AI | Contamination analysis; Grade B / C differentiation |
| M9 — Eco-Points | Points ledger, gamification, leaderboard |
| M10 — Pilot Launch | Tambon Suthep go-live, user onboarding |
