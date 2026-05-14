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
| **User (Seller)** | Student, resident, expat | **Strictly selling:** Scan waste, get price, find routing, and post items to Marketplace to sell. Cannot buy. |
| **Buyer (Shop Operator)** | Local scrap shop owner | **Strictly buying:** Manage shop profile, set open/closed calendar, update prices, and buy waste from Marketplace or direct bookings. Cannot scan/sell. |
| **Platform Admin** | Internal staff | Approve shops, moderate marketplace, view city heatmap. |

> **Role Separation Constraint:** The application strictly enforces separation of concerns. A `User` only interacts with the selling flow (Scanner, Basket, Marketplace Selling). A `Buyer` only interacts with the purchasing flow (Dashboard, Shop Calendar, Marketplace Buying).

## 3. Core User Stories

### 3.1 User (Seller)

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| U-01 | As a user, I can open the camera scanner so that I can identify my waste item | Must Have | ✅ Done |
| U-02 | As a user, I receive a Grade (A/B/C) and an estimated price in ฿ within 3 seconds | Must Have | ✅ Done |
| U-03 | As a user, I can swipe right on a scan result to add it to my basket | Must Have | ✅ Done |
| U-04 | As a user, I see a Smart Map with pulsing pins showing shops that accept my current item | Must Have | ✅ Done |
| U-05 | As a user, I can book a drop-off slot at a nearby shop | Should Have | Pending |
| U-06 | As a user, I earn Eco-Points (Impact Points) after a verified drop-off | Should Have | Pending |
| U-07 | As a user, I can switch the UI language between Thai and English | Must Have | ✅ Done |
| U-08 | As a user, if I point the camera at a person, I see a playful anti-troll message | Must Have | ✅ Done |
| U-09 | As a user, I can view all basket items with grade tag, weight input, and estimated value per item | Must Have | ✅ Done |
| U-10 | As a user, I can manually adjust the weight of each basket item | Must Have | ✅ Done |
| U-11 | As a user, I can see shops that accept every item in my basket (Single Shop mode), sorted nearest-first | Must Have | ✅ Done |
| U-12 | As a user, I can switch to Multi-Stop Route mode to get a stop-by-stop route when no single shop accepts all items | Must Have | ✅ Done |
| U-13 | As a user, if no shop accepts a specific item, I can skip that item and continue planning the rest | Must Have | ✅ Done |
| U-14 | As a user, I can view my profile showing Eco-Points, scan history summary, and account settings | Should Have | ✅ Done |
| U-15 | As a user, I can sign in with my Google account so that I don't need to create a separate password | Must Have | ✅ Done |

### 3.2 Buyer (Shop Operator)

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| B-01 | As a buyer, I see an industrial dashboard with today's booking queue and incoming material summary | Must Have | ✅ Done |
| B-02 | As a buyer, I can create, read, update, and delete my shop's pricing table (CRUD) | Must Have | ✅ Done |
| B-03 | As a buyer, I can browse the Marketplace to find waste posts created by users and offer to buy them | Must Have | ✅ Done |
| B-04 | As a buyer, I can manage my shop's Calendar to set Open/Closed days so users don't route to me when closed | Must Have | ✅ Done (local state; Supabase persist pending) |
| B-05 | As a buyer, I have a shop profile showing name, address, operating hours (calendar), accepted materials, and contact info | Must Have | ✅ Done |
| B-06 | As a buyer, I can update my shop's accepted material types so only matching sellers appear in route plans | Must Have | Pending |

### 3.3 Admin

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| A-01 | As an admin, I see a heatmap of waste drop points across Tambon Suthep | Must Have | ✅ Done |
| A-02 | As an admin, I can approve or reject new shop registrations | Must Have | ✅ Done |
| A-03 | As an admin, I can delete troll / abuse posts from the Marketplace | Must Have | ✅ Done |
| A-04 | As an admin, I have a profile showing my name, admin badge, and a summary of pending actions (shops to approve, flagged posts) | Should Have | ✅ Done |

---

## 4. AI Core — Dual-Stage Scanner & Multi-Factor Grading

### 4.1 Design Direction

Grade A/B/C is **not** a single "cleanliness score." Buyers evaluate recyclables across multiple dimensions depending on the material. A buyer's actual concern for copper is purity and oxidation; for cardboard it is moisture (wet paper is a weight fraud); for PET it is color and whether the cap was removed.

The system uses a **weighted multi-factor score per material type** that produces a single grade while giving the user actionable feedback on exactly which factors dragged the grade down.

---

### 4.2 Stage 1: Object Detection
- Model: YOLO (browser-side ONNX, Stage 1 model)
- Output: bounding box + `material_type` label
- Confidence threshold: ≥ 0.60 to proceed to Stage 2
- Anti-troll: if living being detected → block Stage 2, show message

### 4.3 Stage 2: Multi-Factor Scoring

**Input:** cropped region from Stage 1 bounding box  
**Output per factor:** score 0–10 (AI regression head, one per factor)  
**Final weighted score:** 0–100  
**Grade mapping:**

| Grade | Weighted Score | Price Multiplier |
|-------|---------------|-----------------|
| A | ≥ 80 | ×1.00 |
| B | 50 – 79 | ×0.75 |
| C | 20 – 49 | ×0.40 |
| REJECTED | < 20 or hard-reject triggered | ×0.00 |

```
weighted_score = Σ (factor_weight[i] × factor_score[i] × 10)
               — where weights sum to 1.00 per material type
```

---

### 4.4 Grading Factors by Material Type

#### PET Bottle (Clear / Colored)

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Cleanliness | 30% | Food residue, grease, visible dirt inside/outside |
| Color | 25% | Clear > lightly tinted > colored > black (clear most valuable) |
| Preparation | 25% | Cap removed, label peeled, body crushed flat |
| Moisture | 20% | Water pooled inside, condensation, wet exterior |

> Hard reject: color = black plastic (virtually no buyers for black PET)

#### Aluminium Can

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Cleanliness | 35% | Liquid residue, paint damage, rust spots |
| Condition | 30% | Shape integrity — severely distorted cans are harder to process |
| Purity | 20% | Steel cans mixed in (visual — steel has duller sheen vs aluminium) |
| Preparation | 15% | Crushed (shop preference varies — flag, don't penalise) |

> Hard reject: heavy rust + pitting (indicates steel, not aluminium)  
> Grade C often not accepted — matches market reality (see Section 8)

#### Cardboard / Corrugated Box

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Moisture | 40% | Wet/damp appearance, warping, water stains, dark patches |
| Preparation | 25% | Flattened vs bulky, tape/staples removed, no foam padding |
| Purity | 20% | Wax-coated surfaces, non-paper inserts still attached |
| Cleanliness | 15% | Grease (pizza boxes), heavy ink/dye coverage |

> **Moisture is the dominant factor.** Wet cardboard is the most common fraud (adds weight, dramatically lowers processing value). Moisture < 3/10 → hard reject.

#### Copper

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Purity grade | 45% | Bare bright (shiny, uniform orange) > #1 (uncoated, clean) > #2 (soldered, mixed) |
| Coating / Insulation | 30% | Bare wire > stripped insulation > intact insulation (full sleeve = lowest) |
| Oxidation | 15% | Bright surface > dull > green/blue patina (heavy oxidation) |
| Contamination | 10% | Solder blobs, non-copper metals, brass fittings mixed in |

> This is the widest price spread — bare bright copper ≈ 5× value of insulated scrap per kg

#### Glass Bottle / Jar

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Color | 35% | Clear > amber > green > mixed (clear fetches highest price) |
| Integrity | 30% | Whole bottle vs broken (cullet). Broken = reduced price, handled differently |
| Cleanliness | 20% | Labels still on, residue inside, etched/frosted |
| Purity | 15% | Ceramics, stones, or non-glass items mixed in the batch |

#### Used Cooking Oil

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Color / Clarity | 40% | Light golden = lightly used; dark brown = heavily used; black = degraded |
| Water content | 35% | Visible water layer separation at bottom, cloudy/milky appearance |
| Contamination | 15% | Food debris, floating particles, foreign objects |
| Container | 10% | Sealed proper container > open bucket > mixed-material leaking container |

> Water dilution is a fraud vector — water content > 30% visible → hard reject

#### Mixed Plastic (HDPE, PP, other)

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Sorting purity | 40% | Single resin type vs truly mixed (visual texture/sheen differences) |
| Cleanliness | 30% | Food residue, chemical contamination |
| Condition | 20% | Shredded/film vs rigid containers (different processing streams) |
| Color | 10% | Single color > multi-color mix (easier to reprocess) |

#### Newspaper / Office Paper

| Factor | Weight | What the model looks for |
|--------|--------|-------------------------|
| Moisture | 35% | Damp, wet, water-damaged, warped pages |
| Purity | 30% | Pure newsprint vs mixed with glossy magazines, coated paper |
| Condition | 20% | Neat bundled stacks vs loose scattered scraps |
| Cleanliness | 15% | Mold spots, heavy food staining, chemical contamination |

---

### 4.5 Hard Rejection Rules

Some factor scores below a minimum threshold reject the item regardless of overall score. The buyer simply will not accept these.

| Material | Factor | Threshold | Reason |
|----------|--------|-----------|--------|
| Cardboard | Moisture | < 3/10 | Fraud weight + processing loss |
| Cooking oil | Water content | < 4/10 | Oil/water separation ruins refining |
| Copper | Purity | < 2/10 | Non-copper metals cost more to process than value |
| PET | Color | black | No downstream recycler accepts black plastics |
| Aluminium | Purity | < 2/10 | Steel contamination ruins aluminium melt |

---

### 4.6 Valuation Formula

```
Estimated Price = weight_kg × base_price_grade_a × grade_multiplier

grade_multiplier:
  A → 1.00
  B → 0.75
  C → 0.40
  REJECTED → 0.00

weight_kg:
  - Stage 1 outputs standard weight estimate per unit type
  - User can override in Basket (manual input)
```

---

### 4.7 Scan Result UI — Bottom Sheet & Swipe UX

After Stage 2, the result screen displays information in a **stacked bottom popup (Bottom Sheet)**. Users evaluate the item and make a decision by swiping.

#### Swipe UX Logic
- **Swipe Right (ปัดขวา)** → **Sell (ขาย):** Adds the item to the basket.
- **Swipe Left (ปัดซ้าย)** → **Discard (ทิ้ง):** Rejects the item.

#### Contamination / Dirty Alert
If the model detects that the item is dirty (Cleanliness factor fails / is below threshold), a secondary popup MUST interrupt the user before they can swipe right:
> **"สิ่งนี้มีคราบสกปรก คุณได้ทำความสะอาดแล้วใช่ไหม?" (This item is dirty. Have you washed it?)**
> - **[Yes (ทำความสะอาดแล้ว)]** → Proceeds to add to basket.
> - **[No (ยังไม่ได้ทำความสะอาด)]** → Blocks the sale. Tells the user "กรุณาทำความสะอาดก่อนนำมาขาย" (Please wash it before selling) and returns to the previous screen.

```text
┌──────────────────────────────────────┐
│ [ CAMERA VIEWPORT ]                  │
│                                      │
├──────────────────────────────────────┤
│ ▽ ลากลงเพื่อปิด (Swipe down to close)│
├──────────────────────────────────────┤
│  [Grade B]  ขวด PET ใส               │
│  ≈ ฿7.20/kg  (น้ำหนักมาตรฐาน 0.03kg)│
├──────────────────────────────────────┤
│  คะแนนรวม  77 / 100                  │
│                                      │
│  ความสะอาด   ████████░░  8/10       │
│  สี (ใส)     ██████████  10/10      │
│  การเตรียม   █████░░░░░  5/10  ⚠   │ ← pulled grade down
│                                      │
│  ⚠ เพิ่มคะแนนได้: ดึงฝาออก         │
│    + ลอกฉลาก → คะแนน ≈ 85/100       │
├──────────────────────────────────────┤
│ ⟵ ปัดซ้ายเพื่อทิ้ง  |  ปัดขวาเพื่อขาย ⟶ │
└──────────────────────────────────────┘
```

The "improvement hint" is generated from whichever factor is lowest — actionable, not just informational.

---

### 4.8 Database: Grading Criteria Table

Weights are stored in the database so admin can tune them without a code deployment.

```sql
grading_criteria (
  id               uuid PK DEFAULT gen_random_uuid(),
  material_type    text REFERENCES waste_items(material_type),
  factor_key       text NOT NULL,       -- 'cleanliness', 'moisture', 'color', etc.
  factor_name_th   text NOT NULL,
  factor_name_en   text NOT NULL,
  weight           numeric(4,3) NOT NULL, -- 0.000–1.000 (must sum to 1.000 per material)
  hard_reject_min  numeric(4,1),          -- score below this = REJECT (null = no hard reject)
  sort_order       smallint DEFAULT 0,
  UNIQUE (material_type, factor_key),
  CONSTRAINT weight_range CHECK (weight > 0 AND weight <= 1)
)
```

And update `scan_history` to store the factor breakdown:

```sql
-- Additional columns on scan_history
factor_scores   jsonb,      -- {"cleanliness": 8.0, "moisture": 8.0, "preparation": 5.0, "color": 10.0}
weighted_score  numeric(5,1) -- 0.0–100.0
```

---

### 4.9 Anti-Troll System
If a living being (human, animal) is detected in frame:
- Thai: "ตรวจพบสิ่งมีชีวิตที่มีมูลค่าสูงเกินกว่าจะเรียกว่าขยะ!"
- English: "We found a living being far too valuable to be called waste!"

### 4.10 Privacy Constraint
All inference runs client-side (Edge AI). **No user images are transmitted to any server.** This is a hard requirement, not an optimization.

---

## 5. Design System — Neo-Brutalist Mono v0.4

> Full visual spec: `docs/design-spec.md`. UI component API: `docs/ui-components.md`.

### Responsive Design Layout Rules (Mobile vs Desktop)
The application MUST fully support both Desktop and Mobile viewports natively. Avoid forcing a "mobile column" onto desktop users.

| Feature / Page | Mobile Layout (< 768px) | Desktop Layout (≥ 768px) |
|----------------|--------------------------|--------------------------|
| **Navigation Shell** | Fixed Bottom Tab Bar for `User`. Hamburger/Horizontal strip for `Buyer`/`Admin`. | Fixed Sidebar on the left (200px-240px wide). Main content expands to fill remaining space. |
| **Scanner Page** | Full screen camera viewport. Bottom Sheet popup for results (Swipe up/down). | Left column: Camera viewport. Right column: Fixed Panel showing results and factor breakdown. Swipe is replaced or supplemented by Keyboard Arrows or Mouse Drag. |
| **Basket & Routing** | Stacked cards. Route map hidden behind a toggle or modal. | 2-Column Split: Left side shows Basket items, Right side shows Smart Map and Routing algorithm steps. |
| **Marketplace** | Single column feed. Filters hidden in a drawer. | Multi-column grid feed (2-3 columns). Filters visible in a persistent sidebar on the left. |
| **Buyer Dashboard** | Stacked metrics, horizontal scroll for tables. | Grid-based metrics (3-4 per row), full-width data tables for Booking Queue and Pricing CRUD. |

### Aesthetic: Neo-brutalist mono

| Principle | Implementation |
|-----------|---------------|
| **Border** | `border-[1.5px] border-[var(--ink)]` on every card/button/input — zero border-radius on desktop |
| **Shadow** | `shadow-[2px_2px_0_var(--ink)]` flat offset only — no blur, no gradients |
| **Color** | ink/paper base palette; `--green` / `--green-ink` accent for CTA and positive metrics only |
| **Charts** | SVG hatch fill (45° diagonal lines, `stroke: var(--green)`) — never solid fill |
| **Typography** | uppercase + `tracking-widest` for all label/chip text; JetBrains Mono for data/prices |
| **Active state** | ink/paper inverted pill — never underline |
| **Spacing** | 4/8/12/16/20/24px grid; prefer `gap-*` over `margin-*` |

### Color Tokens
```css
/* Light mode (default) */
--ink:        #1A1A1A   /* borders, primary text */
--ink-2:      #3A3A3A   /* secondary text */
--ink-3:      #7A7A7A   /* muted / placeholders */
--ink-4:      #B8B8B8   /* dividers — use only 1px/h-px width */
--paper:      #FAFAF7   /* primary background — NOT white */
--paper-2:    #F1EFE8   /* card fill, secondary bg */
--green:      #22C55E   /* sole accent color */
--green-soft: rgba(34,197,94,.14)  /* tinted bg for active badges */
--green-ink:  #0F7A3A   /* green text on light backgrounds */
--orange:     #F59E0B   /* alerts, Grade C, destructive */
--blue:       #5BC0BE   /* bounding box overlay only */

/* Dark mode — .dark class overrides */
--ink:        #FAFAF7
--paper:      #151512
--paper-2:    #1E1E1A
```

> **Anti-pattern:** `--ink-5` does not exist. Max is `--ink-4`. Never use raw hex values in JSX — always reference a token.

### Grade Tag Colors
| Grade | Background | Text | Tailwind class |
|-------|-----------|------|----------------|
| A | `#22C55E` | `#062040` | `<GradeTag grade="A" />` |
| B | `#FFF3A8` | `#5A4A1A` | `<GradeTag grade="B" />` |
| C | `#FFFFFF` | `#7A7A7A` | `<GradeTag grade="C" />` |

### Typography
| Tailwind class | Font stack | Used for | Size range |
|---------------|-----------|---------|------------|
| `font-brand` | Architects Daughter → Mitr | h1, logo wordmark, KPI numbers, personality text | 24–48px |
| `font-body` | Caveat → Sarabun | body text, button labels, nav labels, material names | 14–18px |
| `font-data` | JetBrains Mono → IBM Plex Sans Thai | prices, percentages, labels uppercase, chips, badges, metadata | 9–14px |

Font loading: declared in `index.html` `<link rel="stylesheet">` with `<link rel="preconnect">` for performance (not CSS @import).

### Component Patterns

**Card** — `bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] p-5`

**Button variants:**
- `primary` — `bg-[var(--green)] text-[#062040]` + ink border + flat shadow
- `secondary` — `bg-[var(--paper)] text-[var(--ink)]` + ink border
- `ghost` — transparent, ink text, no shadow

**SectionDivider** — label (uppercase mono 10px) LEFT, then `flex-1 h-px bg-[var(--ink-4)]` line extending right

**KpiCard** — font-brand 32px value, mono 10px label uppercase, mono 11px trend with ▲/▼

**Toggle pill** — 40×20px, green bg when on, ink-4 bg when off; white dot slides via `left` CSS

**Progress bar** — `h-2 border-[1.5px] border-[var(--ink)]` container, inner div `bg-[var(--green)]` or tier color

**Hatch bar chart** — SVG with `<pattern>` diagonal lines `stroke: var(--green)`, bars `stroke: var(--ink)`

### Navigation Shells

| Shell | Used by | Layout |
|-------|---------|--------|
| `UserLayout` | `user` role | TopBar (sticky, 56px) + `<Outlet />` + BottomTabBar (fixed, 68px) |
| `BuyerLayout` | `buyer` role | Desktop: 200px sidebar + main; Mobile: TopBar + horizontal nav strip |
| Default | `admin` role | Top nav only |

---

## 6. Information Architecture

### Routes / Pages

| Route | Role | Description |
|-------|------|-------------|
| `/` | All | Landing / role selector |
| `/scan` | User | Full-screen 2-stage AI scanner |
| `/basket` | User | Basket — items list, shop matching, route planner |
| `/map` | User | Smart map — nearby accepting shops |
| `/marketplace` | User / Buyer | Buy/sell listings with grade filter |
| `/dashboard` | Buyer | Industrial dashboard — queue, stats, pricing CRUD |
| `/admin` | Admin | Heatmap + approval + moderation panel |
| `/settings` | All | Language toggle, preferences |
| `/profile` | All | Role-specific profile page (see Section 13) |

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

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M1 — Design System | CSS tokens, component library, Storybook baseline | ✅ Done |
| M2 — Auth + Roles | Supabase auth + Google OAuth, role routing, language toggle | ✅ Done |
| M3 — AI Scanner MVP | Stage 1 detection + single-factor grade live; Basket page with shop matching + route planning | ✅ Done |
| M3b — Profile Pages | Role-specific profile for User / Buyer / Admin | ✅ Done |
| M4 — Marketplace | Listing CRUD, grade filter, booking queue | ✅ Done |
| M5 — Smart Map | Shop pins, pulsing animation, material-match filter | ✅ Done |
| M6 — Buyer Dashboard | Pricing CRUD, queue management, stats | ✅ Done |
| M7 — Admin Panel | Heatmap, shop approval, post moderation | ✅ Done |
| M8 — Multi-Factor Grading | Full per-factor scoring, improvement hints, grading_criteria admin tuning | ✅ Done |
| M9 — Eco-Points | Points ledger, gamification, leaderboard | ✅ Done |
| **MapTreeRouting** — Tree Routing | Nearest-neighbor TSP multi-stop routing; shop openDays calendar filtering; Buyer Calendar tab | ✅ Done |
| M10 — Pilot Launch | Tambon Suthep go-live, user onboarding | Pending |

---

## 13. Google OAuth Setup Guide

### Overview
Authentication uses Supabase Auth with Google as an OAuth provider. New Google users get a `user_profiles` row created automatically on first sign-in, using the role stored in `localStorage` before the OAuth redirect.

### Step 1 — Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create a new **OAuth 2.0 Client ID** (Application type: **Web application**)
3. Under **Authorised redirect URIs**, add:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret**

### Step 2 — Supabase Dashboard
1. Go to **Authentication → Providers → Google**
2. Toggle **Enable**
3. Paste the **Client ID** and **Client Secret** from Step 1
4. Save

### Step 3 — Redirect URL Allow-list
In **Authentication → URL Configuration**, add the following to **Redirect URLs**:
```
http://localhost:5173
https://<your-production-domain>
```

### Step 4 — Environment (no changes needed)
The app uses `window.location.origin` as `redirectTo` — no extra env variable required.

### How the app handles new Google users
- Before the OAuth redirect, the app stores the selected role (`user` / `buyer` / `admin`) in `localStorage` under key `gp_pending_role`
- After redirect, `useAuth.js` checks if a `user_profiles` row exists; if not, it creates one using `gp_pending_role` (defaults to `user` if key is missing)
- `display_name` is pre-filled from Google's `user_metadata.full_name`

---

## 14. Basket Page Specification

### Purpose
The Basket is a **trip-planning tool**. Users accumulate scan results here, then use the shop-matching engine to find the best way to sell everything before leaving home.

### Basket Item Shape (Redux)
```js
{
  id:          string,   // uuid — unique per scan result
  name:        string,   // display label e.g. "ขวด PET ใส"
  materialType: string,  // key for shop matching (see Material Keys below)
  grade:       'A'|'B'|'C',
  weight:      number,   // kg — user-editable
  pricePerKg:  number,   // ฿/kg based on grade
}
```

### Material Type Keys
| Key | Thai Label | English Label |
|-----|-----------|---------------|
| `pet_bottle_clear` | ขวด PET ใส | PET Bottle (Clear) |
| `aluminum_can` | กระป๋องอะลูมิเนียม | Aluminium Can |
| `cardboard` | กระดาษลัง | Cardboard |
| `copper` | ทองแดง | Copper |
| `glass` | แก้ว | Glass |
| `newspaper` | หนังสือพิมพ์ | Newspaper |
| `mixed_plastic` | พลาสติกรวม | Mixed Plastic |
| `cooking_oil` | น้ำมันทอด | Used Cooking Oil |

### Page Layout

```
┌─────────────────────────────────┐
│ ตะกร้าของฉัน          ฿ XXX.XX │  ← header + total
├─────────────────────────────────┤
│ [A] ขวด PET ใส  [1.2 kg] ฿9.60│  ← basket item card
│ [B] กระป๋อง     [0.5 kg] ฿23.25│     grade | name | weight input | value | ×
│ ...                             │
├─────────────────────────────────┤
│ ⚠ ไม่พบร้านรับซื้อ              │  ← orange warning (if any item unmatched)
│   ทองแดง  [ข้ามชิ้นนี้]        │
├─────────────────────────────────┤
│ เลือกวิธีขาย                    │
│ [ร้านเดียว] [วางแผนเส้นทาง]    │  ← mode toggle
├─────────────────────────────────┤
│  SINGLE SHOP MODE               │
│  ┌──────────────────────────┐   │
│  │ ร้านขยะหลัง มช.  0.4 km │   │  ← shop card (nearest first)
│  │ รับทุกชิ้น (2 รายการ)   │   │     name | distance | items accepted | total ฿
│  │                   ฿32.85│   │
│  └──────────────────────────┘   │
│  OR                             │
│  MULTI-STOP MODE                │
│  จุดที่ 1  ร้านหลัง มช. 0.4km  │  ← stop card
│    → ขวด PET, กระป๋อง          │
│  จุดที่ 2  บางจาก 1.5km         │
│    → น้ำมันทอด                  │
└─────────────────────────────────┘
```

### Shop Matching & Routing Algorithm

**Single Shop mode**
```
shopsForAll = SHOPS
  .filter(shop => basket.every(item => shop.accepts.includes(item.materialType)) && shop.isOpenToday())
  .sort((a, b) => a.distance - b.distance)
```

**Multi-Stop Route mode (Tree/Graph Traversal)**
Instead of simple nearest-first, the app treats locations as nodes in a graph and computes an optimized path (Minimum Spanning Tree / Traveling Salesperson variation) to drop off all items efficiently:
```
1. Filter open shops that accept at least one item in the basket.
2. Build a Distance Graph where:
   - Node 0 = User's current location
   - Nodes 1..N = Eligible shops
3. Use a Tree-based pathfinding algorithm (e.g. nearest neighbor or Christofides heuristic for TSP) to find the shortest path that covers all required material types in the basket.
4. Return the optimized sequential route.
```
```
for each item in basket:
  nearestShop = SHOPS
    .filter(s => s.accepts.includes(item.materialType))
    .sort by distance
    .first()
  assign item to nearestShop

route = grouped stops sorted by distance ascending
```

**Unmatched items**
- Items where no shop accepts `materialType` → shown in orange warning section
- User options: **ข้ามชิ้นนี้** (skip from route planning, item remains in basket) or **ลบออก** (remove from basket)

---

## 14. Profile Page Specification

Route: `/profile` — accessible to all authenticated roles.

---

### 14.1 User (Seller) Profile

```
┌─────────────────────────────────┐
│  [  K  ]  Kla                   │  ← avatar initials + display name
│           User  🌿 Eco-Points   │     role badge | eco-points chip
├─────────────────────────────────┤
│  IMPACT SUMMARY                 │
│  สแกนแล้ว   มูลค่ารวม   CO₂    │  ← 3-column stat row
│     42       ฿320        12kg   │     (total scans / total ฿ earned / CO₂ offset)
├─────────────────────────────────┤
│  ประวัติการสแกนล่าสุด           │
│  [A] ขวด PET — ฿9.60 — 12 May  │  ← last 5 scan_history rows
│  [B] กระป๋อง — ฿23.25 — 11 May │
│  ...                            │
├─────────────────────────────────┤
│  การตั้งค่า                     │
│  ภาษา: [TH] [EN]               │
│  ชื่อที่แสดง: [edit]           │
│  [ออกจากระบบ]                   │
└─────────────────────────────────┘
```

**Data sources:** `user_profiles` (name, eco_points), `scan_history` (last 5 rows, total count, sum value)

---

### 14.2 Buyer (Shop Operator) Profile

```
┌─────────────────────────────────┐
│  [  W  ]  วงษ์พาณิชย์          │  ← shop logo initials + shop name
│           Buyer  ✓ Verified     │     role badge | verification status
├─────────────────────────────────┤
│  ข้อมูลร้าน                     │
│  ที่อยู่: ถ.นิมมานเหมินท์ ซ.17 │
│  เวลาทำการ: 08:00–17:00 จ–ส    │
│  โทร: 053-XXX-XXX              │
├─────────────────────────────────┤
│  วัสดุที่รับซื้อ                │
│  [PET] [กระป๋อง] [กระดาษ]     │  ← material type chips (editable)
│  [ทองแดง] [หนังสือพิมพ์]       │     links to buyer dashboard pricing CRUD
├─────────────────────────────────┤
│  สถิติ                          │
│  คิวรอวันนี้: 3   ยืนยันแล้ว: 12│
├─────────────────────────────────┤
│  การตั้งค่า                     │
│  ภาษา: [TH] [EN]               │
│  [แก้ไขข้อมูลร้าน]             │
│  [ออกจากระบบ]                   │
└─────────────────────────────────┘
```

**Data sources:** `user_profiles` (shop name, role), `shops` table (address, hours, accepts), `marketplace_posts` (booking counts)

> **Note:** A `shops` table is required — see Section 15 for updated database schema.

---

### 14.3 Admin Profile

```
┌─────────────────────────────────┐
│  [  A  ]  Admin                 │  ← initials + name
│           Admin  ⬡ CMU Zone    │     role badge | area badge
├─────────────────────────────────┤
│  ACTION QUEUE                   │
│  ร้านรอการอนุมัติ:  2          │  ← pending shops count (link → /admin)
│  โพสต์ที่ถูก report: 1        │     flagged posts count (link → /admin)
├─────────────────────────────────┤
│  PLATFORM STATS                 │
│  ผู้ใช้งาน: 128                │
│  การสแกนวันนี้: 47             │
│  ร้านที่ active: 5             │
├─────────────────────────────────┤
│  การตั้งค่า                     │
│  ภาษา: [TH] [EN]               │
│  [ออกจากระบบ]                   │
└─────────────────────────────────┘
```

**Data sources:** `user_profiles` (admin name), `shops` (pending count), `marketplace_posts` (flagged count), aggregate counts from all tables

---

## 15. Updated Database Schema — `shops` Table

The Basket shop-matching and Buyer Profile features require a dedicated `shops` table (not present in the original schema).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| owner_id | uuid FK → user_profiles | the buyer who owns this shop |
| name | text | shop display name |
| name_th | text | Thai name |
| address | text | street address |
| lat | numeric | GPS latitude |
| lng | numeric | GPS longitude |
| phone | text | contact number |
| hours | text | e.g. "08:00–17:00 Mon–Sat" |
| accepts | text[] | array of materialType keys |
| open_days | smallint[] | days open (0=Sun … 6=Sat); routing engine filters on this |
| verified | boolean | admin-approved flag |
| status | text | active / pending / suspended |
| created_at | timestamptz | |

---

## 16. Supabase Backend Architecture — Free Tier Optimization

### 16.1 Free Tier Constraints (reference)

| Resource | Free Limit | Strategy |
|----------|-----------|---------|
| Database storage | 500 MB | Compress text, avoid storing binary in DB |
| Bandwidth | 5 GB/month | Cache aggressively client-side; paginate all lists |
| File storage | 1 GB | Resize images before upload; delete stale training images |
| Edge Functions | 500K invocations/month | Use only for atomic writes (booking, model deploy) |
| Realtime channels | 2 concurrent | Use only for buyer booking notifications |
| Connections | 60 direct / 200 pooled | Always use PgBouncer (connection string ends in `?pgbouncer=true`) |

### 16.2 Complete Database Schema

#### Core tables

```sql
-- Pricing reference (read-heavy, rarely written)
waste_items (
  id            uuid PK DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  name_th       text NOT NULL,
  material_type text UNIQUE NOT NULL,  -- matches materialType keys
  unit          text NOT NULL,         -- 'kg' | 'piece'
  base_weight   numeric(8,3),
  price_grade_a numeric(10,2) NOT NULL,
  price_grade_b numeric(10,2) GENERATED ALWAYS AS (price_grade_a * 0.75) STORED,
  price_grade_c numeric(10,2) GENERATED ALWAYS AS (price_grade_a * 0.40) STORED,
  updated_at    timestamptz DEFAULT now()
)

-- Shops (read by all, written by buyer)
shops (
  id          uuid PK DEFAULT gen_random_uuid(),
  owner_id    uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  name_th     text,
  address     text,
  lat         numeric(10,7),
  lng         numeric(10,7),
  phone       text,
  accepts     text[] DEFAULT '{}',
  open_days   smallint[] DEFAULT '{1,2,3,4,5,6}',  -- 0=Sun…6=Sat; used by routing engine
  verified    boolean DEFAULT false,
  status      text DEFAULT 'pending',  -- pending | active | suspended
  created_at  timestamptz DEFAULT now()
)

-- User profiles (1:1 with auth.users)
user_profiles (
  id            uuid PK REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text DEFAULT 'user',   -- user | buyer | admin
  display_name  text,
  language_pref text DEFAULT 'th',
  eco_points    integer DEFAULT 0,
  location_lat  numeric(10,7),
  location_lng  numeric(10,7),
  created_at    timestamptz DEFAULT now()
)

-- Scan history
scan_history (
  id               uuid PK DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  item_type        text REFERENCES waste_items(material_type),
  grade            char(1) CHECK (grade IN ('A','B','C')),
  confidence       numeric(4,3),
  weight_estimate  numeric(8,3),
  calculated_value numeric(10,2),
  scanned_at       timestamptz DEFAULT now()
)

-- Marketplace listings
marketplace_posts (
  id           uuid PK DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  title        text,
  material_type text REFERENCES waste_items(material_type),
  grade        char(1) CHECK (grade IN ('A','B','C')),
  quantity_kg  numeric(8,3),
  asking_price numeric(10,2),
  status       text DEFAULT 'open',   -- open | reserved | closed
  flagged      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
)
```

#### Calendar & Booking tables (see Section 18)

#### AI Model tables (see Section 17)

### 16.3 Indexes (Big O Analysis)

Every query the app makes must hit an index. No sequential scans on tables that grow.

| Table | Index | Query pattern | Complexity |
|-------|-------|--------------|-----------|
| `shops` | `(status, verified)` | Admin approval queue | O(log n) |
| `shops` | `(owner_id)` | Buyer's own shop | O(log n) |
| `shops` | `(lat, lng)` using `btree` | Distance sort (approximate) | O(n) → acceptable, table is small |
| `scan_history` | `(user_id, scanned_at DESC)` | User history feed | O(log n) |
| `scan_history` | `(item_type, grade)` | Admin aggregate | O(log n) |
| `marketplace_posts` | `(status, grade)` | Marketplace filter | O(log n) |
| `marketplace_posts` | `(user_id, status)` | My listings | O(log n) |
| `bookings` | `(user_id, status)` | User booking list | O(log n) |
| `bookings` | `(shop_id, slot_id, status)` | Shop queue | O(log n) |
| `time_slots` | `(shop_id, date)` | Availability lookup | O(log n) |
| `shop_closures` | `(shop_id, start_date, end_date)` | Closure check | O(log n) |
| `training_images` | `(status, material_type)` | Training queue | O(log n) |

> All PK columns are indexed automatically. Foreign keys should always have matching indexes.

### 16.4 Row-Level Security (RLS) Policies

RLS enforced on every table — no bypass.

| Table | Read | Write |
|-------|------|-------|
| `waste_items` | everyone | admin only |
| `shops` | everyone (status=active) | owner (own shop), admin (any) |
| `user_profiles` | own row only | own row only |
| `scan_history` | own rows only | own rows only |
| `marketplace_posts` | everyone (unflagged) | author (own), admin (flag/delete) |
| `bookings` | user (own) + shop owner (their shop) | user (create), shop owner (accept/reject) |
| `time_slots` | everyone (own shop's) | shop owner (own shop) |
| `shop_closures` | everyone (own shop's) | shop owner (own shop) |
| `training_images` | admin only | admin only |
| `model_versions` | everyone (active) | admin only |

### 16.5 Materialized Views (avoid expensive aggregates at read time)

```sql
-- Pre-aggregated user eco stats — refresh on scan_history INSERT
CREATE MATERIALIZED VIEW user_eco_stats AS
SELECT
  user_id,
  COUNT(*) AS total_scans,
  SUM(calculated_value) AS total_value,
  SUM(weight_estimate) AS total_weight_kg
FROM scan_history
GROUP BY user_id;

-- Pre-aggregated shop booking stats — refresh on bookings INSERT/UPDATE
CREATE MATERIALIZED VIEW shop_booking_stats AS
SELECT
  shop_id,
  date_trunc('day', created_at) AS day,
  COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed
FROM bookings
GROUP BY shop_id, day;
```

Refreshed via Supabase Edge Function triggered by DB webhook (not polling).

### 16.6 Client-side Caching Strategy

| Data | Cache location | TTL | Invalidation |
|------|---------------|-----|-------------|
| `waste_items` pricing | `localStorage` | 24 h | On app load if `updated_at` changed |
| Active `shops` list | `localStorage` | 1 h | On basket open |
| User's own `scan_history` | Redux in-memory | session | On new scan |
| `model_version` active | `localStorage` | — | On app load (see Section 17) |

---

## 17. AI Model Management & Auto-Update System

### 17.1 Overview

Admin uploads labeled images via the Admin Panel → images stored in Supabase Storage → Admin triggers training (external, e.g. Google Colab) → trained ONNX file uploaded back → new `model_versions` row created → clients detect new version on next load and download silently.

```
Admin Panel
    │
    ├─ Upload images (labeled) ──→ Supabase Storage: /training/{material_type}/{uuid}.jpg
    │                               DB: training_images row
    │
    ├─ Trigger training ──────────→ Edge Function: create training_jobs row
    │                               (External: Colab / script downloads images, trains, uploads ONNX)
    │
    └─ Deploy model ──────────────→ ONNX uploaded to Storage: /models/yolo_v{n}.onnx
                                    DB: model_versions row (status = 'active')
                                    Previous version → 'deprecated'

Client App
    │
    ├─ On load: check model_versions latest active
    │   compare with localStorage model_version
    │
    ├─ If newer: download ONNX → cache in IndexedDB → update localStorage
    │   show Sonner toast: "โมเดล AI อัปเดทแล้ว"
    │
    └─ Scanner uses IndexedDB-cached ONNX (offline capable)
```

### 17.2 Database Tables

```sql
-- Admin uploads labeled training images
training_images (
  id            uuid PK DEFAULT gen_random_uuid(),
  storage_path  text NOT NULL,        -- Supabase Storage path
  material_type text REFERENCES waste_items(material_type),
  grade_label   char(1),             -- A | B | C | null (Stage 1 images need no grade)
  stage         integer DEFAULT 1,   -- 1 = detection, 2 = cleanliness
  status        text DEFAULT 'pending',  -- pending | used | rejected
  uploaded_by   uuid REFERENCES user_profiles(id),
  uploaded_at   timestamptz DEFAULT now()
)

-- One row per trained model version
model_versions (
  id           uuid PK DEFAULT gen_random_uuid(),
  version      text UNIQUE NOT NULL,  -- e.g. "1.0.0", "1.1.0"
  stage        integer NOT NULL,      -- 1 | 2
  storage_path text NOT NULL,         -- path to .onnx file in Supabase Storage
  public_url   text NOT NULL,         -- signed/public URL cached here
  accuracy     numeric(5,4),          -- e.g. 0.9240 = 92.40%
  image_count  integer,               -- how many training images used
  status       text DEFAULT 'draft',  -- draft | active | deprecated
  release_note text,
  created_by   uuid REFERENCES user_profiles(id),
  created_at   timestamptz DEFAULT now()
)

-- Training job tracking
training_jobs (
  id             uuid PK DEFAULT gen_random_uuid(),
  stage          integer NOT NULL,
  image_count    integer,
  status         text DEFAULT 'queued', -- queued | running | done | failed
  result_version text REFERENCES model_versions(version),
  log_text       text,
  started_at     timestamptz,
  finished_at    timestamptz,
  triggered_by   uuid REFERENCES user_profiles(id)
)
```

### 17.3 Admin Panel — Model Management UI

```
┌─────────────────────────────────────────┐
│  AI Model Management                    │
├─────────────────────────────────────────┤
│  ACTIVE MODEL                           │
│  Stage 1  v1.2.0  Acc: 94.2%  312 imgs │  ← current active
│  Stage 2  v1.1.0  Acc: 88.7%  198 imgs │
├─────────────────────────────────────────┤
│  UPLOAD TRAINING IMAGES                 │
│  Stage: [1 Detection] [2 Cleanliness]  │
│  Material: [PET ▾]  Grade: [A] [B] [C] │
│  [+ Drop files or click to upload]     │
│  Queue: 47 images pending              │
├─────────────────────────────────────────┤
│  TRAINING JOBS                          │
│  #8  Stage 1  Running…  47 imgs  [log] │
│  #7  Stage 1  Done  312 imgs  94.2%    │
├─────────────────────────────────────────┤
│  MODEL VERSIONS                         │
│  v1.2.0  Stage1  94.2%  [Active]       │
│  v1.1.0  Stage1  91.5%  [Deprecated]   │
│  v1.1.0  Stage2  88.7%  [Active]       │
│  [Upload ONNX manually]  [Rollback]    │
└─────────────────────────────────────────┘
```

### 17.4 Client Auto-Update Flow

```js
// On every app load (src/lib/modelUpdater.js)

async function checkModelUpdate(stage) {
  const cached = localStorage.getItem(`model_v${stage}`)   // e.g. "1.1.0"

  const { data } = await supabase
    .from('model_versions')
    .select('version, public_url')
    .eq('stage', stage)
    .eq('status', 'active')
    .single()                                               // O(1) — unique active per stage

  if (data.version === cached) return   // no update needed

  // Download ONNX → store in IndexedDB
  const blob = await fetch(data.public_url).then(r => r.blob())
  await saveModelToIndexedDB(`model_stage${stage}`, blob)
  localStorage.setItem(`model_v${stage}`, data.version)

  toast.success(`AI อัปเดทเป็น v${data.version} แล้ว`)
}
```

**Rollback:** Admin sets previous version `status = 'active'` and new version `status = 'deprecated'` — clients pick up on next load.

**Storage cost:** ONNX model ~5–15 MB per version. Keep max 3 versions → ~45 MB of 1 GB free storage.

---

## 18. Calendar & Booking System

### 18.1 Overview

Sellers book drop-off slots at shops. Shops define their available time windows and mark closures. The system prevents double-booking at the database level using optimistic concurrency.

### 18.2 Closure Types

| Type | `recurrence_type` | Example |
|------|------------------|---------|
| One-time (single day) | `none` | Thai New Year 13 Apr |
| Multi-day consecutive | `none` | Songkran 13–15 Apr |
| Weekly recurring | `weekly` | Closed every Sunday |
| Monthly recurring | `monthly_date` | Closed 1st of every month |
| Annual recurring | `annual` | Same holiday every year |

### 18.3 Database Tables

```sql
-- Shop's weekly regular schedule
shop_hours (
  id          uuid PK DEFAULT gen_random_uuid(),
  shop_id     uuid REFERENCES shops(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL,  -- 0=Sun … 6=Sat
  open_time   time NOT NULL,
  close_time  time NOT NULL,
  is_open     boolean DEFAULT true,
  UNIQUE (shop_id, day_of_week)
)

-- Shop closures: one-time, multi-day, or recurring
shop_closures (
  id               uuid PK DEFAULT gen_random_uuid(),
  shop_id          uuid REFERENCES shops(id) ON DELETE CASCADE,
  start_date       date NOT NULL,
  end_date         date NOT NULL,           -- = start_date for single day
  recurrence_type  text DEFAULT 'none',     -- none | weekly | monthly_date | annual
  recurrence_end   date,                    -- when recurring rule expires (null = forever)
  reason           text,                    -- "Songkran", "ปิดปรับปรุง"
  created_at       timestamptz DEFAULT now(),
  CHECK (end_date >= start_date)
)

-- Pre-generated bookable time slots (generated by Edge Function nightly)
time_slots (
  id           uuid PK DEFAULT gen_random_uuid(),
  shop_id      uuid REFERENCES shops(id) ON DELETE CASCADE,
  date         date NOT NULL,
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  capacity     smallint DEFAULT 3,    -- max bookings per slot
  booked_count smallint DEFAULT 0,
  UNIQUE (shop_id, date, start_time)
)

-- Bookings
bookings (
  id             uuid PK DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  shop_id        uuid REFERENCES shops(id),
  slot_id        uuid REFERENCES time_slots(id),
  materials      jsonb NOT NULL,  -- [{ materialType, grade, weight_kg }]
  total_estimate numeric(10,2),
  status         text DEFAULT 'pending',  -- pending | confirmed | rejected | cancelled | completed
  note           text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
)
```

### 18.4 Indexes for Calendar Queries

```sql
CREATE INDEX idx_shop_closures_lookup  ON shop_closures (shop_id, start_date, end_date);
CREATE INDEX idx_time_slots_avail      ON time_slots    (shop_id, date, booked_count);
CREATE INDEX idx_bookings_user         ON bookings      (user_id, status);
CREATE INDEX idx_bookings_shop         ON bookings      (shop_id, slot_id, status);
CREATE INDEX idx_shop_hours_shop       ON shop_hours    (shop_id, day_of_week);
```

All availability checks are O(log n).

### 18.5 Availability Check Algorithm

Before showing a calendar day as bookable, the system must pass 3 checks:

```
isAvailable(shopId, date):

  1. REGULAR HOURS CHECK — O(log n)
     shop_hours WHERE shop_id = ? AND day_of_week = extract(dow FROM date)
     → if is_open = false → CLOSED

  2. CLOSURE CHECK — O(log n)
     shop_closures WHERE shop_id = ?
       AND start_date <= date AND end_date >= date  ← covers single + range
       OR (recurrence_type = 'weekly'
           AND extract(dow FROM start_date) = extract(dow FROM date)
           AND (recurrence_end IS NULL OR date <= recurrence_end))
       OR (recurrence_type = 'monthly_date'
           AND extract(day FROM start_date) = extract(day FROM date)
           AND (recurrence_end IS NULL OR date <= recurrence_end))
       OR (recurrence_type = 'annual'
           AND extract(month FROM start_date) = extract(month FROM date)
           AND extract(day FROM start_date) = extract(day FROM date))
     → if any row found → CLOSED

  3. SLOT CAPACITY CHECK — O(log n)
     time_slots WHERE shop_id = ? AND date = ?
     → return slots WHERE booked_count < capacity
     → if no slots → FULL
```

### 18.6 Conflict-Safe Booking (Atomic via Edge Function)

Double-booking is prevented at DB level with `FOR UPDATE` lock — not just application logic:

```sql
-- Supabase Edge Function: POST /book-slot
BEGIN;

  -- Lock the slot row (pessimistic lock)
  SELECT booked_count, capacity
  FROM time_slots
  WHERE id = $slot_id
  FOR UPDATE;

  -- Reject if full
  IF booked_count >= capacity THEN
    ROLLBACK;
    RETURN error('slot_full');
  END IF;

  -- Create booking
  INSERT INTO bookings (user_id, shop_id, slot_id, materials, total_estimate)
  VALUES ($user_id, $shop_id, $slot_id, $materials, $total);

  -- Increment counter atomically
  UPDATE time_slots SET booked_count = booked_count + 1
  WHERE id = $slot_id;

COMMIT;
```

### 18.7 Calendar UI Layout

```
BasketPage / MapPage → [จองร้านนี้] button

BookingModal
┌────────────────────────────────────────┐
│  จอง วงษ์พาณิชย์                       │
│  0.8 km — ถ.นิมมานเหมินท์ ซ.17         │
├────────────────────────────────────────┤
│  เลือกวัน                              │
│  ◀  พฤษภาคม 2569  ▶                   │
│  จ  อ  พ  พฤ  ศ  ส  อา               │
│  —  —   1   2   3  4   5 (closed)    │
│   6   7  8   9  10 11  12            │  ← closed days grayed
│  13  14 [15] 16  17 18  19           │  ← today highlighted
│  ...                                   │
├────────────────────────────────────────┤
│  เลือกช่วงเวลา (15 พ.ค.)               │
│  [08:00–10:00  2/3]  [10:00–12:00 ✓] │  ← slot/capacity badges
│  [13:00–15:00  3/3 เต็ม]              │  ← full = disabled
├────────────────────────────────────────┤
│  สรุปการจอง                            │
│  ขวด PET 1.2 kg  กระป๋อง 0.5 kg      │
│  ประมาณ ฿32.85                         │
│  [ยืนยันการจอง]                        │
└────────────────────────────────────────┘

DashboardPage (Buyer) — Calendar view
┌────────────────────────────────────────┐
│  ตารางจอง — พ.ค. 2569                  │
│  [วัน] [สัปดาห์] [เดือน]               │  ← view toggle
├────────────────────────────────────────┤
│  วันนี้ 15 พ.ค.                        │
│  08:00  Kla — PET 1.2kg, กระป๋อง 0.5  │  ← booking row
│         [ยืนยัน] [ปฏิเสธ]             │
│  10:00  Noon — ทองแดง 2.0kg            │
│         [ยืนยัน] [ปฏิเสธ]             │
├────────────────────────────────────────┤
│  [+ เพิ่มวันหยุด]  [ตั้งค่าเวลา]     │
└────────────────────────────────────────┘

ShopClosureModal (Buyer)
┌────────────────────────────────────────┐
│  เพิ่มวันหยุด / ปิดร้าน                │
│  ประเภท: [ครั้งเดียว ▾]               │
│    ○ ครั้งเดียว (single / range)       │
│    ○ ทุกสัปดาห์ (weekly)               │
│    ○ ทุกเดือน (monthly)                │
│    ○ ทุกปี (annual / public holiday)  │
│                                        │
│  วันที่เริ่ม: [15/05/2569]             │
│  วันที่สิ้นสุด: [17/05/2569]           │
│  เหตุผล: [Songkran ▾ / กรอกเอง]       │
│  [บันทึก]                              │
└────────────────────────────────────────┘
```

### 18.8 Slot Generation Strategy

Time slots are **pre-generated nightly** by an Edge Function (not on-demand) to keep read queries simple:

```
Supabase Cron (pg_cron) — runs daily at 02:00 ICT
  for each active shop:
    for each day in next 14 days:
      1. skip if shop_closures covers this day
      2. get shop_hours for day_of_week
      3. generate slots at 2-hour intervals
      4. INSERT INTO time_slots (upsert, ignore if exists)
```

This means the calendar read is always a simple `SELECT WHERE shop_id AND date` — O(log n) with index.

### 18.9 New Branches

| Branch | Feature |
|--------|---------|
| `feature/calendar` | Calendar UI, booking modal, closure management |
| `feature/ai-model-admin` | Training image upload, model versioning, auto-update |

---

## Section 19 — UI Quality Audit (May 2026)

Audit conducted 14 May 2026. Branch: `feature/map-tree-routing`. All issues categorised by severity and assigned for immediate remediation.

### 19.1 Issue Register

| ID | Page / Component | Severity | Category | Issue | Status |
|----|-----------------|----------|----------|-------|--------|
| UIQ-01 | `UserLayout` | CRITICAL | Desktop | `BottomTabBar` renders on all screen sizes; no desktop left sidebar (PRD §5 requires 200–240px fixed sidebar for `≥ 768px`) | ✅ Fixed |
| UIQ-02 | `EcoPointsPage` | HIGH | Dark mode | Tier badge and progress-bar `color`/`background` use hardcoded hex (`#CD7F32` Bronze, `#A0A0A0` Silver, `#D4AF37` Gold, `#9BA5B7` Platinum) — these are wrong/invisible in dark mode | ✅ Fixed |
| UIQ-03 | `EcoPointsPage` | HIGH | Desktop | Single-column layout only; no `max-w-xl mx-auto` or desktop 2-col split for rewards + history | ✅ Fixed |
| UIQ-04 | `ProfilePage` | HIGH | Desktop | All sub-cards `max-w-sm` — stays narrow strip on desktop; needs `max-w-2xl` + responsive 2-col grid | ✅ Fixed |
| UIQ-05 | `ProfilePage` (Buyer) | MEDIUM | Data | `BUYER_ACCEPTED` constant is hardcoded; should read from `buyerSlice.acceptedMaterials` and dispatch `setAcceptedMaterials` on save | ✅ Fixed |
| UIQ-06 | `MapPage` | MEDIUM | Responsive | Map container fixed `height: 420` (inline style) — should be `h-[55vw] max-h-[480px]` | ✅ Fixed |
| UIQ-07 | `MapPage` | MEDIUM | Desktop | Filter pills in a single `flex-wrap` row on all sizes; desktop should get a sidebar layout (similar to `MarketplacePage`) | ✅ Fixed |
| UIQ-08 | `MapPage` | LOW | Dark mode | Leaflet `TileLayer` always uses light OSM tiles; consider CartoDB dark tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) when `darkMode === true` | ✅ Fixed |
| UIQ-09 | `SettingsPage` | MEDIUM | Desktop | No container constraint — content stretches full viewport width on desktop; needs `max-w-xl mx-auto` | ✅ Fixed |
| UIQ-10 | `AdminPage` | LOW | Dark mode | `heatColor()` returns `'var(--green-soft, #C8F5D8)'` — fallback hex `#C8F5D8` is a light-mode colour, wrong in dark mode; remove fallback and use `'var(--green-soft)'` only | ✅ Fixed |

### 19.2 Remediation Plan

| Agent | Issues Covered | Files |
|-------|---------------|-------|
| `agent-userlayout-desktop` | UIQ-01 | `src/layouts/UserLayout.jsx` |
| `agent-ecopoints-fix` | UIQ-02, UIQ-03 | `src/pages/EcoPointsPage.jsx` |
| `agent-profile-desktop` | UIQ-04, UIQ-05 | `src/pages/ProfilePage.jsx` |
| `agent-map-responsive` | UIQ-06, UIQ-07, UIQ-08 | `src/pages/MapPage.jsx` |
| `agent-settings-admin-fix` | UIQ-09, UIQ-10 | `src/pages/SettingsPage.jsx`, `src/pages/AdminPage.jsx` |

### 19.3 Desktop Navigation Pattern (UIQ-01 Reference)

`UserLayout` must match `BuyerLayout`'s desktop pattern:

```
≥ 768px (md:):
┌──────────────────────────────────────────────────────┐
│  [Sidebar 200px]  │  [Main content flex-1]           │
│  Logo             │  <Outlet />                      │
│  Nav links (flex  │                                  │
│  col, full w)     │                                  │
└──────────────────────────────────────────────────────┘

< 768px:
┌──────────────────────┐
│  [TopBar sticky]     │
│  <Outlet />          │
│  [BottomTabBar fixed]│
└──────────────────────┘
```

The sidebar should use the same `NavLink` items as the bottom tab bar, rendered vertically. `BottomTabBar` must be `md:hidden`. `main` padding-bottom (`pb-[68px]`) must be `md:pb-0`.

### 19.4 EcoPoints Tier Token Map (UIQ-02 Reference)

Replace hardcoded tier hex with CSS token aliases:

| Tier | Old hex | Replacement token |
|------|---------|-------------------|
| Bronze | `#CD7F32` | `var(--orange)` |
| Silver | `#A0A0A0` | `var(--ink-3)` |
| Gold | `#D4AF37` | `var(--green)` |
| Platinum | `#9BA5B7` | `var(--blue)` |
